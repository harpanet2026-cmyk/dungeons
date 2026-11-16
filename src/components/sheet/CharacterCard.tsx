import React, { useState } from 'react';
import { Character, Condition, SkillName } from '../../core/types/dnd';
import { calculateArmorClass, getPassiveSense, getAbilityModifier, formatModifier, calculateSpellcastingMetrics, getSkillModifier, SKILL_ABILITY_MAP } from '../../core/rules/calculations';
import { Shield, Heart, Zap, Sparkles, ChevronDown, ChevronUp, Dices, AlertTriangle, Eye, Flame, Skull } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onApplyDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onSpendSlot: (id: string, level: number) => void;
  onRestoreSlot: (id: string, level: number) => void;
  onToggleCondition: (id: string, cond: Condition) => void;
  onToggleInspiration: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  onRollCheck: (char: Character, name: string, mode: 'normal' | 'vantagem' | 'desvantagem') => void;
}

const ALL_CONDITIONS: Condition[] = [
  'Cego', 'Enfeitiçado', 'Surdo', 'Amedrontado', 'Agarrado',
  'Incapacitado', 'Invisível', 'Paralisado', 'Petrificado',
  'Envenenado', 'Caído', 'Contido', 'Atordoado', 'Inconsciente', 'Exaustão'
];

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onApplyDamage,
  onHeal,
  onSpendSlot,
  onRestoreSlot,
  onToggleCondition,
  onToggleInspiration,
  onDeleteCharacter,
  onRollCheck
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customHpVal, setCustomHpVal] = useState<string>('');
  const [rollMode, setRollMode] = useState<'normal' | 'vantagem' | 'desvantagem'>('normal');

  const { ac, breakdown: acBreakdown } = calculateArmorClass(character);
  const passivePerc = getPassiveSense(character, 'percepcao');
  const spellMetrics = calculateSpellcastingMetrics(character);

  const hpPercent = Math.max(0, Math.min(100, Math.round((character.currentHp / character.maxHp) * 100)));
  const hpBarColor =
    hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-rose-600';

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
    <div className="bg-[#0e111a] border border-[#231b14] hover:border-[#a17036]/60 rounded-2xl shadow-xl p-5 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#231b14] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-xl font-bold text-[#f5ba42] tracking-wide">{character.name}</h3>
            {character.hasInspiration && (
              <span className="inline-flex items-center gap-1 bg-[#231b14] text-[#f5ba42] border border-[#a17036] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#f5ba42]" /> Inspiração
              </span>
            )}
            {character.currentHp === 0 && (
              <span className="inline-flex items-center gap-1 bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                <Skull className="w-3 h-3 text-rose-400" /> Inconsciente (0 HP)
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {character.race} • {character.class} (Nível {character.level}) • {character.alignment} • {character.background}
          </p>
        </div>

        {/* Quick Badges: CA, Deslocamento, Percepção */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg text-xs" title={acBreakdown}>
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-stone-200">CA {ac}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg text-xs" title="Percepção Passiva">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-300">PP {passivePerc}</span>
          </div>

          {spellMetrics && (
            <div className="flex items-center gap-1.5 bg-[#191424] border border-[#3b2b55] px-2.5 py-1 rounded-lg text-xs" title="CD da Magia">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300">CD {spellMetrics.spellSaveDc}</span>
            </div>
          )}
        </div>
      </div>

      {/* HP Bar e Controles de Vida */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="flex items-center gap-1 text-slate-300">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Pontos de Vida (HP)
          </span>
          <span className="text-slate-200">
            <strong className="text-sm font-bold">{character.currentHp}</strong> / {character.maxHp}
            {character.tempHp > 0 && <span className="text-blue-400 font-semibold ml-1">(+{character.tempHp} temp)</span>}
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div className={`h-full ${hpBarColor} transition-all duration-300`} style={{ width: `${hpPercent}%` }} />
        </div>

        {/* Botões Rápidos de HP */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <button
            onClick={() => onApplyDamage(character.id, 1)}
            className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded text-xs font-semibold"
          >
            -1 Dano
          </button>
          <button
            onClick={() => onApplyDamage(character.id, 5)}
            className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded text-xs font-semibold"
          >
            -5 Dano
          </button>
          <button
            onClick={() => onHeal(character.id, 1)}
            className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded text-xs font-semibold"
          >
            +1 Cura
          </button>
          <button
            onClick={() => onHeal(character.id, 5)}
            className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded text-xs font-semibold"
          >
            +5 Cura
          </button>

          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              placeholder="Qtd"
              value={customHpVal}
              onChange={(e) => setCustomHpVal(e.target.value)}
              className="w-16 px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-100 rounded text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleCustomDamage}
              className="px-2 py-0.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-bold"
              title="Aplicar Dano"
            >
              - Dano
            </button>
            <button
              onClick={handleCustomHeal}
              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold"
              title="Curar"
            >
              + Cura
            </button>
          </div>
        </div>
      </div>

      {/* Espaços de Magia (se conjurador) */}
      {Object.keys(character.spellSlots).length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Espaços de Magia
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(character.spellSlots).map(([lvl, slot]) => (
              <div key={lvl} className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs flex items-center gap-2">
                <span className="font-semibold text-slate-300">{lvl}º Círculo:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: slot.max }).map((_, i) => {
                    const isSpent = i < slot.used;
                    return (
                      <button
                        key={i}
                        onClick={() => isSpent ? onRestoreSlot(character.id, Number(lvl)) : onSpendSlot(character.id, Number(lvl))}
                        title={isSpent ? "Espaço gasto (clique para restaurar)" : "Espaço disponível (clique para gastar)"}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          isSpent ? 'bg-slate-700 border border-slate-600' : 'bg-purple-500 shadow-sm shadow-purple-500/50'
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
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Condições Ativas
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onToggleCondition(character.id, e.target.value as Condition);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="text-xs bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 focus:outline-none"
          >
            <option value="" disabled>+ Adicionar Condição</option>
            {ALL_CONDITIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {character.conditions.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Nenhuma condição ativa</span>
          ) : (
            character.conditions.map(c => (
              <button
                key={c}
                onClick={() => onToggleCondition(character.id, c)}
                className="bg-amber-500/20 hover:bg-rose-500/20 text-amber-300 hover:text-rose-300 border border-amber-500/40 hover:border-rose-500/40 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                title="Clique para remover"
              >
                <span>{c}</span>
                <span className="text-slate-400 font-bold ml-1">×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Rolagens Rápidas de Perícias e Salvaguardas */}
      <div className="mt-4 pt-3 border-t border-[#231b14]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-stone-300 flex items-center gap-1.5">
            <Dices className="w-3.5 h-3.5 text-[#f5ba42]" /> Teste de D20
          </span>
          <div className="flex items-center gap-1 bg-[#141824] p-0.5 rounded-lg border border-[#262f44]">
            <button
              onClick={() => setRollMode('normal')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rollMode === 'normal' ? 'bg-[#f5ba42] text-stone-950' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setRollMode('vantagem')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rollMode === 'vantagem' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Vantagem
            </button>
            <button
              onClick={() => setRollMode('desvantagem')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rollMode === 'desvantagem' ? 'bg-rose-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Desvantagem
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
          {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => {
            const mod = getAbilityModifier(character.baseAbilities[ab]);
            return (
              <button
                key={ab}
                onClick={() => onRollCheck(character, ab, rollMode)}
                className="bg-[#141824] hover:bg-[#1f1913] border border-[#262f44] hover:border-[#a17036] p-1.5 rounded-lg text-center transition-all group"
              >
                <div className="text-[10px] uppercase font-bold text-stone-400 group-hover:text-[#f5ba42]">{ab}</div>
                <div className="font-bold text-[#f5ba42] text-xs">{formatModifier(mod)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Detalhes de Roleplay e Perícias */}
      <div className="mt-4 pt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
        >
          <span>{isExpanded ? 'Ocultar Detalhes Narrativos & Ficha' : 'Ver Detalhes Narrativos, Perícias & Itens'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-3">
            {/* Ganchos Narrativos */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">🎭 Ganchos de Interpretação (Gemini)</h4>
              <div><strong>Ideal:</strong> <span className="text-slate-300">{character.personality.ideals}</span></div>
              <div><strong>Vínculo:</strong> <span className="text-slate-300">{character.personality.bonds}</span></div>
              <div><strong>Defeito:</strong> <span className="text-slate-300">{character.personality.flaws}</span></div>
              <div><strong>Segredo / Gancho:</strong> <span className="text-amber-200/90">{character.personality.secretsOrHooks}</span></div>
            </div>

            {/* Perícias Treinadas */}
            <div>
              <h4 className="font-bold text-slate-300 mb-1.5">Perícias Treinadas:</h4>
              <div className="flex flex-wrap gap-1.5">
                {character.skillProficiencies.map(sk => {
                  const mod = getSkillModifier(character, sk);
                  const skDef = SKILL_ABILITY_MAP[sk];
                  return (
                    <button
                      key={sk}
                      onClick={() => onRollCheck(character, sk, rollMode)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded text-slate-200 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>{skDef.name}</span>
                      <strong className="text-amber-400">{formatModifier(mod)}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipamento e Armas */}
            <div>
              <h4 className="font-bold text-slate-300 mb-1">Armas & Ataques:</h4>
              <div className="space-y-1">
                {character.weapons.map((w, idx) => (
                  <div key={idx} className="bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800/80 flex justify-between">
                    <span className="text-slate-200 font-medium">{w.name}</span>
                    <span className="text-amber-300">{w.damage} {w.damageType || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações Administrativas */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => onToggleInspiration(character.id)}
                className={`text-xs px-2.5 py-1 rounded border font-semibold ${
                  character.hasInspiration
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {character.hasInspiration ? '★ Com Inspiração' : '☆ Dar Inspiração'}
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remover ${character.name} do grupo?`)) {
                    onDeleteCharacter(character.id);
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Excluir Personagem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
