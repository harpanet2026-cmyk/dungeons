import React, { useState } from 'react';
import { Character, Enemy } from '../../core/types/dnd';
import { generateCampaignDossier, generateCombatSnapshot } from '../../core/gemini/promptGenerator';
import { GEMINI_TOOLS_DECLARATION } from '../../core/gemini/toolSchemas';
import { calculatePartyEncounterThresholds, analyzePartySynergy } from '../../core/analysis/encounterAnalysis';
import { OllamaApiService, AiProvider } from '../../core/ollama/ollamaApiService';
import { Copy, Check, Sparkles, Terminal, FileText, Swords, Key, Send, Bot, User, RefreshCw, Cpu, Globe } from 'lucide-react';

interface GeminiHubProps {
  characters: Character[];
  enemies?: Enemy[];
  onApplyDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
}

export const GeminiHub: React.FC<GeminiHubProps> = ({
  characters,
  enemies = [],
  onApplyDamage,
  onHeal
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'combat' | 'tools' | 'chat'>('dossier');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Provedor e Chat
  const [hubProvider, setHubProvider] = useState<AiProvider>(() => OllamaApiService.getProvider());
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model' | 'system'; text: string }>>([
    {
      role: 'system',
      text: 'Bem-vindo à Central do Mestre IA! Copie o Dossiê para usar no Gemini Web/Google AI Studio, ou use a IA local (Ollama Offline) ou Gemini Nuvem para narrar diretamente aqui na interface.'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const thresholds = calculatePartyEncounterThresholds(characters);
  const synergy = analyzePartySynergy(characters);

  const dossierText = generateCampaignDossier(characters, synergy, thresholds);
  const combatSnapshotText = generateCombatSnapshot(characters, enemies);
  const toolsJsonText = JSON.stringify(GEMINI_TOOLS_DECLARATION, null, 2);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);

    setIsAiLoading(true);
    try {
      if (hubProvider === 'ollama') {
        const reply = await OllamaApiService.sendMessage(
          userText,
          chatMessages.filter(m => m.role !== 'system').map((m, i) => ({
            id: `hub_${i}`,
            role: m.role as 'user' | 'model',
            text: m.text,
            timestamp: ''
          })),
          characters,
          enemies,
          dossierText
        );
        setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
      } else {
        if (!apiKey) {
          setChatMessages(prev => [
            ...prev,
            {
              role: 'model',
              text: `[Modo Simulação Sem Chave]: Para que o Gemini em nuvem responda diretamente, configure sua Gemini API Key no campo acima. Ou selecione a opção "Ollama Offline" para jogar sem custos e sem internet!`
            }
          ]);
          setIsAiLoading(false);
          return;
        }

        const targetModel = (localStorage.getItem('dungeons_gemini_model') || 'gemini-2.5-flash').replace('gemini-1.5-flash', 'gemini-2.5-flash');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: dossierText }]
            },
            contents: [
              ...chatMessages.filter(m => m.role !== 'system').map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
              })),
              { role: 'user', parts: [{ text: `${userText}\n\n[Estado Atual dos Heróis]:\n${combatSnapshotText}` }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const reply = data.candidates[0].content.parts[0].text;
          setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
        } else if (data.error) {
          setChatMessages(prev => [
            ...prev,
            { role: 'model', text: `Erro na API do Gemini: ${data.error.message || JSON.stringify(data.error)}` }
          ]);
        }
      }
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { role: 'model', text: `Erro de conexão: ${err.message}` }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-[#0e111a] border border-[#231b14] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header com Abas */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#231b14] pb-4">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f5ba42] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f5ba42]" />
            CENTRAL GEMINI PRO & COPILOTO NARRATIVO
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Exporte contexto enriquecido para o Gemini narrar como Mestre ou conecte sua API diretamente.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-[#141824] p-1 rounded-xl border border-[#262f44]">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'dossier' ? 'bronze-btn shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Dossiê de Campanha
          </button>

          <button
            onClick={() => setActiveTab('combat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'combat' ? 'bronze-btn shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> Instantâneo de Combate
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'tools' ? 'bronze-btn shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Tool Calling
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'chat' ? 'bg-[#4a2e7a] border border-[#9d68ea] text-white shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Chat Mestre IA
          </button>
        </div>
      </div>

      {/* Conteúdo Aba: Dossiê de Campanha */}
      {activeTab === 'dossier' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 font-medium">
              Cole este bloco no <strong>System Prompt</strong> do Gemini Pro (Google AI Studio ou chat de campanha):
            </span>
            <button
              onClick={() => handleCopy(dossierText, 'dossier')}
              className="bronze-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
            >
              {copiedType === 'dossier' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'dossier' ? 'Copiado com Sucesso!' : 'Copiar Dossiê Completo'}
            </button>
          </div>

          <pre className="p-4 bg-[#080a10] border border-[#231b14] rounded-xl text-xs text-stone-300 font-mono overflow-x-auto max-h-[450px] whitespace-pre-wrap leading-relaxed">
            {dossierText}
          </pre>
        </div>
      )}

      {/* Conteúdo Aba: Instantâneo de Combate */}
      {activeTab === 'combat' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-300 font-medium">
              Resumo ultracompacto para colar durante a rodada para o Gemini narrar o turno exato:
            </span>
            <button
              onClick={() => handleCopy(combatSnapshotText, 'combat')}
              className="bronze-btn px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
            >
              {copiedType === 'combat' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'combat' ? 'Copiado!' : 'Copiar Instantâneo de Combate'}
            </button>
          </div>

          <pre className="p-4 bg-[#080a10] border border-[#231b14] rounded-xl text-xs text-[#f5ba42] font-mono overflow-x-auto max-h-[450px] whitespace-pre-wrap leading-relaxed">
            {combatSnapshotText}
          </pre>
        </div>
      )}

      {/* Conteúdo Aba: Tool Calling Schemas */}
      {activeTab === 'tools' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 font-medium">
              Definições JSON oficiais para o parâmetro <code>tools</code> da API Gemini (Function Calling):
            </span>
            <button
              onClick={() => handleCopy(toolsJsonText, 'tools')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
            >
              {copiedType === 'tools' ? <Check className="w-4 h-4 text-emerald-900" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'tools' ? 'Copiado!' : 'Copiar JSON Schema de Ferramentas'}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-300 font-mono overflow-x-auto max-h-[450px] leading-relaxed">
            {toolsJsonText}
          </pre>
        </div>
      )}

      {/* Conteúdo Aba: Chat Direto */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          {/* Seletor de Provedor & Configuração */}
          <div className="bg-[#101420] border border-[#2b334a] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-300">Motor Narrativo:</span>
              <div className="flex bg-[#0a0d14] p-0.5 rounded-lg border border-[#232b3d]">
                <button
                  type="button"
                  onClick={() => { setHubProvider('ollama'); OllamaApiService.setProvider('ollama'); }}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    hubProvider === 'ollama' ? 'bg-emerald-800 text-emerald-100 shadow' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" /> Ollama (Offline)
                </button>
                <button
                  type="button"
                  onClick={() => { setHubProvider('gemini'); OllamaApiService.setProvider('gemini'); }}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    hubProvider === 'gemini' ? 'bg-sky-800 text-sky-100 shadow' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Gemini (Nuvem)
                </button>
              </div>
            </div>

            {hubProvider === 'gemini' ? (
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="password"
                  placeholder="Cole sua Gemini API Key..."
                  value={apiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Modelo local ativo (qwen2.5:3b) • 100% offline
              </div>
            )}
          </div>

          {/* Janela de Mensagens */}
          <div className="bg-[#090b10] border border-[#231b14] rounded-xl p-4 h-[350px] overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#182033] border border-[#2b3a5c] text-stone-100 ml-8'
                    : msg.role === 'model'
                    ? 'bg-[#12141e] border border-[#231b14] text-stone-200 mr-8'
                    : 'bg-amber-950/40 border border-amber-800/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 opacity-80 text-[10px] uppercase">
                  {msg.role === 'user' ? <User className="w-3 h-3 text-sky-400" /> : <Bot className="w-3 h-3 text-[#f5ba42]" />}
                  {msg.role === 'user'
                    ? 'Jogador / Ação'
                    : msg.role === 'model'
                    ? hubProvider === 'ollama' ? 'Mestre Ollama (Offline)' : 'Mestre Gemini Pro'
                    : 'Sistema'}
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-amber-300/80 p-2 italic animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f5ba42]" />
                {hubProvider === 'ollama'
                  ? 'O Mestre Ollama está processando a narrativa offline...'
                  : 'O Mestre Gemini Pro está narrando a cena...'}
              </div>
            )}
          </div>

          {/* Input do Chat */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Descreva a ação dos aventureiros (ex: Thorin tenta forçar o portão de ferro com seu machado)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSendChat}
              disabled={isAiLoading || !chatInput.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" /> Enviar Ação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
