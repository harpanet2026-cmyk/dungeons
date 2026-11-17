import { AvatarPreset } from '../types/auth';

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar_dm_tome',
    name: 'Mestre da Masmorra',
    category: 'mestre',
    iconName: 'Crown',
    image: '/heroes/hero_warrior.jpg'
  },
  {
    id: 'avatar_warrior_dwarf',
    name: 'Thorin (Guerreiro Anão)',
    category: 'guerreiro',
    iconName: 'Shield',
    image: '/heroes/thorin_warrior.jpg'
  },
  {
    id: 'avatar_mage_elf',
    name: 'Lyra (Maga Elfa)',
    category: 'conjurador',
    iconName: 'Sparkles',
    image: '/heroes/lyra_mage.jpg'
  },
  {
    id: 'avatar_champion_volo',
    name: 'Guerreiro Campeão (Volo)',
    category: 'guerreiro',
    iconName: 'Swords',
    image: '/heroes/champion.jpg'
  },
  {
    id: 'avatar_rogue_shadow',
    name: 'Ladino das Sombras',
    category: 'ladino',
    iconName: 'Skull',
    image: '/heroes/rogue.jpg'
  },
  {
    id: 'avatar_cleric_sun',
    name: 'Clérigo da Luz',
    category: 'conjurador',
    iconName: 'Sun',
    image: '/heroes/cleric.jpg'
  },
  {
    id: 'avatar_druid_volo',
    name: 'Arquidruida (Guia de Volo)',
    category: 'conjurador',
    iconName: 'Compass',
    image: '/heroes/druid.jpg'
  },
  {
    id: 'avatar_warlock_volo',
    name: 'Bruxo Arquiférico (Guia de Volo)',
    category: 'conjurador',
    iconName: 'Sparkles',
    image: '/heroes/warlock.jpg'
  },
  {
    id: 'avatar_bard_volo',
    name: 'Bardo Trovador (Guia de Volo)',
    category: 'conjurador',
    iconName: 'Music',
    image: '/heroes/bard.jpg'
  },
  {
    id: 'avatar_mind_flayer',
    name: 'Devorador de Mentes (Guia de Volo)',
    category: 'monstro',
    iconName: 'Zap',
    image: '/monsters/mind_flayer.jpg'
  },
  {
    id: 'avatar_beholder',
    name: 'Beholder Observador (Guia de Volo)',
    category: 'monstro',
    iconName: 'Eye',
    image: '/monsters/beholder.jpg'
  },
  {
    id: 'avatar_dragon_fire',
    name: 'Guarda Dragonete (Guia de Volo)',
    category: 'monstro',
    iconName: 'Flame',
    image: '/monsters/dragon.jpg'
  }
];

export const getAvatarImage = (avatarIdOrUrl: string): string => {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarIdOrUrl);
  if (preset && preset.image) return preset.image;
  if (avatarIdOrUrl.startsWith('http') || avatarIdOrUrl.startsWith('/')) return avatarIdOrUrl;
  return '/extracted_art/art_0.jpg';
};
