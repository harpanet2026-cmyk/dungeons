import React from 'react';
import { Character, AbilityScores, SkillName, AbilityName, Item, Spell } from '../../core/types/dnd';
import { getAbilityModifier, formatModifier, calculateArmorClass, getPassiveSense, calculateWeaponAttack, SKILL_ABILITY_MAP, getProficiencyBonus } from '../../core/rules/calculations';
import { Shield, Heart, Zap, Sparkles, Eye, Sword, Dices, BookOpen, Compass, CheckCircle2 } from 'lucide-react';
import { getClassPortrait } from '../../core/rules/srdData';

interface LivePreviewSheetProps {
  name: string;
  player: string;
  race: string;
  subrace?: string;
  className: string;
  subclass?: string;
  level: number;
  alignment: string;
  background: string;
  finalAbilities: AbilityScores;
  savingThrowProficiencies: AbilityName[];
  skillProficiencies: SkillName[];
  skillExpertise: SkillName[];
  maxHp: number;
  speed: number;
  equippedArmor?: Item;
  equippedShield?: Item;
  weapons: Item[];
  fightingStyle?: string;
  spells: Spell[];
  spellcastingAbility?: AbilityName;
  coins: { pc: number; pp: number; pe: number; po: number; pl: number };
  inventory: Item[];
  traits: string[];
  gender?: 'masculino' | 'feminino' | string;
}

export const LivePreviewSheet: React.FC<LivePreviewSheetProps> = ({
  name,
  player,
  race,
  subrace,
  className,
  subclass,
  level,
  alignment,
  background,
  gender = 'masculino',
  finalAbilities,
  savingThrowProficiencies,
  skillProficiencies,
  skillExpertise,
  maxHp,
  speed,
  equippedArmor,
  equippedShield,
  weapons,
  fightingStyle,
  spells,
  spellcastingAbility,
  coins,
  inventory,
  traits
}) => {
  // Mock character para os helpers de cálculo
  const mockChar: Character = {
    id: 'preview',
    name: name || 'Aventureiro Sem Nome',
    player: player || 'Jogador',
    race,
    subrace,
    class: className,
    subclass,
    level,
    xp: 0,
    alignment: alignment as any,
    background,
    baseAbilities: finalAbilities,
    savingThrowProficiencies,
    skillProficiencies,
    skillExpertise,
    maxHp,
    currentHp: maxHp,
    tempHp: 0,
    hitDie: '1d10',
    hitDiceTotal: level,
    hitDiceUsed: 0,
    deathSaves: { successes: 0, failures: 0 },
    speed,
    hasInspiration: false,
    equippedArmor,
    equippedShield,
    weapons,
    spellcastingAbility,
    spellSlots: {},
    spells,
    inventory,
    coins,
    personality: {
      traits,
      ideals: '',
      bonds: '',
      flaws: '',
      backstory: '',
      secretsOrHooks: ''
    },
    conditions: [],
    notes: '',
    gender,
    avatarUrl: getClassPortrait(className, gender)
  };

  const { ac, breakdown: acBreakdown } = calculateArmorClass(mockChar);
  const initiativeMod = getAbilityModifier(finalAbilities.des);
  const passivePerc = getPassiveSense(mockChar, 'percepcao');
  const profBonus = getProficiencyBonus(level);

  // CD e Ataque Mágico se for conjurador
  const spellMod = spellcastingAbility ? getAbilityModifier(finalAbilities[spellcastingAbility]) : 0;
  const spellSaveDc = spellcastingAbility ? 8 + profBonus + spellMod : null;
  const spellAttackBonus = spellcastingAbility ? profBonus + spellMod : null;

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-[#0c0e15]/80 backdrop-blur-md border-2 border-[#a17036]/60 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-stone-200 sticky top-6">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between border-b border-[#231b14] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#f5ba42]" />
          <span className="font-cinzel text-xs font-black uppercase tracking-widest text-[#f5ba42]">
            Resumo da Ficha (Tempo Real)
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1e2538] text-amber-400 border border-[#a17036]/30">
          Nível {level}
        </span>
      </div>

      {/* Retrato e Identidade */}
      <div className="flex items-center gap-3 bg-[#131724] p-3 rounded-2xl border border-[#262f44]">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#f5ba42] shadow-md flex-shrink-0 bg-stone-900">
          <img
            src={getClassPortrait(className, gender)}
            alt={className}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-cinzel text-sm font-bold text-stone-100 truncate">
            {name.trim() || 'Aventureiro Sem Nome'}
          </h3>
          <p className="text-[11px] text-[#f5ba42] font-semibold truncate">
            {race} {subrace ? `(${subrace})` : ''}
          </p>
          <p className="text-[10px] text-stone-400 truncate">
            {className} {subclass ? `• ${subclass}` : ''} • {background}
          </p>
        </div>
      </div>

      {/* Grid de Métricas de Combate: PV, CA, Iniciativa, Deslocamento */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[#141824] border border-[#2b334a] p-2 rounded-xl text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[10px] text-rose-400 font-bold mb-0.5">
            <Heart className="w-3 h-3 fill-rose-500/30 text-rose-500" />
            <span>PV</span>
          </div>
          <span className="font-cinzel text-sm font-black text-rose-300">{maxHp}</span>
        </div>

        <div className="bg-[#141824] border border-[#2b334a] p-2 rounded-xl text-center shadow-sm" title={acBreakdown}>
          <div className="flex items-center justify-center gap-1 text-[10px] text-blue-400 font-bold mb-0.5">
            <Shield className="w-3 h-3 fill-blue-500/30 text-blue-500" />
            <span>CA</span>
          </div>
          <span className="font-cinzel text-sm font-black text-blue-300">{ac}</span>
        </div>

        <div className="bg-[#141824] border border-[#2b334a] p-2 rounded-xl text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold mb-0.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>INIC</span>
          </div>
          <span className="font-cinzel text-sm font-black text-amber-300">{formatModifier(initiativeMod)}</span>
        </div>

        <div className="bg-[#141824] border border-[#2b334a] p-2 rounded-xl text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold mb-0.5">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>DESL</span>
          </div>
          <span className="font-cinzel text-sm font-black text-emerald-300">{speed}m</span>
        </div>
      </div>

      {/* Sentidos e Conjurador */}
      <div className="flex items-center justify-between text-[11px] bg-[#141824] px-3 py-1.5 rounded-xl border border-[#262f44]">
        <span className="text-stone-400 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-stone-400" /> Percepção Passiva:
        </span>
        <strong className="text-stone-200 font-cinzel font-bold">{passivePerc}</strong>
      </div>

      {spellSaveDc !== null && (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-[#1a182a] border border-[#4e3a6e] px-2.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-purple-300 uppercase block font-semibold">CD Magia</span>
            <strong className="text-purple-200 font-cinzel text-xs font-bold">{spellSaveDc}</strong>
          </div>
          <div className="bg-[#1a182a] border border-[#4e3a6e] px-2.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-purple-300 uppercase block font-semibold">Ataque Mágico</span>
            <strong className="text-purple-200 font-cinzel text-xs font-bold">{formatModifier(spellAttackBonus || 0)}</strong>
          </div>
        </div>
      )}

      {/* 6 Atributos Finais & Modificadores */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
          <Dices className="w-3 h-3 text-[#f5ba42]" /> Atributos Finais (com bônus)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => {
            const val = finalAbilities[ab];
            const mod = getAbilityModifier(val);
            const isSaveProf = savingThrowProficiencies.includes(ab);

            return (
              <div
                key={ab}
                className={`p-1.5 rounded-lg border text-center transition-all ${
                  isSaveProf
                    ? 'bg-[#1e1b15] border-[#f5ba42]/40 text-[#f5ba42]'
                    : 'bg-[#121622] border-[#262f44] text-stone-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold text-stone-400">
                  <span>{ab}</span>
                  {isSaveProf && <span className="text-[#f5ba42] font-black" title="Proficiente em Salvaguarda">★</span>}
                </div>
                <div className="font-cinzel text-xs font-bold text-stone-100">{val}</div>
                <div className="text-[10px] font-semibold text-amber-400">{formatModifier(mod)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ataques Calculados */}
      {weapons.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
            <Sword className="w-3 h-3 text-red-400" /> Ataques Calculados
          </span>
          <div className="space-y-1">
            {weapons.slice(0, 2).map((wpn, idx) => {
              const atk = calculateWeaponAttack(mockChar, wpn, fightingStyle);
              return (
                <div key={idx} className="bg-[#141824] border border-[#2b334a] px-2.5 py-1.5 rounded-xl flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-stone-200 truncate">{wpn.name}</span>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-amber-400 font-cinzel font-bold">{formatModifier(atk.attackBonus)}</span>
                    <span className="text-stone-400 text-[10px]">{atk.damageFormula}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perícias Treinadas */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400 tracking-wider">
          <span>Perícias Treinadas ({skillProficiencies.length})</span>
          <span className="text-amber-400">Prof: +{profBonus}</span>
        </div>
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
          {skillProficiencies.length === 0 ? (
            <span className="text-[11px] text-stone-500 italic">Nenhuma perícia selecionada</span>
          ) : (
            skillProficiencies.map(sk => {
              const isExpert = skillExpertise.includes(sk);
              const skName = SKILL_ABILITY_MAP[sk]?.name || sk;
              return (
                <span
                  key={sk}
                  className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isExpert
                      ? 'bg-amber-950/60 border-amber-600 text-amber-300 font-bold'
                      : 'bg-[#182030] border-[#37415e] text-stone-300'
                  }`}
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#f5ba42]" />
                  <span>{skName}</span>
                  {isExpert && <span className="text-amber-400 text-[9px] font-black" title="Especialização (x2)">(x2)</span>}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Magias Conhecidas / Preparadas */}
      {spells.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-purple-400" /> Magias ({spells.length})
          </span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {spells.map(sp => (
              <span key={sp.id} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1d162e] border border-[#4d3674] text-purple-200">
                {sp.name.split('(')[0].trim()} ({sp.level === 0 ? 'Truque' : '1º'})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ouro Inicial */}
      <div className="border-t border-[#231b14] pt-2 flex items-center justify-between text-[11px]">
        <span className="text-stone-400">Riqueza em Moedas:</span>
        <span className="text-amber-400 font-cinzel font-bold">
          {coins.po} PO {coins.pp > 0 ? `• ${coins.pp} PP` : ''} {coins.pc > 0 ? `• ${coins.pc} PC` : ''}
        </span>
      </div>
    </aside>
  );
};
