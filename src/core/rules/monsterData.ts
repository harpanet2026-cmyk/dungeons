import { Enemy, AbilityName } from '../types/dnd';

// Tabela oficial do Livro dos Monstros e Guia do Mestre 5e
export const CR_XP_MAP: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
};

export const getMonsterFallbackImage = (name: string, type?: string): string => {
  const n = (name + ' ' + (type || '')).toLowerCase();
  if (n.includes('goblin')) return '/monsters/goblin.jpg';
  if (n.includes('kobold')) return '/monsters/kobold.jpg';
  if (n.includes('orc')) return '/monsters/orc.jpg';
  if (n.includes('mente') || n.includes('mind') || n.includes('flayer') || n.includes('ilithid')) return '/monsters/mind_flayer.jpg';
  if (n.includes('beholder') || n.includes('observador')) return '/monsters/beholder.jpg';
  if (n.includes('gnoll')) return '/monsters/gnoll.jpg';
  if (n.includes('ogro') || n.includes('ogre')) return '/monsters/ogre.jpg';
  if (n.includes('troll')) return '/monsters/troll.jpg';
  if (n.includes('zumbi') || n.includes('zombie')) return '/monsters/zombie.jpg';
  if (n.includes('esqueleto') || n.includes('skeleton')) return '/monsters/skeleton.jpg';
  if (n.includes('lobo') || n.includes('wolf')) return '/monsters/wolf.jpg';
  if (n.includes('dragão') || n.includes('dragao') || n.includes('dragon')) return '/monsters/dragon.jpg';
  if (n.includes('bruxa') || n.includes('hag') || n.includes('medusa')) return '/monsters/hag.jpg';
  if (n.includes('yuan') || n.includes('serpente')) return '/monsters/yuan_ti.jpg';
  if (n.includes('lich')) return '/monsters/lich.jpg';
  if (n.includes('urso') || n.includes('owlbear')) return '/monsters/owlbear.jpg';
  if (n.includes('mímico') || n.includes('mimic')) return '/monsters/mimic.jpg';
  if (n.includes('bandido') || n.includes('bandit')) return '/monsters/bandit.jpg';
  if (n.includes('hidra') || n.includes('hydra')) return '/monsters/hydra.jpg';
  if (n.includes('manticora') || n.includes('manticore')) return '/monsters/manticore.jpg';
  if (n.includes('cubo') || n.includes('gelatinoso')) return '/monsters/gelatinous_cube.jpg';
  if (n.includes('carniçal') || n.includes('ghoul')) return '/monsters/gnoll.jpg';
  return '/monsters/orc.jpg';
};

export const BESTIARY_SRD: Record<string, Omit<Enemy, 'id' | 'currentHp' | 'conditions'>> = {
  // ND 0 a 1/2
  Goblin: {
    name: 'Goblin Batedor',
    type: 'Humanoide (Goblinóide)',
    imageUrl: '/monsters/goblin.jpg',
    cr: '1/4',
    xp: 50,
    ac: 15,
    maxHp: 7,
    speed: 9,
    initiativeMod: 2,
    passivePerception: 9,
    savingThrows: { des: 2 },
    attacks: [
      { id: 'atk_cimitarra', name: 'Cimitarra', bonus: 4, damage: '1d6 + 2', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_arco_curto', name: 'Arco Curto', bonus: 4, damage: '1d6 + 2', damageType: 'perfurante', range: 'Distância (24/96m)' }
    ],
    notes: 'Escape Ágil: Pode Desengajar ou Esconder-se como ação bônus.'
  },
  Kobold: {
    name: 'Kobold Emboscador',
    type: 'Humanoide (Dracônico)',
    cr: '1/8',
    xp: 25,
    ac: 12,
    maxHp: 5,
    speed: 9,
    initiativeMod: 2,
    passivePerception: 8,
    savingThrows: { des: 2 },
    attacks: [
      { id: 'atk_adaga_kobold', name: 'Adaga', bonus: 4, damage: '1d4 + 2', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_funda', name: 'Funda', bonus: 4, damage: '1d4 + 2', damageType: 'concussão', range: 'Distância (9/36m)' }
    ],
    notes: 'Táticas de Matilha: Vantagem no ataque se um aliado estiver a 1.5m do alvo. Sensibilidade à Luz Solar.'
  },
  Orc: {
    name: 'Orc Guerreiro',
    type: 'Humanoide (Orc)',
    cr: '1/2',
    xp: 100,
    ac: 13,
    maxHp: 15,
    speed: 9,
    initiativeMod: 1,
    passivePerception: 10,
    savingThrows: { for: 3 },
    attacks: [
      { id: 'atk_machado_grande', name: 'Machado Grande', bonus: 5, damage: '1d12 + 3', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_azagaia', name: 'Azagaia', bonus: 5, damage: '1d6 + 3', damageType: 'perfurante', range: 'Arremesso (9/36m)' }
    ],
    notes: 'Agressivo: Como ação bônus, move-se até seu deslocamento em direção a um inimigo visível.'
  },
  Esqueleto: {
    name: 'Esqueleto Legionário',
    type: 'Morto-vivo',
    cr: '1/4',
    xp: 50,
    ac: 13,
    maxHp: 13,
    speed: 9,
    initiativeMod: 2,
    passivePerception: 9,
    savingThrows: { des: 2 },
    attacks: [
      { id: 'atk_espada_curta', name: 'Espada Curta', bonus: 4, damage: '1d6 + 2', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_arco_curto', name: 'Arco Curto', bonus: 4, damage: '1d6 + 2', damageType: 'perfurante', range: 'Distância (24/96m)' }
    ],
    notes: 'Vulnerabilidade: dano de concussão. Imunidade: veneno e exaustão.'
  },
  Zumbi: {
    name: 'Zumbi Pútrido',
    type: 'Morto-vivo',
    cr: '1/4',
    xp: 50,
    ac: 8,
    maxHp: 22,
    speed: 6,
    initiativeMod: -2,
    passivePerception: 8,
    savingThrows: { sab: 0 },
    attacks: [
      { id: 'atk_pancada', name: 'Pancada Brutal', bonus: 3, damage: '1d6 + 1', damageType: 'concussão', range: 'Corpo a corpo (1.5m)' }
    ],
    notes: 'Fortaleza dos Mortos-vivos: Se cair a 0 PV por dano não-radiante nem crítico, teste de CON (CD 5 + dano) para ficar com 1 PV.'
  },
  Lobo: {
    name: 'Lobo Selvagem',
    type: 'Fera',
    cr: '1/4',
    xp: 50,
    ac: 13,
    maxHp: 11,
    speed: 12,
    initiativeMod: 2,
    passivePerception: 13,
    savingThrows: { des: 2 },
    attacks: [
      {
        id: 'atk_mordida',
        name: 'Mordida Voraz',
        bonus: 4,
        damage: '2d4 + 2',
        damageType: 'perfurante',
        range: 'Corpo a corpo (1.5m)',
        saveDc: 11,
        saveType: 'for',
        description: 'Alvo deve passar em salvaguarda de Força CD 11 ou é derrubado no chão.'
      }
    ],
    notes: 'Táticas de Matilha. Faro e Audição Aguçados (vantagem em testes de Percepção).'
  },
  Bandido: {
    name: 'Bandido Salteador',
    type: 'Humanoide',
    cr: '1/8',
    xp: 25,
    ac: 12,
    maxHp: 11,
    speed: 9,
    initiativeMod: 1,
    passivePerception: 10,
    savingThrows: {},
    attacks: [
      { id: 'atk_cimitarra_bandido', name: 'Cimitarra', bonus: 3, damage: '1d6 + 1', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_besta_leve', name: 'Besta Leve', bonus: 3, damage: '1d8 + 1', damageType: 'perfurante', range: 'Distância (24/96m)' }
    ]
  },

  // ND 1 a 3
  Carnical: {
    name: 'Carniçal (Ghoul)',
    type: 'Morto-vivo',
    cr: '1',
    xp: 200,
    ac: 12,
    maxHp: 22,
    speed: 9,
    initiativeMod: 2,
    passivePerception: 10,
    savingThrows: {},
    attacks: [
      { id: 'atk_mordida_ghoul', name: 'Mordida', bonus: 2, damage: '2d6 + 2', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      {
        id: 'atk_garras_ghoul',
        name: 'Garras Paralisantes',
        bonus: 4,
        damage: '2d4 + 2',
        damageType: 'cortante',
        range: 'Corpo a corpo (1.5m)',
        saveDc: 10,
        saveType: 'con',
        description: 'Alvo humanoide que não seja elfo deve passar em salvaguarda de CON CD 10 ou fica paralisado por 1 minuto.'
      }
    ],
    notes: 'Imune a dano de veneno e condições de enfeitiçado, exaustão, envenenado.'
  },
  Mimico: {
    name: 'Mímico (Mimic)',
    type: 'Monstruosidade (Metamorfo)',
    cr: '2',
    xp: 450,
    ac: 12,
    maxHp: 58,
    speed: 4.5,
    initiativeMod: 1,
    passivePerception: 11,
    savingThrows: {},
    attacks: [
      { id: 'atk_pseudopode', name: 'Pseudópode Grudento', bonus: 5, damage: '1d8 + 3', damageType: 'concussão', range: 'Corpo a corpo (1.5m)', description: 'O alvo fica agarrado (CD 13 para escapar).' },
      { id: 'atk_mordida_mimic', name: 'Mordida com Dentes Afiados', bonus: 5, damage: '1d8 + 3', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' }
    ],
    notes: 'Metamorfo: Pode se transformar em qualquer objeto inanimado (baú, porta, estátua). Adesivo: Criaturas agarradas sofrem desvantagem.'
  },
  UrsoCoruja: {
    name: 'Urso-Coruja (Owlbear)',
    type: 'Monstruosidade',
    cr: '3',
    xp: 700,
    ac: 13,
    maxHp: 59,
    speed: 12,
    initiativeMod: 1,
    passivePerception: 13,
    savingThrows: { con: 5 },
    attacks: [
      { id: 'atk_bico', name: 'Bico Cortante', bonus: 7, damage: '1d10 + 5', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_garras_urso', name: 'Garras Devastadoras', bonus: 7, damage: '2d8 + 5', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' }
    ],
    notes: 'Ataque Múltiplo: Faz um ataque com bico e um ataque com as garras.'
  },
  Ogro: {
    name: 'Ogro Furioso',
    type: 'Gigante',
    cr: '2',
    xp: 450,
    ac: 11,
    maxHp: 59,
    speed: 12,
    initiativeMod: -1,
    passivePerception: 8,
    savingThrows: { for: 4 },
    attacks: [
      { id: 'atk_clava_grande', name: 'Clava Grande Brutal', bonus: 6, damage: '2d8 + 4', damageType: 'concussão', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_azagaia_ogro', name: 'Azagaia Pesada', bonus: 6, damage: '2d6 + 4', damageType: 'perfurante', range: 'Arremesso (9/36m)' }
    ]
  },
  CuboGelatinoso: {
    name: 'Cubo Gelatinoso',
    type: 'Limo',
    cr: '2',
    xp: 450,
    ac: 6,
    maxHp: 84,
    speed: 4.5,
    initiativeMod: -4,
    passivePerception: 8,
    savingThrows: {},
    attacks: [
      { id: 'atk_pseudopode_acido', name: 'Pancada Ácida', bonus: 4, damage: '3d6', damageType: 'ácido', range: 'Corpo a corpo (1.5m)' },
      {
        id: 'atk_engolir',
        name: 'Engolfar',
        bonus: 4,
        damage: '6d6',
        damageType: 'ácido',
        saveDc: 12,
        saveType: 'des',
        description: 'O cubo entra no espaço da criatura; ela deve passar em salvaguarda de DES CD 12 ou fica contida dentro do cubo sofrendo 6d6 de ácido por rodada.'
      }
    ],
    notes: 'Transparente: Difícil de notar quando imóvel (Percepção CD 15).'
  },

  // ND 4 a 6
  Troll: {
    name: 'Troll da Caverna',
    type: 'Gigante',
    cr: '5',
    xp: 1800,
    ac: 15,
    maxHp: 84,
    speed: 9,
    initiativeMod: 1,
    passivePerception: 12,
    savingThrows: { con: 6 },
    attacks: [
      { id: 'atk_mordida_troll', name: 'Mordida Voraz', bonus: 7, damage: '1d6 + 4', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_garras_troll', name: 'Garras Rasgadoras', bonus: 7, damage: '2d6 + 4', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' }
    ],
    notes: 'Regeneração: O troll recupera 10 PV no início de seu turno, a menos que sofra dano de ácido ou fogo.'
  },
  Medusa: {
    name: 'Medusa',
    type: 'Monstruosidade',
    cr: '6',
    xp: 2300,
    ac: 15,
    maxHp: 127,
    speed: 9,
    initiativeMod: 2,
    passivePerception: 10,
    savingThrows: { des: 5, con: 4, sab: 3 },
    attacks: [
      { id: 'atk_serpentes', name: 'Cabelos de Serpente', bonus: 5, damage: '1d4 + 2', damageType: 'perfurante', description: 'Mais 4d6 de dano de veneno.' },
      { id: 'atk_arco_medusa', name: 'Arco Longo Preciso', bonus: 5, damage: '1d8 + 2', damageType: 'perfurante', range: 'Distância (45/180m)' },
      {
        id: 'atk_olhar_petrificante',
        name: 'Olhar Petrificante',
        bonus: 0,
        damage: '0',
        damageType: 'petrificação',
        saveDc: 14,
        saveType: 'con',
        description: 'Criaturas que olharem devem passar em CON CD 14 ou começam a virar pedra. Se falhar por 5 ou mais, fica petrificada instantaneamente.'
      }
    ]
  },
  Manticora: {
    name: 'Manticora',
    type: 'Monstruosidade',
    cr: '3',
    xp: 700,
    ac: 14,
    maxHp: 68,
    speed: 15, // voo
    initiativeMod: 3,
    passivePerception: 12,
    savingThrows: {},
    attacks: [
      { id: 'atk_mordida_manticora', name: 'Mordida Leoa', bonus: 5, damage: '1d8 + 3', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_espinho_cauda', name: 'Espinhos da Cauda', bonus: 5, damage: '1d8 + 3', damageType: 'perfurante', range: 'Distância (30/72m)' }
    ],
    notes: 'Ataque Múltiplo: Faz três ataques (mordida e duas garras, ou três espinhos da cauda).'
  },

  // ND 7 a 10
  DevoradorDeMentes: {
    name: 'Devorador de Mentes (Mind Flayer)',
    type: 'Aberração',
    cr: '7',
    xp: 2900,
    ac: 15,
    maxHp: 71,
    speed: 9,
    initiativeMod: 1,
    passivePerception: 17,
    savingThrows: { int: 7, sab: 6, car: 6 },
    attacks: [
      { id: 'atk_tentaculos', name: 'Tentáculos Psíquicos', bonus: 7, damage: '2d10 + 4', damageType: 'psíquico', range: 'Corpo a corpo (1.5m)', description: 'Alvo fica atordoado (CD 15 INT para resistir).' },
      { id: 'atk_extrair_cerebro', name: 'Extrair Cérebro', bonus: 7, damage: '10d10', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)', description: 'Se o alvo estiver incapacitado e tiver a vida reduzida a 0, o cérebro é devorado e ele morre instantaneamente.' },
      {
        id: 'atk_rajada_mental',
        name: 'Rajada Mental (Mind Blast)',
        bonus: 0,
        damage: '4d8 + 4',
        damageType: 'psíquico',
        saveDc: 15,
        saveType: 'int',
        range: 'Cone de 18m',
        description: 'Cone de 18m. Todas as criaturas devem passar em salvaguarda de INT CD 15 ou sofrem 4d8+4 de dano psíquico e ficam atordoadas por 1 minuto.'
      }
    ],
    notes: 'Resistência à Magia (vantagem em salvaguardas contra feitiços). Conjurador Psiônico.'
  },
  DragaoVermelhoJovem: {
    name: 'Dragão Vermelho Jovem',
    type: 'Dragão',
    cr: '10',
    xp: 5900,
    ac: 18,
    maxHp: 178,
    speed: 24, // Voo
    initiativeMod: 0,
    passivePerception: 18,
    savingThrows: { des: 4, con: 8, sab: 4, car: 6 },
    attacks: [
      { id: 'atk_mordida_dragao', name: 'Mordida Dracônica Flamejante', bonus: 10, damage: '2d10 + 6', damageType: 'perfurante', description: 'Mais 1d6 de dano de fogo.' },
      { id: 'atk_garras_dragao', name: 'Garras Afiadas', bonus: 10, damage: '2d6 + 6', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' },
      {
        id: 'atk_sopro_fogo',
        name: 'Sopro de Fogo Devastador',
        bonus: 0,
        damage: '16d6',
        damageType: 'fogo',
        saveDc: 17,
        saveType: 'des',
        range: 'Cone de 9m',
        description: 'Cone de 9m. Criaturas devem passar em DES CD 17 ou sofrem 16d6 de fogo (metade no sucesso).'
      }
    ],
    notes: 'Ataque Múltiplo (três ataques). Imune a dano de fogo.'
  },
  Hidra: {
    name: 'Hidra de Muitas Cabeças',
    type: 'Monstruosidade',
    cr: '8',
    xp: 3900,
    ac: 15,
    maxHp: 172,
    speed: 9,
    initiativeMod: 1,
    passivePerception: 16,
    savingThrows: { con: 8 },
    attacks: [
      { id: 'atk_mordida_hidra', name: 'Mordida de Cabeça Múltipla', bonus: 8, damage: '1d10 + 5', damageType: 'perfurante', range: 'Corpo a corpo (3m)' }
    ],
    notes: 'Cabeças Múltiplas: Faz tantos ataques de mordida quanto tiver cabeças (começa com 5). Se uma cabeça for decepada sem dano de fogo, duas cabeças nascem no lugar!'
  },

  // ND 11 a 20+ (Chefes e Lendas)
  Beholder: {
    name: 'Beholder (Observador)',
    type: 'Aberração',
    cr: '13',
    xp: 10000,
    ac: 18,
    maxHp: 180,
    speed: 6, // Flutua
    initiativeMod: 2,
    passivePerception: 22,
    savingThrows: { int: 8, sab: 7, car: 8 },
    attacks: [
      { id: 'atk_mordida_beholder', name: 'Mordida Monstruosa', bonus: 5, damage: '4d6', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      {
        id: 'atk_raios_oculares',
        name: 'Raios Oculares Aleatórios (3 raios por turno)',
        bonus: 0,
        damage: 'Variável',
        damageType: 'mágico',
        saveDc: 16,
        saveType: 'des',
        range: '36 metros',
        description: 'Dispara 3 raios aleatórios: Encantamento, Paralisia, Medo, Lentidão, Morte (10d10 necrótico), Petrificação ou Desintegração (10d6+40).'
      }
    ],
    notes: 'Cone Antimagia: O olho central emite um cone de 45m de supressão mágica absoluta.'
  },
  Lich: {
    name: 'Lich Arquimago',
    type: 'Morto-vivo',
    cr: '21',
    xp: 33000,
    ac: 17,
    maxHp: 135,
    speed: 9,
    initiativeMod: 3,
    passivePerception: 19,
    savingThrows: { con: 10, int: 12, sab: 9 },
    attacks: [
      { id: 'atk_toque_paralisante', name: 'Toque Paralisante Gelado', bonus: 12, damage: '3d6', damageType: 'frio', saveDc: 18, saveType: 'con', description: 'Alvo fica paralisado para sempre até uma magia Dissipar o Mal.' },
      { id: 'atk_palavra_poder_matar', name: 'Palavra de Poder Matar (9º Círculo)', bonus: 0, damage: 'Instantâneo', damageType: 'morte', range: '18 metros', description: 'Se o alvo tiver 100 PV ou menos, morre instantaneamente.' },
      { id: 'atk_desintegrar', name: 'Desintegrar (6º Círculo)', bonus: 0, damage: '10d6 + 40', damageType: 'força', saveDc: 20, saveType: 'des' }
    ],
    notes: 'Resistência Lendária (3/dia). Filactéria: Se destruído, ganha um novo corpo em 1d10 dias enquanto a filactéria existir.'
  },
  DragaoVermelhoAnciao: {
    name: 'Dragão Vermelho Ancião (Colossal)',
    type: 'Dragão',
    cr: '24',
    xp: 62000,
    ac: 22,
    maxHp: 546,
    speed: 24, // Voo 24m
    initiativeMod: 0,
    passivePerception: 26,
    savingThrows: { des: 7, con: 16, sab: 9, car: 13 },
    attacks: [
      { id: 'atk_mordida_anciao', name: 'Mordida Titânica Flamejante', bonus: 17, damage: '2d10 + 10', damageType: 'perfurante', description: 'Mais 4d6 de fogo.' },
      { id: 'atk_garras_anciao', name: 'Garras Avassaladoras', bonus: 17, damage: '2d6 + 10', damageType: 'cortante', range: 'Corpo a corpo (3m)' },
      {
        id: 'atk_sopro_catastrofico',
        name: 'Sopro de Fogo Catastrófico',
        bonus: 0,
        damage: '26d6',
        damageType: 'fogo',
        saveDc: 24,
        saveType: 'des',
        range: 'Cone de 27m',
        description: 'Cone de 27 metros. CD 24 Destreza. Causa 26d6 de fogo (metade no sucesso).'
      }
    ],
    notes: 'Presença Aterradora (CD 21 SAB). Resistência Lendária (3/dia). Ações Lendárias (Ataque com cauda, bater de asas).'
  }
};

const STORAGE_CUSTOM_BESTIARY_KEY = 'dungeons_custom_bestiary_v1';

export class MonsterRegistry {
  public static getCustomMonsters(): Record<string, Omit<Enemy, 'id' | 'currentHp' | 'conditions'>> {
    try {
      const data = localStorage.getItem(STORAGE_CUSTOM_BESTIARY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Falha ao ler bestiário customizado:', e);
    }
    return {};
  }

  public static saveCustomMonster(monster: Omit<Enemy, 'id' | 'currentHp' | 'conditions'>): void {
    try {
      const existing = this.getCustomMonsters();
      existing[monster.name] = monster;
      localStorage.setItem(STORAGE_CUSTOM_BESTIARY_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Falha ao salvar monstro customizado:', e);
    }
  }

  public static deleteCustomMonster(monsterName: string): void {
    try {
      const existing = this.getCustomMonsters();
      delete existing[monsterName];
      localStorage.setItem(STORAGE_CUSTOM_BESTIARY_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Falha ao remover monstro customizado:', e);
    }
  }

  public static getAllAvailableMonsters(): Record<string, Omit<Enemy, 'id' | 'currentHp' | 'conditions'>> {
    const custom = this.getCustomMonsters();
    return { ...BESTIARY_SRD, ...custom };
  }

  public static createEnemyInstance(templateKeyOrName: string, customName?: string): Enemy {
    const all = this.getAllAvailableMonsters();
    const tpl = all[templateKeyOrName] || BESTIARY_SRD['Orc'] || Object.values(all)[0];
    const uid = `enemy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return {
      id: uid,
      name: customName || tpl.name,
      type: tpl.type,
      cr: tpl.cr,
      xp: tpl.xp || CR_XP_MAP[tpl.cr] || 100,
      ac: tpl.ac,
      maxHp: tpl.maxHp,
      currentHp: tpl.maxHp,
      speed: tpl.speed,
      initiativeMod: tpl.initiativeMod,
      attacks: tpl.attacks.map(a => ({ ...a })),
      savingThrows: { ...tpl.savingThrows },
      passivePerception: tpl.passivePerception,
      conditions: [],
      notes: tpl.notes,
      imageUrl: tpl.imageUrl || getMonsterFallbackImage(customName || tpl.name, tpl.type)
    };
  }
}

export const createEnemyInstance = (templateKeyOrName: string, customName?: string) =>
  MonsterRegistry.createEnemyInstance(templateKeyOrName, customName);
