import { Character, EncounterThresholds, PartySynergy } from '../types/dnd';
import { calculateArmorClass, getPassiveSense, calculateSpellcastingMetrics, formatModifier, getAbilityModifier } from '../rules/calculations';

/**
 * Gera o Dossiê Narrativo Completo para atuar como System Prompt no Gemini Pro
 */
export function generateCampaignDossier(
  characters: Character[],
  synergy: PartySynergy,
  thresholds: EncounterThresholds
): string {
  if (characters.length === 0) {
    return 'Nenhum personagem registrado no grupo ainda.';
  }

  const header = `# DIRETRIZES DA CAMPANHA D&D 5e (PARA O NARRADOR: GEMINI PRO)

Você é o Dungeon Master (Mestre de Jogo) narrando uma campanha de Dungeons & Dragons 5ª Edição para o grupo de aventureiros detalhado abaixo.

### 🎭 Suas Diretrizes Narrativas e de Mestre:
1. **Profundidade Psicológica:** Sempre use ativamente os **Defeitos**, **Vínculos** e **Ideais** de cada personagem para provocar dilemas dramáticos e ganchos de história.
2. **Sentidos Passivos em Ação:** Não peça testes de Percepção desnecessários. Se a CD de percepção de uma pista ou emboscada for menor ou igual à Percepção Passiva do herói, descreva que ele percebeu imediatamente.
3. **Calibração de Encontros (Guia do Mestre):** Respeite o orçamento de XP calculado para o grupo. Desafios mortais devem ser épicos e telegrafados previamente.
4. **Respeito ao Motor de Regras:** Os cálculos mecânicos (HP, espaços de magia, bônus de perícia) são gerenciados pelo software companion. Foque na narrativa rica, no diálogo dos NPCs e nas consequências dramáticas.

---

## ⚔️ ORÇAMENTO TÁTICO DO GRUPO (GUIA DO MESTRE CAP. 3)
- **Limiar Fácil:** ${thresholds.easy} XP
- **Limiar Médio:** ${thresholds.medium} XP
- **Limiar Difícil:** ${thresholds.hard} XP
- **Limiar Mortal:** ${thresholds.deadly} XP (Atenção redobrada para evitar TPK acidental)
- **Orçamento Diário de Aventura:** ${thresholds.dailyBudget} XP

### 🔍 Diagnóstico de Sinergia e Vulnerabilidades do Grupo:
- **Linha de Frente:** ${synergy.frontlineScore}/100 | **Dano Sustentado:** ${synergy.damageScore}/100
- **Suporte/Cura:** ${synergy.supportScore}/100 | **Controle:** ${synergy.controlScore}/100
${synergy.gaps.length > 0 ? `\n> **⚠️ PONTOS CEGOS PARA EXPLORAR NA HISTÓRIA:**\n${synergy.gaps.map(g => `- ${g}`).join('\n')}` : ''}
${synergy.strengths.length > 0 ? `\n> **🛡️ PONTOS FORTES DO GRUPO:**\n${synergy.strengths.map(s => `- ${s}`).join('\n')}` : ''}

---

## 👥 DOSSIÊ DOS PERSONAGENS
`;

  const charactersList = characters.map((c, index) => {
    const { ac, breakdown } = calculateArmorClass(c);
    const passPerception = getPassiveSense(c, 'percepcao');
    const passInvestigation = getPassiveSense(c, 'investigacao');
    const passInsight = getPassiveSense(c, 'intuicao');
    const spellMetrics = calculateSpellcastingMetrics(c);

    const forMod = formatModifier(getAbilityModifier(c.baseAbilities.for));
    const desMod = formatModifier(getAbilityModifier(c.baseAbilities.des));
    const conMod = formatModifier(getAbilityModifier(c.baseAbilities.con));
    const intMod = formatModifier(getAbilityModifier(c.baseAbilities.int));
    const sabMod = formatModifier(getAbilityModifier(c.baseAbilities.sab));
    const carMod = formatModifier(getAbilityModifier(c.baseAbilities.car));

    const weaponsList = c.weapons.map(w => `${w.name} (${w.damage} ${w.damageType || ''})`).join(', ') || 'Desarmado';
    const activeConditions = c.conditions.length > 0 ? c.conditions.join(', ') : 'Nenhuma';

    return `### [HERÓI ${index + 1}] ${c.name} — ${c.race} ${c.class} (Nível ${c.level})
- **Jogador:** ${c.player || 'Jogador'} | **Alinhamento:** ${c.alignment} | **Antecedente:** ${c.background}
- **Atributos:** FOR ${c.baseAbilities.for} (${forMod}) | DES ${c.baseAbilities.des} (${desMod}) | CON ${c.baseAbilities.con} (${conMod}) | INT ${c.baseAbilities.int} (${intMod}) | SAB ${c.baseAbilities.sab} (${sabMod}) | CAR ${c.baseAbilities.car} (${carMod})
- **Combate:** HP Máx: ${c.maxHp} (Atual: ${c.currentHp}) | CA: ${ac} (${breakdown}) | Deslocamento: ${c.speed}m
- **Sentidos Passivos:** Percepção Passiva: **${passPerception}** | Investigação Passiva: **${passInvestigation}** | Intuição Passiva: **${passInsight}**
- **Armas Equipadas:** ${weaponsList}
${spellMetrics ? `- **Conjuração:** CD de Magia: **${spellMetrics.spellSaveDc}** | Bônus de Ataque Mágico: **${formatModifier(spellMetrics.spellAttackBonus)}**` : ''}
- **Condições Atuais:** ${activeConditions}

#### 🎭 Perfil Dramático (Ganchos de Interpretação):
- **Ideais:** ${c.personality.ideals || 'A definir'}
- **Vínculos:** ${c.personality.bonds || 'A definir'}
- **Defeitos:** ${c.personality.flaws || 'A definir'}
- **Traços de Personalidade:** ${c.personality.traits.join(' / ') || 'A definir'}
- **Segredos ou Ganchos Pessoais:** ${c.personality.secretsOrHooks || 'Nenhum segredo declarado'}
- **Resumo do Histórico:** ${c.personality.backstory || 'Nenhum histórico detalhado'}
`;
  }).join('\n---\n\n');

  return `${header}\n${charactersList}`;
}

/**
 * Gera o Instantâneo Tático (Combat Snapshot) compacto para turnos de combate
 */
export function generateCombatSnapshot(characters: Character[]): string {
  if (characters.length === 0) return 'Nenhum combatente ativo.';

  const lines = characters.map(c => {
    const { ac } = calculateArmorClass(c);
    const passPerc = getPassiveSense(c, 'percepcao');
    
    // Espaços de magia usados / totais
    const slotsInfo = Object.entries(c.spellSlots)
      .filter(([_, s]) => s.max > 0)
      .map(([lvl, s]) => `${lvl}º:[${s.max - s.used}/${s.max}]`)
      .join(' ');

    const cond = c.conditions.length > 0 ? ` | [COND: ${c.conditions.join(', ')}]` : '';
    const tempHp = c.tempHp > 0 ? ` (+${c.tempHp} temp)` : '';

    return `• **${c.name}** (${c.class} ${c.level}): HP: **${c.currentHp}/${c.maxHp}**${tempHp} | CA: **${ac}** | Perc.Passiva: **${passPerc}**${slotsInfo ? ` | Slots: ${slotsInfo}` : ''}${cond}`;
  });

  return `[INSTANTÂNEO DE COMBATE - D&D 5e]\n${lines.join('\n')}`;
}

/**
 * Formata um log de ação em mensagem pronta para envio ao Gemini
 */
export function formatActionLogForGemini(
  characterName: string,
  actionType: 'dano' | 'cura' | 'magia' | 'descanso' | 'condicao',
  detail: string
): string {
  return `[ATUALIZAÇÃO DE ESTADO - ${characterName.toUpperCase()}]: ${detail}`;
}
