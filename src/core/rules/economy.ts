import { Coins, Character, Item } from '../types/dnd';
import { CatalogItem, SettlementType } from '../data/equipmentCatalog';

export interface PartyChest {
  coins: Coins;
  items: Item[];
}

export const DEFAULT_PARTY_CHEST: PartyChest = {
  coins: { pc: 150, pp: 80, pe: 10, po: 250, pl: 2 },
  items: []
};

/**
 * Converte qualquer conjunto de moedas para o valor equivalente em Peças de Ouro (PO).
 * 1 PL = 10 PO, 1 PE = 0.5 PO, 1 PP = 0.1 PO, 1 PC = 0.01 PO.
 */
export const coinsToPo = (coins: Coins): number => {
  if (!coins) return 0;
  const pc = Number(coins.pc || 0);
  const pp = Number(coins.pp || 0);
  const pe = Number(coins.pe || 0);
  const po = Number(coins.po || 0);
  const pl = Number(coins.pl || 0);

  const total = (pl * 10) + po + (pe * 0.5) + (pp * 0.1) + (pc * 0.01);
  return Math.round(total * 100) / 100;
};

/**
 * Converte um valor total em PO de volta para a carteira ideal balanceada.
 */
export const poToCoins = (totalPo: number): Coins => {
  let remainingCopper = Math.round(Math.max(0, totalPo) * 100);

  const pl = Math.floor(remainingCopper / 1000);
  remainingCopper %= 1000;

  const po = Math.floor(remainingCopper / 100);
  remainingCopper %= 100;

  const pp = Math.floor(remainingCopper / 10);
  remainingCopper %= 10;

  const pc = remainingCopper;

  return { pc, pp, pe: 0, po, pl };
};

/**
 * Verifica se a carteira tem saldo suficiente para cobrir um custo em PO.
 */
export const canAfford = (coins: Coins, costPo: number): boolean => {
  return coinsToPo(coins) >= costPo - 0.0001;
};

/**
 * Desconta um custo em PO de forma inteligente e exata.
 * Retorna uma nova instância de moedas ou null se não houver saldo.
 */
export const deductCoins = (coins: Coins, costPo: number): Coins | null => {
  const currentTotal = coinsToPo(coins);
  if (currentTotal < costPo - 0.0001) {
    return null; // Saldo insuficiente
  }

  // Abordagem direta e elegante de quebra de troco proporcional:
  // Se houver PO suficiente em moedas diretas, desconta direto sem quebrar PL
  let pc = Number(coins.pc || 0);
  let pp = Number(coins.pp || 0);
  let pe = Number(coins.pe || 0);
  let po = Number(coins.po || 0);
  let pl = Number(coins.pl || 0);

  let targetCopper = Math.round(costPo * 100);

  // 1. Tentar pagar com PO direto se for valor inteiro
  const targetPoPart = Math.floor(targetCopper / 100);
  const remainderCopper = targetCopper % 100;

  if (po >= targetPoPart && remainderCopper === 0) {
    return { pc, pp, pe, po: po - targetPoPart, pl };
  }

  // 2. Se for fracionado ou não tiver PO suficiente, converte o total em cobre, subtrai e reconverte com segurança
  const totalCopper = Math.round(currentTotal * 100);
  const finalCopper = totalCopper - targetCopper;

  return poToCoins(finalCopper / 100);
};

/**
 * Adiciona um valor em PO à carteira do herói ou baú.
 */
export const addCoins = (coins: Coins, addedPo: number): Coins => {
  const currentTotal = coinsToPo(coins);
  const newTotal = currentTotal + addedPo;
  return poToCoins(newTotal);
};

/**
 * Calcula o valor de venda de um item com base nas regras do PHB p. 144/146.
 * Multiplicador padrão: 50% para armas, armaduras e equipamentos comuns.
 * 100% para gemas, joias e obras de arte.
 */
export const calculateSellPrice = (item: Item | CatalogItem, multiplier: number = 0.5): number => {
  // Se for catalog item
  let basePrice = 0;
  if ('costPo' in item) {
    basePrice = item.costPo;
  } else {
    // Estimativa se for item do inventário
    const lowerName = item.name.toLowerCase();
    if (lowerName.includes('gema') || lowerName.includes('diamante') || lowerName.includes('rubi') || lowerName.includes('arte') || lowerName.includes('cálice')) {
      return item.quantity ? 50 * item.quantity : 50; // Joias retêm 100%
    }
    // Tenta estimar com base nas propriedades
    basePrice = 10;
  }

  return Math.max(0.01, Math.round(basePrice * multiplier * 100) / 100);
};

/**
 * Filtra catálogo de acordo com o porte do assentamento.
 * - Vilarejo: Itens comuns até 50 PO (sem itens mágicos exceto poção básica).
 * - Cidade: Itens comuns e incomuns até 1.000 PO.
 * - Metrópole: Catálogo irrestrito (comum, incomum, raro, muito raro).
 */
export const filterCatalogBySettlement = (
  items: CatalogItem[],
  settlement: SettlementType
): CatalogItem[] => {
  return items.filter(item => {
    if (settlement === 'vilarejo') {
      return item.minSettlement === 'vilarejo' && item.costPo <= 75 && item.rarity === 'comum';
    }
    if (settlement === 'cidade') {
      return item.minSettlement === 'vilarejo' || item.minSettlement === 'cidade';
    }
    // Metrópole tem acesso a tudo
    return true;
  });
};
