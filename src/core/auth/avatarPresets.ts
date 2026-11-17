import { AvatarPreset } from '../types/auth';

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar_mage_art',
    name: 'Mago Arcano',
    category: 'conjurador',
    iconName: 'Sparkles',
    image: '/artes/mago.jpeg'
  },
  {
    id: 'avatar_warrior_art',
    name: 'Guerreiro Marcial',
    category: 'guerreiro',
    iconName: 'Swords',
    image: '/artes/guerreiro.jpeg'
  },
  {
    id: 'avatar_rogue_art',
    name: 'Ladino das Sombras',
    category: 'ladino',
    iconName: 'Skull',
    image: '/artes/ladino.jpeg'
  },
  {
    id: 'avatar_cleric_art',
    name: 'Clérigo da Fé',
    category: 'conjurador',
    iconName: 'Sun',
    image: '/artes/clerigo.jpeg'
  },
  {
    id: 'avatar_barbarian_art',
    name: 'Bárbaro Primal',
    category: 'guerreiro',
    iconName: 'Shield',
    image: '/artes/barbaro.jpeg'
  },
  {
    id: 'avatar_bard_art',
    name: 'Bardo Menestrel',
    category: 'conjurador',
    iconName: 'Music',
    image: '/artes/bardo.jpeg'
  },
  {
    id: 'avatar_paladin_art',
    name: 'Paladino Sagrado',
    category: 'guerreiro',
    iconName: 'Shield',
    image: '/artes/paladino.jpeg'
  },
  {
    id: 'avatar_ranger_art',
    name: 'Patrulheiro dos Ermos',
    category: 'guerreiro',
    iconName: 'Compass',
    image: '/artes/patrulheiro.jpeg'
  },
  {
    id: 'avatar_druid_art',
    name: 'Druida da Natureza',
    category: 'conjurador',
    iconName: 'Compass',
    image: '/artes/druida.jpeg'
  },
  {
    id: 'avatar_monk_art',
    name: 'Monge Ki',
    category: 'guerreiro',
    iconName: 'Zap',
    image: '/artes/monge.jpeg'
  },
  {
    id: 'avatar_warlock_art',
    name: 'Bruxo do Pacto',
    category: 'conjurador',
    iconName: 'Sparkles',
    image: '/artes/bruxo.jpeg'
  },
  {
    id: 'avatar_sorcerer_art',
    name: 'Feiticeiro Dracônico',
    category: 'conjurador',
    iconName: 'Flame',
    image: '/artes/feiticeiro.jpeg'
  },
  {
    id: 'avatar_balrog_art',
    name: 'Balrog Demônio Maior',
    category: 'monstro',
    iconName: 'Flame',
    image: '/artes/Balrog.jpeg'
  },
  {
    id: 'avatar_vampire_art',
    name: 'Lorde Vampiro',
    category: 'monstro',
    iconName: 'Skull',
    image: '/artes/vampiro.jpeg'
  },
  {
    id: 'avatar_troll_art',
    name: 'Troll da Caverna',
    category: 'monstro',
    iconName: 'Zap',
    image: '/artes/Troll.jpeg'
  },
  {
    id: 'avatar_dm_tome',
    name: 'Mestre da Masmorra',
    category: 'mestre',
    iconName: 'Crown',
    image: '/artes/guerreiro.jpeg'
  }
];

export const getAvatarImage = (avatarIdOrUrl: string): string => {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarIdOrUrl);
  if (preset && preset.image) return preset.image;
  if (avatarIdOrUrl.startsWith('http') || avatarIdOrUrl.startsWith('/')) return avatarIdOrUrl;
  return '/artes/guerreiro.jpeg';
};
