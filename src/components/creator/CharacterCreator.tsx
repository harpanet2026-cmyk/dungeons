import React, { useState } from 'react';
import { Character, AbilityScores, SkillName, Alignment, Condition, Item } from '../../core/types/dnd';
import { CLASSES_5E, RACES_5E, BACKGROUNDS_5E, COMMON_ARMORS, COMMON_WEAPONS, STANDARD_ARRAY } from '../../core/rules/srdData';
import { getAbilityModifier, formatModifier, SKILL_ABILITY_MAP } from '../../core/rules/calculations';
import { UserPlus, Sparkles, Shield, Heart, Dices, BookOpen, Check } from 'lucide-react';

interface CharacterCreatorProps {
  onAddCharacter: (character: Character) => void;
  onCancel: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onAddCharacter, onCancel }) => {
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [selectedRace, setSelectedRace] = useState<string>('Humano');
  const [selectedClass, setSelectedClass] = useState<string>('Guerreiro');
  const [level, setLevel] = useState<number>(1);
  const [alignment, setAlignment] = useState<Alignment>('Leal e Bom');
  const [background, setBackground] = useState<string>('Soldado');

  // Atributos base
  const [abilities, setAbilities] = useState<AbilityScores>({
    for: 15,
    des: 14,
    con: 13,
    int: 12,
    sab: 10,
    car: 8
  });

  // Perícias
  const [selectedSkills, setSelectedSkills] = useState<SkillName[]>(['atletismo', 'intimidacao']);

  // Armas e Armadura
  const [selectedArmorId, setSelectedArmorId] = useState<string>('arm_cota_malha');
  const [hasShield, setHasShield] = useState<boolean>(true);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('wpn_espada_longa');

  // Roleplay
  const [ideals, setIdeals] = useState('');
  const [bonds, setBonds] = useState('');
  const [flaws, setFlaws] = useState('');
  const [traits, setTraits] = useState('');
  const [secretsOrHooks, setSecretsOrHooks] = useState('');

  const raceDef = RACES_5E[selectedRace] || RACES_5E['Humano'];
  const classDef = CLASSES_5E[selectedClass] || CLASSES_5E['Guerreiro'];
  const bgDef = BACKGROUNDS_5E[background] || BACKGROUNDS_5E['Soldado'];

  // Calcula atributos finais somando bônus raciais
  const finalAbilities: AbilityScores = {
    for: abilities.for + (raceDef.abilityBonuses.for || 0),
    des: abilities.des + (raceDef.abilityBonuses.des || 0),
    con: abilities.con + (raceDef.abilityBonuses.con || 0),
    int: abilities.int + (raceDef.abilityBonuses.int || 0),
    sab: abilities.sab + (raceDef.abilityBonuses.sab || 0),
    car: abilities.car + (raceDef.abilityBonuses.car || 0),
  };

  const conMod = getAbilityModifier(finalAbilities.con);
  // Cálculo de HP padrão 5e: Max no nível 1 + média nos níveis subsequentes
  const avgHitDie = Math.floor(classDef.hitDieValue / 2) + 1;
  const calculatedHp = (classDef.hitDieValue + conMod) + Math.max(0, (level - 1) * (avgHitDie + conMod));

  const toggleSkill = (skill: SkillName) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do personagem.');
      return;
    }

    const equippedArmor = COMMON_ARMORS.find(a => a.id === selectedArmorId);
    const equippedShield = hasShield ? COMMON_ARMORS.find(a => a.id === 'arm_escudo') : undefined;
    const weapon = COMMON_WEAPONS.find(w => w.id === selectedWeaponId);

    // Configuração de espaços de magia se a classe tiver conjuração
    const spellSlots: Character['spellSlots'] = {};
    if (classDef.spellcastingAbility) {
      if (level >= 1) spellSlots[1] = { max: level >= 3 ? 4 : level === 2 ? 3 : 2, used: 0 };
      if (level >= 3) spellSlots[2] = { max: 2, used: 0 };
    }

    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      player: player.trim() || 'Jogador',
      race: selectedRace,
      class: selectedClass,
      level,
      xp: level === 1 ? 0 : level === 2 ? 300 : level === 3 ? 900 : level * 1000,
      alignment,
      background,
      baseAbilities: finalAbilities,
      savingThrowProficiencies: classDef.savingThrows,
      skillProficiencies: selectedSkills,
      skillExpertise: [],
      maxHp: Math.max(1, calculatedHp),
      currentHp: Math.max(1, calculatedHp),
      tempHp: 0,
      hitDie: classDef.hitDie,
      hitDiceTotal: level,
      hitDiceUsed: 0,
      deathSaves: { successes: 0, failures: 0 },
      speed: raceDef.speed,
      hasInspiration: false,
      equippedArmor,
      equippedShield,
      weapons: weapon ? [{ ...weapon, isEquipped: true }] : [],
      spellcastingAbility: classDef.spellcastingAbility,
      spellSlots,
      spells: [],
      inventory: [
        { id: `inv_pack_${Date.now()}`, name: 'Mochila de Aventureiro', quantity: 1, weight: 5, type: 'geral' }
      ],
      coins: { pc: 10, pp: 5, pe: 0, po: 25, pl: 0 },
      personality: {
        traits: traits ? traits.split(',').map(t => t.trim()) : ['Pragmático e corajoso.'],
        ideals: ideals.trim() || 'Lealdade aos companheiros de armas.',
        bonds: bonds.trim() || 'Proteger sua terra natal.',
        flaws: flaws.trim() || 'Dificuldade em confiar em estranhos.',
        backstory: `Treinado sob as regras da classe ${selectedClass}.`,
        secretsOrHooks: secretsOrHooks.trim() || 'Carrega um medalhão com uma insígnia misteriosa.'
      },
      conditions: [],
      notes: ''
    };

    onAddCharacter(newChar);
  };

  return (
    <div className="bg-gradient-to-b from-[#131622] via-[#0d0f17] to-[#090b10] border-2 border-[#a17036] rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto space-y-6 text-stone-200">
      <div className="flex items-center justify-between border-b border-[#231b14] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a17036] to-[#4a3419] flex items-center justify-center shadow border border-[#f5ba42]/30">
            <UserPlus className="w-5 h-5 text-[#ffd470]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-black gold-gradient-text uppercase tracking-wider">
              Criador de Personagem 5e (SRD)
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Criação de heróis com validação matemática e campos de perfil otimizados para narração pelo Gemini Pro.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-stone-400 hover:text-[#f5ba42] transition-colors font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-transparent hover:border-[#231b14]"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Passo 1: Informações Básicas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Nome do Personagem:
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Alden Ventofrio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Jogador(a):
            </label>
            <input
              type="text"
              placeholder="Ex: Guilherme"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Nível (1-20):
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* Passo 2: Raça, Classe e Antecedente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Raça:
            </label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all"
            >
              {Object.keys(RACES_5E).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-[11px] text-[#f5ba42]/90 mt-1 font-medium">{raceDef.description}</p>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Classe:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all"
            >
              {Object.keys(CLASSES_5E).map(c => (
                <option key={c} value={c}>{c} ({CLASSES_5E[c].hitDie})</option>
              ))}
            </select>
            <p className="text-[11px] text-stone-400 mt-1">{classDef.description}</p>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Antecedente (Background):
            </label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all"
            >
              {Object.keys(BACKGROUNDS_5E).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <p className="text-[11px] text-stone-400 mt-1">{bgDef.feature}</p>
          </div>
        </div>

        {/* Passo 3: Atributos com Bônus Racial */}
        <div className="bg-[#0b0e15] p-5 rounded-2xl border border-[#231b14] space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="font-cinzel font-bold text-[#f5ba42] text-xs uppercase tracking-wider flex items-center gap-2">
              <Dices className="w-4 h-4 text-[#f5ba42]" />
              Atributos Base (Standard Array ou Rolagem):
            </span>
            <span className="text-[11px] text-stone-400">Bônus raciais somados automaticamente</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => {
              const racialBonus = raceDef.abilityBonuses[ab] || 0;
              const finalVal = finalAbilities[ab];
              const mod = getAbilityModifier(finalVal);

              return (
                <div key={ab} className="bg-[#141824] border border-[#262f44] hover:border-[#a17036] p-3 rounded-xl text-center transition-all shadow-sm">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    {ab.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={abilities[ab]}
                    onChange={(e) => setAbilities({ ...abilities, [ab]: parseInt(e.target.value) || 10 })}
                    className="w-14 text-center bg-[#0d101a] border border-[#37415e] focus:border-[#f5ba42] rounded-lg py-1 text-sm font-bold text-stone-100 outline-none"
                  />
                  <div className="text-[11px] text-stone-400 mt-1.5">
                    {racialBonus > 0 && <span className="text-emerald-400">+{racialBonus} race = </span>}
                    <strong className="text-[#f5ba42] font-cinzel font-bold">{finalVal}</strong> ({formatModifier(mod)})
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-300 bg-[#141824] p-3 rounded-xl border border-[#262f44]">
            <span className="flex items-center gap-2 font-medium">
              <Heart className="w-4 h-4 text-rose-500" />
              Pontos de Vida Estimados (Nível {level}):
            </span>
            <strong className="text-rose-400 font-cinzel text-base font-bold">{calculatedHp} HP</strong>
          </div>
        </div>

        {/* Passo 4: Perícias Treinadas */}
        <div className="space-y-2">
          <label className="block text-stone-300 font-semibold mb-2 uppercase tracking-wider text-[11px]">
            Perícias Treinadas ({selectedSkills.length} selecionadas):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(SKILL_ABILITY_MAP) as SkillName[]).map(sk => {
              const skDef = SKILL_ABILITY_MAP[sk];
              const isSelected = selectedSkills.includes(sk);

              return (
                <button
                  type="button"
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`px-3 py-2 rounded-xl text-left border flex items-center justify-between transition-all text-xs ${
                    isSelected
                      ? 'bg-[#231b14] border-[#a17036] text-[#f5ba42] font-semibold shadow-inner'
                      : 'bg-[#141824] border-[#262f44] text-stone-400 hover:text-stone-200 hover:border-[#37415e]'
                  }`}
                >
                  <span>{skDef.name} ({skDef.ability.toUpperCase()})</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba42]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Passo 5: Armas e Armaduras */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Armadura Equipada:
            </label>
            <select
              value={selectedArmorId}
              onChange={(e) => setSelectedArmorId(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all"
            >
              <option value="nenhuma">Nenhuma Armadura (CA 10 + Des)</option>
              {COMMON_ARMORS.filter(a => a.armorType !== 'escudo').map(a => (
                <option key={a.id} value={a.id}>{a.name} (Base {a.armorBonus})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="shieldCheck"
              checked={hasShield}
              onChange={(e) => setHasShield(e.target.checked)}
              className="w-4 h-4 rounded bg-[#141824] border-[#2b334a] text-[#f5ba42] focus:ring-0 cursor-pointer accent-[#a17036]"
            />
            <label htmlFor="shieldCheck" className="text-stone-300 font-semibold cursor-pointer text-xs">
              Equipar Escudo (+2 na CA)
            </label>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
              Arma Inicial:
            </label>
            <select
              value={selectedWeaponId}
              onChange={(e) => setSelectedWeaponId(e.target.value)}
              className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all"
            >
              {COMMON_WEAPONS.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.damage})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Passo 6: Ganchos Narrativos para o Gemini Pro */}
        <div className="bg-[#0b0e15] p-5 rounded-2xl border border-[#231b14] space-y-3">
          <div className="font-cinzel font-bold text-[#f5ba42] text-xs uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#f5ba42]" />
            Perfil Dramático (Injeção no Gemini Pro)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-stone-300 font-medium mb-1 text-[11px]">Ideais:</label>
              <input
                type="text"
                placeholder="Ex: Liberdade acima de tudo"
                value={ideals}
                onChange={(e) => setIdeals(e.target.value)}
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1 text-[11px]">Vínculos:</label>
              <input
                type="text"
                placeholder="Ex: Proteger minha irmã mais nova"
                value={bonds}
                onChange={(e) => setBonds(e.target.value)}
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1 text-[11px]">Defeitos:</label>
              <input
                type="text"
                placeholder="Ex: Nunca recua de uma briga"
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1 text-[11px]">Segredo ou Gancho da Campanha:</label>
              <input
                type="text"
                placeholder="Ex: É procurado por um culto fanático"
                value={secretsOrHooks}
                onChange={(e) => setSecretsOrHooks(e.target.value)}
                className="w-full bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none transition-all placeholder:text-stone-600"
              />
            </div>
          </div>
        </div>

        {/* Botão de Submissão */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-[#231b14]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#141824] hover:bg-[#1a2030] text-stone-300 border border-[#2b334a] hover:border-[#a17036] rounded-xl font-cinzel text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bronze-btn text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-900/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#f5ba42]" /> Criar e Adicionar ao Grupo
          </button>
        </div>
      </form>
    </div>
  );
};
