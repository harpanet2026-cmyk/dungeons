import {
  Character,
  AbilityScores,
  AbilityName,
  SkillName,
  Alignment,
  Item,
  Spell,
  SpellSlots
} from '../types/dnd';
import {
  PHB_RACES,
  PHB_CLASSES,
  PHB_BACKGROUNDS,
  PHB_SPELLS_L0_L1,
  CLERIC_DOMAINS,
  SORCERER_ORIGINS,
  WARLOCK_PATRONS
} from './characterCreationData';
import {
  getAbilityModifier,
  calculateArmorClass,
  calculateLevel1Hp
} from './calculations';
import { COMMON_ARMORS, COMMON_WEAPONS, getClassPortrait } from './srdData';

export interface RandomHeroOptions {
  name?: string;
  class?: string;
  race?: string;
  gender?: 'masculino' | 'feminino';
  background?: string;
  alignment?: Alignment;
}

// ==========================================
// BANCO DE NOMES DE FANTASIA POR RAÇA E GÊNERO
// ==========================================
const NAMES_BY_RACE: Record<string, { masc: string[]; fem: string[]; surnames: string[] }> = {
  Anão: {
    masc: ['Thorin', 'Morgran', 'Balin', 'Dwalin', 'Bruenor', 'Thrum', 'Barundar', 'Kildrak', 'Rurik', 'Vondal', 'Torin', 'Flint'],
    fem: ['Helga', 'Vistra', 'Kathra', 'Dagnal', 'Bardryn', 'Diesa', 'Gurdis', 'Mardred', 'Torbera', 'Ilde'],
    surnames: ['Barba-de-Ferro', 'Escudo-de-Carvalho', 'Machado-Brilhante', 'Martelo-de-Guerra', 'Forja-Profunda', 'Quebra-Pedra', 'Pedra-Negra']
  },
  Elfo: {
    masc: ['Drizzt', 'Varis', 'Eldrin', 'Legolas', 'Theramis', 'Enna', 'Erdan', 'Heian', 'Lucan', 'Peren', 'Sylvan', 'Faelar'],
    fem: ['Lyra', 'Erelynn', 'Caelynn', 'Arwen', 'Thalia', 'Keyleth', 'Shava', 'Vadania', 'Valanthe', 'Lia', 'Sariel'],
    surnames: ['Cantolunar', 'Folha-de-Prata', 'Sussurro-dos-Ventos', 'Olhos-de-Estrela', 'Dança-das-Sombras', 'Raio-Verde', 'Brisa-Feérica']
  },
  Halfling: {
    masc: ['Alton', 'Corrin', 'Eldon', 'Milo', 'Osborn', 'Pippin', 'Merry', 'Roscoe', 'Wellby', 'Finnick'],
    fem: ['Bree', 'Callie', 'Merla', 'Vani', 'Kithri', 'Nedda', 'Paela', 'Portia', 'Seraphina', 'Tilly'],
    surnames: ['Pé-Ligeiro', 'Chá-Verde', 'Colina-Verde', 'Barriga-Farta', 'Manto-Quente', 'Salto-Leve', 'Folha-Doce']
  },
  Humano: {
    masc: ['Roderic', 'Valerius', 'Kaelen', 'Cedric', 'Marcus', 'Roland', 'Gareth', 'Tristan', 'Lucian', 'Alistair', 'Garrett', 'Boran'],
    fem: ['Helena', 'Elenor', 'Rowena', 'Morgana', 'Althea', 'Vivienne', 'Beatrice', 'Diane', 'Isolde', 'Seraphina', 'Lyanna'],
    surnames: ['Corvo-Negro', 'Espada-de-Aço', 'Falcão-Bravo', 'Valente', 'Coração-Leão', 'Alvorada', 'Guarda-Real', 'Fronteira-Norte']
  },
  Draconato: {
    masc: ['Balasar', 'Donaar', 'Ghesh', 'Medrash', 'Rhogar', 'Torinn', 'Bharash', 'Heskan', 'Kriv', 'Patrin'],
    fem: ['Akra', 'Kava', 'Sora', 'Mishann', 'Nala', 'Perra', 'Raiann', 'Surina', 'Thava', 'Uadjit'],
    surnames: ['Presa-de-Dragão', 'Escama-Rubra', 'Fôlego-de-Fogo', 'Garra-de-Mithral', 'Asa-de-Trovão', 'Coração-Dracônico']
  },
  Gnomo: {
    masc: ['Boddynock', 'Dimble', 'Fonkin', 'Gerbo', 'Gimble', 'Alston', 'Kellen', 'Namfoodle', 'Seebo', 'Wrenn'],
    fem: ['Bimpnottin', 'Breena', 'Caramip', 'Donella', 'Duvamil', 'Ella', 'Lilli', 'Loopmottin', 'Mardnab', 'Roywyn'],
    surnames: ['Engrenagem-Rápida', 'Fagulha-Viva', 'Mola-Dourada', 'Relógio-Mágico', 'Frasco-de-Cobre', 'Pó-de-Estrelas']
  },
  'Meio-Elfo': {
    masc: ['Kaelen', 'Darvin', 'Brandon', 'Theron', 'Gavin', 'Eredin', 'Dallan', 'Maelor', 'Lucas'],
    fem: ['Alys', 'Cynthia', 'Faye', 'Liandra', 'Miriel', 'Elowen', 'Tanya', 'Jasmine', 'Selene'],
    surnames: ['Passo-Livre', 'Ventos-do-Sul', 'Luar-Tranquilo', 'Alma-Errante', 'Gavião-Prateado']
  },
  'Meio-Orc': {
    masc: ['Dench', 'Feng', 'Gell', 'Henk', 'Krusk', 'Mhurren', 'Ront', 'Thokk', 'Brak', 'Gorg'],
    fem: ['Baggi', 'Shautha', 'Vola', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Sutha', 'Yevelda'],
    surnames: ['Rasga-Carne', 'Presa-Forte', 'Quebra-Crânio', 'Fúria-de-Sangue', 'Punho-de-Pedra', 'Garra-de-Lobo']
  },
  Tiefling: {
    masc: ['Akmenos', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Pelaios', 'Therai'],
    fem: ['Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna'],
    surnames: ['Cinza-Eterna', 'Meia-Noite', 'Fogo-Infernal', 'Sombra-da-Noite', 'Lamento', 'Desespero', 'Chama-Negra']
  }
};

const ALIGNMENTS: Alignment[] = [
  'Leal e Bom',
  'Neutro e Bom',
  'Caótico e Bom',
  'Leal e Neutro',
  'Neutro',
  'Caótico e Neutro'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Distribuição recomendada de atributos para cada classe (Standard Array: 15, 14, 13, 12, 10, 8)
const CLASS_ABILITY_PRIORITIES: Record<string, AbilityName[]> = {
  Guerreiro: ['for', 'con', 'des', 'sab', 'int', 'car'],
  Bárbaro: ['for', 'con', 'des', 'sab', 'car', 'int'],
  Paladino: ['for', 'car', 'con', 'sab', 'des', 'int'],
  Ladino: ['des', 'con', 'int', 'car', 'sab', 'for'],
  Patrulheiro: ['des', 'sab', 'con', 'for', 'int', 'car'],
  Monge: ['des', 'sab', 'con', 'for', 'int', 'car'],
  Mago: ['int', 'con', 'des', 'sab', 'car', 'for'],
  Bruxo: ['car', 'con', 'des', 'sab', 'int', 'for'],
  Feiticeiro: ['car', 'con', 'des', 'sab', 'int', 'for'],
  Bardo: ['car', 'des', 'con', 'sab', 'int', 'for'],
  Clérigo: ['sab', 'con', 'for', 'des', 'int', 'car'],
  Druida: ['sab', 'con', 'des', 'int', 'car', 'for']
};

/**
 * Gera um herói oficial de D&D 5e completo e 100% equilibrado em 1 clique
 */
export function generateRandomHero(options: RandomHeroOptions = {}): Character {
  // 1. Gênero
  const gender: 'masculino' | 'feminino' = options.gender || (Math.random() > 0.5 ? 'masculino' : 'feminino');

  // 2. Raça & Sub-raça
  const availableRaceKeys = Object.keys(PHB_RACES);
  const raceKey = options.race && PHB_RACES[options.race] ? options.race : getRandomElement(availableRaceKeys);
  const raceDef = PHB_RACES[raceKey] || PHB_RACES['Humano'];
  const subraceDef = raceDef.subraces && raceDef.subraces.length > 0
    ? getRandomElement(raceDef.subraces)
    : undefined;

  // 3. Classe
  const availableClassKeys = Object.keys(PHB_CLASSES);
  const classKey = options.class && PHB_CLASSES[options.class] ? options.class : getRandomElement(availableClassKeys);
  const classDef = PHB_CLASSES[classKey] || PHB_CLASSES['Guerreiro'];

  // 4. Subclasse de Nível 1 (se a classe exigir)
  let subclassKey: string | undefined = undefined;
  if (classKey === 'Clérigo') {
    subclassKey = getRandomElement(CLERIC_DOMAINS).name;
  } else if (classKey === 'Bruxo') {
    subclassKey = getRandomElement(WARLOCK_PATRONS).name;
  } else if (classKey === 'Feiticeiro') {
    subclassKey = getRandomElement(SORCERER_ORIGINS).name;
  }

  // 5. Antecedente
  const availableBgKeys = Object.keys(PHB_BACKGROUNDS);
  const bgKey = options.background && PHB_BACKGROUNDS[options.background] ? options.background : getRandomElement(availableBgKeys);
  const bgDef = PHB_BACKGROUNDS[bgKey] || PHB_BACKGROUNDS['Soldado'];

  // 6. Alinhamento
  const alignment = options.alignment || getRandomElement(ALIGNMENTS);

  // 7. Nome de Fantasia Coerente
  let charName = options.name?.trim();
  if (!charName) {
    const namePool = NAMES_BY_RACE[raceKey] || NAMES_BY_RACE['Humano'];
    const firstName = gender === 'feminino' ? getRandomElement(namePool.fem) : getRandomElement(namePool.masc);
    const surname = getRandomElement(namePool.surnames);
    charName = `${firstName} ${surname}`;
  }

  // 8. Atributos Base: Standard Array otimizado por Classe
  const standardArray = [15, 14, 13, 12, 10, 8];
  const priorityList = CLASS_ABILITY_PRIORITIES[classKey] || ['for', 'con', 'des', 'sab', 'int', 'car'];
  const baseScores: AbilityScores = {
    for: 10,
    des: 10,
    con: 10,
    int: 10,
    sab: 10,
    car: 10
  };

  priorityList.forEach((ab, idx) => {
    baseScores[ab] = standardArray[idx] || 10;
  });

  // Bônus Raciais
  const finalAbilities: AbilityScores = {
    for: baseScores.for + (raceDef.baseAbilityBonuses.for || 0) + (subraceDef?.abilityBonuses?.for || 0),
    des: baseScores.des + (raceDef.baseAbilityBonuses.des || 0) + (subraceDef?.abilityBonuses?.des || 0),
    con: baseScores.con + (raceDef.baseAbilityBonuses.con || 0) + (subraceDef?.abilityBonuses?.con || 0),
    int: baseScores.int + (raceDef.baseAbilityBonuses.int || 0) + (subraceDef?.abilityBonuses?.int || 0),
    sab: baseScores.sab + (raceDef.baseAbilityBonuses.sab || 0) + (subraceDef?.abilityBonuses?.sab || 0),
    car: baseScores.car + (raceDef.baseAbilityBonuses.car || 0) + (subraceDef?.abilityBonuses?.car || 0),
  };

  // Se Meio-Elfo (+1 em 2 atributos à escolha)
  if (raceDef.hasFlexibleAbilityBonus) {
    finalAbilities.con += 1;
    finalAbilities.des += 1;
  }

  // 9. Pontos de Vida (HP Nível 1)
  const conMod = getAbilityModifier(finalAbilities.con);
  const hpBonusRacial = (subraceDef?.id === 'sub_anao_colina') ? 1 : 0;
  const hpBonusClass = (subclassKey?.includes('Dracônica')) ? 1 : 0;
  const maxHp = Math.max(1, classDef.hitDieValue + conMod + hpBonusRacial + hpBonusClass);

  // 10. Perícias
  const proficientSkills = new Set<SkillName>();
  // Perícias do Antecedente
  (bgDef.skillProficiencies || []).forEach(sk => proficientSkills.add(sk));
  // Perícias da Raça
  (raceDef.freeSkills || []).forEach(sk => proficientSkills.add(sk));
  if (subraceDef?.proficiencies?.skills) {
    subraceDef.proficiencies.skills.forEach(sk => proficientSkills.add(sk));
  }
  // Perícias da Classe (sem duplicar)
  const availableClassSkills = (classDef.skillChoices.options || []).filter(sk => !proficientSkills.has(sk));
  const chosenClassSkills = getRandomElements(availableClassSkills, classDef.skillChoices.count);
  chosenClassSkills.forEach(sk => proficientSkills.add(sk));

  const skillProficienciesList = Array.from(proficientSkills);
  const skillExpertiseList: SkillName[] = classKey === 'Ladino'
    ? getRandomElements(skillProficienciesList.filter(s => s === 'furtividade' || s === 'prestidigitacao' || s === 'percepcao' || s === 'atletismo'), 2)
    : [];

  // 11. Equipamento Inicial & Armaduras
  const allInventory: Item[] = [];

  // Itens fixos do Antecedente
  if (bgDef.fixedEquipment) {
    allInventory.push(...bgDef.fixedEquipment);
  }

  // Itens fixos da Classe
  if (classDef.fixedStartingEquipment) {
    allInventory.push(...classDef.fixedStartingEquipment);
  }

  // Escolhas de Equipamento da Classe (Pega primeira opção de cada ramo)
  let equippedArmorItem: Item | undefined = undefined;
  let equippedShieldItem: Item | undefined = undefined;
  const equippedWeapons: Item[] = [];

  if (classDef.startingEquipmentChoices) {
    classDef.startingEquipmentChoices.forEach(choiceGroup => {
      const selectedOption = choiceGroup.options[0];
      if (selectedOption && selectedOption.items) {
        selectedOption.items.forEach(it => {
          allInventory.push(it);
          if (it.type === 'armadura' && it.armorType !== 'escudo' && !equippedArmorItem) {
            equippedArmorItem = { ...it, isEquipped: true };
          }
          if (it.armorType === 'escudo' && !equippedShieldItem) {
            equippedShieldItem = { ...it, isEquipped: true };
          }
          if (it.type === 'arma' && equippedWeapons.length < 2) {
            equippedWeapons.push({ ...it, isEquipped: true });
          }
        });
      }
    });
  }

  // Se não veio arma padrão
  if (equippedWeapons.length === 0) {
    const defaultWpn: Item = classKey === 'Mago'
      ? { id: 'eq_bordao', name: 'Bordão Mágico', quantity: 1, weight: 2, type: 'arma', damage: '1d6', damageType: 'concussão', isEquipped: true }
      : { id: 'eq_espada_longa', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8', damageType: 'cortante', isEquipped: true };
    equippedWeapons.push(defaultWpn);
    allInventory.push(defaultWpn);
  }

  // 12. Magias de Nível 1 se for Conjurador
  const preparedSpells: Spell[] = [];
  const spellSlots: SpellSlots = {};

  if (classDef.spellSlotsL1) {
    Object.entries(classDef.spellSlotsL1).forEach(([lvl, count]) => {
      spellSlots[Number(lvl)] = { max: count, used: 0 };
    });
  }

  if (classDef.spellcastingAbility) {
    const relevantSpells = PHB_SPELLS_L0_L1.filter(sp => {
      // Magias acessíveis pela classe
      return true;
    });

    const cantripsPool = relevantSpells.filter(sp => sp.level === 0);
    const l1SpellsPool = relevantSpells.filter(sp => sp.level === 1);

    const cantripsCount = classDef.cantripsKnownAtL1 || 2;
    const l1Count = classDef.spellsKnownAtL1 || (classKey === 'Mago' ? 6 : 2);

    preparedSpells.push(...getRandomElements(cantripsPool, cantripsCount));
    preparedSpells.push(...getRandomElements(l1SpellsPool, l1Count));
  }

  // 13. Notas Ricas e Traços
  const traitNotes = [
    `[Raça: ${raceKey}${subraceDef ? ` (${subraceDef.name})` : ''}]`,
    `[Traços Raciais: ${(raceDef.traits || []).concat(subraceDef?.traits || []).join('; ')}]`,
    subclassKey ? `[Arquétipo/Domínio: ${subclassKey}]` : '',
    `[Característica do Antecedente: ${bgDef.feature.name} - ${bgDef.feature.description}]`,
    `[Idiomas: ${raceDef.languages.join(', ')}]`
  ].filter(Boolean).join('\n\n');

  // 14. Personalidade
  const personalityTraits = [
    getRandomElement(bgDef.suggestedTraits || ['Sempre tenho um plano para sair de apuros.']),
    getRandomElement(bgDef.suggestedTraits || ['Ação rápida supera hesitação desnecessária.'])
  ];
  const ideal = getRandomElement(bgDef.suggestedIdeals || ['Liberdade: Todos os povos merecem viver sem tirania.']);
  const bond = getRandomElement(bgDef.suggestedBonds || ['Minha lealdade aos meus companheiros de batalha é eterna.']);
  const flaw = getRandomElement(bgDef.suggestedFlaws || ['Tenho dificuldade em recuar mesmo quando as chances são impossíveis.']);

  // Retrato Oficial
  const avatarUrl = getClassPortrait(classKey, gender);

  const character: Character = {
    id: `hero_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: charName,
    player: 'Jogador',
    race: raceKey,
    subrace: subraceDef?.name,
    class: classKey,
    subclass: subclassKey,
    level: 1,
    xp: 0,
    alignment,
    background: bgKey,
    gender,
    baseAbilities: finalAbilities,
    savingThrowProficiencies: classDef.savingThrows,
    skillProficiencies: skillProficienciesList,
    skillExpertise: skillExpertiseList,
    maxHp,
    currentHp: maxHp,
    tempHp: 0,
    hitDie: classDef.hitDie,
    hitDiceTotal: 1,
    hitDiceUsed: 0,
    deathSaves: { successes: 0, failures: 0 },
    speed: subraceDef?.speed || raceDef.baseSpeed || 9,
    hasInspiration: false,
    equippedArmor: equippedArmorItem,
    equippedShield: equippedShieldItem,
    weapons: equippedWeapons,
    spellcastingAbility: classDef.spellcastingAbility,
    spellSlots,
    spells: preparedSpells,
    inventory: allInventory,
    coins: {
      pc: Math.floor(Math.random() * 20),
      pp: Math.floor(Math.random() * 10),
      pe: 0,
      po: bgDef.startingGold || 15,
      pl: 0
    },
    personality: {
      traits: personalityTraits,
      ideals: ideal,
      bonds: bond,
      flaws: flaw,
      backstory: `Treinado nas tradições da classe ${classKey} e moldado pelos desafios do antecedente ${bgKey}. Um aventureiro destemido pronto para forjar sua lenda nos Reinos Esquecidos.`,
      secretsOrHooks: 'Carrega um medalhão com runas antigas que começa a ressonar em masmorras profundas.'
    },
    conditions: [],
    notes: traitNotes,
    avatarUrl
  };

  return character;
}
