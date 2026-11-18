import React, { useState } from 'react';
import { AbilityName, AbilityScores } from '../../../core/types/dnd';
import { getAbilityModifier, formatModifier } from '../../../core/rules/calculations';
import { Dices, Sparkles, RefreshCw, AlertCircle, Check } from 'lucide-react';

export type AbilityGenerationMethod = 'standard_array' | 'point_buy' | 'roll_dice';

interface StepAbilitiesProps {
  method: AbilityGenerationMethod;
  onChangeMethod: (method: AbilityGenerationMethod) => void;
  baseAbilities: AbilityScores;
  onChangeBaseAbilities: (abilities: AbilityScores) => void;
  racialBonuses: Partial<Record<AbilityName, number>>;
  finalAbilities: AbilityScores;
}

// Custos oficiais do Point Buy (PHB pág. 13)
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

const STANDARD_ARRAY_VALUES = [15, 14, 13, 12, 10, 8];

const ABILITY_ORDER: AbilityName[] = ['for', 'des', 'con', 'int', 'sab', 'car'];

const ABILITY_LABELS: Record<AbilityName, string> = {
  for: 'Força (FOR)',
  des: 'Destreza (DES)',
  con: 'Constituição (CON)',
  int: 'Inteligência (INT)',
  sab: 'Sabedoria (SAB)',
  car: 'Carisma (CAR)'
};

export const StepAbilities: React.FC<StepAbilitiesProps> = ({
  method,
  onChangeMethod,
  baseAbilities,
  onChangeBaseAbilities,
  racialBonuses,
  finalAbilities
}) => {
  // Estado para rolagem 4d6 drop lowest
  interface DiceRollResult {
    id: number;
    dice: number[]; // 4 dados
    lowestIndex: number;
    total: number;
    assignedTo?: AbilityName;
  }

  const [rolledDice, setRolledDice] = useState<DiceRollResult[]>(() => {
    // Inicialização com rolagens simuladas
    return [
      { id: 1, dice: [6, 5, 4, 2], lowestIndex: 3, total: 15 },
      { id: 2, dice: [5, 5, 4, 1], lowestIndex: 3, total: 14 },
      { id: 3, dice: [5, 4, 4, 3], lowestIndex: 3, total: 13 },
      { id: 4, dice: [4, 4, 4, 2], lowestIndex: 3, total: 12 },
      { id: 5, dice: [4, 3, 3, 1], lowestIndex: 3, total: 10 },
      { id: 6, dice: [3, 3, 2, 1], lowestIndex: 3, total: 8 },
    ];
  });

  // Calcula total gasto no Point Buy
  const totalPointsSpent = Object.values(baseAbilities).reduce((acc, score) => {
    return acc + (POINT_BUY_COSTS[score] ?? 0);
  }, 0);
  const remainingPoints = 27 - totalPointsSpent;

  // Lógica de Compra por Pontos: Incrementar / Decrementar
  const handlePointBuyChange = (ab: AbilityName, delta: number) => {
    const currentScore = baseAbilities[ab];
    const newScore = currentScore + delta;

    if (newScore < 8 || newScore > 15) return;

    const currentCost = POINT_BUY_COSTS[currentScore] ?? 0;
    const newCost = POINT_BUY_COSTS[newScore] ?? 0;
    const costDiff = newCost - currentCost;

    if (delta > 0 && costDiff > remainingPoints) {
      return; // Bloqueia aumento por saldo insuficiente
    }

    onChangeBaseAbilities({
      ...baseAbilities,
      [ab]: newScore
    });
  };

  // Lógica do Standard Array
  const handleStandardArrayChange = (ab: AbilityName, valueStr: string) => {
    const newVal = parseInt(valueStr, 10);
    if (isNaN(newVal)) return;

    // Se outro atributo já tiver esse valor, troca com ele (swap sem repetição)
    const updated = { ...baseAbilities };
    const currentValOfThis = updated[ab];

    for (const otherAb of ABILITY_ORDER) {
      if (otherAb !== ab && updated[otherAb] === newVal) {
        updated[otherAb] = currentValOfThis;
        break;
      }
    }
    updated[ab] = newVal;
    onChangeBaseAbilities(updated);
  };

  // Rolar 4d6 descartando o menor
  const roll4d6DropLowest = () => {
    const newRolls: DiceRollResult[] = [];
    const newAbilities: Partial<AbilityScores> = {};

    for (let i = 0; i < 6; i++) {
      const dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      // Encontra o menor
      let lowestIdx = 0;
      for (let d = 1; d < 4; d++) {
        if (dice[d] < dice[lowestIdx]) {
          lowestIdx = d;
        }
      }
      const sumTop3 = dice.reduce((acc, val, idx) => (idx === lowestIdx ? acc : acc + val), 0);
      newRolls.push({
        id: i + 1,
        dice,
        lowestIndex: lowestIdx,
        total: sumTop3,
        assignedTo: ABILITY_ORDER[i]
      });
      newAbilities[ABILITY_ORDER[i]] = sumTop3;
    }

    setRolledDice(newRolls);
    onChangeBaseAbilities(newAbilities as AbilityScores);
  };

  // Atribuir rolagem para um atributo específico
  const handleAssignRoll = (rollIndex: number, targetAb: AbilityName) => {
    // Encontra qual rolagem estava nesse target
    const currentRollAtTarget = rolledDice.find(r => r.assignedTo === targetAb);
    const selectedRoll = rolledDice[rollIndex];

    const updatedRolls = rolledDice.map((r, idx) => {
      if (idx === rollIndex) {
        return { ...r, assignedTo: targetAb };
      }
      if (r.assignedTo === targetAb) {
        return { ...r, assignedTo: selectedRoll.assignedTo };
      }
      return r;
    });

    setRolledDice(updatedRolls);

    // Atualiza base abilities com as rolagens atribuídas
    const newAbilities: AbilityScores = { ...baseAbilities };
    updatedRolls.forEach(r => {
      if (r.assignedTo) {
        newAbilities[r.assignedTo] = r.total;
      }
    });
    onChangeBaseAbilities(newAbilities);
  };

  return (
    <div className="space-y-6 text-stone-200">
      {/* Título da Seção */}
      <div className="border-b border-[#231b14] pb-3">
        <h3 className="font-cinzel text-lg font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2">
          <Dices className="w-5 h-5 text-[#f5ba42]" />
          3. Determinação de Valores de Atributo (Capítulo 1, pág. 13 do PHB)
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Defina os 6 atributos básicos (Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma) antes de somar os bônus raciais.
        </p>
      </div>

      {/* Seletor dos 3 Métodos Oficiais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            onChangeMethod('standard_array');
            onChangeBaseAbilities({ for: 15, des: 14, con: 13, int: 12, sab: 10, car: 8 });
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            method === 'standard_array'
              ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] text-[#ffd470] shadow-lg shadow-amber-950/40'
              : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
          }`}
        >
          <div className="flex items-center justify-between font-cinzel font-bold text-xs uppercase tracking-wider">
            <span>1. Conjunto Padrão</span>
            {method === 'standard_array' && <Check className="w-4 h-4 text-[#f5ba42]" />}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Distribua obrigatoriamente os valores fixos [15, 14, 13, 12, 10, 8] sem repetição.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeMethod('point_buy');
            onChangeBaseAbilities({ for: 8, des: 8, con: 8, int: 8, sab: 8, car: 8 });
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            method === 'point_buy'
              ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] text-[#ffd470] shadow-lg shadow-amber-950/40'
              : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
          }`}
        >
          <div className="flex items-center justify-between font-cinzel font-bold text-xs uppercase tracking-wider">
            <span>2. Compra por Pontos</span>
            {method === 'point_buy' && <Check className="w-4 h-4 text-[#f5ba42]" />}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Pool de 27 pontos. Inicia em 8 até o máximo de 15 segundo a tabela oficial de custo.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeMethod('roll_dice');
            roll4d6DropLowest();
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            method === 'roll_dice'
              ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] text-[#ffd470] shadow-lg shadow-amber-950/40'
              : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
          }`}
        >
          <div className="flex items-center justify-between font-cinzel font-bold text-xs uppercase tracking-wider">
            <span>3. Rolagem de Dados</span>
            {method === 'roll_dice' && <Check className="w-4 h-4 text-[#f5ba42]" />}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Role 4d6 descartando o menor dado para cada espaço e atribua os resultados aos atributos.
          </p>
        </button>
      </div>

      {/* Conteúdo Dinâmico por Método */}
      <div className="bg-[#0e111a] p-5 rounded-2xl border border-[#231b14] space-y-5">
        {/* MÉTODO 1: STANDARD ARRAY */}
        {method === 'standard_array' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f2638] pb-3">
              <span className="text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider">
                Distribuição do Conjunto Padrão [15, 14, 13, 12, 10, 8]
              </span>
              <span className="text-[11px] text-stone-400">
                Selecione o valor desejado para cada atributo (sem repetição)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ABILITY_ORDER.map(ab => {
                const currentVal = baseAbilities[ab];
                const racialBonus = racialBonuses[ab] || 0;
                const finalVal = finalAbilities[ab];
                const mod = getAbilityModifier(finalVal);

                return (
                  <div key={ab} className="bg-[#141824] p-3.5 rounded-xl border border-[#262f44] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-200">{ABILITY_LABELS[ab]}</span>
                      <span className="text-amber-400 font-cinzel font-bold text-xs">
                        Total: {finalVal} ({formatModifier(mod)})
                      </span>
                    </div>

                    <select
                      value={currentVal}
                      onChange={(e) => handleStandardArrayChange(ab, e.target.value)}
                      className="w-full bg-[#0d101a] border border-[#2b354f] focus:border-[#f5ba42] rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-bold outline-none"
                    >
                      {STANDARD_ARRAY_VALUES.map(val => (
                        <option key={val} value={val}>
                          Valor Base: {val} {val === currentVal ? '(Atual)' : ''}
                        </option>
                      ))}
                    </select>

                    <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1">
                      <span>Base: <strong className="text-stone-300">{currentVal}</strong></span>
                      {racialBonus > 0 && <span className="text-emerald-400">+{racialBonus} Racial</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MÉTODO 2: COMPRA POR PONTOS (POINT BUY) */}
        {method === 'point_buy' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2638] pb-3">
              <div>
                <span className="text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider block">
                  Compra por Pontos (Point Buy Oficial)
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Custo: 8 (0) • 9 (1) • 10 (2) • 11 (3) • 12 (4) • 13 (5) • 14 (7) • 15 (9). Máximo 15 antes dos bônus.
                </p>
              </div>

              <div className="bg-[#141824] px-4 py-2 rounded-xl border border-[#2b354f] flex items-center gap-3">
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Pontos Restantes:</span>
                <strong className={`font-cinzel text-base ${remainingPoints === 0 ? 'text-emerald-400' : remainingPoints < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {remainingPoints} / 27
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ABILITY_ORDER.map(ab => {
                const currentScore = baseAbilities[ab];
                const currentCost = POINT_BUY_COSTS[currentScore] ?? 0;
                const nextCost = currentScore < 15 ? (POINT_BUY_COSTS[currentScore + 1] ?? 9) : currentCost;
                const stepCost = nextCost - currentCost;
                const canIncrease = currentScore < 15 && remainingPoints >= stepCost;
                const canDecrease = currentScore > 8;

                const racialBonus = racialBonuses[ab] || 0;
                const finalVal = finalAbilities[ab];
                const mod = getAbilityModifier(finalVal);

                return (
                  <div key={ab} className="bg-[#141824] p-3.5 rounded-xl border border-[#262f44] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-200">{ABILITY_LABELS[ab]}</span>
                      <span className="text-[10px] text-stone-400">Custo: {currentCost} pts</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-[#0d101a] p-2 rounded-xl border border-[#2b354f]">
                      <button
                        type="button"
                        disabled={!canDecrease}
                        onClick={() => handlePointBuyChange(ab, -1)}
                        className="w-8 h-8 rounded-lg bg-[#1a2030] border border-[#3b476b] text-stone-200 font-bold text-base hover:bg-[#252f47] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        -
                      </button>

                      <div className="text-center">
                        <span className="font-cinzel text-base font-black text-stone-100 block">{currentScore}</span>
                        <span className="text-[10px] text-stone-400">Base</span>
                      </div>

                      <button
                        type="button"
                        disabled={!canIncrease}
                        onClick={() => handlePointBuyChange(ab, 1)}
                        className="w-8 h-8 rounded-lg bg-[#2a2016] border border-[#a17036] text-[#ffd470] font-bold text-base hover:bg-[#382b1d] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1">
                      <span>
                        Final: <strong className="text-[#f5ba42] font-cinzel font-bold">{finalVal}</strong> ({formatModifier(mod)})
                      </span>
                      {racialBonus > 0 && <span className="text-emerald-400 font-semibold">+{racialBonus} Racial</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MÉTODO 3: ROLAGEM DE DADOS (4D6 DROP LOWEST) */}
        {method === 'roll_dice' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2638] pb-3">
              <div>
                <span className="text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider block">
                  Rolagem 4d6 (Menor Dado Descartado Automaticamente)
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Os 4 dados rolados são exibidos abaixo. O menor dado é riscado e os 3 maiores são somados.
                </p>
              </div>

              <button
                type="button"
                onClick={roll4d6DropLowest}
                className="bronze-btn px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Rolar Todos Novamente
              </button>
            </div>

            {/* Visualização dos 6 Resultados de Dados e Atribuição */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {rolledDice.map((roll, idx) => {
                const assignedAb = roll.assignedTo || ABILITY_ORDER[idx];
                const racialBonus = racialBonuses[assignedAb] || 0;
                const finalVal = roll.total + racialBonus;
                const mod = getAbilityModifier(finalVal);

                return (
                  <div key={roll.id} className="bg-[#141824] p-3.5 rounded-xl border border-[#262f44] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-semibold">Rolagem #{idx + 1}</span>
                      <strong className="text-amber-400 font-cinzel text-base font-black">
                        Total: {roll.total}
                      </strong>
                    </div>

                    {/* 4 Dados Individuais */}
                    <div className="flex items-center justify-center gap-2 bg-[#0d101a] p-2 rounded-xl border border-[#2b354f]">
                      {roll.dice.map((d, dIdx) => {
                        const isDropped = dIdx === roll.lowestIndex;
                        return (
                          <div
                            key={dIdx}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                              isDropped
                                ? 'bg-[#181a24] border-[#373c4f] text-stone-500 line-through opacity-50'
                                : 'bg-[#251e16] border-[#a17036] text-[#ffd470] shadow-sm'
                            }`}
                            title={isDropped ? 'Menor dado (descartado)' : 'Dado mantido'}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>

                    {/* Seletor de Atribuição */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                        Atribuir ao Atributo:
                      </label>
                      <select
                        value={assignedAb}
                        onChange={(e) => handleAssignRoll(idx, e.target.value as AbilityName)}
                        className="w-full bg-[#0d101a] border border-[#2b354f] focus:border-[#f5ba42] rounded-lg px-2.5 py-1 text-xs text-stone-100 font-bold outline-none"
                      >
                        {ABILITY_ORDER.map(ab => (
                          <option key={ab} value={ab}>
                            {ABILITY_LABELS[ab]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1">
                      <span>Total c/ Raça: <strong className="text-[#f5ba42]">{finalVal}</strong> ({formatModifier(mod)})</span>
                      {racialBonus > 0 && <span className="text-emerald-400">+{racialBonus}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
