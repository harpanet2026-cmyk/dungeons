import { Character, Item, AbilityName } from '../types/dnd';
import { CatalogItem, EQUIPMENT_CATALOG } from '../data/equipmentCatalog';
import { getAbilityModifier } from './calculations';

export interface CraftingRecipe {
  id: string;
  name: string;
  category: 'arma' | 'armadura' | 'pocao' | 'geral';
  targetItem: CatalogItem;
  materialCostPo: number;
  timeDisplay: string;
  requiredTool: string;
  associatedAbility: AbilityName;
  difficultyDc: number;
  description: string;
}

export interface UpgradeOption {
  id: string;
  name: string;
  costPo: number;
  requiredTool: string;
  associatedAbility: AbilityName;
  difficultyDc: number;
  description: string;
  source: string;
  applicableTo: (item: Item) => boolean;
  applyUpgrade: (item: Item) => Item;
}

/**
 * Gera lista de receitas de criação com base no catálogo de itens e regras de XGtE p. 128
 */
export const CRAFTING_RECIPES: CraftingRecipe[] = EQUIPMENT_CATALOG.filter(c => c.craftingCostPo !== undefined).map(catItem => {
  const isPotion = catItem.category === 'pocao';
  const tool = catItem.craftingTool || (isPotion ? 'Kit de Herbalismo' : 'Ferramentas de Ferreiro');
  const ability: AbilityName = isPotion ? 'int' : (catItem.category === 'armadura' ? 'for' : 'for');
  
  // CD recomendada pelo porte do item
  let dc = 10;
  if (catItem.costPo > 50) dc = 12;
  if (catItem.costPo > 200) dc = 14;
  if (catItem.costPo > 500) dc = 16;
  if (catItem.rarity === 'raro') dc = 18;

  let timeDisplay = `${catItem.craftingDays || 1} dia(s)`;
  if ((catItem.craftingDays || 1) >= 5) {
    const weeks = Math.ceil((catItem.craftingDays || 1) / 5);
    timeDisplay = `${weeks} semana(s) de trabalho`;
  }

  return {
    id: `recipe_${catItem.id}`,
    name: catItem.name,
    category: catItem.category === 'pocao' ? 'pocao' : (catItem.category === 'armadura' || catItem.category === 'escudo' ? 'armadura' : (catItem.category === 'arma' ? 'arma' : 'geral')),
    targetItem: catItem,
    materialCostPo: catItem.craftingCostPo || Math.round(catItem.costPo * 0.5 * 100) / 100,
    timeDisplay,
    requiredTool: tool,
    associatedAbility: ability,
    difficultyDc: dc,
    description: `Matérias-primas equivalentes a metade do valor (XGtE p. 128). ${catItem.description}`
  };
});

/**
 * Opções de aprimoramento e revestimento conforme livros de referência
 */
export const UPGRADE_OPTIONS: UpgradeOption[] = [
  // 1. Prateamento (PHB p. 148)
  {
    id: 'upg_prata',
    name: 'Revestimento de Prata Sacra',
    costPo: 100,
    requiredTool: 'Ferramentas de Ferreiro',
    associatedAbility: 'for',
    difficultyDc: 12,
    source: 'Livro do Jogador (PHB) p. 148',
    description: 'Aplica um banho denso de prata verdadeira sobre a lâmina ou cabeça da arma. Permite superar resistência e imunidade a dano não mágico de licantropos e mortos-vivos.',
    applicableTo: (item: Item) => {
      const isWeapon = item.type === 'arma' || item.damage !== undefined;
      const alreadySilver = item.name.toLowerCase().includes('prateada') || item.description?.toLowerCase().includes('prateada');
      return Boolean(isWeapon && !alreadySilver);
    },
    applyUpgrade: (item: Item) => ({
      ...item,
      name: `${item.name} [Prateada]`,
      description: `${item.description || ''} • Revestida de Prata: supera imunidades e resistências de licantropos e espectros (PHB p. 148).`.trim()
    })
  },

  // 2. Reforço de Adamantina para Armas (XGtE p. 78)
  {
    id: 'upg_adamantina_arma',
    name: 'Liga de Adamantina (Arma Destruidora)',
    costPo: 500,
    requiredTool: 'Ferramentas de Ferreiro',
    associatedAbility: 'for',
    difficultyDc: 15,
    source: 'Guia de Xanathar (XGtE) p. 78',
    description: 'Incorpora adamantina, o metal mais resistente do multiverso. Sempre que acertar um objeto, o golpe é automaticamente um acerto crítico, e ignora resistências de construtos.',
    applicableTo: (item: Item) => {
      const isWeapon = item.type === 'arma' || item.damage !== undefined;
      const alreadyAdamantine = item.name.toLowerCase().includes('adamantina');
      return Boolean(isWeapon && !alreadyAdamantine);
    },
    applyUpgrade: (item: Item) => ({
      ...item,
      name: `${item.name} [Adamantina]`,
      description: `${item.description || ''} • Liga de Adamantina: Acertos contra objetos são críticos automáticos. Ignora resistências materiais de golens (XGtE p. 78).`.trim()
    })
  },

  // 3. Forja de Adamantina para Armaduras (DMG p. 150 & XGtE)
  {
    id: 'upg_adamantina_armadura',
    name: 'Blindagem de Adamantina (Inviolável)',
    costPo: 500,
    requiredTool: 'Ferramentas de Ferreiro',
    associatedAbility: 'for',
    difficultyDc: 16,
    source: 'Guia do Mestre (DMG) p. 150',
    description: 'Reforça uma armadura média ou pesada com placas de adamantina. Converte qualquer golpe crítico desferido contra o usuário em um golpe normal!',
    applicableTo: (item: Item) => {
      const isArmor = item.type === 'armadura' || item.armorBonus !== undefined;
      const isMediumOrHeavy = item.armorType === 'media' || item.armorType === 'pesada';
      const alreadyAdamantine = item.name.toLowerCase().includes('adamantina');
      return Boolean(isArmor && isMediumOrHeavy && !alreadyAdamantine);
    },
    applyUpgrade: (item: Item) => ({
      ...item,
      name: `${item.name} [Adamantina]`,
      description: `${item.description || ''} • Adamantina: Qualquer acerto crítico sofrido pelo usuário se torna um acerto normal (DMG p. 150).`.trim()
    })
  },

  // 4. Forja Élfica de Mithral (DMG p. 150)
  {
    id: 'upg_mithral_armadura',
    name: 'Trançado Élfico de Mithral (Leveza Silenciosa)',
    costPo: 400,
    requiredTool: 'Ferramentas de Ferreiro',
    associatedAbility: 'des',
    difficultyDc: 15,
    source: 'Guia do Mestre (DMG) p. 150',
    description: 'Armadura forjada no mítico metal prateado e flexível dos elfos. Remove a desvantagem em testes de Furtividade e anula o requisito de Força mínima!',
    applicableTo: (item: Item) => {
      const isArmor = item.type === 'armadura' || item.armorBonus !== undefined;
      const hasStealthDisadv = item.stealthDisadvantage === true;
      const alreadyMithral = item.name.toLowerCase().includes('mithral');
      return Boolean(isArmor && (hasStealthDisadv || (item.armorType === 'pesada' || item.armorType === 'media')) && !alreadyMithral);
    },
    applyUpgrade: (item: Item) => ({
      ...item,
      name: `${item.name} [Mithral]`,
      stealthDisadvantage: false,
      description: `${item.description || ''} • Forja de Mithral: Anula a desvantagem em testes de Furtividade e remove exigência de Força (DMG p. 150).`.trim()
    })
  },

  // 5. Encantamento / Afiação Magistral (+1)
  {
    id: 'upg_afiacao_mais_um',
    name: 'Runas de Encantamento / Afiação (+1)',
    costPo: 350,
    requiredTool: 'Ferramentas de Ferreiro',
    associatedAbility: 'int',
    difficultyDc: 15,
    source: 'Guia do Mestre (DMG) p. 213',
    description: 'Gravação de runas arcanas e balanceamento magistral. Concede +1 no ataque e dano (para armas) ou +1 adicional na Classe de Armadura (para armaduras e escudos).',
    applicableTo: (item: Item) => {
      const alreadyPlus = item.name.includes('+1') || item.name.includes('+2') || item.name.includes('+3');
      return !alreadyPlus && (item.type === 'arma' || item.type === 'armadura' || item.armorBonus !== undefined || item.damage !== undefined);
    },
    applyUpgrade: (item: Item) => {
      if (item.type === 'arma' || item.damage) {
        return {
          ...item,
          name: `${item.name} +1`,
          description: `${item.description || ''} • Obra-Prima: +1 nas jogadas de ataque e dano (DMG p. 213).`.trim()
        };
      } else {
        return {
          ...item,
          name: `${item.name} +1`,
          armorBonus: (item.armorBonus || 10) + 1,
          description: `${item.description || ''} • Obra-Prima: +1 de bônus na Classe de Armadura (DMG p. 213).`.trim()
        };
      }
    }
  }
];

/**
 * Calcula o bônus de rolagem do personagem para uma ferramenta/atributo na forja
 */
export const getForgeModifier = (char: Character, ability: AbilityName): number => {
  const baseMod = getAbilityModifier(char.baseAbilities[ability]);
  const profBonus = Math.floor((Math.max(1, char.level) - 1) / 4) + 2;
  
  // Se for guerreiro ou clérigo da forja ou anão, conceder proficiência temática
  const isDwarf = (char.race || '').toLowerCase().includes('anão') || (char.race || '').toLowerCase().includes('anao');
  const isFighterOrPaladin = (char.class || '').toLowerCase().includes('guerreiro') || (char.class || '').toLowerCase().includes('paladino');
  
  const hasToolProficiency = isDwarf || isFighterOrPaladin;
  return baseMod + (hasToolProficiency ? profBonus : 0);
};

export interface ForgeRollResult {
  d20: number;
  modifier: number;
  total: number;
  isCritSuccess: boolean;
  isCritFail: boolean;
  isSuccess: boolean;
  outcomeText: string;
}

export const evaluateForgeRoll = (
  d20: number,
  modifier: number,
  dc: number
): ForgeRollResult => {
  const total = d20 + modifier;
  const isCritSuccess = d20 === 20;
  const isCritFail = d20 === 1;
  const isSuccess = isCritSuccess || (!isCritFail && total >= dc);

  let outcomeText = '';
  if (isCritSuccess) {
    outcomeText = '🌟 SUCESSO CRÍTICO EXCEPCIONAL! A têmpera do metal atingiu a perfeição rúnica. Concluído com esplendor!';
  } else if (isSuccess) {
    outcomeText = `⚔️ SUCESSO! Resultado total ${total} superou a CD ${dc}. O trabalho foi concluído com maestria.`;
  } else if (isCritFail) {
    outcomeText = '💥 FALHA CRÍTICA! O fogo da forja crepitou instável e o metal entortou. Os materiais não foram destruídos, mas requerem novo reparo.';
  } else {
    outcomeText = `⚠️ DIFICULDADE TÉCNICA (Total ${total} vs CD ${dc}). Foram necessários ajustes minuciosos antes de finalizar a peça.`;
  }

  return {
    d20,
    modifier,
    total,
    isCritSuccess,
    isCritFail,
    isSuccess,
    outcomeText
  };
};
