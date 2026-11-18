export type AbilityName = 'for' | 'des' | 'con' | 'int' | 'sab' | 'car';

export interface AbilityScores {
  for: number; // Força (STR)
  des: number; // Destreza (DEX)
  con: number; // Constituição (CON)
  int: number; // Inteligência (INT)
  sab: number; // Sabedoria (WIS)
  car: number; // Carisma (CHA)
}

export type SkillName =
  | 'acrobacia'
  | 'adestrar_animais'
  | 'arcanismo'
  | 'atletismo'
  | 'atuacao'
  | 'enganacao'
  | 'historia'
  | 'intimidacao'
  | 'intuicao'
  | 'investigacao'
  | 'medicina'
  | 'natureza'
  | 'percepcao'
  | 'persuasao'
  | 'prestidigitacao'
  | 'religiao'
  | 'sobrevivencia'
  | 'furtividade';

export interface SkillDefinition {
  id: SkillName;
  name: string;
  ability: AbilityName;
}

export type Alignment =
  | 'Leal e Bom'
  | 'Neutro e Bom'
  | 'Caótico e Bom'
  | 'Leal e Neutro'
  | 'Neutro'
  | 'Caótico e Neutro'
  | 'Leal e Mau'
  | 'Neutro e Mau'
  | 'Caótico e Mau';

export type Condition =
  | 'Cego'
  | 'Enfeitiçado'
  | 'Surdo'
  | 'Amedrontado'
  | 'Agarrado'
  | 'Incapacitado'
  | 'Invisível'
  | 'Paralisado'
  | 'Petrificado'
  | 'Envenenado'
  | 'Caído'
  | 'Contido'
  | 'Atordoado'
  | 'Inconsciente'
  | 'Exaustão';

export type ArmorType = 'nenhuma' | 'leve' | 'media' | 'pesada' | 'escudo';

export interface Item {
  id: string;
  name: string;
  quantity: number;
  weight: number; // em kg ou lbs
  description?: string;
  isEquipped?: boolean;
  type?: 'arma' | 'armadura' | 'pocao' | 'ferramenta' | 'geral';
  armorBonus?: number;
  armorType?: ArmorType;
  stealthDisadvantage?: boolean;
  damage?: string;
  damageType?: string;
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 para truque
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damage?: string;
  prepared?: boolean;
}

export interface Coins {
  pc: number; // Peças de cobre
  pp: number; // Peças de prata
  pe: number; // Peças de electrum
  po: number; // Peças de ouro
  pl: number; // Peças de platina
}

export interface SpellSlots {
  [level: number]: {
    max: number;
    used: number;
  };
}

export interface Personality {
  traits: string[];
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  secretsOrHooks: string;
}

export interface Character {
  id: string;
  name: string;
  player: string;
  race: string;
  subrace?: string;
  class: string;
  subclass?: string;
  level: number;
  xp: number;
  alignment: Alignment;
  background: string;
  gender?: 'masculino' | 'feminino' | string;

  // Atributos base (sem mod racial)
  baseAbilities: AbilityScores;
  
  // Perícias e Salvaguardas
  savingThrowProficiencies: AbilityName[];
  skillProficiencies: SkillName[];
  skillExpertise: SkillName[]; // Perícias com bônus dobrado (ex: Ladino / Bardo)

  // Combate e Saúde
  maxHp: number;
  currentHp: number;
  tempHp: number;
  hitDie: string; // Ex: '1d10'
  hitDiceTotal: number;
  hitDiceUsed: number;
  deathSaves: {
    successes: number;
    failures: number;
  };
  speed: number; // em metros (ex: 9m)
  hasInspiration: boolean;

  // Armadura e Combate
  equippedArmor?: Item;
  equippedShield?: Item;
  weapons: Item[];

  // Magias
  spellcastingAbility?: AbilityName;
  spellSlots: SpellSlots;
  spells: Spell[];

  // Itens e Dinheiro
  inventory: Item[];
  coins: Coins;

  // Traços de Personalidade & Roleplay
  personality: Personality;

  // Condições ativas
  conditions: Condition[];
  notes: string;
  avatarUrl?: string;
}

// Modelos de Análise Tática e DMG
export interface PartySynergy {
  frontlineScore: number; // 0-100
  damageScore: number;    // 0-100
  supportScore: number;   // 0-100
  controlScore: number;   // 0-100
  utilityScore: number;   // 0-100
  sensesScore: number;    // 0-100
  gaps: string[];
  strengths: string[];
}

export interface EncounterThresholds {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
  dailyBudget: number;
}

export type DiceRollMode = 'automatico' | 'manual';

export interface EnemyAttack {
  id: string;
  name: string;
  bonus: number; // Ex: +4 para acertar
  damage: string; // Ex: '1d6 + 2'
  damageType: string; // Ex: 'cortante', 'perfurante', 'fogo'
  range?: string; // Ex: 'Corpo a corpo (1.5m)' ou 'Distância (24/96m)'
  saveDc?: number; // Ex: CD 11
  saveType?: AbilityName; // Ex: 'for' ou 'des'
  description?: string;
}

export interface Enemy {
  id: string;
  name: string;
  type: string; // Ex: 'Humanoide (Orc)', 'Fera', 'Morto-vivo'
  cr: string; // ND (Nível de Desafio: '1/4', '1/2', '1', '2', '3'...)
  xp: number;
  ac: number;
  maxHp: number;
  currentHp: number;
  speed: number;
  initiativeMod: number;
  attacks: EnemyAttack[];
  savingThrows: Partial<Record<AbilityName, number>>;
  passivePerception: number;
  conditions: Condition[];
  notes?: string;
  imageUrl?: string;
}
