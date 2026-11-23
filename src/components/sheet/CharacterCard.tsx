import React, { useState } from 'react';
import { Character, Condition, SkillName } from '../../core/types/dnd';
import { calculateArmorClass, getPassiveSense, getAbilityModifier, formatModifier, calculateSpellcastingMetrics, getSkillModifier, SKILL_ABILITY_MAP } from '../../core/rules/calculations';
import { getClassPortrait, getWeaponImage } from '../../core/rules/srdData';
import { Shield, Heart, Zap, Sparkles, ChevronDown, ChevronUp, Dices, AlertTriangle, Eye, Flame, Skull, Swords, Trash2, Award } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  isOwnedByUser?: boolean;
  onApplyDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onSpendSlot: (id: string, level: number) => void;
  onRestoreSlot: (id: string, level: number) => void;
  onToggleCondition: (id: string, cond: Condition) => void;
  onToggleInspiration: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  onRollCheck: (char: Character, name: string, mode: 'normal' | 'vantagem' | 'desvantagem') => void;
  onOpenParchment?: (char: Character) => void;
}

const ALL_CONDITIONS: Condition[] = [
  'Cego', 'Enfeitiçado', 'Surdo', 'Amedrontado', 'Agarrado',
  'Incapacitado', 'Invisível', 'Paralisado', 'Petrificado',
  'Envenenado', 'Caído', 'Contido', 'Atordoado', 'Inconsciente', 'Exaustão'
];

const getHeroPortrait = (character: Character): string => {
  if (character.avatarUrl && (character.avatarUrl.startsWith('/artes/') || character.avatarUrl.startsWith('http') || character.avatarUrl.startsWith('data:'))) {
    return character.avatarUrl;
  }
  return getClassPortrait(character.class, character.gender);
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isOwnedByUser = false,
  onApplyDamage,
  onHeal,
  onSpendSlot,
  onRestoreSlot,
  onToggleCondition,
  onToggleInspiration,
  onDeleteCharacter,
  onRollCheck,
  onOpenParchment
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customHpVal, setCustomHpVal] = useState<string>('');
  const [rollMode, setRollMode] = useState<'normal' | 'vantagem' | 'desvantagem'>('normal');

  const { ac, breakdown: acBreakdown } = calculateArmorClass(character);
  const passivePerc = getPassiveSense(character, 'percepcao');
  const spellMetrics = calculateSpellcastingMetrics(character);
  const portraitUrl = getHeroPortrait(character);

  const hpPercent = Math.max(0, Math.min(100, Math.round((character.currentHp / character.maxHp) * 100)));
  const hpBarColor =
    hpPercent > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
    hpPercent > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
    'bg-gradient-to-r from-rose-700 to-rose-500';

  const handleCustomDamage = () => {
    const val = parseInt(customHpVal);
    if (!isNaN(val) && val > 0) {
      onApplyDamage(character.id, val);
      setCustomHpVal('');
    }
  };

  const handleCustomHeal = () => {
    const val = parseInt(customHpVal);
    if (!isNaN(val) && val > 0) {
      onHeal(character.id, val);
      setCustomHpVal('');
    }
  };

  return (
    <div className={`relative bg-gradient-to-b from-[#131622] via-[#0d0f17] to-[#090b10] border-2 rounded-3xl p-5 sm:p-6 shadow-2xl transition-all overflow-hidden flex flex-col justify-between group ${
      isOwnedByUser
        ? 'border-[#f5ba42] shadow-amber-500/10 ring-2 ring-amber-500/30'
        : 'border-[#a17036]/70 hover:border-[#f5ba42] shadow-black/80'
    }`}>
      {/* Detalhes de Fundo / Textura Sutil REALMS */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none bg-center bg-cover mix-blend-screen"
        style={{ backgroundImage: `url('${portraitUrl}')` }}
      />

      <div className="relative z-10 space-y-4">
        {/* Top Header com Retrato Arqueado e Identificação */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-[#231b14] pb-4">
          <div className="flex items-center gap-3.5">
            {/* Retrato Arqueado Medieval */}
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 border-[#a17036] overflow-hidden shadow-xl shrink-0 bg-[#090b10] group-hover:border-[#f5ba42] transition-colors">
              <img
                src={portraitUrl}
                alt={character.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-1 inset-x-0 text-center text-[8px] font-bold uppercase tracking-wider text-amber-200/90 font-cinzel">
                Nv. {character.level}
              </span>
            </div>

            {/* Nome, Classe e Badges */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-cinzel text-lg sm:text-2xl font-black gold-gradient-text tracking-wide truncate">
                  {character.name}
                </h3>
                {isOwnedByUser && (
                  <span className="inline-flex items-center gap-1 bg-[#231b14] text-[#f5ba42] border border-[#a17036] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow">
                    🛡️ Seu Herói
                  </span>
                )}
                {character.hasInspiration && (
                  <span className="inline-flex items-center gap-1 bg-[#231b14] text-[#f5ba42] border border-[#a17036] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#f5ba42]" /> Inspiração
                  </span>
                )}
                {character.currentHp === 0 && (
                  <span className="inline-flex items-center gap-1 bg-rose-950/80 text-rose-300 border border-rose-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    <Skull className="w-3 h-3 text-rose-400" /> Inconsciente (0 HP)
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-400 mt-0.5 font-light">
                {character.race} • <strong className="text-stone-200 font-semibold">{character.class}</strong> • {character.alignment} • {character.background}
              </p>

              {/* Botão de Abrir Ficha Pergaminho */}
              {onOpenParchment && (
                <button
                  onClick={() => onOpenParchment(character)}
                  className="bronze-btn px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow mt-2"
                  title="Abrir Ficha Estilo Pergaminho Tanares 5e"
                >
                  📜 Ficha Pergaminho
                </button>
              )}
            </div>
          </div>

          {/* Insígnias Metálicas: CA, PP, CD de Magia */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Classe de Armadura */}
            <div className="bg-[#141824] border border-[#a17036]/60 rounded-xl px-3 py-1.5 text-center shadow" title={acBreakdown}>
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-stone-400">
                <Shield className="w-3 h-3 text-[#f5ba42]" /> CA
              </div>
              <span className="font-cinzel text-base sm:text-lg font-black text-[#f5ba42] leading-none">
                {ac}
              </span>
            </div>

            {/* Percepção Passiva */}
            <div className="bg-[#141824] border border-[#262f44] rounded-xl px-2.5 py-1.5 text-center shadow" title="Percepção Passiva">
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-stone-400">
                <Eye className="w-3 h-3 text-emerald-400" /> PP
              </div>
              <span className="font-cinzel text-base sm:text-lg font-bold text-stone-200 leading-none">
                {passivePerc}
              </span>
            </div>

            {/* CD da Magia (se conjurador) */}
            {spellMetrics && (
              <div className="bg-[#191424] border border-[#4a2e6e] rounded-xl px-2.5 py-1.5 text-center shadow" title="CD de Salvaguarda de Magia">
                <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-purple-300">
                  <Zap className="w-3 h-3 text-purple-400" /> CD
                </div>
                <span className="font-cinzel text-base sm:text-lg font-bold text-purple-300 leading-none">
                  {spellMetrics.spellSaveDc}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Pontos de Vida (HP) com Moldura Talhada */}
        <div className="bg-[#0b0e15] border border-[#231b14] rounded-2xl p-3 sm:p-3.5 space-y-2 shadow-inner">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1.5 text-stone-300 font-semibold uppercase tracking-wider text-[11px]">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Pontos de Vida
            </span>
            <div className="text-xs">
              <span className="font-cinzel text-sm font-black text-[#f5ba42]">{character.currentHp}</span>
              <span className="text-stone-400"> / {character.maxHp} HP</span>
              {character.tempHp > 0 && <span className="text-sky-400 font-semibold ml-1">(+{character.tempHp} temp)</span>}
            </div>
          </div>

          {/* Barra de HP */}
          <div className="w-full bg-[#141824] h-3 rounded-full overflow-hidden border border-[#2b354c] p-0.5">
            <div className={`h-full ${hpBarColor} rounded-full transition-all duration-300 shadow`} style={{ width: `${hpPercent}%` }} />
          </div>

          {/* Botões de Dano e Cura Estilo REALMS */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => onApplyDamage(character.id, 1)}
              className="px-2.5 py-1 bg-[#241316] hover:bg-[#381a1f] text-rose-300 border border-rose-800 rounded-lg text-[11px] font-bold uppercase transition-colors"
              title="Receber 1 de Dano"
            >
              -1
            </button>
            <button
              onClick={() => onApplyDamage(character.id, 5)}
              className="px-2.5 py-1 bg-[#241316] hover:bg-[#381a1f] text-rose-300 border border-rose-800 rounded-lg text-[11px] font-bold uppercase transition-colors"
              title="Receber 5 de Dano"
            >
              -5
            </button>

            <button
              onClick={() => onHeal(character.id, 1)}
              className="px-2.5 py-1 bg-[#0f1d18] hover:bg-[#162e26] text-emerald-300 border border-emerald-800 rounded-lg text-[11px] font-bold uppercase transition-colors"
              title="Recuperar 1 de HP"
            >
              +1
            </button>
            <button
              onClick={() => onHeal(character.id, 5)}
              className="px-2.5 py-1 bg-[#0f1d18] hover:bg-[#162e26] text-emerald-300 border border-emerald-800 rounded-lg text-[11px] font-bold uppercase transition-colors"
              title="Recuperar 5 de HP"
            >
              +5
            </button>

            {/* Ajuste Numérico Direto */}
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="number"
                placeholder="Qtd"
                value={customHpVal}
                onChange={(e) => setCustomHpVal(e.target.value)}
                className="w-14 px-2 py-1 bg-[#141824] border border-[#2b334a] text-stone-100 rounded-lg text-xs focus:outline-none focus:border-[#f5ba42] text-center font-bold"
              />
              <button
                onClick={handleCustomDamage}
                className="px-2 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-lg text-[10px] font-bold uppercase"
                title="Aplicar Dano Customizado"
              >
                - Dano
              </button>
              <button
                onClick={handleCustomHeal}
                className="px-2 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded-lg text-[10px] font-bold uppercase"
                title="Aplicar Cura Customizada"
              >
                + Cura
              </button>
            </div>
          </div>
        </div>

        {/* Espaços de Magia (Círculos Arcanos com Gemas de Mana) */}
        {Object.keys(character.spellSlots).length > 0 && (
          <div className="bg-[#0b0e15] border border-[#231b14] rounded-2xl p-3 space-y-2">
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Espaços de Magia (Gemas de Mana)
            </div>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(character.spellSlots).map(([lvl, slot]) => (
                <div key={lvl} className="bg-[#141824] border border-[#2b334a] rounded-xl px-2.5 py-1 text-xs flex items-center gap-2">
                  <span className="font-cinzel font-bold text-purple-200 text-[11px]">{lvl}º Círculo:</span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: slot.max }).map((_, i) => {
                      const isSpent = i < slot.used;
                      return (
                        <button
                          key={i}
                          onClick={() => isSpent ? onRestoreSlot(character.id, Number(lvl)) : onSpendSlot(character.id, Number(lvl))}
                          title={isSpent ? "Espaço gasto (clique para restaurar)" : "Espaço disponível (clique para gastar)"}
                          className={`w-3.5 h-3.5 rounded-full transition-all border ${
                            isSpent
                              ? 'bg-[#1a1e2b] border-[#2b354c]'
                              : 'bg-purple-500 border-purple-300 shadow-md shadow-purple-500/50 hover:scale-110'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Condições Ativas */}
        <div className="bg-[#0b0e15] border border-[#231b14] rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Condições do Herói
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onToggleCondition(character.id, e.target.value as Condition);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-[11px] bg-[#141824] border border-[#2b334a] text-stone-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#f5ba42]"
            >
              <option value="" disabled>+ Adicionar Condição</option>
              {ALL_CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {character.conditions.length === 0 ? (
              <span className="text-[11px] text-stone-500 italic">Nenhuma condição ativa (Herói saudável)</span>
            ) : (
              character.conditions.map(c => (
                <button
                  key={c}
                  onClick={() => onToggleCondition(character.id, c)}
                  className="bg-[#241316] hover:bg-[#381a1f] text-rose-300 border border-rose-800 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold uppercase transition-colors"
                  title="Clique para remover condição"
                >
                  <span>{c}</span>
                  <span className="text-rose-400 font-black">×</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Medalhões de Atributos (FOR, DES, CON, INT, SAB, CAR) com Rolagem */}
        <div className="bg-[#0b0e15] border border-[#231b14] rounded-2xl p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-cinzel text-[11px] font-bold text-[#f5ba42] flex items-center gap-1.5 uppercase tracking-wider">
              <Dices className="w-3.5 h-3.5 text-[#f5ba42]" /> Testes de Atributos & D20
            </span>

            {/* Modo de Rolagem */}
            <div className="flex items-center gap-1 bg-[#141824] p-0.5 rounded-lg border border-[#262f44]">
              <button
                onClick={() => setRollMode('normal')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                  rollMode === 'normal' ? 'bg-[#f5ba42] text-stone-950 font-black' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setRollMode('vantagem')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                  rollMode === 'vantagem' ? 'bg-emerald-500 text-stone-950 font-black' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Vantagem
              </button>
              <button
                onClick={() => setRollMode('desvantagem')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                  rollMode === 'desvantagem' ? 'bg-rose-500 text-stone-950 font-black' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Desvantagem
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => {
              const mod = getAbilityModifier(character.baseAbilities[ab]);
              const score = character.baseAbilities[ab];
              return (
                <button
                  key={ab}
                  onClick={() => onRollCheck(character, ab, rollMode)}
                  className="bg-[#141824] hover:bg-[#1f1913] border border-[#262f44] hover:border-[#a17036] p-2 rounded-xl text-center transition-all group shadow"
                  title={`Rolar teste de ${ab.toUpperCase()}`}
                >
                  <div className="text-[10px] uppercase font-bold text-stone-400 group-hover:text-[#f5ba42] font-cinzel">
                    {ab}
                  </div>
                  <div className="font-cinzel font-black text-[#f5ba42] text-sm my-0.5">
                    {formatModifier(mod)}
                  </div>
                  <div className="text-[9px] text-stone-500 font-mono">
                    {score}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion: Perícias, Equipamento e Detalhes Narrativos */}
        <div className="pt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-[#f5ba42] py-2 transition-colors border-t border-[#231b14] font-semibold uppercase tracking-wider"
          >
            <span>{isExpanded ? '▲ Ocultar Detalhes Narrativos' : '▼ Ver Perícias, Armas & Ganchos Narrativos'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 pt-3 border-t border-[#231b14] space-y-3 animate-in fade-in text-xs">
              {/* Ganchos Narrativos para o Gemini Pro */}
              <div className="bg-[#0b0e15] p-3.5 rounded-xl border border-[#231b14] space-y-1.5">
                <h4 className="font-cinzel font-bold text-[#f5ba42] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#f5ba42]" /> Ganchos de Interpretação (Gemini Pro)
                </h4>
                <div><strong className="text-stone-300">Ideal:</strong> <span className="text-stone-400">{character.personality.ideals}</span></div>
                <div><strong className="text-stone-300">Vínculo:</strong> <span className="text-stone-400">{character.personality.bonds}</span></div>
                <div><strong className="text-stone-300">Defeito:</strong> <span className="text-stone-400">{character.personality.flaws}</span></div>
                <div><strong className="text-stone-300">Segredo:</strong> <span className="text-amber-300/90 italic">{character.personality.secretsOrHooks}</span></div>
              </div>

              {/* Perícias Treinadas */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Perícias Treinadas (Clique para Rolar):
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {character.skillProficiencies.map(sk => {
                    const mod = getSkillModifier(character, sk);
                    const skDef = SKILL_ABILITY_MAP[sk];
                    return (
                      <button
                        key={sk}
                        onClick={() => onRollCheck(character, sk, rollMode)}
                        className="bg-[#141824] hover:bg-[#1f1913] border border-[#262f44] hover:border-[#a17036] px-2.5 py-1 rounded-lg text-stone-300 hover:text-[#f5ba42] flex items-center gap-1.5 transition-colors"
                      >
                        <span>{skDef.name}</span>
                        <strong className="text-[#f5ba42] font-mono">{formatModifier(mod)}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Armas & Ataques */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Armas & Ataques:
                </h4>
                <div className="space-y-1.5">
                  {character.weapons.map((w, idx) => {
                    const wpnImg = w.imageUrl || getWeaponImage(w.name || w.id);
                    return (
                      <div key={idx} className="bg-[#141824] px-2.5 py-1.5 rounded-lg border border-[#262f44] flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={wpnImg}
                            alt={w.name}
                            className="w-7 h-7 rounded object-cover border border-amber-900/50 shrink-0 bg-black/50"
                          />
                          <span className="text-stone-200 font-semibold truncate">{w.name}</span>
                        </div>
                        <span className="text-[#f5ba42] font-mono font-bold shrink-0">{w.damage} {w.damageType || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ações Administrativas */}
              <div className="flex justify-between items-center pt-2 border-t border-[#231b14]">
                <button
                  onClick={() => onToggleInspiration(character.id)}
                  className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all ${
                    character.hasInspiration
                      ? 'bg-[#231b14] text-[#f5ba42] border-[#a17036]'
                      : 'bg-[#141824] text-stone-400 border-[#262f44] hover:text-stone-200'
                  }`}
                >
                  {character.hasInspiration ? '★ Com Inspiração' : '☆ Dar Inspiração'}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Tem certeza de que deseja remover ${character.name} do grupo?`)) {
                      onDeleteCharacter(character.id);
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Personagem
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
