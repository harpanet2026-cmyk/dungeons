import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../core/types/auth';
import { AuthManager } from '../../core/auth/authManager';
import { getAvatarImage } from '../../core/auth/avatarPresets';
import { Character } from '../../core/types/dnd';
import { Crown, Shield, Users, ChevronDown, UserPlus, LogOut, Check } from 'lucide-react';

interface UserBadgeProps {
  currentUser: UserProfile;
  characters: Character[];
  onOpenLoginModal: () => void;
  onSelectUser: (user: UserProfile) => void;
  onSelectCharacter?: (charId: string) => void;
}

export const UserBadge: React.FC<UserBadgeProps> = ({
  currentUser,
  characters,
  onOpenLoginModal,
  onSelectUser,
  onSelectCharacter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const users = AuthManager.getUsers();

  const isDm = currentUser.role === 'dm';
  const avatarUrl = getAvatarImage(currentUser.avatar);
  const linkedCharacters = characters.filter(c => currentUser.characterIds.includes(c.id));

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSwitch = (user: UserProfile) => {
    const logged = AuthManager.login(user.id);
    onSelectUser(logged);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão no Cabeçalho */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#141824] hover:bg-[#1a2030] border border-[#262f44] hover:border-[#a17036] rounded-full p-1 pr-3 transition-all shadow group"
        title="Perfil do Usuário Atual (Clique para trocar de conta)"
      >
        <div className="relative">
          <img
            src={avatarUrl}
            alt={currentUser.displayName}
            className="w-7 h-7 rounded-full object-cover border border-[#a17036] shadow"
          />
          {isDm ? (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow scale-75">
              <Crown className="w-3 h-3" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full shadow scale-75">
              <Shield className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-stone-200 group-hover:text-[#f5ba42] transition-colors leading-tight truncate max-w-[90px] sm:max-w-[120px]">
            {currentUser.displayName}
          </span>
          <span className={`text-[8px] font-extrabold uppercase tracking-wider ${isDm ? 'text-[#f5ba42]' : 'text-sky-400'}`}>
            {isDm ? '⚔️ Mestre' : '🛡️ Jogador'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180 text-[#f5ba42]' : ''}`} />
      </button>

      {/* Dropdown Menu Flutuante */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-72 bg-[#10121a] border-2 border-[#a17036] rounded-2xl p-3.5 shadow-2xl space-y-3 text-stone-200 animate-in fade-in zoom-in-95">
          {/* Cabeçalho do Perfil */}
          <div className="flex items-center gap-3 border-b border-[#231b14] pb-3">
            <img
              src={avatarUrl}
              alt={currentUser.displayName}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#a17036] shadow"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-cinzel text-sm font-bold text-stone-100 truncate">
                  {currentUser.displayName}
                </h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                  isDm
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-sky-950 text-sky-300 border border-sky-800'
                }`}>
                  {isDm ? 'Mestre' : 'Jogador'}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">@{currentUser.username}</span>

              {/* Heróis Vinculados */}
              {isDm ? (
                <p className="text-[10px] text-amber-300/80 mt-1 font-semibold">
                  Acesso Total a Todos os Heróis
                </p>
              ) : linkedCharacters.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {linkedCharacters.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCharacter?.(c.id);
                        setIsOpen(false);
                      }}
                      className="text-[10px] bg-[#192238] hover:bg-[#233152] text-sky-200 px-2 py-0.5 rounded border border-[#2b3a5c] transition-colors"
                      title="Abrir este herói"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-stone-500 mt-1 italic">
                  Nenhum herói vinculado
                </p>
              )}
            </div>
          </div>

          {/* Troca Rápida de Usuários */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1">
              Troca Rápida de Perfil:
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = u.id === currentUser.id;
                const uImg = getAvatarImage(u.avatar);
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickSwitch(u)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#1b2233] text-[#f5ba42] border border-[#a17036]/50 font-bold'
                        : 'text-stone-300 hover:bg-[#161a26] hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={uImg} alt={u.displayName} className="w-6 h-6 rounded-full object-cover border border-[#443627]" />
                      <span className="truncate">{u.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] uppercase font-bold ${u.role === 'dm' ? 'text-[#f5ba42]' : 'text-sky-400'}`}>
                        {u.role === 'dm' ? 'DM' : 'Player'}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ações / Abrir Modal */}
          <div className="pt-2 border-t border-[#231b14] space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLoginModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#182033] hover:bg-[#202b44] text-stone-200 border border-[#2b3a5c] transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#f5ba42]" />
              Gerenciar Contas & Novo Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
