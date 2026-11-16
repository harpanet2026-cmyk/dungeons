import { UserProfile, UserRole } from '../types/auth';

const STORAGE_USERS_KEY = 'dungeons_gemini_users_v1';
const STORAGE_ACTIVE_USER_KEY = 'dungeons_gemini_active_user_v1';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_dm',
    username: 'mestre',
    displayName: 'Mestre da Masmorra',
    role: 'dm',
    avatar: 'avatar_dm_tome',
    characterIds: [], // DM has access to all characters
    bio: 'Narrador, árbitro dos dados e mestre de campanha junto ao Gemini Pro.',
    color: '#f5ba42',
    createdAt: '2026-11-16T00:00:00.000Z'
  },
  {
    id: 'user_guilherme',
    username: 'guilherme',
    displayName: 'Guilherme',
    role: 'player',
    avatar: 'avatar_warrior_dwarf',
    characterIds: ['char_thorin'],
    bio: 'Controlador de Thorin Quebra-Escudos. Vanguarda de ferro do grupo.',
    color: '#eab308',
    createdAt: '2026-11-16T00:00:00.000Z'
  },
  {
    id: 'user_beatriz',
    username: 'beatriz',
    displayName: 'Beatriz',
    role: 'player',
    avatar: 'avatar_mage_elf',
    characterIds: ['char_lyra'],
    bio: 'Controladora de Lyra Cantolunar. Tecedora de magias arcanas.',
    color: '#a855f7',
    createdAt: '2026-11-16T00:00:00.000Z'
  }
];

export class AuthManager {
  static getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  static saveUsers(users: UserProfile[]): void {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  static getCurrentUser(): UserProfile {
    const users = this.getUsers();
    const activeId = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
    if (activeId) {
      const found = users.find(u => u.id === activeId);
      if (found) return found;
    }
    // Default to DM or first user
    const defaultUser = users[0] || DEFAULT_USERS[0];
    localStorage.setItem(STORAGE_ACTIVE_USER_KEY, defaultUser.id);
    return defaultUser;
  }

  static login(userId: string): UserProfile {
    const users = this.getUsers();
    const found = users.find(u => u.id === userId);
    if (!found) throw new Error('Usuário não encontrado.');
    localStorage.setItem(STORAGE_ACTIVE_USER_KEY, found.id);
    return found;
  }

  static register(data: {
    username: string;
    displayName: string;
    role: UserRole;
    avatar: string;
    characterIds?: string[];
    bio?: string;
    color?: string;
  }): UserProfile {
    const users = this.getUsers();
    const normalizedUsername = data.username.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === normalizedUsername)) {
      throw new Error(`O usuário "${normalizedUsername}" já existe. Escolha outro nome.`);
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: normalizedUsername,
      displayName: data.displayName.trim() || normalizedUsername,
      role: data.role,
      avatar: data.avatar || 'avatar_warrior_dwarf',
      characterIds: data.characterIds || [],
      bio: data.bio || '',
      color: data.color || (data.role === 'dm' ? '#f5ba42' : '#38bdf8'),
      createdAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    this.saveUsers(updated);
    this.login(newUser.id);
    return newUser;
  }

  static updateUser(updatedUser: UserProfile): void {
    const users = this.getUsers();
    const next = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    this.saveUsers(next);
  }

  static deleteUser(userId: string): void {
    const users = this.getUsers();
    if (users.length <= 1) {
      throw new Error('Não é possível excluir o único usuário restante.');
    }
    const filtered = users.filter(u => u.id !== userId);
    this.saveUsers(filtered);
    
    // If the active user was deleted, switch to the first user
    const currentActive = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
    if (currentActive === userId) {
      this.login(filtered[0].id);
    }
  }

  static linkCharacter(userId: string, characterId: string): void {
    const users = this.getUsers();
    const next = users.map(u => {
      if (u.id === userId) {
        if (!u.characterIds.includes(characterId)) {
          return { ...u, characterIds: [...u.characterIds, characterId] };
        }
      }
      return u;
    });
    this.saveUsers(next);
  }

  static unlinkCharacter(userId: string, characterId: string): void {
    const users = this.getUsers();
    const next = users.map(u => {
      if (u.id === userId) {
        return { ...u, characterIds: u.characterIds.filter(id => id !== characterId) };
      }
      return u;
    });
    this.saveUsers(next);
  }
}
