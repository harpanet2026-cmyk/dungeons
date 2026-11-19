import React from 'react';
import { AbilityName, SkillName } from '../../../core/types/dnd';
import { PHB_RACES, DRACONIC_ANCESTRIES, PHB_LANGUAGES, ARTISAN_TOOLS, CLASS_CANTRIPS_MAP, PHB_SPELLS_L0_L1 } from '../../../core/rules/characterCreationData';
import { Shield, Sparkles, Eye, Footprints, Flame, BookOpen, Check } from 'lucide-react';

interface StepRaceProps {
  selectedRace: string;
  onSelectRace: (race: string) => void;
  selectedSubrace: string;
  onSelectSubrace: (subrace: string) => void;
  
  // Meio-Elfo: 2 atributos (+1 cada) exceto CAR
  halfElfBonusAbilities: AbilityName[];
  onChangeHalfElfBonusAbilities: (abilities: AbilityName[]) => void;
  
  // Draconato
  draconicAncestryColor: string;
  onChangeDraconicAncestry: (color: string) => void;
  
  // Anão
  dwarfTool: string;
  onChangeDwarfTool: (tool: string) => void;
  
  // Alto Elfo: 1 truque de Mago
  highElfCantripId: string;
  onChangeHighElfCantrip: (cantripId: string) => void;
  
  // Idioma extra racial (Humano, Alto Elfo, Meio-Elfo)
  extraLanguage: string;
  onChangeExtraLanguage: (lang: string) => void;
}

export const StepRace: React.FC<StepRaceProps> = ({
  selectedRace,
  onSelectRace,
  selectedSubrace,
  onSelectSubrace,
  halfElfBonusAbilities,
  onChangeHalfElfBonusAbilities,
  draconicAncestryColor,
  onChangeDraconicAncestry,
  dwarfTool,
  onChangeDwarfTool,
  highElfCantripId,
  onChangeHighElfCantrip,
  extraLanguage,
  onChangeExtraLanguage
}) => {
  const currentRace = PHB_RACES[selectedRace] || PHB_RACES['Humano'];
  const hasSubraces = Boolean(currentRace.subraces && currentRace.subraces.length > 0);
  const currentSubrace = currentRace.subraces?.find(s => s.id === selectedSubrace) || currentRace.subraces?.[0];

  const handleToggleHalfElfAbility = (ab: AbilityName) => {
    if (ab === 'car') return; // Meio-Elfo já ganha +2 em CAR, não pode escolher CAR novamente
    if (halfElfBonusAbilities.includes(ab)) {
      onChangeHalfElfBonusAbilities(halfElfBonusAbilities.filter(a => a !== ab));
    } else {
      if (halfElfBonusAbilities.length < 2) {
        onChangeHalfElfBonusAbilities([...halfElfBonusAbilities, ab]);
      } else {
        // Substitui o primeiro
        onChangeHalfElfBonusAbilities([halfElfBonusAbilities[1], ab]);
      }
    }
  };

  // Magias de Mago disponíveis para o Alto Elfo
  const wizardCantrips = (CLASS_CANTRIPS_MAP['Mago'] || []).map(id => 
    PHB_SPELLS_L0_L1.find(s => s.id === id)
  ).filter(Boolean);

  return (
    <div className="space-y-6 text-stone-200">
      {/* Título da Seção */}
      <div className="border-b border-[#231b14] pb-3">
        <h3 className="font-cinzel text-lg font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#f5ba42]" />
          1. Escolha de Raça e Sub-raça (Capítulo 2 do PHB)
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Sua raça confere bônus de atributo básicos, deslocamento, sentidos e traços culturais ou mágicos inerentes.
        </p>
      </div>

      {/* Grid de Seleção de Raças */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {Object.keys(PHB_RACES).map(raceKey => {
          const r = PHB_RACES[raceKey];
          const isSelected = selectedRace === raceKey;

          return (
            <button
              key={raceKey}
              type="button"
              onClick={() => {
                onSelectRace(raceKey);
                if (r.subraces && r.subraces.length > 0) {
                  onSelectSubrace(r.subraces[0].id);
                } else {
                  onSelectSubrace('');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] shadow-lg shadow-amber-950/40 text-[#ffd470]'
                  : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#3d496a] hover:bg-[#161c2c]'
              }`}
            >
              <div>
                <span className="font-cinzel font-bold text-xs uppercase tracking-wider block">{r.name}</span>
                <span className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">{r.description}</span>
              </div>
              <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex flex-wrap items-center gap-1">
                {Object.entries(r.baseAbilityBonuses).map(([ab, bonus]) => (
                  <span key={ab} className="bg-[#0b0e17] px-1.5 py-0.5 rounded border border-[#2b354f] whitespace-nowrap">
                    +{bonus} {ab.toUpperCase()}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalhes da Raça Selecionada */}
      <div className="bg-[#0e111a]/80 backdrop-blur-sm p-5 rounded-2xl border border-[#231b14]/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f2638] pb-3">
          <div>
            <h4 className="font-cinzel text-base font-bold text-[#f5ba42]">
              {currentRace.name}
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">{currentRace.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-stone-300 bg-[#161c2c] px-2.5 py-1 rounded-lg border border-[#262f44]">
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              Deslocamento: <strong className="text-emerald-300">{currentRace.baseSpeed}m</strong>
            </span>
            <span className="flex items-center gap-1 text-stone-300 bg-[#161c2c] px-2.5 py-1 rounded-lg border border-[#262f44]">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              {currentRace.hasDarkvision ? `Visão Escuro (${currentRace.darkvisionRange || 18}m)` : 'Sem Visão Escuro'}
            </span>
          </div>
        </div>

        {/* Seção de Sub-raça (se houver) */}
        {hasSubraces && currentRace.subraces && (
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider">
              Escolha de Sub-raça:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentRace.subraces.map(sub => {
                const isSubSelected = selectedSubrace === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectSubrace(sub.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSubSelected
                        ? 'bg-[#231b14] border-[#a17036] text-[#ffd470] shadow-inner'
                        : 'bg-[#141824] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{sub.name}</span>
                      {isSubSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{sub.description}</p>
                    <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex flex-wrap gap-1">
                      {Object.entries(sub.abilityBonuses).map(([ab, b]) => (
                        <span key={ab} className="bg-[#0b0e17] px-1 py-0.5 rounded border border-[#262f44] whitespace-nowrap">
                          +{b} {ab.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Escolha Especial de Meio-Elfo: +1 em 2 atributos à escolha */}
        {currentRace.hasFlexibleAbilityBonus && (
          <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider">
                Bônus de Atributos do Meio-Elfo (+1 em DOIS atributos à escolha):
              </span>
              <span className={`text-[11px] font-bold ${halfElfBonusAbilities.length === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {halfElfBonusAbilities.length}/2 Selecionados
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              O Meio-Elfo recebe +2 em Carisma automaticamente. Escolha dois outros atributos distintos para receber +1 cada (Carisma não pode ser escolhido novamente).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {(['for', 'des', 'con', 'int', 'sab'] as AbilityName[]).map(ab => {
                const isSelected = halfElfBonusAbilities.includes(ab);
                return (
                  <button
                    key={ab}
                    type="button"
                    onClick={() => handleToggleHalfElfAbility(ab)}
                    className={`px-3 py-2 rounded-xl text-center border font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42]'
                        : 'bg-[#0f131d] border-[#262f44] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    +1 {ab.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Escolha Especial de Draconato: Ancestral Dracônico */}
        {currentRace.hasDraconicAncestry && (
          <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-2">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Ancestral Dracônico (Cor e Tipo de Sopro):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DRACONIC_ANCESTRIES.map(anc => {
                const isSelected = draconicAncestryColor === anc.color;
                return (
                  <button
                    key={anc.color}
                    type="button"
                    onClick={() => onChangeDraconicAncestry(anc.color)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42]'
                        : 'bg-[#0f131d] border-[#262f44] text-stone-400 hover:border-[#38435f]'
                    }`}
                  >
                    <div className="font-bold">{anc.color}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">{anc.damageType}</div>
                    <div className="text-[9px] text-stone-500 mt-0.5">{anc.area}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Escolha de Ferramenta de Anão */}
        {currentRace.chooseToolCategory === 'dwarf_artisan' && (
          <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-2">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Proficiência com Ferramentas de Artesão do Anão:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['Ferramentas de Ferreiro', 'Ferramentas de Cervejeiro', 'Ferramentas de Pedreiro'].map(t => {
                const isSelected = dwarfTool === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChangeDwarfTool(t)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42]'
                        : 'bg-[#0f131d] border-[#262f44] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Escolha de Truque de Alto Elfo */}
        {selectedSubrace === 'alto_elfo' && (
          <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-2">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Truque de Mago do Alto Elfo (Inteligência como Atributo de Conjuração):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {wizardCantrips.map(sp => {
                if (!sp) return null;
                const isSelected = highElfCantripId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onChangeHighElfCantrip(sp.id)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#2a2016] border-[#f5ba42] text-[#f5ba42]'
                        : 'bg-[#0f131d] border-[#262f44] text-stone-400 hover:border-[#38435f]'
                    }`}
                  >
                    <div className="font-bold">{sp.name.split('(')[0].trim()}</div>
                    <div className="text-[10px] text-stone-500 line-clamp-1">{sp.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Escolha de Idioma Extra (Humano, Alto Elfo, Meio-Elfo) */}
        {(currentRace.chooseExtraLanguage || (selectedSubrace === 'alto_elfo')) && (
          <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-2">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
              Idioma Adicional Escolhido pela Raça:
            </span>
            <select
              value={extraLanguage}
              onChange={(e) => onChangeExtraLanguage(e.target.value)}
              className="w-full sm:w-72 bg-[#0d101a] border border-[#2f3850] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none"
            >
              {PHB_LANGUAGES.filter(l => !currentRace.languages.includes(l)).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        )}

        {/* Traços Raciais Detalhados */}
        <div className="border-t border-[#1f2638] pt-3 space-y-1.5">
          <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block">
            Traços e Habilidades Raciais Ativas:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentRace.traits.map((tr, i) => (
              <div key={i} className="bg-[#121622] p-2.5 rounded-xl border border-[#232b3d] text-stone-300">
                • {tr}
              </div>
            ))}
            {currentSubrace?.traits.map((tr, i) => (
              <div key={`sub-${i}`} className="bg-[#121622] p-2.5 rounded-xl border border-[#a17036]/30 text-amber-200">
                • {tr}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
