import { AvatarPreset } from '../types/auth';

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar_dm_tome',
    name: 'Mestre da Masmorra',
    category: 'mestre',
    iconName: 'Crown',
    image: '/extracted_art/art_0.jpg'
  },
  {
    id: 'avatar_warrior_dwarf',
    name: 'Thorin (Guerreiro Anão)',
    category: 'guerreiro',
    iconName: 'Shield',
    image: '/extracted_art/art_3.jpg'
  },
  {
    id: 'avatar_mage_elf',
    name: 'Lyra (Maga Elfa)',
    category: 'conjurador',
    iconName: 'Sparkles',
    image: '/extracted_art/art_4.jpg'
  },
  {
    id: 'avatar_rogue_shadow',
    name: 'Ladino das Sombras',
    category: 'ladino',
    iconName: 'Skull',
    image: '/extracted_art/art_5.jpg'
  },
  {
    id: 'avatar_paladin_holy',
    name: 'Paladino da Luz',
    category: 'guerreiro',
    iconName: 'ShieldAlert',
    image: '/extracted_art/art_7.jpg'
  },
  {
    id: 'avatar_cleric_sun',
    name: 'Clérigo da Vida',
    category: 'conjurador',
    iconName: 'Sun',
    image: '/extracted_art/art_8.jpg'
  },
  {
    id: 'avatar_dragon_fire',
    name: 'Guerreiro Dracônico',
    category: 'monstro',
    iconName: 'Flame',
    image: '/extracted_art/art_9.jpg'
  },
  {
    id: 'avatar_ranger_wood',
    name: 'Patrulheiro Selvagem',
    category: 'guerreiro',
    iconName: 'Compass',
    image: '/extracted_art/art_11.jpg'
  }
];

export const getAvatarImage = (avatarIdOrUrl: string): string => {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarIdOrUrl);
  if (preset && preset.image) return preset.image;
  if (avatarIdOrUrl.startsWith('http') || avatarIdOrUrl.startsWith('/')) return avatarIdOrUrl;
  return '/extracted_art/art_0.jpg';
};
