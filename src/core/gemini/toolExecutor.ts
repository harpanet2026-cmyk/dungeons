import { Character, Condition, Enemy, SkillName, AbilityName } from '../types/dnd';
import { SessionManager } from '../state/sessionManager';
import { getSkillModifier, getSavingThrowModifier, getAbilityModifier, SKILL_ABILITY_MAP } from '../rules/calculations';

export interface ExecutedToolResult {
  toolName: string;
  args: any;
  summary: string;
  badge: {
    icon: string;
    title: string;
    description: string;
    success?: boolean;
  };
  output: any;
  updatedCharacters?: Character[];
  updatedEnemies?: Enemy[];
}

export class ToolExecutor {
  /**
   * Encontra um personagem ou inimigo pelo nome (parcial ou exato)
   */
  private static findTarget(name: string, characters: Character[], enemies: Enemy[]) {
    if (!name) return null;
    const clean = name.trim().toLowerCase();

    // 1. Tenta heróis
    const hero = characters.find(c => 
      c.name.toLowerCase() === clean || 
      c.name.toLowerCase().includes(clean) || 
      clean.includes(c.name.toLowerCase().split(' ')[0])
    );
    if (hero) return { type: 'hero' as const, entity: hero };

    // 2. Tenta monstros
    const enemy = enemies.find(e => 
      e.name.toLowerCase() === clean || 
      e.name.toLowerCase().includes(clean) ||
      clean.includes(e.name.toLowerCase().split(' ')[0])
    );
    if (enemy) return { type: 'enemy' as const, entity: enemy };

    return null;
  }

  /**
   * Normaliza o nome da perícia ou atributo
   */
  private static normalizeCheckType(type: string): { isSkill: boolean; skill?: SkillName; ability?: AbilityName } {
    const clean = (type || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // Mapeamento de perícias
    const skillKeys = Object.keys(SKILL_ABILITY_MAP) as SkillName[];
    const matchedSkill = skillKeys.find(s => s === clean || clean.includes(s));
    if (matchedSkill) {
      return { isSkill: true, skill: matchedSkill };
    }

    // Mapeamento de atributos / salvaguardas
    if (clean.includes('for') || clean.includes('atlet')) return { isSkill: false, ability: 'for' };
    if (clean.includes('des') || clean.includes('agil')) return { isSkill: false, ability: 'des' };
    if (clean.includes('con') || clean.includes('vida') || clean.includes('vigor')) return { isSkill: false, ability: 'con' };
    if (clean.includes('int') || clean.includes('arcan') || clean.includes('sabed')) return { isSkill: false, ability: 'int' };
    if (clean.includes('sab') || clean.includes('percep') || clean.includes('intu')) return { isSkill: false, ability: 'sab' };
    if (clean.includes('car') || clean.includes('persua') || clean.includes('intimi')) return { isSkill: false, ability: 'car' };

    return { isSkill: true, skill: 'percepcao' };
  }

  /**
   * Executa uma ferramenta chamada pela IA
   */
  public static execute(
    toolName: string,
    args: any,
    currentCharacters: Character[],
    currentEnemies: Enemy[]
  ): ExecutedToolResult {
    switch (toolName) {
      case 'roll_d20_check': {
        const charName = args.character_name || 'Herói';
        const target = this.findTarget(charName, currentCharacters, currentEnemies);
        const { isSkill, skill, ability } = this.normalizeCheckType(args.check_type || 'percepcao');

        let modifier = 0;
        let displayName = args.check_type || 'Percepção';

        if (target && target.type === 'hero') {
          const hero = target.entity;
          if (isSkill && skill) {
            modifier = getSkillModifier(hero, skill);
            displayName = SKILL_ABILITY_MAP[skill].name;
          } else if (ability) {
            modifier = getSavingThrowModifier(hero, ability);
            displayName = `Salvaguarda de ${ability.toUpperCase()}`;
          }
        }

        // Rola o D20 de verdade
        const roll1 = Math.floor(Math.random() * 20) + 1;
        const roll2 = Math.floor(Math.random() * 20) + 1;
        const mode = args.advantage_mode || 'normal';

        let finalD20 = roll1;
        let rollBreakdown = `d20 (${roll1})`;

        if (mode === 'vantagem') {
          finalD20 = Math.max(roll1, roll2);
          rollBreakdown = `2d20 com Vantagem [${roll1}, ${roll2}] → ${finalD20}`;
        } else if (mode === 'desvantagem') {
          finalD20 = Math.min(roll1, roll2);
          rollBreakdown = `2d20 com Desvantagem [${roll1}, ${roll2}] → ${finalD20}`;
        }

        const total = finalD20 + modifier;
        const targetDc = typeof args.target_dc === 'number' ? args.target_dc : undefined;
        const isSuccess = targetDc !== undefined ? total >= targetDc : undefined;

        const summary = `${target?.entity.name || charName} realizou teste de ${displayName}: ${rollBreakdown} + mod (${modifier >= 0 ? '+' : ''}${modifier}) = ${total}${targetDc !== undefined ? ` vs CD ${targetDc} [${isSuccess ? 'SUCESSO' : 'FALHA'}]` : ''}`;

        return {
          toolName,
          args,
          summary,
          badge: {
            icon: '🎲',
            title: `Teste de ${displayName}: ${total}`,
            description: `${target?.entity.name || charName} rolou ${finalD20} + ${modifier} = ${total}${targetDc !== undefined ? ` (CD ${targetDc}: ${isSuccess ? 'Sucesso ✓' : 'Falha ✗'})` : ''}`,
            success: isSuccess
          },
          output: {
            character: target?.entity.name || charName,
            check: displayName,
            d20: finalD20,
            modifier,
            total,
            target_dc: targetDc,
            success: isSuccess
          }
        };
      }

      case 'apply_damage': {
        const charName = args.character_name || '';
        const amount = Math.max(0, parseInt(args.amount, 10) || 0);
        const damageType = args.damage_type || 'dano';
        const target = this.findTarget(charName, currentCharacters, currentEnemies);

        let updatedCharacters = currentCharacters;
        let updatedEnemies = currentEnemies;
        let log = '';

        if (target && target.type === 'hero') {
          const res = SessionManager.applyDamage(currentCharacters, target.entity.id, amount);
          updatedCharacters = res.updatedCharacters;
          log = res.log;
        } else if (target && target.type === 'enemy') {
          const res = SessionManager.applyEnemyDamage(currentEnemies, target.entity.id, amount);
          updatedEnemies = res.updatedEnemies;
          log = res.log;
        } else {
          log = `Alvo "${charName}" não encontrado para aplicar dano.`;
        }

        const targetEntity = target?.entity;
        const currentHp = targetEntity ? Math.max(0, targetEntity.currentHp - amount) : 0;
        const maxHp = targetEntity?.maxHp || 0;

        return {
          toolName,
          args,
          summary: `[DANO APLICADO]: ${log} (Tipo: ${damageType})`,
          badge: {
            icon: '⚔️',
            title: `Dano Aplicado: -${amount} PV (${damageType})`,
            description: `${targetEntity?.name || charName} sofreu ${amount} de dano. HP: ${currentHp}/${maxHp}`,
            success: false
          },
          output: {
            target: targetEntity?.name || charName,
            damage_taken: amount,
            damage_type: damageType,
            remaining_hp: currentHp,
            unconscious: currentHp === 0
          },
          updatedCharacters,
          updatedEnemies
        };
      }

      case 'heal_character': {
        const charName = args.character_name || '';
        const amount = Math.max(0, parseInt(args.amount, 10) || 0);
        const target = this.findTarget(charName, currentCharacters, currentEnemies);

        let updatedCharacters = currentCharacters;
        let updatedEnemies = currentEnemies;
        let log = '';

        if (target && target.type === 'hero') {
          const res = SessionManager.healCharacter(currentCharacters, target.entity.id, amount);
          updatedCharacters = res.updatedCharacters;
          log = res.log;
        } else if (target && target.type === 'enemy') {
          const res = SessionManager.healEnemy(currentEnemies, target.entity.id, amount);
          updatedEnemies = res.updatedEnemies;
          log = res.log;
        } else {
          log = `Alvo "${charName}" não encontrado para curar.`;
        }

        const targetEntity = target?.entity;
        const newHp = targetEntity ? Math.min(targetEntity.maxHp, targetEntity.currentHp + amount) : 0;

        return {
          toolName,
          args,
          summary: `[CURA APLICADA]: ${log}`,
          badge: {
            icon: '✨',
            title: `Cura Aplicada: +${amount} PV`,
            description: `${targetEntity?.name || charName} recuperou ${amount} PV. HP: ${newHp}/${targetEntity?.maxHp || 0}`,
            success: true
          },
          output: {
            target: targetEntity?.name || charName,
            hp_healed: amount,
            current_hp: newHp
          },
          updatedCharacters,
          updatedEnemies
        };
      }

      case 'spend_spell_slot': {
        const charName = args.character_name || '';
        const level = parseInt(args.spell_level, 10) || 1;
        const target = this.findTarget(charName, currentCharacters, currentEnemies);

        let updatedCharacters = currentCharacters;
        let log = '';

        if (target && target.type === 'hero') {
          const res = SessionManager.spendSpellSlot(currentCharacters, target.entity.id, level);
          updatedCharacters = res.updatedCharacters;
          log = res.log;
        } else {
          log = `Conjurador "${charName}" não encontrado para gastar magia.`;
        }

        return {
          toolName,
          args,
          summary: `[ESPAÇO DE MAGIA]: ${log}`,
          badge: {
            icon: '🔮',
            title: `Magia Conjurada (Círculo ${level})`,
            description: `${target?.entity.name || charName} gastou 1 espaço de magia de nível ${level}`,
            success: true
          },
          output: {
            character: target?.entity.name || charName,
            slot_level: level
          },
          updatedCharacters
        };
      }

      case 'set_condition': {
        const charName = args.character_name || '';
        const condition = args.condition as Condition;
        const active = args.active !== false;
        const target = this.findTarget(charName, currentCharacters, currentEnemies);

        let updatedCharacters = currentCharacters;
        let updatedEnemies = currentEnemies;
        let log = '';

        if (target && target.type === 'hero') {
          const hero = target.entity;
          const currentConditions = [...hero.conditions];
          const newConditions = active 
            ? Array.from(new Set([...currentConditions, condition]))
            : currentConditions.filter(c => c !== condition);

          updatedCharacters = currentCharacters.map(c => c.id === hero.id ? { ...c, conditions: newConditions } : c);
          SessionManager.saveCharacters(updatedCharacters);
          log = `${hero.name} agora está ${active ? `com a condição [${condition}]` : `livre da condição [${condition}]`}.`;
        } else if (target && target.type === 'enemy') {
          const enemy = target.entity;
          const currentConditions = [...enemy.conditions];
          const newConditions = active 
            ? Array.from(new Set([...currentConditions, condition]))
            : currentConditions.filter(c => c !== condition);

          updatedEnemies = currentEnemies.map(e => e.id === enemy.id ? { ...e, conditions: newConditions } : e);
          SessionManager.saveEnemies(updatedEnemies);
          log = `${enemy.name} agora está ${active ? `com a condição [${condition}]` : `livre da condição [${condition}]`}.`;
        } else {
          log = `Alvo "${charName}" não encontrado para aplicar condição.`;
        }

        return {
          toolName,
          args,
          summary: `[STATUS/CONDIÇÃO]: ${log}`,
          badge: {
            icon: active ? '⚠️' : '🛡️',
            title: active ? `Condição Aplicada: ${condition}` : `Condição Removida: ${condition}`,
            description: log,
            success: !active
          },
          output: {
            character: target?.entity.name || charName,
            condition,
            active
          },
          updatedCharacters,
          updatedEnemies
        };
      }

      case 'get_party_status':
      default: {
        const partySummary = currentCharacters.map(c => ({
          name: c.name,
          class: `${c.class} Nv.${c.level}`,
          hp: `${c.currentHp}/${c.maxHp}`,
          conditions: c.conditions
        }));
        const enemiesSummary = currentEnemies.map(e => ({
          name: e.name,
          hp: `${e.currentHp}/${e.maxHp}`,
          conditions: e.conditions
        }));

        return {
          toolName,
          args,
          summary: `[CONSULTA DE GRUPO]: Estado atual verificado.`,
          badge: {
            icon: '📋',
            title: 'Consulta de Estado do Grupo',
            description: `${currentCharacters.length} heróis e ${currentEnemies.length} ameaças consultados`,
            success: true
          },
          output: {
            party: partySummary,
            enemies: enemiesSummary
          }
        };
      }
    }
  }
}
