import { Character, Enemy } from '../types/dnd';
import { CampaignManager } from '../state/campaignManager';
import { ToolExecutor, ExecutedToolResult } from './toolExecutor';

const STORAGE_API_KEY = 'dungeons_gemini_api_key';
const STORAGE_LEGACY_KEY = 'gemini_api_key';
const STORAGE_MODEL_KEY = 'dungeons_gemini_model';

export const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
export const FALLBACK_GEMINI_MODEL = 'gemini-1.5-flash';
export const GEMINI_API_VERSION = 'v1beta';

// Lista de modelos suportados em ordem de preferência
export const SUPPORTED_GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-3.8-flash'
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  toolResults?: ExecutedToolResult[];
}

export interface AiNarrativeResult {
  text: string;
  executedTools: ExecutedToolResult[];
  updatedCharacters?: Character[];
  updatedEnemies?: Enemy[];
}

export interface HealthcheckResult {
  success: boolean;
  status: number;
  text: string;
  model: string;
  raw?: any;
  error?: string;
}

export class GeminiApiService {
  /**
   * Remove prefixos como 'models/' e espaços invisíveis
   */
  public static cleanModelName(model: string): string {
    return (model || '')
      .replace(/^models\//, '')
      .trim();
  }

  /**
   * Obtém a API Key com .trim(), buscando em variáveis de ambiente (.env) e localStorage
   */
  static getApiKey(): string {
    let key = '';

    // 1. Variáveis de ambiente Vite (import.meta.env de forma segura)
    try {
      const meta = import.meta as any;
      if (meta && meta.env) {
        key = (meta.env.GEMINI_API_KEY || meta.env.VITE_GEMINI_API_KEY || '') as string;
      }
    } catch {}

    // 2. Variáveis de ambiente Node / process.env de forma segura
    if (!key) {
      try {
        const proc = (globalThis as any)?.process;
        if (proc && proc.env) {
          key = (proc.env.GEMINI_API_KEY || proc.env.VITE_GEMINI_API_KEY || '') as string;
        }
      } catch {}
    }

    // 3. localStorage do navegador (ambas as chaves)
    if (!key) {
      try {
        if (typeof localStorage !== 'undefined') {
          key = localStorage.getItem(STORAGE_API_KEY) || localStorage.getItem(STORAGE_LEGACY_KEY) || '';
        }
      } catch {}
    }

    // Limpa aspas acidentais, espaços e quebras de linha
    return (key || '').replace(/^["']|["']$/g, '').trim();
  }

  static setApiKey(key: string): void {
    const clean = (key || '').replace(/^["']|["']$/g, '').trim();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_API_KEY, clean);
        localStorage.setItem(STORAGE_LEGACY_KEY, clean);
      }
    } catch {}
  }

  static getModel(): string {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_MODEL_KEY);
        if (saved) {
          const clean = this.cleanModelName(saved);
          if (clean && !['gemini-1.0-pro', 'gemini-pro'].includes(clean)) {
            return clean;
          }
        }
      }
      return DEFAULT_GEMINI_MODEL;
    } catch {
      return DEFAULT_GEMINI_MODEL;
    }
  }

  static setModel(model: string): void {
    const clean = this.cleanModelName(model);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_MODEL_KEY, clean || DEFAULT_GEMINI_MODEL);
      }
    } catch {}
  }

  static generateSystemInstruction(characters: Character[], enemies: Enemy[], customDossier?: string): string {
    const dossier = customDossier !== undefined ? customDossier : CampaignManager.getDossier();

    const heroesSummary = characters.map(c => 
      `- ${c.name} (${c.race} ${c.class} Nv.${c.level}, CA ${c.equippedArmor ? 'alta' : 'base'}, HP: ${c.currentHp}/${c.maxHp}${c.personality ? `, Ideal: "${c.personality.ideals}", Vínculo: "${c.personality.bonds}", Segredo: "${c.personality.secretsOrHooks}"` : ''})`
    ).join('\n');

    const enemiesSummary = enemies.length > 0
      ? enemies.map(e => `- ${e.name} (CA ${e.ac}, HP ${e.currentHp}/${e.maxHp}, ND ${e.cr})`).join('\n')
      : 'Nenhum combate ativo no momento.';

    return `Você é o Mestre da Masmorra (Dungeon Master) oficial de D&D 5ª Edição narrando uma campanha no cenário de fantasia heroica REALMS.

REGRAS DE IMPARCIALIDADE E MECÂNICAS DETERMINÍSTICAS DE D&D 5E:
1. Conduza o jogo com justiça, ritmo envolvente e narrativa cinematográfica em Português do Brasil (máximo 2 a 4 parágrafos por resposta).
2. NUNCA invente números de HP falsos ou dados simulados na fala. Sempre que um personagem realizar um teste incerto, sofrer dano, receber cura, gastar espaço de magia ou ganhar uma condição, insira ao final da resposta o comando entre colchetes:
   - [TOOL: roll_d20_check(character_name="Nome", check_type="percepcao")] (para perícias ou salvaguardas)
   - [TOOL: apply_damage(character_name="Nome", amount=8)] (para dano sofrido)
   - [TOOL: heal_character(character_name="Nome", amount=5)] (para cura de PV)
   - [TOOL: spend_spell_slot(character_name="Nome", spell_level=1)] (para espaço de magia gasto)
   - [TOOL: set_condition(character_name="Nome", condition="Envenenado", active=true)] (para aplicar condição)
   O sistema executará a ação na ficha dos personagens automaticamente!

========================================================================
DOSSIÊ OFICIAL DA CAMPANHA (DIRETRIZES DE LORE, CENÁRIO, ANTAGONISTAS E OBJETIVOS):
${dossier || 'Nenhum dossiê de campanha definido ainda. Conduza com base nas ações dos heróis.'}
========================================================================

ESTADO ATUAL DO GRUPO DE AVENTUREIROS:
${heroesSummary}

INIMIGOS NO ENCONTRO ATUAL:
${enemiesSummary}
`;
  }

  /**
   * Envia uma requisição REST blindada contra erros 400, 404 e 429
   */
  private static async sendRawRequest(
    apiKey: string,
    requestedModel: string,
    body: any
  ): Promise<{ data: any; modelUsed: string }> {
    const cleanKey = apiKey.trim();
    const cleanRequested = this.cleanModelName(requestedModel || this.getModel());
    
    // Lista de fallback: tenta o solicitado e em seguida os modelos oficiais estáveis da API
    const fallbackChain = Array.from(new Set([
      cleanRequested,
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro'
    ]));

    let lastError: Error | null = null;

    for (let i = 0; i < fallbackChain.length; i++) {
      const currentModel = fallbackChain[i];
      const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${currentModel}:generateContent?key=${cleanKey}`;

      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } catch (netErr: any) {
        throw new Error(`Erro de rede ao conectar com a Google Gemini API: ${netErr.message || 'Verifique sua conexão de internet.'}`);
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (currentModel !== cleanRequested) {
          console.warn(`[Gemini API] Modelo '${cleanRequested}' indisponível. Modelo ativo atualizado para '${currentModel}'.`);
          this.setModel(currentModel);
        }
        return { data, modelUsed: currentModel };
      }

      const errorData = await response.json().catch(() => ({}));
      const apiMessage = errorData?.error?.message || response.statusText || 'Erro desconhecido';

      // 1. HTTP 429 Too Many Requests -> Interrompe de imediato para não queimar cota
      if (response.status === 429) {
        throw new Error(
          `[HTTP 429 Too Many Requests] Limite de requisições excedido na chave gratuita do Google AI Studio.\n` +
          `Aguarde cerca de 30-60 segundos antes de enviar outra mensagem, ou use o modo 'Ollama Offline' sem limites.`
        );
      }

      // 2. HTTP 401 / 403 / Chave Inválida -> Interrompe
      if (response.status === 401 || response.status === 403 || (response.status === 400 && apiMessage.includes('API_KEY_INVALID'))) {
        throw new Error(`[HTTP ${response.status}] Chave de API inválida ou sem permissão. Verifique sua chave no Google AI Studio (aistudio.google.com).`);
      }

      // 3. HTTP 404 Not Found -> Continua para o modelo de fallback
      if (response.status === 404 || apiMessage.includes('not found') || apiMessage.includes('is not supported')) {
        lastError = new Error(`[HTTP 404 Not Found] O modelo '${currentModel}' não foi encontrado na sua chave.`);
        continue;
      }

      // 4. HTTP 400 Bad Request
      if (response.status === 400) {
        // Se a requisição enviou systemInstruction e falhou, tenta retentar fundindo as instruções no primeiro turno
        if (body.systemInstruction) {
          console.warn('[Gemini API] HTTP 400 com systemInstruction. Retentando com instruções embutidas no prompt...');
          const instructionText = body.systemInstruction?.parts?.[0]?.text || '';
          const { systemInstruction, ...fallbackBody } = body;
          if (fallbackBody.contents && fallbackBody.contents.length > 0) {
            fallbackBody.contents[0].parts[0].text = `${instructionText}\n\n---\n\n${fallbackBody.contents[0].parts[0].text}`;
          }
          return this.sendRawRequest(cleanKey, currentModel, fallbackBody);
        }

        throw new Error(`[HTTP 400 Bad Request] Parâmetros de requisição inválidos na Gemini API: ${apiMessage}`);
      }

      // Outros erros HTTP
      throw new Error(`[HTTP ${response.status} ${response.statusText}] Falha na Gemini API: ${apiMessage}`);
    }

    throw lastError || new Error(`Nenhum modelo do Gemini respondeu com sucesso.`);
  }

  /**
   * Sanitiza a lista de mensagens 'contents' garantindo estrita conformidade com a Gemini API:
   * 1. Remove qualquer mensagem inicial do modelo (saudação da interface).
   * 2. O primeiro turno É OBRIGATORIAMENTE 'user'.
   * 3. Alternância estrita entre 'user' e 'model'. Mensagens consecutivas da mesma role são unidas.
   * 4. O último turno É OBRIGATORIAMENTE 'user'.
   */
  public static formatContentsForGemini(history: ChatMessage[], newPrompt: string): any[] {
    const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];

    // 1. Mensagens anteriores não-vazias
    for (const msg of history || []) {
      const clean = (msg.text || '').trim();
      if (!clean) continue;
      rawTurns.push({
        role: msg.role === 'model' ? 'model' : 'user',
        text: clean
      });
    }

    // 2. Novo prompt do usuário
    const cleanPrompt = (newPrompt || '').trim();
    if (cleanPrompt) {
      rawTurns.push({
        role: 'user',
        text: cleanPrompt
      });
    }

    // 3. Remove saudações iniciais que tenham role 'model'
    while (rawTurns.length > 0 && rawTurns[0].role === 'model') {
      rawTurns.shift();
    }

    // 4. Se vazio, adiciona prompt padrão
    if (rawTurns.length === 0) {
      return [
        {
          role: 'user',
          parts: [{ text: cleanPrompt || 'Olá, Mestre!' }]
        }
      ];
    }

    // 5. Normaliza para alternância estrita (user -> model -> user -> model)
    const normalized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const turn of rawTurns) {
      if (normalized.length === 0) {
        normalized.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      } else {
        const last = normalized[normalized.length - 1];
        if (last.role === turn.role) {
          last.parts[0].text += `\n\n${turn.text}`;
        } else {
          normalized.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    // 6. Garante que o último turno seja 'user'
    if (normalized[normalized.length - 1].role !== 'user') {
      normalized.push({
        role: 'user',
        parts: [{ text: cleanPrompt || 'Continue narrando a história.' }]
      });
    }

    return normalized;
  }

  /**
   * Envia mensagem no chat e resolve respostas e ações de D&D 5e
   */
  static async sendMessage(
    userPrompt: string,
    history: ChatMessage[],
    characters: Character[],
    enemies: Enemy[],
    customDossier?: string,
    explicitApiKey?: string
  ): Promise<AiNarrativeResult> {
    const apiKey = (explicitApiKey || this.getApiKey()).replace(/^["']|["']$/g, '').trim();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio ou defina GEMINI_API_KEY no arquivo .env.');
    }

    const model = this.getModel();
    const systemInstructionText = this.generateSystemInstruction(characters, enemies, customDossier);
    const contents = this.formatContentsForGemini(history, userPrompt);

    const requestBody: any = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 1200
      }
    };

    const { data } = await this.sendRawRequest(apiKey, model, requestBody);

    const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
    let text = parts.find((p: any) => p.text)?.text || '';

    const executedTools: ExecutedToolResult[] = [];
    let currentCharacters = characters;
    let currentEnemies = enemies;

    // Detecta e executa comandos mecânicos no formato [TOOL: name(args)]
    const toolRegex = /\[(?:TOOL|ACTION):\s*(\w+)\((.*?)\)\]/gi;
    let match;
    while ((match = toolRegex.exec(text)) !== null) {
      const toolName = match[1];
      const rawArgs = match[2];
      const parsedArgs: any = {};
      rawArgs.split(',').forEach((param: string) => {
        const [k, v] = param.split('=').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        if (k && v !== undefined) parsedArgs[k] = v;
      });

      const result = ToolExecutor.execute(toolName, parsedArgs, currentCharacters, currentEnemies);
      executedTools.push(result);
      if (result.updatedCharacters) currentCharacters = result.updatedCharacters;
      if (result.updatedEnemies) currentEnemies = result.updatedEnemies;
    }

    text = text.replace(/\[(?:TOOL|ACTION):.*?\]/gi, '').trim();

    if (!text && executedTools.length > 0) {
      text = executedTools.map(t => t.summary).join('\n');
    }

    return {
      text: text || 'O Mestre concluiu a ação com base nas regras de D&D 5e.',
      executedTools,
      updatedCharacters: currentCharacters !== characters ? currentCharacters : undefined,
      updatedEnemies: currentEnemies !== enemies ? currentEnemies : undefined
    };
  }

  /**
   * Teste rápido de conectividade com prompt mínimo ("Responda apenas: OK")
   */
  static async quickHealthcheck(apiKey?: string, modelName?: string): Promise<HealthcheckResult> {
    const key = (apiKey || this.getApiKey()).replace(/^["']|["']$/g, '').trim();
    if (!key) {
      return {
        success: false,
        status: 400,
        text: '',
        model: modelName || DEFAULT_GEMINI_MODEL,
        error: 'Chave de API do Gemini não informada ou vazia. Configure no arquivo .env ou na tela de configurações.'
      };
    }

    const requestedModel = this.cleanModelName(modelName || this.getModel() || DEFAULT_GEMINI_MODEL);
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Responda apenas: OK' }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 15,
        temperature: 0.1
      }
    };

    try {
      const { data, modelUsed } = await this.sendRawRequest(key, requestedModel, requestBody);
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';

      // Persiste a chave e o modelo validados
      this.setApiKey(key);
      this.setModel(modelUsed);

      return {
        success: true,
        status: 200,
        text: replyText,
        model: modelUsed,
        raw: data
      };
    } catch (err: any) {
      return {
        success: false,
        status: 500,
        text: '',
        model: requestedModel,
        error: err.message || 'Falha ao conectar com o Google Gemini.'
      };
    }
  }

  /**
   * Gera Dossiê de Campanha com IA
   */
  static async generateCustomDossierWithAI(
    themeTitle: string,
    themeDesc: string,
    userDesires: string,
    characters: Character[],
    explicitApiKey?: string
  ): Promise<string> {
    const apiKey = (explicitApiKey || this.getApiKey()).replace(/^["']|["']$/g, '').trim();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio.');
    }

    const model = this.getModel();
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

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 1500
      }
    };

    const { data } = await this.sendRawRequest(apiKey, model, requestBody);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Consulta a lista de modelos suportados para a chave informada
   */
  static async listModels(apiKey?: string): Promise<{ version: 'v1beta'; models: string[] }> {
    const cleanKey = (apiKey || this.getApiKey()).replace(/^["']|["']$/g, '').trim();
    if (!cleanKey) return { version: 'v1beta', models: [] };

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models?key=${cleanKey}`);
      if (res.ok) {
        const data = await res.json();
        const models: string[] = (data.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));
        return { version: 'v1beta', models };
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`[HTTP ${res.status}] ${errorData?.error?.message || res.statusText}`);
    } catch (e: any) {
      console.warn('Falha ao listar modelos do Gemini:', e);
      throw e;
    }
  }
}
