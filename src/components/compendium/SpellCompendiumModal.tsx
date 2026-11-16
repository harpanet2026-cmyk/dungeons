import React, { useState } from 'react';
import { SPELL_COMPENDIUM, CompendiumSpell } from '../../core/rules/spellCompendium';
import { Character, Spell } from '../../core/types/dnd';
import { Sparkles, Search, Plus, Check, X, BookOpen, Zap } from 'lucide-react';

interface SpellCompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddSpellToCharacter: (charId: string, spell: Spell) => void;
}

export const SpellCompendiumModal: React.FC<SpellCompendiumModalProps> = ({
  isOpen,
  onClose,
  characters,
  onAddSpellToCharacter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedTargetCharId, setSelectedTargetCharId] = useState<string>(characters[0]?.id || '');
  const [addedSpells, setAddedSpells] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredSpells = SPELL_COMPENDIUM.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || spell.level === selectedLevel;
    const matchesSchool = selectedSchool === 'all' || spell.school === selectedSchool;
    return matchesSearch && matchesLevel && matchesSchool;
  });

  const handleAdd = (spell: CompendiumSpell) => {
    if (!selectedTargetCharId) {
      alert('Selecione um personagem para receber a magia.');
      return;
    }

    const simpleSpell: Spell = {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      damage: spell.damage
    };

    onAddSpellToCharacter(selectedTargetCharId, simpleSpell);
    setAddedSpells(prev => [...prev, `${selectedTargetCharId}_${spell.id}`]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1017] border-2 border-[#a17036] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#231b14] flex items-center justify-between bg-gradient-to-r from-[#18130e] via-[#10131d] to-[#18130e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#a17036] bg-[#0c0d12] flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 text-[#f5ba42]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold gold-gradient-text tracking-[0.15em] flex items-center gap-2">
                GRIMÓRIO & COMPÊNDIO ARCANO (SRD 5e)
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Consulte magias oficiais e adicione diretamente ao livro de magias dos heróis
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

        {/* Barra de Filtros & Destino do Herói */}
        <div className="p-4 bg-[#12141f] border-b border-[#231b14] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Campo de Busca */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar magia por nome ou efeito..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#090b10] border border-[#2b334a] focus:border-[#f5ba42] rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 outline-none"
              />
            </div>

            {/* Filtro de Círculo */}
            <div className="sm:col-span-3">
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full bg-[#090b10] border border-[#2b334a] focus:border-[#f5ba42] rounded-lg px-2.5 py-2 text-xs text-stone-200 outline-none"
              >
                <option value="all">Todos os Círculos</option>
                <option value="0">Truques (Nível 0)</option>
                <option value="1">1º Círculo</option>
                <option value="2">2º Círculo</option>
                <option value="3">3º Círculo</option>
              </select>
            </div>

            {/* Destino: Para qual herói enviar */}
            <div className="sm:col-span-4 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 shrink-0">Aprender em:</span>
              <select
                value={selectedTargetCharId}
                onChange={e => setSelectedTargetCharId(e.target.value)}
                className="w-full bg-[#182033] border border-amber-600/60 focus:border-[#f5ba42] rounded-lg px-2.5 py-2 text-xs font-bold text-[#f5ba42] outline-none"
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.class})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Magias Filtradas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredSpells.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              Nenhuma magia encontrada com os filtros atuais.
            </div>
          ) : (
            filteredSpells.map(spell => {
              const key = `${selectedTargetCharId}_${spell.id}`;
              const isAdded = addedSpells.includes(key);

              return (
                <div
                  key={spell.id}
                  className="bg-[#121520] border border-[#23293a] hover:border-[#a17036] rounded-xl p-4 shadow-lg transition-all space-y-2 group"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#1d2333] pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-cinzel text-sm sm:text-base font-bold text-stone-100 group-hover:text-[#f5ba42] transition-colors">
                          {spell.name}
                        </h4>
                        <span className="text-[10px] bg-[#1a162b] text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
                          {spell.level === 0 ? 'Truque' : `${spell.level}º Círculo`} • {spell.school}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-stone-400 mt-1 font-mono">
                        <span>Tempo: {spell.castingTime}</span>
                        <span>• Alcance: {spell.range}</span>
                        <span>• Comp: {spell.components}</span>
                        <span>• Dur: {spell.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdd(spell)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow ${
                        isAdded
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 cursor-default'
                          : 'bronze-btn text-[#f5ba42]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Adicionada
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> + Adicionar
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {spell.description}
                  </p>

                  {spell.damage && (
                    <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1 pt-1">
                      <Zap className="w-3.5 h-3.5" /> Dano: {spell.damage}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
