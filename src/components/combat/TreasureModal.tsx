import React, { useState } from 'react';
import { Character, Coins } from '../../core/types/dnd';
import { TreasureGenerator, GeneratedTreasure, LootItem } from '../../core/rules/treasureGenerator';
import { Coins as CoinsIcon, Sparkles, Gem, Award, Gift, Check, X, Shield, Users } from 'lucide-react';

interface TreasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  suggestedCr?: number;
  onDistributeCoins: (coinsPerHero: Coins) => void;
  onAddItemToHero?: (charId: string, item: LootItem) => void;
}

export const TreasureModal: React.FC<TreasureModalProps> = ({
  isOpen,
  onClose,
  characters,
  suggestedCr = 2,
  onDistributeCoins
}) => {
  const [cr, setCr] = useState<number>(suggestedCr);
  const [isHoard, setIsHoard] = useState<boolean>(true);
  const [treasure, setTreasure] = useState<GeneratedTreasure | null>(() => {
    return TreasureGenerator.generateLoot(suggestedCr, true);
  });
  const [hasDistributed, setHasDistributed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const generated = TreasureGenerator.generateLoot(cr, isHoard);
    setTreasure(generated);
    setHasDistributed(false);
  };

  const handleDistribute = () => {
    if (!treasure || characters.length === 0) return;

    const numHeroes = characters.length;
    const coinsPerHero: Coins = {
      pc: Math.floor(treasure.coins.pc / numHeroes),
      pp: Math.floor(treasure.coins.pp / numHeroes),
      pe: Math.floor(treasure.coins.pe / numHeroes),
      po: Math.floor(treasure.coins.po / numHeroes),
      pl: Math.floor(treasure.coins.pl / numHeroes)
    };

    onDistributeCoins(coinsPerHero);
    setHasDistributed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1017] border-2 border-[#a17036] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#231b14] flex items-center justify-between bg-gradient-to-r from-[#18130e] via-[#10131d] to-[#18130e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#a17036] bg-[#0c0d12] flex items-center justify-center shadow">
              <CoinsIcon className="w-5 h-5 text-[#f5ba42]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold gold-gradient-text tracking-[0.15em] flex items-center gap-2">
                GERADOR DE TESOUROS & SAQUES (DMG CAP. 7)
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Tabelas oficiais de tesouros do Guia do Mestre para encontros e masmorras
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

        {/* Controles de Geração */}
        <div className="p-4 bg-[#12141f] border-b border-[#231b14] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Nível de Desafio (ND):</span>
              <select
                value={cr}
                onChange={e => setCr(Number(e.target.value))}
                className="bg-[#090b10] border border-[#2b334a] focus:border-[#f5ba42] rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-bold outline-none"
              >
                <option value="1">ND 0 a 4 (Iniciantes)</option>
                <option value="6">ND 5 a 10 (Heróis Estabelecidos)</option>
                <option value="12">ND 11 a 16 (Mestres do Reino)</option>
                <option value="18">ND 17+ (Lendas Arcanas)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Tipo de Saque:</span>
              <div className="flex rounded-lg overflow-hidden border border-[#2b334a]">
                <button
                  onClick={() => setIsHoard(false)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase transition-all ${
                    !isHoard ? 'bg-[#f5ba42] text-stone-950 font-black' : 'bg-[#090b10] text-stone-400'
                  }`}
                >
                  Individual
                </button>
                <button
                  onClick={() => setIsHoard(true)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase transition-all ${
                    isHoard ? 'bg-[#f5ba42] text-stone-950 font-black' : 'bg-[#090b10] text-stone-400'
                  }`}
                >
                  Baú / Acumulado (Hoard)
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="bronze-btn px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-4 h-4" /> Rolar Novo Saque
          </button>
        </div>

        {/* Resultados do Saque */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {treasure && (
            <div className="space-y-4">
              {/* Moedas */}
              <div className="bg-[#121520] border border-[#23293a] rounded-xl p-4 shadow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                  Moedas Encontradas:
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-[#181d2c] border border-[#2b354c] rounded-lg p-2">
                    <span className="text-[10px] text-stone-400 block">Cobre (PC)</span>
                    <span className="font-cinzel text-base font-bold text-amber-600">{treasure.coins.pc}</span>
                  </div>
                  <div className="bg-[#181d2c] border border-[#2b354c] rounded-lg p-2">
                    <span className="text-[10px] text-stone-400 block">Prata (PP)</span>
                    <span className="font-cinzel text-base font-bold text-stone-300">{treasure.coins.pp}</span>
                  </div>
                  <div className="bg-[#181d2c] border border-[#2b354c] rounded-lg p-2">
                    <span className="text-[10px] text-stone-400 block">Electro (PE)</span>
                    <span className="font-cinzel text-base font-bold text-cyan-300">{treasure.coins.pe}</span>
                  </div>
                  <div className="bg-[#241c14] border border-[#a17036] rounded-lg p-2 shadow">
                    <span className="text-[10px] text-amber-300 block font-bold">Ouro (PO)</span>
                    <span className="font-cinzel text-lg font-black text-[#f5ba42]">{treasure.coins.po}</span>
                  </div>
                  <div className="bg-[#181d2c] border border-[#2b354c] rounded-lg p-2">
                    <span className="text-[10px] text-stone-400 block">Platina (PL)</span>
                    <span className="font-cinzel text-base font-bold text-emerald-400">{treasure.coins.pl}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#1e2333]">
                  <span className="text-stone-400">
                    Valor total aproximado: <strong className="text-[#f5ba42]">{treasure.totalValuePo} PO</strong>
                  </span>

                  <button
                    onClick={handleDistribute}
                    disabled={hasDistributed || characters.length === 0}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      hasDistributed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 cursor-default'
                        : 'bronze-btn text-[#f5ba42] shadow'
                    }`}
                  >
                    {hasDistributed ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Moedas Divididas ({characters.length} Heróis)
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5" /> Dividir Moedas com o Grupo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Itens Valiosos, Gemas e Magias */}
              {treasure.items.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Gemas, Obras de Arte & Itens Mágicos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {treasure.items.map(item => (
                      <div
                        key={item.id}
                        className="bg-[#121520] border border-[#23293a] hover:border-[#a17036] rounded-xl p-3 shadow text-xs space-y-1 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-cinzel font-bold text-stone-100 flex items-center gap-1.5">
                            {item.type === 'gema' ? (
                              <Gem className="w-3.5 h-3.5 text-sky-400" />
                            ) : item.type === 'arte' ? (
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Gift className="w-3.5 h-3.5 text-purple-400" />
                            )}
                            {item.name}
                          </span>
                          <span className="text-[10px] font-bold text-[#f5ba42] bg-[#1a1610] px-2 py-0.5 rounded border border-[#a17036]/50">
                            {item.valuePo} PO
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 italic">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
