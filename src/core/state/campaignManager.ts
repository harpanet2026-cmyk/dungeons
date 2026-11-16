import { CampaignData, SessionLogEntry, Quest, NpcContact } from '../types/campaign';

const STORAGE_CAMPAIGN_KEY = 'dungeons_gemini_campaign_v1';

export const INITIAL_CAMPAIGN_DATA: CampaignData = {
  title: 'As Criptas Esquecidas de Kar-Drakor',
  logs: [
    {
      id: 'log_1',
      title: 'Chegada ao Posto Avançado da Neve',
      content: 'O grupo se reuniu na taverna O Carneiro Chifrudo. Um mensageiro ferido entregou um medalhão rúnico e avisou sobre orcs escavando a entrada norte das catacumbas.',
      inGameDate: 'Dia 12 do Mês das Folhas Caídas',
      realDate: new Date().toLocaleDateString('pt-BR'),
      author: 'Mestre da Masmorra',
      tags: ['Exploração', 'Mistério']
    }
  ],
  quests: [
    {
      id: 'quest_1',
      title: 'O Estandarte do Batalhão Perdido',
      description: 'Thorin busca recuperar a honra de seus irmãos de armas caídos nas profundezas.',
      giver: 'Thorin Quebra-Escudos',
      location: 'Cripta Inferior',
      reward: '50 PO e a Bênção Ancestral dos Anões',
      status: 'ativa',
      notes: 'Monstros do tipo morto-vivo guardam o ossuário.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'quest_2',
      title: 'A Relíquia Arcana dos Altos Elfos',
      description: 'Lyra deve desvendar os segredos de um tomo de conjuração selado por fogo antigo.',
      giver: 'Arquimago de Silverymoon',
      location: 'Salão dos Espelhos',
      reward: 'Pergaminho de Bola de Fogo',
      status: 'ativa',
      notes: 'Necessário decifrar três runas antes de abrir a câmara.',
      createdAt: new Date().toISOString()
    }
  ],
  npcs: [
    {
      id: 'npc_1',
      name: 'Broggan Olho-de-Prata',
      title: 'Armeiro e Taberneiro',
      race: 'Anão da Colina',
      location: 'Posto Avançado da Neve',
      attitude: 'aliado',
      notes: 'Vende suprimentos e oferece desconto de 10% para companheiros de armas de Thorin.'
    },
    {
      id: 'npc_2',
      name: 'Vaelen, o Sem-Voz',
      title: 'Guia do Pântano Negro',
      race: 'Meio-Elfo',
      location: 'Fronteira das Ruínas',
      attitude: 'neutro',
      notes: 'Conhece as passagens secretas da masmorra, mas exige pagamento adiantado.'
    }
  ]
};

export class CampaignManager {
  static getCampaignData(): CampaignData {
    const raw = localStorage.getItem(STORAGE_CAMPAIGN_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CAMPAIGN_KEY, JSON.stringify(INITIAL_CAMPAIGN_DATA));
      return INITIAL_CAMPAIGN_DATA;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        title: parsed.title || INITIAL_CAMPAIGN_DATA.title,
        logs: Array.isArray(parsed.logs) ? parsed.logs : INITIAL_CAMPAIGN_DATA.logs,
        quests: Array.isArray(parsed.quests) ? parsed.quests : INITIAL_CAMPAIGN_DATA.quests,
        npcs: Array.isArray(parsed.npcs) ? parsed.npcs : INITIAL_CAMPAIGN_DATA.npcs
      };
    } catch {
      return INITIAL_CAMPAIGN_DATA;
    }
  }

  static saveCampaignData(data: CampaignData): void {
    localStorage.setItem(STORAGE_CAMPAIGN_KEY, JSON.stringify(data));
  }

  static addLog(entry: Omit<SessionLogEntry, 'id'>): SessionLogEntry {
    const data = this.getCampaignData();
    const newEntry: SessionLogEntry = {
      ...entry,
      id: `log_${Date.now()}`
    };
    data.logs.unshift(newEntry);
    this.saveCampaignData(data);
    return newEntry;
  }

  static addQuest(quest: Omit<Quest, 'id' | 'createdAt'>): Quest {
    const data = this.getCampaignData();
    const newQuest: Quest = {
      ...quest,
      id: `quest_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    data.quests.push(newQuest);
    this.saveCampaignData(data);
    return newQuest;
  }

  static updateQuestStatus(questId: string, status: Quest['status']): void {
    const data = this.getCampaignData();
    data.quests = data.quests.map(q => q.id === questId ? { ...q, status } : q);
    this.saveCampaignData(data);
  }

  static addNpc(npc: Omit<NpcContact, 'id'>): NpcContact {
    const data = this.getCampaignData();
    const newNpc: NpcContact = {
      ...npc,
      id: `npc_${Date.now()}`
    };
    data.npcs.push(newNpc);
    this.saveCampaignData(data);
    return newNpc;
  }

  static deleteNpc(npcId: string): void {
    const data = this.getCampaignData();
    data.npcs = data.npcs.filter(n => n.id !== npcId);
    this.saveCampaignData(data);
  }
}
