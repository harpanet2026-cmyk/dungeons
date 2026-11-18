import { Character, Enemy } from '../types/dnd';
import { CampaignManager } from '../state/campaignManager';
import { ToolExecutor, ExecutedToolResult } from './toolExecutor';
import { GEMINI_TOOLS_DECLARATION } from './toolSchemas';

const STORAGE_API_KEY = 'dungeons_gemini_api_key';
const STORAGE_MODEL_KEY = 'dungeons_gemini_model';

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

export class GeminiApiService {
  static getApiKey(): string {
    return localStorage.getItem(STORAGE_API_KEY) || '';
  }

  static setApiKey(key: string): void {
    localStorage.setItem(STORAGE_API_KEY, key.trim());
  }

  static getModel(): string {
    const saved = localStorage.getItem(STORAGE_MODEL_KEY);
    if (!saved || saved === 'gemini-1.5-flash') {
      return 'gemini-2.5-flash';
    }
    return saved;
  }

  static setModel(model: string): void {
    localStorage.setItem(STORAGE_MODEL_KEY, model);
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

REGRAS DE IMPARCIALIDADE E TOOL CALLING DETERMINÍSTICO (100% AUTOMÁTICO):
1. Você possui ferramentas mecânicas integradas diretamente ao sistema (Function Calling):
   - 'roll_d20_check': Invoque sempre que um herói tentar uma ação incerta (atletismo, percepção, furtividade, arrombamento) ou salvaguarda.
   - 'apply_damage': Invoque sempre que um ataque acertar ou houver dano de armadilha/feitiço.
   - 'heal_character': Invoque sempre que houver magia de cura, poção ou descanso.
   - 'spend_spell_slot': Invoque quando um personagem gastar um espaço de magia de 1º círculo ou superior.
   - 'set_condition': Invoque quando aplicar ou remover condições de status (Envenenado, Caído, etc.).
2. NUNCA invente números de HP ou rolagens falsas na fala. O aplicativo rolará os dados matemáticos reais e alterará a vida na ficha dos personagens automaticamente!
3. Seja neutro e justo: narre as consequências sensoriais e dramáticas baseando-se nos resultados calculados.
4. Responda em Português do Brasil com narrativa cinematográfica, sensorial e envolvente (máximo 2 a 4 parágrafos por resposta).
5. O Dossiê da Campanha abaixo dita os perigos, ganchos e segredos da aventura.

========================================================================
DOSSIÊ OFICIAL DA CAMPANHA (DIRETRIZES DE LORE, CENÁRIO, ANTAGONISTAS E OBJETIVOS):
${dossier || 'Nenhum dossiê de campanha definido ainda. Conduza com base nas ações dos heróis.'}
========================================================================
DIRETRIZ DE NARRATIVA:
Você DEVE fundamentar sua narrativa, diálogos de NPCs, encontros e mistérios estritamente nas premissas e locais do Dossiê de Campanha acima. Quando os aventureiros explorarem ou investigarem, conduza os acontecimentos em direção aos segredos deste dossiê.

ESTADO ATUAL DO GRUPO DE AVENTUREIROS:
${heroesSummary}

INIMIGOS NO ENCONTRO ATUAL:
${enemiesSummary}
`;
  }

  static async generateCustomDossierWithAI(
    themeTitle: string,
    themeDesc: string,
    userDesires: string,
    characters: Character[]
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio para gerar a aventura com IA.');
    }

    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

Responda em Português do Brasil com riqueza dramática, mantendo o formato acima para que seja perfeitamente interpretado pelo Mestre Gemini.`;

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

    const data = await this.executeWithFallback(apiKey, model, requestBody);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  static async listModels(apiKey: string): Promise<{ version: 'v1beta' | 'v1'; models: string[] }> {
    const cleanKey = apiKey.trim();
    for (const ver of ['v1beta', 'v1'] as const) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${cleanKey}`);
        if (res.ok) {
          const data = await res.json();
          const models: string[] = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace('models/', ''));
          if (models.length > 0) {
            return { version: ver, models };
          }
        }
      } catch (e) {}
    }
    return { version: 'v1beta', models: [] };
  }

  private static async executeWithFallback(
    apiKey: string,
    initialModel: string,
    requestBody: any
  ): Promise<any> {
    const cleanApiKey = apiKey.trim();

    // 1. Tentar detectar modelos habilitados na conta da API Key
    let detectedModels: string[] = [];
    let preferredVersion: 'v1beta' | 'v1' = 'v1beta';
    try {
      const info = await this.listModels(cleanApiKey);
      if (info.models.length > 0) {
        detectedModels = info.models;
        preferredVersion = info.version;
      }
    } catch {}

    const candidates = [
      ...detectedModels,
      initialModel,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-pro',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];
    const modelsToTry = Array.from(new Set(candidates)).filter(Boolean);

    // Tentar versões v1beta e v1
    const versionsToTry: ('v1beta' | 'v1')[] = preferredVersion === 'v1' ? ['v1', 'v1beta'] : ['v1beta', 'v1'];

    let lastError: Error | null = null;
    for (const ver of versionsToTry) {
      for (const m of modelsToTry) {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${m}:generateContent?key=${cleanApiKey}`;
        try {
          let bodyToSend = requestBody;
          if (ver === 'v1' && requestBody.system_instruction) {
            const sysText = requestBody.system_instruction?.parts?.[0]?.text || '';
            bodyToSend = {
              contents: [
                { role: 'user', parts: [{ text: `[INSTRUÇÕES DO SISTEMA]:\n${sysText}` }] },
                { role: 'model', parts: [{ text: 'Entendido. Seguirei rigorosamente as instruções do sistema.' }] },
                ...requestBody.contents
              ],
              generationConfig: requestBody.generationConfig
            };
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyToSend)
          });

          if (response.ok) {
            if (m !== initialModel) {
              console.warn(`[Gemini] Alternado automaticamente para ${m} (${ver})`);
              this.setModel(m);
            }
            return await response.json();
          }

          const errorData = await response.json().catch(() => ({}));
          const message = errorData?.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`;

          if (response.status === 400 && message.includes('API_KEY_INVALID')) {
            throw new Error('Chave de API inválida. Verifique sua chave no Google AI Studio (aistudio.google.com).');
          }

          // Se for 404 (modelo não encontrado), continua tentando o próximo candidato
          if (response.status === 404 || message.includes('not found') || message.includes('not supported')) {
            lastError = new Error(`Falha na comunicação com o Gemini: ${message}`);
            continue;
          }

          throw new Error(`Falha na comunicação com o Gemini: ${message}`);
        } catch (err: any) {
          if (err.message && (err.message.includes('not found') || err.message.includes('not supported'))) {
            lastError = err;
            continue;
          }
          throw err;
        }
      }
    }

    if (detectedModels.length === 0) {
      throw new Error(
        `Nenhum modelo do Gemini foi encontrado para esta chave de API. ` +
        `Isso costuma ocorrer se a chave foi criada no Google Cloud sem a API 'Generative Language API' ativada, ` +
        `ou se for uma conta corporativa/Google Workspace. Crie uma chave gratuita em https://aistudio.google.com/ com uma conta pessoal @gmail.com.`
      );
    }

    throw lastError || new Error('Nenhum modelo do Gemini disponível para esta chave de API.');
  }

  static async sendMessage(
    userPrompt: string,
    history: ChatMessage[],
    characters: Character[],
    enemies: Enemy[],
    customDossier?: string
  ): Promise<AiNarrativeResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio.');
    }

    const model = this.getModel();
    const systemInstructionText = this.generateSystemInstruction(characters, enemies, customDossier);

    // Formata o histórico no padrão da Gemini API
    const contents: any[] = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Adiciona a nova mensagem do usuário
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const requestBody: any = {
      system_instruction: {
        parts: [{ text: systemInstructionText }]
      },
      tools: [GEMINI_TOOLS_DECLARATION],
      contents,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 1200
      }
    };

    let data = await this.executeWithFallback(apiKey, model, requestBody);
    let parts: any[] = data.candidates?.[0]?.content?.parts || [];

    const executedTools: ExecutedToolResult[] = [];
    let currentCharacters = characters;
    let currentEnemies = enemies;

    // 1. Detecta chamadas nativas de ferramentas (Function Calling)
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length > 0) {
      for (const callPart of functionCalls) {
        const { name, args } = callPart.functionCall;
        const result = ToolExecutor.execute(name, args, currentCharacters, currentEnemies);
        executedTools.push(result);
        if (result.updatedCharacters) currentCharacters = result.updatedCharacters;
        if (result.updatedEnemies) currentEnemies = result.updatedEnemies;
      }

      // Constrói a segunda rodada (Function Response) para o Gemini continuar a narração baseada no resultado
      const secondContents = [
        ...contents,
        {
          role: 'model',
          parts: functionCalls
        },
        {
          role: 'function',
          parts: functionCalls.map((fc: any, idx: number) => ({
            functionResponse: {
              name: fc.functionCall.name,
              response: {
                name: fc.functionCall.name,
                content: executedTools[idx]?.summary || 'Ação resolvida.'
              }
            }
          }))
        }
      ];

      try {
        const secondRequestBody = {
          system_instruction: {
            parts: [{ text: systemInstructionText }]
          },
          contents: secondContents,
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 1200
          }
        };

        const secondData = await this.executeWithFallback(apiKey, model, secondRequestBody);
        const secondText = secondData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (secondText) {
          return {
            text: secondText,
            executedTools,
            updatedCharacters: currentCharacters !== characters ? currentCharacters : undefined,
            updatedEnemies: currentEnemies !== enemies ? currentEnemies : undefined
          };
        }
      } catch (err) {
        // Se a segunda chamada falhar, prossegue com os resultados das ferramentas
      }
    }

    // 2. Extrai texto gerado
    let text = parts.find((p: any) => p.text)?.text || '';

    // 3. Fallback: Detecta chamadas inline no formato [TOOL: name(...)] se o modelo gerou em texto
    const inlineMatch = text.match(/\[(?:TOOL|ACTION):\s*(\w+)\((.*?)\)\]/i);
    if (inlineMatch) {
      const toolName = inlineMatch[1];
      const rawArgs = inlineMatch[2];
      const parsedArgs: any = {};
      rawArgs.split(',').forEach((param: string) => {
        const [k, v] = param.split('=').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        if (k && v !== undefined) parsedArgs[k] = v;
      });

      const result = ToolExecutor.execute(toolName, parsedArgs, currentCharacters, currentEnemies);
      executedTools.push(result);
      if (result.updatedCharacters) currentCharacters = result.updatedCharacters;
      if (result.updatedEnemies) currentEnemies = result.updatedEnemies;

      text = text.replace(/\[(?:TOOL|ACTION):.*?\]/gi, '').trim();
    }

    if (!text && executedTools.length > 0) {
      text = executedTools.map(t => t.summary).join('\n');
    }

    return {
      text: text || 'Ação resolvida pelas regras estritas de D&D 5e.',
      executedTools,
      updatedCharacters: currentCharacters !== characters ? currentCharacters : undefined,
      updatedEnemies: currentEnemies !== enemies ? currentEnemies : undefined
    };
  }
}
