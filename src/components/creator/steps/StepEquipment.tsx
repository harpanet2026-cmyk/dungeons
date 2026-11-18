import React, { useState } from 'react';
import { Item, Character } from '../../../core/types/dnd';
import { PHB_CLASSES, PHB_BACKGROUNDS } from '../../../core/rules/characterCreationData';
import { COMMON_ARMORS, COMMON_WEAPONS } from '../../../core/rules/srdData';
import { Shield, Sword, Package, Coins, Dices, Check, ShoppingBag, Plus, Trash2 } from 'lucide-react';

export type EquipmentMode = 'package' | 'wealth';

interface StepEquipmentProps {
  mode: EquipmentMode;
  onChangeMode: (mode: EquipmentMode) => void;
  
  selectedClass: string;
  selectedBackground: string;
  
  // Escolhas de ramos da classe (Opção A)
  selectedBranchChoices: Record<string, number>; // groupId -> optionIndex
  onChangeBranchChoice: (groupId: string, optionIndex: number) => void;
  
  // Riqueza (Opção B)
  startingGoldRolled: number;
  onRollWealth: (gold: number) => void;
  
  // Itens finais no inventário
  inventory: Item[];
  onUpdateInventory: (items: Item[]) => void;
  
  // Itens equipados
  equippedArmorId: string;
  onChangeEquippedArmor: (armorId: string) => void;
  isShieldEquipped: boolean;
  onToggleShield: (equipped: boolean) => void;
  equippedWeaponIds: string[];
  onToggleEquippedWeapon: (weaponId: string) => void;
  
  // Moedas
  coins: { pc: number; pp: number; pe: number; po: number; pl: number };
  onChangeCoins: (coins: { pc: number; pp: number; pe: number; po: number; pl: number }) => void;
}

export const StepEquipment: React.FC<StepEquipmentProps> = ({
  mode,
  onChangeMode,
  selectedClass,
  selectedBackground,
  selectedBranchChoices,
  onChangeBranchChoice,
  startingGoldRolled,
  onRollWealth,
  inventory,
  onUpdateInventory,
  equippedArmorId,
  onChangeEquippedArmor,
  isShieldEquipped,
  onToggleShield,
  equippedWeaponIds,
  onToggleEquippedWeapon,
  coins,
  onChangeCoins
}) => {
  const currentClass = PHB_CLASSES[selectedClass] || PHB_CLASSES['Guerreiro'];
  const currentBg = PHB_BACKGROUNDS[selectedBackground] || PHB_BACKGROUNDS['Soldado'];

  const [lastDiceRoll, setLastDiceRoll] = useState<number[]>([]);

  // Rolar ouro da classe
  const handleRollClassGold = () => {
    const diceDef = currentClass.startingWealthDice;
    const rolls: number[] = [];
    let sum = 0;
    for (let i = 0; i < diceDef.count; i++) {
      const r = Math.floor(Math.random() * diceDef.sides) + 1;
      rolls.push(r);
      sum += r;
    }
    const totalGold = sum * diceDef.multiplier;
    setLastDiceRoll(rolls);
    onRollWealth(totalGold);
    onChangeCoins({ pc: 0, pp: 0, pe: 0, po: totalGold, pl: 0 });
  };

  // Armaduras e armas disponíveis no inventário
  const armorInInventory = inventory.filter(item => item.type === 'armadura' && item.armorType !== 'escudo');
  const hasShieldInInventory = inventory.some(item => item.id === 'eq_escudo' || item.id === 'eq_escudo_madeira' || item.name.toLowerCase().includes('escudo'));
  const weaponsInInventory = inventory.filter(item => item.type === 'arma');

  // Adicionar item manual (loja em caso de Riqueza Inicial)
  const handleBuyItem = (itemTemplate: Item, costPo: number) => {
    if (coins.po < costPo) {
      alert(`Ouro insuficiente! Necessário: ${costPo} PO, disponível: ${coins.po} PO.`);
      return;
    }
    onChangeCoins({ ...coins, po: coins.po - costPo });
    const newItem: Item = {
      ...itemTemplate,
      id: `bought_${Date.now()}_${itemTemplate.id}`
    };
    onUpdateInventory([...inventory, newItem]);
  };

  return (
    <div className="space-y-6 text-stone-200">
      {/* Título da Seção */}
      <div className="border-b border-[#231b14] pb-3">
        <h3 className="font-cinzel text-lg font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2">
          <Package className="w-5 h-5 text-[#f5ba42]" />
          5. Equipamento Inicial vs. Riqueza Inicial (Capítulo 5 do PHB)
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Escolha entre receber o pacote oficial ramificado de equipamentos concedido por sua classe e antecedente, ou rolar riqueza inicial em ouro para compras livres.
        </p>
      </div>

      {/* Seletor de Modo: Opção A vs Opção B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChangeMode('package')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            mode === 'package'
              ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] text-[#ffd470] shadow-lg shadow-amber-950/40'
              : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
          }`}
        >
          <div className="flex items-center justify-between font-cinzel font-bold text-xs uppercase tracking-wider">
            <span>Opção A: Pacote da Classe + Antecedente</span>
            {mode === 'package' && <Check className="w-4 h-4 text-[#f5ba42]" />}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Recomendado pelo PHB. Escolhas ramificadas de armas e armaduras da classe, mochilas de aventura e itens + moedas do antecedente.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeMode('wealth');
            if (startingGoldRolled === 0) handleRollClassGold();
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            mode === 'wealth'
              ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] text-[#ffd470] shadow-lg shadow-amber-950/40'
              : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
          }`}
        >
          <div className="flex items-center justify-between font-cinzel font-bold text-xs uppercase tracking-wider">
            <span>Opção B: Riqueza Inicial por Classe ({currentClass.startingWealthFormula})</span>
            {mode === 'wealth' && <Check className="w-4 h-4 text-[#f5ba42]" />}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Role os dados de ouro da classe e compre manualmente seus itens em uma loja inicial de aventureiro.
          </p>
        </button>
      </div>

      {/* Conteúdo Dinâmico por Modo */}
      <div className="bg-[#0e111a] p-5 rounded-2xl border border-[#231b14] space-y-5">
        {/* OPÇÃO A: ESCOLHAS RAMIFICADAS DA CLASSE */}
        {mode === 'package' && (
          <div className="space-y-4">
            <div className="border-b border-[#1f2638] pb-3">
              <span className="text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider block">
                Escolhas de Equipamento da Classe {currentClass.name}:
              </span>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Escolha uma opção para cada categoria de equipamento inicial.
              </p>
            </div>

            <div className="space-y-4">
              {currentClass.startingEquipmentChoices.map(group => {
                const selectedIdx = selectedBranchChoices[group.id] ?? 0;

                return (
                  <div key={group.id} className="bg-[#141824] p-3.5 rounded-xl border border-[#2b334a] space-y-2">
                    <span className="font-cinzel text-xs font-bold text-stone-200 uppercase tracking-wider block">
                      {group.title}:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {group.options.map((opt, optIdx) => {
                        const isSelected = selectedIdx === optIdx;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => onChangeBranchChoice(group.id, optIdx)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] font-semibold shadow-inner'
                                : 'bg-[#0f131d] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Itens Fixos e Dinheiro do Antecedente */}
            <div className="bg-[#141824] p-3.5 rounded-xl border border-[#262f44] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider">
                  Equipamento & Ouro do Antecedente ({currentBg.name}):
                </span>
                <span className="text-amber-400 font-bold text-xs">
                  +{currentBg.startingGold} PO Iniciais
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {currentBg.fixedEquipment.map(item => (
                  <span key={item.id} className="bg-[#0d101a] px-2.5 py-1 rounded-lg border border-[#262f44] text-stone-300">
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OPÇÃO B: ROLAGEM DE OURO E LOJA */}
        {mode === 'wealth' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2638] pb-3">
              <div>
                <span className="text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider block">
                  Rolagem de Riqueza Inicial da Classe: {currentClass.startingWealthFormula}
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Rola {currentClass.startingWealthDice.count}d{currentClass.startingWealthDice.sides} × {currentClass.startingWealthDice.multiplier} PO.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[#141824] px-3.5 py-1.5 rounded-xl border border-[#262f44] text-center">
                  <span className="text-[10px] text-stone-400 block font-semibold">Ouro Disponível</span>
                  <strong className="text-amber-400 font-cinzel text-base font-black">{coins.po} PO</strong>
                </div>

                <button
                  type="button"
                  onClick={handleRollClassGold}
                  className="bronze-btn px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  <Dices className="w-3.5 h-3.5" /> Rolar Ouro
                </button>
              </div>
            </div>

            {lastDiceRoll.length > 0 && (
              <div className="bg-[#141824] p-3 rounded-xl border border-[#262f44] flex items-center gap-2 text-xs">
                <span className="text-stone-400">Dados rolados:</span>
                <div className="flex gap-1">
                  {lastDiceRoll.map((r, i) => (
                    <span key={i} className="w-6 h-6 rounded bg-[#231b14] border border-[#a17036] text-[#f5ba42] font-bold flex items-center justify-center">
                      {r}
                    </span>
                  ))}
                </div>
                <span className="text-stone-300 ml-2">
                  = soma ({lastDiceRoll.reduce((a, b) => a + b, 0)}) × {currentClass.startingWealthDice.multiplier} = <strong className="text-amber-400">{startingGoldRolled} PO</strong>
                </span>
              </div>
            )}

            {/* Loja Rápida de Armaduras e Armas */}
            <div className="space-y-3 pt-2">
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#f5ba42]" /> Loja de Itens Básicos do PHB:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Armaduras */}
                <div className="bg-[#141824] p-3.5 rounded-xl border border-[#262f44] space-y-2">
                  <span className="font-bold text-stone-300 uppercase text-[11px] block">Armaduras Comuns:</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {[
                      { item: COMMON_ARMORS[0], cost: 10 },  // Couro (10 PO)
                      { item: COMMON_ARMORS[1], cost: 45 },  // Couro Batido (45 PO)
                      { item: COMMON_ARMORS[2], cost: 50 },  // Cota de Malha Média (50 PO)
                      { item: COMMON_ARMORS[3], cost: 400 }, // Peitoral (400 PO)
                      { item: COMMON_ARMORS[4], cost: 200 }, // Cota de Talas (200 PO)
                      { item: COMMON_ARMORS[6], cost: 10 }   // Escudo (10 PO)
                    ].map(({ item, cost }) => (
                      <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-[#0d101a] border border-[#232b3d]">
                        <div>
                          <span className="font-semibold block">{item.name}</span>
                          <span className="text-[10px] text-stone-400">CA {item.armorBonus} • {cost} PO</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBuyItem(item, cost)}
                          className="px-2.5 py-1 rounded bg-[#231b14] hover:bg-[#34271c] border border-[#a17036] text-[#ffd470] font-bold text-[10px]"
                        >
                          Comprar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Armas */}
                <div className="bg-[#141824] p-3.5 rounded-xl border border-[#262f44] space-y-2">
                  <span className="font-bold text-stone-300 uppercase text-[11px] block">Armas Comuns:</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {[
                      { item: COMMON_WEAPONS[0], cost: 15 }, // Espada Longa (15 PO)
                      { item: COMMON_WEAPONS[1], cost: 10 }, // Espada Curta (10 PO)
                      { item: COMMON_WEAPONS[2], cost: 2 },  // Adaga (2 PO)
                      { item: COMMON_WEAPONS[3], cost: 10 }, // Machado de Batalha (10 PO)
                      { item: COMMON_WEAPONS[4], cost: 25 }, // Arco Curto (25 PO)
                      { item: COMMON_WEAPONS[5], cost: 50 }  // Arco Longo (50 PO)
                    ].map(({ item, cost }) => (
                      <div key={item.id} className="flex items-center justify-between p-1.5 rounded-lg bg-[#0d101a] border border-[#232b3d]">
                        <div>
                          <span className="font-semibold block">{item.name}</span>
                          <span className="text-[10px] text-stone-400">{item.damage} • {cost} PO</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBuyItem(item, cost)}
                          className="px-2.5 py-1 rounded bg-[#231b14] hover:bg-[#34271c] border border-[#a17036] text-[#ffd470] font-bold text-[10px]"
                        >
                          Comprar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EQUIPAMENTO DE COMBATE: O QUE ESTÁ VESTIDO / EMPUNHADO */}
        <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-3">
          <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
            Equipamentos de Combate Ativos:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Armadura Equipada */}
            <div>
              <label className="block text-stone-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Armadura Equipada:
              </label>
              <select
                value={equippedArmorId}
                onChange={(e) => onChangeEquippedArmor(e.target.value)}
                className="w-full bg-[#0d101a] border border-[#2b354f] focus:border-[#f5ba42] rounded-xl px-2.5 py-2 text-stone-100 text-xs outline-none"
              >
                <option value="nenhuma">Nenhuma (Defesa sem Armadura / 10 + Des)</option>
                {COMMON_ARMORS.filter(a => a.armorType !== 'escudo').map(arm => (
                  <option key={arm.id} value={arm.id}>
                    {arm.name} (Base CA {arm.armorBonus}, {arm.armorType})
                  </option>
                ))}
              </select>
            </div>

            {/* Escudo Equipado */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="shieldCheckbox"
                checked={isShieldEquipped}
                onChange={(e) => onToggleShield(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0d101a] border-[#2b354f] text-[#f5ba42] cursor-pointer accent-[#a17036]"
              />
              <label htmlFor="shieldCheckbox" className="text-stone-300 font-semibold cursor-pointer text-xs">
                Empunhar Escudo (+2 na CA)
              </label>
            </div>

            {/* Armas Equipadas */}
            <div>
              <label className="block text-stone-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Arma Primária Equipada:
              </label>
              <select
                value={equippedWeaponIds[0] || ''}
                onChange={(e) => onToggleEquippedWeapon(e.target.value)}
                className="w-full bg-[#0d101a] border border-[#2b354f] focus:border-[#f5ba42] rounded-xl px-2.5 py-2 text-stone-100 text-xs outline-none"
              >
                {COMMON_WEAPONS.map(wpn => (
                  <option key={wpn.id} value={wpn.id}>
                    {wpn.name} ({wpn.damage})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
