export type UserRole = 'dm' | 'player';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatar: string; // url or preset id ('crown', 'warrior', 'mage', 'rogue', etc.)
  characterIds: string[]; // List of character IDs owned/controlled by this user
  bio?: string;
  color?: string; // Accent color hex
  createdAt: string;
}

export interface AvatarPreset {
  id: string;
  name: string;
  category: 'mestre' | 'guerreiro' | 'conjurador' | 'ladino' | 'monstro';
  iconName: string;
  image?: string;
}
