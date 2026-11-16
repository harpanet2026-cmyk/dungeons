import { Spell } from '../types/dnd';

export interface CompendiumSpell extends Spell {
  school: 'Abjuração' | 'Adivinhação' | 'Conjuração' | 'Encantamento' | 'Evocação' | 'Ilusão' | 'Necromancia' | 'Transmutação';
  classes: string[];
  components: string;
  duration: string;
  castingTime: string;
}

export const SPELL_COMPENDIUM: CompendiumSpell[] = [
  // TRUQUES (NÍVEL 0)
  {
    id: 'sp_rajada_mistica',
    name: 'Rajada Mística (Eldritch Blast)',
    level: 0,
    school: 'Evocação',
    classes: ['Bruxo'],
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Um raio crepitante de energia azul atinge uma criatura no alcance. Faça um ataque mágico à distância. Se acertar, o alvo sofre 1d10 de dano de energia.',
    damage: '1d10 energia'
  },
  {
    id: 'sp_raio_fogo',
    name: 'Raio de Fogo (Fire Bolt)',
    level: 0,
    school: 'Evocação',
    classes: ['Mago', 'Feiticeiro'],
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Você arremessa um raio de fogo em uma criatura ou objeto no alcance. Faça um ataque mágico à distância. Se acertar, o alvo sofre 1d10 de dano de fogo.',
    damage: '1d10 fogo'
  },
  {
    id: 'sp_luz',
    name: 'Luz (Light)',
    level: 0,
    school: 'Evocação',
    classes: ['Bardo', 'Clérigo', 'Mago', 'Feiticeiro'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, M (um vaga-lume)',
    duration: '1 hora',
    description: 'Você toca um objeto com até 3 metros de dimensão. O objeto emite luz plena em um raio de 6 metros e meia-luz por mais 6 metros adicionais.'
  },
  {
    id: 'sp_maos_magicas',
    name: 'Mãos Mágicas (Mage Hand)',
    level: 0,
    school: 'Conjuração',
    classes: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V, S',
    duration: '1 minuto',
    description: 'Uma mão espectral translúcida surge em um ponto escolhido. Você pode usar a mão para manipular objetos, abrir portas destrancadas ou pegar itens de até 4,5 kg.'
  },
  {
    id: 'sp_toque_chocante',
    name: 'Toque Chocante (Shocking Grasp)',
    level: 0,
    school: 'Evocação',
    classes: ['Mago', 'Feiticeiro'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Eletricidade estala em sua mão. Faça um ataque mágico corpo a corpo (com vantagem se o alvo usar armadura de metal). Causa 1d8 de dano elétrico e impede o alvo de ter reações até seu próximo turno.',
    damage: '1d8 elétrico'
  },

  // 1º CÍRCULO
  {
    id: 'sp_projetil_magico',
    name: 'Projétil Mágico (Magic Missile)',
    level: 1,
    school: 'Evocação',
    classes: ['Mago', 'Feiticeiro'],
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Você cria três dardos brilhantes de energia mágica. Cada dardo atinge infalivelmente uma criatura de sua escolha no alcance, causando 1d4 + 1 de dano de energia cada.',
    damage: '3x (1d4+1) energia'
  },
  {
    id: 'sp_curar_ferimentos',
    name: 'Curar Ferimentos (Cure Wounds)',
    level: 1,
    school: 'Evocação',
    classes: ['Bardo', 'Clérigo', 'Druida', 'Paladino', 'Patrulheiro'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Uma criatura que você toca recupera pontos de vida iguais a 1d8 + seu modificador de habilidade de conjuração.',
    damage: '1d8 + mod cura'
  },
  {
    id: 'sp_escudo_arcano',
    name: 'Escudo Arcano (Shield)',
    level: 1,
    school: 'Abjuração',
    classes: ['Mago', 'Feiticeiro'],
    castingTime: '1 reação (ao ser atingido por um ataque)',
    range: 'Pessoal',
    components: 'V, S',
    duration: '1 rodada',
    description: 'Uma barreira invisível de força mágica protege você. Até o início do seu próximo turno, você tem um bônus de +5 na CA, inclusive contra o ataque desencadeador, e não sofre dano de Projétil Mágico.'
  },
  {
    id: 'sp_armadura_arcana',
    name: 'Armadura Arcana (Mage Armor)',
    level: 1,
    school: 'Abjuração',
    classes: ['Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S, M (um pedaço de couro curado)',
    duration: '8 horas',
    description: 'Você toca uma criatura voluntária desarmada. A CA básica do alvo se torna 13 + seu modificador de Destreza até o término da magia.'
  },
  {
    id: 'sp_onda_trovejante',
    name: 'Onda Trovejante (Thunderwave)',
    level: 1,
    school: 'Evocação',
    classes: ['Bardo', 'Druida', 'Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: 'Pessoal (cubo de 4,5m)',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Uma onda de força trovejante emana de você. Cada criatura no cubo deve fazer uma salvaguarda de Constituição. Se falhar, sofre 2d8 de dano trovejante e é empurrada 3 metros longe.',
    damage: '2d8 trovejante'
  },
  {
    id: 'sp_bencao',
    name: 'Bênção (Bless)',
    level: 1,
    school: 'Encantamento',
    classes: ['Clérigo', 'Paladino'],
    castingTime: '1 ação',
    range: '9 metros',
    components: 'V, S, M (uma gota de água benta)',
    duration: 'Concentração, até 1 minuto',
    description: 'Você abençoa até três criaturas. Sempre que um alvo fizer uma jogada de ataque ou teste de resistência antes do fim da magia, ele adiciona 1d4 à jogada.'
  },

  // 2º CÍRCULO
  {
    id: 'sp_passo_nebuloso',
    name: 'Passo Nebuloso (Misty Step)',
    level: 2,
    school: 'Conjuração',
    classes: ['Bruxo', 'Feiticeiro', 'Mago'],
    castingTime: '1 ação bônus',
    range: 'Pessoal',
    components: 'V',
    duration: 'Instantânea',
    description: 'Brevemente envolto em névoa prateada, você se teletransporta até 9 metros para um espaço desocupado que possa ver.'
  },
  {
    id: 'sp_invisibilidade',
    name: 'Invisibilidade (Invisibility)',
    level: 2,
    school: 'Ilusão',
    classes: ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S, M (um cílio envolto em goma)',
    duration: 'Concentração, até 1 hora',
    description: 'Uma criatura tocada se torna invisível até o término da magia. A magia se encerra prematuramente se o alvo atacar ou conjurar uma magia.'
  },
  {
    id: 'sp_raio_ardente',
    name: 'Raio Ardente (Scorching Ray)',
    level: 2,
    school: 'Evocação',
    classes: ['Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: '36 metros',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Você cria três raios de fogo e os arremessa em alvos no alcance. Faça um ataque mágico à distância para cada raio. Cada acerto causa 2d6 de dano de fogo.',
    damage: '3x 2d6 fogo'
  },
  {
    id: 'sp_restauracao_menor',
    name: 'Restauração Menor (Lesser Restoration)',
    level: 2,
    school: 'Abjuração',
    classes: ['Bardo', 'Clérigo', 'Druida', 'Paladino', 'Patrulheiro'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S',
    duration: 'Instantânea',
    description: 'Você toca uma criatura e encerra uma doença ou uma das seguintes condições: cego, surdo, paralisado ou envenenado.'
  },

  // 3º CÍRCULO
  {
    id: 'sp_bola_de_fogo',
    name: 'Bola de Fogo (Fireball)',
    level: 3,
    school: 'Evocação',
    classes: ['Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: '45 metros',
    components: 'V, S, M (uma bolinha de guano de morcego e enxofre)',
    duration: 'Instantânea',
    description: 'Um raio brilhante lampeja do seu dedo até um ponto no alcance, explodindo em um estrondo flamejante. Cada criatura em uma esfera de 6 metros de raio deve fazer uma salvaguarda de Destreza, sofrendo 8d6 de dano de fogo (metade em sucesso).',
    damage: '8d6 fogo'
  },
  {
    id: 'sp_relampago',
    name: 'Relâmpago (Lightning Bolt)',
    level: 3,
    school: 'Evocação',
    classes: ['Feiticeiro', 'Mago'],
    castingTime: '1 ação',
    range: 'Pessoal (linha de 30m x 1,5m)',
    components: 'V, S, M (um pedaço de pelo e uma haste de âmbar)',
    duration: 'Instantânea',
    description: 'Um arco voltaico de relâmpago de 30 metros de comprimento emana de você. Criaturas na linha devem fazer salvaguarda de Destreza, sofrendo 8d6 de dano elétrico em falha.',
    damage: '8d6 elétrico'
  },
  {
    id: 'sp_contra_magica',
    name: 'Contramágica (Counterspell)',
    level: 3,
    school: 'Abjuração',
    classes: ['Bruxo', 'Feiticeiro', 'Mago'],
    castingTime: '1 reação (ao ver uma criatura a 18m conjurando)',
    range: '18 metros',
    components: 'S',
    duration: 'Instantânea',
    description: 'Você tenta interromper uma criatura no processo de conjurar uma magia. Se a criatura estiver conjurando uma magia de 3º nível ou inferior, a magia falha automaticamente.'
  },
  {
    id: 'sp_reviver',
    name: 'Reviver os Mortos (Revivify)',
    level: 3,
    school: 'Necromancia',
    classes: ['Clérigo', 'Paladino'],
    castingTime: '1 ação',
    range: 'Toque',
    components: 'V, S, M (diamantes no valor de 300 PO, consumidos)',
    duration: 'Instantânea',
    description: 'Você toca uma criatura que tenha morrido no último minuto. A criatura volta à vida com 1 ponto de vida.'
  }
];
