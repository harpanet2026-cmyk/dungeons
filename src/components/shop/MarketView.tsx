import React, { useState, useMemo } from 'react';
import { Character, Coins as CoinsType, Item } from '../../core/types/dnd';
import { CatalogItem, EQUIPMENT_CATALOG, SettlementType, ShopType } from '../../core/data/equipmentCatalog';
import { coinsToPo, canAfford, deductCoins, addCoins, calculateSellPrice, filterCatalogBySettlement, PartyChest } from '../../core/rules/economy';
import {
  Coins,
  Store,
  Shield,
  Swords,
  FlaskConical,
  Package,
  Sparkles,
  Search,
  Scale,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Info,
  User,
  ShoppingBag,
  Percent
} from 'lucide-react';

interface MarketViewProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelectCharacterId: (id: string) => void;
  partyChest: PartyChest;
  onUpdatePartyChest: (chest: PartyChest) => void;
  onUpdateCharacter: (char: Character) => void;
  onLogEvent: (msg: string) => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  characters,
  selectedCharacterId,
  onSelectCharacterId,
  partyChest,
  onUpdatePartyChest,
  onUpdateCharacter,
  onLogEvent
}) => {
  // Estado da Loja
  const [activeShop, setActiveShop] = useState<ShopType>('ferreiro');
  const [mode, setMode] = useState<'comprar' | 'vender'>('comprar');
  const [settlement, setSettlement] = useState<SettlementType>('cidade');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sellMultiplier, setSellMultiplier] = useState<number>(0.5); // Padrão 50% PHB p. 144
  const [targetBuyer, setTargetBuyer] = useState<'character' | 'chest'>('character');

  // Item selecionado para inspeção / comparação
  const [inspectedItem, setInspectedItem] = useState<CatalogItem | null>(null);

  // Personagem selecionado
  const activeCharacter = characters.find(c => c.id === selectedCharacterId) || characters[0];

  // Carteira do comprador ativo
  const currentCoins: CoinsType = targetBuyer === 'character' 
    ? (activeCharacter?.coins || { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 })
    : partyChest.coins;

  const currentPoTotal = coinsToPo(currentCoins);

  // Filtragem de catálogo
  const filteredCatalog = useMemo(() => {
    let items = filterCatalogBySettlement(EQUIPMENT_CATALOG, settlement);
    items = items.filter(i => i.shopType === activeShop);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.damage && i.damage.toLowerCase().includes(q))
      );
    }

    return items;
  }, [settlement, activeShop, searchQuery]);

  // Itens para venda (inventário do personagem ou baú)
  const sellableItems: Item[] = useMemo(() => {
    if (targetBuyer === 'character') {
      return activeCharacter?.inventory || [];
    }
    return partyChest.items || [];
  }, [targetBuyer, activeCharacter, partyChest]);

  // Ação de Compra
  const handleBuyItem = (item: CatalogItem) => {
    if (!canAfford(currentCoins, item.costPo)) {
      onLogEvent(`❌ Saldo insuficiente! ${item.name} custa ${item.costPo} PO, mas você possui apenas ${currentPoTotal.toFixed(2)} PO.`);
      return;
    }

    const updatedCoins = deductCoins(currentCoins, item.costPo);
    if (!updatedCoins) return;

    // Criar novo Item para o inventário
    const newItem: Item = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      quantity: 1,
      weight: item.weight,
      description: `${item.description} (Fonte: ${item.source})`,
      type: item.category === 'arma' ? 'arma' : (item.category === 'armadura' || item.category === 'escudo' ? 'armadura' : (item.category === 'pocao' ? 'pocao' : 'geral')),
      damage: item.damage,
      damageType: item.damageType,
      armorBonus: item.baseAc,
      armorType: item.armorType,
      stealthDisadvantage: item.stealthDisadvantage
    };

    if (targetBuyer === 'character' && activeCharacter) {
      const updatedChar: Character = {
        ...activeCharacter,
        coins: updatedCoins,
        inventory: [...(activeCharacter.inventory || []), newItem]
      };
      onUpdateCharacter(updatedChar);
      onLogEvent(`🛒 [MERCADO] ${activeCharacter.name} comprou '${item.name}' por ${item.costPo} PO!`);
    } else {
      onUpdatePartyChest({
        coins: updatedCoins,
        items: [...partyChest.items, newItem]
      });
      onLogEvent(`🛒 [MERCADO] Baú do Grupo comprou '${item.name}' por ${item.costPo} PO!`);
    }
  };

  // Ação de Venda
  const handleSellItem = (item: Item) => {
    const sellPrice = calculateSellPrice(item, sellMultiplier);
    const updatedCoins = addCoins(currentCoins, sellPrice);

    if (targetBuyer === 'character' && activeCharacter) {
      const updatedInventory = (activeCharacter.inventory || []).filter(i => i.id !== item.id);
      const updatedChar: Character = {
        ...activeCharacter,
        coins: updatedCoins,
        inventory: updatedInventory
      };
      onUpdateCharacter(updatedChar);
      onLogEvent(`💰 [MERCADO] ${activeCharacter.name} vendeu '${item.name}' por ${sellPrice} PO!`);
    } else {
      const updatedItems = partyChest.items.filter(i => i.id !== item.id);
      onUpdatePartyChest({
        coins: updatedCoins,
        items: updatedItems
      });
      onLogEvent(`💰 [MERCADO] Baú do Grupo vendeu '${item.name}' por ${sellPrice} PO!`);
    }
  };

  // Comparação Rápida com o Equipado do Personagem Ativo
  const equippedArmor = activeCharacter?.equippedArmor;
  const equippedWeapon = activeCharacter?.weapons?.[0];

  return (
    <div className="space-y-6 text-stone-200">
      {/* Cabeçalho do Mercado */}
      <div className="relative overflow-hidden rounded-xl border border-amber-900/40 bg-gradient-to-r from-stone-950 via-[#15131b] to-stone-950 p-6 shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-600/40 bg-amber-950/30 text-amber-400 shadow-inner">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-wide text-amber-300">
                Mercado & Empório das Terras Antigas
              </h2>
              <p className="text-xs text-stone-400">
                Itens oficiais de D&D 5e (Livro do Jogador & Guia de Xanathar) com economia adaptável
              </p>
            </div>
          </div>

          {/* Seletor de Cliente & Saldo Atual */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-900/40 bg-black/40 p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Comprador:</span>
              <button
                type="button"
                onClick={() => setTargetBuyer('character')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                  targetBuyer === 'character'
                    ? 'border border-amber-600/50 bg-amber-900/40 text-amber-200 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>{activeCharacter ? activeCharacter.name.split(' ')[0] : 'Herói'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetBuyer('chest')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                  targetBuyer === 'chest'
                    ? 'border border-amber-600/50 bg-amber-900/40 text-amber-200 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Baú do Grupo</span>
              </button>
            </div>

            <div className="h-4 w-px bg-stone-700/60" />

            {/* Moedas detalhadas */}
            <div className="flex items-center gap-2 text-xs">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300">
                {currentPoTotal.toFixed(2)} PO
              </span>
              <span className="text-[10px] text-stone-400">
                ({currentCoins.pl} PL / {currentCoins.po} PO / {currentCoins.pp} PP / {currentCoins.pc} PC)
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Seleção de Personagem (quando em modo personagem) */}
        {targetBuyer === 'character' && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-800/80 pt-3">
            <span className="text-xs text-stone-400">Trocar Herói:</span>
            {characters.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCharacterId(c.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  c.id === selectedCharacterId
                    ? 'border-amber-500 bg-amber-950/60 text-amber-200 font-semibold'
                    : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span>{c.name}</span>
                <span className="text-[10px] text-amber-400/80">({coinsToPo(c.coins || { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 })} PO)</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles Principais: Abas de Mercadores + Modo Compra/Venda + Assentamento */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Painel Esquerdo: Seletor de Mercador e Modo */}
        <div className="space-y-4">
          {/* Alternador Compra / Venda */}
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-stone-800 bg-stone-950 p-1">
            <button
              type="button"
              onClick={() => setMode('comprar')}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold uppercase tracking-wider transition ${
                mode === 'comprar'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Comprar</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('vender')}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold uppercase tracking-wider transition ${
                mode === 'vender'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Vender</span>
            </button>
          </div>

          {/* Categorias de Mercadores */}
          {mode === 'comprar' && (
            <div className="space-y-2 rounded-xl border border-stone-800 bg-stone-950/80 p-3">
              <h3 className="px-2 font-serif text-xs font-bold uppercase tracking-wider text-amber-400/80">
                Guildas de Mercadores
              </h3>

              <div className="space-y-1">
                {[
                  { id: 'ferreiro', label: 'Ferraria & Armas', icon: Swords, desc: 'Lâminas, Armaduras e Escudos' },
                  { id: 'alquimista', label: 'Boticário & Alquimia', icon: FlaskConical, desc: 'Poções de Cura, Óleos e Venenos' },
                  { id: 'emporio', label: 'Empório Geral', icon: Package, desc: 'Mochilas, Cordas, Tochas e Kits' },
                  { id: 'arcano', label: 'Mercado Arcano', icon: Sparkles, desc: 'Focos, Grimórios e Itens Mágicos' }
                ].map(shop => {
                  const Icon = shop.icon;
                  const isActive = activeShop === shop.id;
                  return (
                    <button
                      key={shop.id}
                      type="button"
                      onClick={() => setActiveShop(shop.id as ShopType)}
                      className={`flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition ${
                        isActive
                          ? 'border border-amber-600/50 bg-amber-950/30 text-amber-200 shadow'
                          : 'border border-transparent text-stone-400 hover:bg-stone-900/60 hover:text-stone-200'
                      }`}
                    >
                      <div className={`mt-0.5 rounded p-1.5 ${isActive ? 'bg-amber-600/20 text-amber-400' : 'bg-stone-900 text-stone-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold">{shop.label}</div>
                        <div className="text-[10px] text-stone-500">{shop.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtro de Porte do Assentamento */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-3">
            <div className="flex items-center gap-2 px-1 pb-2">
              <Building2 className="h-4 w-4 text-amber-400" />
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-400/80">
                Porte do Assentamento
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'vilarejo', label: 'Vilarejo', desc: 'Até 50 PO' },
                { id: 'cidade', label: 'Cidade', desc: 'Até 1k PO' },
                { id: 'metropole', label: 'Metrópole', desc: 'Livre' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSettlement(s.id as SettlementType)}
                  className={`rounded-md p-1.5 text-center text-xs transition ${
                    settlement === s.id
                      ? 'border border-amber-500/60 bg-amber-900/40 text-amber-200 font-semibold'
                      : 'border border-stone-800 bg-stone-900/40 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-[11px]">{s.label}</div>
                  <div className="text-[9px] text-stone-500">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Multiplicador de Venda (Modo Venda) */}
          {mode === 'vender' && (
            <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-amber-400" />
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-400/80">
                  Taxa de Recompra (PHB)
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: 0.25, label: '25% (Rígido)' },
                  { value: 0.5, label: '50% (Oficial)' },
                  { value: 0.75, label: '75% (Favorável)' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSellMultiplier(opt.value)}
                    className={`rounded p-1.5 text-center text-xs transition ${
                      sellMultiplier === opt.value
                        ? 'border border-amber-500/60 bg-amber-900/40 text-amber-200 font-semibold'
                        : 'border border-stone-800 bg-stone-900/40 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-500">
                Pelo Livro do Jogador p. 144, comerciantes pagam 50% pelo equipamento de aventureiros.
              </p>
            </div>
          )}

          {/* Comparador Rápido de Equipamento */}
          {inspectedItem && (
            <div className="rounded-xl border border-amber-800/40 bg-stone-950 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Comparação de Equipamento
                </span>
                <span className="rounded bg-stone-900 px-1.5 py-0.5 text-[9px] text-stone-400">
                  {inspectedItem.source}
                </span>
              </div>

              {/* Se for armadura */}
              {inspectedItem.category === 'armadura' || inspectedItem.category === 'escudo' ? (
                <div className="space-y-2 text-xs">
                  <div className="rounded bg-stone-900/60 p-2">
                    <div className="text-[10px] uppercase text-stone-400">Item Selecionado</div>
                    <div className="font-semibold text-amber-200">{inspectedItem.name}</div>
                    <div className="text-stone-300">
                      CA Base: <strong className="text-amber-400">{inspectedItem.baseAc}</strong>{' '}
                      {inspectedItem.dexBonus ? '+ Des' : ''}
                      {inspectedItem.maxDexBonus ? ` (máx +${inspectedItem.maxDexBonus})` : ''}
                    </div>
                    {inspectedItem.stealthDisadvantage && (
                      <div className="text-[10px] text-red-400">⚠️ Desvantagem em Furtividade</div>
                    )}
                  </div>

                  <div className="rounded border border-stone-800 bg-stone-900/30 p-2">
                    <div className="text-[10px] uppercase text-stone-400">Atualmente Equipado por {activeCharacter?.name.split(' ')[0]}</div>
                    <div className="font-semibold text-stone-300">
                      {equippedArmor ? equippedArmor.name : 'Nenhuma Armadura'}
                    </div>
                    <div className="text-stone-400">
                      CA Base: {equippedArmor?.armorBonus || 10}
                    </div>
                  </div>
                </div>
              ) : inspectedItem.category === 'arma' ? (
                <div className="space-y-2 text-xs">
                  <div className="rounded bg-stone-900/60 p-2">
                    <div className="text-[10px] uppercase text-stone-400">Item Selecionado</div>
                    <div className="font-semibold text-amber-200">{inspectedItem.name}</div>
                    <div className="text-stone-300">
                      Dano: <strong className="text-amber-400">{inspectedItem.damage}</strong> {inspectedItem.damageType}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {inspectedItem.properties?.join(', ') || 'Nenhuma propriedade especial'}
                    </div>
                  </div>

                  <div className="rounded border border-stone-800 bg-stone-900/30 p-2">
                    <div className="text-[10px] uppercase text-stone-400">Arma Atual</div>
                    <div className="font-semibold text-stone-300">
                      {equippedWeapon ? equippedWeapon.name : 'Desarmado'}
                    </div>
                    <div className="text-stone-400">
                      Dano: {equippedWeapon?.damage || '1 + For'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400">{inspectedItem.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Painel Central e Direito: Grade de Itens (Compra ou Venda) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={mode === 'comprar' ? 'Buscar no catálogo da loja...' : 'Buscar itens no inventário...'}
              className="w-full rounded-lg border border-stone-800 bg-stone-950 py-2 pl-9 pr-4 text-xs text-stone-200 placeholder-stone-600 focus:border-amber-600 focus:outline-none"
            />
          </div>

          {/* MODO COMPRAR */}
          {mode === 'comprar' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  Exibindo {filteredCatalog.length} item(ns) em {activeShop.toUpperCase()} ({settlement.toUpperCase()})
                </span>
                <span className="text-stone-500">Passe o mouse ou clique para inspecionar</span>
              </div>

              {filteredCatalog.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-stone-800 bg-stone-950/60 p-12 text-center text-stone-500">
                  <AlertCircle className="mb-2 h-8 w-8 text-stone-600" />
                  <p className="text-sm font-semibold">Nenhum item disponível neste assentamento ou categoria.</p>
                  <p className="text-xs">Experimente aumentar o porte do assentamento para Metrópole ou trocar de mercador.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {filteredCatalog.map(item => {
                    const afford = canAfford(currentCoins, item.costPo);
                    const isSelected = inspectedItem?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setInspectedItem(item)}
                        onClick={() => setInspectedItem(item)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-[#17151e] shadow-lg shadow-amber-950/30'
                            : 'border-stone-800/80 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-900/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif text-sm font-bold text-stone-200 group-hover:text-amber-300">
                                {item.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                <span className="rounded bg-stone-800/80 px-1.5 py-0.5 text-stone-400">
                                  {item.category.toUpperCase()}
                                </span>
                                {item.damage && (
                                  <span className="rounded border border-red-900/40 bg-red-950/30 px-1.5 py-0.5 text-red-300">
                                    ⚔️ {item.damage} {item.damageType}
                                  </span>
                                )}
                                {item.baseAc && (
                                  <span className="rounded border border-blue-900/40 bg-blue-950/30 px-1.5 py-0.5 text-blue-300">
                                    🛡️ CA {item.baseAc}
                                  </span>
                                )}
                                <span className="text-stone-500">{item.weight} kg</span>
                              </div>
                            </div>

                            {/* Preço em PO */}
                            <div className="text-right">
                              <div className="font-mono text-sm font-bold text-amber-400">
                                {item.costPo} PO
                              </div>
                              <div className="text-[9px] text-stone-500">
                                {item.rarity.toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs text-stone-400">
                            {item.description}
                          </p>
                        </div>

                        {/* Botão de Compra */}
                        <div className="mt-3 flex items-center justify-between border-t border-stone-800/60 pt-2">
                          <span className="text-[10px] text-stone-500">
                            Fonte: {item.source}
                          </span>

                          <button
                            type="button"
                            disabled={!afford}
                            onClick={e => {
                              e.stopPropagation();
                              handleBuyItem(item);
                            }}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                              afford
                                ? 'bg-amber-600 text-stone-950 hover:bg-amber-500 active:scale-95'
                                : 'cursor-not-allowed bg-stone-800 text-stone-500'
                            }`}
                          >
                            <Coins className="h-3.5 w-3.5" />
                            <span>{afford ? 'Comprar' : 'Falta Ouro'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MODO VENDER */}
          {mode === 'vender' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  Inventário de {targetBuyer === 'character' ? activeCharacter?.name : 'Baú do Grupo'} ({sellableItems.length} itens)
                </span>
                <span className="text-amber-400/90 font-medium">
                  Taxa aplicada: {Math.round(sellMultiplier * 100)}% do valor de tabela
                </span>
              </div>

              {sellableItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-stone-800 bg-stone-950/60 p-12 text-center text-stone-500">
                  <Package className="mb-2 h-8 w-8 text-stone-600" />
                  <p className="text-sm font-semibold">O inventário selecionado não possui itens para vender.</p>
                  <p className="text-xs">Adquira itens ou selecione outro personagem da campanha.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {sellableItems.map(item => {
                    const sellPrice = calculateSellPrice(item, sellMultiplier);

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-xl border border-stone-800 bg-stone-950/80 p-4 transition hover:border-stone-700"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif text-sm font-bold text-stone-200">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 pt-1 text-[10px] text-stone-400">
                                <span>Qtd: {item.quantity || 1}</span>
                                <span>•</span>
                                <span>{item.weight || 1} kg</span>
                                {item.damage && <span>• ⚔️ {item.damage}</span>}
                                {item.armorBonus && <span>• 🛡️ +{item.armorBonus} CA</span>}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-mono text-sm font-bold text-emerald-400">
                                +{sellPrice} PO
                              </div>
                              <div className="text-[9px] text-stone-500">Valor de Venda</div>
                            </div>
                          </div>

                          {item.description && (
                            <p className="mt-2 line-clamp-2 text-xs text-stone-400">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-end border-t border-stone-800/60 pt-2">
                          <button
                            type="button"
                            onClick={() => handleSellItem(item)}
                            className="flex items-center gap-1.5 rounded-md border border-emerald-600/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 active:scale-95 transition"
                          >
                            <Scale className="h-3.5 w-3.5" />
                            <span>Vender por {sellPrice} PO</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
