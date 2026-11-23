import React, { useState } from 'react';
import { Character, Enemy, DiceRollMode, Coins, Item } from '../../core/types/dnd';
import { BESTIARY_SRD, createEnemyInstance, MonsterRegistry, getMonsterFallbackImage } from '../../core/rules/monsterData';
import {
  calculateArmorClass,
  getAbilityModifier,
  calculateWeaponAttack,
  calculateSpellcastingMetrics,
  formatModifier,
  getProficiencyBonus
} from '../../core/rules/calculations';
import { getClassPortrait, getWeaponImage } from '../../core/rules/srdData';
import {
  Swords,
  Shield,
  Heart,
  Skull,
  Plus,
  Trash2,
  Dices,
  AlertOctagon,
  Target,
  Check,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Coins as CoinsIcon,
  Users,
  Wand2,
  UserCheck
} from 'lucide-react';
import { PendingRoll } from './ManualDiceModal';
import { CustomMonsterModal } from './CustomMonsterModal';
import { TreasureModal } from './TreasureModal';

interface CombatArenaProps {
  characters: Character[];
  enemies: Enemy[];
  diceMode: DiceRollMode;
  onSetDiceMode: (mode: DiceRollMode) => void;
  onApplyDamageHero: (heroId: string, amount: number) => void;
  onHealHero?: (heroId: string, amount: number) => void;
  onApplyDamageEnemy: (enemyId: string, amount: number) => void;
  onHealEnemy: (enemyId: string, amount: number) => void;
  onAddEnemy: (enemy: Enemy) => void;
  onRemoveEnemy: (enemyId: string) => void;
  onRequestManualRoll: (pending: PendingRoll) => void;
  onDistributeCoins?: (coins: Coins) => void;
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

interface HeroAttackAction {
  id: string;
  name: string;
  type: 'arma' | 'magia' | 'desarmado';
  bonus: number;
  damage: string;
  damageType: string;
  range?: string;
  description?: string;
  imageUrl?: string;
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  characters,
  enemies,
  diceMode,
  onSetDiceMode,
  onApplyDamageHero,
  onHealHero,
  onApplyDamageEnemy,
  onHealEnemy,
  onAddEnemy,
  onRemoveEnemy,
  onRequestManualRoll,
  onDistributeCoins,
  onResolveAutoAttack
}) => {
  const [selectedMonsterKey, setSelectedMonsterKey] = useState<string>('Orc');
  const [customEnemyDamage, setCustomEnemyDamage] = useState<{ [id: string]: string }>({});
  const [customHeroDamage, setCustomHeroDamage] = useState<{ [id: string]: string }>({});
  
  // Ataque de Inimigo em Herói
  const [activeEnemyAttacker, setActiveEnemyAttacker] = useState<{ enemy: Enemy; attackIndex: number } | null>(null);

  // Ataque de Herói em Inimigo (NOVO)
  const [activeHeroAttacker, setActiveHeroAttacker] = useState<{
    hero: Character;
    attack: HeroAttackAction;
  } | null>(null);

  // Filtro de Visualização
  const [viewFilter, setViewFilter] = useState<'todos' | 'herois' | 'inimigos'>('todos');

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isTreasureModalOpen, setIsTreasureModalOpen] = useState(false);

  // Turn Tracker State
  const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number>(0);
  const [turnOrder, setTurnOrder] = useState<{
    id: string;
    name: string;
    type: 'hero' | 'enemy';
    initiative: number;
    ac: number;
    hp: number;
    maxHp: number;
  }[]>([]);

  // Extrai as opções de ataque de um herói
  const getHeroAttacks = (hero: Character): HeroAttackAction[] => {
    const attacks: HeroAttackAction[] = [];
    const forMod = getAbilityModifier(hero.baseAbilities.for);
    const desMod = getAbilityModifier(hero.baseAbilities.des);
    const prof = getProficiencyBonus(hero.level);

    // 1. Armas em weapons ou inventory
    const weaponsToUse = hero.weapons.length > 0
      ? hero.weapons
      : hero.inventory.filter(i => i.type === 'arma');

    weaponsToUse.forEach((w, idx) => {
      const calc = calculateWeaponAttack(hero, w);
      attacks.push({
        id: w.id || `wpn_${idx}`,
        name: w.name,
        type: 'arma',
        bonus: calc.attackBonus,
        damage: calc.damageFormula,
        damageType: w.damageType || 'dano',
        description: w.description,
        imageUrl: w.imageUrl || getWeaponImage(w.name || w.id)
      });
    });

    // Fallback: Golpe Desarmado
    if (attacks.length === 0) {
      const isMonk = hero.class.toLowerCase().includes('monge');
      const monkMod = Math.max(forMod, desMod);
      attacks.push({
        id: 'unarmed',
        name: isMonk ? 'Golpe de Artes Marciais' : 'Golpe Desarmado',
        type: 'desarmado',
        bonus: prof + (isMonk ? monkMod : forMod),
        damage: isMonk ? `1d4 ${formatModifier(monkMod)}` : `1 ${formatModifier(forMod)}`,
        damageType: 'concussão',
        description: isMonk ? 'Artes Marciais (Monge)' : 'Desarmado'
      });
    }

    // 2. Magias de ataque / dano se for conjurador
    const spellMetrics = calculateSpellcastingMetrics(hero);
    if (spellMetrics && hero.spells) {
      hero.spells.forEach((sp, idx) => {
        const isOffensive = Boolean(
          sp.damage ||
          sp.description.toLowerCase().includes('ataque mágico') ||
          sp.description.toLowerCase().includes('dano')
        );
        if (isOffensive) {
          attacks.push({
            id: sp.id || `spl_${idx}`,
            name: sp.name.split('(')[0].trim(),
            type: 'magia',
            bonus: spellMetrics.spellAttackBonus,
            damage: sp.damage || '1d8',
            damageType: 'mágico',
            range: sp.range,
            description: `${sp.school} • ${sp.range}`
          });
        }
      });
    }

    return attacks;
  };

  const handleStartCombatRollInitiatives = () => {
    const list: typeof turnOrder = [];

    // Heróis
    characters.forEach(hero => {
      const dexMod = getAbilityModifier(hero.baseAbilities.des);
      const initRoll = Math.floor(Math.random() * 20) + 1 + dexMod;
      const { ac } = calculateArmorClass(hero);
      list.push({
        id: hero.id,
        name: hero.name,
        type: 'hero',
        initiative: initRoll,
        ac,
        hp: hero.currentHp,
        maxHp: hero.maxHp
      });
    });

    // Inimigos
    enemies.forEach(enemy => {
      const initMod = enemy.initiativeMod !== undefined
        ? enemy.initiativeMod
        : Math.max(-2, Math.min(4, Math.floor(enemy.ac / 3) - 3));
      const initRoll = Math.floor(Math.random() * 20) + 1 + initMod;
      list.push({
        id: enemy.id,
        name: enemy.name,
        type: 'enemy',
        initiative: initRoll,
        ac: enemy.ac,
        hp: enemy.currentHp,
        maxHp: enemy.maxHp
      });
    });

    list.sort((a, b) => b.initiative - a.initiative);

    setTurnOrder(list);
    setIsCombatActive(true);
    setRound(1);
    setActiveTurnIdx(0);
  };

  const handleNextTurn = () => {
    if (turnOrder.length === 0) return;
    if (activeTurnIdx >= turnOrder.length - 1) {
      setActiveTurnIdx(0);
      setRound(prev => prev + 1);
    } else {
      setActiveTurnIdx(prev => prev + 1);
    }
  };

  const handlePrevTurn = () => {
    if (turnOrder.length === 0) return;
    if (activeTurnIdx > 0) {
      setActiveTurnIdx(prev => prev - 1);
    }
  };

  const handleEndCombat = () => {
    setIsCombatActive(false);
    setTurnOrder([]);
    setRound(1);
    setActiveTurnIdx(0);
  };

  const availableMonsters = MonsterRegistry.getAllAvailableMonsters();

  const handleSpawnMonster = () => {
    const newEnemy = createEnemyInstance(selectedMonsterKey);
    onAddEnemy(newEnemy);
  };

  // 1. Inimigo Ataca Herói
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

    setActiveEnemyAttacker(null);
  };

  // 2. Herói Ataca Inimigo (NOVO)
  const handleHeroAttackTarget = (
    hero: Character,
    atk: HeroAttackAction,
    targetEnemy: Enemy
  ) => {
    const targetAc = targetEnemy.ac;

    if (diceMode === 'manual') {
      onRequestManualRoll({
        title: `Ataque do Herói: ${hero.name} ➔ ${targetEnemy.name}`,
        subtitle: `${atk.name} (${atk.bonus >= 0 ? `+${atk.bonus}` : atk.bonus} para acertar contra CA ${targetAc})`,
        modifier: atk.bonus,
        targetAc: targetAc,
        damageFormula: atk.damage,
        damageType: atk.damageType,
        onConfirm: (d20, manualDamage) => {
          const total = d20 + atk.bonus;
          const isCrit = d20 === 20;
          const isHit = isCrit || (d20 !== 1 && total >= targetAc);
          if (isHit) {
            const dmg = manualDamage !== undefined ? manualDamage : 6;
            onApplyDamageEnemy(targetEnemy.id, dmg);
          }
        },
        onAutoRoll: () => {
          onResolveAutoAttack({
            attackerName: hero.name,
            targetName: targetEnemy.name,
            targetAc: targetAc,
            atkBonus: atk.bonus,
            damageFormula: atk.damage,
            damageType: atk.damageType,
            targetEnemyId: targetEnemy.id
          });
        }
      });
    } else {
      onResolveAutoAttack({
        attackerName: hero.name,
        targetName: targetEnemy.name,
        targetAc: targetAc,
        atkBonus: atk.bonus,
        damageFormula: atk.damage,
        damageType: atk.damageType,
        targetEnemyId: targetEnemy.id
      });
    }

    setActiveHeroAttacker(null);
  };

  const aliveEnemies = enemies.filter(e => e.currentHp > 0);
  const aliveHeroes = characters.filter(h => h.currentHp > 0);

  return (
    <div className="space-y-6 text-stone-200">
      {/* 1. TOP BANNER & CONTROLES GERAIS DE COMBATE */}
      <div className="bg-[#0e111a] border border-[#231b14] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold gold-gradient-text flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#f5ba42]" />
            ARENA DE COMBATE & BATALHA BIDIRECIONAL
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Combate interativo com regras oficiais de D&D 5e: monstros atacam heróis e heróis atacam monstros com rolagem manual ou automática.
          </p>
        </div>

        {/* Ações Rápidas: Iniciativa, Tesouro e Modo de Rolagem */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTreasureModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#221a10] hover:bg-[#2b2115] text-[#f5ba42] border border-[#a17036] flex items-center gap-1.5 shadow"
            title="Gerar Saque do Encontro com base no ND dos monstros"
          >
            <CoinsIcon className="w-3.5 h-3.5 text-[#f5ba42]" />
            <span>Saque / Tesouro</span>
          </button>

          {!isCombatActive ? (
            <button
              onClick={handleStartCombatRollInitiatives}
              disabled={characters.length === 0}
              className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-1.5 shadow disabled:opacity-50"
              title="Rolar iniciativa para todos os heróis e inimigos"
            >
              <Swords className="w-3.5 h-3.5 text-[#f5ba42]" />
              <span>Rolar Iniciativas & Iniciar</span>
            </button>
          ) : (
            <button
              onClick={handleEndCombat}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#241316] hover:bg-[#331b20] text-rose-300 border border-rose-800 flex items-center gap-1.5 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Encerrar Combate</span>
            </button>
          )}

          {/* Toggle de Modo de Rolagem */}
          <div className="flex items-center gap-1 bg-[#141824] p-1 rounded-xl border border-[#262f44]">
            <button
              onClick={() => onSetDiceMode('automatico')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                diceMode === 'automatico'
                  ? 'bg-[#f5ba42] text-stone-950 shadow font-extrabold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⚡ Auto
            </button>
            <button
              onClick={() => onSetDiceMode('manual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                diceMode === 'manual'
                  ? 'bronze-btn text-[#f5ba42] shadow font-extrabold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🎲 Manual
            </button>
          </div>
        </div>
      </div>

      {/* 2. PAINEL DE INICIATIVA E RASTREADOR DE TURNOS */}
      {isCombatActive && turnOrder.length > 0 && (
        <div className="bg-[#121522] border-2 border-[#a17036] rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232b40] pb-3">
            <div className="flex items-center gap-3">
              <span className="font-cinzel text-xs font-black uppercase tracking-widest bg-amber-500 text-stone-950 px-2.5 py-1 rounded-md shadow">
                RODADA {round}
              </span>

              {turnOrder[activeTurnIdx] && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">Vez de:</span>
                  <span className={`font-cinzel text-sm sm:text-base font-extrabold flex items-center gap-1.5 ${
                    turnOrder[activeTurnIdx].type === 'hero' ? 'text-sky-300' : 'text-rose-400'
                  }`}>
                    {turnOrder[activeTurnIdx].name}
                    {turnOrder[activeTurnIdx].type === 'hero' && (
                      <span className="bg-sky-950/80 text-sky-300 text-[10px] px-2 py-0.5 rounded-full border border-sky-700 font-sans">
                        Herói
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] bg-[#1a2133] border border-[#2d3a5a] text-stone-300 px-2 py-0.5 rounded-full font-mono">
                    CA {turnOrder[activeTurnIdx].ac}
                  </span>
                  <span className="text-[10px] bg-[#1a2133] border border-[#2d3a5a] text-stone-300 px-2 py-0.5 rounded-full font-mono">
                    HP: {turnOrder[activeTurnIdx].hp}/{turnOrder[activeTurnIdx].maxHp}
                  </span>
                </div>
              )}
            </div>

            {/* Controles de Próximo / Anterior Turno */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevTurn}
                disabled={activeTurnIdx === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#1a2133] hover:bg-[#242e47] text-stone-300 disabled:opacity-40 border border-[#2d3a5a] flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>
              <button
                onClick={handleNextTurn}
                className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-1.5 shadow"
              >
                <span>Próximo Turno</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fila Horizontal de Combatentes em Ordem de Iniciativa */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {turnOrder.map((c, idx) => {
              const isActive = idx === activeTurnIdx;
              const isHero = c.type === 'hero';
              return (
                <div
                  key={c.id + idx}
                  onClick={() => setActiveTurnIdx(idx)}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#1e273d] border-[#f5ba42] ring-2 ring-amber-500/40 shadow-lg scale-105'
                      : 'bg-[#10131d] border-[#222a3d] hover:border-stone-500 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#1e1710] border border-[#a17036] text-[#f5ba42] font-black text-xs flex items-center justify-center font-cinzel">
                    {c.initiative}
                  </span>

                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-bold truncate max-w-[110px] ${
                      isHero ? 'text-sky-200' : 'text-rose-200'
                    }`}>
                      {c.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-stone-400 uppercase font-semibold">
                      {isHero ? 'Herói' : 'Inimigo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. FILTRO DE VISUALIZAÇÃO DA ARENA */}
      <div className="flex items-center justify-between border-b border-[#231b14] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewFilter === 'todos'
                ? 'bg-[#231b14] border border-[#f5ba42] text-[#f5ba42] shadow'
                : 'bg-[#121622] border border-[#262f44] text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-[#f5ba42]" />
            <span>Todos os Combatentes</span>
          </button>

          <button
            onClick={() => setViewFilter('herois')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewFilter === 'herois'
                ? 'bg-[#122338] border border-sky-400 text-sky-300 shadow'
                : 'bg-[#121622] border border-[#262f44] text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Heróis ({characters.length})</span>
          </button>

          <button
            onClick={() => setViewFilter('inimigos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              viewFilter === 'inimigos'
                ? 'bg-[#281318] border border-rose-500 text-rose-300 shadow'
                : 'bg-[#121622] border border-[#262f44] text-stone-400 hover:text-stone-200'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            <span>Inimigos ({enemies.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-stone-400 hidden sm:inline">
          {aliveHeroes.length} heróis vivos • {aliveEnemies.length} monstros ativos
        </span>
      </div>

      {/* 4. SEÇÃO: GRUPO DE AVENTUREIROS (HERÓIS ATACAM OS MONSTROS) */}
      {(viewFilter === 'todos' || viewFilter === 'herois') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-base font-bold text-sky-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              HERÓIS DO GRUPO ({characters.length})
            </h3>
            <span className="text-xs text-stone-400">
              Ataque com armas equipadas ou magias ofensivas clicando em <strong className="text-amber-400">"Atacar Inimigo ➔"</strong>
            </span>
          </div>

          {characters.length === 0 ? (
            <div className="bg-[#0e111a] border border-[#231b14] rounded-2xl p-8 text-center text-stone-400 text-xs">
              Nenhum herói cadastrado no grupo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {characters.map((hero) => {
                const { ac } = calculateArmorClass(hero);
                const hpPercent = Math.max(0, Math.min(100, Math.round((hero.currentHp / hero.maxHp) * 100)));
                const hpBarColor =
                  hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-rose-600';
                const isDown = hero.currentHp === 0;
                const attacks = getHeroAttacks(hero);

                const isCurrentTurnHero =
                  isCombatActive &&
                  turnOrder[activeTurnIdx]?.id === hero.id &&
                  turnOrder[activeTurnIdx]?.type === 'hero';

                return (
                  <div
                    key={hero.id}
                    className={`bg-[#0e111a] border rounded-2xl p-5 shadow-xl transition-all space-y-4 relative ${
                      isCurrentTurnHero
                        ? 'border-[#f5ba42] ring-2 ring-amber-500/50 shadow-amber-950/50 bg-gradient-to-b from-[#141b2c] to-[#0e111a]'
                        : isDown
                        ? 'border-rose-950/70 opacity-60'
                        : 'border-[#262f44] hover:border-sky-500/60'
                    }`}
                  >
                    {isCurrentTurnHero && (
                      <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> VEZ DESTE HERÓI AGIR!
                      </div>
                    )}

                    {/* Header do Herói */}
                    <div className="flex items-start gap-3 border-b border-[#231b14] pb-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-md shrink-0 bg-black/60">
                        <img
                          src={hero.avatarUrl || getClassPortrait(hero.class, hero.gender)}
                          alt={hero.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-cinzel text-sm sm:text-base font-bold text-sky-200 truncate" title={hero.name}>
                          {hero.name}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] text-stone-400 truncate">
                            {hero.race} • {hero.class} ({hero.level}º Nível)
                          </span>
                          {isDown && (
                            <span className="bg-rose-950 text-rose-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-rose-800">
                              Inconsciente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Defesa e Sentidos do Herói */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-stone-200">CA {ac}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg">
                        <span className="text-stone-400 text-[10px]">Inic:</span>
                        <strong className="text-amber-400">{formatModifier(getAbilityModifier(hero.baseAbilities.des))}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] px-2.5 py-1 rounded-lg">
                        <span className="text-stone-400 text-[10px]">Desl:</span>
                        <strong className="text-emerald-400">{hero.speed}m</strong>
                      </div>
                    </div>

                    {/* Barra de Vida do Herói e Controles */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-300 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> Pontos de Vida:
                        </span>
                        <strong className="text-stone-200">{hero.currentHp} / {hero.maxHp}</strong>
                      </div>
                      <div className="w-full bg-[#1b1510] h-2 rounded-full overflow-hidden border border-[#2a1f16]">
                        <div className={`h-full ${hpBarColor} transition-all duration-300`} style={{ width: `${hpPercent}%` }} />
                      </div>

                      {/* Ajuste rápido de PV */}
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <button
                          onClick={() => onApplyDamageHero(hero.id, 1)}
                          className="px-2 py-0.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded text-[10px] font-bold"
                        >
                          -1 Dano
                        </button>
                        <button
                          onClick={() => onApplyDamageHero(hero.id, 5)}
                          className="px-2 py-0.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded text-[10px] font-bold"
                        >
                          -5 Dano
                        </button>
                        <button
                          onClick={() => onHealHero?.(hero.id, 5)}
                          className="px-2 py-0.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded text-[10px] font-bold"
                        >
                          +5 Cura
                        </button>

                        <div className="flex items-center gap-1 ml-auto">
                          <input
                            type="number"
                            placeholder="Qtd"
                            value={customHeroDamage[hero.id] || ''}
                            onChange={(e) => setCustomHeroDamage({ ...customHeroDamage, [hero.id]: e.target.value })}
                            className="w-12 bg-[#0b0e14] border border-stone-700 rounded px-1.5 py-0.5 text-[10px] text-stone-100 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const val = parseInt(customHeroDamage[hero.id]);
                              if (!isNaN(val) && val > 0) {
                                onApplyDamageHero(hero.id, val);
                                setCustomHeroDamage({ ...customHeroDamage, [hero.id]: '' });
                              }
                            }}
                            className="px-1.5 py-0.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-[10px] font-bold"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ATAQUES DO HERÓI (ARMAS & MAGIAS CONTRA INIMIGOS) */}
                    <div className="pt-2 border-t border-[#231b14] space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-sky-400 block flex items-center justify-between">
                        <span>Ações de Ataque do Herói:</span>
                        <span className="text-stone-400 text-[9px]">Selecione p/ Atacar Monstro</span>
                      </span>

                      {attacks.map((atk) => {
                        const isAttackingThis =
                          activeHeroAttacker?.hero.id === hero.id &&
                          activeHeroAttacker?.attack.id === atk.id;

                        return (
                          <div key={atk.id} className="space-y-1">
                            <button
                              disabled={isDown || aliveEnemies.length === 0}
                              onClick={() => {
                                setActiveHeroAttacker(isAttackingThis ? null : { hero, attack: atk });
                              }}
                              className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
                                isAttackingThis
                                  ? 'bg-[#1e273d] border-sky-400 text-sky-300'
                                  : 'bg-[#141824] border-[#262f44] text-stone-200 hover:border-sky-500'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {atk.imageUrl ? (
                                  <img
                                    src={atk.imageUrl}
                                    alt={atk.name}
                                    className="w-8 h-8 rounded object-cover border border-[#262f44] shrink-0 bg-black/60 shadow-sm"
                                  />
                                ) : (
                                  <span className="p-1.5 rounded bg-black/40 border border-[#262f44] shrink-0">
                                    {atk.type === 'magia' ? (
                                      <Wand2 className="w-4 h-4 text-purple-400" />
                                    ) : (
                                      <Swords className="w-4 h-4 text-amber-400" />
                                    )}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold block text-xs truncate">
                                    {atk.name}
                                  </span>
                                  <span className="text-[10px] text-stone-400 block truncate">
                                    {formatModifier(atk.bonus)} p/ acertar • {atk.damage} {atk.damageType}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold bg-[#1e2b44] text-sky-300 hover:bg-sky-600 hover:text-white px-2.5 py-1 rounded-lg border border-sky-500/50 flex items-center gap-1 transition-colors">
                                {isAttackingThis ? 'Cancelar' : 'Atacar Monstro ➔'}
                              </span>
                            </button>

                            {/* Dropdown de Alvos (Monstros Ativos) */}
                            {isAttackingThis && (
                              <div className="bg-[#101524] border border-sky-400/80 p-2.5 rounded-xl space-y-2 animate-in fade-in">
                                <span className="text-[10px] uppercase font-bold text-sky-300 block flex items-center gap-1">
                                  <Target className="w-3 h-3 text-sky-400" /> Escolha o Monstro Alvo:
                                </span>
                                {aliveEnemies.length === 0 ? (
                                  <p className="text-[11px] text-stone-400 italic">Nenhum monstro vivo para atacar.</p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {aliveEnemies.map(enemy => (
                                      <button
                                        key={enemy.id}
                                        onClick={() => handleHeroAttackTarget(hero, atk, enemy)}
                                        className="p-1.5 bg-[#0e111a] hover:bg-[#1a2235] border border-stone-700 hover:border-sky-400 rounded-lg text-left transition-colors flex flex-col justify-between"
                                      >
                                        <span className="font-bold text-xs text-stone-200 truncate">{enemy.name}</span>
                                        <span className="text-[10px] text-rose-400">CA {enemy.ac} • HP {enemy.currentHp}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
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
      )}

      {/* 5. SEÇÃO: ENCONTRO DE INIMIGOS (MONSTROS ATIVOS) */}
      {(viewFilter === 'todos' || viewFilter === 'inimigos') && (
        <div className="space-y-4">
          {/* Spawner de Inimigos do Bestiário SRD & Criador */}
          <div className="bg-[#121622] border border-[#231b14] rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#f5ba42]" /> Inserir Monstro:
              </span>
              <select
                value={selectedMonsterKey}
                onChange={(e) => setSelectedMonsterKey(e.target.value)}
                className="bg-[#0b0e14] border border-[#a17036]/60 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#f5ba42] max-w-[280px]"
              >
                {Object.keys(availableMonsters).map(k => {
                  const m = availableMonsters[k];
                  return (
                    <option key={k} value={k}>
                      {m.name} (ND {m.cr} • {m.xp} XP • CA {m.ac})
                    </option>
                  );
                })}
              </select>
              <button
                onClick={handleSpawnMonster}
                className="bronze-btn px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Inserir
              </button>

              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="glass-btn px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border-[#a17036] text-[#f5ba42] shadow"
              >
                <BookOpen className="w-4 h-4 text-[#f5ba42]" />
                Livro de Monstros Completo & Criar Criatura
              </button>
            </div>

            <div className="text-xs text-stone-400 font-semibold">
              Inimigos no Encontro: <strong className="text-[#f5ba42]">{enemies.length}</strong>
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
                const monsterImg = enemy.imageUrl || getMonsterFallbackImage(enemy.name, enemy.type);

                return (
                  <div
                    key={enemy.id}
                    className={`bg-[#0e111a] border rounded-2xl p-5 shadow-xl transition-all space-y-4 group ${
                      isDead ? 'border-rose-950/60 opacity-60' : 'border-[#231b14] hover:border-[#a17036]'
                    }`}
                  >
                    {/* Header do Inimigo com Ilustração Oficial */}
                    <div className="flex items-start gap-3 border-b border-[#231b14] pb-3">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#a17036] shadow-md shrink-0 bg-black/60 group-hover:border-[#f5ba42] transition-colors">
                        <img
                          src={monsterImg}
                          alt={enemy.name}
                          className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/monsters/orc.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-[#f5ba42] drop-shadow">
                          ND {enemy.cr}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-cinzel text-sm sm:text-base font-bold text-[#f5ba42] truncate tracking-wide" title={enemy.name}>
                            {enemy.name}
                          </h4>
                          <button
                            onClick={() => onRemoveEnemy(enemy.id)}
                            className="text-stone-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                            title="Remover do Combate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] text-stone-400 truncate">
                            {enemy.type} • {enemy.xp} XP
                          </span>
                          {isDead && (
                            <span className="bg-rose-950 text-rose-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-rose-800 animate-pulse">
                              Morto
                            </span>
                          )}
                        </div>
                      </div>
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

                    {/* Salvaguardas Declaradas */}
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
                        const isAttacking = activeEnemyAttacker?.enemy.id === enemy.id && activeEnemyAttacker?.attackIndex === idx;

                        return (
                          <div key={atk.id} className="space-y-1">
                            <button
                              disabled={isDead || aliveHeroes.length === 0}
                              onClick={() => setActiveEnemyAttacker(isAttacking ? null : { enemy, attackIndex: idx })}
                              className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
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
                                {isAttacking ? 'Cancelar' : 'Atacar Herói ➔'}
                              </span>
                            </button>

                            {/* Dropdown de Alvos (Heróis) */}
                            {isAttacking && (
                              <div className="bg-[#1b1510] border border-[#a17036] p-2.5 rounded-lg space-y-1.5 animate-in fade-in">
                                <span className="text-[10px] uppercase font-bold text-[#f5ba42] block flex items-center gap-1">
                                  <Target className="w-3 h-3" /> Selecione o Herói Alvo:
                                </span>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {aliveHeroes.map(hero => {
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
      )}

      {/* Modais de Criador e Saque */}
      <CustomMonsterModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddEnemyToCombat={onAddEnemy}
      />

      <TreasureModal
        isOpen={isTreasureModalOpen}
        onClose={() => setIsTreasureModalOpen(false)}
        characters={characters}
        suggestedCr={Math.max(1, Math.round(enemies.reduce((acc, e) => acc + (typeof e.cr === 'number' ? e.cr : 1), 0)))}
        onDistributeCoins={(coins) => {
          onDistributeCoins?.(coins);
        }}
      />
    </div>
  );
};
