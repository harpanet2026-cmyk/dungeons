export interface SessionLogEntry {
  id: string;
  title: string;
  content: string;
  inGameDate?: string;
  realDate: string;
  author: string;
  tags: string[];
}

export type QuestStatus = 'ativa' | 'concluida' | 'falha';

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver?: string;
  location?: string;
  reward?: string;
  status: QuestStatus;
  notes?: string;
  createdAt: string;
}

export type NpcAttitude = 'aliado' | 'neutro' | 'hostil' | 'desconhecido';

export interface NpcContact {
  id: string;
  name: string;
  title?: string;
  race?: string;
  location?: string;
  attitude: NpcAttitude;
  notes: string;
}

export interface CampaignData {
  title: string;
  logs: SessionLogEntry[];
  quests: Quest[];
  npcs: NpcContact[];
}
