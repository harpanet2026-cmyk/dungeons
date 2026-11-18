import React from 'react';
import { AbilityName, SkillName } from '../../../core/types/dnd';
import {
  PHB_CLASSES,
  FIGHTING_STYLES,
  RANGER_FAVORED_ENEMIES,
  RANGER_NATURAL_EXPLORERS,
  CLERIC_DOMAINS,
  SORCERER_ORIGINS,
  WARLOCK_PATRONS
} from '../../../core/rules/characterCreationData';
import { SKILL_ABILITY_MAP } from '../../../core/rules/calculations';
import { Shield, Sparkles, Sword, Heart, Award, Check, AlertCircle } from 'lucide-react';
import { getClassPortrait } from '../../../core/rules/srdData';

interface StepClassProps {
  selectedClass: string;
  onSelectClass: (className: string) => void;
  level: number;
  gender?: 'masculino' | 'feminino';
  onChangeGender?: (gender: 'masculino' | 'feminino') => void;
  
  // Perícias da Classe
  selectedClassSkills: SkillName[];
  onToggleClassSkill: (skill: SkillName) => void;
  raceGrantedSkills: SkillName[];
  
  // Escolhas de Nível 1
  fightingStyle: string;
  onChangeFightingStyle: (style: string) => void;
  
  favoredEnemy: string;
  onChangeFavoredEnemy: (enemy: string) => void;
  
  naturalExplorer: string;
  onChangeNaturalExplorer: (terrain: string) => void;
  
  rogueExpertise: SkillName[];
  onToggleRogueExpertise: (skill: SkillName) => void;
  
  // Subclasses no Nível 1
  selectedSubclass: string;
  onSelectSubclass: (subclassId: string) => void;
}

export const StepClass: React.FC<StepClassProps> = ({
  selectedClass,
  onSelectClass,
  level,
  gender = 'masculino',
  onChangeGender,
  selectedClassSkills,
  onToggleClassSkill,
  raceGrantedSkills,
  fightingStyle,
  onChangeFightingStyle,
  favoredEnemy,
  onChangeFavoredEnemy,
  naturalExplorer,
  onChangeNaturalExplorer,
  rogueExpertise,
  onToggleRogueExpertise,
  selectedSubclass,
  onSelectSubclass
}) => {
  const currentClass = PHB_CLASSES[selectedClass] || PHB_CLASSES['Guerreiro'];
  const maxSkills = currentClass.skillChoices.count;

  // Lista de perícias elegíveis para a classe
  const availableSkills: SkillName[] = currentClass.skillChoices.anySkill
    ? (Object.keys(SKILL_ABILITY_MAP) as SkillName[])
    : currentClass.skillChoices.options;

  return (
    <div className="space-y-6 text-stone-200">
      {/* Título da Seção & Alternador de Gênero da Arte */}
      <div className="border-b border-[#231b14] pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-cinzel text-lg font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#f5ba42]" />
            2. Escolha de Classe e Decisões de Nível 1 (Capítulo 3 do PHB)
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            A classe dita sua vocação heroica, dados de vida, perícias treinadas e recursos de combate ou conjuração.
          </p>
        </div>

        {onChangeGender && (
          <div className="flex items-center gap-1.5 bg-[#0e111a] p-1 rounded-xl border border-[#2b334a]">
            <span className="text-[10px] text-stone-400 font-semibold px-2 uppercase tracking-wider">Arte:</span>
            <button
              type="button"
              onClick={() => onChangeGender('masculino')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                gender === 'masculino'
                  ? 'bg-amber-600/40 text-amber-200 border border-amber-500/60 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ♂ Masculino
            </button>
            <button
              type="button"
              onClick={() => onChangeGender('feminino')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                gender === 'feminino'
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-500/60 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ♀ Feminino
            </button>
          </div>
        )}
      </div>

      {/* Grid de Seleção das 12 Classes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {Object.keys(PHB_CLASSES).map(className => {
          const cls = PHB_CLASSES[className];
          const isSelected = selectedClass === className;

          return (
            <button
              key={className}
              type="button"
              onClick={() => {
                onSelectClass(className);
                // Reseta subclasse para a primeira elegível se for clérigo/feiticeiro/bruxo
                if (className === 'Clérigo') onSelectSubclass('vida');
                else if (className === 'Feiticeiro') onSelectSubclass('linhagem_draconica');
                else if (className === 'Bruxo') onSelectSubclass('corruptor');
                else onSelectSubclass('');
              }}
              className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col items-center text-center ${
                isSelected
                  ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] shadow-lg shadow-amber-950/40 text-[#ffd470]'
                  : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#3d496a] hover:bg-[#161c2c]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#a17036]/60 mb-2 shadow">
                <img
                  src={getClassPortrait(className, gender)}
                  alt={className}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="font-cinzel font-bold text-xs uppercase tracking-wider block">{cls.name}</span>
              <span className="text-[10px] text-amber-400 font-semibold mt-0.5">{cls.hitDie} PV Base</span>
            </button>
          );
        })}
      </div>

      {/* Painel de Informações da Classe Selecionada */}
      <div className="bg-[#0e111a] p-5 rounded-2xl border border-[#231b14] space-y-5">
        {/* Banner com Hit Die e Salvaguardas */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2638] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#f5ba42] shadow">
              <img
                src={getClassPortrait(selectedClass, gender)}
                alt={selectedClass}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h4 className="font-cinzel text-base font-bold text-[#f5ba42]">{currentClass.name}</h4>
              <p className="text-xs text-stone-400 mt-0.5 max-w-xl">{currentClass.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-[#141824] px-3 py-1.5 rounded-xl border border-[#262f44] text-center">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Dado de Vida</span>
              <strong className="text-rose-400 font-cinzel text-sm">{currentClass.hitDie}</strong>
            </div>
            <div className="bg-[#141824] px-3 py-1.5 rounded-xl border border-[#262f44] text-center">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Salvaguardas</span>
              <div className="flex gap-1.5 mt-0.5">
                {currentClass.savingThrows.map(st => (
                  <span key={st} className="bg-[#0b0e17] px-1.5 py-0.5 rounded text-[10px] font-bold text-[#f5ba42] border border-[#a17036]/30">
                    {st.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Proficiências de Classe */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#121622] p-3 rounded-xl border border-[#262f44]">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
              Armaduras Concedidas:
            </span>
            <span className="text-stone-200">{currentClass.armorProficiencies.join(', ')}</span>
          </div>
          <div className="bg-[#121622] p-3 rounded-xl border border-[#262f44]">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
              Armas Concedidas:
            </span>
            <span className="text-stone-200">{currentClass.weaponProficiencies.join(', ')}</span>
          </div>
          <div className="bg-[#121622] p-3 rounded-xl border border-[#262f44]">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
              Ferramentas / Outros:
            </span>
            <span className="text-stone-200">{currentClass.toolProficiencies?.join(', ') || 'Nenhuma'}</span>
          </div>
        </div>

        {/* 1. SELEÇÃO DE PERÍCIAS DA CLASSE (FILTRADAS E COM LIMITE ESTRITO) */}
        <div className="bg-[#121622] p-4 rounded-xl border border-[#2b334a] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
                Perícias da Classe ({selectedClassSkills.length}/{maxSkills} Selecionadas):
              </span>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Regra 5e: Você deve escolher estritamente {maxSkills} perícias da lista permitida para o {currentClass.name}.
              </p>
            </div>
            {selectedClassSkills.length === maxSkills ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800">
                <Check className="w-3.5 h-3.5" /> Quantidade Completa
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800">
                <AlertCircle className="w-3.5 h-3.5" /> Escolha {maxSkills - selectedClassSkills.length} restante(s)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {availableSkills.map(sk => {
              const skDef = SKILL_ABILITY_MAP[sk];
              const isSelected = selectedClassSkills.includes(sk);
              const isGrantedByRace = raceGrantedSkills.includes(sk);

              return (
                <button
                  key={sk}
                  type="button"
                  disabled={isGrantedByRace}
                  onClick={() => onToggleClassSkill(sk)}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                    isGrantedByRace
                      ? 'bg-[#181c26] border-[#383a45] text-stone-500 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] font-semibold shadow-inner'
                      : 'bg-[#0f131d] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate">{skDef.name}</span>
                    <span className="text-[10px] text-stone-400">({skDef.ability.toUpperCase()})</span>
                  </div>
                  {isGrantedByRace ? (
                    <span className="text-[9px] text-amber-400 font-semibold px-1 rounded bg-[#0b0e17]">Raça</span>
                  ) : isSelected ? (
                    <Check className="w-3.5 h-3.5 text-[#f5ba42] flex-shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SUBCLASSES NO NÍVEL 1 (CLÉRIGO, FEITICEIRO, BRUXO) */}
        {currentClass.requiresSubclassAtL1 && (
          <div className="bg-[#121622] p-4 rounded-xl border border-[#2b334a] space-y-3">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Escolha de Subclasse no Nível 1:
            </span>

            {/* Domínio Divino do Clérigo */}
            {selectedClass === 'Clérigo' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CLERIC_DOMAINS.map(dom => {
                  const isDomSelected = selectedSubclass === dom.id;
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => onSelectSubclass(dom.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isDomSelected
                          ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] shadow-inner'
                          : 'bg-[#0f131d] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{dom.name}</span>
                        {isDomSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{dom.description}</p>
                      {dom.bonusProficiencies?.armor && (
                        <div className="text-[10px] text-emerald-400 font-semibold mt-1.5">
                          + Proficiência em Armaduras Pesadas
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Origem de Feitiçaria do Feiticeiro */}
            {selectedClass === 'Feiticeiro' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SORCERER_ORIGINS.map(orig => {
                  const isOrigSelected = selectedSubclass === orig.id;
                  return (
                    <button
                      key={orig.id}
                      type="button"
                      onClick={() => onSelectSubclass(orig.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isOrigSelected
                          ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] shadow-inner'
                          : 'bg-[#0f131d] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{orig.name}</span>
                        {isOrigSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">{orig.description}</p>
                      {orig.unarmoredAcBonus && (
                        <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                          + CA 13 + Modificador de Des sem armadura & +1 PV por nível
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Patrono Transcendental do Bruxo */}
            {selectedClass === 'Bruxo' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {WARLOCK_PATRONS.map(pat => {
                  const isPatSelected = selectedSubclass === pat.id;
                  return (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => onSelectSubclass(pat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isPatSelected
                          ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] shadow-inner'
                          : 'bg-[#0f131d] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{pat.name}</span>
                        {isPatSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{pat.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. DECISÕES DE NÍVEL 1 ESPECÍFICAS (GUERREIRO, PATRULHEIRO, LADINO) */}
        {/* Guerreiro: Estilo de Luta */}
        {currentClass.requiresFightingStyle && (
          <div className="bg-[#121622] p-4 rounded-xl border border-[#2b334a] space-y-2">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Estilo de Luta do Guerreiro:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FIGHTING_STYLES.map(st => {
                const isSelected = fightingStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onChangeFightingStyle(st.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] shadow-inner'
                        : 'bg-[#0f131d] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{st.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">{st.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Patrulheiro: Inimigo Favorito e Explorador Natural */}
        {currentClass.requiresFavoredEnemy && (
          <div className="bg-[#121622] p-4 rounded-xl border border-[#2b334a] space-y-3">
            <div>
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
                Inimigo Favorito:
              </span>
              <select
                value={favoredEnemy}
                onChange={(e) => onChangeFavoredEnemy(e.target.value)}
                className="w-full bg-[#0d101a] border border-[#2f3850] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none mt-1"
              >
                {RANGER_FAVORED_ENEMIES.map(fe => (
                  <option key={fe.id} value={fe.id}>{fe.name} (Idioma: {fe.language})</option>
                ))}
              </select>
            </div>

            <div>
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
                Explorador Natural (Terreno):
              </span>
              <select
                value={naturalExplorer}
                onChange={(e) => onChangeNaturalExplorer(e.target.value)}
                className="w-full bg-[#0d101a] border border-[#2f3850] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none mt-1"
              >
                {RANGER_NATURAL_EXPLORERS.map(ne => (
                  <option key={ne.id} value={ne.id}>{ne.name} - {ne.description}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Ladino: Especialização (Expertise) */}
        {currentClass.requiresExpertise && (
          <div className="bg-[#121622] p-4 rounded-xl border border-[#2b334a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider">
                Especialização (Expertise) - Dobre o Bônus de Proficiência em 2 Perícias:
              </span>
              <span className={`text-[11px] font-bold ${rogueExpertise.length === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {rogueExpertise.length}/2 Selecionadas
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Escolha duas de suas perícias treinadas para dobrar o bônus de proficiência em testes de atributo.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {selectedClassSkills.map(sk => {
                const skDef = SKILL_ABILITY_MAP[sk];
                const isSelected = rogueExpertise.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => onToggleRogueExpertise(sk)}
                    className={`p-2 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42] font-semibold'
                        : 'bg-[#0f131d] border-[#262f44] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>{skDef?.name || sk}</span>
                    {isSelected && <Award className="w-3.5 h-3.5 text-[#f5ba42]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recursos de Nível 1 Gerais da Classe */}
        <div className="border-t border-[#1f2638] pt-3 space-y-1.5">
          <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block">
            Recursos Ativos no Nível 1:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentClass.featuresL1.map((feat, i) => (
              <div key={i} className="bg-[#121622] p-2.5 rounded-xl border border-[#232b3d]">
                <strong className="text-[#f5ba42] block mb-0.5">{feat.name}</strong>
                <p className="text-stone-400 text-[11px]">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
