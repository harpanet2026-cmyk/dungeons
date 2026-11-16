import React, { useState } from 'react';
import { CampaignData, SessionLogEntry, Quest, NpcContact, QuestStatus, NpcAttitude } from '../../core/types/campaign';
import { CampaignManager } from '../../core/state/campaignManager';
import { BookOpen, CheckCircle2, Clock, Plus, Users, Compass, Award, Tag, Sparkles, AlertCircle } from 'lucide-react';

export const CampaignJournal: React.FC = () => {
  const [data, setData] = useState<CampaignData>(() => CampaignManager.getCampaignData());
  const [activeTab, setActiveTab] = useState<'logs' | 'quests' | 'npcs'>('logs');

  // Modais de Criação
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [isAddingNpc, setIsAddingNpc] = useState(false);

  // Form states - Log
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [logInGameDate, setLogInGameDate] = useState('');
  const [logTags, setLogTags] = useState('');

  // Form states - Quest
  const [questTitle, setQuestTitle] = useState('');
  const [questDesc, setQuestDesc] = useState('');
  const [questGiver, setQuestGiver] = useState('');
  const [questReward, setQuestReward] = useState('');

  // Form states - NPC
  const [npcName, setNpcName] = useState('');
  const [npcTitle, setNpcTitle] = useState('');
  const [npcLocation, setNpcLocation] = useState('');
  const [npcAttitude, setNpcAttitude] = useState<NpcAttitude>('aliado');
  const [npcNotes, setNpcNotes] = useState('');

  const refreshData = () => {
    setData(CampaignManager.getCampaignData());
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) return;
    CampaignManager.addLog({
      title: logTitle.trim(),
      content: logContent.trim(),
      inGameDate: logInGameDate.trim() || undefined,
      realDate: new Date().toLocaleDateString('pt-BR'),
      author: 'Mesa de Jogo',
      tags: logTags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setLogTitle('');
    setLogContent('');
    setLogInGameDate('');
    setLogTags('');
    setIsAddingLog(false);
    refreshData();
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle.trim()) return;
    CampaignManager.addQuest({
      title: questTitle.trim(),
      description: questDesc.trim(),
      giver: questGiver.trim() || undefined,
      reward: questReward.trim() || undefined,
      status: 'ativa'
    });
    setQuestTitle('');
    setQuestDesc('');
    setQuestGiver('');
    setQuestReward('');
    setIsAddingQuest(false);
    refreshData();
  };

  const handleCreateNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcName.trim()) return;
    CampaignManager.addNpc({
      name: npcName.trim(),
      title: npcTitle.trim() || undefined,
      location: npcLocation.trim() || undefined,
      attitude: npcAttitude,
      notes: npcNotes.trim()
    });
    setNpcName('');
    setNpcTitle('');
    setNpcLocation('');
    setNpcNotes('');
    setIsAddingNpc(false);
    refreshData();
  };

  const handleToggleQuestStatus = (questId: string, current: QuestStatus) => {
    const nextStatus: QuestStatus = current === 'ativa' ? 'concluida' : 'ativa';
    CampaignManager.updateQuestStatus(questId, nextStatus);
    refreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#231b14] pb-4">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold gold-gradient-text tracking-wide flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#f5ba42]" />
            CRÔNICAS & DIÁRIO DE CAMPANHA
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Registro contínuo de sessões narradas pelo Gemini Pro, missões ativas e personagens do mundo.
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 bg-[#12141e] border border-[#23293a] p-1 rounded-xl text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-[#f5ba42] text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Diário ({data.logs.length})
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'quests' ? 'bg-[#f5ba42] text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Missões ({data.quests.filter(q => q.status === 'ativa').length})
          </button>
          <button
            onClick={() => setActiveTab('npcs')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'npcs' ? 'bg-[#f5ba42] text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            NPCs ({data.npcs.length})
          </button>
        </div>
      </div>

      {/* 1. ABA: DIÁRIO DE SESSÃO */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-400">Registros em ordem cronológica:</span>
            <button
              onClick={() => setIsAddingLog(true)}
              className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> + Nova Crônica
            </button>
          </div>

          {/* Form Modal Registro */}
          {isAddingLog && (
            <form onSubmit={handleCreateLog} className="bg-[#10131d] border-2 border-[#a17036] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xl animate-in zoom-in-95">
              <h3 className="font-cinzel text-sm font-bold text-[#f5ba42] uppercase tracking-wider">
                Adicionar Novo Registro de Sessão
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Título do acontecimento (Ex: O Confronto no Altar)"
                  value={logTitle}
                  onChange={e => setLogTitle(e.target.value)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
                />
                <input
                  type="text"
                  placeholder="Data no mundo do jogo (Ex: 14 de Uktar, Ano das Sombras)"
                  value={logInGameDate}
                  onChange={e => setLogInGameDate(e.target.value)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
                />
              </div>
              <textarea
                rows={4}
                required
                placeholder="Narrações, descobertas importantes e decisões cruciais dos jogadores..."
                value={logContent}
                onChange={e => setLogContent(e.target.value)}
                className="w-full bg-[#090b10] border border-[#2b334a] rounded-lg p-3 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
              />
              <input
                type="text"
                placeholder="Tags separadas por vírgula (Ex: Combate, Orcs, Tesouro)"
                value={logTags}
                onChange={e => setLogTags(e.target.value)}
                className="w-full bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-1.5 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bronze-btn px-5 py-1.5 rounded-lg text-xs font-bold text-[#f5ba42] uppercase tracking-wider"
                >
                  Salvar Crônica
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {data.logs.map(log => (
              <div key={log.id} className="bg-[#0e111a] border border-[#231b14] hover:border-[#a17036]/60 rounded-xl p-4 shadow-lg space-y-2 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f2536] pb-2">
                  <h4 className="font-cinzel text-base font-bold text-[#f5ba42] tracking-wide">{log.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                    {log.inGameDate && <span className="bg-[#161a27] px-2 py-0.5 rounded border border-[#262f44] text-amber-200">{log.inGameDate}</span>}
                    <span>{log.realDate}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">{log.content}</p>
                {log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {log.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] bg-[#141824] border border-[#2b334a] text-stone-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-[#f5ba42]" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ABA: MISSÕES & QUESTS */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-400">Objetivos do grupo e recompensas:</span>
            <button
              onClick={() => setIsAddingQuest(true)}
              className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> + Nova Missão
            </button>
          </div>

          {/* Form Modal Quest */}
          {isAddingQuest && (
            <form onSubmit={handleCreateQuest} className="bg-[#10131d] border-2 border-[#a17036] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xl animate-in zoom-in-95">
              <h3 className="font-cinzel text-sm font-bold text-[#f5ba42] uppercase tracking-wider">
                Cadastrar Nova Missão / Quest
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Título da missão (Ex: Resgate do Escriba)"
                  value={questTitle}
                  onChange={e => setQuestTitle(e.target.value)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
                />
                <input
                  type="text"
                  placeholder="Quem ofereceu (Ex: Barão Valdemar)"
                  value={questGiver}
                  onChange={e => setQuestGiver(e.target.value)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Descrição dos perigos e objetivos da missão..."
                value={questDesc}
                onChange={e => setQuestDesc(e.target.value)}
                className="w-full bg-[#090b10] border border-[#2b334a] rounded-lg p-3 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
              />
              <input
                type="text"
                placeholder="Recompensa prometida (Ex: 100 PO e Poção de Invisibilidade)"
                value={questReward}
                onChange={e => setQuestReward(e.target.value)}
                className="w-full bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-1.5 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingQuest(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bronze-btn px-5 py-1.5 rounded-lg text-xs font-bold text-[#f5ba42] uppercase tracking-wider"
                >
                  Salvar Missão
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.quests.map(q => {
              const isCompleted = q.status === 'concluida';
              return (
                <div
                  key={q.id}
                  className={`border rounded-xl p-4 shadow-lg flex flex-col justify-between transition-all ${
                    isCompleted
                      ? 'bg-[#0f1915] border-emerald-800/80 opacity-80'
                      : 'bg-[#0e111a] border-[#231b14] hover:border-[#a17036]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-cinzel text-sm font-bold ${isCompleted ? 'text-emerald-300 line-through' : 'text-[#f5ba42]'}`}>
                        {q.title}
                      </h4>
                      <button
                        onClick={() => handleToggleQuestStatus(q.id, q.status)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                        title="Clique para alternar status da missão"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {isCompleted ? 'Concluída' : 'Ativa'}
                      </button>
                    </div>

                    <p className="text-xs text-stone-300">{q.description}</p>

                    {q.giver && (
                      <p className="text-[11px] text-stone-400">
                        Contratante: <strong className="text-stone-200">{q.giver}</strong>
                      </p>
                    )}
                  </div>

                  {q.reward && (
                    <div className="mt-3 pt-2 border-t border-[#1f2536] text-[11px] flex items-center gap-1.5 text-amber-300 font-semibold">
                      <Award className="w-3.5 h-3.5 text-[#f5ba42]" />
                      <span>Recompensa: {q.reward}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ABA: NPCS & CONTATOS */}
      {activeTab === 'npcs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-400">Contatos conhecidos, aliados e adversários:</span>
            <button
              onClick={() => setIsAddingNpc(true)}
              className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#f5ba42] flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> + Novo NPC
            </button>
          </div>

          {/* Form Modal NPC */}
          {isAddingNpc && (
            <form onSubmit={handleCreateNpc} className="bg-[#10131d] border-2 border-[#a17036] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xl animate-in zoom-in-95">
              <h3 className="font-cinzel text-sm font-bold text-[#f5ba42] uppercase tracking-wider">
                Registrar Novo Personagem do Mestre (NPC)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome do NPC (Ex: Mestre Alquimista Thorne)"
                  value={npcName}
                  onChange={e => setNpcName(e.target.value)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
                />
                <input
                  type="text"
                  placeholder="Ocupação / Título (Ex: Feiticeiro da Corte)"
                  value={npcTitle}
                  onChange={e => setNpcTitle(e.target.value)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
                />
                <select
                  value={npcAttitude}
                  onChange={e => setNpcAttitude(e.target.value as any)}
                  className="bg-[#090b10] border border-[#2b334a] rounded-lg px-3 py-2 text-xs text-stone-200 outline-none focus:border-[#f5ba42]"
                >
                  <option value="aliado">💚 Aliado</option>
                  <option value="neutro">💛 Neutro</option>
                  <option value="hostil">💔 Hostil</option>
                  <option value="desconhecido">❔ Desconhecido</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Notas, diálogos memoráveis e segredos conhecidos..."
                value={npcNotes}
                onChange={e => setNpcNotes(e.target.value)}
                className="w-full bg-[#090b10] border border-[#2b334a] rounded-lg p-3 text-xs text-stone-100 outline-none focus:border-[#f5ba42]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNpc(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bronze-btn px-5 py-1.5 rounded-lg text-xs font-bold text-[#f5ba42] uppercase tracking-wider"
                >
                  Salvar NPC
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {data.npcs.map(npc => (
              <div key={npc.id} className="bg-[#0e111a] border border-[#231b14] hover:border-[#a17036]/60 rounded-xl p-4 shadow-lg space-y-2 transition-all">
                <div className="flex items-start justify-between gap-2 border-b border-[#1f2536] pb-2">
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-[#f5ba42]">{npc.name}</h4>
                    {npc.title && <span className="text-[10px] text-stone-400 block">{npc.title}</span>}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    npc.attitude === 'aliado'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : npc.attitude === 'hostil'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {npc.attitude}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed italic">"{npc.notes}"</p>
                {npc.location && (
                  <div className="text-[10px] text-stone-400 pt-1 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#f5ba42]" /> Local: {npc.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
