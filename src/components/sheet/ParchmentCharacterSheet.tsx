import React, { useState } from 'react';
import { Character, Condition, SkillName, AbilityName } from '../../core/types/dnd';
import { calculateArmorClass, getPassiveSense, getAbilityModifier, formatModifier, calculateSpellcastingMetrics, getSkillModifier, SKILL_ABILITY_MAP } from '../../core/rules/calculations';
import { Shield, Heart, Zap, Sparkles, Dices, Eye, Skull, ArrowLeft, ChevronLeft, ChevronRight, Check, Image as ImageIcon } from 'lucide-react';

interface ParchmentCharacterSheetProps {
  character: Character;
  charactersList: Character[];
  onSelectCharacter: (char: Character) => void;
  onApplyDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onSpendSlot: (id: string, level: number) => void;
  onRestoreSlot: (id: string, level: number) => void;
  onToggleCondition: (id: string, cond: Condition) => void;
  onToggleInspiration: (id: string) => void;
  onRollCheck: (char: Character, name: string, mode: 'normal' | 'vantagem' | 'desvantagem') => void;
  onBackToMesa: () => void;
}

// Imagens extraídas dos PDFs oficiais para servir de pano de fundo e retrato
const ART_OPTIONS = [
  { id: 'art_0', name: 'Guerreiro / Herói 5e', path: '/extracted_art/art_0.jpg' },
  { id: 'art_2', name: 'Combate e Exploração', path: '/extracted_art/art_2.jpg' },
  { id: 'art_3', name: 'Mago e Conjurador', path: '/extracted_art/art_3.jpg' },
  { id: 'art_7', name: 'Mundo & Masmorras DMG', path: '/extracted_art/art_7.jpg' },
  { id: 'art_8', name: 'Artefato & Tesouros', path: '/extracted_art/art_8.jpg' },
  { id: 'art_9', name: 'Feras e Dragões', path: '/extracted_art/art_9.jpg' },
];

export const ParchmentCharacterSheet: React.FC<ParchmentCharacterSheetProps> = ({
  character,
  charactersList,
  onSelectCharacter,
  onApplyDamage,
  onHeal,
  onSpendSlot,
  onRestoreSlot,
  onToggleCondition,
  onToggleInspiration,
  onRollCheck,
  onBackToMesa
}) => {
  const [selectedArtIndex, setSelectedArtIndex] = useState<number>(() => {
    return character.class.toLowerCase().includes('mago') ? 2 : 0;
  });
  const [customHpVal, setCustomHpVal] = useState<string>('');
  const [rollMode, setRollMode] = useState<'normal' | 'vantagem' | 'desvantagem'>('normal');

  const { ac, breakdown: acBreakdown } = calculateArmorClass(character);
  const passivePerc = getPassiveSense(character, 'percepcao');
  const spellMetrics = calculateSpellcastingMetrics(character);

  // Modificador de Iniciativa = Modificador de Destreza
  const initiativeMod = getAbilityModifier(character.baseAbilities.des);
  const profBonus = Math.floor((character.level - 1) / 4) + 2;

  // Habilidades de Classe Sugeridas
  const getClassFeatures = (className: string) => {
    const cl = className.toLowerCase();
    if (cl.includes('guerreiro')) {
      return [
        { name: 'Estilo de Combate: Defesa', desc: '+1 de bônus na CA ao trajar armadura.' },
        { name: 'Retomar o Fôlego (Second Wind)', desc: 'Recupera 1d10 + nível de PV como ação bônus (1x por descanso curto/longo).' },
        { name: 'Surto de Ação (Action Surge)', desc: 'Ganha 1 ação adicional no seu turno (1x por descanso curto/longo).' }
      ];
    }
    if (cl.includes('mago')) {
      return [
        { name: 'Recuperação Arcana', desc: 'Em descanso curto, recupera espaços de magia somando metade do nível de mago.' },
        { name: 'Tradição Arcana (Evocação)', desc: 'Esculpir Magias: aliados passam automaticamente e não sofrem dano em magias de área.' },
        { name: 'Grimório Arcano', desc: 'Prepara número de magias igual a Modificador de INT + Nível de Mago.' }
      ];
    }
    return [
      { name: 'Características de Classe 5e', desc: `Proficiências e recursos ativos de nível ${character.level}.` }
    ];
  };

  const classFeatures = getClassFeatures(character.class);

  return (
    <div className="space-y-6">
      {/* Barra de Navegação Rápida entre Heróis */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#110e0a] border border-[#a17036]/50 p-3 rounded-2xl shadow-xl">
        <button
          onClick={onBackToMesa}
          className="bronze-btn px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Mesa de Jogo
        </button>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[10px] uppercase font-bold text-[#f5ba42] tracking-wider hidden sm:inline">
            Ficha Ativa:
          </span>
          {charactersList.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCharacter(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                c.id === character.id
                  ? 'bg-[#f5ba42] text-stone-950 shadow-md font-extrabold'
                  : 'bg-[#1e1710] text-[#f5ba42] border border-[#a17036]/50 hover:border-[#f5ba42]'
              }`}
            >
              <span>{c.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">({c.class})</span>
            </button>
          ))}
        </div>

        {/* Seletor de Arte do PDF */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedArtIndex((prev) => (prev > 0 ? prev - 1 : ART_OPTIONS.length - 1))}
            className="p-1 bg-[#1e1710] border border-[#a17036]/60 text-[#f5ba42] rounded hover:border-[#f5ba42]"
            title="Arte Anterior do PDF"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-stone-300 px-1 font-semibold flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-[#f5ba42]" /> {ART_OPTIONS[selectedArtIndex].name}
          </span>
          <button
            onClick={() => setSelectedArtIndex((prev) => (prev < ART_OPTIONS.length - 1 ? prev + 1 : 0))}
            className="p-1 bg-[#1e1710] border border-[#a17036]/60 text-[#f5ba42] rounded hover:border-[#f5ba42]"
            title="Próxima Arte do PDF"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FICHA ESTILO TANARES (template_person.png) */}
      <div
        className="relative bg-[#f5ebd4] text-[#2d2013] rounded-3xl p-5 sm:p-8 shadow-2xl border-4 border-[#8c6721] overflow-hidden"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), inset 0 0 80px rgba(140,103,33,0.3)',
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,250,240,0.85) 0%, rgba(245,235,212,0.92) 70%, rgba(212,186,140,0.98) 100%)`
        }}
      >
        {/* Marca d'água / Pano de fundo sutil com arte do PDF */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply bg-center bg-cover"
          style={{ backgroundImage: `url('${ART_OPTIONS[selectedArtIndex].path}')` }}
        />

        {/* 1. TOP BANNER: NOME E INFORMAÇÕES BÁSICAS */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-6">
          {/* Caixa de Nome com Borda de Ouro Esculpido */}
          <div className="lg:col-span-5 bg-gradient-to-r from-[#d9be7e] via-[#f7e6b5] to-[#c59e53] p-1 rounded-2xl shadow-md border-2 border-[#6d4f19]">
            <div className="bg-[#f5ead2] border border-[#a67b2d] rounded-xl px-4 py-3 flex flex-col justify-center items-center text-center h-full">
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#8c6721]">
                ◇ TANARES RPG 5E • FICHA OFICIAL ◇
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-black tracking-[0.18em] text-[#362106] drop-shadow-sm uppercase">
                {character.name}
              </h2>
            </div>
          </div>

          {/* Tabela de Informações: Classe, Antecedente, Raça, etc. */}
          <div className="lg:col-span-7 bg-[#eddcb9] border-2 border-[#94712e] rounded-2xl p-3 shadow-inner grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="border-b sm:border-b-0 sm:border-r border-[#be9e63]/70 pb-1 sm:pb-0 sm:pr-2">
              <span className="text-[9px] uppercase font-bold text-[#7a581e] block">Classe & Nível</span>
              <span className="font-bold text-stone-900 text-sm">{character.class} — {character.level}</span>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-[#be9e63]/70 pb-1 sm:pb-0 sm:pr-2">
              <span className="text-[9px] uppercase font-bold text-[#7a581e] block">Antecedente</span>
              <span className="font-bold text-stone-900">{character.background}</span>
            </div>

            <div className="border-b sm:border-b-0 pb-1 sm:pb-0">
              <span className="text-[9px] uppercase font-bold text-[#7a581e] block">Jogador</span>
              <span className="font-bold text-stone-900">{character.player || 'Jogador'}</span>
            </div>

            <div className="sm:border-r border-[#be9e63]/70 sm:pr-2 pt-1">
              <span className="text-[9px] uppercase font-bold text-[#7a581e] block">Espécie / Raça</span>
              <span className="font-bold text-stone-900">{character.race}</span>
            </div>

            <div className="sm:border-r border-[#be9e63]/70 sm:pr-2 pt-1">
              <span className="text-[9px] uppercase font-bold text-[#7a581e] block">Alinhamento</span>
              <span className="font-bold text-stone-900">{character.alignment}</span>
            </div>

            <div className="pt-1">
              <span className="text-[9px] uppercase font-bold text-[#7a581e] block">Pontos de XP</span>
              <span className="font-bold text-[#7a581e]">{character.xp} XP</span>
            </div>
          </div>
        </div>

        {/* 2. ÁREA CENTRAL: MEDALHÕES, PERÍCIAS, RETRATO DO HERÓI E ARCO DE ATRIBUTOS */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
          {/* COLUNA ESQUERDA: MEDALHÕES RÁPIDOS & LIVRO DE PERÍCIAS */}
          <div className="lg:col-span-4 space-y-4">
            {/* Linha de Medalhões Redondos e Escudo de CA */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Inspiração */}
              <button
                onClick={() => onToggleInspiration(character.id)}
                className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                  character.hasInspiration
                    ? 'bg-[#ffe4a0] border-[#b0882e] shadow-md'
                    : 'bg-[#ebd6ae] border-[#be9e63]/80 hover:bg-[#ffeec2]'
                }`}
                title="Alternar Inspiração"
              >
                <span className="text-[9px] uppercase font-bold text-[#7a581e]">Inspiração</span>
                <Sparkles className={`w-6 h-6 mt-1 ${character.hasInspiration ? 'text-[#a67b2d] fill-[#a67b2d]' : 'text-stone-400'}`} />
                <span className="text-[10px] font-bold mt-0.5">{character.hasInspiration ? 'Ativa' : 'Não'}</span>
              </button>

              {/* Bônus de Proficiência */}
              <div className="bg-[#ebd6ae] border-2 border-[#94712e] rounded-2xl p-2 flex flex-col items-center justify-center shadow">
                <span className="text-[9px] uppercase font-bold text-[#7a581e]">Proficiência</span>
                <span className="font-cinzel text-xl font-black text-stone-900">+{profBonus}</span>
                <span className="text-[8px] text-[#7a581e] font-semibold">Nível {character.level}</span>
              </div>

              {/* Iniciativa */}
              <div className="bg-[#ebd6ae] border-2 border-[#94712e] rounded-2xl p-2 flex flex-col items-center justify-center shadow">
                <span className="text-[9px] uppercase font-bold text-[#7a581e]">Iniciativa</span>
                <span className="font-cinzel text-xl font-black text-stone-900">{formatModifier(initiativeMod)}</span>
                <span className="text-[8px] text-[#7a581e] font-semibold">Mod. Des</span>
              </div>
            </div>

            {/* Escudo de CA, Deslocamento e Percepção Passiva */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Escudo de CA */}
              <div
                className="bg-gradient-to-b from-[#f2e2be] to-[#deb97a] border-2 border-[#6d4f19] rounded-2xl p-2 shadow-md flex flex-col items-center justify-center"
                title={acBreakdown}
              >
                <div className="flex items-center gap-1 text-[9px] uppercase font-extrabold text-[#5c3e0f]">
                  <Shield className="w-3 h-3 text-[#5c3e0f]" /> CA
                </div>
                <span className="font-cinzel text-2xl font-black text-[#362106] leading-none my-1">{ac}</span>
                <span className="text-[8px] text-[#5c3e0f] font-bold truncate max-w-full">Armadura</span>
              </div>

              {/* Deslocamento */}
              <div className="bg-[#ebd6ae] border-2 border-[#94712e] rounded-2xl p-2 flex flex-col items-center justify-center shadow">
                <span className="text-[9px] uppercase font-bold text-[#7a581e]">Velocidade</span>
                <span className="font-cinzel text-lg font-black text-stone-900">{character.speed}m</span>
                <span className="text-[8px] text-[#7a581e] font-semibold">30 ft</span>
              </div>

              {/* Percepção Passiva */}
              <div className="bg-[#ebd6ae] border-2 border-[#94712e] rounded-2xl p-2 flex flex-col items-center justify-center shadow">
                <span className="text-[9px] uppercase font-bold text-[#7a581e]">Perc. Passiva</span>
                <span className="font-cinzel text-lg font-black text-stone-900">{passivePerc}</span>
                <span className="text-[8px] text-[#7a581e] font-semibold">Sentidos</span>
              </div>
            </div>

            {/* Pergaminho de Perícias e Salvaguardas estilo Livro da Kelanyah */}
            <div className="bg-[#faedd4] border-2 border-[#8c6721] rounded-2xl p-3 shadow-md">
              <div className="flex items-center justify-between border-b-2 border-[#8c6721] pb-1.5 mb-2">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#5c3e0f] flex items-center gap-1.5">
                  📜 PERÍCIAS (SKILLS)
                </span>
                <span className="text-[9px] text-[#8c6721] font-bold">Clique para Rolar</span>
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 text-xs">
                {(Object.keys(SKILL_ABILITY_MAP) as SkillName[]).map(sk => {
                  const skDef = SKILL_ABILITY_MAP[sk];
                  const mod = getSkillModifier(character, sk);
                  const isProf = character.skillProficiencies.includes(sk);
                  const isExpert = character.skillExpertise?.includes(sk);

                  return (
                    <div
                      key={sk}
                      onClick={() => onRollCheck(character, sk, rollMode)}
                      className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-[#ebd6ae] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3 h-3 rounded-full border border-[#8c6721] flex items-center justify-center ${
                            isExpert
                              ? 'bg-amber-600 border-amber-800'
                              : isProf
                              ? 'bg-[#8b0000] border-[#5e0000]'
                              : 'bg-white/80'
                          }`}
                        >
                          {(isProf || isExpert) && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="font-medium text-stone-900 text-[11px] group-hover:text-[#8b0000]">
                          {skDef.name} <span className="text-[9px] text-[#7a581e]">({skDef.ability.toUpperCase()})</span>
                        </span>
                      </div>
                      <span className="font-bold text-stone-900 text-xs font-cinzel">{formatModifier(mod)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Fitas Marcadoras de Testes de Resistência (Saving Throws) */}
              <div className="mt-3 pt-2 border-t-2 border-[#8c6721]">
                <span className="text-[10px] uppercase font-bold text-[#5c3e0f] block mb-1">
                  Salvaguardas (Saving Throws):
                </span>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => {
                    const isProf = character.savingThrowProficiencies.includes(ab);
                    const mod = getAbilityModifier(character.baseAbilities[ab]) + (isProf ? profBonus : 0);
                    return (
                      <button
                        key={ab}
                        onClick={() => onRollCheck(character, ab, rollMode)}
                        className={`p-1 rounded border text-center transition-all ${
                          isProf
                            ? 'bg-[#8b0000] text-white border-[#520000] shadow'
                            : 'bg-[#ebd6ae] border-[#be9e63] text-stone-900 hover:bg-[#ffeec2]'
                        }`}
                        title={`Salvaguarda de ${ab.toUpperCase()}`}
                      >
                        <div className="text-[8px] font-bold uppercase">{ab}</div>
                        <div className="font-bold text-[10px] font-cinzel">{formatModifier(mod)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA CENTRAL: RETRATO E O FAMOSO ARCO DOS 6 ATRIBUTOS (COMO NA KELANYAH) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* O Arco dos 6 Atributos em Torno do Herói */}
            <div className="bg-[#faedd4] border-2 border-[#8c6721] rounded-2xl p-4 shadow-md">
              <div className="text-center mb-3">
                <span className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#5c3e0f]">
                  ◇ ATRIBUTOS PRIMORDIAIS (ABILITY SCORES) ◇
                </span>
              </div>

              {/* Grade / Arco das 6 Medalhas de Atributos */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {[
                  { key: 'for', name: 'FORÇA', abbrev: 'STR' },
                  { key: 'des', name: 'DESTREZA', abbrev: 'DEX' },
                  { key: 'con', name: 'CONSTITUIÇÃO', abbrev: 'CON' },
                  { key: 'int', name: 'INTELIGÊNCIA', abbrev: 'INT' },
                  { key: 'sab', name: 'SABEDORIA', abbrev: 'WIS' },
                  { key: 'car', name: 'CARISMA', abbrev: 'CHA' },
                ].map(item => {
                  const score = character.baseAbilities[item.key as AbilityName];
                  const mod = getAbilityModifier(score);

                  return (
                    <div
                      key={item.key}
                      onClick={() => onRollCheck(character, item.key, rollMode)}
                      className="cursor-pointer group flex flex-col items-center"
                    >
                      {/* Top Modifier Badge (Tampa Superior como na Kelanyah) */}
                      <div className="bg-gradient-to-r from-[#8b0000] to-[#b31414] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#520000] shadow -mb-2 z-20 group-hover:scale-105 transition-transform">
                        {formatModifier(mod)}
                      </div>

                      {/* Medalhão Circular Principal */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#fff7e6] via-[#f5ead2] to-[#dfbe7f] border-2 border-[#8c6721] shadow-md flex flex-col items-center justify-center p-1 group-hover:border-[#8b0000] transition-colors">
                        <span className="font-cinzel text-xl font-black text-[#2e1c03] leading-none mt-1">
                          {score}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#7a581e] mt-0.5">
                          {item.abbrev}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Retrato do Personagem com Arte Extraída do PDF */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div className="md:col-span-5 bg-[#eddcb9] border-2 border-[#8c6721] rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="relative flex-1 min-h-[220px] bg-stone-900">
                  <img
                    src={ART_OPTIONS[selectedArtIndex].path}
                    alt={character.name}
                    className="w-full h-full object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d2013]/90 via-transparent to-transparent flex items-end p-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#f5ba42] block">Retrato de Aventureiro</span>
                      <span className="font-cinzel text-sm font-bold text-white">{character.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Características Especiais de Classe (SPECIAL CLASS SKILLS como na Kelanyah) */}
              <div className="md:col-span-7 bg-[#faedd4] border-2 border-[#8c6721] rounded-2xl p-4 shadow-md flex flex-col justify-between">
                <div>
                  <div className="bg-[#8b0000] text-white px-3 py-1 rounded-lg text-center font-cinzel text-xs font-bold tracking-wider uppercase shadow mb-3 border border-[#520000]">
                    SPECIAL CLASS SKILLS • RECURSOS DE CLASSE
                  </div>

                  <div className="space-y-2 text-xs">
                    {classFeatures.map((f, i) => (
                      <div key={i} className="bg-[#f2e2be] border border-[#be9e63] p-2 rounded-lg">
                        <span className="font-bold text-[#5c3e0f] block">{f.name}</span>
                        <span className="text-[11px] text-stone-800">{f.desc}</span>
                      </div>
                    ))}
                    {character.notes && (
                      <div className="bg-[#f2e2be] border border-[#be9e63] p-2 rounded-lg">
                        <span className="font-bold text-[#5c3e0f] block">Notas Especiais:</span>
                        <span className="text-[11px] text-stone-800">{character.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Espaços de Magia se for Conjurador */}
                {Object.keys(character.spellSlots).length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#be9e63]">
                    <span className="text-[10px] font-bold text-[#5c3e0f] uppercase tracking-wider block mb-1">
                      Espaços de Magia (Spell Slots):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(character.spellSlots).map(([lvl, s]) => (
                        <div key={lvl} className="bg-[#ebd6ae] border border-[#94712e] px-2 py-0.5 rounded text-[11px] flex items-center gap-1.5">
                          <span className="font-bold text-stone-900">{lvl}º:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: s.max }).map((_, i) => {
                              const isSpent = i < s.used;
                              return (
                                <button
                                  key={i}
                                  onClick={() => isSpent ? onRestoreSlot(character.id, Number(lvl)) : onSpendSlot(character.id, Number(lvl))}
                                  className={`w-3 h-3 rounded-full border border-stone-800 ${
                                    isSpent ? 'bg-stone-400' : 'bg-[#8b0000]'
                                  }`}
                                  title={isSpent ? "Gasto (clique p/ restaurar)" : "Disponível (clique p/ gastar)"}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. PARTE INFERIOR: SAÚDE (HP), PERSONALIDADE & ATAQUES (IGUAL TEMPLATE_PERSON) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* BLOCO 1: PERSONALIDADE (PERSONALITY, IDEALS, BONDS, FLAWS) */}
          <div className="lg:col-span-4 space-y-2 text-xs">
            <div className="bg-[#faedd4] border-2 border-[#8c6721] rounded-xl p-2.5 shadow">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b0000] block mb-0.5">
                PERSONALITY TRAITS (Traços)
              </span>
              <p className="text-[11px] text-stone-800 italic">
                {character.personality.traits.join(' • ') || 'A definir'}
              </p>
            </div>

            <div className="bg-[#faedd4] border-2 border-[#8c6721] rounded-xl p-2.5 shadow">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b0000] block mb-0.5">
                IDEALS (Ideais)
              </span>
              <p className="text-[11px] text-stone-800">
                {character.personality.ideals || 'A definir'}
              </p>
            </div>

            <div className="bg-[#faedd4] border-2 border-[#8c6721] rounded-xl p-2.5 shadow">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b0000] block mb-0.5">
                BONDS (Vínculos)
              </span>
              <p className="text-[11px] text-stone-800">
                {character.personality.bonds || 'A definir'}
              </p>
            </div>

            <div className="bg-[#faedd4] border-2 border-[#8c6721] rounded-xl p-2.5 shadow">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b0000] block mb-0.5">
                FLAWS (Defeitos)
              </span>
              <p className="text-[11px] text-stone-800 text-rose-950 font-medium">
                {character.personality.flaws || 'A definir'}
              </p>
            </div>
          </div>

          {/* BLOCO 2: COMBATE & SAÚDE CENTRAL (HIT POINTS & DEATH SAVES) */}
          <div className="lg:col-span-4 bg-[#faedd4] border-2 border-[#8c6721] rounded-2xl p-4 shadow-md space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#ebd6ae] border border-[#94712e] rounded-xl p-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a581e] block">Dados de Vida</span>
                <span className="font-cinzel text-base font-black text-stone-900">{character.hitDiceTotal}{character.hitDie}</span>
              </div>

              <div className="bg-[#ebd6ae] border border-[#94712e] rounded-xl p-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a581e] block">HP Máximo</span>
                <span className="font-cinzel text-base font-black text-[#8b0000]">{character.maxHp} PV</span>
              </div>
            </div>

            {/* Caixa Central de Pontos de Vida Atuais */}
            <div className="bg-gradient-to-b from-[#f2e2be] to-[#e6cf9c] border-2 border-[#8c6721] rounded-xl p-3 text-center shadow-inner">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#7a581e] block">
                CURRENT HIT POINTS (PV ATUAIS)
              </span>
              <div className="font-cinzel text-4xl font-black text-[#520000] my-1">
                {character.currentHp}
                {character.tempHp > 0 && <span className="text-blue-700 text-lg ml-1 font-sans">(+{character.tempHp})</span>}
              </div>

              {/* Botões Rápidos de HP */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                <button
                  onClick={() => onApplyDamage(character.id, 1)}
                  className="px-2 py-0.5 bg-[#8b0000] hover:bg-rose-800 text-white rounded text-[10px] font-bold shadow"
                >
                  -1 Dano
                </button>
                <button
                  onClick={() => onApplyDamage(character.id, 5)}
                  className="px-2 py-0.5 bg-[#8b0000] hover:bg-rose-800 text-white rounded text-[10px] font-bold shadow"
                >
                  -5 Dano
                </button>
                <button
                  onClick={() => onHeal(character.id, 1)}
                  className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow"
                >
                  +1 Cura
                </button>
                <button
                  onClick={() => onHeal(character.id, 5)}
                  className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow"
                >
                  +5 Cura
                </button>
              </div>
            </div>

            {/* Testes contra a Morte (Death Saves como no template) */}
            <div className="bg-[#ebd6ae] border border-[#94712e] rounded-xl p-2.5 text-xs text-center space-y-1">
              <span className="text-[9px] font-bold uppercase text-[#7a581e] block">DEATH SAVES (SALVAGUARDAS DA MORTE)</span>
              <div className="flex justify-around items-center">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-800">Sucessos:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border border-stone-800 ${
                          i <= character.deathSaves.successes ? 'bg-emerald-600' : 'bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-rose-800">Falhas:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full border border-stone-800 ${
                          i <= character.deathSaves.failures ? 'bg-rose-600' : 'bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 3: ATTACKS & SPELLCASTING COM BORDA DE ESPADA FLAMEJANTE */}
          <div className="lg:col-span-4 bg-[#faedd4] border-2 border-[#8c6721] rounded-2xl p-4 shadow-md space-y-3">
            <div className="bg-[#8b0000] text-white px-3 py-1 rounded-lg text-center font-cinzel text-xs font-bold tracking-wider uppercase shadow border border-[#520000]">
              ⚔️ ATTACKS & SPELLCASTING
            </div>

            {/* Tabela de Armas e Ataques */}
            <div className="space-y-1.5 text-xs">
              {character.weapons.map((w, idx) => {
                const forMod = getAbilityModifier(character.baseAbilities.for);
                const desMod = getAbilityModifier(character.baseAbilities.des);
                // Ataque corpo a corpo ou acuidade
                const atkBonus = profBonus + (w.damageType === 'perfurante' ? Math.max(forMod, desMod) : forMod);

                return (
                  <div
                    key={idx}
                    onClick={() => onRollCheck(character, 'atletismo', rollMode)}
                    className="bg-[#f2e2be] border border-[#be9e63] p-2 rounded-lg cursor-pointer hover:border-[#8b0000] transition-colors"
                  >
                    <div className="flex justify-between items-center font-bold text-stone-900">
                      <span>{w.name}</span>
                      <span className="text-[#8b0000] font-cinzel">{formatModifier(atkBonus)} p/ Acerto</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-stone-700 mt-0.5">
                      <span>Dano: <strong>{w.damage}</strong> {w.damageType}</span>
                      <span className="text-[10px] text-[#7a581e] italic">{w.description || 'Arma marcial'}</span>
                    </div>
                  </div>
                );
              })}

              {character.spells.length > 0 && (
                <div className="pt-2 border-t border-[#be9e63] space-y-1">
                  <span className="text-[10px] font-bold text-[#5c3e0f] uppercase block">Magias de Ataque:</span>
                  {character.spells.slice(0, 3).map((sp) => (
                    <div key={sp.id} className="bg-[#f2e2be] border border-[#be9e63] p-1.5 rounded text-[11px] flex justify-between">
                      <span className="font-semibold text-stone-900">{sp.name}</span>
                      <span className="text-[#8b0000] font-bold">{sp.range}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Condições Ativas com Badges */}
            <div className="pt-2 border-t border-[#be9e63]">
              <span className="text-[10px] font-bold text-[#5c3e0f] uppercase block mb-1">
                Condições de Status:
              </span>
              <div className="flex flex-wrap gap-1">
                {character.conditions.length === 0 ? (
                  <span className="text-[11px] text-stone-600 italic">Nenhuma condição ativa.</span>
                ) : (
                  character.conditions.map(c => (
                    <span
                      key={c}
                      className="bg-[#8b0000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {c}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
