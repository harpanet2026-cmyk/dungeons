import React, { useState, useEffect } from 'react';
import { Character, Condition, SkillName, AbilityName } from '../../core/types/dnd';
import {
  calculateArmorClass,
  getPassiveSense,
  getAbilityModifier,
  formatModifier,
  calculateSpellcastingMetrics,
  getSkillModifier,
  SKILL_ABILITY_MAP
} from '../../core/rules/calculations';
import { getWeaponImage } from '../../core/rules/srdData';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  Dices,
  Eye,
  Skull,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Image as ImageIcon,
  Swords,
  Scroll,
  Coins,
  Backpack,
  RotateCw,
  Compass,
  Wand2,
  Crosshair,
  Award
} from 'lucide-react';

interface ParchmentCharacterSheetProps {
  character: Character;
  charactersList: Character[];
  onSelectCharacter: (char: Character) => void;
  onApplyDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onSpendSlot: (id: string, level: number) => void;
  onRestoreSlot: (id: string, level: number) => void;
  onToggleCondition: (id: string, cond: Condition) => void;
  onToggleInspiration: (id: string) => void;
  onRollCheck: (char: Character, name: string, mode: 'normal' | 'vantagem' | 'desvantagem') => void;
  onBackToMesa: () => void;
  onGenerateRandomHero?: () => void;
}

// 12 Classes Oficiais de RPG e Monstros
const ART_OPTIONS = [
  { id: 'art_drizzt', name: 'Drizzt Do\'Urden (Drow Ranger Épico)', path: '/heroes/champion.jpg' },
  { id: 'art_guerreiro', name: 'Guerreiro Marcial (Masculino)', path: '/artes/guerreiro.jpeg' },
  { id: 'art_mago', name: 'Mago Arcano (Masculino)', path: '/artes/mago.jpeg' },
  { id: 'art_ladino', name: 'Ladino das Sombras (Masculino)', path: '/artes/ladino.jpeg' },
  { id: 'art_clerigo', name: 'Clérigo Sagrado (Masculino)', path: '/artes/clerigo.jpeg' },
  { id: 'art_barbaro', name: 'Bárbaro Primal (Masculino)', path: '/artes/barbaro.jpeg' },
  { id: 'art_bardo', name: 'Bardo Menestrel (Masculino)', path: '/artes/bardo.jpeg' },
  { id: 'art_paladino', name: 'Paladino Sagrado (Masculino)', path: '/artes/paladino.jpeg' },
  { id: 'art_patrulheiro', name: 'Patrulheiro dos Ermos (Masculino)', path: '/artes/patrulheiro.jpeg' },
  { id: 'art_druida', name: 'Druida da Natureza (Masculino)', path: '/artes/druida.jpeg' },
  { id: 'art_monge', name: 'Monge das Artes Marciais (Masculino)', path: '/artes/monge.jpeg' },
  { id: 'art_bruxo', name: 'Bruxo do Pacto (Masculino)', path: '/artes/bruxo.jpeg' },
  { id: 'art_feiticeiro', name: 'Feiticeiro Dracônico (Masculino)', path: '/artes/feiticeiro.jpeg' },
  { id: 'art_mago_f', name: 'Maga Arcana (Feminino)', path: '/artes/mago_f.jpeg' },
  { id: 'art_guerreiro_f', name: 'Guerreira Marcial (Feminino)', path: '/artes/guerreiro_f.jpeg' },
  { id: 'art_ladino_f', name: 'Ladina das Sombras (Feminino)', path: '/artes/ladino_f.jpeg' },
  { id: 'art_clerigo_f', name: 'Clériga Sagrada (Feminino)', path: '/artes/clerigo_f.jpeg' },
  { id: 'art_barbaro_f', name: 'Bárbara Primal (Feminino)', path: '/artes/barbaro_f.jpeg' },
  { id: 'art_bardo_f', name: 'Barda Menestrel (Feminino)', path: '/artes/bardo_f.jpeg' },
  { id: 'art_paladino_f', name: 'Paladina Sagrada (Feminino)', path: '/artes/paladino_f.jpeg' },
  { id: 'art_patrulheiro_f', name: 'Patrulheira dos Ermos (Feminino)', path: '/artes/patrulheiro_f.jpeg' },
  { id: 'art_druida_f', name: 'Druidesa da Natureza (Feminino)', path: '/artes/druida_f.jpeg' },
  { id: 'art_monge_f', name: 'Monja das Artes Marciais (Feminino)', path: '/artes/monge_f.jpeg' },
  { id: 'art_bruxo_f', name: 'Bruxa do Pacto (Feminino)', path: '/artes/bruxo_f.jpeg' },
  { id: 'art_feiticeiro_f', name: 'Feiticeira Dracônica (Feminino)', path: '/artes/feiticeiro_f.jpeg' },
  // Clássicos dos Manuais Oficiais
  { id: 'art_thorin', name: 'Thorin (Anão Guerreiro - Guia do Jogador)', path: '/heroes/thorin_warrior.jpg' },
  { id: 'art_lyra', name: 'Lyra Cantolunar (Elfa Maga)', path: '/heroes/lyra_mage.jpg' },
  { id: 'art_champion', name: 'Guerreiro Campeão (Guia de Volo)', path: '/heroes/champion.jpg' },
  { id: 'art_beholder', name: 'Beholder Observador (Guia de Volo)', path: '/monsters/beholder.jpg' },
  { id: 'art_mind_flayer', name: 'Devorador de Mentes (Guia de Volo)', path: '/monsters/mind_flayer.jpg' },
  { id: 'art_dragon', name: 'Guarda Dragonete (Guia de Volo)', path: '/monsters/dragon.jpg' },
  // Monstros e Chefes Épicos
  { id: 'art_balrog', name: 'Balrog Demônio Maior', path: '/artes/Balrog.jpeg' },
  { id: 'art_dragao_vermelho_anciao', name: 'Dragão Vermelho Ancião Colossal', path: '/artes/dragao_vermelho_anciao.jpeg' },
  { id: 'art_dragao_vermelho', name: 'Dragão Vermelho Jovem', path: '/artes/dragao_vermelho.jpeg' },
  { id: 'art_lich_hq', name: 'Lich Arquimago', path: '/artes/lich_arquimago.jpeg' },
  { id: 'art_beholder_hq', name: 'Beholder Observador', path: '/artes/beholder.jpeg' },
  { id: 'art_hidra', name: 'Hidra de Muitas Cabeças', path: '/artes/hidra.jpeg' },
  { id: 'art_medusa', name: 'Medusa Petrificante', path: '/artes/medusa.jpeg' },
  { id: 'art_manticora', name: 'Manticora Alada', path: '/artes/manticora.jpeg' },
  { id: 'art_urso_coruja', name: 'Urso-Coruja (Owlbear)', path: '/artes/urso_coruja.jpeg' },
  { id: 'art_mimico', name: 'Mímico Disfarçado', path: '/artes/mimico.jpeg' },
  { id: 'art_cubo_gelatinoso', name: 'Cubo Gelatinoso', path: '/artes/cubo_gelatinoso.jpeg' },
  { id: 'art_carnical', name: 'Carniçal (Ghoul)', path: '/artes/carnical.jpeg' },
  { id: 'art_bandido', name: 'Bandido Salteador', path: '/artes/bandido_salteador.jpeg' },
  { id: 'art_lobo_selvagem', name: 'Lobo Selvagem', path: '/artes/lobo_selvagem.jpeg' },
  { id: 'art_troll', name: 'Troll da Caverna', path: '/artes/Troll.jpeg' },
  { id: 'art_vampiro', name: 'Lorde Vampiro', path: '/artes/vampiro.jpeg' },
  { id: 'art_espectro', name: 'Espectro Sombrio', path: '/artes/espectro.jpeg' },
  { id: 'art_aranha', name: 'Aranha Gigante', path: '/artes/aranha.jpeg' },
  { id: 'art_hobgoblin', name: 'Hobgoblin Capitão', path: '/artes/hobiglobin.jpeg' },
  { id: 'art_orc', name: 'Guerreiro Orc', path: '/artes/orc.jpeg' },
  { id: 'art_goblin', name: 'Goblin Batedor', path: '/artes/goblin.jpeg' },
  { id: 'art_kobold', name: 'Kobold Emboscador', path: '/artes/kobold.jpeg' },
  { id: 'art_esqueleto', name: 'Esqueleto Legionário', path: '/artes/esqueleto.jpeg' },
  { id: 'art_zumbi', name: 'Zumbi Errante', path: '/artes/zumbi.jpeg' },
  // Arsenal e Armas
  { id: 'art_espada_longa', name: 'Espada Longa de Aço', path: '/artes/espada_longa.jpeg' },
  { id: 'art_espada_curta', name: 'Espada Curta Afiada', path: '/artes/espada_curta.jpeg' },
  { id: 'art_montante', name: 'Montante / Espadão de Guerra', path: '/artes/montante.jpeg' },
  { id: 'art_adaga', name: 'Adaga de Lâmina Fina', path: '/artes/adaga.jpeg' },
  { id: 'art_machado', name: 'Machado de Batalha', path: '/artes/machado.jpeg' },
  { id: 'art_machado_grande', name: 'Machado Grande Devastador', path: '/artes/machado_grande.jpeg' },
  { id: 'art_martelo_combate', name: 'Martelo de Guerra', path: '/artes/martelo_de_guerra.jpeg' },
  { id: 'art_maca', name: 'Maça de Aço Forjado', path: '/artes/maca.jpeg' },
  { id: 'art_lanca', name: 'Lança de Ponta Rúnica', path: '/artes/lanca.jpeg' },
  { id: 'art_cimitarra', name: 'Cimitarra Graciosa', path: '/artes/cimitarra.jpeg' },
  { id: 'art_arco_curto', name: 'Arco Curto Veloz', path: '/artes/arco_curto.jpeg' },
  { id: 'art_arco_longo', name: 'Arco Longo de Guerra', path: '/artes/arco_longo.jpg' },
  { id: 'art_besta_pesada', name: 'Besta Pesada Mecânica', path: '/artes/besta_pesada.jpeg' },
  { id: 'art_besta_mao', name: 'Besta de Mão Furtiva', path: '/artes/besta_de_mao.jpeg' },
  { id: 'art_funda', name: 'Funda de Couro Rústica', path: '/artes/funda.jpeg' },
  { id: 'art_kit_ferreiro', name: 'Kit de Ferreiro Completo', path: '/artes/loja/kit_ferreiro.jpeg' },
  { id: 'art_pocao_cura_maior', name: 'Poção de Cura Maior (Alquimia)', path: '/artes/loja/pocao_cura_maior.jpg' },
  { id: 'art_pocao_cura_superior', name: 'Poção de Cura Superior (Alquimia Rara)', path: '/artes/loja/pocao_cura_superior.jpg' },
  { id: 'art_agua_benta', name: 'Frasco de Água Benta Consagrada', path: '/artes/loja/agua_benta.jpg' },
  { id: 'art_veneno_basico', name: 'Veneno Básico das Sombras', path: '/artes/loja/veneno_basico.jpg' },
  { id: 'art_suprimentos_alquimista', name: 'Suprimentos de Alquimista', path: '/artes/loja/suprimentos_de_alquimista.jpg' },
  { id: 'art_kit_herbalismo', name: 'Kit de Herbalismo', path: '/artes/loja/kit_de_herbalismo.jpg' },
  { id: 'art_brunea', name: 'Brúnea (Armadura de Escamas)', path: '/artes/loja/brunea.jpg' },
  { id: 'art_cota_aneis', name: 'Cota de Anéis de Ferro', path: '/artes/loja/cota_aneis.jpg' },
  { id: 'art_cota_talas', name: 'Cota de Talas de Aço', path: '/artes/loja/cota_talas.jpg' },
  { id: 'art_kit_primeiros_socorros', name: 'Kit de Primeiros Socorros', path: '/artes/loja/kit_primeiros_socorros.jpg' },
  { id: 'art_acido_corrosivo', name: 'Frasco de Ácido Corrosivo', path: '/artes/loja/acido_corrosivo.jpg' },
];

const getArtIndexForCharacter = (char: Character): number => {
  if (char.avatarUrl) {
    const idx = ART_OPTIONS.findIndex(a => a.path === char.avatarUrl);
    if (idx !== -1) return idx;
  }
  const isFem = (char.gender || '').toLowerCase().includes('fem') || (char.gender || '').toLowerCase() === 'f';
  const suffix = isFem ? '_f' : '';
  const cls = (char.class || '').toLowerCase();
  if (cls.includes('paladino')) return ART_OPTIONS.findIndex(a => a.id === `art_paladino${suffix}`);
  if (cls.includes('ladino')) return ART_OPTIONS.findIndex(a => a.id === `art_ladino${suffix}`);
  if (cls.includes('mago')) return ART_OPTIONS.findIndex(a => a.id === `art_mago${suffix}`);
  if (cls.includes('guerreiro')) return ART_OPTIONS.findIndex(a => a.id === `art_guerreiro${suffix}`);
  if (cls.includes('clérigo') || cls.includes('clerigo')) return ART_OPTIONS.findIndex(a => a.id === `art_clerigo${suffix}`);
  if (cls.includes('bárbaro') || cls.includes('barbaro')) return ART_OPTIONS.findIndex(a => a.id === `art_barbaro${suffix}`);
  if (cls.includes('bardo')) return ART_OPTIONS.findIndex(a => a.id === `art_bardo${suffix}`);
  if (cls.includes('patrulheiro') || cls.includes('ranger')) return ART_OPTIONS.findIndex(a => a.id === `art_patrulheiro${suffix}`);
  if (cls.includes('druida')) return ART_OPTIONS.findIndex(a => a.id === `art_druida${suffix}`);
  if (cls.includes('monge')) return ART_OPTIONS.findIndex(a => a.id === `art_monge${suffix}`);
  if (cls.includes('bruxo')) return ART_OPTIONS.findIndex(a => a.id === `art_bruxo${suffix}`);
  if (cls.includes('feiticeiro')) return ART_OPTIONS.findIndex(a => a.id === `art_feiticeiro${suffix}`);
  return 0;
};

// 18 Perícias em ordem idêntica ao Grimoire Oficial de D&D 5e
const OFFICIAL_SKILLS_ORDER: { key: SkillName; nameEn: string; namePt: string; ability: AbilityName }[] = [
  { key: 'acrobacia', namePt: 'Acrobacia', nameEn: 'Acrobatics', ability: 'des' },
  { key: 'adestrar_animais', namePt: 'Adestrar Animais', nameEn: 'Animal Handling', ability: 'sab' },
  { key: 'arcanismo', namePt: 'Arcanismo', nameEn: 'Arcana', ability: 'int' },
  { key: 'atletismo', namePt: 'Atletismo', nameEn: 'Athletics', ability: 'for' },
  { key: 'enganacao', namePt: 'Enganação', nameEn: 'Deception', ability: 'car' },
  { key: 'historia', namePt: 'História', nameEn: 'History', ability: 'int' },
  { key: 'intuicao', namePt: 'Intuição', nameEn: 'Insight', ability: 'sab' },
  { key: 'intimidacao', namePt: 'Intimidação', nameEn: 'Intimidation', ability: 'car' },
  { key: 'investigacao', namePt: 'Investigação', nameEn: 'Investigation', ability: 'int' },
  { key: 'medicina', namePt: 'Medicina', nameEn: 'Medicine', ability: 'sab' },
  { key: 'natureza', namePt: 'Natureza', nameEn: 'Nature', ability: 'int' },
  { key: 'percepcao', namePt: 'Percepção', nameEn: 'Perception', ability: 'sab' },
  { key: 'atuacao', namePt: 'Atuação', nameEn: 'Performance', ability: 'car' },
  { key: 'persuasao', namePt: 'Persuasão', nameEn: 'Persuasion', ability: 'car' },
  { key: 'religiao', namePt: 'Religião', nameEn: 'Religion', ability: 'int' },
  { key: 'prestidigitacao', namePt: 'Prestidigitação', nameEn: 'Sleight of Hand', ability: 'des' },
  { key: 'furtividade', namePt: 'Furtividade', nameEn: 'Stealth', ability: 'des' },
  { key: 'sobrevivencia', namePt: 'Sobrevivência', nameEn: 'Survival', ability: 'sab' },
];

export const ParchmentCharacterSheet: React.FC<ParchmentCharacterSheetProps> = ({
  character,
  charactersList,
  onSelectCharacter,
  onApplyDamage,
  onHeal,
  onSpendSlot,
  onRestoreSlot,
  onToggleCondition,
  onToggleInspiration,
  onRollCheck,
  onBackToMesa,
  onGenerateRandomHero
}) => {
  // Controle de Página: 'front' (Frente / Drizzt) ou 'back' (Verso / Erelynn Mochila)
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

  // Arte ativa do personagem
  const [selectedArtIndex, setSelectedArtIndex] = useState<number>(() => getArtIndexForCharacter(character));
  useEffect(() => {
    setSelectedArtIndex(getArtIndexForCharacter(character));
  }, [character.id, character.class, character.avatarUrl, character.gender]);

  // Modo de rolagem
  const [rollMode, setRollMode] = useState<'normal' | 'vantagem' | 'desvantagem'>('normal');

  // Controle de entrada de HP personalizado
  const [customHpInput, setCustomHpInput] = useState<string>('');

  // Roda de Recursos do Verso (10 esferas interativas)
  const [resourceWheelSpent, setResourceWheelSpent] = useState<boolean[]>(() => [false, false, false, false, false, false, false, false, false, false]);

  // Sintonização de Itens Mágicos (3 vagas da 5e)
  const [attunedSlots, setAttunedSlots] = useState<boolean[]>([true, true, false]);

  // Métricas calculadas
  const { ac, breakdown: acBreakdown } = calculateArmorClass(character);
  const passivePerc = getPassiveSense(character, 'percepcao');
  const initiativeMod = getAbilityModifier(character.baseAbilities.des);
  const profBonus = Math.floor((Math.max(1, character.level) - 1) / 4) + 2;

  // Toggle na roda de recursos do verso
  const toggleWheelBead = (index: number) => {
    setResourceWheelSpent(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  // Traços e Recursos de Classe & Raça Automáticos caso estejam vazios
  const getEnrichedFeatures = () => {
    const list: { title: string; desc: string }[] = [];
    const race = (character.race || '').toLowerCase();
    const cls = (character.class || '').toLowerCase();

    // Raça
    if (race.includes('elf') || race.includes('drow')) {
      list.push({ title: 'Visão no Escuro Superior (36m)', desc: 'Você enxerga na escuridão plena até 36 metros como se fosse luz plena.' });
      list.push({ title: 'Sentidos Aguçados & Transe', desc: 'Proficiência em Percepção. Medita por 4 horas em vez de dormir 8 horas.' });
      list.push({ title: 'Ancestral Feérico', desc: 'Vantagem em salvaguardas contra ser Enfeitiçado e imune a sono mágico.' });
      list.push({ title: 'Magia Inata Feérica', desc: 'Pode conjurar Globos de Luz, Fogo das Fadas (1x/dia) e Escuridão (1x/dia).' });
    } else if (race.includes('anão') || race.includes('anao')) {
      list.push({ title: 'Visão no Escuro (18m)', desc: 'Enxerga em penumbra como luz plena e escuridão como penumbra.' });
      list.push({ title: 'Resiliência dos Anões', desc: 'Vantagem em salvaguardas contra Veneno e resistência a dano de veneno.' });
      list.push({ title: 'Esperteza com Pedras', desc: 'Adiciona o dobro do bônus de proficiência em testes de História sobre alvenaria.' });
    } else {
      list.push({ title: 'Determinação Humana', desc: 'Treinamento adaptativo e espírito resiliente em terra e combate.' });
    }

    // Classe
    if (cls.includes('guerreiro')) {
      list.push({ title: 'Estilo de Combate (Duas Armas / Defesa)', desc: 'Soma modificador de habilidade ao dano do ataque com a mão inábil e +1 CA.' });
      list.push({ title: 'Retomar o Fôlego (Second Wind)', desc: 'Ação bônus: recupera 1d10 + nível em PV (1x por descanso curto ou longo).' });
      list.push({ title: 'Surto de Ação (Action Surge)', desc: 'Ganha 1 ação adicional no seu próprio turno (1x por descanso curto ou longo).' });
      list.push({ title: 'Ataque Extra', desc: 'Pode atacar múltiplas vezes ao realizar a ação de Ataque em seu turno.' });
    } else if (cls.includes('ladino')) {
      list.push({ title: 'Ataque Furtivo (Sneak Attack)', desc: `Causa +${Math.ceil(character.level / 2)}d6 de dano a uma criatura atingida sob vantagem ou com aliado a 1,5m.` });
      list.push({ title: 'Ação Ardilosa (Cunning Action)', desc: 'Ação bônus: pode Correr, Desengajar ou Esconder-se em todo turno de combate.' });
      list.push({ title: 'Esquiva Sobrenatural', desc: 'Reação: reduz à metade o dano de um ataque visível que o atinja.' });
    } else if (cls.includes('mago')) {
      list.push({ title: 'Grimório Arcano & Conjurador Ritual', desc: 'Pode conjurar rituais diretamente do livro sem gastar espaços de magia.' });
      list.push({ title: 'Recuperação Arcana', desc: 'Em descanso curto, recupera espaços de magia somando metade do nível de mago.' });
      list.push({ title: 'Esculpir Magias', desc: 'Aliados na área de suas magias passam automaticamente na salvaguarda e sofrem 0 de dano.' });
    } else if (cls.includes('patrulheiro') || cls.includes('ranger')) {
      list.push({ title: 'Inimigo Favorito & Explorador Natural', desc: 'Vantagem em Sobrevivência para rastrear e conhecimento das fraquezas.' });
      list.push({ title: 'Dança das Lâminas Silenciosas', desc: 'Velocidade aumentada em 3m e terreno difícil não impõe penalidade de movimento.' });
    } else {
      list.push({ title: 'Recursos de Classe Oficiais', desc: `Proficiências e habilidades ativas de nível ${character.level}.` });
    }

    if (character.notes) {
      list.push({ title: 'Notas Especiais & Feitos', desc: character.notes });
    }

    return list;
  };

  const enrichedFeatures = getEnrichedFeatures();

  // Lista de Itens Mágicos Equipados para o Verso
  const magicItemsEquipped = [
    { name: 'Morte Gélida (Cimitarra +3)', slot: 'Arma Principal', attunement: true, desc: '+3 no acerto/dano, +1d6 frio e resistência a fogo.' },
    { name: 'Centelha (Cimitarra do Defensor +3)', slot: 'Mão Inábil', attunement: true, desc: '+3 transferível entre bônus de ataque e bônus na CA.' },
    { name: 'Braçadeiras da Rapidez Feérica', slot: 'Pulsos', attunement: true, desc: 'Aumenta o Deslocamento em +3m e concede vantagem em Iniciativa.' },
    { name: 'Amuleto da Saúde de Mithral', slot: 'Pescoço', attunement: false, desc: 'Mantém a vitalidade resiliente contra cansaço e venenos.' },
    { name: 'Capa Élfica de Camuflagem', slot: 'Ombros', attunement: false, desc: 'Desvantagem em testes de Percepção para quem tentar detectá-lo.' },
  ];

  // Itens da Mochila de Aventura (Mochila Completa do Verso)
  const defaultBackpackItems = [
    { name: 'Barraca de acampamento para 2 pessoas', qty: 1, weight: '4.5 kg' },
    { name: 'Saco de dormir de lã reforçada', qty: 1, weight: '2.0 kg' },
    { name: 'Corda de cânhamo tratada (15 metros)', qty: 1, weight: '4.0 kg' },
    { name: 'Tochas de piche impermeável', qty: 8, weight: '3.6 kg' },
    { name: 'Rações de viagem secas (preservadas)', qty: 10, weight: '5.0 kg' },
    { name: 'Odre de couro com água fresca (2 litros)', qty: 1, weight: '2.2 kg' },
    { name: 'Pederneira e isqueiro de aço anão', qty: 1, weight: '0.2 kg' },
    { name: 'Poções de Cura Simples (2d4+2)', qty: 3, weight: '0.6 kg' },
    { name: 'Frascos de óleo inflamável de alquimista', qty: 3, weight: '1.5 kg' },
    { name: 'Gancho de escalada de ferro forjado', qty: 1, weight: '1.8 kg' },
    { name: 'Caneca de estanho e talheres de viagem', qty: 1, weight: '0.4 kg' },
    { name: 'Espelho pequeno de aço polido', qty: 1, weight: '0.2 kg' },
    { name: 'Giz e carvão para marcação de masmorras', qty: 5, weight: '0.1 kg' },
    { name: 'Pá pequena de trincheira e cravos de ferro (10)', qty: 1, weight: '2.8 kg' },
    { name: 'Estojo de pergaminhos lacrado à prova d\'água', qty: 1, weight: '0.5 kg' },
    { name: 'Algemas de ferro temperado com chave mestra', qty: 1, weight: '1.2 kg' },
  ];

  const characterInventoryList = character.inventory && character.inventory.length > 0
    ? character.inventory.map(item => ({ name: item.name, qty: item.quantity, weight: `${item.weight || 0.5} kg` }))
    : defaultBackpackItems;

  // Split em 2 colunas para o visual de linhas da Mochila
  const halfInv = Math.ceil(characterInventoryList.length / 2);
  const invCol1 = characterInventoryList.slice(0, halfInv);
  const invCol2 = characterInventoryList.slice(halfInv);

  // Armas prontas para ataque na frente
  const equippedWeapons = character.weapons && character.weapons.length > 0
    ? character.weapons
    : [
        { id: 'wpn_cimitarra_1', name: 'Morte Gélida (Cimitarra)', damage: '1d6+5', damageType: 'Cortante (+1d6 Frio)', range: '1.5m', isEquipped: true, quantity: 1, weight: 1.5 },
        { id: 'wpn_cimitarra_2', name: 'Centelha (Cimitarra)', damage: '1d6+5', damageType: 'Cortante', range: '1.5m', isEquipped: true, quantity: 1, weight: 1.5 },
        { id: 'wpn_adaga', name: 'Adaga de Aço Élfico', damage: '1d4+5', damageType: 'Perfurante', range: '6m / 18m', isEquipped: false, quantity: 2, weight: 0.5 },
        { id: 'wpn_arco', name: 'Arco Longo dos Ermos', damage: '1d8+5', damageType: 'Perfurante', range: '45m / 180m', isEquipped: false, quantity: 1, weight: 1.0 },
      ];

  // Idiomas e Proficiências
  const languagesList = 'Comum, Élfico, Subcomum, Dialeto Subterrâneo, Goblin, Orc';
  const armorsList = 'Todas as armaduras leves e médias, escudos';
  const weaponsList = 'Armas simples, armas marciais, cimitarras, rapieiras, arcos longos';
  const toolsList = 'Instrumentos de Navegação, Kit de Herbalismo, Kit de Ladinagem';

  return (
    <div className="space-y-4 max-w-[1300px] mx-auto select-none print:m-0 print:p-0">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE COMANDOS: HERÓIS, ARTE & SELETOR FRENTE/VERSO */}
      {/* ========================================================= */}
      <div className="bg-[#120e0a]/95 backdrop-blur-md border border-[#a17036]/60 p-2.5 sm:p-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Voltar à Mesa */}
        <button
          onClick={onBackToMesa}
          className="bronze-btn px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 font-bold shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar à Mesa
        </button>

        {/* TOGGLE FRENTE / VERSO (IGUAL AO COMANDO DO USUÁRIO) */}
        <div className="flex items-center gap-1.5 bg-[#201810] p-1 rounded-xl border border-[#a17036]">
          <button
            onClick={() => setActiveSide('front')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all flex items-center gap-2 ${
              activeSide === 'front'
                ? 'bg-gradient-to-r from-[#d9be7e] via-[#f7e6b5] to-[#c59e53] text-[#2c1a04] shadow-md scale-[1.02]'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            <Swords className="w-4 h-4 text-[#8b0000]" />
            <span>⚔️ FRENTE (Atributos & Combate)</span>
          </button>

          <button
            onClick={() => setActiveSide('back')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all flex items-center gap-2 ${
              activeSide === 'back'
                ? 'bg-gradient-to-r from-[#d9be7e] via-[#f7e6b5] to-[#c59e53] text-[#2c1a04] shadow-md scale-[1.02]'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            <Backpack className="w-4 h-4 text-[#8b0000]" />
            <span>🎒 VERSO (Mochila, Lore & Inventário)</span>
          </button>
        </div>

        {/* Seletor de Heróis Rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[280px] sm:max-w-none">
          <span className="text-[10px] uppercase font-bold text-[#f5ba42] tracking-wider hidden lg:inline">
            Herói:
          </span>
          {charactersList.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCharacter(c)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                c.id === character.id
                  ? 'bg-[#f5ba42] text-stone-950 font-extrabold shadow'
                  : 'bg-[#1e1710] text-[#f5ba42]/80 border border-[#a17036]/50 hover:border-[#f5ba42]'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
          {onGenerateRandomHero && (
            <button
              onClick={onGenerateRandomHero}
              className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase transition-all whitespace-nowrap bg-gradient-to-r from-[#d9be7e] to-[#aa8337] text-[#2c1a04] shadow hover:scale-105 flex items-center gap-1"
              title="Gerar Herói Lendário Aleatório Instantaneamente"
            >
              <Sparkles className="w-3 h-3 text-[#8b0000]" />
              <span>+ Gerar Herói</span>
            </button>
          )}
        </div>

        {/* Alternador de Arte do Retrato */}
        <div className="flex items-center gap-1 bg-[#1a140d] px-2 py-1 rounded-lg border border-[#a17036]/40">
          <button
            onClick={() => setSelectedArtIndex(prev => (prev > 0 ? prev - 1 : ART_OPTIONS.length - 1))}
            className="p-1 text-[#f5ba42] hover:bg-[#2c2013] rounded"
            title="Arte Anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-stone-300 font-semibold truncate max-w-[120px]">
            {(ART_OPTIONS[selectedArtIndex] || ART_OPTIONS[0]).name.split(' ')[0]}
          </span>
          <button
            onClick={() => setSelectedArtIndex(prev => (prev < ART_OPTIONS.length - 1 ? prev + 1 : 0))}
            className="p-1 text-[#f5ba42] hover:bg-[#2c2013] rounded"
            title="Próxima Arte"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Seletor de Modo de Rolagem */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-stone-400">Dados:</span>
          {(['normal', 'vantagem', 'desvantagem'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setRollMode(mode)}
              className={`px-2 py-0.5 rounded capitalize font-bold transition-all ${
                rollMode === mode
                  ? 'bg-[#8b0000] text-white shadow'
                  : 'bg-[#1e1710] text-stone-300 hover:text-amber-200 border border-[#a17036]/30'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* REVESTIMENTO DE PERGAMINHO PRINCIPAL (FRENTE E VERSO) */}
      {/* ========================================================= */}
      <div
        className="relative bg-[#f5ecd4] text-[#2c1d0f] rounded-3xl p-4 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-[6px] border-[#805e26] overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 15%, rgba(255,252,242,0.92) 0%, rgba(246,236,214,0.95) 45%, rgba(220,198,154,0.98) 100%),
            radial-gradient(circle at 10% 90%, rgba(184,147,88,0.25) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(184,147,88,0.25) 0%, transparent 40%)
          `,
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 0 100px rgba(128,94,38,0.35)'
        }}
      >
        {/* Cantoneiras Góticas Douradas */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-[#805e26] pointer-events-none rounded-tl-xl opacity-80" />
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-[#805e26] pointer-events-none rounded-tr-xl opacity-80" />
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-[#805e26] pointer-events-none rounded-bl-xl opacity-80" />
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-[#805e26] pointer-events-none rounded-br-xl opacity-80" />

        {/* Marca d'água sutil com o Retrato */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply bg-center bg-cover"
          style={{ backgroundImage: `url('${(ART_OPTIONS[selectedArtIndex] || ART_OPTIONS[0]).path}')` }}
        />

        {/* ********************************************************* */}
        {/* ===================== PÁGINA 1: FRENTE ==================== */}
        {/* ********************************************************* */}
        {activeSide === 'front' && (
          <div className="relative z-10 space-y-5 animate-fadeIn">
            {/* 1. TOP HEADER: DUNGEONS & DRAGONS, CARTUCHE DO NOME & PERGAMINHO HORIZONTAL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Lado Esquerdo: Placa D&D e Nome Estilo Drizzt Do'Urden */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                {/* Logo D&D */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#8b0000] to-transparent" />
                  <span className="font-cinzel text-[11px] sm:text-xs font-black tracking-[0.35em] text-[#8b0000] uppercase drop-shadow-sm">
                    DUNGEONS & DRAGONS
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#8b0000] to-transparent" />
                </div>

                {/* Cartela do Nome com Moldura Esculpida & Faixa de Subclasse */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gradient-to-b from-[#f9f2e3] via-[#faedd2] to-[#dfbe7f] border-2 border-[#7a571f] rounded-xl px-4 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] uppercase tracking-[0.25em] font-extrabold text-[#7a571f]">
                      HERÓI LENDÁRIO
                    </span>
                    <h1 className="font-cinzel text-2xl sm:text-3xl font-black tracking-[0.12em] text-[#301c05] leading-none my-0.5">
                      {character.name}
                    </h1>
                  </div>

                  {/* Pequena fita pendurada com Subclasse / Título */}
                  <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-[#dfbe7f] to-[#aa8337] border border-[#5d3f11] rounded-lg p-2 text-center shadow min-w-[100px]">
                    <span className="text-[7px] uppercase font-bold text-[#301c05] tracking-wider">Título</span>
                    <span className="text-[10px] font-black text-[#8b0000] font-cinzel leading-tight">
                      {character.subclass || 'O Caçador'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: O Famoso Pergaminho Enrolado Horizontal com Rolos de Madeira */}
              <div className="lg:col-span-7 flex items-center">
                {/* Rolamento de Madeira Esquerdo */}
                <div className="w-3.5 h-16 bg-gradient-to-b from-[#2e1d0f] via-[#5c3a1d] to-[#2e1d0f] rounded-l-md border-y border-l border-[#1a1008] shadow-md shrink-0 flex flex-col justify-between py-1">
                  <div className="w-full h-1 bg-[#d9be7e]/50 rounded-full" />
                  <div className="w-full h-1 bg-[#d9be7e]/50 rounded-full" />
                </div>

                {/* Corpo do Pergaminho com 6 Colunas Clássicas */}
                <div className="flex-1 bg-gradient-to-b from-[#fffaf0] via-[#f5edd7] to-[#ebdaba] border-y-2 border-[#7a571f] py-2 px-3 shadow-inner grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  {/* 1. Classe e Nível */}
                  <div className="border-b sm:border-b-0 sm:border-r border-[#be9e63]/60 pr-1">
                    <span className="font-bold text-stone-900 text-xs sm:text-[13px] block truncate">
                      {character.class} {character.level}
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7a571f] uppercase tracking-wider block border-t border-[#be9e63]/40 pt-0.5 mt-0.5">
                      Classe & Nível
                    </span>
                  </div>

                  {/* 2. Antecedente */}
                  <div className="border-b sm:border-b-0 sm:border-r border-[#be9e63]/60 pr-1">
                    <span className="font-bold text-stone-900 text-xs sm:text-[13px] block truncate">
                      {character.background}
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7a571f] uppercase tracking-wider block border-t border-[#be9e63]/40 pt-0.5 mt-0.5">
                      Antecedente
                    </span>
                  </div>

                  {/* 3. Jogador */}
                  <div className="border-b sm:border-b-0 sm:border-r border-[#be9e63]/60 pr-1">
                    <span className="font-bold text-stone-900 text-xs sm:text-[13px] block truncate">
                      {character.player || 'Jogador'}
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7a571f] uppercase tracking-wider block border-t border-[#be9e63]/40 pt-0.5 mt-0.5">
                      Nome do Jogador
                    </span>
                  </div>

                  {/* 4. Raça */}
                  <div className="sm:border-r border-[#be9e63]/60 pr-1">
                    <span className="font-bold text-stone-900 text-xs sm:text-[13px] block truncate">
                      {character.race}
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7a571f] uppercase tracking-wider block border-t border-[#be9e63]/40 pt-0.5 mt-0.5">
                      Raça / Espécie
                    </span>
                  </div>

                  {/* 5. Alinhamento */}
                  <div className="sm:border-r border-[#be9e63]/60 pr-1">
                    <span className="font-bold text-stone-900 text-xs sm:text-[13px] block truncate">
                      {character.alignment}
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7a571f] uppercase tracking-wider block border-t border-[#be9e63]/40 pt-0.5 mt-0.5">
                      Alinhamento
                    </span>
                  </div>

                  {/* 6. Pontos de Experiência */}
                  <div>
                    <span className="font-bold text-[#8b0000] text-xs sm:text-[13px] block truncate">
                      {character.xp.toLocaleString()} XP
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7a571f] uppercase tracking-wider block border-t border-[#be9e63]/40 pt-0.5 mt-0.5">
                      Experiência
                    </span>
                  </div>
                </div>

                {/* Rolamento de Madeira Direito */}
                <div className="w-3.5 h-16 bg-gradient-to-b from-[#2e1d0f] via-[#5c3a1d] to-[#2e1d0f] rounded-r-md border-y border-r border-[#1a1008] shadow-md shrink-0 flex flex-col justify-between py-1">
                  <div className="w-full h-1 bg-[#d9be7e]/50 rounded-full" />
                  <div className="w-full h-1 bg-[#d9be7e]/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* 2. SUB-HEADER: INSPIRAÇÃO, PROFICIÊNCIA, SALVAGUARDAS, INICIATIVA & ESCUDO DE CA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Lado Esquerdo (lg:col-span-8): Inspiração, Proficiência e as 6 Flâmulas de Salvaguardas */}
              <div className="lg:col-span-8 flex flex-wrap items-center gap-3">
                {/* Medalha de Inspiração */}
                <button
                  onClick={() => onToggleInspiration(character.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all shadow-md group ${
                    character.hasInspiration
                      ? 'bg-gradient-to-r from-[#ffe4a0] to-[#dfbe7f] border-[#8b0000] ring-2 ring-[#8b0000]/40'
                      : 'bg-[#faedd4] border-[#94712e] hover:border-[#8b0000]'
                  }`}
                  title="Alternar Inspiração Heroica"
                >
                  <span className="text-[9px] uppercase font-black text-[#52330a] tracking-wider">INSPIRAÇÃO</span>
                  <div className={`w-6 h-6 rounded-full border border-[#7a571f] flex items-center justify-center font-cinzel font-black text-xs ${
                    character.hasInspiration ? 'bg-[#8b0000] text-amber-200' : 'bg-white/80 text-stone-700'
                  }`}>
                    {character.hasInspiration ? '★' : '1'}
                  </div>
                </button>

                {/* Fita de Bônus de Proficiência (Roxo Imperial como no modelo) */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#3e1a47] via-[#562562] to-[#3e1a47] text-white px-3.5 py-1.5 rounded-full border-2 border-[#bfa254] shadow-md">
                  <span className="text-[9px] uppercase font-black tracking-wider text-amber-200">
                    BÔNUS PROFICIÊNCIA
                  </span>
                  <span className="font-cinzel text-sm font-black text-white bg-white/20 w-6 h-6 rounded-full flex items-center justify-center border border-amber-300">
                    +{profBonus}
                  </span>
                </div>

                {/* As 6 Flâmulas / Banners de Salvaguardas (Hanging Pennants em linha) */}
                <div className="flex-1 min-w-[280px] bg-gradient-to-r from-[#eedab7] via-[#f7ecd5] to-[#eedab7] border-2 border-[#805e26] rounded-xl px-2 py-1 shadow-md">
                  <div className="text-center border-b border-[#be9e63]/60 pb-0.5 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#634311]">
                      ✦ SALVAGUARDAS (SAVING THROWS) ✦
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1 text-center">
                    {[
                      { key: 'for', label: 'FOR', color: 'from-[#8b0000] to-[#590000]' },
                      { key: 'des', label: 'DES', color: 'from-[#194f82] to-[#0e2c49]' },
                      { key: 'con', label: 'CON', color: 'from-[#185d32] to-[#0d361c]' },
                      { key: 'int', label: 'INT', color: 'from-[#4d1f6b] to-[#2b0f3e]' },
                      { key: 'sab', label: 'SAB', color: 'from-[#8a6508] to-[#543d04]' },
                      { key: 'car', label: 'CAR', color: 'from-[#0d6e7a] to-[#063f47]' },
                    ].map(st => {
                      const isProf = character.savingThrowProficiencies.includes(st.key as AbilityName);
                      const mod = getAbilityModifier(character.baseAbilities[st.key as AbilityName]) + (isProf ? profBonus : 0);

                      return (
                        <button
                          key={st.key}
                          onClick={() => onRollCheck(character, st.key, rollMode)}
                          className="flex flex-col items-center group cursor-pointer"
                          title={`Rolar Salvaguarda de ${st.label}`}
                        >
                          {/* Flâmula Suspensa Colorida */}
                          <div className={`w-full bg-gradient-to-b ${st.color} text-white rounded-t-md pt-0.5 pb-1 px-0.5 border border-[#402a11] shadow transition-transform group-hover:-translate-y-0.5`}>
                            <div className="w-5 h-5 mx-auto rounded-full bg-white text-stone-950 font-cinzel text-[10px] font-black flex items-center justify-center shadow-inner">
                              {formatModifier(mod)}
                            </div>
                            <span className="text-[7.5px] font-black uppercase tracking-wider block mt-0.5 text-amber-200">
                              {st.label}
                            </span>
                          </div>

                          {/* Ponto indicador de Proficiência */}
                          <div className={`w-2 h-2 rounded-full border border-[#52330a] -mt-1 shadow-sm ${
                            isProf ? 'bg-amber-400 ring-1 ring-amber-600' : 'bg-stone-300'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Lado Direito (lg:col-span-4): Iniciativa & Escudo Dourado de CA */}
              <div className="lg:col-span-4 flex items-center justify-end gap-3">
                {/* Iniciativa (Fita Vermelha) */}
                <button
                  onClick={() => onRollCheck(character, 'des', rollMode)}
                  className="bg-gradient-to-r from-[#8b0000] to-[#590000] text-white border-2 border-[#f5ba42] px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 group hover:scale-105 transition-transform"
                  title="Rolar Iniciativa (Baseada em Destreza)"
                >
                  <span className="text-[9px] uppercase font-black tracking-wider text-amber-200">
                    INICIATIVA
                  </span>
                  <span className="font-cinzel text-sm font-black bg-white/20 w-6 h-6 rounded-full flex items-center justify-center border border-amber-300">
                    {formatModifier(initiativeMod)}
                  </span>
                </button>

                {/* ESCUDO DE CA DRACÔNICO DOURADO OFICIAL */}
                <div
                  className="relative flex flex-col items-center justify-center group cursor-help"
                  title={acBreakdown}
                >
                  {/* Moldura de Escudo Dourado Esculpido */}
                  <div className="w-16 h-18 bg-gradient-to-b from-[#ffe6a3] via-[#dfbe7f] to-[#99732b] rounded-t-2xl rounded-b-[2rem] border-3 border-[#52330a] shadow-[0_6px_15px_rgba(0,0,0,0.35)] p-1 flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                    {/* Coroa / Dragonete Topo */}
                    <div className="text-[7px] uppercase font-black tracking-widest text-[#402a11]">
                      ARMADURA
                    </div>
                    {/* Valor de CA em Destaque */}
                    <span className="font-cinzel text-2xl font-black text-[#261401] leading-none my-0.5 drop-shadow">
                      {ac}
                    </span>
                    {/* Badge CA no rodapé */}
                    <div className="bg-[#52330a] text-amber-300 text-[8px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                      AC / CA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MEIO CENTRAL: O GRIMOIRE DE PERÍCIAS (ESQ) & O CÍRCULO ARCANO COM O ARCO DOS 6 ATRIBUTOS (DIR) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* =================================================== */}
              {/* COLUNA ESQUERDA (lg:col-span-5): GRIMOIRE / SPELLBOOK DE SKILLS */}
              {/* =================================================== */}
              <div className="lg:col-span-5 flex">
                {/* Lombada de Couro do Livro com Costura Gótica Dourada */}
                <div className="w-5 bg-gradient-to-r from-[#24130b] via-[#482815] to-[#24130b] rounded-l-xl border-y-2 border-l-2 border-[#190c06] shadow-xl shrink-0 flex flex-col justify-around items-center py-4">
                  <div className="w-2.5 h-1 bg-[#d9be7e] rounded-full shadow" />
                  <div className="w-2.5 h-1 bg-[#d9be7e] rounded-full shadow" />
                  <div className="w-2.5 h-1 bg-[#d9be7e] rounded-full shadow" />
                  <div className="w-2.5 h-1 bg-[#d9be7e] rounded-full shadow" />
                </div>

                {/* Páginas do Livro de Perícias (Fundo Pergaminho Claro & Linhas Elegantes) */}
                <div className="flex-1 bg-gradient-to-r from-[#fff9eb] via-[#f7eed8] to-[#eedab7] border-y-2 border-r-2 border-[#7a571f] rounded-r-xl p-3 shadow-xl">
                  {/* Cabeçalho Calligráfico "Skills" */}
                  <div className="flex items-center justify-between border-b-2 border-[#7a571f] pb-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Scroll className="w-4 h-4 text-[#8b0000]" />
                      <h2 className="font-cinzel text-lg font-black tracking-[0.15em] text-[#3d240b]">
                        Skills • Perícias
                      </h2>
                    </div>
                    <span className="text-[8px] font-bold text-[#7a571f] uppercase tracking-wider">
                      Clique p/ Rolar
                    </span>
                  </div>

                  {/* As 18 Perícias Oficiais da 5e */}
                  <div className="space-y-1 text-xs">
                    {OFFICIAL_SKILLS_ORDER.map(sk => {
                      const mod = getSkillModifier(character, sk.key);
                      const isProf = character.skillProficiencies.includes(sk.key);
                      const isExpert = character.skillExpertise?.includes(sk.key);

                      return (
                        <div
                          key={sk.key}
                          onClick={() => onRollCheck(character, sk.key, rollMode)}
                          className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-[#dfbe7f]/30 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {/* Marcador Circular de Proficiência / Especialização */}
                            <span
                              className={`w-3.5 h-3.5 rounded-full border border-[#7a571f] flex items-center justify-center shrink-0 ${
                                isExpert
                                  ? 'bg-amber-500 border-amber-900 ring-1 ring-amber-600'
                                  : isProf
                                  ? 'bg-[#8b0000] border-[#400000]'
                                  : 'bg-white/80'
                              }`}
                            >
                              {(isProf || isExpert) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white shadow" />
                              )}
                            </span>

                            {/* Nome da Perícia com Atributo entre parênteses */}
                            <span className="text-[11px] font-medium text-stone-900 group-hover:text-[#8b0000] truncate">
                              {sk.namePt}{' '}
                              <span className="text-[9px] text-[#7a571f] font-normal">
                                ({sk.ability.toUpperCase()})
                              </span>
                            </span>
                          </div>

                          {/* Pílula de Pedra Esculpida com o Modificador */}
                          <div className="bg-[#faecd5] border border-[#be9e63] rounded px-1.5 py-0.2 shadow-inner group-hover:border-[#8b0000] group-hover:bg-[#ffeec2]">
                            <span className="font-cinzel text-xs font-black text-[#301c05]">
                              {formatModifier(mod)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rodapé do Livro */}
                  <div className="border-t border-[#be9e63]/60 pt-1 mt-2 text-[8px] text-[#7a571f] italic text-center">
                    * Círculo preenchido: Proficiência oficial • Duplo: Especialização
                  </div>
                </div>
              </div>

              {/* =================================================== */}
              {/* COLUNA DIREITA (lg:col-span-7): CÍRCULO ARCANO COM RETRATO E O ARCO DOS 6 ATRIBUTOS */}
              {/* =================================================== */}
              <div className="lg:col-span-7 relative">
                {/* 1. O Famoso Arco Curvado dos 6 Atributos Primordiais (STR, DEX, CON, INT, WIS, CHA) */}
                <div className="mb-2">
                  <div className="text-center mb-1">
                    <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-[#6e4a16]">
                      ◇ ATRIBUTOS PRIMORDIAIS • ABILITY SCORES ◇
                    </span>
                  </div>

                  {/* Os 6 Medalhões Dourados em Linha/Arco */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      { key: 'for', name: 'FORÇA', abbrev: 'STR' },
                      { key: 'des', name: 'DESTREZA', abbrev: 'DEX' },
                      { key: 'con', name: 'CONSTITUIÇÃO', abbrev: 'CON' },
                      { key: 'int', name: 'INTELIGÊNCIA', abbrev: 'INT' },
                      { key: 'sab', name: 'SABEDORIA', abbrev: 'WIS' },
                      { key: 'car', name: 'CARISMA', abbrev: 'CHA' },
                    ].map(ab => {
                      const score = character.baseAbilities[ab.key as AbilityName];
                      const mod = getAbilityModifier(score);

                      return (
                        <div
                          key={ab.key}
                          onClick={() => onRollCheck(character, ab.key, rollMode)}
                          className="cursor-pointer group flex flex-col items-center transition-transform hover:-translate-y-1"
                          title={`Rolar Teste de Atributo de ${ab.name}`}
                        >
                          {/* Modificador no Topo (Tampa Esculpida em Ouro/Rubi) */}
                          <div className="bg-gradient-to-r from-[#8b0000] via-[#ab1414] to-[#8b0000] text-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#400000] shadow-md -mb-2 z-20 group-hover:scale-110 transition-transform">
                            {formatModifier(mod)}
                          </div>

                          {/* Medalhão Circular Principal */}
                          <div className="w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-gradient-to-b from-[#fffbf0] via-[#f7edd4] to-[#dfbe7f] border-3 border-[#7a571f] shadow-lg flex flex-col items-center justify-center p-1 group-hover:border-[#8b0000] transition-colors relative">
                            {/* Ranhura Interna de Moeda Antiga */}
                            <div className="absolute inset-1 rounded-full border border-[#be9e63]/70 pointer-events-none" />

                            <span className="font-cinzel text-xl sm:text-2xl font-black text-[#2e1b04] leading-none mt-1 drop-shadow-sm">
                              {score}
                            </span>
                            <span className="text-[7.5px] font-black uppercase tracking-wider text-[#7a571f] mt-0.5">
                              {ab.abbrev}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CÍRCULO ARCANO DE INVOCAÇÃO CELESTIAL COM O RETRATO DO HERÓI NO CENTRO */}
                <div className="relative bg-gradient-to-b from-[#faedd5] via-[#eddab8] to-[#dfc699] border-2 border-[#7a571f] rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col items-center">
                  {/* Arte Vetorial do Círculo Mágico de Transmutação */}
                  <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                    {/* Anel de Runas e Triângulos Sagrados (SVG Celestial) */}
                    <svg
                      viewBox="0 0 300 300"
                      className="absolute inset-0 w-full h-full text-[#805e26]/30 animate-[spin_120s_linear_infinite]"
                    >
                      <circle cx="150" cy="150" r="142" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,4" />
                      <circle cx="150" cy="150" r="132" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="150" cy="150" r="118" fill="none" stroke="currentColor" strokeWidth="1" />
                      {/* Triângulos Entrelaçados */}
                      <polygon points="150,22 260,212 40,212" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <polygon points="150,278 40,88 260,88" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>

                    {/* Moldura Interna Circular com o Retrato do Herói */}
                    <div className="w-[78%] h-[78%] rounded-full overflow-hidden border-4 border-[#7a571f] shadow-2xl relative bg-stone-950 z-10">
                      <img
                        src={(ART_OPTIONS[selectedArtIndex] || ART_OPTIONS[0]).path}
                        alt={character.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradiente de Fusão Atmosférica com o Pergaminho */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2c1d0f]/80 via-transparent to-transparent flex items-end justify-center p-3 text-center">
                        <span className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-widest drop-shadow">
                          {character.name}
                        </span>
                      </div>
                    </div>

                    {/* MEDALHÃO DO OLHO MÍSTICO (PERCEPÇÃO PASSIVA - Canto Inferior Esquerdo do Círculo) */}
                    <div
                      className="absolute bottom-2 left-2 z-20 bg-gradient-to-b from-[#fdf6e6] via-[#f7edd4] to-[#dfbe7f] border-2 border-[#7a571f] rounded-full p-2 shadow-xl flex items-center gap-1.5 cursor-help"
                      title="Percepção Passiva (10 + Sabedoria + Proficiência)"
                    >
                      <Eye className="w-4 h-4 text-[#8b0000]" />
                      <div className="flex flex-col">
                        <span className="text-[6.5px] uppercase font-black text-[#52330a] leading-tight">
                          PERCEPÇÃO PASSIVA
                        </span>
                        <span className="font-cinzel text-sm font-black text-[#301c05] leading-tight">
                          {passivePerc}
                        </span>
                      </div>
                    </div>

                    {/* PEDESTAL DE DESLOCAMENTO / SPEED (Canto Inferior Direito do Círculo) */}
                    <div
                      className="absolute bottom-2 right-2 z-20 bg-gradient-to-b from-[#fdf6e6] via-[#f7edd4] to-[#dfbe7f] border-2 border-[#7a571f] rounded-full p-2 shadow-xl flex items-center gap-1.5 cursor-help"
                      title="Deslocamento em Terreno Normal"
                    >
                      <Compass className="w-4 h-4 text-[#8b0000]" />
                      <div className="flex flex-col">
                        <span className="text-[6.5px] uppercase font-black text-[#52330a] leading-tight">
                          DESLOCAMENTO
                        </span>
                        <span className="font-cinzel text-sm font-black text-[#301c05] leading-tight">
                          {character.speed || 9}m
                          <span className="text-[8px] font-normal text-stone-600 ml-0.5">(30ft)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. BASE DA PÁGINA: ATAQUES & MAGIA (ESQ), HP & DADOS DE VIDA (CENTRO) E TRAÇOS (DIR) */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-2">
              {/* =================================================== */}
              {/* BLOCO ESQUERDO (lg:col-span-4): ATTACKS & SPELLCASTING COM ESPADA RÚNICA VERTICAL */}
              {/* =================================================== */}
              <div className="lg:col-span-4 flex bg-gradient-to-r from-[#fff9ed] via-[#f8eed7] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-2.5 shadow-xl">
                {/* ESPADA RÚNICA VERTICAL COM BRILHO ARCANO */}
                <div className="w-6 shrink-0 flex flex-col items-center justify-between py-1 mr-2 border-r border-[#be9e63]/60 pr-1">
                  {/* Pomo da Espada */}
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#8b0000] to-[#400000] border border-[#f5ba42] shadow" />
                  {/* Guarda-Mão */}
                  <div className="w-5 h-1 bg-[#d9be7e] rounded-sm shadow" />
                  {/* Lâmina Rúnica Iluminada */}
                  <div className="w-1.5 flex-1 bg-gradient-to-b from-[#a855f7] via-[#ec4899] to-[#f97316] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.7)] my-1 relative flex flex-col justify-around items-center">
                    <span className="w-0.5 h-1 bg-white rounded-full" />
                    <span className="w-0.5 h-1 bg-white rounded-full" />
                    <span className="w-0.5 h-1 bg-white rounded-full" />
                    <span className="w-0.5 h-1 bg-white rounded-full" />
                  </div>
                  {/* Ponta da Espada */}
                  <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#d9be7e]" />
                </div>

                {/* Conteúdo de Ataques */}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                  <div className="border-b-2 border-[#7a571f] pb-1">
                    <h3 className="font-cinzel text-xs font-black uppercase tracking-wider text-[#301c05] flex items-center justify-between">
                      <span>⚔️ Attacks & Spellcasting</span>
                      <span className="text-[8px] font-bold text-[#8b0000]">Acerto / Dano</span>
                    </h3>
                  </div>

                  {/* Tabela de Armas / Ataques */}
                  <div className="space-y-1.5">
                    {equippedWeapons.map((wpn, idx) => {
                      const forMod = getAbilityModifier(character.baseAbilities.for);
                      const desMod = getAbilityModifier(character.baseAbilities.des);
                      const atkBonus = profBonus + (wpn.damageType?.includes('Perfurante') ? Math.max(forMod, desMod) : forMod);
                      const wpnImg = (wpn as any).imageUrl || getWeaponImage(wpn.name || wpn.id);

                      return (
                        <div
                          key={idx}
                          onClick={() => onRollCheck(character, 'atletismo', rollMode)}
                          className="bg-[#faecd5] border border-[#be9e63] p-1.5 rounded-lg hover:border-[#8b0000] cursor-pointer transition-colors shadow-sm group flex items-center gap-2"
                        >
                          <img
                            src={wpnImg}
                            alt={wpn.name}
                            className="w-8 h-8 rounded object-cover border border-[#8c6721]/50 shadow-sm shrink-0 bg-stone-900"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-stone-900 group-hover:text-[#8b0000] truncate">
                                {wpn.name}
                              </span>
                              <span className="font-cinzel font-black text-[#8b0000]">
                                {formatModifier(atkBonus)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-stone-600 mt-0.5">
                              <span>Dano: <strong>{wpn.damage}</strong></span>
                              <span className="text-[9px] text-[#7a571f]">{(wpn as any).range || '1.5m'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notas de Ataques Especiais / Magias Inatas */}
                  <div className="bg-[#faedd4] border border-[#be9e63]/70 rounded p-1.5 text-[9.5px] text-stone-800 space-y-0.5">
                    <span className="font-bold text-[#7a571f] block uppercase text-[8px]">
                      Habilidades de Combate Inatas:
                    </span>
                    <p className="line-clamp-2">
                      • Combate com Duas Armas: adiciona o modificador de habilidade ao dano da segunda arma.
                    </p>
                    <p className="line-clamp-2">
                      • Dança das Lâminas: Esquiva ágil e precisão cirúrgica em combate cerrado.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================== */}
              {/* BLOCO CENTRAL (lg:col-span-4): HIT POINTS, DADOS DE VIDA & TESTES CONTRA A MORTE */}
              {/* =================================================== */}
              <div className="lg:col-span-4 bg-gradient-to-b from-[#fffbf0] via-[#f7edd4] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-3 shadow-xl flex flex-col justify-between space-y-2.5">
                {/* Topo com Dragão Esculpido, HP Máximo e Dados de Vida */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  {/* Dados de Vida */}
                  <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-1.5 shadow-inner">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#7a571f] block">
                      DADOS DE VIDA
                    </span>
                    <span className="font-cinzel text-sm font-black text-stone-900">
                      {character.hitDiceTotal}{character.hitDie}
                    </span>
                  </div>

                  {/* HP Máximo */}
                  <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-1.5 shadow-inner">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#7a571f] block">
                      HP MÁXIMO
                    </span>
                    <span className="font-cinzel text-sm font-black text-[#8b0000]">
                      {character.maxHp} PV
                    </span>
                  </div>
                </div>

                {/* CURRENT HIT POINTS (PV ATUAIS) - Cartão de Destaque */}
                <div className="bg-gradient-to-b from-[#fdf6e6] to-[#ebd7b0] border-2 border-[#8b0000] rounded-xl p-2.5 text-center shadow-md">
                  <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a571f] block">
                    CURRENT HIT POINTS • PONTOS DE VIDA ATUAIS
                  </span>

                  <div className="font-cinzel text-3xl sm:text-4xl font-black text-[#660000] my-0.5 leading-none drop-shadow">
                    {character.currentHp}
                    {character.tempHp > 0 && (
                      <span className="text-blue-700 text-sm ml-1 font-sans font-bold">
                        (+{character.tempHp} temp)
                      </span>
                    )}
                  </div>

                  {/* Controles Rápidos de Dano e Cura */}
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5">
                    <button
                      onClick={() => onApplyDamage(character.id, 1)}
                      className="px-2 py-0.5 bg-[#8b0000] hover:bg-rose-900 text-white rounded text-[10px] font-bold shadow"
                    >
                      -1 Dano
                    </button>
                    <button
                      onClick={() => onApplyDamage(character.id, 5)}
                      className="px-2 py-0.5 bg-[#8b0000] hover:bg-rose-900 text-white rounded text-[10px] font-bold shadow"
                    >
                      -5 Dano
                    </button>
                    <button
                      onClick={() => onHeal(character.id, 1)}
                      className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow"
                    >
                      +1 Cura
                    </button>
                    <button
                      onClick={() => onHeal(character.id, 5)}
                      className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow"
                    >
                      +5 Cura
                    </button>
                  </div>
                </div>

                {/* TESTES CONTRA A MORTE (DEATH SAVES) */}
                <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-2 text-center shadow-inner">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#7a571f] block mb-1">
                    TESTES CONTRA A MORTE (DEATH SAVES)
                  </span>

                  <div className="flex justify-around items-center text-xs">
                    {/* Sucessos */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-emerald-800 uppercase">Sucessos:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full border border-stone-800 shadow-inner ${
                              i <= character.deathSaves.successes ? 'bg-emerald-600' : 'bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Falhas */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-rose-800 uppercase">Falhas:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full border border-stone-800 shadow-inner ${
                              i <= character.deathSaves.failures ? 'bg-rose-600' : 'bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OUTRAS PROFICIÊNCIAS & IDIOMAS */}
                <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-2 text-[10px] text-stone-800 shadow-inner">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#7a571f] block border-b border-[#be9e63]/40 pb-0.5 mb-1">
                    OUTRAS PROFICIÊNCIAS & IDIOMAS
                  </span>
                  <p className="line-clamp-2"><strong>Idiomas:</strong> {languagesList}</p>
                  <p className="line-clamp-1"><strong>Armaduras:</strong> {armorsList}</p>
                  <p className="line-clamp-1"><strong>Armas:</strong> {weaponsList}</p>
                </div>
              </div>

              {/* =================================================== */}
              {/* BLOCO DIREITO (lg:col-span-4): FEATURES & TRAITS (CARACTERÍSTICAS & TRAÇOS) */}
              {/* =================================================== */}
              <div className="lg:col-span-4 bg-gradient-to-r from-[#fff9ed] via-[#f8eed7] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-3 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-[#7a571f] pb-1 mb-2 flex items-center justify-between">
                    <h3 className="font-cinzel text-xs font-black uppercase tracking-wider text-[#301c05] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#8b0000]" />
                      Features & Traits
                    </h3>
                    <span className="text-[8px] font-bold text-[#7a571f] uppercase">
                      Habilidades
                    </span>
                  </div>

                  {/* Lista de Recursos e Talentos com Visual de Linhas de Pergaminho */}
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                    {enrichedFeatures.map((feat, i) => (
                      <div key={i} className="bg-[#faecd5] border border-[#be9e63] p-2 rounded-lg shadow-sm">
                        <span className="font-bold text-[#8b0000] text-[11px] block">
                          {feat.title}
                        </span>
                        <p className="text-[10px] text-stone-800 leading-relaxed mt-0.5">
                          {feat.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condições Ativas de Status no Rodapé */}
                <div className="pt-2 border-t border-[#be9e63] mt-2">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#7a571f] block mb-1">
                    Condições Ativas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {character.conditions.length === 0 ? (
                      <span className="text-[10px] text-stone-500 italic">Nenhuma condição ativa.</span>
                    ) : (
                      character.conditions.map(c => (
                        <span
                          key={c}
                          onClick={() => onToggleCondition(character.id, c)}
                          className="bg-[#8b0000] text-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full cursor-pointer hover:bg-rose-900 transition-colors shadow"
                          title="Clique para remover condição"
                        >
                          {c} ✕
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ********************************************************* */}
        {/* ===================== PÁGINA 2: VERSO ==================== */}
        {/* ********************************************************* */}
        {activeSide === 'back' && (
          <div className="relative z-10 space-y-5 animate-fadeIn">
            {/* 1. TOP HEADER VERSO: NOME GÓTICO, ESCUDO CELTA SUSPENSO & RODA DE RECURSOS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Lado Esquerdo (lg:col-span-4): Placa Gótica de Nome & Brasão Erelynn */}
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#8b0000] to-transparent" />
                  <span className="font-cinzel text-[11px] font-black tracking-[0.3em] text-[#8b0000] uppercase">
                    DUNGEONS & DRAGONS • VERSO
                  </span>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#8b0000] to-transparent" />
                </div>

                {/* Cartouche de Pedra do Herói */}
                <div className="bg-gradient-to-b from-[#f9f2e3] via-[#faedd2] to-[#dfbe7f] border-2 border-[#7a571f] rounded-xl px-4 py-3 shadow-md text-center">
                  <span className="text-[8px] uppercase tracking-[0.25em] font-extrabold text-[#7a571f] block">
                    CRÔNICAS & EQUIPAMENTO
                  </span>
                  <h1 className="font-cinzel text-2xl sm:text-3xl font-black tracking-[0.15em] text-[#301c05] leading-none my-0.5">
                    {character.name}
                  </h1>
                  <span className="text-[10px] font-bold text-[#8b0000] font-cinzel">
                    {character.class} — {character.background}
                  </span>
                </div>
              </div>

              {/* Centro (lg:col-span-4): Escudo Redondo Nórdico / Celta com Standee do Personagem */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                {/* Corrente Prateada Suspensa */}
                <div className="w-1 h-4 bg-gradient-to-b from-stone-400 via-stone-200 to-stone-400 rounded-full shadow" />

                {/* O Escudo Celta Redondo de Madeira e Bronze */}
                <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#805e26] via-[#482815] to-[#24130b] border-4 border-[#d9be7e] shadow-2xl flex items-center justify-center p-2">
                  {/* Entalhes Célticos no Escudo (SVG) */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#d9be7e]/30">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4,2" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>

                  {/* Silhueta / Retrato de Corpo Inteiro do Herói */}
                  <div className="w-26 h-26 rounded-full overflow-hidden border-2 border-[#f5ba42] shadow-inner relative bg-stone-950 z-10">
                    <img
                      src={(ART_OPTIONS[selectedArtIndex] || ART_OPTIONS[0]).path}
                      alt={character.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Lado Direito (lg:col-span-4): RODA DE RECURSOS / SPELL TRACKER WHEEL (10 ESFERAS DOURADAS) */}
              <div className="lg:col-span-4 bg-gradient-to-b from-[#fffbf0] via-[#f7edd4] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-3 shadow-xl text-center">
                <div className="flex items-center justify-between border-b border-[#be9e63] pb-1 mb-2">
                  <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a571f]">
                    ✦ RODA DE RECURSOS (10 SLOTS) ✦
                  </span>
                  <button
                    onClick={() => setResourceWheelSpent([false, false, false, false, false, false, false, false, false, false])}
                    className="text-[8px] text-[#8b0000] hover:underline font-bold flex items-center gap-1"
                    title="Restaurar todos os slots da roda"
                  >
                    <RotateCw className="w-2.5 h-2.5" /> Restaurar
                  </button>
                </div>

                {/* As 10 Esferas Interativas em Círculo / Grid */}
                <div className="grid grid-cols-5 gap-2 justify-items-center py-1">
                  {resourceWheelSpent.map((isSpent, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleWheelBead(idx)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center font-cinzel text-[11px] font-black shadow-md ${
                        isSpent
                          ? 'bg-stone-400 border-stone-600 text-stone-700 opacity-60 scale-95'
                          : 'bg-gradient-to-b from-[#ffeaa7] via-[#f5ba42] to-[#b8860b] border-[#5e420f] text-[#301c05] hover:scale-110 ring-2 ring-amber-400/50'
                      }`}
                      title={isSpent ? `Slot ${idx + 1}: Gasto (clique p/ restaurar)` : `Slot ${idx + 1}: Disponível (clique p/ gastar)`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <span className="text-[8px] text-[#7a571f] italic block mt-1">
                  Para Espaços de Magia, Pontos de Ki, Dados de Superioridade ou Cargas
                </span>
              </div>
            </div>

            {/* 2. CORPO DO VERSO: LADO ESQUERDO (SINTONIZAÇÃO, LORE E TESOURO) & LADO DIREITO (MOCHILA COMPLETA) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* =================================================== */}
              {/* LADO ESQUERDO (lg:col-span-5): SINTONIZAÇÃO, PERGAMINHO DE LORE & COFRE DE MOEDAS */}
              {/* =================================================== */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Sintonização e Itens Mágicos Equipados */}
                <div className="bg-gradient-to-r from-[#fff9ed] via-[#f8eed7] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center justify-between border-b-2 border-[#7a571f] pb-1 mb-2">
                    <h3 className="font-cinzel text-xs font-black uppercase tracking-wider text-[#301c05] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8b0000]" />
                      Sintonização & Itens Mágicos
                    </h3>
                    {/* 3 Slots de Sintonização Oficiais */}
                    <div className="flex items-center gap-1">
                      {attunedSlots.map((isAtt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setAttunedSlots(prev => {
                              const copy = [...prev];
                              copy[i] = !copy[i];
                              return copy;
                            });
                          }}
                          className={`w-3.5 h-3.5 rounded-full border border-stone-800 ${
                            isAtt ? 'bg-[#8b0000] ring-1 ring-amber-400' : 'bg-white/80'
                          }`}
                          title={`Vaga de Sintonização ${i + 1} (Clique p/ alternar)`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Lista de Itens Mágicos Equipados */}
                  <div className="space-y-1.5 text-xs">
                    {magicItemsEquipped.map((item, idx) => (
                      <div key={idx} className="bg-[#faecd5] border border-[#be9e63] p-1.5 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center font-bold text-stone-900">
                          <span className="truncate">{item.name}</span>
                          <span className="text-[9px] text-[#7a571f]">{item.slot}</span>
                        </div>
                        <p className="text-[10px] text-stone-700 mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. O Grande Pergaminho Enrolado de Personalidade & Lore (Traços, Ideais, Vínculos, Defeitos) */}
                <div className="bg-gradient-to-b from-[#fffaf0] via-[#f7edd4] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-3 shadow-xl space-y-2">
                  <div className="text-center border-b-2 border-[#7a571f] pb-1 mb-1">
                    <span className="font-cinzel text-xs font-black uppercase tracking-[0.2em] text-[#301c05]">
                      📜 Crônicas & Personalidade
                    </span>
                  </div>

                  {/* Traços de Personalidade */}
                  <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-2 shadow-inner">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-[#8b0000] block mb-0.5">
                      TRAÇOS DE PERSONALIDADE (TRAITS)
                    </span>
                    <p className="text-[10.5px] text-stone-800 italic leading-snug">
                      {character.personality.traits.length > 0
                        ? character.personality.traits.join(' • ')
                        : 'Calmo sob pressão absoluta, leal aos companheiros e defensor implacável dos inocentes.'}
                    </p>
                  </div>

                  {/* Ideais */}
                  <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-2 shadow-inner">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-[#8b0000] block mb-0.5">
                      IDEAIS (IDEALS)
                    </span>
                    <p className="text-[10.5px] text-stone-800 leading-snug">
                      {character.personality.ideals || 'Liberdade e Justiça. A tirania e a opressão devem ser combatidas onde quer que surjam.'}
                    </p>
                  </div>

                  {/* Vínculos */}
                  <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-2 shadow-inner">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-[#8b0000] block mb-0.5">
                      VÍNCULOS (BONDS)
                    </span>
                    <p className="text-[10.5px] text-stone-800 leading-snug">
                      {character.personality.bonds || 'Proteger meus companheiros de batalha e honrar o legado dos povos livres.'}
                    </p>
                  </div>

                  {/* Defeitos */}
                  <div className="bg-[#faedd4] border border-[#be9e63] rounded-xl p-2 shadow-inner">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-[#8b0000] block mb-0.5">
                      DEFEITOS & FRAQUEZAS (FLAWS)
                    </span>
                    <p className="text-[10.5px] text-rose-950 font-medium leading-snug">
                      {character.personality.flaws || 'Carrego o fardo do passado e tenho dificuldade em pedir socorro quando estou à beira da derrota.'}
                    </p>
                  </div>
                </div>

                {/* 3. Antecedente & Cofre de Tesouro com Moedas (PC, PP, PE, PO, PL) */}
                <div className="bg-gradient-to-r from-[#fff9ed] via-[#f8eed7] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-3 shadow-xl">
                  {/* Cartela de Antecedente */}
                  <div className="border-b border-[#be9e63] pb-1.5 mb-2">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#7a571f] block">
                      ANTECEDENTE OFICIAL
                    </span>
                    <div className="font-cinzel text-xs font-black text-stone-900">
                      {character.background}
                    </div>
                    <p className="text-[10px] text-stone-700 italic mt-0.5">
                      Hospitalidade Rústica: plebeus e viajantes reconhecem seus feitos e oferecem abrigo e apoio básico.
                    </p>
                  </div>

                  {/* Cofre de Moedas (PC, PP, PE, PO, PL) */}
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#7a571f] block mb-1">
                      TESOURO & MOEDAS
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {[
                        { label: 'PC', name: 'Cobre', val: character.coins.pc, bg: 'bg-[#d97736]/20 border-[#d97736]' },
                        { label: 'PP', name: 'Prata', val: character.coins.pp, bg: 'bg-stone-300/40 border-stone-400' },
                        { label: 'PE', name: 'Electro', val: character.coins.pe, bg: 'bg-amber-200/30 border-amber-400' },
                        { label: 'PO', name: 'Ouro', val: character.coins.po, bg: 'bg-[#f5ba42]/30 border-[#f5ba42]' },
                        { label: 'PL', name: 'Platina', val: character.coins.pl, bg: 'bg-sky-200/30 border-sky-400' },
                      ].map(coin => (
                        <div key={coin.label} className={`border rounded-lg p-1 ${coin.bg} shadow-sm`}>
                          <span className="text-[7.5px] font-black block text-stone-700">{coin.label}</span>
                          <span className="font-cinzel font-black text-xs text-stone-900">{coin.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================== */}
              {/* LADO DIREITO (lg:col-span-7): A MOCHILA DE AVENTURA & INVENTÁRIO COMPLETO */}
              {/* =================================================== */}
              <div className="lg:col-span-7 bg-gradient-to-b from-[#fffbf0] via-[#f7eed6] to-[#eedab7] border-2 border-[#7a571f] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                <div>
                  {/* Cabeçalho da Mochila */}
                  <div className="flex items-center justify-between border-b-2 border-[#7a571f] pb-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Backpack className="w-5 h-5 text-[#8b0000]" />
                      <h2 className="font-cinzel text-base font-black tracking-[0.15em] text-[#301c05]">
                        Mochila de Aventura • Equipment
                      </h2>
                    </div>
                    <span className="text-[9px] font-bold text-[#7a571f] uppercase tracking-wider">
                      Carga: ~{character.inventory.reduce((acc, i) => acc + (i.weight * i.quantity), 0).toFixed(1)} kg / Limite: {character.baseAbilities.for * 7.5} kg
                    </span>
                  </div>

                  {/* DUAS COLUNAS DE LINHAS DE PERGAMINHO DO INVENTÁRIO (IDÊNTICO À ERELYNN) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {/* Coluna 1 */}
                    <div className="space-y-1">
                      {invCol1.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1 px-1.5 border-b border-[#be9e63]/50 hover:bg-[#dfbe7f]/20 transition-colors"
                        >
                          <span className="text-stone-900 font-medium truncate text-[11px]">
                            • {item.name}
                          </span>
                          <span className="text-[10px] text-[#7a571f] font-mono shrink-0 ml-1">
                            {item.qty > 1 && <span className="font-bold text-[#8b0000]">({item.qty}x) </span>}
                            {item.weight}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Coluna 2 */}
                    <div className="space-y-1">
                      {invCol2.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1 px-1.5 border-b border-[#be9e63]/50 hover:bg-[#dfbe7f]/20 transition-colors"
                        >
                          <span className="text-stone-900 font-medium truncate text-[11px]">
                            • {item.name}
                          </span>
                          <span className="text-[10px] text-[#7a571f] font-mono shrink-0 ml-1">
                            {item.qty > 1 && <span className="font-bold text-[#8b0000]">({item.qty}x) </span>}
                            {item.weight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BASE DO VERSO: ILUSTRAÇÃO DA MOCHILA EXPEDIÇÃO + ASSINATURA CALLIGRÁFICA + LACRE DE CERA VERMELHO */}
                <div className="mt-6 pt-4 border-t-2 border-[#7a571f] flex flex-wrap items-end justify-between gap-4">
                  {/* Ilustração Simbólica da Mochila com Espada Apoiada */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#593414] via-[#3a200a] to-[#201004] border-2 border-[#d9be7e] shadow-lg flex items-center justify-center p-2 text-amber-200">
                      <Backpack className="w-8 h-8 drop-shadow" />
                    </div>
                    <div className="text-xs">
                      <span className="font-cinzel text-xs font-black text-[#301c05] block">
                        Equipamento de Campanha
                      </span>
                      <span className="text-[10px] text-stone-700 italic block">
                        Preparado para longas travessias nos Reinos Esquecidos.
                      </span>
                    </div>
                  </div>

                  {/* Assinatura Cursiva "Backpack" e Selo de Cera Vermelho */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-serif italic text-base sm:text-lg text-[#52330a] drop-shadow-sm block">
                        Backpack Manifest
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-[#7a571f] font-bold block">
                        Oficial D&D 5e
                      </span>
                    </div>

                    {/* SELO DE CERA VERMELHO 3D EM ALTO RELEVO */}
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c91818] via-[#8b0000] to-[#400000] border-2 border-[#ff7b7b] shadow-[0_4px_12px_rgba(139,0,0,0.6)] flex items-center justify-center p-1 cursor-pointer hover:scale-110 transition-transform"
                      title="Selo Oficial de Cera de Autenticidade"
                    >
                      <div className="w-9 h-9 rounded-full border border-amber-300/60 flex items-center justify-center">
                        <span className="font-cinzel font-black text-amber-200 text-xs">
                          D&D
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
