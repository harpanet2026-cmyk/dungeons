import React, { useState } from 'react';
import { Character, Enemy } from '../../core/types/dnd';
import { generateCampaignDossier, generateCombatSnapshot } from '../../core/gemini/promptGenerator';
import { GEMINI_TOOLS_DECLARATION } from '../../core/gemini/toolSchemas';
import { calculatePartyEncounterThresholds, analyzePartySynergy } from '../../core/analysis/encounterAnalysis';
import { Copy, Check, Sparkles, Terminal, FileText, Swords, Key, Send, Bot, User, RefreshCw } from 'lucide-react';

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

  // Estado do Chat Direto com Gemini API
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model' | 'system'; text: string }>>([
    {
      role: 'system',
      text: 'Bem-vindo à Central Gemini Pro! Copie o Dossiê para usar no Gemini Web/Google AI Studio, ou insira sua API Key abaixo para narrar diretamente aqui na interface com execução automática de regras.'
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

    if (!apiKey) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `[Modo Simulação Sem Chave]: Para que eu responda gerando a narração diretamente, configure sua Gemini API Key no campo acima. Você também pode copiar o "Dossiê da Campanha" na aba ao lado e colá-lo no Google AI Studio (aistudio.google.com) ou Gemini Web gratuitamente!`
        }
      ]);
      return;
    }

    setIsAiLoading(true);
    try {
      // Chama a API do Gemini Pro com system instruction
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { role: 'model', text: `Erro de conexão com o Gemini: ${err.message}` }
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
          {/* Configuração de API Key */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Key className="w-4 h-4 text-amber-400" /> Gemini API Key:
            </div>
            <input
              type="password"
              placeholder="Cole sua API Key (opcional, salva apenas localmente)"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded px-3 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-slate-400">
              {apiKey ? '✓ Chave configurada' : 'Modo offline / sem chave'}
            </span>
          </div>

          {/* Janela de Mensagens */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[350px] overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100 ml-8'
                    : msg.role === 'model'
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 mr-8'
                    : 'bg-purple-950/30 border border-purple-800/40 text-purple-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 opacity-80 text-[10px] uppercase">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {msg.role === 'user' ? 'Jogador / Ação' : msg.role === 'model' ? 'Gemini Pro (Mestre)' : 'Sistema'}
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2 italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Gemini Pro está narrando a cena...
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
