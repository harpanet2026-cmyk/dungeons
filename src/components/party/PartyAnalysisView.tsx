import React, { useState } from 'react';
import { Character } from '../../core/types/dnd';
import { calculatePartyEncounterThresholds, analyzePartySynergy } from '../../core/analysis/encounterAnalysis';
import { getPassiveSense, calculateArmorClass } from '../../core/rules/calculations';
import { Shield, Swords, HeartPulse, Sparkles, Compass, Eye, AlertOctagon, CheckCircle2, Calculator, Info } from 'lucide-react';

interface PartyAnalysisViewProps {
  characters: Character[];
}

export const PartyAnalysisView: React.FC<PartyAnalysisViewProps> = ({ characters }) => {
  const [monsterXpInput, setMonsterXpInput] = useState<string>('');
  const [monsterCount, setMonsterCount] = useState<number>(1);

  const thresholds = calculatePartyEncounterThresholds(characters);
  const synergy = analyzePartySynergy(characters);

  // Multiplicador de monstros do DMG (Capítulo 3)
  const getMultiplier = (count: number) => {
    if (count <= 1) return 1;
    if (count === 2) return 1.5;
    if (count >= 3 && count <= 6) return 2;
    if (count >= 7 && count <= 10) return 2.5;
    if (count >= 11 && count <= 14) return 3;
    return 4;
  };

  const rawXp = parseInt(monsterXpInput) || 0;
  const adjustedXp = Math.round(rawXp * getMultiplier(monsterCount));

  let evaluatedDifficulty = 'Nenhum';
  let diffBadgeColor = 'bg-slate-800 text-slate-400';

  if (adjustedXp > 0) {
    if (adjustedXp < thresholds.easy) {
      evaluatedDifficulty = 'Trivial (Abaixo de Fácil)';
      diffBadgeColor = 'bg-slate-700 text-slate-200';
    } else if (adjustedXp < thresholds.medium) {
      evaluatedDifficulty = 'Fácil (Easy)';
      diffBadgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    } else if (adjustedXp < thresholds.hard) {
      evaluatedDifficulty = 'Médio (Medium)';
      diffBadgeColor = 'bg-amber-950 text-amber-300 border border-amber-800';
    } else if (adjustedXp < thresholds.deadly) {
      evaluatedDifficulty = 'Difícil (Hard)';
      diffBadgeColor = 'bg-orange-950 text-orange-300 border border-orange-800';
    } else {
      evaluatedDifficulty = 'MORTAL (Deadly) ⚠️';
      diffBadgeColor = 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse';
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumo do Orçamento de Encontros (DMG Cap. 3) */}
      <div className="bg-[#0e111a] border border-[#231b14] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-[#231b14] pb-4">
          <div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#f5ba42] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#f5ba42]" />
              CALIBRAÇÃO DE ENCONTROS (GUIA DO MESTRE 5E)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Limiares de XP acumulados para o grupo de {characters.length} heróis (Capítulo 3 do Guia do Mestre).
            </p>
          </div>
          <div className="bg-[#141824] border border-[#262f44] px-4 py-2 rounded-xl text-xs font-semibold text-stone-300">
            Orçamento Diário de Aventura: <strong className="text-[#f5ba42] font-bold">{thresholds.dailyBudget} XP</strong>
          </div>
        </div>

        {/* Grade de Limiares */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-lg text-center">
            <span className="text-[11px] uppercase font-bold text-emerald-400 block">Fácil</span>
            <span className="text-xl font-extrabold text-emerald-300">{thresholds.easy} XP</span>
            <p className="text-[10px] text-slate-400 mt-1">Gasto mínimo de recursos</p>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-lg text-center">
            <span className="text-[11px] uppercase font-bold text-amber-400 block">Médio</span>
            <span className="text-xl font-extrabold text-amber-300">{thresholds.medium} XP</span>
            <p className="text-[10px] text-slate-400 mt-1">Exige algumas magias ou cura</p>
          </div>

          <div className="bg-orange-950/30 border border-orange-800/50 p-3 rounded-lg text-center">
            <span className="text-[11px] uppercase font-bold text-orange-400 block">Difícil</span>
            <span className="text-xl font-extrabold text-orange-300">{thresholds.hard} XP</span>
            <p className="text-[10px] text-slate-400 mt-1">Risco sério se houver erros</p>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-lg text-center">
            <span className="text-[11px] uppercase font-bold text-rose-400 block">Mortal</span>
            <span className="text-xl font-extrabold text-rose-300">{thresholds.deadly} XP</span>
            <p className="text-[10px] text-slate-400 mt-1">Risco real de morte ou TPK</p>
          </div>
        </div>

        {/* Simulador de Encontro Rápido */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Testar Dificuldade de Encontro (Para o Gemini ou Mestre)
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">XP Total dos Monstros:</label>
              <input
                type="number"
                placeholder="Ex: 450"
                value={monsterXpInput}
                onChange={(e) => setMonsterXpInput(e.target.value)}
                className="w-32 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Qtd. de Monstros:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={monsterCount}
                onChange={(e) => setMonsterCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:ml-auto flex items-center gap-3 mt-3 sm:mt-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">XP Ajustado (mult ×{getMultiplier(monsterCount)}):</span>
                <span className="text-sm font-bold text-slate-200">{adjustedXp} XP</span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${diffBadgeColor}`}>
                {evaluatedDifficulty}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sinergia do Grupo & Cobertura de Papéis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#151924] border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-md font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Radar de Funções do Grupo (Role Coverage)
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Linha de Frente / Tank', score: synergy.frontlineScore, icon: Shield, color: 'bg-blue-500' },
              { label: 'Dano Sustentado (DPS)', score: synergy.damageScore, icon: Swords, color: 'bg-rose-500' },
              { label: 'Suporte & Cura', score: synergy.supportScore, icon: HeartPulse, color: 'bg-emerald-500' },
              { label: 'Controle de Grupo (CC)', score: synergy.controlScore, icon: Sparkles, color: 'bg-purple-500' },
              { label: 'Utilitário & Exploração', score: synergy.utilityScore, icon: Compass, color: 'bg-cyan-500' },
              { label: 'Sentidos & Alerta', score: synergy.sensesScore, icon: Eye, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-200">{item.score}/100</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full ${item.color} transition-all duration-300`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnóstico Tático e Gaps para o Gemini */}
        <div className="bg-[#151924] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-amber-300 mb-3 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Ganchos Táticos & Pontos Cegos (Para o Gemini)
            </h3>

            {synergy.gaps.length > 0 && (
              <div className="space-y-2 mb-4">
                <span className="text-[11px] uppercase font-bold text-rose-400 tracking-wider">⚠️ Vulnerabilidades Detectadas:</span>
                {synergy.gaps.map((g, idx) => (
                  <div key={idx} className="bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg text-xs text-rose-200 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            )}

            {synergy.strengths.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">🛡️ Pontos Fortes:</span>
                {synergy.strengths.map((s, idx) => (
                  <div key={idx} className="bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded-lg text-xs text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
            * Estas informações são injetadas automaticamente no Dossiê da Campanha para que o Gemini Pro crie encontros desafiadores sem ser injusto.
          </div>
        </div>
      </div>

      {/* Tabela de Sentidos Passivos do Grupo */}
      <div className="bg-[#151924] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-md font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          Painel de Sentidos Passivos e Defesa
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Personagem</th>
                <th className="py-2.5 px-3">Classe/Nível</th>
                <th className="py-2.5 px-3">CA</th>
                <th className="py-2.5 px-3">HP Atual</th>
                <th className="py-2.5 px-3">Perc. Passiva</th>
                <th className="py-2.5 px-3">Invest. Passiva</th>
                <th className="py-2.5 px-3">Intuição Passiva</th>
                <th className="py-2.5 px-3">Visão no Escuro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {characters.map(c => {
                const { ac } = calculateArmorClass(c);
                const perc = getPassiveSense(c, 'percepcao');
                const inv = getPassiveSense(c, 'investigacao');
                const ins = getPassiveSense(c, 'intuicao');
                const hasDarkvision = c.race.toLowerCase().includes('elfo') || c.race.toLowerCase().includes('anão') || c.race.toLowerCase().includes('orc') || c.race.toLowerCase().includes('tiefling');

                return (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.class} {c.level}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">{ac}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.currentHp}/{c.maxHp}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">{perc}</td>
                    <td className="py-2.5 px-3 text-slate-300">{inv}</td>
                    <td className="py-2.5 px-3 text-slate-300">{ins}</td>
                    <td className="py-2.5 px-3">
                      {hasDarkvision ? (
                        <span className="text-emerald-400 font-semibold">Sim (18m)</span>
                      ) : (
                        <span className="text-slate-500">Não (Requer Luz)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
