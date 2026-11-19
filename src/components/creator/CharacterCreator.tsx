import React, { useState, useMemo } from 'react';
import {
  Character,
  AbilityScores,
  SkillName,
  AbilityName,
  Alignment,
  Item,
  Spell
} from '../../core/types/dnd';
import {
  PHB_RACES,
  PHB_CLASSES,
  PHB_BACKGROUNDS,
  PHB_SPELLS_L0_L1,
  CLERIC_DOMAINS,
  SORCERER_ORIGINS,
  WARLOCK_PATRONS
} from '../../core/rules/characterCreationData';
import {
  getAbilityModifier,
  calculateArmorClass,
  calculateLevel1Hp,
  getPassiveSense,
  formatModifier
} from '../../core/rules/calculations';
import { COMMON_ARMORS, COMMON_WEAPONS, getClassPortrait } from '../../core/rules/srdData';

// Subcomponentes dos passos
import { StepRace } from './steps/StepRace';
import { StepClass } from './steps/StepClass';
import { StepAbilities, AbilityGenerationMethod } from './steps/StepAbilities';
import { StepBackground } from './steps/StepBackground';
import { StepEquipment, EquipmentMode } from './steps/StepEquipment';
import { StepSpells } from './steps/StepSpells';
import { LivePreviewSheet } from './LivePreviewSheet';

// Ícones
import {
  UserPlus,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Shield,
  Sword,
  Dices,
  BookOpen,
  Package,
  Wand2,
  X
} from 'lucide-react';

interface CharacterCreatorProps {
  onAddCharacter: (character: Character) => void;
  onCancel: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onAddCharacter, onCancel }) => {
  // ==========================================
  // ESTADOS DO FLUXO DO WIZARD
  // ==========================================
  const [currentStep, setCurrentStep] = useState<number>(1);

  // ==========================================
  // ESTADO 1: RAÇA E SUB-RAÇA
  // ==========================================
  const [selectedRace, setSelectedRace] = useState<string>('Humano');
  const [selectedSubrace, setSelectedSubrace] = useState<string>('');
  const [halfElfBonusAbilities, setHalfElfBonusAbilities] = useState<AbilityName[]>(['des', 'con']);
  const [draconicAncestryColor, setDraconicAncestryColor] = useState<string>('Vermelho');
  const [dwarfTool, setDwarfTool] = useState<string>('Ferramentas de Ferreiro');
  const [highElfCantripId, setHighElfCantripId] = useState<string>('sp_raio_fogo');
  const [extraRaceLanguage, setExtraRaceLanguage] = useState<string>('Élfico');

  // ==========================================
  // ESTADO 2: CLASSE E NÍVEL 1
  // ==========================================
  const [selectedClass, setSelectedClass] = useState<string>('Guerreiro');
  const [level] = useState<number>(1);
  const [selectedClassSkills, setSelectedClassSkills] = useState<SkillName[]>(['atletismo', 'percepcao']);
  const [fightingStyle, setFightingStyle] = useState<string>('defesa');
  const [favoredEnemy, setFavoredEnemy] = useState<string>('humanoides');
  const [naturalExplorer, setNaturalExplorer] = useState<string>('floresta');
  const [rogueExpertise, setRogueExpertise] = useState<SkillName[]>(['furtividade', 'prestidigitacao']);
  const [selectedSubclass, setSelectedSubclass] = useState<string>('');

  // ==========================================
  // ESTADO 3: ATRIBUTOS BASE
  // ==========================================
  const [abilityMethod, setAbilityMethod] = useState<AbilityGenerationMethod>('standard_array');
  const [baseAbilities, setBaseAbilities] = useState<AbilityScores>({
    for: 15,
    des: 14,
    con: 13,
    int: 12,
    sab: 10,
    car: 8
  });

  // ==========================================
  // ESTADO 4: ANTECEDENTE & ROLEPLAY
  // ==========================================
  const [name, setName] = useState<string>('');
  const [player, setPlayer] = useState<string>('');
  const [gender, setGender] = useState<'masculino' | 'feminino'>('masculino');
  const [alignment, setAlignment] = useState<Alignment>('Leal e Bom');
  const [selectedBackground, setSelectedBackground] = useState<string>('Soldado');
  const [replacementSkills, setReplacementSkills] = useState<SkillName[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<string>('');
  const [ideals, setIdeals] = useState<string>('');
  const [bonds, setBonds] = useState<string>('');
  const [flaws, setFlaws] = useState<string>('');
  const [secretsOrHooks, setSecretsOrHooks] = useState<string>('');

  // ==========================================
  // ESTADO 5: EQUIPAMENTO INICIAL
  // ==========================================
  const [equipmentMode, setEquipmentMode] = useState<EquipmentMode>('package');
  const [selectedBranchChoices, setSelectedBranchChoices] = useState<Record<string, number>>({});
  const [startingGoldRolled, setStartingGoldRolled] = useState<number>(0);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equippedArmorId, setEquippedArmorId] = useState<string>('eq_cota_malha');
  const [isShieldEquipped, setIsShieldEquipped] = useState<boolean>(true);
  const [equippedWeaponIds, setEquippedWeaponIds] = useState<string[]>(['eq_espada_longa']);
  const [coins, setCoins] = useState<{ pc: number; pp: number; pe: number; po: number; pl: number }>({
    pc: 0,
    pp: 0,
    pe: 0,
    po: 10,
    pl: 0
  });

  // ==========================================
  // ESTADO 6: MAGIAS DE NÍVEL 1
  // ==========================================
  const [selectedCantripIds, setSelectedCantripIds] = useState<string[]>([]);
  const [selectedSpellIds, setSelectedSpellIds] = useState<string[]>([]);

  // ==========================================
  // CÁLCULOS DERIVADOS E REGRAS CRUZADAS
  // ==========================================
  const raceDef = PHB_RACES[selectedRace] || PHB_RACES['Humano'];
  const subraceDef = raceDef.subraces?.find(s => s.id === selectedSubrace);
  const classDef = PHB_CLASSES[selectedClass] || PHB_CLASSES['Guerreiro'];
  const bgDef = PHB_BACKGROUNDS[selectedBackground] || PHB_BACKGROUNDS['Soldado'];

  // Verifica se a classe ou raça tem conjuração no nível 1
  const isSpellcaster = Boolean(
    classDef.spellcastingAbility ||
    raceDef.innateSpell ||
    subraceDef?.innateSpell ||
    subraceDef?.chooseCantrip
  );

  const totalSteps = isSpellcaster ? 6 : 5;

  // 1. Bônus de Atributo Raciais Combinados (Base + Sub-raça + Meio-Elfo)
  const racialBonuses = useMemo(() => {
    const bonuses: Partial<Record<AbilityName, number>> = { ...raceDef.baseAbilityBonuses };

    // Bônus de sub-raça
    if (subraceDef) {
      Object.entries(subraceDef.abilityBonuses).forEach(([ab, val]) => {
        const key = ab as AbilityName;
        bonuses[key] = (bonuses[key] || 0) + (val || 0);
      });
    }

    // Bônus flexível de Meio-Elfo (+1 em 2 atributos à escolha)
    if (raceDef.hasFlexibleAbilityBonus) {
      halfElfBonusAbilities.forEach(ab => {
        bonuses[ab] = (bonuses[ab] || 0) + 1;
      });
    }

    return bonuses;
  }, [raceDef, subraceDef, halfElfBonusAbilities]);

  // 2. Atributos Finais: Base + Racial
  const finalAbilities: AbilityScores = useMemo(() => {
    return {
      for: baseAbilities.for + (racialBonuses.for || 0),
      des: baseAbilities.des + (racialBonuses.des || 0),
      con: baseAbilities.con + (racialBonuses.con || 0),
      int: baseAbilities.int + (racialBonuses.int || 0),
      sab: baseAbilities.sab + (racialBonuses.sab || 0),
      car: baseAbilities.car + (racialBonuses.car || 0),
    };
  }, [baseAbilities, racialBonuses]);

  // 3. Deslocamento Base
  const currentSpeed = subraceDef?.speed || raceDef.baseSpeed;

  // 4. Perícias Concedidas pela Raça
  const raceGrantedSkills = useMemo(() => {
    const skills: SkillName[] = [...(raceDef.freeSkills || [])];
    if (subraceDef?.proficiencies?.skills) {
      skills.push(...subraceDef.proficiencies.skills);
    }
    return skills;
  }, [raceDef, subraceDef]);

  // 5. Perícias Concedidas pelo Antecedente com Regra PHB pág. 125
  const bgSkillCollisions = useMemo(() => {
    const alreadyChosen = [...raceGrantedSkills, ...selectedClassSkills];
    return bgDef.skillProficiencies.map((sk, idx) => {
      const isColliding = alreadyChosen.includes(sk);
      return {
        originalSkill: sk,
        isColliding,
        effectiveSkill: isColliding ? (replacementSkills[idx] || sk) : sk
      };
    });
  }, [bgDef, raceGrantedSkills, selectedClassSkills, replacementSkills]);

  // Lista consolidada de todas as perícias do personagem
  const allProficientSkills = useMemo(() => {
    const list = new Set<SkillName>([
      ...raceGrantedSkills,
      ...selectedClassSkills,
      ...bgSkillCollisions.map(c => c.effectiveSkill)
    ]);
    return Array.from(list);
  }, [raceGrantedSkills, selectedClassSkills, bgSkillCollisions]);

  // 6. Cálculo dos Pontos de Vida (PV) no Nível 1
  const calculatedHp = useMemo(() => {
    return calculateLevel1Hp(
      classDef.hitDieValue,
      finalAbilities.con,
      selectedSubrace,
      selectedSubclass
    );
  }, [classDef.hitDieValue, finalAbilities.con, selectedSubrace, selectedSubclass]);

  // 7. Equipamentos e Moedas Atualizados quando muda o pacote da classe
  const resolvedInventory = useMemo(() => {
    if (equipmentMode === 'wealth') {
      return inventory;
    }

    const items: Item[] = [];

    // Escolhas ramificadas da classe
    classDef.startingEquipmentChoices.forEach(group => {
      const chosenIdx = selectedBranchChoices[group.id] ?? 0;
      const option = group.options[chosenIdx] || group.options[0];
      if (option) {
        items.push(...option.items);
      }
    });

    // Itens fixos da classe
    items.push(...classDef.fixedStartingEquipment);

    // Itens fixos do antecedente
    items.push(...bgDef.fixedEquipment);

    return items;
  }, [equipmentMode, inventory, classDef, selectedBranchChoices, bgDef]);

  // Itens equipados
  const equippedArmorItem = COMMON_ARMORS.find(a => a.id === equippedArmorId) || resolvedInventory.find(i => i.id === equippedArmorId);
  const equippedShieldItem = isShieldEquipped
    ? (resolvedInventory.find(i => i.name.toLowerCase().includes('escudo')) || COMMON_ARMORS.find(a => a.id === 'arm_escudo'))
    : undefined;
  const equippedWeapons = resolvedInventory.filter(i => i.type === 'arma' && (equippedWeaponIds.includes(i.id) || i.isEquipped));

  // Magias consolidadas (da classe + inatas raciais)
  const consolidatedSpells: Spell[] = useMemo(() => {
    const list: Spell[] = [];

    // Magias de truques da classe
    selectedCantripIds.forEach(id => {
      const sp = PHB_SPELLS_L0_L1.find(s => s.id === id);
      if (sp) list.push({ ...sp, prepared: true });
    });

    // Magias de 1º círculo da classe
    selectedSpellIds.forEach(id => {
      const sp = PHB_SPELLS_L0_L1.find(s => s.id === id);
      if (sp) list.push({ ...sp, prepared: true });
    });

    // Magias de Domínio do Clérigo
    if (selectedClass === 'Clérigo') {
      const domain = CLERIC_DOMAINS.find(d => d.id === selectedSubclass);
      domain?.domainSpells?.forEach(dId => {
        if (!selectedSpellIds.includes(dId)) {
          const sp = PHB_SPELLS_L0_L1.find(s => s.id === dId);
          if (sp) list.push({ ...sp, prepared: true });
        }
      });
    }

    // Magia inata racial
    if (raceDef.innateSpell) {
      list.push({
        id: raceDef.innateSpell.spellId,
        name: raceDef.innateSpell.spellName,
        level: raceDef.innateSpell.level,
        school: 'Transmutação',
        castingTime: '1 ação',
        range: '9 metros',
        components: 'V',
        duration: '1 minuto',
        description: raceDef.innateSpell.description,
        prepared: true
      });
    }
    if (subraceDef?.innateSpell) {
      list.push({
        id: subraceDef.innateSpell.spellId,
        name: subraceDef.innateSpell.spellName,
        level: subraceDef.innateSpell.level,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '18 metros',
        components: 'V, S',
        duration: '1 minuto',
        description: subraceDef.innateSpell.description,
        prepared: true
      });
    }
    if (selectedSubrace === 'alto_elfo' && highElfCantripId) {
      const sp = PHB_SPELLS_L0_L1.find(s => s.id === highElfCantripId);
      if (sp && !list.some(s => s.id === sp.id)) {
        list.push({ ...sp, prepared: true });
      }
    }

    return list;
  }, [selectedCantripIds, selectedSpellIds, selectedClass, selectedSubclass, raceDef, subraceDef, selectedSubrace, highElfCantripId]);

  // ==========================================
  // VALIDAÇÕES DE CADA ETAPA
  // ==========================================
  const stepValidation = useMemo(() => {
    // Passo 1: Raça
    let isStep1Valid = true;
    let step1Error = '';
    if (raceDef.hasFlexibleAbilityBonus && halfElfBonusAbilities.length !== 2) {
      isStep1Valid = false;
      step1Error = 'Selecione exatamente 2 atributos diferentes para o Meio-Elfo.';
    }

    // Passo 2: Classe
    let isStep2Valid = true;
    let step2Error = '';
    const maxSkills = classDef.skillChoices.count;
    if (selectedClassSkills.length !== maxSkills) {
      isStep2Valid = false;
      step2Error = `Selecione exatamente ${maxSkills} perícias para a classe ${selectedClass}.`;
    } else if (classDef.requiresSubclassAtL1 && !selectedSubclass) {
      isStep2Valid = false;
      step2Error = `Selecione a subclasse de 1º nível para o ${selectedClass}.`;
    } else if (classDef.requiresExpertise && rogueExpertise.length !== 2) {
      isStep2Valid = false;
      step2Error = 'Selecione exatamente 2 perícias para Especialização do Ladino.';
    }

    // Passo 3: Atributos
    let isStep3Valid = true;
    let step3Error = '';
    if (abilityMethod === 'point_buy') {
      const totalPoints = Object.values(baseAbilities).reduce((acc, score) => {
        const costMap: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
        return acc + (costMap[score] || 0);
      }, 0);
      if (totalPoints > 27) {
        isStep3Valid = false;
        step3Error = 'Você excedeu os 27 pontos permitidos no Point Buy.';
      }
    }

    // Passo 4: Antecedente
    let isStep4Valid = true;
    let step4Error = '';
    if (!name.trim()) {
      isStep4Valid = false;
      step4Error = 'Por favor, informe o Nome do Personagem.';
    } else {
      // Checa se colisões foram resolvidas
      const hasUnresolvedConflict = bgSkillCollisions.some(
        c => c.isColliding && (!c.effectiveSkill || c.effectiveSkill === c.originalSkill)
      );
      if (hasUnresolvedConflict) {
        isStep4Valid = false;
        step4Error = 'Resolva a colisão de perícia do antecedente escolhendo uma perícia substituta.';
      }
    }

    // Passo 5: Equipamento
    const isStep5Valid = true;
    const step5Error = '';

    // Passo 6: Magias
    let isStep6Valid = true;
    let step6Error = '';
    if (isSpellcaster && classDef.cantripsKnownAtL1) {
      if (selectedCantripIds.length !== classDef.cantripsKnownAtL1) {
        isStep6Valid = false;
        step6Error = `Selecione exatamente ${classDef.cantripsKnownAtL1} truques da classe.`;
      }
      let requiredSpells = 0;
      if (classDef.spellsKnownAtL1) requiredSpells = classDef.spellsKnownAtL1;
      else if (classDef.isSpellbookCaster) requiredSpells = 6;
      else if (classDef.isPreparedCaster) requiredSpells = Math.max(1, getAbilityModifier(finalAbilities.sab) + 1);

      if (selectedSpellIds.length !== requiredSpells) {
        isStep6Valid = false;
        step6Error = `Selecione exatamente ${requiredSpells} magias de 1º círculo.`;
      }
    }

    return {
      step1: { isValid: isStep1Valid, error: step1Error },
      step2: { isValid: isStep2Valid, error: step2Error },
      step3: { isValid: isStep3Valid, error: step3Error },
      step4: { isValid: isStep4Valid, error: step4Error },
      step5: { isValid: isStep5Valid, error: step5Error },
      step6: { isValid: isStep6Valid, error: step6Error },
    };
  }, [
    raceDef,
    halfElfBonusAbilities,
    classDef,
    selectedClassSkills,
    selectedSubclass,
    rogueExpertise,
    abilityMethod,
    baseAbilities,
    name,
    bgSkillCollisions,
    isSpellcaster,
    selectedCantripIds,
    selectedSpellIds,
    finalAbilities.sab
  ]);

  const canAdvance = (() => {
    switch (currentStep) {
      case 1: return stepValidation.step1.isValid;
      case 2: return stepValidation.step2.isValid;
      case 3: return stepValidation.step3.isValid;
      case 4: return stepValidation.step4.isValid;
      case 5: return stepValidation.step5.isValid;
      case 6: return stepValidation.step6.isValid;
      default: return true;
    }
  })();

  const currentStepError = (() => {
    switch (currentStep) {
      case 1: return stepValidation.step1.error;
      case 2: return stepValidation.step2.error;
      case 3: return stepValidation.step3.error;
      case 4: return stepValidation.step4.error;
      case 5: return stepValidation.step5.error;
      case 6: return stepValidation.step6.error;
      default: return '';
    }
  })();

  // ==========================================
  // FINALIZAÇÃO DA FICHA E DISPATCH
  // ==========================================
  const handleFinalSubmit = () => {
    if (!stepValidation.step1.isValid || !stepValidation.step2.isValid ||
        !stepValidation.step3.isValid || !stepValidation.step4.isValid ||
        !stepValidation.step5.isValid || (isSpellcaster && !stepValidation.step6.isValid)) {
      alert('Por favor, verifique as etapas pendentes antes de finalizar a ficha.');
      return;
    }

    // Monta notas ricas com todas as características
    const traitsList: string[] = [];
    if (personalityTraits) traitsList.push(personalityTraits);

    const notesSummary = [
      `[Raça: ${selectedRace} ${selectedSubrace ? `(${subraceDef?.name})` : ''}]`,
      `[Traços Raciais: ${(raceDef.traits || []).concat(subraceDef?.traits || []).join('; ')}]`,
      classDef.requiresFightingStyle ? `[Estilo de Luta: ${fightingStyle}]` : '',
      classDef.requiresFavoredEnemy ? `[Inimigo Favorito: ${favoredEnemy} • Terreno: ${naturalExplorer}]` : '',
      `[Característica do Antecedente: ${bgDef.feature.name}]`,
      `[Idiomas: ${raceDef.languages.concat(extraRaceLanguage ? [extraRaceLanguage] : []).join(', ')}]`
    ].filter(Boolean).join('\n\n');

    // Espaços de magia
    const spellSlots: Character['spellSlots'] = {};
    if (classDef.spellSlotsL1) {
      Object.entries(classDef.spellSlotsL1).forEach(([lvl, count]) => {
        spellSlots[Number(lvl)] = { max: count, used: 0 };
      });
    }

    // Moedas finais
    const finalCoins = equipmentMode === 'package'
      ? { pc: 0, pp: 0, pe: 0, po: bgDef.startingGold, pl: 0 }
      : coins;

    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      player: player.trim() || 'Jogador',
      race: selectedRace,
      subrace: subraceDef?.name,
      class: selectedClass,
      subclass: selectedSubclass ? (
        CLERIC_DOMAINS.find(d => d.id === selectedSubclass)?.name ||
        SORCERER_ORIGINS.find(o => o.id === selectedSubclass)?.name ||
        WARLOCK_PATRONS.find(p => p.id === selectedSubclass)?.name ||
        selectedSubclass
      ) : undefined,
      level: 1,
      xp: 0,
      alignment,
      background: selectedBackground,
      baseAbilities: finalAbilities,
      savingThrowProficiencies: classDef.savingThrows,
      skillProficiencies: allProficientSkills,
      skillExpertise: selectedClass === 'Ladino' ? rogueExpertise : [],
      maxHp: calculatedHp,
      currentHp: calculatedHp,
      tempHp: 0,
      hitDie: classDef.hitDie,
      hitDiceTotal: 1,
      hitDiceUsed: 0,
      deathSaves: { successes: 0, failures: 0 },
      speed: currentSpeed,
      hasInspiration: false,
      equippedArmor: equippedArmorItem,
      equippedShield: equippedShieldItem,
      weapons: equippedWeapons.length > 0 ? equippedWeapons : (COMMON_WEAPONS.slice(0, 1)),
      spellcastingAbility: classDef.spellcastingAbility,
      spellSlots,
      spells: consolidatedSpells,
      inventory: resolvedInventory,
      coins: finalCoins,
      personality: {
        traits: traitsList.length > 0 ? traitsList : ['Aventureiro audaz e confiável.'],
        ideals: ideals.trim() || 'Honra e justiça guiam meus passos.',
        bonds: bonds.trim() || 'Lealdade eterna aos meus companheiros de armas.',
        flaws: flaws.trim() || 'Minha coragem beira a imprudência em momentos críticos.',
        backstory: `Treinado sob as tradições da classe ${selectedClass} e com raízes no antecedente ${selectedBackground}.`,
        secretsOrHooks: secretsOrHooks.trim() || 'Carrega um amuleto gravado com símbolos antigos e misteriosos.'
      },
      conditions: [],
      notes: notesSummary,
      gender,
      avatarUrl: getClassPortrait(selectedClass, gender)
    };

    onAddCharacter(newChar);
  };

  // ==========================================
  // CONFIGURAÇÃO DOS PASSOS DO WIZARD
  // ==========================================
  const wizardSteps = [
    { id: 1, label: 'Raça & Sub-raça', icon: Sparkles },
    { id: 2, label: 'Classe & Nível 1', icon: Sword },
    { id: 3, label: 'Atributos Base', icon: Dices },
    { id: 4, label: 'Antecedente & Perfil', icon: BookOpen },
    { id: 5, label: 'Equipamento', icon: Package },
    ...(isSpellcaster ? [{ id: 6, label: 'Magias Nível 1', icon: Wand2 }] : [])
  ];

  return (
    <div
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat border-2 border-[#a17036] rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-7xl mx-auto space-y-6 text-stone-200"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10, 13, 20, 0.65) 0%, rgba(8, 10, 16, 0.82) 40%, rgba(6, 7, 10, 0.95) 100%), url('/artes/herois_1.jpeg')`
      }}
    >
      {/* 1. TOPO: TÍTULO, SUBTÍTULO E CANCELAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#231b14] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a17036]/90 to-[#4a3419]/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-[#f5ba42]/30">
            <UserPlus className="w-6 h-6 text-[#ffd470]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-black gold-gradient-text uppercase tracking-wider">
              Criador de Personagem 5e (PHB 2014)
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Refatorado com 100% de fidedignidade às regras oficiais: Raças, Sub-raças, Subclasses Nível 1, 3 Métodos de Atributos, Resolução de Conflitos e Grimório.
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-stone-400 hover:text-[#f5ba42] transition-colors font-semibold uppercase tracking-wider px-3.5 py-2 rounded-xl border border-transparent hover:border-[#2b354f] flex items-center gap-1.5"
        >
          <X className="w-4 h-4" /> Cancelar Criação
        </button>
      </div>

      {/* 2. STEPPER PROGRESS BAR (NAVEGAÇÃO POR ABAS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {wizardSteps.map((step) => {
          const StepIcon = step.icon;
          const isCurrent = currentStep === step.id;
          const isPassed = currentStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#2a2016]/95 to-[#1c1610]/95 border-[#f5ba42] text-[#f5ba42] shadow-md shadow-amber-950/30 backdrop-blur-sm'
                  : isPassed
                  ? 'bg-[#121622]/80 backdrop-blur-sm border-[#34405e] text-stone-300 hover:border-[#4d5e8a] hover:bg-[#161c2c]/90'
                  : 'bg-[#0e111a]/70 backdrop-blur-sm border-[#1d2333] text-stone-500 hover:border-[#2b354f] hover:bg-[#121622]/80'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                  isCurrent
                    ? 'bg-[#f5ba42] text-stone-950 border-amber-300'
                    : isPassed
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
                    : 'bg-[#181d2c] border-[#293247] text-stone-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <div className="truncate min-w-0">
                <span className="text-[11px] font-bold block truncate font-cinzel">{step.label}</span>
                <span className="text-[9px] text-stone-400 block">Passo {step.id}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. CORPO CENTRAL: PASSO ATUAL (ESQUERDA) + LIVE PREVIEW SHEET (DIREITA) */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Lado Esquerdo: Formulário Dinâmico da Etapa Atual */}
        <div className="flex-1 w-full min-w-0 bg-[#0a0c13]/80 backdrop-blur-md border border-[#231b14]/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          {currentStep === 1 && (
            <StepRace
              selectedRace={selectedRace}
              onSelectRace={setSelectedRace}
              selectedSubrace={selectedSubrace}
              onSelectSubrace={setSelectedSubrace}
              halfElfBonusAbilities={halfElfBonusAbilities}
              onChangeHalfElfBonusAbilities={setHalfElfBonusAbilities}
              draconicAncestryColor={draconicAncestryColor}
              onChangeDraconicAncestry={setDraconicAncestryColor}
              dwarfTool={dwarfTool}
              onChangeDwarfTool={setDwarfTool}
              highElfCantripId={highElfCantripId}
              onChangeHighElfCantrip={setHighElfCantripId}
              extraLanguage={extraRaceLanguage}
              onChangeExtraLanguage={setExtraRaceLanguage}
            />
          )}

          {currentStep === 2 && (
            <StepClass
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              level={level}
              gender={gender}
              onChangeGender={setGender}
              selectedClassSkills={selectedClassSkills}
              onToggleClassSkill={(sk) => {
                if (selectedClassSkills.includes(sk)) {
                  setSelectedClassSkills(selectedClassSkills.filter(s => s !== sk));
                } else {
                  const max = classDef.skillChoices.count;
                  if (selectedClassSkills.length < max) {
                    setSelectedClassSkills([...selectedClassSkills, sk]);
                  }
                }
              }}
              raceGrantedSkills={raceGrantedSkills}
              fightingStyle={fightingStyle}
              onChangeFightingStyle={setFightingStyle}
              favoredEnemy={favoredEnemy}
              onChangeFavoredEnemy={setFavoredEnemy}
              naturalExplorer={naturalExplorer}
              onChangeNaturalExplorer={setNaturalExplorer}
              rogueExpertise={rogueExpertise}
              onToggleRogueExpertise={(sk) => {
                if (rogueExpertise.includes(sk)) {
                  setRogueExpertise(rogueExpertise.filter(s => s !== sk));
                } else if (rogueExpertise.length < 2) {
                  setRogueExpertise([...rogueExpertise, sk]);
                }
              }}
              selectedSubclass={selectedSubclass}
              onSelectSubclass={setSelectedSubclass}
            />
          )}

          {currentStep === 3 && (
            <StepAbilities
              method={abilityMethod}
              onChangeMethod={setAbilityMethod}
              baseAbilities={baseAbilities}
              onChangeBaseAbilities={setBaseAbilities}
              racialBonuses={racialBonuses}
              finalAbilities={finalAbilities}
            />
          )}

          {currentStep === 4 && (
            <StepBackground
              name={name}
              onChangeName={setName}
              player={player}
              onChangePlayer={setPlayer}
              gender={gender}
              onChangeGender={setGender}
              selectedBackground={selectedBackground}
              onSelectBackground={setSelectedBackground}
              conflictedSkills={bgSkillCollisions.filter(c => c.isColliding).map(c => c.originalSkill)}
              replacementSkills={replacementSkills}
              onSelectReplacementSkill={(idx, sk) => {
                const next = [...replacementSkills];
                next[idx] = sk;
                setReplacementSkills(next);
              }}
              alreadyChosenSkills={[...raceGrantedSkills, ...selectedClassSkills]}
              personalityTraits={personalityTraits}
              onChangePersonalityTraits={setPersonalityTraits}
              ideals={ideals}
              onChangeIdeals={setIdeals}
              bonds={bonds}
              onChangeBonds={setBonds}
              flaws={flaws}
              onChangeFlaws={setFlaws}
              secretsOrHooks={secretsOrHooks}
              onChangeSecretsOrHooks={setSecretsOrHooks}
            />
          )}

          {currentStep === 5 && (
            <StepEquipment
              mode={equipmentMode}
              onChangeMode={setEquipmentMode}
              selectedClass={selectedClass}
              selectedBackground={selectedBackground}
              selectedBranchChoices={selectedBranchChoices}
              onChangeBranchChoice={(groupId, optIdx) => {
                setSelectedBranchChoices({
                  ...selectedBranchChoices,
                  [groupId]: optIdx
                });
              }}
              startingGoldRolled={startingGoldRolled}
              onRollWealth={setStartingGoldRolled}
              inventory={resolvedInventory}
              onUpdateInventory={setInventory}
              equippedArmorId={equippedArmorId}
              onChangeEquippedArmor={setEquippedArmorId}
              isShieldEquipped={isShieldEquipped}
              onToggleShield={setIsShieldEquipped}
              equippedWeaponIds={equippedWeaponIds}
              onToggleEquippedWeapon={(wId) => {
                setEquippedWeaponIds([wId]);
              }}
              coins={coins}
              onChangeCoins={setCoins}
            />
          )}

          {currentStep === 6 && isSpellcaster && (
            <StepSpells
              selectedClass={selectedClass}
              selectedSubclass={selectedSubclass}
              level={level}
              castingAbility={classDef.spellcastingAbility}
              abilityScore={classDef.spellcastingAbility ? finalAbilities[classDef.spellcastingAbility] : 10}
              selectedCantripIds={selectedCantripIds}
              onToggleCantrip={(cId) => {
                if (selectedCantripIds.includes(cId)) {
                  setSelectedCantripIds(selectedCantripIds.filter(id => id !== cId));
                } else if (selectedCantripIds.length < (classDef.cantripsKnownAtL1 || 0)) {
                  setSelectedCantripIds([...selectedCantripIds, cId]);
                }
              }}
              selectedSpellIds={selectedSpellIds}
              onToggleSpell={(sId) => {
                if (selectedSpellIds.includes(sId)) {
                  setSelectedSpellIds(selectedSpellIds.filter(id => id !== sId));
                } else {
                  setSelectedSpellIds([...selectedSpellIds, sId]);
                }
              }}
              racialSpells={[
                ...(raceDef.innateSpell ? [{
                  name: raceDef.innateSpell.spellName,
                  ability: raceDef.innateSpell.ability,
                  desc: raceDef.innateSpell.description
                }] : []),
                ...(subraceDef?.innateSpell ? [{
                  name: subraceDef.innateSpell.spellName,
                  ability: subraceDef.innateSpell.ability,
                  desc: subraceDef.innateSpell.description
                }] : [])
              ]}
            />
          )}

          {/* Barra de Navegação Inferior (Voltar, Alertas, Avançar / Concluir) */}
          <div className="pt-4 border-t border-[#1f2638] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="px-4 py-2.5 rounded-xl border border-[#2b354f] bg-[#121622] hover:bg-[#1a2030] text-stone-300 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Passo Anterior
            </button>

            {/* Mensagem de Erro/Alerta do Passo se houver */}
            <div className="flex-1 text-center min-w-[200px]">
              {currentStepError && (
                <span className="text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 bg-amber-950/40 border border-amber-800/60 py-1.5 px-3 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {currentStepError}
                </span>
              )}
            </div>

            {currentStep < totalSteps ? (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                className="px-6 py-2.5 bronze-btn rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Próximo Passo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={handleFinalSubmit}
                className="px-7 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:brightness-110 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xl shadow-amber-900/50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" /> Finalizar e Criar Ficha 5e
              </button>
            )}
          </div>
        </div>

        {/* Lado Direito: Live Sheet Preview (Resumo em Tempo Real) */}
        <LivePreviewSheet
          name={name}
          player={player}
          race={selectedRace}
          subrace={subraceDef?.name}
          className={selectedClass}
          subclass={selectedSubclass ? (
            CLERIC_DOMAINS.find(d => d.id === selectedSubclass)?.name ||
            SORCERER_ORIGINS.find(o => o.id === selectedSubclass)?.name ||
            WARLOCK_PATRONS.find(p => p.id === selectedSubclass)?.name ||
            selectedSubclass
          ) : undefined}
          level={level}
          gender={gender}
          alignment={alignment}
          background={selectedBackground}
          finalAbilities={finalAbilities}
          savingThrowProficiencies={classDef.savingThrows}
          skillProficiencies={allProficientSkills}
          skillExpertise={selectedClass === 'Ladino' ? rogueExpertise : []}
          maxHp={calculatedHp}
          speed={currentSpeed}
          equippedArmor={equippedArmorItem}
          equippedShield={equippedShieldItem}
          weapons={equippedWeapons}
          fightingStyle={fightingStyle}
          spells={consolidatedSpells}
          spellcastingAbility={classDef.spellcastingAbility}
          coins={equipmentMode === 'package' ? { pc: 0, pp: 0, pe: 0, po: bgDef.startingGold, pl: 0 } : coins}
          inventory={resolvedInventory}
          traits={[
            personalityTraits || 'Pragmático e corajoso.',
            ideals || 'Lealdade aos companheiros de armas.',
            bonds || 'Proteger sua terra natal.',
            flaws || 'Dificuldade em confiar em estranhos.'
          ]}
        />
      </div>
    </div>
  );
};
