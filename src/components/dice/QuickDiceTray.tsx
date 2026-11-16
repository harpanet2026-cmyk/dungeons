import React, { useState } from 'react';
import { DiceAudioEngine } from '../../core/audio/diceAudio';
import { Dices, ChevronUp, ChevronDown, RotateCcw, Volume2, Sparkles, X } from 'lucide-react';

export type PolyhedralDie = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface DiceHistoryItem {
  id: string;
  notation: string;
  rolls: number[];
  modifier: number;
  total: number;
  timestamp: string;
}

export const QuickDiceTray: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dieType, setDieType] = useState<PolyhedralDie>(20);
  const [quantity, setQuantity] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [advantageMode, setAdvantageMode] = useState<'normal' | 'vantagem' | 'desvantagem'>('normal');
  const [lastResult, setLastResult] = useState<{
    rolls: number[];
    modifier: number;
    total: number;
    breakdown: string;
    isCritSuccess?: boolean;
    isCritFail?: boolean;
  } | null>(null);
  const [history, setHistory] = useState<DiceHistoryItem[]>([]);

  const handleRoll = () => {
    DiceAudioEngine.playDiceRollSound();

    let rolledValues: number[] = [];
    let breakdown = '';
    let total = 0;
    let isCritSuccess = false;
    let isCritFail = false;

    if (dieType === 20 && advantageMode !== 'normal') {
      const r1 = Math.floor(Math.random() * 20) + 1;
      const r2 = Math.floor(Math.random() * 20) + 1;
      const chosen = advantageMode === 'vantagem' ? Math.max(r1, r2) : Math.min(r1, r2);
      const discarded = advantageMode === 'vantagem' ? Math.min(r1, r2) : Math.max(r1, r2);

      rolledValues = [r1, r2];
      total = chosen + modifier;
      breakdown = `[${chosen}, (desc. ${discarded})] ${modifier !== 0 ? (modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`) : ''}`;
      if (chosen === 20) isCritSuccess = true;
      if (chosen === 1) isCritFail = true;
    } else {
      for (let i = 0; i < quantity; i++) {
        const val = Math.floor(Math.random() * dieType) + 1;
        rolledValues.push(val);
      }
      const sumRolls = rolledValues.reduce((a, b) => a + b, 0);
      total = sumRolls + modifier;
      breakdown = `(${rolledValues.join(' + ')}) ${modifier !== 0 ? (modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`) : ''}`;

      if (dieType === 20 && quantity === 1) {
        if (rolledValues[0] === 20) isCritSuccess = true;
        if (rolledValues[0] === 1) isCritFail = true;
      }
    }

    const result = {
      rolls: rolledValues,
      modifier,
      total,
      breakdown: breakdown.trim(),
      isCritSuccess,
      isCritFail
    };

    setLastResult(result);

    const historyItem: DiceHistoryItem = {
      id: Math.random().toString(),
      notation: `${quantity > 1 ? `${quantity}d${dieType}` : `d${dieType}`}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''} ${advantageMode !== 'normal' ? `(${advantageMode})` : ''}`,
      rolls: rolledValues,
      modifier,
      total,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  const DICE_LIST: { die: PolyhedralDie; label: string }[] = [
    { die: 4, label: 'd4' },
    { die: 6, label: 'd6' },
    { die: 8, label: 'd8' },
    { die: 10, label: 'd10' },
    { die: 12, label: 'd12' },
    { die: 20, label: 'd20' },
    { die: 100, label: 'd100' }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Botão de Toggle da Bandeja */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bronze-btn px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold tracking-wider uppercase border border-[#a17036] hover:scale-105 transition-transform"
          title="Abrir Bandeja Rápida de Rolagem de Dados"
        >
          <Dices className="w-4 h-4 text-[#f5ba42] animate-spin-slow" />
          <span>Rolar Dados</span>
        </button>
      ) : (
        /* Bandeja Expandida */
        <div className="bg-[#0f121a] border-2 border-[#a17036] rounded-2xl w-80 sm:w-96 shadow-2xl p-4 text-stone-200 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#231b14] pb-2.5 mb-3">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] flex items-center gap-2 uppercase tracking-wider">
              <Dices className="w-4 h-4 text-[#f5ba42]" /> Bandeja Rápida de Dados
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-100 p-1 rounded-lg hover:bg-[#1a1f2c] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Seleção de Dados */}
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {DICE_LIST.map(({ die, label }) => (
              <button
                key={die}
                onClick={() => setDieType(die)}
                className={`py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${
                  dieType === die
                    ? 'bg-[#f5ba42] text-stone-950 shadow font-black scale-105'
                    : 'bg-[#181d2c] hover:bg-[#20273b] text-stone-300 border border-[#2b334a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Controles: Quantidade, Modificador, Vantagem */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            {/* Quantidade */}
            <div className="bg-[#141824] border border-[#262f44] rounded-lg p-2 flex flex-col items-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Qtd</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-5 h-5 rounded bg-[#20273a] hover:bg-stone-700 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-sm text-stone-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  className="w-5 h-5 rounded bg-[#20273a] hover:bg-stone-700 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Modificador */}
            <div className="bg-[#141824] border border-[#262f44] rounded-lg p-2 flex flex-col items-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Bônus (+/-)</span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  onClick={() => setModifier(modifier - 1)}
                  className="w-5 h-5 rounded bg-[#20273a] hover:bg-stone-700 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-sm text-[#f5ba42]">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                <button
                  onClick={() => setModifier(modifier + 1)}
                  className="w-5 h-5 rounded bg-[#20273a] hover:bg-stone-700 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Modo Vantagem (Apenas se d20) */}
            <div className="bg-[#141824] border border-[#262f44] rounded-lg p-1.5 flex flex-col justify-between">
              <span className="text-[9px] text-stone-400 uppercase font-bold text-center">Modo (d20)</span>
              <select
                disabled={dieType !== 20}
                value={advantageMode}
                onChange={e => setAdvantageMode(e.target.value as any)}
                className="bg-[#0b0d14] border border-[#2b334a] rounded text-[10px] text-stone-200 p-1 outline-none disabled:opacity-40"
              >
                <option value="normal">Normal</option>
                <option value="vantagem">Vantagem</option>
                <option value="desvantagem">Desvantagem</option>
              </select>
            </div>
          </div>

          {/* Botão Principal de Rolagem */}
          <button
            onClick={handleRoll}
            className="w-full bronze-btn py-2.5 rounded-xl font-cinzel font-bold text-sm text-[#f5ba42] flex items-center justify-center gap-2 shadow-lg mb-3 uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            <Dices className="w-5 h-5 text-[#f5ba42]" />
            Rolar {quantity}d{dieType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
          </button>

          {/* Resultado da Última Rolagem */}
          {lastResult && (
            <div className={`p-3 rounded-xl border mb-3 text-center transition-all animate-in zoom-in-95 ${
              lastResult.isCritSuccess
                ? 'bg-amber-950/80 border-amber-500 shadow-lg shadow-amber-500/20'
                : lastResult.isCritFail
                ? 'bg-rose-950/80 border-rose-600 shadow-lg shadow-rose-600/20'
                : 'bg-[#141824] border-[#262f44]'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black font-cinzel text-[#f5ba42]">
                  {lastResult.total}
                </span>
                {lastResult.isCritSuccess && (
                  <span className="text-[10px] bg-amber-500 text-stone-950 font-black uppercase px-2 py-0.5 rounded-full">
                    Crítico! (20)
                  </span>
                )}
                {lastResult.isCritFail && (
                  <span className="text-[10px] bg-rose-600 text-white font-black uppercase px-2 py-0.5 rounded-full">
                    Falha Crítica! (1)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-1 font-mono">
                {lastResult.breakdown} = <strong className="text-stone-200">{lastResult.total}</strong>
              </p>
            </div>
          )}

          {/* Histórico Recente */}
          {history.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-stone-400 block px-1">Últimas Rolagens:</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                {history.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-[#131622] px-2 py-1 rounded text-stone-300">
                    <span>{item.notation}</span>
                    <span className="font-bold text-[#f5ba42] text-xs">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
