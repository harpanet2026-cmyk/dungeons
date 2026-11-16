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
    <div className="bg-[#151924] border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            Criador de Personagem 5e (SRD)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Criação de heróis com validação matemática e campos de perfil otimizados para narração pelo Gemini Pro.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Passo 1: Informações Básicas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome do Personagem:</label>
            <input
              type="text"
              required
              placeholder="Ex: Alden Ventofrio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Jogador(a):</label>
            <input
              type="text"
              placeholder="Ex: Guilherme"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nível (1-20):</label>
            <input
              type="number"
              min="1"
              max="20"
              value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Passo 2: Raça, Classe e Antecedente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Raça:</label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {Object.keys(RACES_5E).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-[10px] text-amber-300 mt-1">{raceDef.description}</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Classe:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {Object.keys(CLASSES_5E).map(c => (
                <option key={c} value={c}>{c} ({CLASSES_5E[c].hitDie})</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">{classDef.description}</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Antecedente (Background):</label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {Object.keys(BACKGROUNDS_5E).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">{bgDef.feature}</p>
          </div>
        </div>

        {/* Passo 3: Atributos com Bônus Racial */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Dices className="w-4 h-4 text-amber-400" />
              Atributos Base (Standard Array ou Rolagem):
            </span>
            <span className="text-[10px] text-slate-400">Bônus raciais somados automaticamente</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => {
              const racialBonus = raceDef.abilityBonuses[ab] || 0;
              const finalVal = finalAbilities[ab];
              const mod = getAbilityModifier(finalVal);

              return (
                <div key={ab} className="bg-slate-900 border border-slate-700/80 p-2.5 rounded-lg text-center">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{ab}</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={abilities[ab]}
                    onChange={(e) => setAbilities({ ...abilities, [ab]: parseInt(e.target.value) || 10 })}
                    className="w-14 text-center bg-slate-950 border border-slate-600 rounded py-0.5 text-sm font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    {racialBonus > 0 && <span className="text-emerald-400">+{racialBonus} racial = </span>}
                    <strong className="text-amber-300 font-bold">{finalVal}</strong> ({formatModifier(mod)})
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Pontos de Vida Estimados (Nível {level}):
            </span>
            <strong className="text-rose-400 text-sm font-bold">{calculatedHp} HP</strong>
          </div>
        </div>

        {/* Passo 4: Perícias Treinadas */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2">
            Perícias Treinadas ({selectedSkills.length} selecionadas):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(SKILL_ABILITY_MAP) as SkillName[]).map(sk => {
              const skDef = SKILL_ABILITY_MAP[sk];
              const isSelected = selectedSkills.includes(sk);
              const isBgSkill = bgDef.skillProficiencies.includes(sk);

              return (
                <button
                  type="button"
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`px-2.5 py-1.5 rounded text-left border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{skDef.name} ({skDef.ability.toUpperCase()})</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Passo 5: Armas e Armaduras */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Armadura Equipada:</label>
            <select
              value={selectedArmorId}
              onChange={(e) => setSelectedArmorId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
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
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
            />
            <label htmlFor="shieldCheck" className="text-slate-300 font-semibold cursor-pointer">
              Equipar Escudo (+2 na CA)
            </label>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Arma Inicial:</label>
            <select
              value={selectedWeaponId}
              onChange={(e) => setSelectedWeaponId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {COMMON_WEAPONS.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.damage})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Passo 6: Ganchos Narrativos para o Gemini Pro */}
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Perfil Dramático (Injeção no Gemini Pro)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Ideais:</label>
              <input
                type="text"
                placeholder="Ex: Liberdade acima de tudo"
                value={ideals}
                onChange={(e) => setIdeals(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Vínculos:</label>
              <input
                type="text"
                placeholder="Ex: Proteger minha irmã mais nova"
                value={bonds}
                onChange={(e) => setBonds(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Defeitos:</label>
              <input
                type="text"
                placeholder="Ex: Nunca recua de uma briga"
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Segredo ou Gancho da Campanha:</label>
              <input
                type="text"
                placeholder="Ex: É procurado por um culto fanático"
                value={secretsOrHooks}
                onChange={(e) => setSecretsOrHooks(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Botão de Submissão */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-4 h-4" /> Criar e Adicionar ao Grupo
          </button>
        </div>
      </form>
    </div>
  );
};
