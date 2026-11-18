import { AbilityName, SkillName, Alignment, Item, Spell } from '../types/dnd';

// ==========================================
// 1. IDIOMAS E FERRAMENTAS OFICIAIS (PHB)
// ==========================================

export const PHB_LANGUAGES = [
  'Comum',
  'Anão',
  'Élfico',
  'Gigante',
  'Gnômico',
  'Goblin',
  'Halfling',
  'Orc',
  'Abissal',
  'Celestial',
  'Dracônico',
  'Dialeto Subterrâneo',
  'Infernal',
  'Primordial',
  'Silvestre',
  'Subcomum'
];

export const ARTISAN_TOOLS = [
  'Ferramentas de Ferreiro',
  'Ferramentas de Cervejeiro',
  'Ferramentas de Pedreiro',
  'Ferramentas de Carpinteiro',
  'Ferramentas de Coureiro',
  'Ferramentas de Alfaiate',
  'Ferramentas de Sapateiro',
  'Ferramentas de Oleiro',
  'Ferramentas de Alquimista',
  'Suprimentos de Pintor',
  'Suprimentos de Calígrafo'
];

export const MUSICAL_INSTRUMENTS = [
  'Alaúde',
  'Flauta',
  'Gaita de Fole',
  'Lira',
  'Trombeta',
  'Tambor',
  'Flauta de Pã',
  'Violino',
  'Dulcímer'
];

export const GAMING_SETS = [
  'Jogo de Cartas Três Dragões',
  'Jogo de Dados',
  'Jogo de Xadrez de Dragão'
];

// ==========================================
// 2. RAÇAS E SUB-RAÇAS OFICIAIS (PHB CAP. 2)
// ==========================================

export interface SubraceData {
  id: string;
  name: string;
  description: string;
  abilityBonuses: Partial<Record<AbilityName, number>>;
  speed?: number;
  traits: string[];
  proficiencies?: {
    weapons?: string[];
    armor?: string[];
    tools?: string[];
    skills?: SkillName[];
  };
  innateSpell?: {
    spellId: string;
    spellName: string;
    ability: AbilityName;
    level: number;
    description: string;
  };
  hpBonusPerLevel?: number;
  chooseCantrip?: {
    classSource: 'Mago';
    ability: AbilityName;
  };
  chooseExtraLanguage?: boolean;
}

export interface RaceData {
  id: string;
  name: string;
  description: string;
  size: 'Médio' | 'Pequeno';
  baseSpeed: number;
  hasDarkvision: boolean;
  darkvisionRange?: number; // em metros
  baseAbilityBonuses: Partial<Record<AbilityName, number>>;
  languages: string[];
  traits: string[];
  freeSkills?: SkillName[];
  freeWeaponProficiencies?: string[];
  freeArmorProficiencies?: string[];
  subraces?: SubraceData[];
  innateSpell?: {
    spellId: string;
    spellName: string;
    ability: AbilityName;
    level: number;
    description: string;
  };
  
  // Escolhas especiais raciais
  hasFlexibleAbilityBonus?: boolean; // Meio-Elfo (+1 em 2 à escolha)
  flexibleAbilityCount?: number;
  flexibleSkillCount?: number; // Meio-Elfo ganha 2 perícias livres
  chooseExtraLanguage?: boolean; // Humano, Alto Elfo, Meio-Elfo
  chooseToolCategory?: 'dwarf_artisan'; // Anão escolhe 1 ferramenta
  hasDraconicAncestry?: boolean; // Draconato
}

export interface DraconicAncestryOption {
  color: string;
  damageType: string;
  breathWeapon: string;
  savingThrow: 'des' | 'con';
  area: string;
}

export const DRACONIC_ANCESTRIES: DraconicAncestryOption[] = [
  { color: 'Azul', damageType: 'Elétrico', breathWeapon: 'Linha de 1,5m por 9m (Salvação de DES)', savingThrow: 'des', area: 'Linha 1,5m x 9m' },
  { color: 'Branco', damageType: 'Frio', breathWeapon: 'Cone de 4,5m (Salvação de CON)', savingThrow: 'con', area: 'Cone 4,5m' },
  { color: 'Bronze', damageType: 'Elétrico', breathWeapon: 'Linha de 1,5m por 9m (Salvação de DES)', savingThrow: 'des', area: 'Linha 1,5m x 9m' },
  { color: 'Cobre', damageType: 'Ácido', breathWeapon: 'Linha de 1,5m por 9m (Salvação de DES)', savingThrow: 'des', area: 'Linha 1,5m x 9m' },
  { color: 'Latão', damageType: 'Fogo', breathWeapon: 'Linha de 1,5m por 9m (Salvação de DES)', savingThrow: 'des', area: 'Linha 1,5m x 9m' },
  { color: 'Negro', damageType: 'Ácido', breathWeapon: 'Linha de 1,5m por 9m (Salvação de DES)', savingThrow: 'des', area: 'Linha 1,5m x 9m' },
  { color: 'Ouro', damageType: 'Fogo', breathWeapon: 'Cone de 4,5m (Salvação de DES)', savingThrow: 'des', area: 'Cone 4,5m' },
  { color: 'Prata', damageType: 'Frio', breathWeapon: 'Cone de 4,5m (Salvação de CON)', savingThrow: 'con', area: 'Cone 4,5m' },
  { color: 'Verde', damageType: 'Veneno', breathWeapon: 'Cone de 4,5m (Salvação de CON)', savingThrow: 'con', area: 'Cone 4,5m' },
  { color: 'Vermelho', damageType: 'Fogo', breathWeapon: 'Cone de 4,5m (Salvação de DES)', savingThrow: 'des', area: 'Cone 4,5m' },
];

export const PHB_RACES: Record<string, RaceData> = {
  Humano: {
    id: 'humano',
    name: 'Humano',
    description: 'A raça mais adaptável e ambiciosa. Versáteis por natureza, moldam reinos através de determinação férrea.',
    size: 'Médio',
    baseSpeed: 9,
    hasDarkvision: false,
    baseAbilityBonuses: { for: 1, des: 1, con: 1, int: 1, sab: 1, car: 1 },
    languages: ['Comum'],
    chooseExtraLanguage: true,
    traits: [
      'Versatilidade Humana: +1 em todos os valores de atributo.',
      'Um idioma adicional à sua escolha.'
    ]
  },
  Elfo: {
    id: 'elfo',
    name: 'Elfo',
    description: 'Seres mágicos de graça sobrenatural que vivem por séculos em harmonia com a natureza e as artes arcanas.',
    size: 'Médio',
    baseSpeed: 9,
    hasDarkvision: true,
    darkvisionRange: 18,
    baseAbilityBonuses: { des: 2 },
    languages: ['Comum', 'Élfico'],
    freeSkills: ['percepcao'],
    traits: [
      'Visão no Escuro (18 metros).',
      'Sentidos Aguçados: Proficiência gratuita na perícia Percepção.',
      'Ancestralidade Feérica: Vantagem em salvaguardas contra ser enfeitiçado e magia não pode colocá-lo para dormir.',
      'Transe: Elfos não precisam dormir; meditam profundamente por 4 horas diárias.'
    ],
    subraces: [
      {
        id: 'alto_elfo',
        name: 'Alto Elfo',
        description: 'Mestres do arcano e da erudição, com mente afiada e linhagem nobre.',
        abilityBonuses: { int: 1 },
        traits: [
          'Treinamento com Armas Élficas: Proficiência com espada longa, espada curta, arco curto e arco longo.',
          'Truque Arcano: Você conhece um truque à sua escolha da lista de magias de Mago (Inteligência é seu atributo para conjurá-lo).',
          'Idioma Adicional: Fala, lê e escreve um idioma extra à sua escolha.'
        ],
        proficiencies: {
          weapons: ['Espada Longa', 'Espada Curta', 'Arco Curto', 'Arco Longo']
        },
        chooseCantrip: {
          classSource: 'Mago',
          ability: 'int'
        },
        chooseExtraLanguage: true
      },
      {
        id: 'elfo_floresta',
        name: 'Elfo da Floresta',
        description: 'Ágeis e furtivos, com sentidos ainda mais afiados nas matas virgens.',
        abilityBonuses: { sab: 1 },
        speed: 10.5,
        traits: [
          'Treinamento com Armas Élficas: Proficiência com espada longa, espada curta, arco curto e arco longo.',
          'Pés Ligeiros: Seu deslocamento base aumenta para 10,5 metros (35 pés).',
          'Máscara da Natureza: Você pode tentar se esconder mesmo sob folhagem leve, chuva forte, névoa ou neve.'
        ],
        proficiencies: {
          weapons: ['Espada Longa', 'Espada Curta', 'Arco Curto', 'Arco Longo']
        }
      },
      {
        id: 'drow',
        name: 'Elfo Negro (Drow)',
        description: 'Habitantes do Subterrâneo com afinidade com as sombras e magia inata.',
        abilityBonuses: { car: 1 },
        traits: [
          'Visão no Escuro Superior: Alcance ampliado para 24 metros (80 pés).',
          'Sensibilidade à Luz Solar: Desvantagem em jogadas de ataque e Percepção baseada em visão sob luz solar direta.',
          'Magia Drow: Você conhece o truque Globos de Luz (Carisma é o atributo de conjuração).',
          'Treinamento com Armas Drow: Proficiência com rapieiras, espadas curtas e bestas de mão.'
        ],
        proficiencies: {
          weapons: ['Rapieira', 'Espada Curta', 'Besta de Mão']
        },
        innateSpell: {
          spellId: 'sp_globos_luz',
          spellName: 'Globos de Luz (Dancing Lights)',
          ability: 'car',
          level: 0,
          description: 'Cria até 4 luzes tênues de fósforo flutuantes no alcance.'
        }
      }
    ]
  },
  Anao: {
    id: 'anao',
    name: 'Anão',
    description: 'Guerreiros e mestres ferreiros resolutos, forjados sob montanhas e leais à sua honra e clã.',
    size: 'Médio',
    baseSpeed: 7.5,
    hasDarkvision: true,
    darkvisionRange: 18,
    baseAbilityBonuses: { con: 2 },
    languages: ['Comum', 'Anão'],
    chooseToolCategory: 'dwarf_artisan',
    traits: [
      'Visão no Escuro (18 metros).',
      'Resiliência dos Anões: Vantagem em salvaguardas contra veneno e resistência a dano de veneno.',
      'Treinamento Anão em Combate: Proficiência com machado de batalha, machadinha, martelo leve e martelo de guerra.',
      'Proficiência com Ferramentas: Escolha proficiência em ferramentas de ferreiro, cervejeiro ou pedreiro.',
      'Conhecimento de Pedra: Dobra o bônus de proficiência em testes de História relacionados à origem do trabalho em pedra.'
    ],
    freeWeaponProficiencies: ['Machado de Batalha', 'Machadinha', 'Martelo Leve', 'Martelo de Guerra'],
    subraces: [
      {
        id: 'anao_colina',
        name: 'Anão da Colina',
        description: 'Sentidos aguçados, intuição profunda e tenacidade lendária.',
        abilityBonuses: { sab: 1 },
        hpBonusPerLevel: 1,
        traits: [
          'Tenacidade dos Anões: Seu máximo de PV aumenta em 1, e aumenta em 1 a cada nível subsequente.'
        ]
      },
      {
        id: 'anao_montanha',
        name: 'Anão da Montanha',
        description: 'Poderosos e fortes, acostumados à armadura pesada e às guerras subterrâneas.',
        abilityBonuses: { for: 2 },
        traits: [
          'Treinamento com Armaduras Anãs: Proficiência com armaduras leves e armaduras médias.'
        ],
        proficiencies: {
          armor: ['Armaduras leves', 'Armaduras médias']
        }
      }
    ]
  },
  Halfling: {
    id: 'halfling',
    name: 'Halfling',
    description: 'Povo pequeno e engenhoso que valoriza a paz, boa comida, comunidade e boa fortuna.',
    size: 'Pequeno',
    baseSpeed: 7.5,
    hasDarkvision: false,
    baseAbilityBonuses: { des: 2 },
    languages: ['Comum', 'Halfling'],
    traits: [
      'Sortudo: Quando rolar um 1 natural em d20 (ataque, teste de habilidade ou salvaguarda), pode rerolar e usar o novo resultado.',
      'Bravo: Vantagem em salvaguardas contra ser amedrontado.',
      'Agilidade Halfling: Pode se mover através do espaço de qualquer criatura que seja de tamanho maior que o seu.'
    ],
    subraces: [
      {
        id: 'pes_leves',
        name: 'Halfling Pés-Leves',
        description: 'Carismáticos, sociáveis e mestres em se ocultar atrás de outros.',
        abilityBonuses: { car: 1 },
        traits: [
          'Furtividade Natural: Você pode tentar se esconder mesmo quando estiver apenas encoberto por uma criatura que seja pelo menos um tamanho maior que você.'
        ]
      },
      {
        id: 'robusto',
        name: 'Halfling Robusto',
        description: 'Dizem descender de anões antigos; resistentes a intempéries e venenos.',
        abilityBonuses: { con: 1 },
        traits: [
          'Resiliência dos Robustos: Vantagem em salvaguardas contra veneno e resistência a dano de veneno.'
        ]
      }
    ]
  },
  Draconato: {
    id: 'draconato',
    name: 'Draconato',
    description: 'Descendentes de dragões antigos com orgulho e poder marcial indelével.',
    size: 'Médio',
    baseSpeed: 9,
    hasDarkvision: false,
    baseAbilityBonuses: { for: 2, car: 1 },
    languages: ['Comum', 'Dracônico'],
    hasDraconicAncestry: true,
    traits: [
      'Ancestral Dracônico: Escolha um tipo de dragão que dita sua arma de sopro e resistência a dano elemental.',
      'Arma de Sopro: Como uma ação, exala energia destrutiva (2d6 de dano elemental na criação, CD 8 + mod CON + proficiência). Recarrega após descanso curto/longo.',
      'Resistência a Dano: Resistência permanente ao tipo de dano do seu ancestral dracônico.'
    ]
  },
  Gnomo: {
    id: 'gnomo',
    name: 'Gnomo',
    description: 'Inventores arrojados, curiosos e imbuídos de centelhas vivas de imaginação e magia.',
    size: 'Pequeno',
    baseSpeed: 7.5,
    hasDarkvision: true,
    darkvisionRange: 18,
    baseAbilityBonuses: { int: 2 },
    languages: ['Comum', 'Gnômico'],
    traits: [
      'Visão no Escuro (18 metros).',
      'Esperteza Gnômica: Vantagem em todas as salvaguardas de Inteligência, Sabedoria e Carisma contra magia.'
    ],
    subraces: [
      {
        id: 'gnomo_floresta',
        name: 'Gnomo da Floresta',
        description: 'Têm aptidão natural com ilusões e amizade instintiva com pequenos animais selvagens.',
        abilityBonuses: { des: 1 },
        traits: [
          'Ilusionista Nato: Você conhece o truque Ilusão Menor (Inteligência é seu atributo para conjurá-lo).',
          'Falar com Bestas Pequenas: Através de sons e gestos, você pode comunicar ideias simples para animais pequenos ou menores.'
        ],
        innateSpell: {
          spellId: 'sp_ilusao_menor',
          spellName: 'Ilusão Menor (Minor Illusion)',
          ability: 'int',
          level: 0,
          description: 'Cria um som ou imagem espectral de um objeto por até 1 minuto.'
        }
      },
      {
        id: 'gnomo_rochas',
        name: 'Gnomo das Rochas',
        description: 'Mestres do mecanismo, engrenagens e engenhos extravagantes.',
        abilityBonuses: { con: 1 },
        traits: [
          'Conhecimento de Artífice: Dobra o bônus de proficiência em testes de História sobre itens mágicos, tecnológicos ou alquímicos.',
          'Engenhoqueiro: Proficiência com ferramentas de artesão (ferramentas de funileiro) e capacidade de construir pequenos autômatos mecânicos úteis.'
        ],
        proficiencies: {
          tools: ['Ferramentas de Funileiro']
        }
      }
    ]
  },
  'Meio-Elfo': {
    id: 'meio_elfo',
    name: 'Meio-Elfo',
    description: 'Caminham entre dois mundos, unindo a adaptabilidade humana à graça e percepção feérica.',
    size: 'Médio',
    baseSpeed: 9,
    hasDarkvision: true,
    darkvisionRange: 18,
    baseAbilityBonuses: { car: 2 },
    hasFlexibleAbilityBonus: true,
    flexibleAbilityCount: 2, // Escolhe 2 outros atributos (+1 cada), exceto CAR
    flexibleSkillCount: 2,   // Versatilidade em perícias: 2 perícias quaisquer
    languages: ['Comum', 'Élfico'],
    chooseExtraLanguage: true,
    traits: [
      'Aumento no Valor de Habilidade: Carisma +2 e +1 em outros dois atributos à sua escolha (sem repetir Carisma).',
      'Visão no Escuro (18 metros).',
      'Ancestralidade Feérica: Vantagem contra ser enfeitiçado e imunidade a sono mágico.',
      'Versatilidade em Perícias: Você ganha proficiência em duas perícias quaisquer à sua escolha.',
      'Um idioma adicional à sua escolha.'
    ]
  },
  'Meio-Orc': {
    id: 'meio_orc',
    name: 'Meio-Orc',
    description: 'Imponentes e resilientes, combinando vigor e intensidade de combate implacável.',
    size: 'Médio',
    baseSpeed: 9,
    hasDarkvision: true,
    darkvisionRange: 18,
    baseAbilityBonuses: { for: 2, con: 1 },
    languages: ['Comum', 'Orc'],
    freeSkills: ['intimidacao'],
    traits: [
      'Visão no Escuro (18 metros).',
      'Ameaçador: Proficiência gratuita na perícia Intimidação.',
      'Resistência Implacável: Quando for reduzido a 0 PV mas não morto, cai a 1 PV (1 vez por descanso longo).',
      'Ataques Selvagens: Ao acertar um acerto crítico com arma corpo a corpo, role um dos dados de dano da arma adicionalmente.'
    ]
  },
  Tiefling: {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Herdeiros do toque infernal nos tempos antigos, exibindo chifres régios e faíscas arcanas.',
    size: 'Médio',
    baseSpeed: 9,
    hasDarkvision: true,
    darkvisionRange: 18,
    baseAbilityBonuses: { car: 2, int: 1 },
    languages: ['Comum', 'Infernal'],
    traits: [
      'Visão no Escuro (18 metros).',
      'Resistência Infernal: Resistência a dano de fogo.',
      'Legado Infernal: Você conhece o truque Taumaturgia (Carisma é o atributo de conjuração).'
    ],
    innateSpell: {
      spellId: 'sp_taumaturgia',
      spellName: 'Taumaturgia (Thaumaturgy)',
      ability: 'car',
      level: 0,
      description: 'Manifesta pequenas maravilhas místicas sobrenaturais como estrondos, tremores ou chamas mudando de cor.'
    }
  }
};

// ==========================================
// 3. RECURSOS DE NÍVEL 1 E SUBCLASSES PRECOCES
// ==========================================

export interface FightingStyleOption {
  id: string;
  name: string;
  description: string;
  acBonus?: number;
  rangedAttackBonus?: number;
}

export const FIGHTING_STYLES: FightingStyleOption[] = [
  { id: 'arquearia', name: 'Arquearia', description: '+2 de bônus nas jogadas de ataque realizadas com armas de ataque à distância.', rangedAttackBonus: 2 },
  { id: 'defesa', name: 'Defesa', description: '+1 de bônus na Classe de Armadura (CA) enquanto estiver usando armadura.', acBonus: 1 },
  { id: 'duelo', name: 'Duelo', description: '+2 de bônus nas jogadas de dano quando empunhar uma arma corpo a corpo em uma mão e nenhuma outra arma.' },
  { id: 'armas_grandes', name: 'Armas Grandes', description: 'Quando rolar um 1 ou 2 em um dado de dano de arma de duas mãos ou versátil empunhada com duas mãos, você pode rerolar o dado e deve usar a nova jogada.' },
  { id: 'protecao', name: 'Proteção', description: 'Quando uma criatura que você possa ver atacar um alvo a até 1,5m que não seja você, use sua reação para impor desvantagem ao ataque (exige empunhar escudo).' },
  { id: 'duas_armas', name: 'Combate com Duas Armas', description: 'Ao lutar com duas armas, você pode adicionar seu modificador de habilidade ao dano do segundo ataque da ação bônus.' },
];

export const RANGER_FAVORED_ENEMIES = [
  { id: 'bestas', name: 'Bestas', language: 'Nenhum' },
  { id: 'humanoides', name: 'Humanoides (Goblins & Orcs)', language: 'Goblin e Orc' },
  { id: 'humanoides_elfos', name: 'Humanoides (Elfos & Anões)', language: 'Élfico e Anão' },
  { id: 'monstruosidades', name: 'Monstruosidades', language: 'Dracônico' },
  { id: 'mortos_vivos', name: 'Mortos-Vivos', language: 'Nenhum' },
  { id: 'corruptores', name: 'Corruptores (Demônios/Diabos)', language: 'Abissal ou Infernal' },
  { id: 'dragoes', name: 'Dragões', language: 'Dracônico' },
  { id: 'aberracoes', name: 'Aberrações', language: 'Dialeto Subterrâneo' }
];

export const RANGER_NATURAL_EXPLORERS = [
  { id: 'floresta', name: 'Floresta', description: 'Adaptação a bosques densos, rastreio arbóreo e forragem abundante.' },
  { id: 'montanha', name: 'Montanha', description: 'Escaladas seguras, passagens rochosas e altitude impiedosa.' },
  { id: 'pantano', name: 'Pântano', description: 'Trilhas em lamaçais e resistência a terrenos submersos traiçoeiros.' },
  { id: 'planicie', name: 'Planície', description: 'Visão de longo alcance em savanas, campos e pradarias abertas.' },
  { id: 'subterraneo', name: 'Subterrâneo (Underdark)', description: 'Navegação por túneis profundos e abismos esquecidos.' },
  { id: 'costa', name: 'Costa', description: 'Zonas costeiras, ilhas e recifes de marés perigosas.' },
  { id: 'deserto', name: 'Deserto', description: 'Orientação sob calor tórrido e dunas mutáveis.' },
  { id: 'artico', name: 'Ártico', description: 'Gelo eterno, tundras congeladas e rastreamento na neve.' }
];

export interface SubclassEarlyOption {
  id: string;
  name: string;
  description: string;
  domainSpells?: string[];
  bonusProficiencies?: {
    armor?: string[];
    weapons?: string[];
    skills?: SkillName[];
    tools?: string[];
  };
  features: { name: string; description: string }[];
  hpBonusPerLevel?: number;
  unarmoredAcBonus?: number; // ex: Linhagem Dracônica CA = 13 + DES
}

export const CLERIC_DOMAINS: SubclassEarlyOption[] = [
  {
    id: 'vida',
    name: 'Domínio da Vida',
    description: 'Canaliza energia positiva radiante para curar ferimentos e sustentar os aliados.',
    domainSpells: ['sp_bencao', 'sp_curar_ferimentos'],
    bonusProficiencies: {
      armor: ['Armaduras pesadas']
    },
    features: [
      { name: 'Proficiência Bônus', description: 'Ganha proficiência com armaduras pesadas.' },
      { name: 'Discípulo da Vida', description: 'Suas magias de cura de 1º círculo ou superior recuperam 2 + nível da magia em PV adicionais.' }
    ]
  },
  {
    id: 'luz',
    name: 'Domínio da Luz',
    description: 'Promove a verdade e a vigilância através do fogo purificador e da radiância divina.',
    domainSpells: ['sp_maos_flamejantes', 'sp_fogo_fadas'],
    features: [
      { name: 'Truque Bônus', description: 'Você aprende o truque Luz gratuitamente.' },
      { name: 'Fulgor Protetor', description: 'Quando atacado por uma criatura a até 9m que você veja, use sua reação para impor desvantagem à jogada de ataque (SAB mod vezes por descanso longo).' }
    ]
  },
  {
    id: 'guerra',
    name: 'Domínio da Guerra',
    description: 'Inspira guerreiros a façanhas de bravura e abençoa o fio das armas na batalha.',
    domainSpells: ['sp_escudo_da_fe', 'sp_favor_divino'],
    bonusProficiencies: {
      armor: ['Armaduras pesadas'],
      weapons: ['Armas marciais']
    },
    features: [
      { name: 'Proficiência Bônus', description: 'Ganha proficiência com armas marciais e armaduras pesadas.' },
      { name: 'Sacerdote da Guerra', description: 'Ao usar a ação Atacar, você pode realizar um ataque com arma adicional usando uma ação bônus (SAB mod vezes por descanso longo).' }
    ]
  },
  {
    id: 'tempestade',
    name: 'Domínio da Tempestade',
    description: 'Senhores dos ventos, relâmpagos e marés colossais.',
    domainSpells: ['sp_onda_trovejante', 'sp_nevoa_obscurecente'],
    bonusProficiencies: {
      armor: ['Armaduras pesadas'],
      weapons: ['Armas marciais']
    },
    features: [
      { name: 'Proficiência Bônus', description: 'Ganha proficiência com armas marciais e armaduras pesadas.' },
      { name: 'Ira da Tempestade', description: 'Quando uma criatura a até 1,5m que você veja acertar um ataque em você, use sua reação para causar 2d8 de dano elétrico ou trovejante (salvaguarda de DES para metade).' }
    ]
  },
  {
    id: 'engano',
    name: 'Domínio da Enganação',
    description: 'Mestres da ilusão, disfarces, sutileza e estratagemas sombrios.',
    domainSpells: ['sp_disfarcar_se', 'sp_enfeitiçar_pessoa'],
    features: [
      { name: 'Bênção do Trapaceiro', description: 'Como ação, toque uma criatura voluntária para conceder a ela vantagem em testes de Furtividade por 1 hora.' }
    ]
  },
  {
    id: 'conhecimento',
    name: 'Domínio do Conhecimento',
    description: 'Devotos da erudição, segredos antigos e mestria acadêmica.',
    domainSpells: ['sp_comando', 'sp_identificacao'],
    features: [
      { name: 'Bênção do Saber', description: 'Aprende dois idiomas adicionais e ganha proficiência com duas perícias entre Arcanismo, História, Natureza ou Religião (seu bônus de proficiência é dobrado nelas).' }
    ]
  },
  {
    id: 'natureza',
    name: 'Domínio da Natureza',
    description: 'Defensores da flora, fauna e dos ciclos intocados do mundo primordial.',
    domainSpells: ['sp_falar_animais', 'sp_amizade_animal'],
    bonusProficiencies: {
      armor: ['Armaduras pesadas']
    },
    features: [
      { name: 'Acólito da Natureza', description: 'Ganha proficiência em armaduras pesadas, um truque de Druida à sua escolha e proficiência em Adestrar Animais, Natureza ou Sobrevivência.' }
    ]
  }
];

export const SORCERER_ORIGINS: SubclassEarlyOption[] = [
  {
    id: 'linhagem_draconica',
    name: 'Linhagem Dracônica',
    description: 'Sua magia inata decorre de sangue dracônico misturado à sua linhagem ou um pacto ancestral.',
    hpBonusPerLevel: 1,
    unarmoredAcBonus: 13, // CA base 13 + DES sem armadura
    features: [
      { name: 'Ancestral Dracônico', description: 'Você escolhe um tipo de dragão associado e fala, lê e escreve Dracônico.' },
      { name: 'Resiliência Dracônica', description: 'Seu máximo de PV aumenta em 1 a cada nível. Além disso, partes do seu corpo exibem escamas tênues: quando não usar armadura, sua CA básica é 13 + modificador de Destreza.' }
    ]
  },
  {
    id: 'magia_selvagem',
    name: 'Magia Selvagem',
    description: 'Sua magia brota de forças caóticas puras e imprevisíveis subjacentes ao cosmos.',
    features: [
      { name: 'Surto de Magia Selvagem', description: 'Uma vez por turno ao conjurar magia de 1º círculo ou superior, o Mestre pode pedir um d20. Rolando 1, ocorre um efeito caótico na tabela de Magia Selvagem.' },
      { name: 'Marés do Caos', description: 'Ganha vantagem em uma jogada de ataque, teste de habilidade ou salvaguarda à sua escolha (1x por descanso longo).' }
    ]
  }
];

export const WARLOCK_PATRONS: SubclassEarlyOption[] = [
  {
    id: 'corruptor',
    name: 'O Corruptor (The Fiend)',
    description: 'Pacto celebrado com um senhor dos Nove Infernos ou do Abismo, como um diabo das fossas ou lorde demônio.',
    features: [
      { name: 'Bênção do Obscuro', description: 'Ao reduzir uma criatura hostil a 0 PV, você recebe pontos de vida temporários iguais ao seu modificador de Carisma + seu nível de Bruxo (mínimo 1).' },
      { name: 'Magias Expandidas do Corruptor', description: 'Pode aprender Mãos Flamejantes e Comando.' }
    ]
  },
  {
    id: 'arquifada',
    name: 'A Arquifada (The Archfey)',
    description: 'Pacto forjado com uma criatura nobre e lendária de Faéria, repleta de mistério e encantamentos.',
    features: [
      { name: 'Presença Feérica', description: 'Como ação, força criaturas em um cubo de 3m a fazerem salvaguarda de SAB ou ficarem enfeitiçadas ou amedrontadas por você até o fim do seu próximo turno (1x por descanso).' },
      { name: 'Magias Expandidas da Arquifada', description: 'Pode aprender Fogo das Fadas e Sono.' }
    ]
  },
  {
    id: 'grande_antigo',
    name: 'O Grande Antigo (Great Old One)',
    description: 'Pacto com uma entidade cósmica alienígena cujos motivos ultrapassam a compreensão mortal.',
    features: [
      { name: 'Despertar da Mente', description: 'Você pode se comunicar telepaticamente com qualquer criatura que você possa ver a até 9 metros, desde que ela entenda pelo menos um idioma.' },
      { name: 'Magias Expandidas do Antigo', description: 'Pode aprender Sussurros Dissonantes e Riso Histérico de Tasha.' }
    ]
  }
];

// ==========================================
// 4. CLASSE COMPLETA (PHB CAP. 3)
// ==========================================

export interface EquipmentBranchOption {
  label: string;
  items: Item[];
}

export interface EquipmentChoiceGroup {
  id: string;
  title: string;
  options: EquipmentBranchOption[];
}

export interface DetailedClassData {
  name: string;
  hitDie: string;
  hitDieValue: number;
  primaryAbilities: AbilityName[];
  savingThrows: AbilityName[];
  spellcastingAbility?: AbilityName;
  cantripsKnownAtL1?: number;
  spellsKnownAtL1?: number; // Bardo, Feiticeiro, Bruxo
  isPreparedCaster?: boolean; // Clérigo, Druida: SAB mod + nível
  isSpellbookCaster?: boolean; // Mago: 6 magias no livro, prepara INT mod + nível
  spellSlotsL1?: { [level: number]: number };
  
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  
  skillChoices: {
    count: number;
    options: SkillName[];
    anySkill?: boolean; // Bardo: 3 quaisquer!
  };
  
  // Escolhas de Nível 1
  requiresFightingStyle?: boolean;
  requiresFavoredEnemy?: boolean;
  requiresNaturalExplorer?: boolean;
  requiresExpertise?: boolean; // Ladino escolhe 2
  requiresSubclassAtL1?: boolean;
  subclassType?: 'cleric_domain' | 'sorcerer_origin' | 'warlock_patron';
  
  // Pacotes de Equipamento Inicial Ramificado (PHB)
  startingEquipmentChoices: EquipmentChoiceGroup[];
  fixedStartingEquipment: Item[];
  
  // Riqueza Inicial (Opção B)
  startingWealthFormula: string;
  startingWealthDice: { count: number; sides: number; multiplier: number }; // Ex: 5d4 x 10
  
  description: string;
  featuresL1: { name: string; description: string }[];
}

export const PHB_CLASSES: Record<string, DetailedClassData> = {
  Guerreiro: {
    name: 'Guerreiro',
    hitDie: '1d10',
    hitDieValue: 10,
    primaryAbilities: ['for', 'des'],
    savingThrows: ['for', 'con'],
    armorProficiencies: ['Todas as armaduras', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    skillChoices: {
      count: 2,
      options: ['acrobacia', 'adestrar_animais', 'atletismo', 'historia', 'intuicao', 'intimidacao', 'percepcao', 'sobrevivencia']
    },
    requiresFightingStyle: true,
    startingEquipmentChoices: [
      {
        id: 'gw_armadura',
        title: 'Armadura Inicial',
        options: [
          {
            label: '(a) Cota de Malha (Pesada, CA 16)',
            items: [{ id: 'eq_cota_malha', name: 'Cota de Malha', quantity: 1, weight: 25, type: 'armadura', armorBonus: 16, armorType: 'pesada', stealthDisadvantage: true, isEquipped: true }]
          },
          {
            label: '(b) Armadura de Couro + Arco Longo + 20 Flechas',
            items: [
              { id: 'eq_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true },
              { id: 'eq_arco_longo', name: 'Arco Longo', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8', damageType: 'perfurante', isEquipped: true },
              { id: 'eq_flechas_20', name: 'Aljava com 20 flechas', quantity: 20, weight: 1, type: 'geral' }
            ]
          }
        ]
      },
      {
        id: 'gw_arma_primaria',
        title: 'Armas Marciais',
        options: [
          {
            label: '(a) Espada Longa e Escudo (+2 CA)',
            items: [
              { id: 'eq_espada_longa', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', isEquipped: true },
              { id: 'eq_escudo', name: 'Escudo', quantity: 1, weight: 3, type: 'armadura', armorBonus: 2, armorType: 'escudo', isEquipped: true }
            ]
          },
          {
            label: '(b) Espadão de Duas Mãos (Greatsword, 2d6)',
            items: [
              { id: 'eq_espadao', name: 'Espadão (Greatsword)', quantity: 1, weight: 3, type: 'arma', damage: '2d6', damageType: 'cortante', isEquipped: true }
            ]
          },
          {
            label: '(c) Duas Espadas Curtas (Acuidade)',
            items: [
              { id: 'eq_espada_curta_1', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante', isEquipped: true },
              { id: 'eq_espada_curta_2', name: 'Espada Curta (Secundária)', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante' }
            ]
          }
        ]
      },
      {
        id: 'gw_secundaria',
        title: 'Arma Secundária',
        options: [
          {
            label: '(a) Besta Leve e 20 virotes',
            items: [
              { id: 'eq_besta_leve', name: 'Besta Leve', quantity: 1, weight: 2.5, type: 'arma', damage: '1d8', damageType: 'perfurante' },
              { id: 'eq_virotes_20', name: 'Caixa com 20 virotes', quantity: 20, weight: 0.75, type: 'geral' }
            ]
          },
          {
            label: '(b) Duas Machadinhas de Arremesso',
            items: [
              { id: 'eq_machadinha_1', name: 'Machadinha', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'cortante' },
              { id: 'eq_machadinha_2', name: 'Machadinha', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'cortante' }
            ]
          }
        ]
      },
      {
        id: 'gw_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Masmorra',
            items: [{ id: 'eq_pack_masmorra', name: 'Pacote de Masmorra (Mochila, pé-de-cabra, martelo, 10 pitões, 10 tochas, pederneira, 10 dias de ração, odre, 15m de corda)', quantity: 1, weight: 28, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador (Mochila, saco de dormir, kit de refeição, pederneira, 10 tochas, 10 dias de ração, odre, 15m de corda)', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [],
    startingWealthFormula: '5d4 × 10 po',
    startingWealthDice: { count: 5, sides: 4, multiplier: 10 },
    description: 'Mestre supremo das armas e táticas, disciplinado e implacável em qualquer fronte de batalha.',
    featuresL1: [
      { name: 'Estilo de Luta', description: 'Você adota um estilo de combate particular como sua especialidade.' },
      { name: 'Retomar o Fôlego (Second Wind)', description: 'Como ação bônus, você pode recuperar pontos de vida iguais a 1d10 + seu nível de guerreiro (1x por descanso curto ou longo).' }
    ]
  },
  Mago: {
    name: 'Mago',
    hitDie: '1d6',
    hitDieValue: 6,
    primaryAbilities: ['int'],
    savingThrows: ['int', 'sab'],
    spellcastingAbility: 'int',
    cantripsKnownAtL1: 3,
    isSpellbookCaster: true,
    spellSlotsL1: { 1: 2 },
    armorProficiencies: ['Nenhuma'],
    weaponProficiencies: ['Adagas', 'Dardos', 'Fundas', 'Bordões', 'Bestas leves'],
    skillChoices: {
      count: 2,
      options: ['arcanismo', 'historia', 'intuicao', 'investigacao', 'medicina', 'religiao']
    },
    startingEquipmentChoices: [
      {
        id: 'mg_arma',
        title: 'Arma Inicial',
        options: [
          {
            label: '(a) Bordão (1d6 concussão)',
            items: [{ id: 'eq_bordao', name: 'Bordão', quantity: 1, weight: 2, type: 'arma', damage: '1d6/1d8', damageType: 'concussão', isEquipped: true }]
          },
          {
            label: '(b) Adaga (1d4 perfurante, acuidade)',
            items: [{ id: 'eq_adaga', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante', isEquipped: true }]
          }
        ]
      },
      {
        id: 'mg_foco',
        title: 'Foco de Conjuração',
        options: [
          {
            label: '(a) Bolsa de Componentes de Magia',
            items: [{ id: 'eq_bolsa_comp', name: 'Bolsa de Componentes', quantity: 1, weight: 1, type: 'geral' }]
          },
          {
            label: '(b) Foco Arcano (Varinha de Cristal)',
            items: [{ id: 'eq_varinha_foco', name: 'Foco Arcano (Varinha)', quantity: 1, weight: 0.5, type: 'geral' }]
          }
        ]
      },
      {
        id: 'mg_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Erudito',
            items: [{ id: 'eq_pack_erudito', name: 'Pacote de Erudito (Mochila, livro de estudo, tinta, pena, 10 folhas de pergaminho, saquinho de areia e pequena faca)', quantity: 1, weight: 5, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_grimorio', name: 'Grimório de Mago (com 6 magias de 1º círculo)', quantity: 1, weight: 1.5, type: 'geral' }
    ],
    startingWealthFormula: '4d4 × 10 po',
    startingWealthDice: { count: 4, sides: 4, multiplier: 10 },
    description: 'Erudito arcano capaz de manipular as próprias leis da realidade através de feitiços complexos.',
    featuresL1: [
      { name: 'Grimório', description: 'Possui um livro contendo 6 magias de 1º círculo. Prepara INT mod + 1 magias por dia (mínimo 1).' },
      { name: 'Recuperação Arcana', description: 'Uma vez ao dia durante descanso curto, recupera espaços de magia cuja soma dos níveis seja igual a metade do nível de mago (arredondado para cima, no nível 1 = 1 espaço de 1º nível).' }
    ]
  },
  Ladino: {
    name: 'Ladino',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['des'],
    savingThrows: ['des', 'int'],
    armorProficiencies: ['Armaduras leves'],
    weaponProficiencies: ['Armas simples', 'Bestas de mão', 'Espadas longas', 'Rapieiras', 'Espadas curtas'],
    toolProficiencies: ['Ferramentas de Ladrão'],
    skillChoices: {
      count: 4,
      options: ['acrobacia', 'atletismo', 'atuacao', 'enganacao', 'furtividade', 'intimidacao', 'intuicao', 'investigacao', 'percepcao', 'persuasao', 'prestidigitacao']
    },
    requiresExpertise: true,
    startingEquipmentChoices: [
      {
        id: 'ld_arma1',
        title: 'Arma Principal',
        options: [
          {
            label: '(a) Rapieira (1d8 perfurante, acuidade)',
            items: [{ id: 'eq_rapieira', name: 'Rapieira', quantity: 1, weight: 1, type: 'arma', damage: '1d8', damageType: 'perfurante', isEquipped: true }]
          },
          {
            label: '(b) Espada Curta (1d6 perfurante, acuidade)',
            items: [{ id: 'eq_espada_curta', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante', isEquipped: true }]
          }
        ]
      },
      {
        id: 'ld_arma2',
        title: 'Arma Secundária',
        options: [
          {
            label: '(a) Arco Curto e aljava com 20 flechas',
            items: [
              { id: 'eq_arco_curto', name: 'Arco Curto', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante' },
              { id: 'eq_flechas_20', name: 'Aljava com 20 flechas', quantity: 20, weight: 1, type: 'geral' }
            ]
          },
          {
            label: '(b) Espada Curta adicional',
            items: [{ id: 'eq_espada_curta_sec', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante' }]
          }
        ]
      },
      {
        id: 'ld_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Assaltante',
            items: [{ id: 'eq_pack_assaltante', name: 'Pacote de Assaltante (Mochila, saco com 1.000 esferas de metal, 3m de barbante, sino, 5 velas, pé-de-cabra, martelo, 10 pitões, lanterna coberta, 2 frascos de óleo, 5 dias de ração, pederneira e odre)', quantity: 1, weight: 22, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Masmorra',
            items: [{ id: 'eq_pack_masmorra', name: 'Pacote de Masmorra', quantity: 1, weight: 28, type: 'geral' }]
          },
          {
            label: '(c) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_armadura_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true },
      { id: 'eq_adaga_1', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' },
      { id: 'eq_adaga_2', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' },
      { id: 'eq_ferramentas_ladrao', name: 'Ferramentas de Ladrão', quantity: 1, weight: 0.5, type: 'ferramenta' }
    ],
    startingWealthFormula: '4d4 × 10 po',
    startingWealthDice: { count: 4, sides: 4, multiplier: 10 },
    description: 'Especialista em furtividade, agilidade, infiltração e golpes cirúrgicos fulminantes.',
    featuresL1: [
      { name: 'Especialização (Expertise)', description: 'Seu bônus de proficiência é dobrado em duas perícias à sua escolha (ou uma perícia e ferramentas de ladrão).' },
      { name: 'Ataque Furtivo (Sneak Attack)', description: 'Uma vez por turno, causa 1d6 de dano adicional a um alvo atingido com arma de acuidade ou à distância se tiver vantagem na jogada ou um aliado a até 1,5m do alvo.' },
      { name: 'Gíria de Ladrão', description: 'Dialeto secreto mesclando gírias e sinais visuais que apenas membros do submundo compreendem.' }
    ]
  },
  Clérigo: {
    name: 'Clérigo',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['sab'],
    savingThrows: ['sab', 'car'],
    spellcastingAbility: 'sab',
    cantripsKnownAtL1: 3,
    isPreparedCaster: true, // SAB mod + nível
    spellSlotsL1: { 1: 2 },
    armorProficiencies: ['Armaduras leves', 'Armaduras médias', 'Escudos'],
    weaponProficiencies: ['Armas simples'],
    skillChoices: {
      count: 2,
      options: ['historia', 'intuicao', 'medicina', 'persuasao', 'religiao']
    },
    requiresSubclassAtL1: true,
    subclassType: 'cleric_domain',
    startingEquipmentChoices: [
      {
        id: 'cl_arma',
        title: 'Arma Inicial',
        options: [
          {
            label: '(a) Maça (1d6 concussão)',
            items: [{ id: 'eq_maca', name: 'Maça', quantity: 1, weight: 2, type: 'arma', damage: '1d6', damageType: 'concussão', isEquipped: true }]
          },
          {
            label: '(b) Martelo de Guerra (se proficiente pelo Domínio)',
            items: [{ id: 'eq_martelo_guerra', name: 'Martelo de Guerra', quantity: 1, weight: 2.5, type: 'arma', damage: '1d8/1d10', damageType: 'concussão', isEquipped: true }]
          }
        ]
      },
      {
        id: 'cl_armadura',
        title: 'Armadura Inicial',
        options: [
          {
            label: '(a) Cota de Escamas (Média, CA 14)',
            items: [{ id: 'eq_cota_escamas', name: 'Cota de Escamas', quantity: 1, weight: 20, type: 'armadura', armorBonus: 14, armorType: 'media', stealthDisadvantage: true, isEquipped: true }]
          },
          {
            label: '(b) Armadura de Couro (Leve, CA 11)',
            items: [{ id: 'eq_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true }]
          },
          {
            label: '(c) Cota de Malha (Pesada, CA 16 - para Domínios com proficiência)',
            items: [{ id: 'eq_cota_malha', name: 'Cota de Malha', quantity: 1, weight: 25, type: 'armadura', armorBonus: 16, armorType: 'pesada', stealthDisadvantage: true, isEquipped: true }]
          }
        ]
      },
      {
        id: 'cl_secundaria',
        title: 'Arma Secundária',
        options: [
          {
            label: '(a) Besta Leve e 20 virotes',
            items: [
              { id: 'eq_besta_leve', name: 'Besta Leve', quantity: 1, weight: 2.5, type: 'arma', damage: '1d8', damageType: 'perfurante' },
              { id: 'eq_virotes_20', name: 'Caixa com 20 virotes', quantity: 20, weight: 0.75, type: 'geral' }
            ]
          },
          {
            label: '(b) Qualquer Arma Simples (Adaga)',
            items: [{ id: 'eq_adaga', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' }]
          }
        ]
      },
      {
        id: 'cl_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Sacerdote',
            items: [{ id: 'eq_pack_sacerdote', name: 'Pacote de Sacerdote (Mochila, cobertor, 10 velas, caixa de pederneira, caixa de esmolas, 2 blocos de incenso, incensário, vestes, 2 dias de ração e odre)', quantity: 1, weight: 12, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_escudo', name: 'Escudo (+2 CA)', quantity: 1, weight: 3, type: 'armadura', armorBonus: 2, armorType: 'escudo', isEquipped: true },
      { id: 'eq_simbolo_sagrado', name: 'Símbolo Sagrado (Amuleto)', quantity: 1, weight: 0.5, type: 'geral' }
    ],
    startingWealthFormula: '5d4 × 10 po',
    startingWealthDice: { count: 5, sides: 4, multiplier: 10 },
    description: 'Campeão sacerdotal que empunha magia divina e canaliza o poder de sua divindade.',
    featuresL1: [
      { name: 'Domínio Divino', description: 'Escolha de sua subclasse no 1º nível, garantindo magias preparadas automáticas e traços sagrados.' },
      { name: 'Conjuração Divina', description: 'Prepara SAB mod + 1 magias da lista de clérigo diariamente (mínimo 1) e conhece 3 truques.' }
    ]
  },
  Bárbaro: {
    name: 'Bárbaro',
    hitDie: '1d12',
    hitDieValue: 12,
    primaryAbilities: ['for', 'con'],
    savingThrows: ['for', 'con'],
    armorProficiencies: ['Armaduras leves', 'Armaduras médias', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    skillChoices: {
      count: 2,
      options: ['adestrar_animais', 'atletismo', 'intimidacao', 'natureza', 'percepcao', 'sobrevivencia']
    },
    startingEquipmentChoices: [
      {
        id: 'bb_arma1',
        title: 'Arma Principal',
        options: [
          {
            label: '(a) Machado Grande (Greataxe, 1d12)',
            items: [{ id: 'eq_machado_grande', name: 'Machado Grande (Greataxe)', quantity: 1, weight: 3.5, type: 'arma', damage: '1d12', damageType: 'cortante', isEquipped: true }]
          },
          {
            label: '(b) Espada Longa (1d8/1d10 marcial)',
            items: [{ id: 'eq_espada_longa', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', isEquipped: true }]
          }
        ]
      },
      {
        id: 'bb_arma2',
        title: 'Arma Secundária',
        options: [
          {
            label: '(a) Duas Machadinhas de Arremesso',
            items: [
              { id: 'eq_machadinha_1', name: 'Machadinha', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'cortante' },
              { id: 'eq_machadinha_2', name: 'Machadinha', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'cortante' }
            ]
          },
          {
            label: '(b) Qualquer Arma Simples (Clava Grande)',
            items: [{ id: 'eq_clava_grande', name: 'Clava Grande', quantity: 1, weight: 4, type: 'arma', damage: '1d8', damageType: 'concussão' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' },
      { id: 'eq_azagaia_4', name: 'Quatro Azagaias', quantity: 4, weight: 4, type: 'arma', damage: '1d6', damageType: 'perfurante' }
    ],
    startingWealthFormula: '2d4 × 10 po',
    startingWealthDice: { count: 2, sides: 4, multiplier: 10 },
    description: 'Guerreiro primal impulsionado por fúria indomável e vitalidade prodigiosa.',
    featuresL1: [
      { name: 'Fúria (Rage)', description: 'Entra em fúria como ação bônus (2x por descanso longo). Ganha vantagem em testes e salvaguardas de Força, +2 no dano de ataques com Força e resistência a dano cortante, perfurante e de concussão.' },
      { name: 'Defesa sem Armadura (Unarmored Defense)', description: 'Quando não estiver usando armadura, sua CA é 10 + modificador de Destreza + modificador de Constituição. Você ainda pode usar escudo.' }
    ]
  },
  Bardo: {
    name: 'Bardo',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['car', 'des'],
    savingThrows: ['des', 'car'],
    spellcastingAbility: 'car',
    cantripsKnownAtL1: 2,
    spellsKnownAtL1: 4,
    spellSlotsL1: { 1: 2 },
    armorProficiencies: ['Armaduras leves'],
    weaponProficiencies: ['Armas simples', 'Bestas de mão', 'Espadas longas', 'Rapieiras', 'Espadas curtas'],
    toolProficiencies: ['Três instrumentos musicais à sua escolha'],
    skillChoices: {
      count: 3,
      options: [],
      anySkill: true // Bardo pode escolher 3 perícias QUAISQUER
    },
    startingEquipmentChoices: [
      {
        id: 'bd_arma',
        title: 'Arma Principal',
        options: [
          {
            label: '(a) Rapieira (1d8 perfurante, acuidade)',
            items: [{ id: 'eq_rapieira', name: 'Rapieira', quantity: 1, weight: 1, type: 'arma', damage: '1d8', damageType: 'perfurante', isEquipped: true }]
          },
          {
            label: '(b) Espada Longa (1d8/1d10 cortante)',
            items: [{ id: 'eq_espada_longa', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', isEquipped: true }]
          },
          {
            label: '(c) Qualquer Arma Simples (Adaga)',
            items: [{ id: 'eq_adaga', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante', isEquipped: true }]
          }
        ]
      },
      {
        id: 'bd_instrumento',
        title: 'Instrumento Musical Inicial',
        options: [
          {
            label: '(a) Alaúde',
            items: [{ id: 'eq_alaude', name: 'Alaúde', quantity: 1, weight: 1, type: 'geral' }]
          },
          {
            label: '(b) Flauta',
            items: [{ id: 'eq_flauta', name: 'Flauta', quantity: 1, weight: 0.5, type: 'geral' }]
          },
          {
            label: '(c) Lira',
            items: [{ id: 'eq_lira', name: 'Lira', quantity: 1, weight: 1, type: 'geral' }]
          }
        ]
      },
      {
        id: 'bd_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Diplomata',
            items: [{ id: 'eq_pack_diplomata', name: 'Pacote de Diplomata (Baú, 2 estojos para mapas/pergaminhos, roupas finas, frasco de tinta, caneta-tinteiro, lâmpada, 2 frascos de óleo, 5 folhas de papel, perfume, sabão)', quantity: 1, weight: 18, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Artista',
            items: [{ id: 'eq_pack_artista', name: 'Pacote de Artista (Mochila, saco de dormir, 2 fantasias, 5 velas, 5 dias de ração, odre e kit de maquiagem)', quantity: 1, weight: 19, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true },
      { id: 'eq_adaga', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' }
    ],
    startingWealthFormula: '5d4 × 10 po',
    startingWealthDice: { count: 5, sides: 4, multiplier: 10 },
    description: 'Mestre da canção e da magia, capaz de inspirar aliados e manipular inimigos.',
    featuresL1: [
      { name: 'Inspiração de Bardo', description: 'Como ação bônus, concede um dado d6 de inspiração a um aliado a até 18m. Ele pode somá-lo a um teste, ataque ou salvaguarda nos próximos 10 minutos (CAR mod vezes por descanso longo).' },
      { name: 'Conjuração Bárdica', description: 'Conhece 2 truques e 4 magias de 1º círculo. Usa Carisma como atributo de conjuração.' }
    ]
  },
  Druida: {
    name: 'Druida',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['sab'],
    savingThrows: ['int', 'sab'],
    spellcastingAbility: 'sab',
    cantripsKnownAtL1: 2,
    isPreparedCaster: true, // SAB mod + nível
    spellSlotsL1: { 1: 2 },
    armorProficiencies: ['Armaduras leves', 'Armaduras médias (não-metálicas)', 'Escudos (não-metálicos)'],
    weaponProficiencies: ['Clavas', 'Adagas', 'Dardos', 'Azagaias', 'Maças', 'Bordões', 'Cimitarras', 'Foices', 'Fundas', 'Lanças'],
    toolProficiencies: ['Kit de Herbalismo'],
    skillChoices: {
      count: 2,
      options: ['adestrar_animais', 'arcanismo', 'intuicao', 'medicina', 'natureza', 'percepcao', 'religiao', 'sobrevivencia']
    },
    startingEquipmentChoices: [
      {
        id: 'dr_escudo',
        title: 'Escudo ou Arma',
        options: [
          {
            label: '(a) Escudo de Madeira (+2 CA)',
            items: [{ id: 'eq_escudo_madeira', name: 'Escudo de Madeira', quantity: 1, weight: 3, type: 'armadura', armorBonus: 2, armorType: 'escudo', isEquipped: true }]
          },
          {
            label: '(b) Qualquer Arma Simples (Bordão)',
            items: [{ id: 'eq_bordao', name: 'Bordão', quantity: 1, weight: 2, type: 'arma', damage: '1d6/1d8', damageType: 'concussão', isEquipped: true }]
          }
        ]
      },
      {
        id: 'dr_arma',
        title: 'Arma Cortante',
        options: [
          {
            label: '(a) Cimitarra (1d6 cortante, acuidade)',
            items: [{ id: 'eq_cimitarra', name: 'Cimitarra', quantity: 1, weight: 1.5, type: 'arma', damage: '1d6', damageType: 'cortante', isEquipped: true }]
          },
          {
            label: '(b) Qualquer Arma Simples (Clava)',
            items: [{ id: 'eq_clava', name: 'Clava', quantity: 1, weight: 1, type: 'arma', damage: '1d4', damageType: 'concussão', isEquipped: true }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true },
      { id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' },
      { id: 'eq_foco_druidico', name: 'Foco Druídico (Ramo de Visco)', quantity: 1, weight: 0.5, type: 'geral' }
    ],
    startingWealthFormula: '2d4 × 10 po',
    startingWealthDice: { count: 2, sides: 4, multiplier: 10 },
    description: 'Guardião das forças naturais e mestre da metamorfose selvagem.',
    featuresL1: [
      { name: 'Druídico (Druidic)', description: 'Você conhece o idioma secreto sagrado dos druidas. Deixar mensagens ocultas exige teste de Percepção CD 15 para outros notarem.' },
      { name: 'Conjuração da Natureza', description: 'Prepara SAB mod + 1 magias diariamente da lista de Druida (mínimo 1) e conhece 2 truques.' }
    ]
  },
  Monge: {
    name: 'Monge',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['des', 'sab'],
    savingThrows: ['for', 'des'],
    armorProficiencies: ['Nenhuma'],
    weaponProficiencies: ['Armas simples', 'Espadas curtas'],
    toolProficiencies: ['Escolha: 1 tipo de ferramenta de artesão ou 1 instrumento musical'],
    skillChoices: {
      count: 2,
      options: ['acrobacia', 'atletismo', 'historia', 'intuicao', 'religiao', 'furtividade']
    },
    startingEquipmentChoices: [
      {
        id: 'mn_arma',
        title: 'Arma Inicial',
        options: [
          {
            label: '(a) Espada Curta (1d6 perfurante, acuidade)',
            items: [{ id: 'eq_espada_curta', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante', isEquipped: true }]
          },
          {
            label: '(b) Qualquer Arma Simples (Bordão)',
            items: [{ id: 'eq_bordao', name: 'Bordão', quantity: 1, weight: 2, type: 'arma', damage: '1d6/1d8', damageType: 'concussão', isEquipped: true }]
          }
        ]
      },
      {
        id: 'mn_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Masmorra',
            items: [{ id: 'eq_pack_masmorra', name: 'Pacote de Masmorra', quantity: 1, weight: 28, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_dardos_10', name: '10 Dardos', quantity: 10, weight: 1.25, type: 'arma', damage: '1d4', damageType: 'perfurante' }
    ],
    startingWealthFormula: '5d4 po',
    startingWealthDice: { count: 5, sides: 4, multiplier: 1 },
    description: 'Praticante de artes marciais que canaliza energia Ki corporal e disciplina ascética.',
    featuresL1: [
      { name: 'Defesa sem Armadura (Unarmored Defense)', description: 'Quando não usar armadura e não empunhar escudo, sua CA é 10 + modificador de Destreza + modificador de Sabedoria.' },
      { name: 'Artes Marciais', description: 'Pode usar DES em vez de FOR para ataques e dano com armas de monge e desarmado. Dano desarmado é 1d4. Ao usar a ação Atacar com arma de monge ou desarmado, pode fazer um golpe desarmado como ação bônus.' }
    ]
  },
  Paladino: {
    name: 'Paladino',
    hitDie: '1d10',
    hitDieValue: 10,
    primaryAbilities: ['for', 'car'],
    savingThrows: ['sab', 'car'],
    armorProficiencies: ['Todas as armaduras', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    skillChoices: {
      count: 2,
      options: ['atletismo', 'intuicao', 'intimidacao', 'medicina', 'persuasao', 'religiao']
    },
    startingEquipmentChoices: [
      {
        id: 'pl_arma1',
        title: 'Arma Marcial',
        options: [
          {
            label: '(a) Arma Marcial e Escudo (Espada Longa + Escudo)',
            items: [
              { id: 'eq_espada_longa', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', isEquipped: true },
              { id: 'eq_escudo', name: 'Escudo', quantity: 1, weight: 3, type: 'armadura', armorBonus: 2, armorType: 'escudo', isEquipped: true }
            ]
          },
          {
            label: '(b) Duas Armas Marciais (Espadas Longas)',
            items: [
              { id: 'eq_espada_longa_1', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante', isEquipped: true },
              { id: 'eq_espada_longa_2', name: 'Espada Longa', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8/1d10', damageType: 'cortante' }
            ]
          }
        ]
      },
      {
        id: 'pl_arma2',
        title: 'Armas Secundárias',
        options: [
          {
            label: '(a) Cinco Azagaias',
            items: [{ id: 'eq_azagaia_5', name: 'Cinco Azagaias', quantity: 5, weight: 5, type: 'arma', damage: '1d6', damageType: 'perfurante' }]
          },
          {
            label: '(b) Qualquer Arma Simples Corpo a Corpo (Maça)',
            items: [{ id: 'eq_maca', name: 'Maça', quantity: 1, weight: 2, type: 'arma', damage: '1d6', damageType: 'concussão' }]
          }
        ]
      },
      {
        id: 'pl_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Sacerdote',
            items: [{ id: 'eq_pack_sacerdote', name: 'Pacote de Sacerdote', quantity: 1, weight: 12, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_cota_malha', name: 'Cota de Malha (Pesada, CA 16)', quantity: 1, weight: 25, type: 'armadura', armorBonus: 16, armorType: 'pesada', stealthDisadvantage: true, isEquipped: true },
      { id: 'eq_simbolo_sagrado', name: 'Símbolo Sagrado', quantity: 1, weight: 0.5, type: 'geral' }
    ],
    startingWealthFormula: '5d4 × 10 po',
    startingWealthDice: { count: 5, sides: 4, multiplier: 10 },
    description: 'Guerreiro santo juramentado a defender a justiça com aço e milagre divino.',
    featuresL1: [
      { name: 'Sentido Divino (Divine Sense)', description: 'Como ação, detecta a localização de celestiais, corruptores ou mortos-vivos e locais consagrados/profanados a até 18m (1 + CAR mod vezes por descanso longo).' },
      { name: 'Cura pelas Mãos (Lay on Hands)', description: 'Possui uma reserva de cura igual a 5 × nível de Paladino (5 PV no nível 1). Toque uma criatura para restaurar PV dessa reserva, ou gaste 5 PV para curar uma doença ou neutralizar um veneno.' }
    ]
  },
  Patrulheiro: {
    name: 'Patrulheiro',
    hitDie: '1d10',
    hitDieValue: 10,
    primaryAbilities: ['des', 'sab'],
    savingThrows: ['for', 'des'],
    armorProficiencies: ['Armaduras leves', 'Armaduras médias', 'Escudos'],
    weaponProficiencies: ['Armas simples', 'Armas marciais'],
    skillChoices: {
      count: 3,
      options: ['adestrar_animais', 'atletismo', 'furtividade', 'intuicao', 'investigacao', 'natureza', 'percepcao', 'sobrevivencia']
    },
    requiresFavoredEnemy: true,
    requiresNaturalExplorer: true,
    startingEquipmentChoices: [
      {
        id: 'rg_armadura',
        title: 'Armadura Inicial',
        options: [
          {
            label: '(a) Cota de Escamas (Média, CA 14)',
            items: [{ id: 'eq_cota_escamas', name: 'Cota de Escamas', quantity: 1, weight: 20, type: 'armadura', armorBonus: 14, armorType: 'media', stealthDisadvantage: true, isEquipped: true }]
          },
          {
            label: '(b) Armadura de Couro (Leve, CA 11)',
            items: [{ id: 'eq_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true }]
          }
        ]
      },
      {
        id: 'rg_armas_curtas',
        title: 'Armas de Combate Próximo',
        options: [
          {
            label: '(a) Duas Espadas Curtas (Acuidade)',
            items: [
              { id: 'eq_espada_curta_1', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante', isEquipped: true },
              { id: 'eq_espada_curta_2', name: 'Espada Curta', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'perfurante' }
            ]
          },
          {
            label: '(b) Duas Armas Simples Corpo a Corpo (Machadinhas)',
            items: [
              { id: 'eq_machadinha_1', name: 'Machadinha', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'cortante', isEquipped: true },
              { id: 'eq_machadinha_2', name: 'Machadinha', quantity: 1, weight: 1, type: 'arma', damage: '1d6', damageType: 'cortante' }
            ]
          }
        ]
      },
      {
        id: 'rg_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Masmorra',
            items: [{ id: 'eq_pack_masmorra', name: 'Pacote de Masmorra', quantity: 1, weight: 28, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_arco_longo', name: 'Arco Longo', quantity: 1, weight: 1.5, type: 'arma', damage: '1d8', damageType: 'perfurante', isEquipped: true },
      { id: 'eq_flechas_20', name: 'Aljava com 20 flechas', quantity: 20, weight: 1, type: 'geral' }
    ],
    startingWealthFormula: '5d4 × 10 po',
    startingWealthDice: { count: 5, sides: 4, multiplier: 10 },
    description: 'Guerreiro dos ermos, rastreador supremo e protetor das fronteiras selvagens.',
    featuresL1: [
      { name: 'Inimigo Favorito (Favored Enemy)', description: 'Ganha vantagem em testes de Sobrevivência para rastrear seus inimigos favoritos e testes de Inteligência para lembrar informações sobre eles, além de aprender o idioma deles.' },
      { name: 'Explorador Natural (Natural Explorer)', description: 'Terreno difícil não reduz a velocidade de viagem do grupo no terreno escolhido; você não se perde exceto por meios mágicos; permanece alerta a perigos mesmo forrageando; forrageia o dobro de comida.' }
    ]
  },
  Feiticeiro: {
    name: 'Feiticeiro',
    hitDie: '1d6',
    hitDieValue: 6,
    primaryAbilities: ['car', 'con'],
    savingThrows: ['con', 'car'],
    spellcastingAbility: 'car',
    cantripsKnownAtL1: 4,
    spellsKnownAtL1: 2,
    spellSlotsL1: { 1: 2 },
    armorProficiencies: ['Nenhuma'],
    weaponProficiencies: ['Adagas', 'Dardos', 'Fundas', 'Bordões', 'Bestas leves'],
    skillChoices: {
      count: 2,
      options: ['arcanismo', 'enganacao', 'intimidacao', 'intuicao', 'persuasao', 'religiao']
    },
    requiresSubclassAtL1: true,
    subclassType: 'sorcerer_origin',
    startingEquipmentChoices: [
      {
        id: 'ft_arma',
        title: 'Arma Inicial',
        options: [
          {
            label: '(a) Besta Leve e 20 virotes',
            items: [
              { id: 'eq_besta_leve', name: 'Besta Leve', quantity: 1, weight: 2.5, type: 'arma', damage: '1d8', damageType: 'perfurante', isEquipped: true },
              { id: 'eq_virotes_20', name: 'Caixa com 20 virotes', quantity: 20, weight: 0.75, type: 'geral' }
            ]
          },
          {
            label: '(b) Qualquer Arma Simples (Bordão)',
            items: [{ id: 'eq_bordao', name: 'Bordão', quantity: 1, weight: 2, type: 'arma', damage: '1d6/1d8', damageType: 'concussão', isEquipped: true }]
          }
        ]
      },
      {
        id: 'ft_foco',
        title: 'Foco de Conjuração',
        options: [
          {
            label: '(a) Bolsa de Componentes',
            items: [{ id: 'eq_bolsa_comp', name: 'Bolsa de Componentes', quantity: 1, weight: 1, type: 'geral' }]
          },
          {
            label: '(b) Foco Arcano (Orbe de Cristal)',
            items: [{ id: 'eq_foco_orbe', name: 'Foco Arcano (Orbe)', quantity: 1, weight: 1.5, type: 'geral' }]
          }
        ]
      },
      {
        id: 'ft_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Masmorra',
            items: [{ id: 'eq_pack_masmorra', name: 'Pacote de Masmorra', quantity: 1, weight: 28, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Explorador',
            items: [{ id: 'eq_pack_explorador', name: 'Pacote de Explorador', quantity: 1, weight: 26, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_adaga_1', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' },
      { id: 'eq_adaga_2', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' }
    ],
    startingWealthFormula: '3d4 × 10 po',
    startingWealthDice: { count: 3, sides: 4, multiplier: 10 },
    description: 'Conjurador cujo poder mágico flui intrínseco de sua linhagem ancestral ou anomalia cósmica.',
    featuresL1: [
      { name: 'Origem de Feitiçaria', description: 'Escolha de sua subclasse no 1º nível (Linhagem Dracônica ou Magia Selvagem).' },
      { name: 'Conjuração Inata', description: 'Conhece 4 truques e 2 magias de 1º círculo. Usa Carisma como atributo de conjuração.' }
    ]
  },
  Bruxo: {
    name: 'Bruxo',
    hitDie: '1d8',
    hitDieValue: 8,
    primaryAbilities: ['car'],
    savingThrows: ['sab', 'car'],
    spellcastingAbility: 'car',
    cantripsKnownAtL1: 2,
    spellsKnownAtL1: 2,
    spellSlotsL1: { 1: 1 }, // Magia de Pacto: 1 slot no nível 1 (recarrega em descanso curto!)
    armorProficiencies: ['Armaduras leves'],
    weaponProficiencies: ['Armas simples'],
    skillChoices: {
      count: 2,
      options: ['arcanismo', 'enganacao', 'historia', 'intimidacao', 'investigacao', 'natureza', 'religiao']
    },
    requiresSubclassAtL1: true,
    subclassType: 'warlock_patron',
    startingEquipmentChoices: [
      {
        id: 'bx_arma1',
        title: 'Arma Inicial',
        options: [
          {
            label: '(a) Besta Leve e 20 virotes',
            items: [
              { id: 'eq_besta_leve', name: 'Besta Leve', quantity: 1, weight: 2.5, type: 'arma', damage: '1d8', damageType: 'perfurante', isEquipped: true },
              { id: 'eq_virotes_20', name: 'Caixa com 20 virotes', quantity: 20, weight: 0.75, type: 'geral' }
            ]
          },
          {
            label: '(b) Qualquer Arma Simples (Adaga)',
            items: [{ id: 'eq_adaga', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante', isEquipped: true }]
          }
        ]
      },
      {
        id: 'bx_foco',
        title: 'Foco de Conjuração',
        options: [
          {
            label: '(a) Bolsa de Componentes',
            items: [{ id: 'eq_bolsa_comp', name: 'Bolsa de Componentes', quantity: 1, weight: 1, type: 'geral' }]
          },
          {
            label: '(b) Foco Arcano (Varinha)',
            items: [{ id: 'eq_foco_varinha', name: 'Foco Arcano (Varinha)', quantity: 1, weight: 0.5, type: 'geral' }]
          }
        ]
      },
      {
        id: 'bx_pacote',
        title: 'Pacote de Aventureiro',
        options: [
          {
            label: '(a) Pacote de Estudioso',
            items: [{ id: 'eq_pack_estudioso', name: 'Pacote de Estudioso (Mochila, livro de conhecimento, tinta, pena, 10 pergaminhos, areia e faca)', quantity: 1, weight: 5, type: 'geral' }]
          },
          {
            label: '(b) Pacote de Masmorra',
            items: [{ id: 'eq_pack_masmorra', name: 'Pacote de Masmorra', quantity: 1, weight: 28, type: 'geral' }]
          }
        ]
      }
    ],
    fixedStartingEquipment: [
      { id: 'eq_couro', name: 'Armadura de Couro', quantity: 1, weight: 4.5, type: 'armadura', armorBonus: 11, armorType: 'leve', isEquipped: true },
      { id: 'eq_adaga_1', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' },
      { id: 'eq_adaga_2', name: 'Adaga', quantity: 1, weight: 0.5, type: 'arma', damage: '1d4', damageType: 'perfurante' }
    ],
    startingWealthFormula: '4d4 × 10 po',
    startingWealthDice: { count: 4, sides: 4, multiplier: 10 },
    description: 'Portador de segredos cósmicos outorgados por um patrono extraplanar sob pacto sagrado ou profano.',
    featuresL1: [
      { name: 'Patrono Transcendental', description: 'Escolha de sua subclasse no 1º nível (O Corruptor, A Arquifada ou O Grande Antigo).' },
      { name: 'Magia de Pacto', description: 'Seus espaços de magia sempre são conjurados no nível mais alto possível e são totalmente recuperados após um descanso curto (1 espaço de 1º círculo no nível 1).' }
    ]
  }
};

// ==========================================
// 5. ANTECEDENTES OFICIAIS (PHB CAP. 4)
// ==========================================

export interface DetailedBackgroundData {
  name: string;
  skillProficiencies: SkillName[];
  toolProficiencies?: string[];
  languagesCount?: number;
  fixedEquipment: Item[];
  startingGold: number;
  feature: {
    name: string;
    description: string;
  };
  suggestedTraits: string[];
  suggestedIdeals: string[];
  suggestedBonds: string[];
  suggestedFlaws: string[];
  description: string;
}

export const PHB_BACKGROUNDS: Record<string, DetailedBackgroundData> = {
  Acólito: {
    name: 'Acólito',
    skillProficiencies: ['intuicao', 'religiao'],
    languagesCount: 2,
    startingGold: 15,
    fixedEquipment: [
      { id: 'bg_simbolo_sagrado', name: 'Símbolo Sagrado', quantity: 1, weight: 0.5, type: 'geral' },
      { id: 'bg_livro_oracoes', name: 'Livro de Orações', quantity: 1, weight: 1.5, type: 'geral' },
      { id: 'bg_incenso', name: '5 varetas de incenso', quantity: 5, weight: 0.25, type: 'geral' },
      { id: 'bg_vestes', name: 'Vestes comuns de cerimônia', quantity: 1, weight: 2, type: 'geral' }
    ],
    feature: {
      name: 'Abrigo dos Fiéis',
      description: 'Como acólito, você comanda respeito daqueles que compartilham sua fé e pode realizar cerimônias religiosas. Você e seus companheiros de aventura podem receber cura e hospedagem gratuita em templos, santuários ou abadias da sua fé.'
    },
    suggestedTraits: [
      'Idolatro um herói sagrado da minha fé e constantemente me refiro aos seus feitos.',
      'Posso encontrar terreno comum entre os inimigos mais ferozes e empáticos.',
      'Vejo presságios em cada evento e ação divina ao meu redor.',
      'Nada pode abalar minha atitude otimista diante da providência sagrada.'
    ],
    suggestedIdeals: [
      'Tradição: As antigas tradições de adoração e sacrifício devem ser preservadas. (Leal)',
      'Caridade: Sempre ajudo os necessitados, não importando o custo pessoal. (Bom)',
      'Fé: Confio que minha divindade guiará minhas ações e protegerá meu destino. (Leal)'
    ],
    suggestedBonds: [
      'Eu morreria para recuperar uma relíquia sagrada antiga do meu templo perdida no passado.',
      'Tudo o que faço é pelo bem do povo humilde que confiou em minhas bênçãos.',
      'Tenho uma dívida imensa com o sumo sacerdote que me acolheu quando fiquei órfão.'
    ],
    suggestedFlaws: [
      'Julgo os outros severamente e a mim mesmo com ainda mais rigor moral.',
      'Minha devoção cega às vezes me impede de perceber corrupção dentro da minha própria ordem.',
      'Sou inflexível diante de qualquer dogma diferente dos meus preceitos sagrados.'
    ],
    description: 'Dedicou sua juventude ao serviço de um templo, mosteiro ou panteão sagrado.'
  },
  Criminoso: {
    name: 'Criminoso',
    skillProficiencies: ['enganacao', 'furtividade'],
    toolProficiencies: ['Ferramentas de Ladrão', 'Um kit de jogos'],
    startingGold: 15,
    fixedEquipment: [
      { id: 'bg_pe_de_cabra', name: 'Pé de cabra', quantity: 1, weight: 2.5, type: 'geral' },
      { id: 'bg_roupas_escuras', name: 'Conjunto de roupas escuras com capuz', quantity: 1, weight: 1.5, type: 'geral' }
    ],
    feature: {
      name: 'Contato Criminoso',
      description: 'Você possui um contato confiável que atua como seu elo com uma rede de criminosos. Você sabe como obter e enviar mensagens discretas para contrabandistas, receptadores e informantes.'
    },
    suggestedTraits: [
      'Sempre tenho um plano de fuga preparado para o caso das coisas darem errado.',
      'A melhor forma de me fazer fazer algo é me dizer que não posso fazer.',
      'Não presto muita atenção aos detalhes quando estou contando uma história para enganar.',
      'Raramente confio em quem parece excessivamente amigável sem interesse claro.'
    ],
    suggestedIdeals: [
      'Liberdade: Correntes foram feitas para serem quebradas, assim como leis injustas. (Caótico)',
      'Honra: Jamais roubo de pessoas que não possam pagar pelo prejuízo. (Leal)',
      'Ganância: Faço o que for necessário para me tornar rico e poderoso. (Mau)'
    ],
    suggestedBonds: [
      'Minha lealdade aos meus velhos parceiros de crime é inquestionável.',
      'Alguém que amo foi preso por um crime que eu cometi; devo libertá-lo.',
      'Estou pagando uma dívida antiga com um lorde do crime impiedoso.'
    ],
    suggestedFlaws: [
      'Quando vejo algo valioso que posso pegar sem ser visto, simplesmente não resisto.',
      'Se houver um plano fácil e arriscado de enriquecer, entro nele de cabeça.',
      'Desconfio que todos estão tramando contra mim pelas minhas costas.'
    ],
    description: 'Você viveu à margem da lei, aprendendo a sobreviver em ruelas escuras e esquemas perigosos.'
  },
  Soldado: {
    name: 'Soldado',
    skillProficiencies: ['atletismo', 'intimidacao'],
    toolProficiencies: ['Um kit de jogos', 'Veículos terrestres'],
    startingGold: 10,
    fixedEquipment: [
      { id: 'bg_insignia_militar', name: 'Insígnia de patente militar', quantity: 1, weight: 0.1, type: 'geral' },
      { id: 'bg_trofeu_inimigo', name: 'Troféu de um inimigo caído (adaga/bandeira)', quantity: 1, weight: 0.5, type: 'geral' },
      { id: 'bg_baralho_osso', name: 'Conjunto de dados de osso', quantity: 1, weight: 0.1, type: 'geral' },
      { id: 'bg_roupas_comuns', name: 'Roupas comuns', quantity: 1, weight: 1.5, type: 'geral' }
    ],
    feature: {
      name: 'Patente Militar',
      description: 'Você possui uma patente de sua época militar. Soldados leais ao seu antigo exército ainda reconhecem sua autoridade e você pode requisitar abrigo temporário e suprimentos em acampamentos ou fortalezas amigáveis.'
    },
    suggestedTraits: [
      'Sempre mantenho minha armadura polida e minhas armas afiadas como no quartel.',
      'Encaro os problemas de frente com a disciplina imposta por anos de cerco.',
      'Gosto de ser forte e mandar nos outros quando a liderança vacila.',
      'Tenho histórias de batalhas para quase todas as situações imagináveis.'
    ],
    suggestedIdeals: [
      'Maior Bem: Nossa causa e vidas pertencem à proteção do povo. (Bom)',
      'Responsabilidade: Eu cumpro minhas ordens até o fim, custe o que custar. (Leal)',
      'Glória: A glória em combate é o único legado duradouro de um guerreiro. (Qualquer)'
    ],
    suggestedBonds: [
      'Aqueles que lutaram ao meu lado são irmãos para quem eu daria a minha vida.',
      'Meu antigo comandante era um herói e busco honrar os ensinamentos dele.',
      'Protegerei minha cidade natal contra qualquer ameaça que marcou minha infância.'
    ],
    suggestedFlaws: [
      'O horror da guerra me persegue em sonhos acordados; fujo do silêncio.',
      'Tenho pouca paciência para quem não segue ordens ou disciplina estrita.',
      'Acredito piamente que a força das armas resolve qualquer dilema moral.'
    ],
    description: 'Treinado para o combate em exércitos regulares, milícias ou companhias mercenárias.'
  },
  Sábio: {
    name: 'Sábio',
    skillProficiencies: ['arcanismo', 'historia'],
    languagesCount: 2,
    startingGold: 10,
    fixedEquipment: [
      { id: 'bg_frasco_tinta', name: 'Frasco de tinta preta', quantity: 1, weight: 0.2, type: 'geral' },
      { id: 'bg_pena', name: 'Pena de caligrafia', quantity: 1, weight: 0.1, type: 'geral' },
      { id: 'bg_facapequena', name: 'Pequena faca utilitária', quantity: 1, weight: 0.25, type: 'geral' },
      { id: 'bg_carta_pergunta', name: 'Carta de um colega morto com uma pergunta sem resposta', quantity: 1, weight: 0.1, type: 'geral' }
    ],
    feature: {
      name: 'Pesquisador',
      description: 'Quando tentar lembrar de um fragmento de lore, se você não souber a informação, geralmente sabe onde e com quem pode obtê-la (seja em uma biblioteca lendária, monastério ou acadêmico especialista).'
    },
    suggestedTraits: [
      'Uso palavras polissilábicas e termos técnicos para parecer ainda mais erudito.',
      'Li cada livro das grandes bibliotecas e adoro compartilhar curiosidades obscuras.',
      'Fico tão absorto em meus pensamentos que esqueço do mundo ao meu redor.',
      'Não há mistério que resista a uma mente paciente e análise metodológica.'
    ],
    suggestedIdeals: [
      'Conhecimento: O caminho para o poder e auto-aperfeiçoamento é o saber. (Neutro)',
      'Beleza: O estudo dos segredos do universo revela a mais sublime perfeição. (Bom)',
      'Lógica: Emoções não devem nublar o pensamento racional e crítico. (Leal)'
    ],
    suggestedBonds: [
      'Dediquei minha vida inteira a encontrar um tomo arcano perdido dos tempos antigos.',
      'Meus alunos e a universidade onde lecionei são meu bem mais precioso.',
      'Tenho que desvendar a profecia que prenuncia uma catástrofe que apenas eu vi.'
    ],
    suggestedFlaws: [
      'Distraio-me facilmente diante de qualquer texto antigo ou runa misteriosa.',
      'Acredito ser mais inteligente do que quase todas as pessoas que conheço.',
      'Falo sem pensar sobre segredos perigosos que deveriam permanecer selados.'
    ],
    description: 'Passou anos em bibliotecas, laboratórios e monastérios desvendando segredos cósmicos.'
  },
  Nobre: {
    name: 'Nobre',
    skillProficiencies: ['historia', 'persuasao'],
    toolProficiencies: ['Um kit de jogos'],
    languagesCount: 1,
    startingGold: 25,
    fixedEquipment: [
      { id: 'bg_roupas_finas', name: 'Conjunto de roupas finas nobres', quantity: 1, weight: 3, type: 'geral' },
      { id: 'bg_anel_sinete', name: 'Anel com sinete da família', quantity: 1, weight: 0.1, type: 'geral' },
      { id: 'bg_pergaminho_pedigree', name: 'Pergaminho de linhagem nobre (pedigree)', quantity: 1, weight: 0.2, type: 'geral' }
    ],
    feature: {
      name: 'Posição de Privilégio',
      description: 'Graças ao seu nascimento nobre, as pessoas tendem a pensar o melhor de você. Você é bem-vindo na alta sociedade, e plebeus fazem de tudo para agradá-lo e evitar desagradar um senhor aristocrata.'
    },
    suggestedTraits: [
      'Minha bajulação eloquente faz com que qualquer um se sinta a pessoa mais importante.',
      'Ninguém pode duvidar de que sou superior aos plebeus comuns pelas minhas boas maneiras.',
      'Apesar dos meus títulos, não gosto de formalidades cortesãs vazias.',
      'Tenho um gosto requintado por boa comida, vinho fino e os melhores tecidos.'
    ],
    suggestedIdeals: [
      'Nobreza Obriga: É meu dever proteger e cuidar daqueles que estão sob meus títulos. (Bom)',
      'Poder: Se eu obtiver poder suficiente, ninguém jamais ditará o que devo fazer. (Mau)',
      'Família: O sangue de minha linhagem vem antes de qualquer outra obrigação terrena. (Leal)'
    ],
    suggestedBonds: [
      'Devo defender a honra do brasão de minha família custe o que custar.',
      'Estou determinado a restaurar o patrimônio da minha casa que foi usurpado.',
      'O amor da minha vida é um plebeu e desafiarei minha família para ficar com ele.'
    ],
    suggestedFlaws: [
      'Guardo secretamente a crença de que os deuses nos fizeram superiores à massa inculta.',
      'Não perdoo insultos ao meu nome e busco desforra imediata contra desrespeito.',
      'Gasto dinheiro sem medir as consequências como se minhas arcas fossem infinitas.'
    ],
    description: 'Criado em palácios, solares ou castelos entre etiquetas de poder e privilégio dinástico.'
  },
  'Herói do Povo': {
    name: 'Herói do Povo',
    skillProficiencies: ['adestrar_animais', 'sobrevivencia'],
    toolProficiencies: ['Um conjunto de ferramentas de artesão', 'Veículos terrestres'],
    startingGold: 10,
    fixedEquipment: [
      { id: 'bg_ferramentas_artesao', name: 'Ferramentas de artesão', quantity: 1, weight: 2.5, type: 'ferramenta' },
      { id: 'bg_pa', name: 'Pá de ferro', quantity: 1, weight: 2.5, type: 'geral' },
      { id: 'bg_pote_ferro', name: 'Pote de ferro', quantity: 1, weight: 5, type: 'geral' },
      { id: 'bg_roupas_comuns', name: 'Roupas comuns camponesas', quantity: 1, weight: 1.5, type: 'geral' }
    ],
    feature: {
      name: 'Hospitalidade Rústica',
      description: 'Por ter vindo do povo humilde, você se mistura facilmente aos plebeus. Você pode encontrar abrigo, comida e proteção entre camponeses e aldeões, desde que não os exponha a perigo manifesto.'
    },
    suggestedTraits: [
      'Julgo as pessoas por suas ações e caráter, nunca por seus títulos ou riquezas.',
      'Se alguém está em apuros, nunca viro as costas, mesmo que isso me custe caro.',
      'Trabalho duro e tenho orgulho das marcas calejadas das minhas mãos.',
      'Costumo usar provérbios simples e metáforas camponesas para explicar grandes dilemas.'
    ],
    suggestedIdeals: [
      'Respeito: As pessoas merecem ser tratadas com dignidade, não importa sua origem. (Bom)',
      'Justiça: Tiranos devem ser derrubados para que os justos prosperem. (Caótico)',
      'Destino: Nada pode me afastar do destino para o qual o povo me ergueu. (Qualquer)'
    ],
    suggestedBonds: [
      'Minha aldeia sofreu nas mãos de um tirano e prometi que o levarei à justiça.',
      'Uma ferramenta dada pelo meu pai antes da destruição de nossa chácara é sagrada.',
      'Defenderei os camponeses e agricultores desamparados onde quer que eu vá.'
    ],
    suggestedFlaws: [
      'Tenho desconfiança imediata de qualquer autoridade, rei ou juiz nobre.',
      'Assumo responsabilidades heroicas mesmo quando sei que as chances são nulas.',
      'Minha teimosia camponesa me impede de recuar mesmo diante do bom senso.'
    ],
    description: 'Origem humilde que se ergueu contra tiranos ou feras para salvar seu povo.'
  },
  Charlatão: {
    name: 'Charlatão',
    skillProficiencies: ['enganacao', 'prestidigitacao'],
    toolProficiencies: ['Kit de disfarce', 'Kit de falsificação'],
    startingGold: 15,
    fixedEquipment: [
      { id: 'bg_roupas_finas', name: 'Conjunto de roupas elegantes', quantity: 1, weight: 2, type: 'geral' },
      { id: 'bg_kit_disfarce', name: 'Kit de disfarce', quantity: 1, weight: 1.5, type: 'ferramenta' },
      { id: 'bg_dados_viciados', name: 'Dados viciados e anel falso', quantity: 1, weight: 0.1, type: 'geral' }
    ],
    feature: {
      name: 'Falsa Identidade',
      description: 'Você criou uma segunda identidade estabelecida completa com documentação forjada, disfarces e contatos para operar sem ser descoberto.'
    },
    suggestedTraits: [
      'Caio nas graças das pessoas com extrema facilidade e um sorriso convincente.',
      'Invento histórias mirabolantes e detalhes extravagantes sem nem piscar.'
    ],
    suggestedIdeals: [
      'Independência: Sou um espírito livre; ninguém manda no meu destino. (Caótico)'
    ],
    suggestedBonds: [
      'Fui enganado por alguém mais esperto e busco dar o troco à altura.'
    ],
    suggestedFlaws: [
      'Não consigo resistir a aplicar um golpe fácil mesmo quando a prudência manda recuar.'
    ],
    description: 'Mestre dos golpes e personas forjadas que extrai ouro dos tolos com lábia refinada.'
  },
  Forasteiro: {
    name: 'Forasteiro',
    skillProficiencies: ['atletismo', 'sobrevivencia'],
    toolProficiencies: ['Um instrumento musical'],
    languagesCount: 1,
    startingGold: 10,
    fixedEquipment: [
      { id: 'bg_bordao', name: 'Bordão de caminhada', quantity: 1, weight: 2, type: 'arma', damage: '1d6', damageType: 'concussão' },
      { id: 'bg_armadilha_cacador', name: 'Armadilha de caça', quantity: 1, weight: 11, type: 'geral' },
      { id: 'bg_trofeu_animal', name: 'Troféu de um animal abatido', quantity: 1, weight: 0.5, type: 'geral' },
      { id: 'bg_roupas_viagem', name: 'Conjunto de roupas de viajante', quantity: 1, weight: 2, type: 'geral' }
    ],
    feature: {
      name: 'Andarilho',
      description: 'Você tem memória perfeita para rotas, marcos geográficos e mapas naturais. Além disso, pode encontrar água fresca e comida para você e até cinco companheiros por dia em ambientes selvagens.'
    },
    suggestedTraits: [
      'Fico desconfortável em cidades grandes e prefiro dormir sob as estrelas.',
      'Trato os animais da floresta com o mesmo respeito que trato meus aliados.'
    ],
    suggestedIdeals: [
      'Natureza: O mundo natural deve ser preservado contra o avanço predatório. (Neutro)'
    ],
    suggestedBonds: [
      'Minha tribo foi dizimada e sou o último a carregar suas canções ancestrais.'
    ],
    suggestedFlaws: [
      'Gosto tanto de cerveja e hidromel que perco a compostura com facilidade.'
    ],
    description: 'Criado nos ermos selvagens longe da civilização, habituado aos perigos do mundo natural.'
  }
};

// ==========================================
// 6. TRUQUES E MAGIAS EXPANDIDAS DE NÍVEL 0 E 1
// ==========================================

export const PHB_SPELLS_L0_L1: Spell[] = [
  // TRUQUES (NÍVEL 0)
  {
    id: 'sp_rajada_mistica',
    name: 'Rajada Mística (Eldritch Blast)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Um raio de energia azul estalante. Ataque mágico à distância: causa 1d10 de dano de energia.',
    damage: '1d10 energia'
  },
  {
    id: 'sp_raio_fogo',
    name: 'Raio de Fogo (Fire Bolt)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Arremessa um raio de fogo abrasador. Ataque mágico à distância: 1d10 de dano de fogo.',
    damage: '1d10 fogo'
  },
  {
    id: 'sp_raio_gelo',
    name: 'Raio de Gelo (Ray of Frost)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '18 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Feixe azul gélido. Ataque mágico: 1d8 de dano de frio e reduz o deslocamento do alvo em 3 metros até seu próximo turno.',
    damage: '1d8 frio'
  },
  {
    id: 'sp_toque_chocante',
    name: 'Toque Chocante (Shocking Grasp)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Eletricidade em sua mão. Ataque mágico corpo a corpo (com vantagem se o alvo usar armadura de metal): 1d8 elétrico e impede o alvo de reagir.',
    damage: '1d8 elétrico'
  },
  {
    id: 'sp_chama_sagrada',
    name: 'Chama Sagrada (Sacred Flame)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '18 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Radiação que desce como chama. O alvo faz salvaguarda de DES (sem benefício de cobertura) ou sofre 1d8 de dano radiante.',
    damage: '1d8 radiante'
  },
  {
    id: 'sp_orientacao',
    name: 'Orientação (Guidance)',
    level: 0,
    school: 'Adivinhação',
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Concentração, até 1 minuto',
    description: 'Toca uma criatura voluntária. Ela adiciona 1d4 a um teste de habilidade à sua escolha.'
  },
  {
    id: 'sp_taumaturgia',
    name: 'Taumaturgia (Thaumaturgy)',
    level: 0,
    school: 'Transmutação',
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V',
    duration: 'Até 1 minuto',
    description: 'Manifesta pequenas maravilhas sobrenaturais como voz 3x mais alta, tremores no chão, chamas alterando de cor ou portas batendo.'
  },
  {
    id: 'sp_luz',
    name: 'Luz (Light)',
    level: 0,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, M (um vaga-lume)',
    duration: '1 hora',
    description: 'Faz um objeto brilhar emitindo luz plena por 6m e meia-luz por mais 6m.'
  },
  {
    id: 'sp_maos_magicas',
    name: 'Mãos Mágicas (Mage Hand)',
    level: 0,
    school: 'Conjuração',
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V, S',
    duration: '1 minuto',
    description: 'Mão espectral translúcida que manipula objetos, abre portas destrancadas ou carrega até 4,5 kg.'
  },
  {
    id: 'sp_ilusao_menor',
    name: 'Ilusão Menor (Minor Illusion)',
    level: 0,
    school: 'Ilusão',
    castingTime: '1 ação',
    range: '9 metros',
    components: 'S, M (um pedaço de lã)',
    duration: '1 minuto',
    description: 'Cria um som ou uma imagem espectral visual de um objeto imóvel que caiba em um cubo de 1,5m.'
  },
  {
    id: 'sp_prestidigitacao',
    name: 'Prestidigitação (Prestidigitation)',
    level: 0,
    school: 'Transmutação',
    castingTime: '1 ação',
    range: '3 metros',
    components: 'V, S',
    duration: 'Até 1 hora',
    description: 'Pequenos truques arcanos úteis: acender/apagar velas, limpar ou sujar roupas, aquecer ou resfriar comida, colorir itens.'
  },
  {
    id: 'sp_zombaria_viciosa',
    name: 'Zombaria Viciosa (Vicious Mockery)',
    level: 0,
    school: 'Encantamento',
    castingTime: '1 ação',
    range: '18 metros',
    components: 'V',
    duration: 'Instantânea',
    description: 'Insultos encantados cortantes. Salvaguarda de SAB: sofre 1d4 de dano psíquico e desvantagem no próximo ataque.',
    damage: '1d4 psíquico'
  },
  {
    id: 'sp_chicote_espinhos',
    name: 'Chicote de Espinhos (Thorn Whip)',
    level: 0,
    school: 'Transmutação',
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V, S, M (caule com espinhos)',
    duration: 'Instantânea',
    description: 'Chicote de vinhas espinhosas. Ataque mágico: 1d6 de dano perfurante e puxa criaturas Grandes ou menores até 3m em sua direção.',
    damage: '1d6 perfurante'
  },
  {
    id: 'sp_bordao_magico',
    name: 'Bordão Mágico (Shillelagh)',
    level: 0,
    school: 'Transmutação',
    castingTime: '1 ação bônus',
    range: 'Toque',
    components: 'V, S, M (visco e trevo)',
    duration: '1 minuto',
    description: 'Imbui uma clava ou bordão de madeira. Você pode usar Sabedoria para ataques e dano, e o dado de dano se torna 1d8 mágico.'
  },

  // 1º CÍRCULO
  {
    id: 'sp_projetil_magico',
    name: 'Projétil Mágico (Magic Missile)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Cria três dardos brilhantes de energia pura. Cada dardo acerta infalivelmente causando 1d4 + 1 de dano de energia cada.',
    damage: '3x (1d4+1) energia'
  },
  {
    id: 'sp_escudo_arcano',
    name: 'Escudo Arcano (Shield)',
    level: 1,
    school: 'Abjuração',
    castingTime: '1 reação (ao sofrer um ataque)',
    range: 'Pessoal',
    components: 'V, S',
    duration: '1 rodada',
    description: '+5 de bônus na CA até o início do seu próximo turno (inclusive contra o ataque disparador) e imunidade a Projétil Mágico.'
  },
  {
    id: 'sp_armadura_arcana',
    name: 'Armadura Arcana (Mage Armor)',
    level: 1,
    school: 'Abjuração',
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S, M (pedaço de couro curado)',
    duration: '8 horas',
    description: 'Toca criatura voluntária sem armadura. Sua CA básica se torna 13 + modificador de Destreza.'
  },
  {
    id: 'sp_curar_ferimentos',
    name: 'Curar Ferimentos (Cure Wounds)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'A criatura tocada recupera pontos de vida iguais a 1d8 + modificador do atributo de conjuração.',
    damage: '1d8 + mod cura'
  },
  {
    id: 'sp_palavra_curativa',
    name: 'Palavra Curativa (Healing Word)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação bônus',
    range: '18 metros',
    components: 'V',
    duration: 'Instantânea',
    description: 'Uma criatura que você veja a até 18m recupera PV iguais a 1d4 + modificador do atributo de conjuração.',
    damage: '1d4 + mod cura'
  },
  {
    id: 'sp_bencao',
    name: 'Bênção (Bless)',
    level: 1,
    school: 'Encantamento',
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V, S, M (água benta)',
    duration: 'Concentração, até 1 minuto',
    description: 'Abençoa até 3 criaturas. Ganham +1d4 em jogadas de ataque e salvaguardas enquanto a magia durar.'
  },
  {
    id: 'sp_onda_trovejante',
    name: 'Onda Trovejante (Thunderwave)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Pessoal (cubo de 4,5m)',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Onda de som trovejante. Salvaguarda de CON: 2d8 de dano trovejante e empurrado 3 metros (metade do dano e não é empurrado se passar).',
    damage: '2d8 trovejante'
  },
  {
    id: 'sp_raio_guiado',
    name: 'Raio Guiado (Guiding Bolt)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: '1 rodada',
    description: 'Raio de luz cintilante. Ataque mágico: 4d6 de dano radiante e concede vantagem no próximo ataque contra o alvo.',
    damage: '4d6 radiante'
  },
  {
    id: 'sp_bruxaria',
    name: 'Bruxaria (Hex)',
    level: 1,
    school: 'Encantamento',
    castingTime: '1 ação bônus',
    range: '27 metros',
    components: 'V, S, M (olho de tritão petrificado)',
    duration: 'Concentração, até 1 hora',
    description: 'Amaldiçoa uma criatura. Seus ataques contra ela causam 1d6 de dano necrótico adicional, e ela tem desvantagem em testes de um atributo escolhido.',
    damage: '1d6 necrótico extra'
  },
  {
    id: 'sp_sono',
    name: 'Sono (Sleep)',
    level: 1,
    school: 'Encantamento',
    castingTime: '1 ação',
    range: '27 metros',
    components: 'V, S, M (areia fina)',
    duration: '1 minuto',
    description: 'Role 5d8. Criaturas no raio de 6m com os menores totais de PV caem inconscientes em ordem crescente até a soma se esgotar.'
  },
  {
    id: 'sp_fogo_fadas',
    name: 'Fogo das Fadas (Faerie Fire)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: '18 metros',
    components: 'V',
    duration: 'Concentração, até 1 minuto',
    description: 'Luzes azuis, verdes ou violetas em um cubo de 6m. Criaturas que falhem na salvaguarda de DES emitem luz e concedem vantagem em ataques contra elas.'
  },
  {
    id: 'sp_sussurros_dissonantes',
    name: 'Sussurros Dissonantes (Dissonant Whispers)',
    level: 1,
    school: 'Encantamento',
    castingTime: '1 ação',
    range: '18 metros',
    components: 'V',
    duration: 'Instantânea',
    description: 'Melodia discordante sussurrada na mente do alvo. Salvaguarda de SAB: 3d6 psíquico e foge imediatamente usando sua reação.',
    damage: '3d6 psíquico'
  },
  {
    id: 'sp_maos_flamejantes',
    name: 'Mãos Flamejantes (Burning Hands)',
    level: 1,
    school: 'Evocação',
    castingTime: '1 ação',
    range: 'Pessoal (cone de 4,5m)',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Folha de fogo que irrompe dos seus dedos. Salvaguarda de DES: 3d6 de dano de fogo (metade se passar).',
    damage: '3d6 fogo'
  },
  {
    id: 'sp_escudo_da_fe',
    name: 'Escudo da Fé (Shield of Faith)',
    level: 1,
    school: 'Abjuração',
    castingTime: '1 ação bônus',
    range: '18 metros',
    components: 'V, S, M (pergaminho com texto sagrado)',
    duration: 'Concentração, até 10 minutos',
    description: 'Um campo reluzente cerca uma criatura, concedendo um bônus de +2 na Classe de Armadura (CA).'
  },
  {
    id: 'sp_emaranhar',
    name: 'Emaranhar (Entangle)',
    level: 1,
    school: 'Conjuração',
    castingTime: '1 ação',
    range: '27 metros',
    components: 'V, S',
    duration: 'Concentração, até 1 minuto',
    description: 'Gavinhas e ervas daninhas brotam num quadrado de 6m. Criaturas na área devem passar numa salvaguarda de FOR ou ficam impedidas.'
  }
];

// Mapeamento de magias por classe para o Nível 1
export const CLASS_CANTRIPS_MAP: Record<string, string[]> = {
  Bardo: ['sp_luz', 'sp_maos_magicas', 'sp_ilusao_menor', 'sp_prestidigitacao', 'sp_zombaria_viciosa'],
  Clérigo: ['sp_orientacao', 'sp_luz', 'sp_chama_sagrada', 'sp_taumaturgia'],
  Druida: ['sp_orientacao', 'sp_chicote_espinhos', 'sp_bordao_magico', 'sp_ilusao_menor'],
  Feiticeiro: ['sp_raio_fogo', 'sp_raio_gelo', 'sp_toque_chocante', 'sp_maos_magicas', 'sp_luz', 'sp_prestidigitacao'],
  Bruxo: ['sp_rajada_mistica', 'sp_maos_magicas', 'sp_ilusao_menor', 'sp_prestidigitacao'],
  Mago: ['sp_raio_fogo', 'sp_raio_gelo', 'sp_toque_chocante', 'sp_maos_magicas', 'sp_luz', 'sp_ilusao_menor', 'sp_prestidigitacao']
};

export const CLASS_LEVEL1_SPELLS_MAP: Record<string, string[]> = {
  Bardo: ['sp_curar_ferimentos', 'sp_palavra_curativa', 'sp_sussurros_dissonantes', 'sp_fogo_fadas', 'sp_onda_trovejante', 'sp_sono'],
  Clérigo: ['sp_bencao', 'sp_curar_ferimentos', 'sp_palavra_curativa', 'sp_raio_guiado', 'sp_escudo_da_fe'],
  Druida: ['sp_curar_ferimentos', 'sp_palavra_curativa', 'sp_emaranhar', 'sp_fogo_fadas', 'sp_onda_trovejante'],
  Feiticeiro: ['sp_projetil_magico', 'sp_escudo_arcano', 'sp_armadura_arcana', 'sp_onda_trovejante', 'sp_maos_flamejantes', 'sp_sono'],
  Bruxo: ['sp_bruxaria', 'sp_armadura_arcana', 'sp_onda_trovejante'],
  Mago: ['sp_projetil_magico', 'sp_escudo_arcano', 'sp_armadura_arcana', 'sp_onda_trovejante', 'sp_maos_flamejantes', 'sp_sono']
};
