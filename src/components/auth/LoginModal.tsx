import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../core/types/auth';
import { AuthManager } from '../../core/auth/authManager';
import { AVATAR_PRESETS, getAvatarImage } from '../../core/auth/avatarPresets';
import { Character } from '../../core/types/dnd';
import { Crown, Shield, UserPlus, Users, X, Check, Trash2, Swords, Sparkles, BookOpen, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  characters: Character[];
  onUserChanged: (newUser: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  characters,
  onUserChanged
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'create'>('profiles');
  const [users, setUsers] = useState<UserProfile[]>(() => AuthManager.getUsers());

  // Form states for creating a new user
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('player');
  const [newAvatar, setNewAvatar] = useState<string>('avatar_warrior_dwarf');
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectUser = (user: UserProfile) => {
    const logged = AuthManager.login(user.id);
    onUserChanged(logged);
    onClose();
  };

  const handleDeleteUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja remover este perfil de usuário?')) {
      try {
        AuthManager.deleteUser(userId);
        const updated = AuthManager.getUsers();
        setUsers(updated);
        const current = AuthManager.getCurrentUser();
        onUserChanged(current);
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newDisplayName.trim()) {
      setErrorMessage('Por favor, informe um nome de exibição.');
      return;
    }

    try {
      const created = AuthManager.register({
        displayName: newDisplayName,
        username: newUsername || newDisplayName.toLowerCase().replace(/\s+/g, '_'),
        role: newRole,
        avatar: newAvatar,
        characterIds: selectedCharIds
      });

      setUsers(AuthManager.getUsers());
      onUserChanged(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar perfil.');
    }
  };

  const toggleCharSelection = (charId: string) => {
    if (selectedCharIds.includes(charId)) {
      setSelectedCharIds(selectedCharIds.filter(id => id !== charId));
    } else {
      setSelectedCharIds([...selectedCharIds, charId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1017] border-2 border-[#a17036] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Dourado REALMS */}
        <div className="p-4 sm:p-5 border-b border-[#231b14] flex items-center justify-between bg-gradient-to-r from-[#18130e] via-[#10131d] to-[#18130e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#a17036] bg-[#0c0d12] flex items-center justify-center shadow">
              <Users className="w-5 h-5 text-[#f5ba42]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold gold-gradient-text tracking-[0.15em] flex items-center gap-2">
                PORTAIS DOS REINOS
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Controle de Múltiplos Usuários, Mestre e Fichas de Jogadores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-[#1a1f2c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#231b14] bg-[#0c0d14] px-4 pt-2 gap-2 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-2 px-4 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'profiles'
                ? 'bg-[#141824] text-[#f5ba42] border-t-2 border-x border-[#a17036]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#f5ba42]" />
            Perfis Existentes ({users.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage(null);
            }}
            className={`py-2 px-4 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-[#141824] text-[#f5ba42] border-t-2 border-x border-[#a17036]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            + Novo Jogador / Mestre
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'profiles' ? (
            <div className="space-y-4">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Clique em um perfil para entrar instantaneamente na sessão:</span>
                <span className="text-[11px] text-[#f5ba42] font-semibold">
                  Ativo: {currentUser.displayName} ({currentUser.role === 'dm' ? 'Mestre' : 'Jogador'})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {users.map(user => {
                  const isActive = user.id === currentUser.id;
                  const isDm = user.role === 'dm';
                  const avatarSrc = getAvatarImage(user.avatar);
                  const linkedCharacters = characters.filter(c => user.characterIds.includes(c.id));

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isActive
                          ? 'bg-[#1a1c29] border-[#f5ba42] shadow-lg shadow-amber-500/10'
                          : 'bg-[#12141e] border-[#23293a] hover:border-[#a17036] hover:bg-[#161a27]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={avatarSrc}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#a17036] shadow bg-black"
                          />
                          {isDm ? (
                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow" title="Mestre da Masmorra">
                              <Crown className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full shadow" title="Jogador">
                              <Shield className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Detalhes */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-cinzel font-bold text-stone-100 text-sm truncate group-hover:text-[#f5ba42] transition-colors">
                              {user.displayName}
                            </h3>
                            {isActive && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                Ativo
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-stone-400 font-mono">@{user.username}</span>
                            <span className="text-stone-600">•</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDm ? 'text-[#f5ba42]' : 'text-sky-400'}`}>
                              {isDm ? '⚔️ Mestre' : '🛡️ Jogador'}
                            </span>
                          </div>

                          {user.bio && (
                            <p className="text-[11px] text-stone-400 mt-1 line-clamp-1 italic">
                              "{user.bio}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Heróis Vinculados */}
                      <div className="mt-3 pt-2 border-t border-[#1e2333] flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">
                          {isDm ? (
                            <span className="text-amber-300 font-semibold flex items-center gap-1">
                              <Crown className="w-3 h-3 text-[#f5ba42]" /> Acesso total a todas as fichas
                            </span>
                          ) : linkedCharacters.length > 0 ? (
                            <span>
                              Herói: <strong className="text-stone-200">{linkedCharacters.map(c => c.name).join(', ')}</strong>
                            </span>
                          ) : (
                            <span className="text-stone-500 italic">Nenhum herói vinculado</span>
                          )}
                        </span>

                        {/* Botão de Excluir Usuário (somente se não for o mestre original e mais de 1 usuário) */}
                        {user.id !== 'user_dm' && users.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteUser(e, user.id)}
                            className="p-1 text-stone-500 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover perfil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Formulário de Criação de Usuário */
            <form onSubmit={handleCreateUser} className="space-y-4">
              {errorMessage && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome de Exibição */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1 uppercase tracking-wider">
                    Nome do Jogador / Mestre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDisplayName}
                    onChange={e => setNewDisplayName(e.target.value)}
                    placeholder="Ex: Rafael, Mestre Rodrigo"
                    className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-lg px-3 py-2 text-sm text-stone-100 outline-none"
                  />
                </div>

                {/* Nome de Usuário (Identificador) */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1 uppercase tracking-wider">
                    Identificador (Login / Tag)
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="Ex: rafael (opcional)"
                    className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-lg px-3 py-2 text-sm text-stone-100 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Papel (Role) */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                  Papel na Campanha *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setNewRole('player');
                      if (newAvatar === 'avatar_dm_tome') setNewAvatar('avatar_warrior_dwarf');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      newRole === 'player'
                        ? 'bg-[#182033] border-sky-400 text-stone-100 shadow'
                        : 'bg-[#12141e] border-[#262f44] text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <Shield className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs uppercase block text-stone-200">Jogador (Player)</span>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Focado em seu personagem, controle de inventário, magias e rolagem de dados própria.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setNewRole('dm');
                      setNewAvatar('avatar_dm_tome');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      newRole === 'dm'
                        ? 'bg-[#211a14] border-[#f5ba42] text-stone-100 shadow'
                        : 'bg-[#12141e] border-[#262f44] text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <Crown className="w-5 h-5 text-[#f5ba42] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs uppercase block text-[#f5ba42]">Mestre (DM)</span>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Acesso irrestrito a todos os heróis, controle do Bestiário, combate e comandos de IA do Gemini.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escolha do Avatar */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                  Escolha seu Avatar Temático
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVATAR_PRESETS.map(preset => {
                    const isSelected = newAvatar === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setNewAvatar(preset.id)}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square group ${
                          isSelected
                            ? 'border-[#f5ba42] ring-2 ring-amber-500/40 scale-105'
                            : 'border-[#262f44] hover:border-stone-400 opacity-75 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.image || '/extracted_art/art_0.jpg'}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center text-stone-200 truncate px-0.5">
                          {preset.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vincular Personagem (Apenas se for Jogador) */}
              {newRole === 'player' && (
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                    Vincular a um Herói da Campanha (Opcional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {characters.map(char => {
                      const isSelected = selectedCharIds.includes(char.id);
                      return (
                        <div
                          key={char.id}
                          onClick={() => toggleCharSelection(char.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-[#182033] border-sky-400 text-sky-200 font-bold'
                              : 'bg-[#12141e] border-[#262f44] text-stone-300 hover:border-stone-500'
                          }`}
                        >
                          <div>
                            <span>{char.name}</span>
                            <span className="text-[10px] text-stone-400 block font-normal">
                              {char.race} {char.class} (Nv. {char.level})
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botão de Enviar */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('profiles')}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bronze-btn px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar e Entrar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Informativo */}
        <div className="p-3 bg-[#0a0b10] border-t border-[#1c202d] text-center text-[11px] text-stone-400 flex items-center justify-center gap-2">
          <span>⚔️ O Mestre tem visão ampla de toda a masmorra. Os Jogadores têm sua rolagem e ficha dedicadas.</span>
        </div>
      </div>
    </div>
  );
};
