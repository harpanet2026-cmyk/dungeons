import React, { useState } from 'react';
import { Enemy, AbilityName } from '../../core/types/dnd';
import { BESTIARY_SRD, CR_XP_MAP, MonsterRegistry, getMonsterFallbackImage } from '../../core/rules/monsterData';
import { X, Plus, Search, BookOpen, Sparkles, Check, Trash2, Shield, Swords, Heart } from 'lucide-react';

interface CustomMonsterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEnemyToCombat: (enemy: Enemy) => void;
}

export const CustomMonsterModal: React.FC<CustomMonsterModalProps> = ({
  isOpen,
  onClose,
  onAddEnemyToCombat
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'import'>('browse');

  // Estado para Busca e Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCr, setFilterCr] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Estado para Criação Manual
  const [name, setName] = useState('');
  const [type, setType] = useState('Monstruosidade');
  const [cr, setCr] = useState('3');
  const [ac, setAc] = useState<number>(14);
  const [maxHp, setMaxHp] = useState<number>(50);
  const [speed, setSpeed] = useState<number>(9);
  const [initiativeMod, setInitiativeMod] = useState<number>(1);
  const [passivePerception, setPassivePerception] = useState<number>(12);
  const [notes, setNotes] = useState('');

  // Salvaguardas
  const [savingThrows, setSavingThrows] = useState<Partial<Record<AbilityName, number>>>({
    for: 0,
    des: 0,
    con: 0,
    int: 0,
    sab: 0,
    car: 0
  });

  // Ataques
  const [attacks, setAttacks] = useState<Array<{
    name: string;
    bonus: number;
    damage: string;
    damageType: string;
    range: string;
    saveDc?: number;
    saveType?: AbilityName;
  }>>([
    { name: 'Ataque Principal', bonus: 5, damage: '1d10 + 3', damageType: 'cortante', range: 'Corpo a corpo (1.5m)' }
  ]);

  // Estado de Importação de Texto / JSON
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const allMonsters = MonsterRegistry.getAllAvailableMonsters();

  // Filtragem da lista
  const filteredList = Object.entries(allMonsters).filter(([_, m]) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCr = filterCr === 'all' || m.cr === filterCr;
    const matchesType = filterType === 'all' || m.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesCr && matchesType;
  });

  const handleAddAttack = () => {
    setAttacks([
      ...attacks,
      { name: 'Novo Ataque', bonus: 4, damage: '1d8 + 2', damageType: 'perfurante', range: 'Corpo a corpo (1.5m)' }
    ]);
  };

  const handleRemoveAttack = (idx: number) => {
    setAttacks(attacks.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do monstro.');
      return;
    }

    const calculatedXp = CR_XP_MAP[cr] || 100;
    const cleanSaves: Partial<Record<AbilityName, number>> = {};
    (Object.keys(savingThrows) as AbilityName[]).forEach(ab => {
      if (savingThrows[ab] !== undefined && savingThrows[ab] !== 0) {
        cleanSaves[ab] = savingThrows[ab];
      }
    });

    const newTemplate = {
      name: name.trim(),
      type: type.trim(),
      cr,
      xp: calculatedXp,
      ac,
      maxHp,
      speed,
      initiativeMod,
      passivePerception,
      savingThrows: cleanSaves,
      attacks: attacks.map((a, i) => ({
        id: `custom_atk_${Date.now()}_${i}`,
        ...a
      })),
      notes: notes.trim()
    };

    // Salva no registro de monstros personalizados
    MonsterRegistry.saveCustomMonster(newTemplate);

    // Instancia e adiciona ao combate
    const enemyInstance = MonsterRegistry.createEnemyInstance(name.trim());
    onAddEnemyToCombat(enemyInstance);
    onClose();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const enemyName = parsed.name || 'Monstro Importado';
      const enemyCr = parsed.cr || '1';
      const enemyXp = parsed.xp || CR_XP_MAP[enemyCr] || 200;

      const templateToSave = {
        name: enemyName,
        type: parsed.type || 'Monstruosidade',
        cr: enemyCr,
        xp: enemyXp,
        ac: parsed.ac || 12,
        maxHp: parsed.maxHp || parsed.hp || 30,
        speed: parsed.speed || 9,
        initiativeMod: parsed.initiativeMod || 0,
        passivePerception: parsed.passivePerception || 10,
        savingThrows: parsed.savingThrows || {},
        attacks: (parsed.attacks || [
          { name: 'Ataque Natural', bonus: 4, damage: '1d8 + 2', damageType: 'concussão', range: '1.5m' }
        ]).map((a: any, i: number) => ({
          id: `imp_atk_${Date.now()}_${i}`,
          name: a.name || 'Ataque',
          bonus: a.bonus || 4,
          damage: a.damage || '1d8+2',
          damageType: a.damageType || 'cortante',
          range: a.range || 'Corpo a corpo (1.5m)',
          saveDc: a.saveDc,
          saveType: a.saveType
        })),
        notes: parsed.notes || ''
      };

      MonsterRegistry.saveCustomMonster(templateToSave);
      const enemyInstance = MonsterRegistry.createEnemyInstance(enemyName);
      onAddEnemyToCombat(enemyInstance);
      setImportFeedback(`Sucesso! ${enemyName} importado e adicionado ao combate.`);
      setTimeout(() => {
        setImportFeedback(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Erro no formato JSON: ${err.message}. Certifique-se de que o texto é um JSON válido.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-[#10121a] border-2 border-[#a17036] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-[#231b14] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a17036] to-[#4a3419] flex items-center justify-center shadow">
              <BookOpen className="w-5 h-5 text-[#ffd470]" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold gold-gradient-text tracking-wide">
                BESTIÁRIO & LIVRO DE MONSTROS D&D 5E
              </h3>
              <p className="text-xs text-stone-400">
                Adicione qualquer monstro oficial do Monster Manual ou crie criaturas customizadas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg bg-[#1f1812] border border-[#a17036]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-[#231b14] bg-[#0c0e15] px-5 pt-2 gap-2 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'bg-[#10121a] text-[#f5ba42] border-t-2 border-x border-[#a17036]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Search className="w-4 h-4 text-[#f5ba42]" /> Explorar Biblioteca ({Object.keys(allMonsters).length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#10121a] text-[#f5ba42] border-t-2 border-x border-[#a17036]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-4 h-4 text-[#f5ba42]" /> Criar Qualquer Monstro
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-[#10121a] text-[#f5ba42] border-t-2 border-x border-[#a17036]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f5ba42]" /> Importar do Gemini / JSON
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ABA 1: EXPLORAR BESTIÁRIO */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              {/* Barra de Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#151924] p-3 rounded-xl border border-[#262f44]">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Buscar por Nome / Tipo:</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Ex: Dragão, Beholder, Lobo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Nível de Desafio (ND / CR):</label>
                  <select
                    value={filterCr}
                    onChange={(e) => setFilterCr(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                  >
                    <option value="all">Todos os Níveis de Desafio</option>
                    {Object.keys(CR_XP_MAP).map(c => (
                      <option key={c} value={c}>ND {c} ({CR_XP_MAP[c]} XP)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Tipo de Criatura:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="Aberração">Aberração</option>
                    <option value="Fera">Fera</option>
                    <option value="Dragão">Dragão</option>
                    <option value="Gigante">Gigante</option>
                    <option value="Humanoide">Humanoide</option>
                    <option value="Morto-vivo">Morto-vivo</option>
                    <option value="Monstruosidade">Monstruosidade</option>
                    <option value="Limo">Limo</option>
                  </select>
                </div>
              </div>

              {/* Lista de Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredList.map(([key, monster]) => {
                  const monsterImg = monster.imageUrl || getMonsterFallbackImage(monster.name, monster.type);
                  return (
                    <div
                      key={key}
                      className="bg-[#141824] border border-[#262f44] hover:border-[#a17036] rounded-xl p-4 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div>
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#a17036] shrink-0 bg-black/60 shadow">
                            <img
                              src={monsterImg}
                              alt={monster.name}
                              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/monsters/orc.jpg';
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-cinzel text-base font-bold text-[#f5ba42] group-hover:text-[#ffd470] truncate">
                                {monster.name}
                              </h4>
                              <span className="bg-[#231b14] border border-[#a17036] text-[#f5ba42] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                ND {monster.cr}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 block truncate">{monster.type} • {monster.xp} XP</span>
                          </div>
                        </div>

                        {/* Stats Rápidos */}
                        <div className="flex items-center gap-3 text-xs mt-2.5 text-stone-300">
                          <span className="flex items-center gap-1 font-bold"><Shield className="w-3.5 h-3.5 text-blue-400" /> CA {monster.ac}</span>
                          <span className="flex items-center gap-1 font-bold"><Heart className="w-3.5 h-3.5 text-rose-500" /> {monster.maxHp} HP</span>
                          <span className="text-stone-400 text-[11px]">Perc: {monster.passivePerception}</span>
                        </div>

                      {/* Ataques */}
                      <div className="mt-2 text-[11px] text-stone-400 space-y-0.5">
                        {monster.attacks.map((a, i) => (
                          <div key={i} className="truncate">
                            <strong className="text-stone-200">• {a.name}</strong> (+{a.bonus}, {a.damage} {a.damageType})
                          </div>
                        ))}
                      </div>

                      {monster.notes && (
                        <p className="text-[10px] text-[#f5ba42]/80 mt-1.5 italic line-clamp-2">
                          {monster.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#231b14] flex justify-end">
                      <button
                        onClick={() => {
                          const instance = MonsterRegistry.createEnemyInstance(key);
                          onAddEnemyToCombat(instance);
                          onClose();
                        }}
                        className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar ao Combate
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* ABA 2: CRIAR QUALQUER MONSTRO (FORMULÁRIO OFICIAL) */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Nome do Monstro:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Quimera de Fogo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Tipo de Criatura:</label>
                  <input
                    type="text"
                    placeholder="Ex: Monstruosidade / Aberração"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Nível de Desafio (ND / CR):</label>
                  <select
                    value={cr}
                    onChange={(e) => setCr(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                  >
                    {Object.keys(CR_XP_MAP).map(c => (
                      <option key={c} value={c}>ND {c} ({CR_XP_MAP[c]} XP)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estatísticas de Combate */}
              <div className="bg-[#151924] p-4 rounded-xl border border-[#262f44] grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Classe de Armadura (CA):</label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={ac}
                    onChange={(e) => setAc(parseInt(e.target.value) || 10)}
                    className="w-16 bg-[#0b0e14] border border-stone-700 rounded py-1 text-center font-bold text-blue-400 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">HP Máximo:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={maxHp}
                    onChange={(e) => setMaxHp(parseInt(e.target.value) || 10)}
                    className="w-20 bg-[#0b0e14] border border-stone-700 rounded py-1 text-center font-bold text-rose-400 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Deslocamento (m):</label>
                  <input
                    type="number"
                    min="0"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value) || 9)}
                    className="w-16 bg-[#0b0e14] border border-stone-700 rounded py-1 text-center font-bold text-stone-200 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Mod. Iniciativa:</label>
                  <input
                    type="number"
                    value={initiativeMod}
                    onChange={(e) => setInitiativeMod(parseInt(e.target.value) || 0)}
                    className="w-16 bg-[#0b0e14] border border-stone-700 rounded py-1 text-center font-bold text-[#f5ba42] text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Perc. Passiva:</label>
                  <input
                    type="number"
                    min="5"
                    value={passivePerception}
                    onChange={(e) => setPassivePerception(parseInt(e.target.value) || 10)}
                    className="w-16 bg-[#0b0e14] border border-stone-700 rounded py-1 text-center font-bold text-emerald-400 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Salvaguardas Declaradas */}
              <div className="bg-[#151924] p-3 rounded-xl border border-[#262f44]">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">
                  Bônus de Salvaguardas (Para quando os Heróis lançarem magias):
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {(['for', 'des', 'con', 'int', 'sab', 'car'] as const).map(ab => (
                    <div key={ab} className="text-center">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">{ab}</span>
                      <input
                        type="number"
                        value={savingThrows[ab] || 0}
                        onChange={(e) => setSavingThrows({ ...savingThrows, [ab]: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-[#0b0e14] border border-stone-700 rounded py-0.5 text-center font-bold text-xs text-[#f5ba42]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de Ataques / Ações */}
              <div className="bg-[#151924] p-4 rounded-xl border border-[#262f44] space-y-3">
                <div className="flex justify-between items-center border-b border-[#231b14] pb-2">
                  <span className="font-bold text-stone-200 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-rose-500" /> Ataques & Ações do Monstro ({attacks.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAttack}
                    className="text-[11px] bronze-btn px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Outro Ataque
                  </button>
                </div>

                <div className="space-y-3">
                  {attacks.map((atk, idx) => (
                    <div key={idx} className="bg-[#0b0e14] p-3 rounded-lg border border-stone-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-3">
                        <label className="text-[9px] text-stone-400 block">Nome do Golpe:</label>
                        <input
                          type="text"
                          value={atk.name}
                          onChange={(e) => {
                            const updated = [...attacks];
                            updated[idx].name = e.target.value;
                            setAttacks(updated);
                          }}
                          className="w-full bg-[#141824] border border-stone-700 rounded px-2 py-1 text-xs text-stone-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-stone-400 block">Bônus de Acerto:</label>
                        <input
                          type="number"
                          value={atk.bonus}
                          onChange={(e) => {
                            const updated = [...attacks];
                            updated[idx].bonus = parseInt(e.target.value) || 0;
                            setAttacks(updated);
                          }}
                          className="w-full bg-[#141824] border border-stone-700 rounded px-2 py-1 text-xs text-[#f5ba42] font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9px] text-stone-400 block">Fórmula de Dano:</label>
                        <input
                          type="text"
                          value={atk.damage}
                          placeholder="Ex: 2d6 + 3"
                          onChange={(e) => {
                            const updated = [...attacks];
                            updated[idx].damage = e.target.value;
                            setAttacks(updated);
                          }}
                          className="w-full bg-[#141824] border border-stone-700 rounded px-2 py-1 text-xs text-rose-300 font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[9px] text-stone-400 block">Tipo de Dano:</label>
                        <input
                          type="text"
                          value={atk.damageType}
                          placeholder="cortante, fogo..."
                          onChange={(e) => {
                            const updated = [...attacks];
                            updated[idx].damageType = e.target.value;
                            setAttacks(updated);
                          }}
                          className="w-full bg-[#141824] border border-stone-700 rounded px-2 py-1 text-xs text-stone-200"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right pt-3">
                        {attacks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttack(idx)}
                            className="text-stone-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traços Especiais */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Traços Especiais & Notas:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Resistência à Magia. Regeneração de 10 PV por rodada. Presença Aterradora CD 15."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#f5ba42]"
                />
              </div>

              {/* Botões de Submissão */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#231b14]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#1b1510] hover:bg-[#281f18] text-stone-400 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bronze-btn px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow"
                >
                  <Check className="w-4 h-4 text-emerald-400" /> Salvar no Bestiário e Inserir no Combate
                </button>
              </div>
            </form>
          )}

          {/* ABA 3: IMPORTAR DO GEMINI / JSON */}
          {activeTab === 'import' && (
            <div className="space-y-4 text-xs">
              <div className="bg-[#151924] p-4 rounded-xl border border-[#262f44] space-y-2">
                <span className="font-bold text-[#f5ba42] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#f5ba42]" /> Como usar com o Gemini Pro:
                </span>
                <p className="text-stone-300 leading-relaxed">
                  Você pode pedir no chat do Gemini:
                  <br />
                  <em className="text-[#ffd470]">"Gemini, me dê o monstro [Qualquer Criatura do Manual] em formato JSON com name, cr, ac, maxHp, speed, initiativeMod, attacks (name, bonus, damage, damageType) e notes."</em>
                </p>
                <p className="text-stone-400">Cole o resultado gerado pelo Gemini abaixo para cadastrar a criatura instantaneamente no seu bestiário.</p>
              </div>

              <textarea
                rows={8}
                placeholder={`{\n  "name": "Beholder Ancestral",\n  "cr": "13",\n  "ac": 18,\n  "maxHp": 180,\n  "speed": 6,\n  "initiativeMod": 2,\n  "attacks": [\n    { "name": "Mordida", "bonus": 5, "damage": "4d6", "damageType": "perfurante" }\n  ],\n  "notes": "Cone Antimagia no olho central."\n}`}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full bg-[#0b0e14] border border-stone-700 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-[#f5ba42]"
              />

              {importFeedback && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {importFeedback}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleImportJson}
                  disabled={!importJsonText.trim()}
                  className="bronze-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#f5ba42]" /> Converter e Adicionar Criatura ao Combate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
