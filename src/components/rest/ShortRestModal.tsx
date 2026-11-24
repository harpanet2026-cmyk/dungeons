import React, { useState } from 'react';
import { Character } from '../../core/types/dnd';
import { getAbilityModifier, formatModifier } from '../../core/rules/calculations';
import { Coffee, Heart, Sparkles, Dices, Check, X, Music, RotateCcw, Shield, Info, Moon } from 'lucide-react';

interface ShortRestModalProps {
  characters: Character[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmRest: (updates: { [charId: string]: { hpHealed: number; diceSpent: number; summary: string } }) => void;
  diceMode?: 'automatico' | 'manual';
}

interface CharRestState {
  diceSpent: number;
  hpHealed: number;
  rolls: string[];
}

export const ShortRestModal: React.FC<ShortRestModalProps> = ({
  characters,
  isOpen,
  onClose,
  onConfirmRest,
  diceMode = 'automatico'
}) => {
  if (!isOpen) return null;

  // Estado de dados gastos e cura por personagem
  const [restState, setRestState] = useState<{ [charId: string]: CharRestState }>(() => {
    const initial: { [charId: string]: CharRestState } = {};
    characters.forEach(c => {
      initial[c.id] = { diceSpent: 0, hpHealed: 0, rolls: [] };
    });
    return initial;
  });

  // Entrada para rolagem manual física de dado
  const [manualInput, setManualInput] = useState<{ [charId: string]: string }>({});

  // Identificar se há um Bardo no grupo com Canção de Descanso (PHB p. 54)
  const bardWithSongOfRest = characters.find(c =>
    (c.class || '').toLowerCase().includes('bardo') && c.level >= 2
  );

  const getSongOfRestDie = (level: number) => {
    if (level >= 17) return { die: 'd12', max: 12 };
    if (level >= 13) return { die: 'd10', max: 10 };
    if (level >= 9) return { die: 'd8', max: 8 };
    return { die: 'd6', max: 6 };
  };

  const songOfRestInfo = bardWithSongOfRest ? getSongOfRestDie(bardWithSongOfRest.level) : null;

  // Rolar 1 Dado de Vida para um personagem específico
  const handleRollHitDie = (char: Character, manualVal?: number) => {
    const charState = restState[char.id] || { diceSpent: 0, hpHealed: 0, rolls: [] };
    const availableDice = Math.max(0, char.hitDiceTotal - char.hitDiceUsed - charState.diceSpent);

    if (availableDice <= 0) return;

    const hitDieMax = parseInt(char.hitDie.replace(/\D/g, '')) || 8;
    const conMod = getAbilityModifier(char.baseAbilities.con);

    const dieRoll = manualVal !== undefined
      ? Math.max(1, Math.min(hitDieMax, manualVal))
      : Math.floor(Math.random() * hitDieMax) + 1;

    let healAmount = Math.max(0, dieRoll + conMod);
    let rollDesc = `1d${hitDieMax} (${dieRoll}) + CON (${formatModifier(conMod)}) = +${healAmount} PV`;

    // Aplicar Canção de Descanso no primeiro dado gasto se houver bardo
    let songBonus = 0;
    if (songOfRestInfo && charState.diceSpent === 0) {
      songBonus = Math.floor(Math.random() * songOfRestInfo.max) + 1;
      healAmount += songBonus;
      rollDesc += ` + Canção (${songBonus}) = +${healAmount} PV`;
    }

    const currentProjectedHp = Math.min(char.maxHp, char.currentHp + charState.hpHealed + healAmount);
    const actualGain = currentProjectedHp - (char.currentHp + charState.hpHealed);

    setRestState(prev => ({
      ...prev,
      [char.id]: {
        diceSpent: charState.diceSpent + 1,
        hpHealed: charState.hpHealed + actualGain,
        rolls: [...charState.rolls, rollDesc]
      }
    }));

    // Limpar input manual do char
    setManualInput(prev => ({ ...prev, [char.id]: '' }));
  };

  // Resetar gastos de um personagem
  const handleResetChar = (charId: string) => {
    setRestState(prev => ({
      ...prev,
      [charId]: { diceSpent: 0, hpHealed: 0, rolls: [] }
    }));
  };

  // Descanso Rápido: gasta 1 dado para todos os feridos com dados disponíveis
  const handleQuickRestGroup = () => {
    characters.forEach(c => {
      const charState = restState[c.id] || { diceSpent: 0, hpHealed: 0, rolls: [] };
      const currentProjHp = c.currentHp + charState.hpHealed;
      const availableDice = Math.max(0, c.hitDiceTotal - c.hitDiceUsed - charState.diceSpent);

      if (currentProjHp < c.maxHp && availableDice > 0) {
        handleRollHitDie(c);
      }
    });
  };

  // Confirmar e aplicar Descanso Curto
  const handleConfirm = () => {
    const updates: { [charId: string]: { hpHealed: number; diceSpent: number; summary: string } } = {};
    Object.keys(restState).forEach(charId => {
      const s = restState[charId];
      if (s.diceSpent > 0 || s.hpHealed > 0) {
        updates[charId] = {
          hpHealed: s.hpHealed,
          diceSpent: s.diceSpent,
          summary: s.rolls.join(' | ')
        };
      }
    });
    onConfirmRest(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-[#120e0a] border-2 border-[#a17036] rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col text-stone-200 overflow-hidden my-auto">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#2a1d12] via-[#3d2915] to-[#1f150d] border-b-2 border-[#a17036] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-300 shadow">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-black tracking-wider text-amber-200">
                DESCANSO CURTO • SHORT REST (1 HORA)
              </h2>
              <p className="text-[11px] text-amber-400/80 italic font-serif">
                Livro do Jogador (PHB p. 186): Inatividade para repousar, comer, beber e gastar Dados de Vida para recuperar PV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canção de Descanso Ativa (se houver Bardo) */}
        {bardWithSongOfRest && songOfRestInfo && (
          <div className="bg-[#1b1429] border-b border-purple-500/40 px-4 py-2 flex items-center justify-between gap-3 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>Canção de Descanso Ativa ({bardWithSongOfRest.name}):</strong> Aliados que gastarem Dados de Vida recuperam <strong>+{songOfRestInfo.die} PV extras</strong> no primeiro dado!
              </span>
            </div>
            <span className="text-[10px] bg-purple-900/60 border border-purple-400/40 px-2 py-0.5 rounded text-purple-300 font-bold uppercase tracking-wider shrink-0">
              PHB p. 54
            </span>
          </div>
        )}

        {/* Lista de Personagens */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[62vh] overflow-y-auto custom-scrollbar">
          {characters.map(char => {
            const charState = restState[char.id] || { diceSpent: 0, hpHealed: 0, rolls: [] };
            const availableDice = Math.max(0, char.hitDiceTotal - char.hitDiceUsed - charState.diceSpent);
            const conMod = getAbilityModifier(char.baseAbilities.con);
            const projectedHp = Math.min(char.maxHp, char.currentHp + charState.hpHealed);
            const isFullHp = projectedHp >= char.maxHp;
            const isWarlock = (char.class || '').toLowerCase().includes('bruxo') || (char.class || '').toLowerCase().includes('warlock');
            const isFighterOrMonk = (char.class || '').toLowerCase().includes('guerreiro') || (char.class || '').toLowerCase().includes('monge');

            return (
              <div
                key={char.id}
                className="bg-[#1a1410] border border-[#a17036]/50 rounded-xl p-3 sm:p-4 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#d9be7e]/60 transition-all"
              >
                {/* Info do Personagem */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <img
                    src={char.avatarUrl || '/artes/guerreiro.jpeg'}
                    alt={char.name}
                    className="w-12 h-12 rounded-lg object-cover border border-[#be9e63]/70 shrink-0 bg-stone-900"
                  />
                  <div>
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-100 flex items-center gap-1.5">
                      {char.name}
                      {isWarlock && (
                        <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-1.5 py-0.2 rounded uppercase font-bold" title="Recupera todos os espaços de Magia de Pacto no descanso curto!">
                          Bruxo • Pacto
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {char.race} {char.class} • Nível {char.level}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-amber-300/90 font-mono">
                        CON: {formatModifier(conMod)}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Dado: {char.hitDie}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status de Pontos de Vida & Barra */}
                <div className="flex-1 w-full md:w-auto md:max-w-xs space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-1 text-stone-300">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> PV:
                    </span>
                    <span className="font-cinzel font-black">
                      <span className={projectedHp < char.maxHp ? 'text-rose-400' : 'text-emerald-400'}>
                        {projectedHp}
                      </span>
                      <span className="text-stone-500"> / {char.maxHp}</span>
                      {charState.hpHealed > 0 && (
                        <span className="text-emerald-400 font-bold ml-1.5 text-[11px]">
                          (+{charState.hpHealed})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Barra de Progresso de Vida */}
                  <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, (projectedHp / char.maxHp) * 100))}%` }}
                    />
                  </div>

                  {/* Dados de Vida Disponíveis */}
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span>Dados de Vida Restantes:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {availableDice} de {char.hitDiceTotal} {char.hitDie}
                    </span>
                  </div>
                </div>

                {/* Ações de Rolagem de Dados de Vida */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  {/* Modo Manual de Dado Físico */}
                  {diceMode === 'manual' && availableDice > 0 && !isFullHp && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Dado"
                        min="1"
                        max={parseInt(char.hitDie.replace(/\D/g, '')) || 12}
                        value={manualInput[char.id] || ''}
                        onChange={e => setManualInput(prev => ({ ...prev, [char.id]: e.target.value }))}
                        className="w-14 px-2 py-1 text-xs text-center bg-stone-900 border border-[#a17036] rounded text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                        title="Valor tirado no dado físico"
                      />
                      <button
                        onClick={() => {
                          const val = parseInt(manualInput[char.id] || '');
                          if (val) handleRollHitDie(char, val);
                        }}
                        disabled={!manualInput[char.id]}
                        className="px-2 py-1 rounded bg-[#3d2915] text-[#d9be7e] border border-[#be9e63] text-xs font-bold hover:bg-[#52381e] disabled:opacity-40"
                        title="Confirmar dado físico"
                      >
                        OK
                      </button>
                    </div>
                  )}

                  {/* Botão Principal de Rolar Dado de Vida */}
                  <button
                    onClick={() => handleRollHitDie(char)}
                    disabled={availableDice <= 0 || isFullHp}
                    className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow ${
                      isFullHp
                        ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        : availableDice <= 0
                        ? 'bg-stone-900 text-stone-500 border border-stone-800 cursor-not-allowed'
                        : 'bronze-btn text-amber-200 hover:scale-105 active:scale-95'
                    }`}
                    title={
                      isFullHp
                        ? 'Personagem já está com pontos de vida máximos'
                        : availableDice <= 0
                        ? 'Sem dados de vida restantes até o próximo descanso longo'
                        : `Gastar 1 Dado de Vida (${char.hitDie} + CON ${formatModifier(conMod)})`
                    }
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isFullHp ? 'Vida Cheia' : availableDice <= 0 ? 'Sem Dados' : `+ Rolar ${char.hitDie}`}
                    </span>
                  </button>

                  {/* Desfazer / Resetar Personagem */}
                  {charState.diceSpent > 0 && (
                    <button
                      onClick={() => handleResetChar(char.id)}
                      className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded transition-colors"
                      title="Resetar dados gastos deste herói no descanso atual"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé e Ações Gerais */}
        <div className="bg-[#17110c] border-t border-[#a17036]/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickRestGroup}
              className="px-3 py-1.5 bg-[#261b12] hover:bg-[#382618] border border-[#be9e63]/60 text-amber-200 text-xs font-cinzel font-bold rounded-lg transition-all flex items-center gap-1.5 shadow"
              title="Gasta 1 dado automaticamente para cada herói ferido com dados disponíveis"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Descanso Rápido do Grupo (+1 Dado)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700 text-xs rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="bronze-btn px-5 py-2 rounded-lg font-cinzel font-black text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>CONCLUIR DESCANSO CURTO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
