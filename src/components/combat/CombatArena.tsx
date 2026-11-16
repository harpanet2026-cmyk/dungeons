import React, { useState } from 'react';
import { Character, Enemy, DiceRollMode } from '../../core/types/dnd';
import { BESTIARY_SRD, createEnemyInstance } from '../../core/rules/monsterData';
import { calculateArmorClass } from '../../core/rules/calculations';
import { Swords, Shield, Heart, Skull, Plus, Trash2, Dices, AlertOctagon, Target, Check, Sparkles } from 'lucide-react';
import { PendingRoll } from './ManualDiceModal';

interface CombatArenaProps {
  characters: Character[];
  enemies: Enemy[];
  diceMode: DiceRollMode;
  onSetDiceMode: (mode: DiceRollMode) => void;
  onApplyDamageHero: (heroId: string, amount: number) => void;
  onApplyDamageEnemy: (enemyId: string, amount: number) => void;
  onHealEnemy: (enemyId: string, amount: number) => void;
  onAddEnemy: (enemy: Enemy) => void;
  onRemoveEnemy: (enemyId: string) => void;
  onRequestManualRoll: (pending: PendingRoll) => void;
  onResolveAutoAttack: (params: {
    attackerName: string;
    targetName: string;
    targetAc: number;
    atkBonus: number;
    damageFormula: string;
    damageType: string;
    targetHeroId?: string;
    targetEnemyId?: string;
  }) => void;
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  characters,
  enemies,
  diceMode,
  onSetDiceMode,
  onApplyDamageHero,
  onApplyDamageEnemy,
  onHealEnemy,
  onAddEnemy,
  onRemoveEnemy,
  onRequestManualRoll,
  onResolveAutoAttack
}) => {
  const [selectedMonsterKey, setSelectedMonsterKey] = useState<string>('Orc');
  const [customEnemyDamage, setCustomEnemyDamage] = useState<{ [id: string]: string }>({});
  const [activeAttacker, setActiveAttacker] = useState<{ enemy: Enemy; attackIndex: number } | null>(null);

  const handleSpawnMonster = () => {
    const newEnemy = createEnemyInstance(selectedMonsterKey);
    onAddEnemy(newEnemy);
  };

  const handleEnemyAttackTarget = (enemy: Enemy, attackIdx: number, targetHero: Character) => {
    const atk = enemy.attacks[attackIdx];
    const { ac } = calculateArmorClass(targetHero);

    if (diceMode === 'manual') {
      onRequestManualRoll({
        title: `Ataque: ${enemy.name} ➔ ${targetHero.name}`,
        subtitle: `${atk.name} (${atk.bonus >= 0 ? `+${atk.bonus}` : atk.bonus} para acertar contra CA ${ac})`,
        modifier: atk.bonus,
        targetAc: ac,
        damageFormula: atk.damage,
        damageType: atk.damageType,
        onConfirm: (d20, manualDamage) => {
          const total = d20 + atk.bonus;
          const isCrit = d20 === 20;
          const isHit = isCrit || (d20 !== 1 && total >= ac);
          if (isHit) {
            const dmg = manualDamage !== undefined ? manualDamage : 6;
            onApplyDamageHero(targetHero.id, dmg);
          }
        },
        onAutoRoll: () => {
          onResolveAutoAttack({
            attackerName: enemy.name,
            targetName: targetHero.name,
            targetAc: ac,
            atkBonus: atk.bonus,
            damageFormula: atk.damage,
            damageType: atk.damageType,
            targetHeroId: targetHero.id
          });
        }
      });
    } else {
      onResolveAutoAttack({
        attackerName: enemy.name,
        targetName: targetHero.name,
        targetAc: ac,
        atkBonus: atk.bonus,
        damageFormula: atk.damage,
        damageType: atk.damageType,
        targetHeroId: targetHero.id
      });
    }

    setActiveAttacker(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Combate & Seletor de Modo de Dados */}
      <div className="bg-[#0e111a] border border-[#231b14] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold gold-gradient-text flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#f5ba42]" />
            ARENA DE COMBATE & ENCONTRO DE INIMIGOS
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Parâmetros mecânicos transparentes dos inimigos para rolagens sem favorecimento nem viés de IA.
          </p>
        </div>

        {/* Toggle de Modo de Rolagem */}
        <div className="flex items-center gap-2 bg-[#141824] p-1.5 rounded-xl border border-[#262f44]">
          <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider pl-2 flex items-center gap-1.5">
            <Dices className="w-4 h-4 text-[#f5ba42]" /> Modo de Dados:
          </span>
          <button
            onClick={() => onSetDiceMode('automatico')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              diceMode === 'automatico'
                ? 'bg-[#f5ba42] text-stone-950 shadow font-extrabold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            ⚡ Automático
          </button>
          <button
            onClick={() => onSetDiceMode('manual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              diceMode === 'manual'
                ? 'bronze-btn text-[#f5ba42] shadow font-extrabold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            🎲 Manual (Eu Rolo)
          </button>
        </div>
      </div>

      {/* Spawner de Inimigos do Bestiário SRD */}
      <div className="bg-[#121622] border border-[#231b14] rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#f5ba42]" /> Adicionar Monstro ao Encontro:
          </span>
          <select
            value={selectedMonsterKey}
            onChange={(e) => setSelectedMonsterKey(e.target.value)}
            className="bg-[#0b0e14] border border-[#a17036]/60 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#f5ba42]"
          >
            {Object.keys(BESTIARY_SRD).map(k => {
              const m = BESTIARY_SRD[k];
              return (
                <option key={k} value={k}>
                  {m.name} (ND {m.cr} • {m.xp} XP • CA {m.ac})
                </option>
              );
            })}
          </select>
          <button
            onClick={handleSpawnMonster}
            className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Monstro
          </button>
        </div>

        <div className="text-xs text-stone-400 font-semibold">
          Inimigos Ativos: <strong className="text-[#f5ba42]">{enemies.length}</strong>
        </div>
      </div>

      {/* Grade de Inimigos Ativos */}
      {enemies.length === 0 ? (
        <div className="bg-[#0e111a] border border-[#231b14] rounded-2xl p-12 text-center space-y-3">
          <Shield className="w-12 h-12 text-[#a17036] mx-auto opacity-60" />
          <h3 className="font-cinzel text-lg font-bold text-[#f5ba42]">Nenhum inimigo ativo no encontro</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Adicione criaturas do bestiário acima para declarar os parâmetros de combate e realizar as rolagens.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enemies.map((enemy) => {
            const hpPercent = Math.max(0, Math.min(100, Math.round((enemy.currentHp / enemy.maxHp) * 100)));
            const hpBarColor =
              hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-rose-600';

            const isDead = enemy.currentHp === 0;

            return (
              <div
                key={enemy.id}
                className={`bg-[#0e111a] border rounded-2xl p-5 shadow-xl transition-all space-y-4 ${
                  isDead ? 'border-rose-950/60 opacity-60' : 'border-[#231b14] hover:border-[#a17036]/60'
                }`}
              >
                {/* Header do Inimigo */}
                <div className="flex items-start justify-between border-b border-[#231b14] pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-cinzel text-base font-bold text-[#f5ba42]">{enemy.name}</h4>
                      {isDead && (
                        <span className="bg-rose-950 text-rose-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-rose-800">
                          Morto
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {enemy.type} • ND {enemy.cr} ({enemy.xp} XP)
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveEnemy(enemy.id)}
                    className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                    title="Remover do Combate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Métricas de Defesa: CA, HP e Sentidos */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold text-stone-200">CA {enemy.ac}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg">
                    <span className="text-stone-400 text-[10px]">Inic:</span>
                    <strong className="text-[#f5ba42]">{enemy.initiativeMod >= 0 ? `+${enemy.initiativeMod}` : enemy.initiativeMod}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg">
                    <span className="text-stone-400 text-[10px]">Perc:</span>
                    <strong className="text-emerald-400">{enemy.passivePerception}</strong>
                  </div>
                </div>

                {/* Barra de Vida do Inimigo */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> Pontos de Vida:
                    </span>
                    <strong className="text-stone-200">{enemy.currentHp} / {enemy.maxHp}</strong>
                  </div>
                  <div className="w-full bg-[#1b1510] h-2 rounded-full overflow-hidden border border-[#2a1f16]">
                    <div className={`h-full ${hpBarColor} transition-all duration-300`} style={{ width: `${hpPercent}%` }} />
                  </div>

                  {/* Controles de Dano do Monstro */}
                  <div className="flex items-center gap-1.5 pt-1.5">
                    <button
                      onClick={() => onApplyDamageEnemy(enemy.id, 1)}
                      className="px-2 py-0.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded text-[10px] font-bold"
                    >
                      -1 Dano
                    </button>
                    <button
                      onClick={() => onApplyDamageEnemy(enemy.id, 5)}
                      className="px-2 py-0.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded text-[10px] font-bold"
                    >
                      -5 Dano
                    </button>
                    <button
                      onClick={() => onHealEnemy(enemy.id, 5)}
                      className="px-2 py-0.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded text-[10px] font-bold"
                    >
                      +5 Cura
                    </button>

                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="number"
                        placeholder="Qtd"
                        value={customEnemyDamage[enemy.id] || ''}
                        onChange={(e) => setCustomEnemyDamage({ ...customEnemyDamage, [enemy.id]: e.target.value })}
                        className="w-12 bg-[#0b0e14] border border-stone-700 rounded px-1.5 py-0.5 text-[10px] text-stone-100 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const val = parseInt(customEnemyDamage[enemy.id]);
                          if (!isNaN(val) && val > 0) {
                            onApplyDamageEnemy(enemy.id, val);
                            setCustomEnemyDamage({ ...customEnemyDamage, [enemy.id]: '' });
                          }
                        }}
                        className="px-1.5 py-0.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-[10px] font-bold"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>

                {/* Salvaguardas Declaradas (Para quando os Heróis lançarem magias) */}
                <div className="pt-2 border-t border-[#231b14] text-[11px]">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Salvaguardas Declaradas (Para Magias):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(enemy.savingThrows).map(([ab, b]) => (
                      <span key={ab} className="bg-[#141824] border border-[#262f44] px-2 py-0.5 rounded text-[10px] font-semibold text-[#f5ba42]">
                        {ab.toUpperCase()} +{b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ataques do Monstro (Com seleção de Herói Alvo) */}
                <div className="pt-2 border-t border-[#231b14] space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Ataques do Inimigo:
                  </span>
                  {enemy.attacks.map((atk, idx) => {
                    const isAttacking = activeAttacker?.enemy.id === enemy.id && activeAttacker?.attackIndex === idx;

                    return (
                      <div key={atk.id} className="space-y-1">
                        <button
                          onClick={() => setActiveAttacker(isAttacking ? null : { enemy, attackIndex: idx })}
                          className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                            isAttacking
                              ? 'bg-[#231b14] border-[#f5ba42] text-[#f5ba42]'
                              : 'bg-[#141824] border-[#262f44] text-stone-200 hover:border-[#a17036]'
                          }`}
                        >
                          <div>
                            <span className="font-bold block">{atk.name}</span>
                            <span className="text-[10px] text-stone-400">
                              +{atk.bonus} p/ acertar • {atk.damage} {atk.damageType}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold bronze-btn px-2 py-0.5 rounded">
                            {isAttacking ? 'Cancelar' : 'Atacar ➔'}
                          </span>
                        </button>

                        {/* Dropdown de Alvos (Heróis) */}
                        {isAttacking && (
                          <div className="bg-[#1b1510] border border-[#a17036] p-2.5 rounded-lg space-y-1.5 animate-in fade-in">
                            <span className="text-[10px] uppercase font-bold text-[#f5ba42] block flex items-center gap-1">
                              <Target className="w-3 h-3" /> Selecione o Herói Alvo:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {characters.map(hero => {
                                const { ac } = calculateArmorClass(hero);
                                return (
                                  <button
                                    key={hero.id}
                                    onClick={() => handleEnemyAttackTarget(enemy, idx, hero)}
                                    className="p-1.5 bg-[#0e111a] hover:bg-[#231b14] border border-stone-700 hover:border-[#f5ba42] rounded text-left transition-colors"
                                  >
                                    <span className="font-bold text-xs text-stone-200 block truncate">{hero.name}</span>
                                    <span className="text-[10px] text-blue-400">CA {ac} • HP {hero.currentHp}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
