import React, { useState, useEffect, useRef } from 'react';
import { Character, Condition, Enemy, DiceRollMode, SkillName, AbilityName } from './core/types/dnd';
import { SessionManager } from './core/state/sessionManager';
import { CharacterCard } from './components/sheet/CharacterCard';
import { ParchmentCharacterSheet } from './components/sheet/ParchmentCharacterSheet';
import { CombatArena } from './components/combat/CombatArena';
import { ManualDiceModal, PendingRoll } from './components/combat/ManualDiceModal';
import { PartyAnalysisView } from './components/party/PartyAnalysisView';
import { GeminiHub } from './components/gemini/GeminiHub';
import { CharacterCreator } from './components/creator/CharacterCreator';
import { calculatePartyEncounterThresholds } from './core/analysis/encounterAnalysis';
import { getSkillModifier, getSavingThrowModifier, getAbilityModifier, SKILL_ABILITY_MAP } from './core/rules/calculations';
import { Shield, Sparkles, BarChart3, UserPlus, Moon, Download, Upload, Dices, Play, Swords } from 'lucide-react';

export const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(() => SessionManager.getCharacters());
  const [enemies, setEnemies] = useState<Enemy[]>(() => SessionManager.getEnemies());
  const [diceMode, setDiceMode] = useState<DiceRollMode>(() => SessionManager.getDiceMode());
  const [pendingManualRoll, setPendingManualRoll] = useState<PendingRoll | null>(null);

  const [activeTab, setActiveTab] = useState<'sheet' | 'parchment' | 'combat' | 'analysis' | 'gemini' | 'create'>('sheet');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(() => characters[0]?.id || '');
  const [eventLog, setEventLog] = useState<string | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<{
    charName: string;
    checkName: string;
    breakdown: string;
    total: number;
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SessionManager.saveCharacters(characters);
    if (!selectedCharacterId && characters.length > 0) {
      setSelectedCharacterId(characters[0].id);
    }
  }, [characters]);

  useEffect(() => {
    SessionManager.saveEnemies(enemies);
  }, [enemies]);

  useEffect(() => {
    SessionManager.setDiceMode(diceMode);
  }, [diceMode]);

  const showNotification = (msg: string) => {
    setEventLog(msg);
    setTimeout(() => setEventLog(null), 4500);
  };

  const scrollToContent = (tab: 'sheet' | 'parchment' | 'combat' | 'analysis' | 'gemini' | 'create') => {
    setActiveTab(tab);
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyDamage = (id: string, amount: number) => {
    const { updatedCharacters, log } = SessionManager.applyDamage(characters, id, amount);
    setCharacters(updatedCharacters);
    showNotification(log);
  };

  const handleHeal = (id: string, amount: number) => {
    const { updatedCharacters, log } = SessionManager.healCharacter(characters, id, amount);
    setCharacters(updatedCharacters);
    showNotification(log);
  };

  const handleApplyDamageEnemy = (enemyId: string, amount: number) => {
    const { updatedEnemies, log } = SessionManager.applyEnemyDamage(enemies, enemyId, amount);
    setEnemies(updatedEnemies);
    showNotification(log);
  };

  const handleHealEnemy = (enemyId: string, amount: number) => {
    const { updatedEnemies, log } = SessionManager.healEnemy(enemies, enemyId, amount);
    setEnemies(updatedEnemies);
    showNotification(log);
  };

  const handleAddEnemy = (enemy: Enemy) => {
    setEnemies(prev => [...prev, enemy]);
    showNotification(`Inimigo '${enemy.name}' adicionado ao combate!`);
  };

  const handleRemoveEnemy = (enemyId: string) => {
    setEnemies(prev => prev.filter(e => e.id !== enemyId));
    showNotification('Inimigo removido do combate.');
  };

  const handleSpendSlot = (id: string, level: number) => {
    const { updatedCharacters, log } = SessionManager.spendSpellSlot(characters, id, level);
    setCharacters(updatedCharacters);
    showNotification(log);
  };

  const handleRestoreSlot = (id: string, level: number) => {
    const { updatedCharacters, log } = SessionManager.restoreSpellSlot(characters, id, level);
    setCharacters(updatedCharacters);
    showNotification(log);
  };

  const handleToggleCondition = (id: string, cond: Condition) => {
    const { updatedCharacters, log } = SessionManager.toggleCondition(characters, id, cond);
    setCharacters(updatedCharacters);
    showNotification(log);
  };

  const handleToggleInspiration = (id: string) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, hasInspiration: !c.hasInspiration } : c));
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    showNotification('Personagem removido do grupo.');
  };

  const handleAddCharacter = (newChar: Character) => {
    setCharacters(prev => [...prev, newChar]);
    setActiveTab('sheet');
    showNotification(`Personagem '${newChar.name}' adicionado com sucesso!`);
  };

  const handleLongRest = () => {
    if (confirm('Deseja realizar um DESCANSO LONGO para todo o grupo? Todos os HPs e espaços de magia serão restaurados.')) {
      const { updatedCharacters, log } = SessionManager.performLongRest(characters);
      setCharacters(updatedCharacters);
      showNotification(log);
    }
  };

  const handleRollCheck = (char: Character, name: string, mode: 'normal' | 'vantagem' | 'desvantagem') => {
    const checkKey = name.toLowerCase().replace(/\s+/g, '_') as SkillName;
    let modifier = 0;
    if (SKILL_ABILITY_MAP[checkKey]) {
      modifier = getSkillModifier(char, checkKey);
    } else if (['for', 'des', 'con', 'int', 'sab', 'car'].includes(checkKey)) {
      modifier = getSavingThrowModifier(char, checkKey as AbilityName);
    } else {
      modifier = getAbilityModifier(char.baseAbilities.for);
    }

    if (diceMode === 'manual') {
      setPendingManualRoll({
        title: `${char.name} — Teste de ${name.toUpperCase()}`,
        subtitle: `Bônus da Ficha: ${modifier >= 0 ? `+${modifier}` : modifier}`,
        modifier,
        onConfirm: (manualD20) => {
          const result = SessionManager.rollCheck(char, name, mode, manualD20);
          setLastDiceRoll({
            charName: char.name,
            checkName: name.toUpperCase(),
            breakdown: result.breakdown,
            total: result.total
          });
          showNotification(`🎲 [ROLAGEM FÍSICA] ${char.name} (${name}): ${result.breakdown}`);
        },
        onAutoRoll: () => {
          const result = SessionManager.rollCheck(char, name, mode);
          setLastDiceRoll({
            charName: char.name,
            checkName: name.toUpperCase(),
            breakdown: result.breakdown,
            total: result.total
          });
          showNotification(`🎲 [ROLAGEM AUTO] ${char.name} (${name}): ${result.breakdown}`);
        }
      });
    } else {
      const result = SessionManager.rollCheck(char, name, mode);
      setLastDiceRoll({
        charName: char.name,
        checkName: name.toUpperCase(),
        breakdown: result.breakdown,
        total: result.total
      });
      showNotification(`🎲 [ROLAGEM AUTO] ${char.name} (${name}): ${result.breakdown}`);
    }
  };

  const handleResolveAutoAttack = (params: {
    attackerName: string;
    targetName: string;
    targetAc: number;
    atkBonus: number;
    damageFormula: string;
    damageType: string;
    targetHeroId?: string;
    targetEnemyId?: string;
  }) => {
    const outcome = SessionManager.resolveAttack({
      attackerName: params.attackerName,
      targetName: params.targetName,
      targetAc: params.targetAc,
      atkBonus: params.atkBonus,
      damageFormula: params.damageFormula,
      damageType: params.damageType
    });

    if (outcome.isHit && outcome.damage > 0) {
      if (params.targetHeroId) {
        handleApplyDamage(params.targetHeroId, outcome.damage);
      } else if (params.targetEnemyId) {
        handleApplyDamageEnemy(params.targetEnemyId, outcome.damage);
      }
    }

    setLastDiceRoll({
      charName: params.attackerName,
      checkName: 'ATAQUE',
      breakdown: `d20 (${outcome.d20}) + ${params.atkBonus} = ${outcome.totalAtk} vs CA ${params.targetAc}`,
      total: outcome.totalAtk
    });

    showNotification(outcome.log);
  };

  const handleExportJson = () => {
    const exportData = {
      characters,
      enemies,
      diceMode,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dungeons_realms_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.characters && Array.isArray(parsed.characters)) {
          setCharacters(parsed.characters);
          if (parsed.enemies && Array.isArray(parsed.enemies)) setEnemies(parsed.enemies);
          if (parsed.diceMode) setDiceMode(parsed.diceMode);
          showNotification('Dados da campanha importados com sucesso!');
        } else if (Array.isArray(parsed)) {
          setCharacters(parsed);
          showNotification('Grupo importado com sucesso!');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao carregar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const thresholds = calculatePartyEncounterThresholds(characters);

  return (
    <div className="min-h-screen bg-[#08090d] text-stone-200 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar inspirada no template REALMS */}
      <header className="border-b border-[#231b14]/90 bg-[#08090d]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo REALMS */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex flex-col">
              <span className="font-cinzel text-xl sm:text-2xl font-black tracking-[0.25em] gold-gradient-text leading-none">
                REALMS
              </span>
              <span className="text-[8px] sm:text-[9px] gold-subtitle uppercase tracking-[0.25em] mt-1 flex items-center gap-1 font-semibold">
                <span>◇</span> DUNGEONS & GEMINI <span>◇</span>
              </span>
            </div>
          </div>

          {/* Navigation Links estilo template */}
          <nav className="hidden md:flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em]">
            <button
              onClick={() => scrollToContent('sheet')}
              className={`transition-colors py-1 ${activeTab === 'sheet' ? 'text-[#f5ba42] border-b-2 border-[#f5ba42]' : 'text-stone-400 hover:text-stone-100'}`}
            >
              Mesa de Jogo
            </button>
            <button
              onClick={() => scrollToContent('parchment')}
              className={`transition-colors py-1 ${activeTab === 'parchment' ? 'text-[#f5ba42] border-b-2 border-[#f5ba42]' : 'text-stone-400 hover:text-stone-100'}`}
            >
              📜 Ficha Pergaminho
            </button>
            <button
              onClick={() => scrollToContent('combat')}
              className={`transition-colors py-1 flex items-center gap-1 ${activeTab === 'combat' ? 'text-[#f5ba42] border-b-2 border-[#f5ba42]' : 'text-stone-400 hover:text-stone-100'}`}
            >
              <Swords className="w-3.5 h-3.5 text-rose-500" />
              Arena ({enemies.length})
            </button>
            <button
              onClick={() => scrollToContent('analysis')}
              className={`transition-colors py-1 ${activeTab === 'analysis' ? 'text-[#f5ba42] border-b-2 border-[#f5ba42]' : 'text-stone-400 hover:text-stone-100'}`}
            >
              Análise DMG
            </button>
            <button
              onClick={() => scrollToContent('gemini')}
              className={`transition-colors py-1 ${activeTab === 'gemini' ? 'text-[#f5ba42] border-b-2 border-[#f5ba42]' : 'text-stone-400 hover:text-stone-100'}`}
            >
              Central Gemini
            </button>
            <button
              onClick={() => scrollToContent('create')}
              className={`transition-colors py-1 ${activeTab === 'create' ? 'text-[#f5ba42] border-b-2 border-[#f5ba42]' : 'text-stone-400 hover:text-stone-100'}`}
            >
              + Herói
            </button>
          </nav>

          {/* Right Action: Toggle de Modo de Dados & Descanso Longo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Toggle de Dados */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#141824] px-2.5 py-1 rounded-full border border-[#262f44]">
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">🎲 Dados:</span>
              <button
                onClick={() => setDiceMode(diceMode === 'automatico' ? 'manual' : 'automatico')}
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full transition-all ${
                  diceMode === 'manual'
                    ? 'bronze-btn text-[#f5ba42] shadow font-extrabold'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
                title="Clique para alternar entre rolagem manual física e automática do software"
              >
                {diceMode === 'manual' ? '🎲 Manual (Eu Rolo)' : '⚡ Automático'}
              </button>
            </div>

            <button
              onClick={handleLongRest}
              className="bronze-btn rounded-md px-3.5 py-1.5 text-[10px] sm:text-xs tracking-[0.16em] flex items-center gap-1.5"
              title="Descanso Longo para todo o grupo"
            >
              <Moon className="w-3.5 h-3.5 text-[#f5ba42]" />
              <span className="hidden sm:inline">DESCANSO LONGO</span>
              <span className="sm:hidden">DESCANSO</span>
            </button>

            <button
              onClick={handleExportJson}
              title="Exportar Campanha (Heróis e Inimigos) em JSON"
              className="p-1.5 bg-[#141824] hover:bg-[#1c2233] border border-[#2b334a] text-stone-300 rounded-md text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              title="Importar Campanha de arquivo JSON"
              className="p-1.5 bg-[#141824] hover:bg-[#1c2233] border border-[#2b334a] text-stone-300 rounded-md text-xs cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </header>

      {/* Modal de Rolagem Manual (Se ativado) */}
      <ManualDiceModal
        pendingRoll={pendingManualRoll}
        onClose={() => setPendingManualRoll(null)}
      />

      {/* Floating Notification */}
      {eventLog && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16120e] border border-[#a17036] text-[#f5ba42] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce max-w-md">
          <Sparkles className="w-4 h-4 text-[#f5ba42] shrink-0" />
          <span>{eventLog}</span>
        </div>
      )}

      {/* Box de Última Rolagem */}
      {lastDiceRoll && (
        <div className="bg-[#0e111a] border-b border-[#231b14] py-1.5 px-4 text-xs flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-stone-400 font-medium">
            <Dices className="w-3.5 h-3.5 text-[#f5ba42]" /> Último Teste:
          </span>
          <span className="font-semibold text-stone-200">{lastDiceRoll.charName} ({lastDiceRoll.checkName})</span>
          <span className="text-[#f5ba42] font-bold bg-[#1b1510] px-2.5 py-0.5 rounded border border-[#a17036]/60">
            {lastDiceRoll.breakdown}
          </span>
        </div>
      )}

      {/* HERO SECTION estilo imagem template_estilo.png */}
      <section className="relative w-full overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8 pt-16 pb-10 bg-center bg-cover border-b border-[#231b14]"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(8, 9, 13, 0.45) 0%, rgba(8, 9, 13, 0.75) 60%, #08090d 100%), url('/hero-bg.png')`
        }}
      >
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="font-cinzel font-black tracking-[0.28em] text-5xl sm:text-7xl gold-gradient-text uppercase leading-none drop-shadow-2xl">
            REALMS
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold gold-subtitle">
            <span>◇</span> FANTASY REALMS & GEMINI PRO <span>◇</span>
          </div>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-light px-2 drop-shadow">
            Em um reino de fantasia e perigos ancestrais, onde feras míticas espreitam e mistérios arcanos aguardam, o Gemini Pro conduz sua narrativa heroica enquanto as regras determinísticas de D&D 5e guardam o destino dos seus aventureiros.
          </p>

          {/* Botões Centrais idênticos ao template */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => scrollToContent('sheet')}
              className="bronze-btn rounded-full px-8 py-3 text-xs tracking-[0.2em] font-bold shadow-xl flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-[#f5ba42]" />
              MESA DE JOGO
            </button>

            <button
              onClick={() => scrollToContent('combat')}
              className="glass-btn rounded-full px-8 py-3 text-xs tracking-[0.2em] font-bold shadow-xl flex items-center gap-2"
            >
              <Swords className="w-4 h-4 text-rose-400" />
              ARENA DE COMBATE
            </button>

            <button
              onClick={() => scrollToContent('gemini')}
              className="glass-btn rounded-full px-8 py-3 text-xs tracking-[0.2em] font-bold shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#f5ba42]" />
              CENTRAL GEMINI PRO
            </button>
          </div>
        </div>

        {/* Barra inferior de "Events" / Métricas do Grupo */}
        <div className="w-full max-w-5xl mx-auto pt-12 relative z-10">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#a17036]/50 to-transparent mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => scrollToContent('combat')}>
              <span className="bg-[#19130d] border border-[#a17036]/70 text-[#f5ba42] text-[10px] font-bold tracking-widest uppercase px-3 py-0.5 rounded-full mb-2">
                Combate Transparente
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">{enemies.length} Inimigos Declarados</span>
              <span className="text-[11px] text-[#f5ba42] font-bold mt-0.5">Modo: {diceMode === 'manual' ? '🎲 Manual (Sem Viés)' : '⚡ Automático'}</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => scrollToContent('gemini')}>
              <span className="bg-[#19130d] border border-[#a17036]/70 text-[#f5ba42] text-[10px] font-bold tracking-widest uppercase px-3 py-0.5 rounded-full mb-2">
                Mestre IA Imparcial
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">Gemini Pro Calibrado</span>
              <span className="text-[11px] text-emerald-400 font-bold mt-0.5">Diretriz de Dados Ativa</span>
            </div>

            <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => scrollToContent('parchment')}>
              <span className="bg-[#19130d] border border-[#a17036]/70 text-[#f5ba42] text-[10px] font-bold tracking-widest uppercase px-3 py-0.5 rounded-full mb-2">
                Ficha Pergaminho
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">{characters.length} Heróis no Grupo</span>
              <span className="text-[11px] text-stone-400 mt-0.5">Estilo Kelanyah Tanares 5e</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal com Ref para Scroll */}
      <div ref={contentRef} className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Sub-Navegação de Abas em Telas Menores */}
        <div className="md:hidden flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${activeTab === 'sheet' ? 'bronze-btn' : 'bg-[#141824] text-stone-400'}`}
          >
            Mesa
          </button>
          <button
            onClick={() => setActiveTab('parchment')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${activeTab === 'parchment' ? 'bronze-btn' : 'bg-[#141824] text-stone-400'}`}
          >
            📜 Ficha
          </button>
          <button
            onClick={() => setActiveTab('combat')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${activeTab === 'combat' ? 'bronze-btn' : 'bg-[#141824] text-stone-400'}`}
          >
            ⚔️ Arena ({enemies.length})
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${activeTab === 'analysis' ? 'bronze-btn' : 'bg-[#141824] text-stone-400'}`}
          >
            Análise DMG
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${activeTab === 'gemini' ? 'bronze-btn' : 'bg-[#141824] text-stone-400'}`}
          >
            Gemini Pro
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${activeTab === 'create' ? 'bronze-btn' : 'bg-[#141824] text-stone-400'}`}
          >
            + Herói
          </button>
        </div>

        {/* 1. ABA: MESA DE JOGO (CARDS) */}
        {activeTab === 'sheet' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#231b14] pb-4">
              <div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold gold-gradient-text tracking-wide">
                  HERÓIS EM COMBATE & MESA DE JOGO
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Gerenciamento estrito de HP, espaços de magia, condições e testes com vantagens sem derivas de regras.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollToContent('combat')}
                  className="glass-btn rounded-lg px-4 py-2 text-xs flex items-center gap-1.5 shadow"
                >
                  <Swords className="w-3.5 h-3.5 text-rose-400" /> Ver Arena de Inimigos ({enemies.length})
                </button>
                <button
                  onClick={() => scrollToContent('parchment')}
                  className="glass-btn rounded-lg px-4 py-2 text-xs flex items-center gap-1.5 shadow"
                >
                  📜 Ficha Estilo Kelanyah
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bronze-btn rounded-lg px-4 py-2 text-xs flex items-center gap-1.5 shadow"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#f5ba42]" /> Novo Herói
                </button>
              </div>
            </div>

            {characters.length === 0 ? (
              <div className="bg-[#0f121a] border border-[#231b14] rounded-2xl p-12 text-center space-y-4">
                <Shield className="w-12 h-12 text-[#a17036] mx-auto opacity-70" />
                <h3 className="font-cinzel text-lg font-bold text-[#f5ba42]">Nenhum herói registrado no reino</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Crie aventureiros baseados nas regras oficiais do SRD 5e para iniciar a campanha narrada pelo Gemini Pro.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bronze-btn rounded-full px-6 py-2.5 text-xs inline-flex items-center gap-2 shadow"
                >
                  <UserPlus className="w-4 h-4" /> Criar Primeiro Personagem
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {characters.map(char => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    onApplyDamage={handleApplyDamage}
                    onHeal={handleHeal}
                    onSpendSlot={handleSpendSlot}
                    onRestoreSlot={handleRestoreSlot}
                    onToggleCondition={handleToggleCondition}
                    onToggleInspiration={handleToggleInspiration}
                    onDeleteCharacter={handleDeleteCharacter}
                    onRollCheck={handleRollCheck}
                    onOpenParchment={(c) => {
                      setSelectedCharacterId(c.id);
                      scrollToContent('parchment');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ABA: FICHA PERGAMINHO (ESTILO TANARES) */}
        {activeTab === 'parchment' && (
          characters.length > 0 ? (
            <ParchmentCharacterSheet
              character={characters.find(c => c.id === selectedCharacterId) || characters[0]}
              charactersList={characters}
              onSelectCharacter={(c) => setSelectedCharacterId(c.id)}
              onApplyDamage={handleApplyDamage}
              onHeal={handleHeal}
              onSpendSlot={handleSpendSlot}
              onRestoreSlot={handleRestoreSlot}
              onToggleCondition={handleToggleCondition}
              onToggleInspiration={handleToggleInspiration}
              onRollCheck={handleRollCheck}
              onBackToMesa={() => setActiveTab('sheet')}
            />
          ) : (
            <div className="text-center py-12 text-stone-400">Nenhum herói cadastrado.</div>
          )
        )}

        {/* 3. ABA: ARENA DE COMBATE & INIMIGOS (NOVO) */}
        {activeTab === 'combat' && (
          <CombatArena
            characters={characters}
            enemies={enemies}
            diceMode={diceMode}
            onSetDiceMode={setDiceMode}
            onApplyDamageHero={handleApplyDamage}
            onApplyDamageEnemy={handleApplyDamageEnemy}
            onHealEnemy={handleHealEnemy}
            onAddEnemy={handleAddEnemy}
            onRemoveEnemy={handleRemoveEnemy}
            onRequestManualRoll={(pending) => setPendingManualRoll(pending)}
            onResolveAutoAttack={handleResolveAutoAttack}
          />
        )}

        {/* 4. ABA: ANÁLISE TÁTICA DO GUIA DO MESTRE */}
        {activeTab === 'analysis' && (
          <PartyAnalysisView characters={characters} />
        )}

        {/* 5. ABA: CENTRAL GEMINI PRO */}
        {activeTab === 'gemini' && (
          <GeminiHub
            characters={characters}
            enemies={enemies}
            onApplyDamage={handleApplyDamage}
            onHeal={handleHeal}
          />
        )}

        {/* 6. ABA: CRIADOR DE PERSONAGENS */}
        {activeTab === 'create' && (
          <CharacterCreator
            onAddCharacter={handleAddCharacter}
            onCancel={() => setActiveTab('sheet')}
          />
        )}
      </div>

      {/* Footer estilo REALMS */}
      <footer className="border-t border-[#231b14] bg-[#06070a] py-8 text-center text-xs text-stone-400 space-y-2">
        <div className="font-cinzel text-sm font-bold gold-gradient-text tracking-[0.2em]">
          REALMS • DUNGEONS & GEMINI
        </div>
        <p className="text-[11px] text-stone-400 font-light">
          Motor Determinístico de Regras D&D 5ª Edição & Copiloto Narrativo Imparcial para Gemini Pro.
        </p>
      </footer>
    </div>
  );
};
