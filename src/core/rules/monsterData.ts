import { Enemy } from '../types/dnd';

export const BESTIARY_SRD: Record<string, Omit<Enemy, 'id' | 'currentHp' | 'conditions'>> = {
  Goblin: {
    name: 'Goblin',
    type: 'Humanoide (Goblinóide)',
    cr: '1/4',
    xp: 50,
    ac: 15, // Armadura de Couro + Escudo + Des
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
  Orc: {
    name: 'Orc Guerreiro',
    type: 'Humanoide (Orc)',
    cr: '1/2',
    xp: 100,
    ac: 13, // Pele curtida
    maxHp: 15,
    speed: 9,
    initiativeMod: 1,
    passivePerception: 10,
    savingThrows: { for: 3 },
    attacks: [
      { id: 'atk_machado_grande', name: 'Machado Grande', bonus: 5, damage: '1d12 + 3', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_azagaia', name: 'Azagaia', bonus: 5, damage: '1d6 + 3', damageType: 'perfurante', range: 'Arremesso (9/36m)' }
    ],
    notes: 'Agressivo: Como ação bônus, pode se mover até seu deslocamento em direção a um inimigo visível.'
  },
  Esqueleto: {
    name: 'Esqueleto',
    type: 'Morto-vivo',
    cr: '1/4',
    xp: 50,
    ac: 13, // Restos de armadura
    maxHp: 13,
    speed: 9,
    initiativeMod: 2,
    passivePerception: 9,
    savingThrows: { des: 2 },
    attacks: [
      { id: 'atk_espada_curta', name: 'Espada Curta', bonus: 4, damage: '1d6 + 2', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' },
      { id: 'atk_arco_curto', name: 'Arco Curto', bonus: 4, damage: '1d6 + 2', damageType: 'perfurante', range: 'Distância (24/96m)' }
    ],
    notes: 'Vulnerável a dano de concussão. Imune a dano de veneno e exaustão.'
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
        description: 'Se o alvo for uma criatura, deve passar numa salvaguarda de Força CD 11 ou cair no chão.'
      }
    ],
    notes: 'Táticas de Matilha: Tem vantagem nas jogadas de ataque se um aliado do lobo estiver a 1.5m do alvo.'
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
    ],
    notes: 'Golpes avassaladores e alcance longo.'
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
    ],
    notes: 'Luta suja em grupos.'
  }
};

export function createEnemyInstance(templateKey: string, customName?: string): Enemy {
  const tpl = BESTIARY_SRD[templateKey] || BESTIARY_SRD['Goblin'];
  const uid = `enemy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return {
    id: uid,
    name: customName || tpl.name,
    type: tpl.type,
    cr: tpl.cr,
    xp: tpl.xp,
    ac: tpl.ac,
    maxHp: tpl.maxHp,
    currentHp: tpl.maxHp,
    speed: tpl.speed,
    initiativeMod: tpl.initiativeMod,
    attacks: tpl.attacks.map(a => ({ ...a })),
    savingThrows: { ...tpl.savingThrows },
    passivePerception: tpl.passivePerception,
    conditions: [],
    notes: tpl.notes
  };
}
