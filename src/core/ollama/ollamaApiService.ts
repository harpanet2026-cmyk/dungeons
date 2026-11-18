import { Character, Enemy } from '../types/dnd';
import { CampaignManager } from '../state/campaignManager';
import { ChatMessage, AiNarrativeResult } from '../gemini/geminiApiService';
import { ToolExecutor, ExecutedToolResult } from '../gemini/toolExecutor';
import { GEMINI_TOOLS_DECLARATION } from '../gemini/toolSchemas';

const STORAGE_PROVIDER_KEY = 'dungeons_ai_provider';
const STORAGE_OLLAMA_MODEL_KEY = 'dungeons_ollama_model';
const STORAGE_OLLAMA_ENDPOINT_KEY = 'dungeons_ollama_endpoint';

export interface OllamaModelTag {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export type AiProvider = 'gemini' | 'ollama';

export class OllamaApiService {
  static getProvider(): AiProvider {
    return (localStorage.getItem(STORAGE_PROVIDER_KEY) as AiProvider) || 'ollama';
  }

  static setProvider(provider: AiProvider): void {
    localStorage.setItem(STORAGE_PROVIDER_KEY, provider);
  }

  static getModel(): string {
    return localStorage.getItem(STORAGE_OLLAMA_MODEL_KEY) || 'qwen2.5:3b';
  }

  static setModel(model: string): void {
    localStorage.setItem(STORAGE_OLLAMA_MODEL_KEY, model.trim());
  }

  static getEndpoint(): string {
    return localStorage.getItem(STORAGE_OLLAMA_ENDPOINT_KEY) || 'http://127.0.0.1:11434';
  }

  static setEndpoint(endpoint: string): void {
    localStorage.setItem(STORAGE_OLLAMA_ENDPOINT_KEY, endpoint.trim());
  }

  private static getBaseUrls(): string[] {
    const custom = this.getEndpoint().replace(/\/+$/, '');
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    const urls: string[] = [];

    // Se o usuário configurou um endpoint personalizado (ex: link HTTPS do Cloudflare Tunnel)
    if (custom && custom !== 'http://127.0.0.1:11434' && custom !== 'http://localhost:11434') {
      urls.push(custom);
    }

    // Proxy do Vite (/api/ollama) - funciona localmente e via Cloudflare Tunnel conectado ao Vite
    urls.push('/api/ollama');

    // Em conexões HTTP (localhost), podemos tentar o acesso direto local
    if (!isHttps) {
      urls.push('http://127.0.0.1:11434');
      urls.push('http://localhost:11434');
    }

    return urls;
  }

  /**
   * Verifica se o Ollama está online e responde
   */
  static async checkStatus(): Promise<{ online: boolean; version?: string; endpoint?: string }> {
    const urls = this.getBaseUrls();
    for (const base of urls) {
      try {
        const res = await fetch(`${base}/api/version`, { method: 'GET', signal: AbortSignal.timeout(3000) });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.version) {
            return { online: true, version: data.version, endpoint: base };
          }
        }
      } catch {}
    }
    return { online: false };
  }

  /**
   * Lista os modelos baixados localmente no Ollama
   */
  static async listLocalModels(): Promise<string[]> {
    const urls = this.getBaseUrls();
    for (const base of urls) {
      try {
        const res = await fetch(`${base}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3500) });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          const models: OllamaModelTag[] = data.models || [];
          if (models.length > 0) {
            return models.map(m => m.name);
          }
        }
      } catch {}
    }
    return [];
  }

  static generateSystemInstruction(characters: Character[], enemies: Enemy[], customDossier?: string): string {
    const dossier = customDossier !== undefined ? customDossier : CampaignManager.getDossier();

    const heroesSummary = characters.map(c => 
      `- ${c.name} (${c.race} ${c.class} Nv.${c.level}, CA ${c.equippedArmor ? 'alta' : 'base'}, HP: ${c.currentHp}/${c.maxHp}${c.personality ? `, Ideal: "${c.personality.ideals}", Vínculo: "${c.personality.bonds}", Segredo: "${c.personality.secretsOrHooks}"` : ''})`
    ).join('\n');

    const enemiesSummary = enemies.length > 0
      ? enemies.map(e => `- ${e.name} (CA ${e.ac}, HP ${e.currentHp}/${e.maxHp}, ND ${e.cr})`).join('\n')
      : 'Nenhum combate ativo no momento.';

    return `Você é o Mestre da Masmorra (Dungeon Master) oficial de D&D 5ª Edição narrando uma campanha épica no cenário REALMS.

REGRAS DE CONDUTA DO MESTRE & TOOL CALLING DETERMINÍSTICO (100% AUTOMÁTICO):
1. Você tem ferramentas integradas diretamente ao sistema mecânico do jogo:
   - 'roll_d20_check': Invoque sempre que um herói fizer uma ação incerta, teste de perícia (atletismo, percepção, etc.) ou salvaguarda.
   - 'apply_damage': Invoque sempre que um ataque de monstro/herói acertar ou houver dano de armadilha/feitiço.
   - 'heal_character': Invoque sempre que houver magia de cura, poção ou descanso.
   - 'spend_spell_slot': Invoque quando um personagem gastar um espaço de magia de 1º círculo ou superior.
   - 'set_condition': Invoque quando aplicar ou remover condições de status (Envenenado, Caído, etc.).
   Você pode acionar ferramentas incluindo comandos na sua resposta no formato:
   [TOOL: roll_d20_check(character_name="Nome", check_type="pericia", target_dc=15)]
   [TOOL: apply_damage(character_name="Nome", amount=8, damage_type="cortante")]
   [TOOL: heal_character(character_name="Nome", amount=6)]
   [TOOL: spend_spell_slot(character_name="Nome", spell_level=1)]
   [TOOL: set_condition(character_name="Nome", condition="Envenenado", active=true)]
2. NUNCA invente números de HP ou rolagens falsas na fala. O aplicativo rolará os dados matemáticos reais e alterará a vida na ficha dos personagens automaticamente!
3. Responda SEMPRE em Português do Brasil com narrativa rica, sensorial, atmosférica e ágil (2 a 4 parágrafos por resposta).
4. Use o Dossiê de Campanha abaixo para guiar os mistérios, antagonistas, NPCs e locais da masmorra.
5. Quando os heróis agirem, descreva as consequências imediatas e dê a deixa para o próximo turno do grupo.

DOSSIÊ DA CAMPANHA:
${dossier || 'Conduza livremente pelas ruínas ancestrais e masmorras escuras do cenário.'}

GRUPO DE AVENTUREIROS:
${heroesSummary}

ENCONTRO ATUAL / AMEAÇAS:
${enemiesSummary}
`;
  }

  /**
   * Envia uma mensagem para o Mestre Ollama com execução de ferramentas
   */
  static async sendMessage(
    userPrompt: string,
    history: ChatMessage[],
    characters: Character[],
    enemies: Enemy[],
    customDossier?: string,
    overrideModel?: string
  ): Promise<AiNarrativeResult> {
    const targetModel = overrideModel || this.getModel();
    const systemText = this.generateSystemInstruction(characters, enemies, customDossier);

    const messages = [
      { role: 'system', content: systemText },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: 'user', content: userPrompt }
    ];

    const ollamaTools = GEMINI_TOOLS_DECLARATION.functionDeclarations.map(f => ({
      type: 'function',
      function: {
        name: f.name,
        description: f.description,
        parameters: f.parameters
      }
    }));

    const payload: any = {
      model: targetModel,
      messages,
      tools: ollamaTools,
      stream: false,
      options: {
        temperature: 0.82,
        top_p: 0.9,
        num_predict: 1200
      }
    };

    const urls = this.getBaseUrls();
    let lastError: Error | null = null;

    for (const base of urls) {
      try {
        const res = await fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(120000)
        });

        if (res.ok) {
          const data = await res.json();
          let reply = data?.message?.content?.trim() || '';
          const executedTools: ExecutedToolResult[] = [];
          let currentCharacters = characters;
          let currentEnemies = enemies;

          // 1. Tool calls nativos do Ollama
          const nativeToolCalls = data?.message?.tool_calls || [];
          for (const tc of nativeToolCalls) {
            const func = tc.function || tc;
            if (func && func.name) {
              const res = ToolExecutor.execute(func.name, func.arguments || {}, currentCharacters, currentEnemies);
              executedTools.push(res);
              if (res.updatedCharacters) currentCharacters = res.updatedCharacters;
              if (res.updatedEnemies) currentEnemies = res.updatedEnemies;
            }
          }

          // 2. Fallback de tool calls inline no texto [TOOL: name(...)]
          const inlineRegex = /\[(?:TOOL|ACTION):\s*(\w+)\((.*?)\)\]/gi;
          let match;
          while ((match = inlineRegex.exec(reply)) !== null) {
            const toolName = match[1];
            const rawArgs = match[2];
            const parsedArgs: any = {};
            rawArgs.split(',').forEach((param: string) => {
              const [k, v] = param.split('=').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
              if (k && v !== undefined) parsedArgs[k] = v;
            });

            const res = ToolExecutor.execute(toolName, parsedArgs, currentCharacters, currentEnemies);
            executedTools.push(res);
            if (res.updatedCharacters) currentCharacters = res.updatedCharacters;
            if (res.updatedEnemies) currentEnemies = res.updatedEnemies;
          }

          // Limpa as tags inline do texto exibido
          const cleanText = reply.replace(/\[(?:TOOL|ACTION):.*?\]/gi, '').trim();

          return {
            text: cleanText || (executedTools.length > 0 ? executedTools.map(t => t.summary).join('\n') : 'Ação resolvida.'),
            executedTools,
            updatedCharacters: currentCharacters !== characters ? currentCharacters : undefined,
            updatedEnemies: currentEnemies !== enemies ? currentEnemies : undefined
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || `Erro HTTP ${res.status}`;
          if (errMsg.includes('model') && errMsg.includes('not found')) {
            throw new Error(`O modelo local "${targetModel}" não está baixado no Ollama. Execute no terminal: "ollama run ${targetModel}" para baixá-lo.`);
          }
          throw new Error(errMsg);
        }
      } catch (err: any) {
        lastError = err;
        if (err.message && err.message.includes('não está baixado')) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Não foi possível conectar ao Ollama em localhost:11434. Verifique se o aplicativo do Ollama está em execução.');
  }

  /**
   * Gera o Dossiê de Campanha via Ollama
   */
  static async generateCustomDossierWithAI(
    themeTitle: string,
    themeDesc: string,
    userDesires: string,
    characters: Character[],
    overrideModel?: string
  ): Promise<string> {
    const targetModel = overrideModel || this.getModel();
    const heroesList = characters.map(c => `${c.name} (${c.race} ${c.class}, Nível ${c.level})`).join(', ');

    const prompt = `Você é um lendário designer de aventuras de D&D 5ª Edição. Crie um DOSSIÊ DE CAMPANHA completo, imersivo e imediatamente jogável para o seguinte grupo de aventureiros.

TEMA ESCOLHIDO PELO JOGADOR:
- Título do Tema: ${themeTitle}
- Premissa do Tema: ${themeDesc}
- Desejos Específicos do Jogador: ${userDesires || 'Crie uma trama rica, desafiadora e com elementos de fantasia sombria épica.'}
- Grupo de Heróis: ${heroesList || 'Heróis de nível 3'}

ESTRUTURE O DOSSIÊ EXATAMENTE NO SEGUINTE FORMATO:
[DOSSIÊ DE CAMPANHA: NOME DA AVENTURA]
• Título da Campanha: [Nome épico em português]
• Cenário: [Local, geografia, atmosfera e clima]
• Tom Narrativo: [Estilo sensorial, iluminação e ritmo]
• Antagonista Principal: [Nome do vilão, monstro ou seita, suas motivações e por que é uma ameaça urgente]
• Gancho Inicial (Pronto para Jogar): [A cena exata de abertura em que os aventureiros se encontram agora, com perigo ou decisão imediata]
• Locais Notáveis:
  1. [Local 1 com detalhes táteis e perigos]
  2. [Local 2 com mistério ou tesouro]
  3. [Local 3 câmara final ou esconderijo]
• Segredo / Reviravolta Oculta: [Um segredo revelador sobre o vilão, um NPC ou o próprio local]

Responda em Português do Brasil com riqueza dramática, mantendo o formato acima.`;

    const payload = {
      model: targetModel,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: {
        temperature: 0.88,
        num_predict: 1500
      }
    };

    const urls = this.getBaseUrls();
    for (const base of urls) {
      try {
        const res = await fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(120000)
        });
        if (res.ok) {
          const data = await res.json();
          return data?.message?.content?.trim() || '';
        }
      } catch {}
    }

    throw new Error('Falha ao gerar o Dossiê pelo Ollama. Verifique se o Ollama está online.');
  }
}
