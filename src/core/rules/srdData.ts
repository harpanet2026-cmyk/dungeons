import { AbilityName, SkillName, Alignment, Item, Spell } from '../types/dnd';

export interface ClassDefinition {
  name: string;
  hitDie: string;
  hitDieValue: number;
  primaryAbilities: AbilityName[];
  savingThrows: AbilityName[];
  spellcastingAbility?: AbilityName;
  armorProficiencies: string[];
  weaponProficiencies: string[];
  description: string;
  suggestedRoles: ('Tank' | 'DPS' | 'Healer' | 'Control' | 'Utility' | 'Support')[];
  imageUrl?: string;
}

export const getClassPortrait = (className: string, gender: string = 'masculino'): string => {
  const c = (className || '').toLowerCase().trim();
  const isFem = (gender || '').toLowerCase().includes('fem') || (gender || '').toLowerCase() === 'f';
  const suffix = isFem ? '_f.jpeg' : '.jpeg';
  if (c.includes('paladino')) return `/artes/paladino${suffix}`;
  if (c.includes('ladino')) return `/artes/ladino${suffix}`;
  if (c.includes('mago')) return `/artes/mago${suffix}`;
  if (c.includes('guerreiro')) return `/artes/guerreiro${suffix}`;
  if (c.includes('clérigo') || c.includes('clerigo')) return `/artes/clerigo${suffix}`;
  if (c.includes('bárbaro') || c.includes('barbaro')) return `/artes/barbaro${suffix}`;
  if (c.includes('bardo')) return `/artes/bardo${suffix}`;
  if (c.includes('patrulheiro') || c.includes('ranger')) return `/artes/patrulheiro${suffix}`;
  if (c.includes('druida')) return `/artes/druida${suffix}`;
  if (c.includes('monge')) return `/artes/monge${suffix}`;
  if (c.includes('bruxo')) return `/artes/bruxo${suffix}`;
  if (c.includes('feiticeiro')) return `/artes/feiticeiro${suffix}`;
  return `/artes/guerreiro${suffix}`;
};

export interface RaceDefinition {
  name: string;
  abilityBonuses: Partial<Record<AbilityName, number>>;
  speed: number;
  hasDarkvision: boolean;
  traits: string[];
  description: string;
}

export interface BackgroundDefinition {
  name: string;
  skillProficiencies: SkillName[];
  toolProficiencies?: string[];
  feature: string;
  description: string;
}

export const CLASSES_5E: Record<string, ClassDefinition> = {
  Guerreiro: {
    name: 'Guerreiro',
    hitDie: '1d10',
    hitDieValue: 10,
    primaryAbilities: ['for', 'des'],
    savingThrows: ['for', 'con'],
    armorProficiencies: ['Todas as armaduras', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    description: 'Mestre do combate marcial, perito com uma variedade de armas e armaduras.',
    suggestedRoles: ['Tank', 'DPS'],
    imageUrl: '/artes/guerreiro.jpeg'
  },
  Mago: {
    name: 'Mago',
    hitDie: '1d6',
    hitDieValue: 6,
    primaryAbilities: ['int'],
    savingThrows: ['int', 'sab'],
    spellcastingAbility: 'int',
    armorProficiencies: ['Nenhuma'],
    weaponProficiencies: ['Adagas', 'Dardos', 'Fundas', 'Bordões', 'Bestas leves'],
    description: 'Conjurador erudito capaz de manipular a própria estrutura da realidade através de feitiços arcanos.',
    suggestedRoles: ['Control', 'DPS', 'Utility'],
    imageUrl: '/artes/mago.jpeg'
  },
  Ladino: {
    name: 'Ladino',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['des'],
    savingThrows: ['des', 'int'],
    armorProficiencies: ['Armaduras leves'],
    weaponProficiencies: ['Armas simples', 'Bestas de mão', 'Espadas longas', 'Rapieiras', 'Espadas curtas'],
    description: 'Especialista em furtividade, precisão cirúrgica e resolução engenhosa de problemas.',
    suggestedRoles: ['DPS', 'Utility'],
    imageUrl: '/artes/ladino.jpeg'
  },
  Clérigo: {
    name: 'Clérigo',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['sab'],
    savingThrows: ['sab', 'car'],
    spellcastingAbility: 'sab',
    armorProficiencies: ['Armaduras leves', 'Armaduras médias', 'Escudos'],
    weaponProficiencies: ['Armas simples'],
    description: 'Campeão sacerdotal que empunha magia divina e canaliza o poder de sua divindade.',
    suggestedRoles: ['Healer', 'Support', 'Tank'],
    imageUrl: '/artes/clerigo.jpeg'
  },
  Bárbaro: {
    name: 'Bárbaro',
    hitDie: '1d12',
    hitDieValue: 12,
    primaryAbilities: ['for', 'con'],
    savingThrows: ['for', 'con'],
    armorProficiencies: ['Armaduras leves', 'Armaduras médias', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    description: 'Guerreiro feroz guiado por instinto primal e fúria em combate.',
    suggestedRoles: ['Tank', 'DPS'],
    imageUrl: '/artes/barbaro.jpeg'
  },
  Bardo: {
    name: 'Bardo',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['car', 'des'],
    savingThrows: ['des', 'car'],
    spellcastingAbility: 'car',
    armorProficiencies: ['Armaduras leves'],
    weaponProficiencies: ['Armas simples', 'Bestas de mão', 'Espadas longas', 'Rapieiras', 'Espadas curtas'],
    description: 'Mestre da canção e da magia, capaz de inspirar aliados e manipular inimigos.',
    suggestedRoles: ['Support', 'Control', 'Utility'],
    imageUrl: '/artes/bardo.jpeg'
  },
  Paladino: {
    name: 'Paladino',
    hitDie: '1d10',
    hitDieValue: 10,
    primaryAbilities: ['for', 'car'],
    savingThrows: ['sab', 'car'],
    spellcastingAbility: 'car',
    armorProficiencies: ['Todas as armaduras', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    description: 'Guerreiro santo juramentado a defender a justiça com espada e milagre.',
    suggestedRoles: ['Tank', 'DPS', 'Healer'],
    imageUrl: '/artes/paladino.jpeg'
  },
  Patrulheiro: {
    name: 'Patrulheiro',
    hitDie: '1d10',
    hitDieValue: 10,
    primaryAbilities: ['des', 'sab'],
    savingThrows: ['for', 'des'],
    spellcastingAbility: 'sab',
    armorProficiencies: ['Armaduras leves', 'Armaduras médias', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    description: 'Guerreiro dos ermos, rastreador supremo e protetor das fronteiras selvagens.',
    suggestedRoles: ['DPS', 'Utility'],
    imageUrl: '/artes/patrulheiro.jpeg'
  },
  Druida: {
    name: 'Druida',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['sab'],
    savingThrows: ['int', 'sab'],
    spellcastingAbility: 'sab',
    armorProficiencies: ['Armaduras leves', 'Armaduras médias (não-metálicas)', 'Escudos'],
    weaponProficiencies: ['Clavas', 'Adagas', 'Dardos', 'Azagaias', 'Maças', 'Bordões', 'Cimitarras', 'Foices', 'Fundas', 'Lanças'],
    description: 'Guardião das forças naturais e mestre da metamorfose selvagem.',
    suggestedRoles: ['Control', 'Healer', 'Utility', 'Tank'],
    imageUrl: '/artes/druida.jpeg'
  },
  Monge: {
    name: 'Monge',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['des', 'sab'],
    savingThrows: ['for', 'des'],
    armorProficiencies: ['Nenhuma'],
    weaponProficiencies: ['Armas simples', 'Espadas curtas'],
    description: 'Praticante de artes marciais que canaliza energia Ki corporal.',
    suggestedRoles: ['DPS', 'Control'],
    imageUrl: '/artes/monge.jpeg'
  },
  Bruxo: {
    name: 'Bruxo',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['car'],
    savingThrows: ['sab', 'car'],
    spellcastingAbility: 'car',
    armorProficiencies: ['Armaduras leves'],
    weaponProficiencies: ['Armas simples'],
    description: 'Portador de segredos arcanos outorgados por um patrono extraplanar.',
    suggestedRoles: ['DPS', 'Control'],
    imageUrl: '/artes/bruxo.jpeg'
  },
  Feiticeiro: {
    name: 'Feiticeiro',
    hitDie: '1d6',
    hitDieValue: 6,
    primaryAbilities: ['car', 'con'],
    savingThrows: ['con', 'car'],
    spellcastingAbility: 'car',
    armorProficiencies: ['Nenhuma'],
    weaponProficiencies: ['Adagas', 'Dardos', 'Fundas', 'Bordões', 'Bestas leves'],
    description: 'Conjurador cujo poder mágico flui de sua linhagem mágica ou anomalia cósmica.',
    suggestedRoles: ['DPS', 'Control'],
    imageUrl: '/artes/feiticeiro.jpeg'
  }
};

export const RACES_5E: Record<string, RaceDefinition> = {
  Humano: {
    name: 'Humano',
    abilityBonuses: { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    speed: 9,
    hasDarkvision: false,
    traits: ['Versatilidade: +1 em todos os atributos', 'Idioma adicional'],
    description: 'A raça mais adaptável e ambiciosa entre os povos comuns.'
  },
  Elfo: {
    name: 'Elfo (Alto Elfo)',
    abilityBonuses: { des: 2, int: 1 },
    speed: 9,
    hasDarkvision: true,
    traits: ['Visão no Escuro (18m)', 'Sentidos Aguçados (Percepção)', 'Ancestralidade Feérica (imune a sono mágico)', 'Transe', 'Truque Arcano'],
    description: 'Povo mágico gracioso com profunda conexão com a arte e o arcano.'
  },
  Anão: {
    name: 'Anão (da Colina)',
    abilityBonuses: { con: 2, sab: 1 },
    speed: 7.5,
    hasDarkvision: true,
    traits: ['Visão no Escuro (18m)', 'Resiliência dos Anões (resistência a veneno)', 'Tenacidade dos Anões (+1 HP por nível)', 'Treinamento em Combate'],
    description: 'Guerreiros e ferreiros resolutos, forjados nas entranhas das montanhas.'
  },
  Halfling: {
    name: 'Halfling (Pés-Leves)',
    abilityBonuses: { des: 2, car: 1 },
    speed: 7.5,
    hasDarkvision: false,
    traits: ['Sortudo (rerola 1 natural em d20)', 'Bravo (vantagem contra amedrontado)', 'Agilidade Halfling', 'Furtividade Natural'],
    description: 'Povo pequeno e engenhoso que valoriza a paz, conforto e sorte.'
  },
  'Meio-Orc': {
    name: 'Meio-Orc',
    abilityBonuses: { for: 2, con: 1 },
    speed: 9,
    hasDarkvision: true,
    traits: ['Visão no Escuro (18m)', 'Intimidação Ameaçadora', 'Resistência Implacável (cai para 1 HP em vez de 0 uma vez por dia)', 'Ataques Selvagens (dado extra em crítico)'],
    description: 'Guerreiros tenazes que combinam a inteligência humana com a fúria orc.'
  },
  Tiefling: {
    name: 'Tiefling',
    abilityBonuses: { car: 2, int: 1 },
    speed: 9,
    hasDarkvision: true,
    traits: ['Visão no Escuro (18m)', 'Resistência Infernal (resistência a fogo)', 'Legado Infernal (Taumaturgia, Repreensão Infernal)'],
    description: 'Herdeiros de um pacto diabólico antigo que exibe chifres e cauda.'
  },
  Draconato: {
    name: 'Draconato',
    abilityBonuses: { for: 2, car: 1 },
    speed: 9,
    hasDarkvision: false,
    traits: ['Arma de Sopro elemental', 'Resistência a Dano elemental correspondente'],
    description: 'Nascidos de dragões, orgulhosos e comprometidos com a honra e seu clã.'
  }
};

export const BACKGROUNDS_5E: Record<string, BackgroundDefinition> = {
  Acólito: {
    name: 'Acólito',
    skillProficiencies: ['intuicao', 'religiao'],
    feature: 'Abrigo dos Fiéis (hospedagem e cura em templos da sua divindade)',
    description: 'Dedicou sua vida ao serviço de um templo ou panteão divino.'
  },
  Criminoso: {
    name: 'Criminoso',
    skillProficiencies: ['enganacao', 'furtividade'],
    toolProficiencies: ['Ferramentas de Ladrão', 'Kit de Jogo'],
    feature: 'Contato Criminoso (rede de informantes e contrabandistas)',
    description: 'Viveu fora da lei, aprendendo a sobreviver nas sombras urbanas.'
  },
  'Herói do Povo': {
    name: 'Herói do Povo',
    skillProficiencies: ['adestrar_animais', 'sobrevivencia'],
    feature: 'Hospitalidade Rústica (plebeus e camponeses dão abrigo e comida)',
    description: 'Origem humilde que se ergueu para desafiar tiranos ou monstros locais.'
  },
  Nobre: {
    name: 'Nobre',
    skillProficiencies: ['historia', 'persuasao'],
    feature: 'Posição de Privilégio (bem-vindo na alta sociedade e cortes)',
    description: 'Criado entre privilégios, etiqueta e linhagens de poder político.'
  },
  Sábio: {
    name: 'Sábio',
    skillProficiencies: ['arcanismo', 'historia'],
    feature: 'Pesquisador (sabe exatamente onde encontrar informações obscuras)',
    description: 'Passou anos em bibliotecas e monastérios desvendando segredos do cosmos.'
  },
  Soldado: {
    name: 'Soldado',
    skillProficiencies: ['atletismo', 'intimidacao'],
    feature: 'Patente Militar (reconhecimento e lealdade de tropas da sua ordem)',
    description: 'Treinado para a guerra e disciplinado pelo campo de batalha.'
  }
};

export const COMMON_ARMORS: Item[] = [
  { id: 'arm_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve' },
  { id: 'arm_couro_batido', name: 'Couro Batido', quantity: 1, weight: 6, type: 'armadura', armorBonus: 12, armorType: 'leve' },
  { id: 'arm_cota_malha', name: 'Camisa de Cota de Malha', quantity: 1, weight: 9, type: 'armadura', armorBonus: 13, armorType: 'media' },
  { id: 'arm_peitoral', name: 'Peitoral de Aço', quantity: 1, weight: 10, type: 'armadura', armorBonus: 14, armorType: 'media' },
  { id: 'arm_cota_talas', name: 'Cota de Talas', quantity: 1, weight: 20, type: 'armadura', armorBonus: 16, armorType: 'pesada', stealthDisadvantage: true },
  { id: 'arm_placas', name: 'Armadura de Placas', quantity: 1, weight: 25, type: 'armadura', armorBonus: 18, armorType: 'pesada', stealthDisadvantage: true },
  { id: 'arm_escudo', name: 'Escudo', quantity: 1, weight: 3, type: 'armadura', armorBonus: 2, armorType: 'escudo' },
];

export const COMMON_WEAPONS: Item[] = [
  { id: 'wpn_espada_longa', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', description: 'Versátil', imageUrl: '/artes/espada_longa.jpeg' },
  { id: 'wpn_espada_curta', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante', description: 'Acuidade, Leve', imageUrl: '/artes/espada_curta.jpeg' },
  { id: 'wpn_montante', name: 'Montante (Espadão)', quantity: 1, weight: 3, type: 'arma', damage: '2d6', damageType: 'cortante', description: 'Pesada, Duas Mãos', imageUrl: '/artes/montante.jpeg' },
  { id: 'wpn_cimitarra', name: 'Cimitarra', quantity: 1, weight: 1.5, type: 'arma', damage: '1d6', damageType: 'cortante', description: 'Acuidade, Leve', imageUrl: '/artes/cimitarra.jpeg' },
  { id: 'wpn_adaga', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante', description: 'Acuidade, Leve, Arremesso (6/18m)', imageUrl: '/artes/adaga.jpeg' },
  { id: 'wpn_machado_batalha', name: 'Machado de Batalha', quantity: 1, weight: 2, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', description: 'Versátil', imageUrl: '/artes/machado.jpeg' },
  { id: 'wpn_machado_grande', name: 'Machado Grande', quantity: 1, weight: 3.5, type: 'arma', damage: '1d12', damageType: 'cortante', description: 'Pesada, Duas mãos', imageUrl: '/artes/machado_grande.jpeg' },
  { id: 'wpn_martelo_combate', name: 'Martelo de Guerra', quantity: 1, weight: 2, type: 'arma', damage: '1d8/1d10', damageType: 'concussão', description: 'Versátil (1d10)', imageUrl: '/artes/martelo_de_guerra.jpeg' },
  { id: 'wpn_maca', name: 'Maça de Aço', quantity: 1, weight: 2, type: 'arma', damage: '1d6', damageType: 'concussão', description: 'Simples', imageUrl: '/artes/maca.jpeg' },
  { id: 'wpn_lanca', name: 'Lança', quantity: 1, weight: 1.5, type: 'arma', damage: '1d6/1d8', damageType: 'perfurante', description: 'Versátil, Arremesso (6/18m)', imageUrl: '/artes/lanca.jpeg' },
  { id: 'wpn_arco_curto', name: 'Arco Curto', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante', description: 'Munição (24/96m), Duas mãos', imageUrl: '/artes/arco_curto.jpeg' },
  { id: 'wpn_arco_longo', name: 'Arco Longo', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8', damageType: 'perfurante', description: 'Munição (45/180m), Pesada, Duas mãos', imageUrl: '/artes/arco_longo.jpg' },
  { id: 'wpn_besta_pesada', name: 'Besta Pesada', quantity: 1, weight: 4.5, type: 'arma', damage: '1d10', damageType: 'perfurante', description: 'Munição (30/120m), Recarga, Duas mãos', imageUrl: '/artes/besta_pesada.jpeg' },
  { id: 'wpn_besta_mao', name: 'Besta de Mão', quantity: 1, weight: 1.5, type: 'arma', damage: '1d6', damageType: 'perfurante', description: 'Leve, Munição (9/36m), Recarga', imageUrl: '/artes/besta_de_mao.jpeg' },
  { id: 'wpn_funda', name: 'Funda', quantity: 1, weight: 0.1, type: 'arma', damage: '1d4', damageType: 'concussão', description: 'Munição (9/36m)', imageUrl: '/artes/funda.jpeg' },
  { id: 'wpn_bordao', name: 'Bordão', quantity: 1, weight: 2, type: 'arma', damage: '1d6/1d8', damageType: 'concussão', description: 'Versátil', imageUrl: '/artes/lanca.jpeg' },
];

export const getWeaponImage = (nameOrId?: string): string => {
  if (!nameOrId) return '/artes/espada_longa.jpeg';
  const n = nameOrId.toLowerCase();
  if (n.includes('montante') || n.includes('espadão') || n.includes('espadao') || n.includes('greatsword')) return '/artes/montante.jpeg';
  if (n.includes('curta') || n.includes('shortsword')) return '/artes/espada_curta.jpeg';
  if (n.includes('espada') || n.includes('longsword')) return '/artes/espada_longa.jpeg';
  if (n.includes('adaga') || n.includes('dagger')) return '/artes/adaga.jpeg';
  if (n.includes('cimitarra') || n.includes('scimitar')) return '/artes/cimitarra.jpeg';
  if (n.includes('machado grande') || n.includes('greataxe')) return '/artes/machado_grande.jpeg';
  if (n.includes('machado') || n.includes('axe') || n.includes('machadinha')) return '/artes/machado.jpeg';
  if (n.includes('martelo') || n.includes('warhammer')) return '/artes/martelo_de_guerra.jpeg';
  if (n.includes('mangual') || n.includes('flail')) return '/artes/loja/mangual.jpeg';
  if (n.includes('maça') || n.includes('maca') || n.includes('mace')) return '/artes/maca.jpeg';
  if (n.includes('alabarda') || n.includes('halberd')) return '/artes/loja/alabarda.jpeg';
  if (n.includes('lança') || n.includes('lanca') || n.includes('spear')) return '/artes/lanca.jpeg';
  if (n.includes('besta de mão') || n.includes('besta de mao') || n.includes('hand crossbow')) return '/artes/besta_de_mao.jpeg';
  if (n.includes('besta pesada') || n.includes('heavy crossbow')) return '/artes/besta_pesada.jpeg';
  if (n.includes('besta') || n.includes('crossbow')) return '/artes/besta_pesada.jpeg';
  if (n.includes('arco longo') || n.includes('longbow')) return '/artes/arco_longo.jpg';
  if (n.includes('arco curto') || n.includes('shortbow')) return '/artes/arco_curto.jpeg';
  if (n.includes('arco') || n.includes('bow')) return '/artes/arco_curto.jpeg';
  if (n.includes('funda') || n.includes('sling')) return '/artes/funda.jpeg';
  if (n.includes('bordão') || n.includes('bordao') || n.includes('staff')) return '/artes/lanca.jpeg';
  return '/artes/espada_longa.jpeg';
};

export const SAMPLE_SPELLS: Spell[] = [
  {
    id: 'spl_raio_fogo',
    name: 'Raio de Fogo (Fire Bolt)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Atira um feixe de fogo num alvo. Ataque mágico à distância. Causa 1d10 de dano de fogo.',
    prepared: true
  },
  {
    id: 'spl_escudo_arcano',
    name: 'Escudo Arcano (Shield)',
    level: 1,
    school: 'Abjuração',
    castingTime: '1 reação',
    range: 'Pessoal',
    components: 'V, S',
    duration: '1 rodada',
    description: '+5 na CA até o início do seu próximo turno, e anula Mísseis Mágicos.',
    prepared: true
  },
  {
    id: 'spl_misseis_magicos',
    name: 'Mísseis Mágicos (Magic Missile)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Cria três dardos de força mágica brilhantes. Cada dardo atinge infalivelmente e causa 1d4 + 1 de dano de força.',
    prepared: true
  },
  {
    id: 'spl_curar_ferimentos',
    name: 'Curar Ferimentos (Cure Wounds)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Uma criatura que você tocar recupera PV igual a 1d8 + seu modificador de habilidade de conjuração.',
    prepared: true
  },
  {
    id: 'spl_palavra_curativa',
    name: 'Palavra Curativa (Healing Word)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação bônus',
    range: '18 metros',
    components: 'V',
    duration: 'Instantânea',
    description: 'Uma criatura visível recupera PV igual a 1d4 + modificador de conjuração.',
    prepared: true
  },
  {
    id: 'spl_bencao',
    name: 'Bênção (Bless)',
    level: 1,
    school: 'Encantamento',
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V, S, M',
    duration: 'Concentração, até 1 minuto',
    description: 'Abençoa até 3 criaturas. Ganham +1d4 em jogadas de ataque e salvaguardas.',
    prepared: true
  }
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
