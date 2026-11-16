import React, { useState } from 'react';
import { Dices, Check, X, Shield, Swords, Sparkles } from 'lucide-react';

export interface PendingRoll {
  title: string;
  subtitle: string;
  modifier: number;
  targetAc?: number;
  damageFormula?: string;
  damageType?: string;
  onConfirm: (manualD20: number, manualDamage?: number) => void;
  onAutoRoll: () => void;
}

interface ManualDiceModalProps {
  pendingRoll: PendingRoll | null;
  onClose: () => void;
}

export const ManualDiceModal: React.FC<ManualDiceModalProps> = ({ pendingRoll, onClose }) => {
  if (!pendingRoll) return null;

  const [d20Val, setD20Val] = useState<string>('10');
  const [damageVal, setDamageVal] = useState<string>('');

  const numD20 = Math.max(1, Math.min(20, parseInt(d20Val) || 10));
  const totalAtk = numD20 + pendingRoll.modifier;
  const isCrit = numD20 === 20;
  const isFumble = numD20 === 1;
  const isHit = pendingRoll.targetAc !== undefined ? (isCrit || (!isFumble && totalAtk >= pendingRoll.targetAc)) : true;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const dmg = damageVal ? parseInt(damageVal) : undefined;
    pendingRoll.onConfirm(numD20, dmg);
    onClose();
  };

  const handleAuto = () => {
    pendingRoll.onAutoRoll();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#12100d] border-2 border-[#a17036] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#231b14] border border-[#a17036] px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#f5ba42]">
            <Dices className="w-3.5 h-3.5 text-[#f5ba42]" /> Rolagem Manual Imparcial
          </div>
          <h3 className="font-cinzel text-xl font-bold gold-gradient-text tracking-wide">
            {pendingRoll.title}
          </h3>
          <p className="text-xs text-stone-400 font-light">
            {pendingRoll.subtitle}
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Caixa do D20 Físico */}
          <div className="bg-[#1b1510] border border-[#a17036]/60 rounded-xl p-4 text-center space-y-2">
            <label className="text-xs font-semibold text-stone-300 block">
              Qual foi o resultado do seu D20 Físico? (1 a 20):
            </label>
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                min="1"
                max="20"
                required
                autoFocus
                value={d20Val}
                onChange={(e) => setD20Val(e.target.value)}
                className="w-24 text-center font-cinzel text-3xl font-black bg-[#0d0a07] border-2 border-[#a17036] rounded-xl py-1 text-[#f5ba42] focus:outline-none focus:border-[#ffd470] shadow-inner"
              />
              <div className="text-left text-xs space-y-0.5">
                <div>Modificador: <strong className="text-[#f5ba42] font-cinzel">{pendingRoll.modifier >= 0 ? `+${pendingRoll.modifier}` : pendingRoll.modifier}</strong></div>
                {pendingRoll.targetAc !== undefined && (
                  <div>Alvo CA: <strong className="text-blue-400">{pendingRoll.targetAc}</strong></div>
                )}
                <div>Total: <strong className="text-stone-100 text-sm font-cinzel">{totalAtk}</strong></div>
              </div>
            </div>

            {/* Veredito do Teste */}
            {pendingRoll.targetAc !== undefined && (
              <div className="pt-2">
                {isCrit ? (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-600 px-3 py-1 rounded-full animate-pulse">
                    💥 20 NATURAL! ACERTO CRÍTICO!
                  </span>
                ) : isFumble ? (
                  <span className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full">
                    ❌ 1 NATURAL! FALHA CRÍTICA!
                  </span>
                ) : isHit ? (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                    🎯 ACERTOU! ({totalAtk} ≥ CA {pendingRoll.targetAc})
                  </span>
                ) : (
                  <span className="text-xs font-bold text-stone-400 bg-stone-900 border border-stone-700 px-3 py-1 rounded-full">
                    🛡️ ERROU! ({totalAtk} &lt; CA {pendingRoll.targetAc})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Campo Opcional de Dano Físico (se acertou) */}
          {pendingRoll.damageFormula && isHit && (
            <div className="bg-[#1b1510] border border-[#a17036]/60 rounded-xl p-3 text-center space-y-1">
              <label className="text-[11px] font-semibold text-stone-300 block">
                Dano Físico Rolado ({pendingRoll.damageFormula} {pendingRoll.damageType}):
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 8 (ou deixe vazio para calcular na fórmula)"
                value={damageVal}
                onChange={(e) => setDamageVal(e.target.value)}
                className="w-48 text-center text-sm font-bold bg-[#0d0a07] border border-stone-700 rounded-lg py-1 text-rose-400 focus:outline-none focus:border-[#a17036]"
              />
              <p className="text-[10px] text-stone-500">Deixe em branco para o software rolar os dados da fórmula.</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="bronze-btn w-full py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              CONFIRMAR ROLAGEM MANUAL
            </button>

            <button
              type="button"
              onClick={handleAuto}
              className="glass-btn w-full py-2 rounded-xl text-[11px] font-semibold text-stone-400 hover:text-stone-200 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f5ba42]" />
              Rolar Automaticamente pelo Sistema Desta Vez
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
