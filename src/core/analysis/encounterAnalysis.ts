import { Character, EncounterThresholds, PartySynergy } from '../types/dnd';
import { getPassiveSense, calculateArmorClass } from '../rules/calculations';
import { CLASSES_5E } from '../rules/srdData';

// Tabela oficial do Guia do Mestre (DMG Capítulo 3)
const DMG_XP_THRESHOLDS: Record<number, { easy: number; medium: number; hard: number; deadly: number; daily: number }> = {
  1:  { easy: 25,   medium: 50,   hard: 75,   deadly: 100,   daily: 300 },
  2:  { easy: 50,   medium: 100,  hard: 150,  deadly: 200,   daily: 600 },
  3:  { easy: 75,   medium: 150,  hard: 225,  deadly: 400,   daily: 1200 },
  4:  { easy: 125,  medium: 250,  hard: 375,  deadly: 500,   daily: 1700 },
  5:  { easy: 250,  medium: 500,  hard: 750,  deadly: 1100,  daily: 3500 },
  6:  { easy: 300,  medium: 600,  hard: 900,  deadly: 1400,  daily: 4000 },
  7:  { easy: 350,  medium: 750,  hard: 1100, deadly: 1700,  daily: 5000 },
  8:  { easy: 450,  medium: 900,  hard: 1400, deadly: 2100,  daily: 6000 },
  9:  { easy: 550,  medium: 1100, hard: 1600, deadly: 2400,  daily: 7500 },
  10: { easy: 600,  medium: 1200, hard: 1900, deadly: 2800,  daily: 9000 },
  11: { easy: 800,  medium: 1600, hard: 2400, deadly: 3600,  daily: 10500 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500,  daily: 11500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100,  daily: 13500 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700,  daily: 15000 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400,  daily: 18000 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200,  daily: 20000 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800,  daily: 25000 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500,  daily: 27000 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900, daily: 30000 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700, daily: 40000 },
};

/**
 * Calcula o orçamento de XP para encontros com base no grupo de aventureiros (DMG Cap 3)
 */
export function calculatePartyEncounterThresholds(characters: Character[]): EncounterThresholds {
  if (characters.length === 0) {
    return { easy: 0, medium: 0, hard: 0, deadly: 0, dailyBudget: 0 };
  }

  return characters.reduce(
    (acc, char) => {
      const lvl = Math.max(1, Math.min(20, char.level));
      const row = DMG_XP_THRESHOLDS[lvl] || DMG_XP_THRESHOLDS[1];
      return {
        easy: acc.easy + row.easy,
        medium: acc.medium + row.medium,
        hard: acc.hard + row.hard,
        deadly: acc.deadly + row.deadly,
        dailyBudget: acc.dailyBudget + row.daily
      };
    },
    { easy: 0, medium: 0, hard: 0, deadly: 0, dailyBudget: 0 }
  );
}

/**
 * Analisa a sinergia, resiliência e pontos cegos do grupo
 */
export function analyzePartySynergy(characters: Character[]): PartySynergy {
  if (characters.length === 0) {
    return {
      frontlineScore: 0,
      damageScore: 0,
      supportScore: 0,
      controlScore: 0,
      utilityScore: 0,
      sensesScore: 0,
      gaps: ['O grupo está vazio. Adicione personagens para análise.'],
      strengths: []
    };
  }

  let frontlineRaw = 0;
  let damageRaw = 0;
  let supportRaw = 0;
  let controlRaw = 0;
  let utilityRaw = 0;
  let sensesRaw = 0;

  const gaps: string[] = [];
  const strengths: string[] = [];

  let hasHealer = false;
  let hasDarkvisionAll = true;
  let maxPassivePerception = 0;
  let hasLockpicker = false;
  let hasHighTank = false;

  characters.forEach(c => {
    const classDef = CLASSES_5E[c.class];
    const roles = classDef?.suggestedRoles || [];
    const { ac } = calculateArmorClass(c);
    const passivePerception = getPassiveSense(c, 'percepcao');

    if (passivePerception > maxPassivePerception) {
      maxPassivePerception = passivePerception;
    }

    // Frontline: HP, CA e dado de vida
    const isTankRole = roles.includes('Tank') || ac >= 16 || c.maxHp >= c.level * 9;
    if (isTankRole) {
      frontlineRaw += 30;
      hasHighTank = true;
    }

    // Dano
    if (roles.includes('DPS')) damageRaw += 25;

    // Suporte e Cura
    const heals = c.spells?.some(s => s.name.toLowerCase().includes('cura') || s.name.toLowerCase().includes('heal'));
    if (roles.includes('Healer') || roles.includes('Support') || heals) {
      supportRaw += 35;
      hasHealer = true;
    }

    // Controle
    if (roles.includes('Control')) controlRaw += 25;

    // Utilitário e Exploração
    if (roles.includes('Utility') || c.skillProficiencies.includes('furtividade') || c.skillProficiencies.includes('investigacao')) {
      utilityRaw += 20;
    }

    // Ferramentas de ladrão
    const hasTheftTools = c.inventory.some(i => i.name.toLowerCase().includes('ladrão') || i.name.toLowerCase().includes('ladrao'));
    if (hasTheftTools || c.class === 'Ladino') {
      hasLockpicker = true;
    }

    // Visão no escuro
    const raceLower = c.race.toLowerCase();
    const hasDarkvision = raceLower.includes('elfo') || raceLower.includes('anão') || raceLower.includes('orc') || raceLower.includes('tiefling') || raceLower.includes('gnomo');
    if (!hasDarkvision) {
      hasDarkvisionAll = false;
    }
  });

  // Normalização para escalas de 0 a 100
  const count = characters.length;
  const frontlineScore = Math.min(100, Math.round((frontlineRaw / count) * 2.2));
  const damageScore = Math.min(100, Math.round((damageRaw / count) * 2.0));
  const supportScore = Math.min(100, Math.round((supportRaw / count) * 2.2));
  const controlScore = Math.min(100, Math.round((controlRaw / count) * 2.0));
  const utilityScore = Math.min(100, Math.round((utilityRaw / count) * 2.0));
  const sensesScore = Math.min(100, Math.round(maxPassivePerception * 5));

  // Diagnóstico de Fraquezas (Gaps)
  if (!hasHealer) {
    gaps.push('Sem Conjurador de Cura: Nenhum membro possui magias imediatas de cura. Combates difíceis têm alto risco de morte.');
  }
  if (!hasHighTank) {
    gaps.push('Linha de Frente Frágil: O grupo carece de defensores com alta Classe de Armadura ou Pontos de Vida elevados.');
  }
  if (!hasLockpicker) {
    gaps.push('Sem Especialista em Fechaduras: Nenhum membro com Ferramentas de Ladrão ou foco em desarmar armadilhas mecânicas.');
  }
  if (!hasDarkvisionAll) {
    gaps.push('Vulnerabilidade à Escuridão: Nem todos os aventureiros possuem Visão no Escuro (necessitarão de tochas/luz).');
  }
  if (maxPassivePerception < 13) {
    gaps.push('Baixa Percepção Passiva Máxima (< 13): O grupo é altamente vulnerável a emboscadas e armadilhas ocultas.');
  }

  // Pontos Fortes
  if (hasHighTank) strengths.push('Linha de frente sólida para absorver dano.');
  if (hasHealer) strengths.push('Sustentação de cura disponível para emergências.');
  if (maxPassivePerception >= 15) strengths.push(`Sentinela atenta: Percepção passiva máxima de ${maxPassivePerception}.`);
  if (damageScore >= 60) strengths.push('Excelente potencial de dano em combate.');

  return {
    frontlineScore,
    damageScore,
    supportScore,
    controlScore,
    utilityScore,
    sensesScore,
    gaps,
    strengths
  };
}
