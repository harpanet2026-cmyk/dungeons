import { Character, Enemy } from '../types/dnd';
import { CampaignManager } from '../state/campaignManager';

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

  static generateSystemInstruction(characters: Character[], enemies: Enemy[], customDossier?: string): string {
    const dossier = customDossier !== undefined ? customDossier : CampaignManager.getDossier();

    const heroesSummary = characters.map(c => 
      `- ${c.name} (${c.race} ${c.class} Nv.${c.level}, CA ${c.equippedArmor ? 'alta' : 'base'}, HP: ${c.currentHp}/${c.maxHp}${c.personality ? `, Ideal: "${c.personality.ideals}", Vínculo: "${c.personality.bonds}", Segredo: "${c.personality.secretsOrHooks}"` : ''})`
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

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  static async sendMessage(
    userPrompt: string,
    history: ChatMessage[],
    characters: Character[],
    enemies: Enemy[],
    customDossier?: string
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chave de API do Gemini não configurada. Por favor, insira sua chave do Google AI Studio.');
    }

    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemInstructionText = this.generateSystemInstruction(characters, enemies, customDossier);

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
