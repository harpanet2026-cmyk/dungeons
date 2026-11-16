import { AbilityName, AbilityScores, Character, Item, SkillName } from '../types/dnd';

/**
 * Calcula o modificador de atributo da 5e: floor((valor - 10) / 2)
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Retorna string formatada com sinal (+2, -1, +0)
 */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Bônus de Proficiência baseado no nível (Capítulo 1 do Manual dos Jogadores)
 * Níveis 1-4: +2
 * Níveis 5-8: +3
 * Níveis 9-12: +4
 * Níveis 13-16: +5
 * Níveis 17-20: +6
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((Math.max(1, Math.min(20, level)) - 1) / 4) + 2;
}

/**
 * Mapeamento de Perícias para Atributos Chave
 */
export const SKILL_ABILITY_MAP: Record<SkillName, { name: string; ability: AbilityName }> = {
  atletismo: { name: 'Atletismo', ability: 'for' },
  acrobacia: { name: 'Acrobacia', ability: 'des' },
  furtividade: { name: 'Furtividade', ability: 'des' },
  prestidigitacao: { name: 'Prestidigitação', ability: 'des' },
  arcanismo: { name: 'Arcanismo', ability: 'int' },
  historia: { name: 'História', ability: 'int' },
  investigacao: { name: 'Investigação', ability: 'int' },
  natureza: { name: 'Natureza', ability: 'int' },
  religiao: { name: 'Religião', ability: 'int' },
  adestrar_animais: { name: 'Adestrar Animais', ability: 'sab' },
  intuicao: { name: 'Intuição', ability: 'sab' },
  medicina: { name: 'Medicina', ability: 'sab' },
  percepcao: { name: 'Percepção', ability: 'sab' },
  sobrevivencia: { name: 'Sobrevivência', ability: 'sab' },
  atuacao: { name: 'Atuação', ability: 'car' },
  enganacao: { name: 'Enganação', ability: 'car' },
  intimidacao: { name: 'Intimidação', ability: 'car' },
  persuasao: { name: 'Persuasão', ability: 'car' },
};

/**
 * Calcula o bônus de teste de resistência (Saving Throw)
 */
export function getSavingThrowModifier(
  char: Pick<Character, 'baseAbilities' | 'level' | 'savingThrowProficiencies'>,
  ability: AbilityName
): number {
  const mod = getAbilityModifier(char.baseAbilities[ability]);
  const isProficient = char.savingThrowProficiencies.includes(ability);
  const prof = getProficiencyBonus(char.level);
  return mod + (isProficient ? prof : 0);
}

/**
 * Calcula o bônus de uma perícia (incluindo proficiência e especialização/expertise)
 */
export function getSkillModifier(
  char: Pick<Character, 'baseAbilities' | 'level' | 'skillProficiencies' | 'skillExpertise'>,
  skill: SkillName
): number {
  const ability = SKILL_ABILITY_MAP[skill].ability;
  const mod = getAbilityModifier(char.baseAbilities[ability]);
  const prof = getProficiencyBonus(char.level);
  const isProficient = char.skillProficiencies.includes(skill);
  const isExpert = char.skillExpertise?.includes(skill);

  if (isExpert) {
    return mod + prof * 2;
  }
  if (isProficient) {
    return mod + prof;
  }
  return mod;
}

/**
 * Calcula os sentidos passivos: 10 + bônus da perícia
 */
export function getPassiveSense(
  char: Pick<Character, 'baseAbilities' | 'level' | 'skillProficiencies' | 'skillExpertise'>,
  skill: SkillName
): number {
  return 10 + getSkillModifier(char, skill);
}

/**
 * Cálculo determinístico da Classe de Armadura (CA) segundo as regras de D&D 5e
 */
export function calculateArmorClass(
  char: Pick<Character, 'baseAbilities' | 'equippedArmor' | 'equippedShield' | 'class'>
): { ac: number; breakdown: string } {
  const desMod = getAbilityModifier(char.baseAbilities.des);
  const conMod = getAbilityModifier(char.baseAbilities.con);
  const wisMod = getAbilityModifier(char.baseAbilities.sab);
  const shieldBonus = char.equippedShield ? (char.equippedShield.armorBonus || 2) : 0;

  let baseAc = 10;
  let breakdown = '';

  if (char.equippedArmor && char.equippedArmor.armorType !== 'nenhuma') {
    const armor = char.equippedArmor;
    const armorBase = armor.armorBonus || 11;

    switch (armor.armorType) {
      case 'leve':
        baseAc = armorBase + desMod;
        breakdown = `${armor.name} (${armorBase}) + Des (${formatModifier(desMod)})`;
        break;
      case 'media':
        const cappedDes = Math.min(desMod, 2);
        baseAc = armorBase + cappedDes;
        breakdown = `${armor.name} (${armorBase}) + Des máx +2 (${formatModifier(cappedDes)})`;
        break;
      case 'pesada':
        baseAc = armorBase;
        breakdown = `${armor.name} (${armorBase})`;
        break;
      default:
        baseAc = 10 + desMod;
        breakdown = `Sem armadura (10) + Des (${formatModifier(desMod)})`;
    }
  } else {
    // Sem armadura: verifica características de classe
    const className = char.class.toLowerCase();
    if (className.includes('bárbaro') || className.includes('barbaro')) {
      baseAc = 10 + desMod + conMod;
      breakdown = `Defesa sem Armadura (Bárbaro): 10 + Des (${desMod}) + Con (${conMod})`;
    } else if (className.includes('monge')) {
      baseAc = 10 + desMod + wisMod;
      breakdown = `Defesa sem Armadura (Monge): 10 + Des (${desMod}) + Sab (${wisMod})`;
    } else {
      baseAc = 10 + desMod;
      breakdown = `Sem armadura: 10 + Des (${formatModifier(desMod)})`;
    }
  }

  const finalAc = baseAc + shieldBonus;
  if (shieldBonus > 0) {
    breakdown += ` + Escudo (+${shieldBonus})`;
  }

  return { ac: finalAc, breakdown };
}

/**
 * Calcula a CD de Salvaguarda de Magia e Bônus de Ataque Mágico
 */
export function calculateSpellcastingMetrics(
  char: Pick<Character, 'baseAbilities' | 'level' | 'spellcastingAbility'>
): { spellSaveDc: number; spellAttackBonus: number; abilityMod: number; profBonus: number } | null {
  if (!char.spellcastingAbility) return null;

  const profBonus = getProficiencyBonus(char.level);
  const abilityMod = getAbilityModifier(char.baseAbilities[char.spellcastingAbility]);

  return {
    spellSaveDc: 8 + profBonus + abilityMod,
    spellAttackBonus: profBonus + abilityMod,
    abilityMod,
    profBonus
  };
}

/**
 * Calcula a capacidade de carga em Kg (Regras Básicas Capítulo 5: Força * 7.5 kg)
 */
export function calculateEncumbrance(strength: number, inventory: Item[]): {
  totalWeight: number;
  maxCapacity: number;
  isEncumbered: boolean;
} {
  const maxCapacity = strength * 7.5;
  const totalWeight = inventory.reduce((acc, item) => acc + (item.weight * (item.quantity || 1)), 0);
  return {
    totalWeight: Number(totalWeight.toFixed(1)),
    maxCapacity,
    isEncumbered: totalWeight > maxCapacity
  };
}
