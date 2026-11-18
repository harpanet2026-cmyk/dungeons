import React from 'react';
import { Spell, AbilityName } from '../../../core/types/dnd';
import {
  PHB_CLASSES,
  CLASS_CANTRIPS_MAP,
  CLASS_LEVEL1_SPELLS_MAP,
  PHB_SPELLS_L0_L1,
  CLERIC_DOMAINS
} from '../../../core/rules/characterCreationData';
import { getAbilityModifier, formatModifier, getProficiencyBonus } from '../../../core/rules/calculations';
import { BookOpen, Sparkles, Wand2, Check, AlertCircle } from 'lucide-react';

interface StepSpellsProps {
  selectedClass: string;
  selectedSubclass: string;
  level: number;
  castingAbility?: AbilityName;
  abilityScore: number;
  
  // Truques Escolhidos
  selectedCantripIds: string[];
  onToggleCantrip: (cantripId: string) => void;
  
  // Magias de 1º Círculo Escolhidas (Conhecidas, Grimório ou Preparadas)
  selectedSpellIds: string[];
  onToggleSpell: (spellId: string) => void;
  
  // Magias de Raça Inatas
  racialSpells: { name: string; ability: AbilityName; desc: string }[];
}

export const StepSpells: React.FC<StepSpellsProps> = ({
  selectedClass,
  selectedSubclass,
  level,
  castingAbility,
  abilityScore,
  selectedCantripIds,
  onToggleCantrip,
  selectedSpellIds,
  onToggleSpell,
  racialSpells
}) => {
  const currentClass = PHB_CLASSES[selectedClass] || PHB_CLASSES['Mago'];
  const prof = getProficiencyBonus(level);
  const mod = getAbilityModifier(abilityScore);

  const spellSaveDc = 8 + prof + mod;
  const spellAttackBonus = prof + mod;

  // Limite de Truques da Classe
  const cantripsLimit = currentClass.cantripsKnownAtL1 || 0;

  // Limite de Magias de 1º Círculo
  let spellsLimit = 0;
  let spellsLabel = 'Magias Conhecidas';

  if (currentClass.spellsKnownAtL1) {
    spellsLimit = currentClass.spellsKnownAtL1;
    spellsLabel = 'Magias Conhecidas';
  } else if (currentClass.isSpellbookCaster) {
    spellsLimit = 6; // Mago começa com 6 magias no grimório no nível 1
    spellsLabel = 'Magias no Grimório (6 Iniciais)';
  } else if (currentClass.isPreparedCaster) {
    spellsLimit = Math.max(1, mod + level); // SAB mod + nível
    spellsLabel = `Magias Preparadas (${mod >= 0 ? `+${mod}` : mod} Sab + 1 Nível = ${spellsLimit})`;
  }

  // Magias de Domínio do Clérigo (sempre preparadas automaticamente)
  const clericDomain = CLERIC_DOMAINS.find(d => d.id === selectedSubclass);
  const domainSpellIds = clericDomain?.domainSpells || [];

  // Truques disponíveis para a classe
  const availableCantripIds = CLASS_CANTRIPS_MAP[selectedClass] || [];
  const availableCantrips = availableCantripIds.map(id => PHB_SPELLS_L0_L1.find(s => s.id === id)).filter(Boolean) as Spell[];

  // Magias de 1º círculo disponíveis para a classe
  const availableSpellIds = CLASS_LEVEL1_SPELLS_MAP[selectedClass] || [];
  const availableSpells = availableSpellIds.map(id => PHB_SPELLS_L0_L1.find(s => s.id === id)).filter(Boolean) as Spell[];

  return (
    <div className="space-y-6 text-stone-200">
      {/* Título da Seção */}
      <div className="border-b border-[#231b14] pb-3">
        <h3 className="font-cinzel text-lg font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-[#f5ba42]" />
          6. Conjuração / Magias de Nível 1 (Capítulo 10 do PHB)
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Configure seus truques arcanos ou divinos e as magias de 1º círculo conforme os limites oficiais do Livro do Jogador.
        </p>
      </div>

      {/* Painel de Métricas de Magia (CD e Bônus de Ataque Mágico) */}
      <div className="bg-[#0e111a] p-4 rounded-2xl border border-[#231b14] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="font-cinzel text-xs font-bold text-purple-300 uppercase tracking-wider block">
              Conjurador: {selectedClass}
            </span>
            <span className="text-xs text-stone-300">
              Atributo Chave: <strong className="text-[#f5ba42] uppercase">{castingAbility}</strong> ({formatModifier(mod)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-[#141824] px-3.5 py-1.5 rounded-xl border border-[#2b354f] text-center">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">CD Salvaguarda</span>
            <strong className="text-purple-300 font-cinzel text-base font-black">{spellSaveDc}</strong>
          </div>

          <div className="bg-[#141824] px-3.5 py-1.5 rounded-xl border border-[#2b354f] text-center">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Ataque Mágico</span>
            <strong className="text-purple-300 font-cinzel text-base font-black">{formatModifier(spellAttackBonus)}</strong>
          </div>

          <div className="bg-[#141824] px-3.5 py-1.5 rounded-xl border border-[#2b354f] text-center">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Espaços Nível 1</span>
            <strong className="text-purple-300 font-cinzel text-base font-black">
              {selectedClass === 'Bruxo' ? '1 (Pacto)' : '2 Espaços'}
            </strong>
          </div>
        </div>
      </div>

      {/* Magias Raciais Inatas (se houver) */}
      {racialSpells.length > 0 && (
        <div className="bg-[#141824] p-4 rounded-2xl border border-[#2f3850] space-y-2">
          <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
            Magias Inatas Concedidas pela Raça:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {racialSpells.map((sp, idx) => (
              <div key={idx} className="bg-[#0f131d] p-2.5 rounded-xl border border-[#262f44]">
                <div className="flex items-center justify-between font-bold text-purple-300">
                  <span>{sp.name}</span>
                  <span className="text-[10px] text-stone-400 uppercase">Atributo: {sp.ability}</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">{sp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. SELEÇÃO DE TRUQUES (CANTRIPS) */}
      <div className="bg-[#0e111a] p-5 rounded-2xl border border-[#231b14] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Truques Conhecidos ({selectedCantripIds.length}/{cantripsLimit} Selecionados):
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Truques podem ser conjurados à vontade, sem gastar espaços de magia.
            </p>
          </div>
          {selectedCantripIds.length === cantripsLimit ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800">
              <Check className="w-3.5 h-3.5" /> Completo
            </span>
          ) : (
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" /> Escolha {cantripsLimit - selectedCantripIds.length} restante(s)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {availableCantrips.map(cantrip => {
            const isSelected = selectedCantripIds.includes(cantrip.id);
            const canSelectMore = selectedCantripIds.length < cantripsLimit;

            return (
              <button
                key={cantrip.id}
                type="button"
                disabled={!isSelected && !canSelectMore}
                onClick={() => onToggleCantrip(cantrip.id)}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] font-semibold shadow-inner'
                    : canSelectMore
                    ? 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                    : 'bg-[#10131d] border-[#202535] text-stone-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold">
                    <span>{cantrip.name.split('(')[0].trim()}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{cantrip.school} • {cantrip.castingTime}</span>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{cantrip.description}</p>
                </div>
                {cantrip.damage && (
                  <span className="text-[10px] text-rose-400 font-bold mt-1.5 block">
                    Dano: {cantrip.damage}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELEÇÃO DE MAGIAS DE 1º CÍRCULO */}
      <div className="bg-[#0e111a] p-5 rounded-2xl border border-[#231b14] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              {spellsLabel} ({selectedSpellIds.length}/{spellsLimit} Selecionadas):
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {currentClass.isSpellbookCaster
                ? 'Mago adiciona 6 magias ao grimório e prepara INT mod + 1 magias para o dia.'
                : currentClass.isPreparedCaster
                ? 'Clérigo e Druida preparam magias diariamente de toda a lista de classe.'
                : 'Magias permanentes conhecidas que você pode conjurar usando espaços de 1º círculo.'}
            </p>
          </div>
          {selectedSpellIds.length === spellsLimit ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800">
              <Check className="w-3.5 h-3.5" /> Completo
            </span>
          ) : (
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" /> Escolha {spellsLimit - selectedSpellIds.length} restante(s)
            </span>
          )}
        </div>

        {/* Magias de Domínio Divino do Clérigo (se aplicável) */}
        {domainSpellIds.length > 0 && (
          <div className="bg-[#181524] p-3 rounded-xl border border-purple-800/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">
              Magias Concedidas pelo Domínio Divino (Sempre Preparadas e Gratuitas):
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {domainSpellIds.map(dId => {
                const sp = PHB_SPELLS_L0_L1.find(s => s.id === dId);
                return (
                  <span key={dId} className="bg-[#0e111a] px-2 py-1 rounded-lg border border-purple-600/50 text-purple-200 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3 text-purple-400" />
                    {sp?.name.split('(')[0].trim() || dId}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {availableSpells.map(spell => {
            const isSelected = selectedSpellIds.includes(spell.id);
            const isDomainAuto = domainSpellIds.includes(spell.id);
            const canSelectMore = selectedSpellIds.length < spellsLimit;

            return (
              <button
                key={spell.id}
                type="button"
                disabled={isDomainAuto || (!isSelected && !canSelectMore)}
                onClick={() => onToggleSpell(spell.id)}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                  isDomainAuto
                    ? 'bg-[#181524] border-purple-800 text-purple-200 opacity-80 cursor-default'
                    : isSelected
                    ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] font-semibold shadow-inner'
                    : canSelectMore
                    ? 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                    : 'bg-[#10131d] border-[#202535] text-stone-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold">
                    <span>{spell.name.split('(')[0].trim()}</span>
                    {isDomainAuto ? (
                      <span className="text-[9px] text-purple-300 font-bold px-1 rounded bg-[#0b0e17]">Domínio</span>
                    ) : isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[#f5ba42]" />
                    ) : null}
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{spell.school} • {spell.castingTime} • {spell.range}</span>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{spell.description}</p>
                </div>
                {spell.damage && (
                  <span className="text-[10px] text-rose-400 font-bold mt-1.5 block">
                    Dano / Efeito: {spell.damage}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
