import React, { useState, useMemo } from 'react';
import { Character, Item, Coins as CoinsType, DiceRollMode, AbilityName } from '../../core/types/dnd';
import {
  CRAFTING_RECIPES,
  UPGRADE_OPTIONS,
  CraftingRecipe,
  UpgradeOption,
  getForgeModifier,
  evaluateForgeRoll,
  ForgeRollResult
} from '../../core/rules/craftingRules';
import { coinsToPo, canAfford, deductCoins } from '../../core/rules/economy';
import { ItemThumbnail } from '../shop/ItemThumbnail';
import {
  Anvil,
  Flame,
  Hammer,
  Sparkles,
  Shield,
  Swords,
  FlaskConical,
  Wrench,
  Dices,
  AlertCircle,
  CheckCircle2,
  Coins,
  Clock,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ForgeViewProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelectCharacterId: (id: string) => void;
  onUpdateCharacter: (char: Character) => void;
  onLogEvent: (msg: string) => void;
  diceMode: DiceRollMode;
}

export const ForgeView: React.FC<ForgeViewProps> = ({
  characters,
  selectedCharacterId,
  onSelectCharacterId,
  onUpdateCharacter,
  onLogEvent,
  diceMode
}) => {
  const [activeTab, setActiveTab] = useState<'crafting' | 'upgrade'>('crafting');
  const [craftingCategory, setCraftingCategory] = useState<'arma' | 'armadura' | 'pocao' | 'geral'>('arma');
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);

  // Upgrade state
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<Item | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeOption | null>(null);

  // Teste de Forja
  const [lastRollResult, setLastRollResult] = useState<ForgeRollResult | null>(null);
  const [manualD20Input, setManualD20Input] = useState<string>('15');

  const activeCharacter = characters.find(c => c.id === selectedCharacterId) || characters[0];
  const charCoins = activeCharacter?.coins || { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 };
  const charPoTotal = coinsToPo(charCoins);

  // Receitas filtradas
  const filteredRecipes = useMemo(() => {
    return CRAFTING_RECIPES.filter(r => r.category === craftingCategory);
  }, [craftingCategory]);

  // Itens válidos para upgrade do inventário do personagem
  const eligibleInventoryItems = useMemo(() => {
    return activeCharacter?.inventory || [];
  }, [activeCharacter]);

  // Opções de upgrade aplicáveis ao item selecionado
  const availableUpgradesForItem = useMemo(() => {
    if (!selectedInventoryItem) return [];
    return UPGRADE_OPTIONS.filter(u => u.applicableTo(selectedInventoryItem));
  }, [selectedInventoryItem]);

  // Executar rolagem de teste
  const performForgeRoll = (ability: AbilityName, dc: number): ForgeRollResult => {
    const modifier = getForgeModifier(activeCharacter, ability);
    let d20 = Math.floor(Math.random() * 20) + 1;
    if (diceMode === 'manual' && manualD20Input) {
      const parsed = parseInt(manualD20Input, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
        d20 = parsed;
      }
    }
    const result = evaluateForgeRoll(d20, modifier, dc);
    setLastRollResult(result);
    return result;
  };

  // Ação de Crafting
  const handleCraftItem = (recipe: CraftingRecipe) => {
    if (!canAfford(charCoins, recipe.materialCostPo)) {
      onLogEvent(`❌ Matérias-primas insuficientes! Para forjar ${recipe.name} são necessárias ${recipe.materialCostPo} PO em materiais, mas ${activeCharacter.name} possui apenas ${charPoTotal.toFixed(2)} PO.`);
      return;
    }

    // Realizar teste de ferramenta
    const roll = performForgeRoll(recipe.associatedAbility, recipe.difficultyDc);

    // Deduzir moedas gastas em materiais
    const updatedCoins = deductCoins(charCoins, recipe.materialCostPo);
    if (!updatedCoins) return;

    // Criar item
    const newItem: Item = {
      id: `crafted_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: recipe.name,
      quantity: 1,
      weight: recipe.targetItem.weight,
      description: `${recipe.targetItem.description} (Forjado artesanalmente por ${activeCharacter.name})`,
      type: recipe.targetItem.category === 'arma' ? 'arma' : (recipe.targetItem.category === 'armadura' || recipe.targetItem.category === 'escudo' ? 'armadura' : (recipe.targetItem.category === 'pocao' ? 'pocao' : 'geral')),
      damage: recipe.targetItem.damage,
      damageType: recipe.targetItem.damageType,
      armorBonus: recipe.targetItem.baseAc,
      armorType: recipe.targetItem.armorType,
      stealthDisadvantage: recipe.targetItem.stealthDisadvantage
    };

    const updatedChar: Character = {
      ...activeCharacter,
      coins: updatedCoins,
      inventory: [...(activeCharacter.inventory || []), newItem]
    };

    onUpdateCharacter(updatedChar);
    onLogEvent(`⚒️ [FORJA] ${activeCharacter.name} forjou '${recipe.name}'! Teste: d20(${roll.d20}) + ${roll.modifier} = ${roll.total} vs CD ${recipe.difficultyDc}.`);
  };

  // Ação de Upgrade
  const handleApplyUpgrade = () => {
    if (!selectedInventoryItem || !selectedUpgrade) return;

    if (!canAfford(charCoins, selectedUpgrade.costPo)) {
      onLogEvent(`❌ Ouro insuficiente para aprimoramento! ${selectedUpgrade.name} custa ${selectedUpgrade.costPo} PO.`);
      return;
    }

    // Realizar teste
    const roll = performForgeRoll(selectedUpgrade.associatedAbility, selectedUpgrade.difficultyDc);

    const updatedCoins = deductCoins(charCoins, selectedUpgrade.costPo);
    if (!updatedCoins) return;

    const upgradedItem = selectedUpgrade.applyUpgrade(selectedInventoryItem);

    // Substituir item no inventário
    const updatedInventory = (activeCharacter.inventory || []).map(i => 
      i.id === selectedInventoryItem.id ? upgradedItem : i
    );

    const updatedChar: Character = {
      ...activeCharacter,
      coins: updatedCoins,
      inventory: updatedInventory
    };

    onUpdateCharacter(updatedChar);
    setSelectedInventoryItem(upgradedItem);
    onLogEvent(`✨ [FORJA] ${activeCharacter.name} aplicou '${selectedUpgrade.name}' em '${selectedInventoryItem.name}'! Novo item: '${upgradedItem.name}'.`);
  };

  return (
    <div className="space-y-6 text-stone-200">
      {/* Cabeçalho da Forja */}
      <div className="relative overflow-hidden rounded-xl border border-orange-950/60 bg-gradient-to-r from-stone-950 via-[#1b120f] to-stone-950 p-6 shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/15 via-red-900/10 to-transparent pointer-events-none" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-600/40 bg-orange-950/40 text-orange-400 shadow-inner">
              <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-wide text-orange-300">
                A Forja Rúnica & Oficina de Criação
              </h2>
              <p className="text-xs text-stone-400">
                Regras oficiais de Crafting de XGtE p. 128 e Revestimentos Especiais (Prata, Adamantina, Mithral)
              </p>
            </div>
          </div>

          {/* Saldo do Artesão e Seletor de Herói */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-orange-950/60 bg-black/50 p-2.5 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Artesão:</span>
            <select
              value={selectedCharacterId}
              onChange={e => onSelectCharacterId(e.target.value)}
              className="rounded border border-stone-800 bg-stone-900 px-2.5 py-1 text-xs font-medium text-amber-200 focus:border-orange-500 focus:outline-none"
            >
              {characters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.class})
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-stone-700/60" />

            <div className="flex items-center gap-2 text-xs">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300">
                {charPoTotal.toFixed(2)} PO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação entre Crafting e Upgrade */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-800 bg-stone-950 p-1.5 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('crafting')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'crafting'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-stone-950 shadow-lg'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Hammer className="h-4 w-4" />
          <span>Criação de Itens (Crafting)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upgrade')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'upgrade'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-stone-950 shadow-lg'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Aprimorar Equipamento</span>
        </button>
      </div>

      {/* ABA 1: CRIAÇÃO DE ITENS (CRAFTING) */}
      {activeTab === 'crafting' && (
        <div className="space-y-4">
          {/* Categorias de Criação */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'arma', label: 'Armas Marciais e Simples', icon: Swords },
              { id: 'armadura', label: 'Armaduras e Escudos', icon: Shield },
              { id: 'pocao', label: 'Alquimia & Poções de Cura', icon: FlaskConical },
              { id: 'geral', label: 'Ferramentas & Equipamento', icon: Wrench }
            ].map(cat => {
              const Icon = cat.icon;
              const isActive = craftingCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCraftingCategory(cat.id as any)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'border border-orange-500/70 bg-orange-950/50 text-orange-200 shadow'
                      : 'border border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Icon className="h-4 w-4 text-orange-400" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grade de Receitas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map(recipe => {
              const canAffordMaterial = canAfford(charCoins, recipe.materialCostPo);
              const isSelected = selectedRecipe?.id === recipe.id;

              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-[#1e1513] shadow-lg shadow-orange-950/40'
                      : 'border-stone-800 bg-stone-950/80 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex gap-3">
                      <ItemThumbnail
                        imageUrl={recipe.targetItem.imageUrl}
                        name={recipe.name}
                        category={recipe.targetItem.category}
                        size="md"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif text-sm font-bold text-stone-200 truncate">
                            {recipe.name}
                          </h4>
                          <span className="rounded bg-stone-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-orange-400 flex-shrink-0">
                            CD {recipe.difficultyDc}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-[11px] text-stone-400">
                          {recipe.description}
                        </p>
                      </div>
                    </div>

                    {/* Requisitos de Materiais e Tempo */}
                    <div className="mt-3 space-y-1.5 border-t border-stone-800/80 pt-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-amber-400" />
                          Matéria-Prima:
                        </span>
                        <span className={`font-mono font-bold ${canAffordMaterial ? 'text-emerald-400' : 'text-red-400'}`}>
                          {recipe.materialCostPo} PO {canAffordMaterial ? '✓' : '(Falta)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          Tempo Estimado:
                        </span>
                        <span className="text-stone-300 font-mono text-[11px]">
                          {recipe.timeDisplay}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5 text-stone-400" />
                          Ferramenta Exigida:
                        </span>
                        <span className="text-stone-300 text-[11px]">
                          {recipe.requiredTool}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ação de Forjar */}
                  <div className="mt-4 pt-2 border-t border-stone-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-stone-500">
                      Valor de Mercado: {recipe.targetItem.costPo} PO
                    </span>

                    <button
                      type="button"
                      disabled={!canAffordMaterial}
                      onClick={e => {
                        e.stopPropagation();
                        handleCraftItem(recipe);
                      }}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        canAffordMaterial
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-stone-950 hover:brightness-110 active:scale-95'
                          : 'cursor-not-allowed bg-stone-800 text-stone-500'
                      }`}
                    >
                      <Hammer className="h-3.5 w-3.5" />
                      <span>{canAffordMaterial ? 'Forjar na Bigorna' : 'Falta Ouro'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: APRIMORAMENTO & CUSTOMIZAÇÃO (UPGRADE) */}
      {activeTab === 'upgrade' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 1. Escolha do Item do Inventário */}
          <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-950/80 p-4">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-950 text-orange-400 text-xs font-bold">1</span>
              <h3 className="font-serif text-sm font-bold text-stone-200">
                Selecione o Item da Ficha
              </h3>
            </div>

            {eligibleInventoryItems.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                O herói não possui armas ou armaduras para aprimorar no momento.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {eligibleInventoryItems.map(item => {
                  const isSelected = selectedInventoryItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedInventoryItem(item);
                        setSelectedUpgrade(null);
                      }}
                      className={`flex w-full items-start justify-between rounded-lg p-2.5 text-left transition ${
                        isSelected
                          ? 'border border-orange-500 bg-orange-950/30 text-orange-200 shadow'
                          : 'border border-stone-800 bg-stone-900/40 text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{item.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {item.type?.toUpperCase()} {item.damage ? `• ⚔️ ${item.damage}` : ''} {item.armorBonus ? `• 🛡️ +${item.armorBonus} CA` : ''}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-600 mt-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Escolha da Melhoria */}
          <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-950/80 p-4">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-950 text-orange-400 text-xs font-bold">2</span>
              <h3 className="font-serif text-sm font-bold text-stone-200">
                Aprimoramentos Disponíveis
              </h3>
            </div>

            {!selectedInventoryItem ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                Selecione um item no painel à esquerda para ver os tratamentos compatíveis.
              </p>
            ) : availableUpgradesForItem.length === 0 ? (
              <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-4 text-center text-xs text-stone-400">
                Nenhum aprimoramento adicional disponível para este item específico.
              </div>
            ) : (
              <div className="space-y-2">
                {availableUpgradesForItem.map(upg => {
                  const afford = canAfford(charCoins, upg.costPo);
                  const isSelected = selectedUpgrade?.id === upg.id;

                  return (
                    <div
                      key={upg.id}
                      onClick={() => setSelectedUpgrade(upg)}
                      className={`cursor-pointer rounded-lg border p-3 transition ${
                        isSelected
                          ? 'border-orange-500 bg-orange-950/30'
                          : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-stone-200">{upg.name}</div>
                        <div className="font-mono text-xs font-bold text-amber-400">+{upg.costPo} PO</div>
                      </div>

                      <p className="mt-1 text-[11px] text-stone-400">{upg.description}</p>
                      
                      <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
                        <span>Fonte: {upg.source}</span>
                        <span className={afford ? 'text-emerald-400' : 'text-red-400'}>
                          {afford ? 'Ouro suficiente' : 'Falta ouro'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Painel de Confirmação & Rolagem */}
          <div className="space-y-4 rounded-xl border border-stone-800 bg-stone-950/80 p-4">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-950 text-orange-400 text-xs font-bold">3</span>
              <h3 className="font-serif text-sm font-bold text-stone-200">
                Forja & Prévia do Item
              </h3>
            </div>

            {selectedInventoryItem && selectedUpgrade ? (
              <div className="space-y-4 text-xs">
                {/* Prévia Antes vs Depois com Miniatura 3:4 */}
                <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-3 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">Transformação do Item:</div>
                  <div className="flex items-center gap-3">
                    <ItemThumbnail
                      imageUrl={selectedInventoryItem.imageUrl}
                      name={selectedInventoryItem.name}
                      category={selectedInventoryItem.type || 'arma'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <span className="text-stone-400 line-through truncate">{selectedInventoryItem.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                      </div>
                      <div className="text-amber-300 font-bold text-xs truncate">
                        {selectedUpgrade.applyUpgrade(selectedInventoryItem).name}
                      </div>
                      <div className="text-[10px] text-orange-400 font-mono mt-0.5">
                        +{selectedUpgrade.costPo} PO
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-400 border-t border-stone-800 pt-1.5">
                    {selectedUpgrade.applyUpgrade(selectedInventoryItem).description}
                  </div>
                </div>

                {/* Painel do Teste de Ferramenta */}
                <div className="rounded-lg border border-orange-900/40 bg-orange-950/20 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-semibold">Teste de Ferramentas:</span>
                    <span className="font-mono text-orange-400 font-bold">CD {selectedUpgrade.difficultyDc}</span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Bônus de {activeCharacter.name}: +{getForgeModifier(activeCharacter, selectedUpgrade.associatedAbility)} ({selectedUpgrade.associatedAbility.toUpperCase()})
                  </div>

                  {diceMode === 'manual' && (
                    <div className="pt-2">
                      <label className="text-[10px] text-stone-400 block mb-1">Resultado do d20 Físico:</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={manualD20Input}
                        onChange={e => setManualD20Input(e.target.value)}
                        className="w-20 rounded border border-stone-700 bg-stone-900 px-2 py-1 text-center font-mono text-amber-200"
                      />
                    </div>
                  )}
                </div>

                {/* Botão de Aplicar Aprimoramento */}
                <button
                  type="button"
                  disabled={!canAfford(charCoins, selectedUpgrade.costPo)}
                  onClick={handleApplyUpgrade}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                    canAfford(charCoins, selectedUpgrade.costPo)
                      ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-stone-950 shadow-lg hover:brightness-110 active:scale-95'
                      : 'cursor-not-allowed bg-stone-800 text-stone-500'
                  }`}
                >
                  <Hammer className="h-4 w-4" />
                  <span>Aplicar Aprimoramento ({selectedUpgrade.costPo} PO)</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">
                Selecione o item e o aprimoramento para visualizar a transformação e realizar a forja.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Resultado da Última Rolagem da Forja */}
      {lastRollResult && (
        <div className={`rounded-xl border p-4 shadow-xl text-xs transition ${
          lastRollResult.isCritSuccess
            ? 'border-yellow-500/60 bg-yellow-950/30 text-yellow-200'
            : lastRollResult.isSuccess
            ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-200'
            : 'border-orange-800/60 bg-orange-950/30 text-orange-200'
        }`}>
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <Dices className="h-4 w-4" />
            <span>Resultado do Teste de Forja: d20({lastRollResult.d20}) + {lastRollResult.modifier} = Total {lastRollResult.total}</span>
          </div>
          <p className="mt-1 text-stone-300">{lastRollResult.outcomeText}</p>
        </div>
      )}
    </div>
  );
};
