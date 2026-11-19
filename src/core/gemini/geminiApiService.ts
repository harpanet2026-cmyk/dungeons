import { Character, Enemy } from '../types/dnd';
import { CampaignManager } from '../state/campaignManager';
import { ToolExecutor, ExecutedToolResult } from './toolExecutor';
import { GEMINI_TOOLS_DECLARATION } from './toolSchemas';

const STORAGE_API_KEY = 'dungeons_gemini_api_key';
const STORAGE_LEGACY_KEY = 'gemini_api_key';
const STORAGE_MODEL_KEY = 'dungeons_gemini_model';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export const FALLBACK_GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_API_VERSION = 'v1beta';

// Lista de modelos suportados em ordem de preferência
export const SUPPORTED_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-pro'
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
   * Remove prefixos como 'models/' e espaços invisíveis para garantir o formato correto da URL REST
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

REGRAS DE IMPARCIALIDADE E TOOL CALLING DETERMINÍSTICO (100% AUTOMÁTICO):
1. Você possui ferramentas mecânicas integradas diretamente ao sistema (Function Calling):
   - 'roll_d20_check': Invoque sempre que um herói tentar uma ação incerta (atletismo, percepção, furtividade, arrombamento) ou salvaguarda.
   - 'apply_damage': Invoque sempre que um ataque acertar ou houver dano de armadilha/feitiço.
   - 'heal_character': Invoque sempre que houver magia de cura, poção ou descanso.
   - 'spend_spell_slot': Invoque quando um personagem gastar um espaço de magia de 1º círculo ou superior.
   - 'set_condition': Invoque quando aplicar ou remover condições de status (Envenenado, Caído, etc.).
   - 'get_party_status': Invoque quando precisar consultar o estado atual de todo o grupo.
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
    characters: Character[],
    explicitApiKey?: string
  ): Promise<string> {
    const apiKey = (explicitApiKey || this.getApiKey()).replace(/^["']|["']$/g, '').trim();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio para gerar a aventura com IA.');
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

  /**
   * Teste rápido de conectividade com prompt mínimo ("Responda apenas: OK")
   * Se o modelo solicitado retornar 404, testa os fallbacks automaticamente e ativa o que responder HTTP 200.
   */
  static async quickHealthcheck(apiKey?: string, modelName?: string): Promise<HealthcheckResult> {
    const key = (apiKey || this.getApiKey()).replace(/^["']|["']$/g, '').trim();
    if (!key) {
      return {
        success: false,
        status: 400,
        text: '',
        model: modelName || DEFAULT_GEMINI_MODEL,
        error: 'Chave de API do Gemini não informada ou vazia. Verifique a variável GEMINI_API_KEY ou configure na tela.'
      };
    }

    const requestedModel = this.cleanModelName(modelName || this.getModel() || DEFAULT_GEMINI_MODEL);
    
    // Lista ordenada para o healthcheck: tenta o solicitado e em caso de 404 testa os modelos reais da API
    const testCandidates = Array.from(new Set([
      requestedModel,
      FALLBACK_GEMINI_MODEL,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ]));

    let lastError = '';
    let lastStatus = 0;
    let lastRaw: any = null;

    for (const currentModel of testCandidates) {
      const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${currentModel}:generateContent?key=${key}`;
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
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const data = await res.json().catch(() => ({}));
        lastStatus = res.status;
        lastRaw = data;

        if (res.ok) {
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
          // Se a validação teve sucesso, persiste a chave verificada imediatamente
          this.setApiKey(key);
          // Se o modelo solicitado retornou 404 mas o fallback funcionou, ativa o fallback como modelo ativo!
          if (currentModel !== requestedModel) {
            console.warn(`[Gemini API] Modelo '${requestedModel}' retornou 404. Modelo ativo atualizado para '${currentModel}'.`);
            this.setModel(currentModel);
          }
          return {
            success: true,
            status: res.status,
            text: replyText,
            model: currentModel,
            raw: data
          };
        }

        const errorMsg = data?.error?.message || res.statusText || 'Erro desconhecido';
        lastError = `[HTTP ${res.status}] ${errorMsg}`;

        // Se for 401, 403 ou erro de chave inválida, encerra imediatamente (não adianta tentar outro modelo)
        if (res.status === 401 || res.status === 403 || (res.status === 400 && errorMsg.includes('API_KEY_INVALID'))) {
          break;
        }

        // Se for 429, encerra imediatamente para não consumir mais quota
        if (res.status === 429) {
          break;
        }

        // Se for 404, continua para o próximo fallback
        if (res.status === 404 || errorMsg.includes('not found') || errorMsg.includes('not supported')) {
          continue;
        }

        break;
      } catch (err: any) {
        lastError = err.message || 'Falha de rede ao conectar com a Google Gemini API.';
        break;
      }
    }

    return {
      success: false,
      status: lastStatus,
      text: '',
      model: requestedModel,
      raw: lastRaw,
      error: lastError || 'Nenhum modelo do Gemini respondeu com sucesso.'
    };
  }

  /**
   * Executa a requisição REST com fallback estrito (evitando múltiplos disparos e loops 429)
   */
  private static async executeWithFallback(
    apiKey: string,
    initialModel: string,
    requestBody: any
  ): Promise<any> {
    const cleanApiKey = apiKey.trim();
    const primaryModel = this.cleanModelName(initialModel) || DEFAULT_GEMINI_MODEL;
    
    // Lista ordenada estrita de fallback com modelos reais do Google AI Studio
    const candidateModels = Array.from(new Set([
      primaryModel,
      FALLBACK_GEMINI_MODEL,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ]));

    let lastError: Error | null = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const currentModel = candidateModels[i];
      const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${currentModel}:generateContent?key=${cleanApiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          if (currentModel !== primaryModel) {
            console.warn(`[Gemini API] Fallback ativado: ${primaryModel} indisponível -> usando ${currentModel}`);
            this.setModel(currentModel);
          }
          return await response.json();
        }

        const errorData = await response.json().catch(() => ({}));
        const rawJsonError = JSON.stringify(errorData, null, 2);
        const apiErrorMessage = errorData?.error?.message || response.statusText || 'Erro desconhecido';

        // 1. HTTP 429 Too Many Requests -> Interrompe imediatamente para não consumir quota em loop
        if (response.status === 429) {
          throw new Error(
            `[HTTP 429 Too Many Requests] Limite de requisições excedido na sua chave do Google AI Studio.\n` +
            `Detalhes da API: ${apiErrorMessage}\n\n` +
            `Dica: A camada gratuita do Gemini tem limites por minuto (RPM) e dia (RPD). ` +
            `Aguarde cerca de 30-60 segundos antes de enviar outra mensagem, ou alterne para a aba '🖥️ Ollama (Local Offline)' para jogar sem limites de taxa.`
          );
        }

        // 2. HTTP 400 Bad Request -> Exibe o status e o JSON completo retornado para depuração
        if (response.status === 400) {
          if (apiErrorMessage.includes('API_KEY_INVALID')) {
            throw new Error(`[HTTP 400 Bad Request] Chave de API inválida. Verifique sua chave no Google AI Studio (aistudio.google.com).`);
          }
          throw new Error(
            `[HTTP 400 Bad Request] Parâmetros de requisição inválidos na Gemini API:\n` +
            `Status: 400 Bad Request\n` +
            `Mensagem: ${apiErrorMessage}\n` +
            `JSON da API:\n${rawJsonError}`
          );
        }

        // 3. HTTP 401 / 403 Unauthorized / Forbidden
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `[HTTP ${response.status}] Acesso negado pela Gemini API. ` +
            `Verifique se a chave de API está correta e com a 'Generative Language API' habilitada.\n` +
            `JSON da API:\n${rawJsonError}`
          );
        }

        // 4. HTTP 404 Not Found -> Tenta o próximo modelo do fallback
        if (response.status === 404 || apiErrorMessage.includes('not found') || apiErrorMessage.includes('is not supported')) {
          console.warn(`[Gemini API] Modelo '${currentModel}' retornou 404. Tentando fallback...`);
          lastError = new Error(
            `[HTTP 404 Not Found] O modelo '${currentModel}' não foi encontrado ou não está disponível para esta chave.\n` +
            `JSON da API:\n${rawJsonError}`
          );
          continue; // Tenta o próximo modelo
        }

        // Outros erros HTTP (500, 503, etc.)
        throw new Error(
          `[HTTP ${response.status} ${response.statusText}] Falha na comunicação com a Gemini API:\n` +
          `JSON da API:\n${rawJsonError}`
        );

      } catch (err: any) {
        if (err.message && err.message.includes('[HTTP 404') && i < candidateModels.length - 1) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error(`[HTTP 404] Nenhum dos modelos configurados (${candidateModels.join(', ')}) está disponível para sua chave.`);
  }

  /**
   * Constrói e sanitiza a lista de mensagens 'contents' garantindo conformidade total com a Gemini API v1beta:
   * 1. Remove saudações/mensagens iniciais com role 'model' (o Gemini REJEITA chats que não começam com 'user').
   * 2. Garante alternância estrita entre 'user' e 'model', mesclando mensagens consecutivas da mesma role.
   * 3. Garante que o último turno seja 'user' com o prompt atual.
   * 4. Remove partes de texto vazias para evitar HTTP 400.
   */
  public static formatContentsForGemini(history: ChatMessage[], newPrompt: string): any[] {
    const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];

    // 1. Coleta mensagens anteriores com texto não-vazio
    for (const msg of history || []) {
      const clean = (msg.text || '').trim();
      if (!clean) continue;
      rawTurns.push({
        role: msg.role === 'model' ? 'model' : 'user',
        text: clean
      });
    }

    // 2. Adiciona o novo prompt do usuário
    const cleanPrompt = (newPrompt || '').trim();
    if (cleanPrompt) {
      rawTurns.push({
        role: 'user',
        text: cleanPrompt
      });
    }

    // 3. Remove mensagens no início que sejam 'model' (ex: saudação estática de abertura da interface)
    // A especificação da Google Gemini API exige estritamente que multiturn comece com role 'user'
    while (rawTurns.length > 0 && rawTurns[0].role === 'model') {
      rawTurns.shift();
    }

    // 4. Se não sobrou nenhum turno, adiciona ao menos o prompt atual
    if (rawTurns.length === 0) {
      return [
        {
          role: 'user',
          parts: [{ text: cleanPrompt || 'Olá, Mestre!' }]
        }
      ];
    }

    // 5. Garante alternância estrita (user -> model -> user -> model)
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
          // Se houver dois turnos seguidos com a mesma role, concatena os textos para evitar HTTP 400
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
        parts: [{ text: cleanPrompt || 'Continue narrando os acontecimentos.' }]
      });
    }

    return normalized;
  }

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

    // Sanitiza e formata o histórico em estrita conformidade com a Gemini API (começando sempre por 'user')
    const contents = this.formatContentsForGemini(history, userPrompt);

    // Formatação 100% compatível com a especificação REST v1beta da Gemini API
    const requestBody: any = {
      systemInstruction: {
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

    let data;
    try {
      data = await this.executeWithFallback(apiKey, model, requestBody);
    } catch (err: any) {
      // Se falhar com 400 (Bad Request) ou erro de schema/ferramenta, tenta novamente em modo narrativo puro
      if (err.message && (err.message.includes('400') || err.message.includes('INVALID_ARGUMENT')) && requestBody.tools) {
        console.warn('[Gemini API] Falha na requisição com ferramentas integradas. Retentando em modo puramente narrativo...', err);
        const { tools, ...narrativeOnlyBody } = requestBody;
        data = await this.executeWithFallback(apiKey, model, narrativeOnlyBody);
      } else {
        throw err;
      }
    }

    let parts: any[] = data.candidates?.[0]?.content?.parts || [];

    const executedTools: ExecutedToolResult[] = [];
    let currentCharacters = characters;
    let currentEnemies = enemies;

    // 1. Detecta chamadas nativas de ferramentas (Function Calling)
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length > 0) {
      for (const callPart of functionCalls) {
        const { name, args } = callPart.functionCall;
        const result = ToolExecutor.execute(name, args || {}, currentCharacters, currentEnemies);
        executedTools.push(result);
        if (result.updatedCharacters) currentCharacters = result.updatedCharacters;
        if (result.updatedEnemies) currentEnemies = result.updatedEnemies;
      }

      // Constrói a segunda rodada (Function Response) no padrão v1beta (role: 'user')
      const secondContents = [
        ...contents,
        {
          role: 'model',
          parts: functionCalls
        },
        {
          role: 'user',
          parts: functionCalls.map((fc: any, idx: number) => ({
            functionResponse: {
              name: fc.functionCall.name,
              response: {
                result: executedTools[idx]?.summary || 'Ação resolvida com sucesso.'
              }
            }
          }))
        }
      ];

      try {
        const secondRequestBody = {
          systemInstruction: {
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
        console.warn('[Gemini API] Falha na segunda rodada de Function Response:', err);
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
