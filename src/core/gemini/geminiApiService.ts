import { Character, Enemy } from '../types/dnd';

const STORAGE_API_KEY = 'dungeons_gemini_api_key';
const STORAGE_MODEL_KEY = 'dungeons_gemini_model';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export class GeminiApiService {
  static getApiKey(): string {
    return localStorage.getItem(STORAGE_API_KEY) || '';
  }

  static setApiKey(key: string): void {
    localStorage.setItem(STORAGE_API_KEY, key.trim());
  }

  static getModel(): string {
    return localStorage.getItem(STORAGE_MODEL_KEY) || 'gemini-1.5-pro';
  }

  static setModel(model: string): void {
    localStorage.setItem(STORAGE_MODEL_KEY, model);
  }

  static generateSystemInstruction(characters: Character[], enemies: Enemy[]): string {
    const heroesSummary = characters.map(c => 
      `- ${c.name} (${c.race} ${c.class} Nv.${c.level}, CA ${c.equippedArmor ? 'alta' : 'base'}, HP: ${c.currentHp}/${c.maxHp})`
    ).join('\n');

    const enemiesSummary = enemies.length > 0
      ? enemies.map(e => `- ${e.name} (CA ${e.ac}, HP ${e.currentHp}/${e.maxHp}, ND ${e.cr})`).join('\n')
      : 'Nenhum combate ativo no momento.';

    return `Você é o Mestre da Masmorra (Dungeon Master) oficial de D&D 5ª Edição narrando uma campanha no cenário de fantasia heroica REALMS.

REGRAS IMPRESCINDÍVEIS DE IMPARCIALIDADE E SISTEMA DETERMINÍSTICO:
1. NUNCA invente ou alucine rolagens de dados secretas. Todas as rolagens devem ser solicitadas ao jogador ou resolvidas pela interface.
2. Seja neutro e justo: não favoreça nem puna os personagens sem motivo narrativo ou mecânico.
3. Se um jogador declarar uma ação que envolva risco ou oposição, declare qual perícia ou salvaguarda e a Classe de Dificuldade (CD) sugerida (Fácil CD 10, Moderado CD 15, Difícil CD 20, Quase Impossível CD 25).
4. Responda em Português do Brasil com prosa envolvente, sensorial e concisa (máximo 2 a 4 parágrafos por turno), descrevendo o ambiente, reações de NPCs e consequências táteis.
5. Em combate, narre os golpes com base nos dados reais fornecidos pelo jogador.

ESTADO ATUAL DO GRUPO DE AVENTUREIROS:
${heroesSummary}

INIMIGOS NO ENCONTRO ATUAL:
${enemiesSummary}
`;
  }

  static async sendMessage(
    userPrompt: string,
    history: ChatMessage[],
    characters: Character[],
    enemies: Enemy[]
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio.');
    }

    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemInstructionText = this.generateSystemInstruction(characters, enemies);

    // Formata o histórico no padrão da Gemini API
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Adiciona a nova mensagem do usuário
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 1200
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`;
      if (response.status === 400 && message.includes('API_KEY_INVALID')) {
        throw new Error('Chave de API inválida. Verifique sua chave no Google AI Studio (aistudio.google.com).');
      }
      throw new Error(`Falha na comunicação com o Gemini: ${message}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('O Gemini não retornou texto na resposta. Tente reformular a ação.');
    }

    return candidateText;
  }
}
