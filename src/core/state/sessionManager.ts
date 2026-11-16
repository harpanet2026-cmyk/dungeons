import { Character, Condition, SkillName, AbilityName } from '../types/dnd';
import { getAbilityModifier, getProficiencyBonus, getSavingThrowModifier, getSkillModifier, SKILL_ABILITY_MAP } from '../rules/calculations';
import { SAMPLE_SPELLS, COMMON_ARMORS, COMMON_WEAPONS } from '../rules/srdData';

const STORAGE_KEY = 'dungeons_gemini_characters_v1';

export const INITIAL_SAMPLE_CHARACTERS: Character[] = [
  {
    id: 'char_thorin',
    name: 'Thorin Quebra-Escudos',
    player: 'Guilherme',
    race: 'Anão (da Colina)',
    class: 'Guerreiro',
    level: 3,
    xp: 900,
    alignment: 'Leal e Bom',
    background: 'Soldado',
    baseAbilities: {
      for: 16,
      des: 12,
      con: 16,
      int: 10,
      sab: 14,
      car: 8
    },
    savingThrowProficiencies: ['for', 'con'],
    skillProficiencies: ['atletismo', 'intimidacao', 'percepcao', 'sobrevivencia'],
    skillExpertise: [],
    maxHp: 31, // (10 + 3) + 2*(6 + 3) + 3 (tenacidade anão) = 13 + 18 + 3 = 34 ou ~31
    currentHp: 31,
    tempHp: 0,
    hitDie: '1d10',
    hitDiceTotal: 3,
    hitDiceUsed: 0,
    deathSaves: { successes: 0, failures: 0 },
    speed: 7.5,
    hasInspiration: false,
    equippedArmor: COMMON_ARMORS.find(a => a.id === 'arm_cota_talas'),
    equippedShield: COMMON_ARMORS.find(a => a.id === 'arm_escudo'),
    weapons: [
      { ...COMMON_WEAPONS.find(w => w.id === 'wpn_machado_batalha')!, isEquipped: true }
    ],
    spellSlots: {},
    spells: [],
    inventory: [
      { id: 'item_tochas', name: 'Tochas (5 unidades)', quantity: 5, weight: 2.5, type: 'geral' },
      { id: 'item_corda', name: 'Corda de Cânhamo (15m)', quantity: 1, weight: 5, type: 'geral' },
      { id: 'item_pocao', name: 'Poção de Cura Simples (2d4+2)', quantity: 2, weight: 0.5, type: 'pocao' }
    ],
    coins: { pc: 15, pp: 10, pe: 0, po: 45, pl: 0 },
    personality: {
      traits: ['Gosta de resolver problemas com ação direta.', 'Desconfia de promessas douradas de diplomatas.'],
      ideals: 'Responsabilidade. É dever dos fortes proteger os vulneráveis da tirania.',
      bonds: 'Busca honrar seu esquadrão caído e recuperar o estandarte de seu batalhão.',
      flaws: 'Tem sede incontrolável de vingança contra orcs e recusa recuar em combate.',
      backstory: 'Veterano das guerras nas fronteiras montanhosas do norte.',
      secretsOrHooks: 'Possui uma dívida de sangue com um chefe mercenário que agora trabalha para os vilões.'
    },
    conditions: [],
    notes: 'Estilo de Combate: Defesa (+1 na CA).'
  },
  {
    id: 'char_lyra',
    name: 'Lyra Cantolunar',
    player: 'Beatriz',
    race: 'Elfo (Alto Elfo)',
    class: 'Mago',
    level: 3,
    xp: 900,
    alignment: 'Caótico e Bom',
    background: 'Sábio',
    baseAbilities: {
      for: 8,
      des: 15,
      con: 13,
      int: 16,
      sab: 12,
      car: 10
    },
    savingThrowProficiencies: ['int', 'sab'],
    skillProficiencies: ['arcanismo', 'historia', 'investigacao', 'percepcao'],
    skillExpertise: [],
    maxHp: 17,
    currentHp: 17,
    tempHp: 0,
    hitDie: '1d6',
    hitDiceTotal: 3,
    hitDiceUsed: 0,
    deathSaves: { successes: 0, failures: 0 },
    speed: 9,
    hasInspiration: true,
    equippedArmor: undefined,
    equippedShield: undefined,
    weapons: [
      { ...COMMON_WEAPONS.find(w => w.id === 'wpn_adaga')!, isEquipped: true }
    ],
    spellcastingAbility: 'int',
    spellSlots: {
      1: { max: 4, used: 1 },
      2: { max: 2, used: 0 }
    },
    spells: SAMPLE_SPELLS,
    inventory: [
      { id: 'item_grimorio', name: 'Grimório Arcano', quantity: 1, weight: 1.5, type: 'geral' },
      { id: 'item_foco', name: 'Foco Arcano (Varinha)', quantity: 1, weight: 0.5, type: 'geral' },
      { id: 'item_tintas', name: 'Tinta e Pergaminhos', quantity: 1, weight: 1, type: 'geral' }
    ],
    coins: { pc: 5, pp: 8, pe: 0, po: 62, pl: 0 },
    personality: {
      traits: ['Curiosidade insaciável por mistérios antigos.', 'Fala rápido quando fica entusiasmada.'],
      ideals: 'Conhecimento. O segredo para um mundo melhor jaz nas verdades arcanas ocultas.',
      bonds: 'Seu antigo mentor desapareceu investigando uma fenda planar sombria.',
      flaws: 'Muitas vezes prioriza desvendar uma ruína perigosa em vez da segurança prática imediata.',
      backstory: 'Estudiosa da Academia de Altos Estudos Arcanos de Myth Drannor.',
      secretsOrHooks: 'Carrega um fragmento de cristal pulsante que ouve sussurros nas noites sem lua.'
    },
    conditions: [],
    notes: 'Tradição Arcana: Evocação.'
  }
];

export class SessionManager {
  private static loadFromStorage(): Character[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Falha ao carregar personagens do localStorage:', e);
    }
    return INITIAL_SAMPLE_CHARACTERS;
  }

  private static saveToStorage(characters: Character[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch (e) {
      console.error('Falha ao salvar personagens no localStorage:', e);
    }
  }

  public static getCharacters(): Character[] {
    return this.loadFromStorage();
  }

  public static saveCharacters(characters: Character[]): void {
    this.saveToStorage(characters);
  }

  public static applyDamage(
    characters: Character[],
    characterId: string,
    amount: number
  ): { updatedCharacters: Character[]; log: string } {
    const list = [...characters];
    const index = list.findIndex(c => c.id === characterId);
    if (index === -1) return { updatedCharacters: characters, log: 'Personagem não encontrado.' };

    const char = { ...list[index] };
    let remainingDamage = Math.max(0, amount);

    // Primeiro consome HP temporário
    if (char.tempHp > 0) {
      if (remainingDamage <= char.tempHp) {
        char.tempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= char.tempHp;
        char.tempHp = 0;
      }
    }

    // Depois consome HP atual
    char.currentHp = Math.max(0, char.currentHp - remainingDamage);

    // Se caiu a zero, ganha condição inconsciente
    const conditions = [...char.conditions];
    if (char.currentHp === 0 && !conditions.includes('Inconsciente')) {
      conditions.push('Inconsciente');
    }
    char.conditions = conditions;

    list[index] = char;
    this.saveToStorage(list);

    const log = `${char.name} sofreu ${amount} de dano. HP atual: ${char.currentHp}/${char.maxHp}${char.tempHp > 0 ? ` (+${char.tempHp} temp)` : ''}.${char.currentHp === 0 ? ' [CAIU INCONSCIENTE!]' : ''}`;
    return { updatedCharacters: list, log };
  }

  public static healCharacter(
    characters: Character[],
    characterId: string,
    amount: number
  ): { updatedCharacters: Character[]; log: string } {
    const list = [...characters];
    const index = list.findIndex(c => c.id === characterId);
    if (index === -1) return { updatedCharacters: characters, log: 'Personagem não encontrado.' };

    const char = { ...list[index] };
    const prevHp = char.currentHp;
    char.currentHp = Math.min(char.maxHp, char.currentHp + Math.max(0, amount));

    // Se estava inconsciente e recuperou vida, remove inconsciente
    if (prevHp === 0 && char.currentHp > 0) {
      char.conditions = char.conditions.filter(c => c !== 'Inconsciente');
      char.deathSaves = { successes: 0, failures: 0 };
    }

    list[index] = char;
    this.saveToStorage(list);

    const log = `${char.name} recuperou ${amount} PV. HP atual: ${char.currentHp}/${char.maxHp}.`;
    return { updatedCharacters: list, log };
  }

  public static spendSpellSlot(
    characters: Character[],
    characterId: string,
    level: number
  ): { updatedCharacters: Character[]; log: string } {
    const list = [...characters];
    const index = list.findIndex(c => c.id === characterId);
    if (index === -1) return { updatedCharacters: characters, log: 'Personagem não encontrado.' };

    const char = { ...list[index] };
    const slots = { ...char.spellSlots };
    if (!slots[level] || slots[level].used >= slots[level].max) {
      return { updatedCharacters: characters, log: `Sem espaços disponíveis de ${level}º nível para ${char.name}.` };
    }

    slots[level] = { ...slots[level], used: slots[level].used + 1 };
    char.spellSlots = slots;
    list[index] = char;
    this.saveToStorage(list);

    const remaining = slots[level].max - slots[level].used;
    const log = `${char.name} gastou 1 espaço de magia de ${level}º nível. Restantes: ${remaining}/${slots[level].max}.`;
    return { updatedCharacters: list, log };
  }

  public static restoreSpellSlot(
    characters: Character[],
    characterId: string,
    level: number
  ): { updatedCharacters: Character[]; log: string } {
    const list = [...characters];
    const index = list.findIndex(c => c.id === characterId);
    if (index === -1) return { updatedCharacters: characters, log: 'Personagem não encontrado.' };

    const char = { ...list[index] };
    const slots = { ...char.spellSlots };
    if (!slots[level] || slots[level].used <= 0) {
      return { updatedCharacters: characters, log: `Nenhum espaço gasto para restaurar de ${level}º nível.` };
    }

    slots[level] = { ...slots[level], used: slots[level].used - 1 };
    char.spellSlots = slots;
    list[index] = char;
    this.saveToStorage(list);

    const remaining = slots[level].max - slots[level].used;
    const log = `${char.name} recuperou 1 espaço de magia de ${level}º nível. Restantes: ${remaining}/${slots[level].max}.`;
    return { updatedCharacters: list, log };
  }

  public static toggleCondition(
    characters: Character[],
    characterId: string,
    condition: Condition
  ): { updatedCharacters: Character[]; log: string } {
    const list = [...characters];
    const index = list.findIndex(c => c.id === characterId);
    if (index === -1) return { updatedCharacters: characters, log: 'Personagem não encontrado.' };

    const char = { ...list[index] };
    const exists = char.conditions.includes(condition);
    if (exists) {
      char.conditions = char.conditions.filter(c => c !== condition);
    } else {
      char.conditions = [...char.conditions, condition];
    }

    list[index] = char;
    this.saveToStorage(list);

    const log = `${char.name}: condição '${condition}' foi ${exists ? 'removida' : 'aplicada'}.`;
    return { updatedCharacters: list, log };
  }

  public static performLongRest(characters: Character[]): { updatedCharacters: Character[]; log: string } {
    const list = characters.map(c => {
      // Restaura HP total
      const maxHp = c.maxHp;
      // Recupera metade dos dados de vida totais (mínimo 1)
      const diceToRecover = Math.max(1, Math.floor(c.hitDiceTotal / 2));
      const newHitDiceUsed = Math.max(0, c.hitDiceUsed - diceToRecover);
      
      // Restaura todos os espaços de magia
      const restoredSlots = { ...c.spellSlots };
      for (const lvl in restoredSlots) {
        restoredSlots[lvl] = { ...restoredSlots[lvl], used: 0 };
      }

      // Remove exaustão (1 nível) ou condições temporárias
      const newConditions = c.conditions.filter(cond => cond !== 'Inconsciente');

      return {
        ...c,
        currentHp: maxHp,
        tempHp: 0,
        hitDiceUsed: newHitDiceUsed,
        spellSlots: restoredSlots,
        deathSaves: { successes: 0, failures: 0 },
        conditions: newConditions
      };
    });

    this.saveToStorage(list);
    const log = `O grupo completou um DESCANSO LONGO. Todos os pontos de vida foram restaurados, espaços de magia recarregados e dados de vida recuperados.`;
    return { updatedCharacters: list, log };
  }

  public static rollCheck(
    char: Character,
    checkName: string,
    mode: 'normal' | 'vantagem' | 'desvantagem' = 'normal'
  ): { d20: number; d20Extra?: number; modifier: number; total: number; breakdown: string } {
    const rollD20 = () => Math.floor(Math.random() * 20) + 1;
    const r1 = rollD20();
    let d20 = r1;
    let d20Extra: number | undefined;

    if (mode === 'vantagem') {
      const r2 = rollD20();
      d20Extra = r2;
      d20 = Math.max(r1, r2);
    } else if (mode === 'desvantagem') {
      const r2 = rollD20();
      d20Extra = r2;
      d20 = Math.min(r1, r2);
    }

    let modifier = 0;
    const checkKey = checkName.toLowerCase().replace(/\s+/g, '_') as SkillName;

    if (SKILL_ABILITY_MAP[checkKey]) {
      modifier = getSkillModifier(char, checkKey);
    } else if (['for', 'des', 'con', 'int', 'sab', 'car'].includes(checkKey)) {
      modifier = getSavingThrowModifier(char, checkKey as AbilityName);
    } else {
      modifier = getAbilityModifier(char.baseAbilities.for);
    }

    const total = d20 + modifier;
    const sign = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const modeLabel = mode !== 'normal' ? ` (${mode}: [${r1}, ${d20Extra}])` : '';
    const breakdown = `d20 (${d20})${modeLabel} ${sign} = ${total}`;

    return { d20, d20Extra, modifier, total, breakdown };
  }
}
