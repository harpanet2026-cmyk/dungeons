import React from 'react';
import { SkillName } from '../../../core/types/dnd';
import { PHB_BACKGROUNDS, DetailedBackgroundData } from '../../../core/rules/characterCreationData';
import { SKILL_ABILITY_MAP } from '../../../core/rules/calculations';
import { BookOpen, Sparkles, Check, AlertCircle, Plus, Edit3 } from 'lucide-react';

interface StepBackgroundProps {
  name: string;
  onChangeName: (name: string) => void;
  player: string;
  onChangePlayer: (player: string) => void;
  gender: 'masculino' | 'feminino';
  onChangeGender: (gender: 'masculino' | 'feminino') => void;
  
  selectedBackground: string;
  onSelectBackground: (bg: string) => void;
  
  // Detecção de conflito de perícia (PHB pág. 125)
  conflictedSkills: SkillName[];
  replacementSkills: SkillName[];
  onSelectReplacementSkill: (index: number, skill: SkillName) => void;
  alreadyChosenSkills: SkillName[]; // Perícias já concedidas por raça ou classe
  
  // Roleplay
  personalityTraits: string;
  onChangePersonalityTraits: (val: string) => void;
  ideals: string;
  onChangeIdeals: (val: string) => void;
  bonds: string;
  onChangeBonds: (val: string) => void;
  flaws: string;
  onChangeFlaws: (val: string) => void;
  secretsOrHooks: string;
  onChangeSecretsOrHooks: (val: string) => void;
}

export const StepBackground: React.FC<StepBackgroundProps> = ({
  name,
  onChangeName,
  player,
  onChangePlayer,
  gender,
  onChangeGender,
  selectedBackground,
  onSelectBackground,
  conflictedSkills,
  replacementSkills,
  onSelectReplacementSkill,
  alreadyChosenSkills,
  personalityTraits,
  onChangePersonalityTraits,
  ideals,
  onChangeIdeals,
  bonds,
  onChangeBonds,
  flaws,
  onChangeFlaws,
  secretsOrHooks,
  onChangeSecretsOrHooks
}) => {
  const currentBg: DetailedBackgroundData = PHB_BACKGROUNDS[selectedBackground] || PHB_BACKGROUNDS['Soldado'];

  const allSkills = Object.keys(SKILL_ABILITY_MAP) as SkillName[];

  return (
    <div className="space-y-6 text-stone-200">
      {/* Título da Seção */}
      <div className="border-b border-[#231b14] pb-3">
        <h3 className="font-cinzel text-lg font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#f5ba42]" />
          4. Antecedente e Identidade Dramática (Capítulo 4 do PHB)
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          O antecedente revela a história prévia do personagem antes de se tornar um aventureiro, concedendo perícias, ferramentas, idiomas e uma característica social única.
        </p>
      </div>

      {/* Identidade: Nome, Jogador e Gênero */}
      <div className="bg-[#0e111a] p-4 rounded-2xl border border-[#231b14] grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-stone-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            Nome do Personagem: <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Alden Ventofrio"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600 font-semibold"
          />
        </div>

        <div>
          <label className="block text-stone-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            Jogador(a):
          </label>
          <input
            type="text"
            placeholder="Ex: Guilherme"
            value={player}
            onChange={(e) => onChangePlayer(e.target.value)}
            className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
          />
        </div>

        <div>
          <label className="block text-stone-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            Gênero & Arte:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeGender('masculino')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'masculino'
                  ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow'
                  : 'bg-[#141824] border-[#2b334a] text-stone-400 hover:border-stone-500'
              }`}
            >
              <span>♂ Masculino</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeGender('feminino')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'feminino'
                  ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow'
                  : 'bg-[#141824] border-[#2b334a] text-stone-400 hover:border-stone-500'
              }`}
            >
              <span>♀ Feminino</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seletor de Antecedente */}
      <div className="space-y-2">
        <label className="block text-stone-300 font-cinzel font-bold uppercase tracking-wider text-xs">
          Selecione o Antecedente:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.keys(PHB_BACKGROUNDS).map(bgKey => {
            const bg = PHB_BACKGROUNDS[bgKey];
            const isSelected = selectedBackground === bgKey;

            return (
              <button
                key={bgKey}
                type="button"
                onClick={() => onSelectBackground(bgKey)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#2a2016] to-[#1a140e] border-[#f5ba42] text-[#ffd470] shadow-inner'
                    : 'bg-[#121622] border-[#262f44] text-stone-300 hover:border-[#38435f]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>{bg.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                </div>
                <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{bg.description}</p>
                <div className="text-[10px] text-amber-400 mt-1.5 flex flex-wrap gap-1 font-semibold">
                  {bg.skillProficiencies.map(sk => (
                    <span key={sk} className="bg-[#0b0e17] px-1 py-0.5 rounded border border-[#262f44]">
                      {SKILL_ABILITY_MAP[sk]?.name}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhes do Antecedente Selecionado */}
      <div className="bg-[#0e111a] p-5 rounded-2xl border border-[#231b14] space-y-4">
        {/* Característica de Antecedente */}
        <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5ba42]" />
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider">
              Característica: {currentBg.feature.name}
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            {currentBg.feature.description}
          </p>
        </div>

        {/* REGRA PHB PÁG. 125: DETECÇÃO DE CONFLITO DE PERÍCIAS */}
        <div className="bg-[#141824] p-4 rounded-xl border border-[#2f3850] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider">
              Perícias Concedidas pelo Antecedente (2 Perícias):
            </span>
            <span className="text-[10px] text-stone-400">Regra PHB pág. 125</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentBg.skillProficiencies.map((sk, idx) => {
              const isConflicted = alreadyChosenSkills.includes(sk);
              const repSkill = replacementSkills[idx];

              return (
                <div key={idx} className="bg-[#0f131d] p-3 rounded-xl border border-[#262f44] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200">
                      Perícia Fixa: {SKILL_ABILITY_MAP[sk]?.name}
                    </span>
                    {isConflicted ? (
                      <span className="text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Já Obtida (Conflito!)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Concedida
                      </span>
                    )}
                  </div>

                  {isConflicted && (
                    <div className="space-y-1 pt-1 border-t border-[#1f2638]">
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        Como você já tem essa perícia da Raça ou Classe, escolha **qualquer outra perícia** da 5e livremente:
                      </p>
                      <select
                        value={repSkill || ''}
                        onChange={(e) => onSelectReplacementSkill(idx, e.target.value as SkillName)}
                        className="w-full bg-[#141824] border border-[#a17036] rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-bold outline-none"
                      >
                        <option value="">-- Escolha Qualquer Outra Perícia --</option>
                        {allSkills
                          .filter(s => s !== sk && !alreadyChosenSkills.includes(s))
                          .map(s => (
                            <option key={s} value={s}>
                              {SKILL_ABILITY_MAP[s].name} ({SKILL_ABILITY_MAP[s].ability.toUpperCase()})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Proficiências em Ferramentas e Idiomas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#121622] p-3 rounded-xl border border-[#262f44]">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
              Proficiências em Ferramentas:
            </span>
            <span className="text-stone-200">
              {currentBg.toolProficiencies?.join(', ') || 'Nenhuma'}
            </span>
          </div>

          <div className="bg-[#121622] p-3 rounded-xl border border-[#262f44]">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
              Idiomas Concedidos:
            </span>
            <span className="text-stone-200">
              {currentBg.languagesCount ? `${currentBg.languagesCount} idioma(s) à sua escolha` : 'Nenhum'}
            </span>
          </div>
        </div>

        {/* ROLEPLAY: TRAÇOS, IDEIAS, VÍNCULOS E DEFEITOS (COM SUGESTÕES CLICÁVEIS) */}
        <div className="space-y-4 pt-2 border-t border-[#1f2638]">
          <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
            Perfil Dramático e Roleplay (Sugestões Oficiais Clicáveis ou Digitação Livre):
          </span>

          {/* Traços de Personalidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-stone-300 font-semibold">Traços de Personalidade:</label>
              <span className="text-[10px] text-stone-400">Clique nas sugestões abaixo para preencher</span>
            </div>
            <textarea
              rows={2}
              value={personalityTraits}
              onChange={(e) => onChangePersonalityTraits(e.target.value)}
              placeholder="Ex: Não hesito em correr perigo quando alguém precisa de ajuda..."
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl p-2.5 text-stone-100 text-xs outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {currentBg.suggestedTraits.map((tr, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChangePersonalityTraits(tr)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[#141824] border border-[#262f44] text-stone-400 hover:text-stone-200 hover:border-[#a17036] text-left transition-all"
                >
                  + {tr}
                </button>
              ))}
            </div>
          </div>

          {/* Ideais e Vínculos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-semibold text-xs block">Ideais:</label>
              <input
                type="text"
                value={ideals}
                onChange={(e) => onChangeIdeals(e.target.value)}
                placeholder="Ex: Justiça acima de tudo..."
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none"
              />
              <div className="flex flex-col gap-1">
                {currentBg.suggestedIdeals.map((id, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChangeIdeals(id)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[#141824] border border-[#262f44] text-stone-400 hover:text-stone-200 hover:border-[#a17036] text-left transition-all truncate"
                  >
                    + {id}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-semibold text-xs block">Vínculos:</label>
              <input
                type="text"
                value={bonds}
                onChange={(e) => onChangeBonds(e.target.value)}
                placeholder="Ex: Proteger minha terra natal a qualquer custo..."
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none"
              />
              <div className="flex flex-col gap-1">
                {currentBg.suggestedBonds.map((bd, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChangeBonds(bd)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[#141824] border border-[#262f44] text-stone-400 hover:text-stone-200 hover:border-[#a17036] text-left transition-all truncate"
                  >
                    + {bd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Defeitos e Segredo / Gancho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-semibold text-xs block">Defeitos:</label>
              <input
                type="text"
                value={flaws}
                onChange={(e) => onChangeFlaws(e.target.value)}
                placeholder="Ex: Dificuldade em confiar em autoridades..."
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none"
              />
              <div className="flex flex-col gap-1">
                {currentBg.suggestedFlaws.map((fl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChangeFlaws(fl)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[#141824] border border-[#262f44] text-stone-400 hover:text-stone-200 hover:border-[#a17036] text-left transition-all truncate"
                  >
                    + {fl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-semibold text-xs block">Segredo / Gancho da Campanha:</label>
              <textarea
                rows={3}
                value={secretsOrHooks}
                onChange={(e) => onChangeSecretsOrHooks(e.target.value)}
                placeholder="Ex: É procurado por um culto fanático após roubar uma joia arcana..."
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl p-2.5 text-stone-100 text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
