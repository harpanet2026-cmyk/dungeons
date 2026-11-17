import React, { useState, useEffect, useRef } from 'react';
import { Character, Enemy } from '../../core/types/dnd';
import { GeminiApiService, ChatMessage } from '../../core/gemini/geminiApiService';
import { OllamaApiService, AiProvider } from '../../core/ollama/ollamaApiService';
import { CampaignManager } from '../../core/state/campaignManager';
import { ADVENTURE_THEMES, AdventureTheme } from '../../core/campaign/adventureThemes';
import {
  Sparkles,
  Send,
  Key,
  Settings,
  Trash2,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Wand2,
  Check,
  Copy,
  Play,
  Cpu,
  Globe,
  Radio,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface GeminiLiveChatProps {
  characters: Character[];
  enemies: Enemy[];
  onRollDiceRequest?: () => void;
}

export const GeminiLiveChat: React.FC<GeminiLiveChatProps> = ({
  characters,
  enemies
}) => {
  // Provedor ativo: 'ollama' (offline) ou 'gemini' (nuvem)
  const [provider, setProvider] = useState<AiProvider>(() => OllamaApiService.getProvider());
  
  // Gemini State
  const [apiKey, setApiKey] = useState<string>(() => GeminiApiService.getApiKey());
  const [geminiModel, setGeminiModel] = useState<string>(() => GeminiApiService.getModel());
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; models?: string[] } | null>(null);
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([]);

  // Ollama State
  const [ollamaModel, setOllamaModel] = useState<string>(() => OllamaApiService.getModel());
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(() => OllamaApiService.getEndpoint());
  const [ollamaStatus, setOllamaStatus] = useState<{ online: boolean; version?: string; endpoint?: string } | null>(null);
  const [installedOllamaModels, setInstalledOllamaModels] = useState<string[]>([]);
  const [isCheckingOllama, setIsCheckingOllama] = useState<boolean>(false);

  // Painéis
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [configTab, setConfigTab] = useState<AiProvider>(() => OllamaApiService.getProvider());
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  // Dossiê de Campanha
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => CampaignManager.getThemeId());
  const [dossierText, setDossierText] = useState<string>(() => CampaignManager.getDossier());
  const [userDesires, setUserDesires] = useState<string>('');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState<boolean>(false);
  const [dossierFeedback, setDossierFeedback] = useState<string | null>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_initial',
        role: 'model',
        text: 'Saudações, nobres aventureiros. Eu sou seu Mestre da Masmorra sob os juramentos de D&D 5ª Edição. Estou pronto para narrar os desafios de sua jornada, reagindo às suas escolhas e aos dados do destino. O que o grupo decide fazer agora?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verifica status do Ollama na inicialização
  useEffect(() => {
    checkOllamaHealth();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const checkOllamaHealth = async () => {
    setIsCheckingOllama(true);
    try {
      const status = await OllamaApiService.checkStatus();
      setOllamaStatus(status);
      if (status.online) {
        const localModels = await OllamaApiService.listLocalModels();
        setInstalledOllamaModels(localModels);
        if (localModels.length > 0 && !localModels.includes(ollamaModel)) {
          // Se o modelo atual não estiver baixado, seleciona o primeiro disponível
          const preferred = ['qwen2.5:7b', 'qwen2.5:3b', 'llama3.2:3b', 'llama3:8b'];
          const matched = preferred.find(p => localModels.includes(p)) || localModels[0];
          setOllamaModel(matched);
          OllamaApiService.setModel(matched);
        }
      }
    } catch {
      setOllamaStatus({ online: false });
    } finally {
      setIsCheckingOllama(false);
    }
  };

  const handleSwitchProvider = (newProvider: AiProvider) => {
    setProvider(newProvider);
    OllamaApiService.setProvider(newProvider);
    setConfigTab(newProvider);
    setErrorMessage(null);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Por favor, insira ou cole uma chave de API primeiro.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const info = await GeminiApiService.listModels(apiKey.trim());
      if (info.models.length > 0) {
        setDiscoveredModels(info.models);
        setTestResult({
          success: true,
          message: `✓ Conexão bem-sucedida (${info.version})! Encontrados ${info.models.length} modelos liberados.`,
          models: info.models
        });
        if (!info.models.includes(geminiModel)) {
          const preferred = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
          const chosen = preferred.find(p => info.models.includes(p)) || info.models[0];
          setGeminiModel(chosen);
          GeminiApiService.setModel(chosen);
        }
      } else {
        setTestResult({
          success: false,
          message: '⚠️ A chave foi aceita pelo Google, mas nenhum modelo está liberado neste projeto. Verifique a Generative Language API em aistudio.google.com.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Falha na verificação: ${err.message || 'Verifique a chave informada.'}`
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (configTab === 'gemini') {
      GeminiApiService.setApiKey(apiKey);
      GeminiApiService.setModel(geminiModel);
    } else {
      OllamaApiService.setModel(ollamaModel);
      OllamaApiService.setEndpoint(ollamaEndpoint);
      checkOllamaHealth();
    }
    setIsConfigOpen(false);
    setErrorMessage(null);
  };

  const handleSelectTheme = (theme: AdventureTheme) => {
    setSelectedThemeId(theme.id);
    CampaignManager.saveThemeId(theme.id);
    setDossierText(theme.defaultDossier);
    setDossierFeedback(`Tema "${theme.title}" selecionado! O modelo base foi carregado no dossiê.`);
    setTimeout(() => setDossierFeedback(null), 3000);
  };

  const handleGenerateDossierWithAI = async () => {
    const currentTheme = ADVENTURE_THEMES.find(t => t.id === selectedThemeId) || ADVENTURE_THEMES[0];
    setIsGeneratingDossier(true);
    setDossierFeedback(null);

    try {
      let generated = '';
      if (provider === 'ollama') {
        generated = await OllamaApiService.generateCustomDossierWithAI(
          currentTheme.title,
          currentTheme.shortDesc,
          userDesires,
          characters,
          ollamaModel
        );
      } else {
        if (!apiKey) {
          setIsConfigOpen(true);
          setConfigTab('gemini');
          setErrorMessage('Por favor, informe sua API Key do Google AI Studio para gerar a aventura com o Gemini.');
          setIsGeneratingDossier(false);
          return;
        }
        generated = await GeminiApiService.generateCustomDossierWithAI(
          currentTheme.title,
          currentTheme.shortDesc,
          userDesires,
          characters
        );
      }

      if (generated) {
        setDossierText(generated);
        CampaignManager.saveDossier(generated);
        const sourceName = provider === 'ollama' ? `Ollama (${ollamaModel})` : 'Gemini Pro';
        setDossierFeedback(`✨ Aventura criada com sucesso pelo ${sourceName} e salva no Dossiê!`);
      }
    } catch (err: any) {
      setDossierFeedback(`Erro ao gerar aventura: ${err.message || 'Falha na IA'}`);
    } finally {
      setIsGeneratingDossier(false);
      setTimeout(() => setDossierFeedback(null), 4000);
    }
  };

  const handleSaveDossier = () => {
    CampaignManager.saveDossier(dossierText);
    setDossierFeedback('✓ Dossiê de Campanha salvo com sucesso!');
    setTimeout(() => {
      setDossierFeedback(null);
      setIsDossierOpen(false);
    }, 1500);
  };

  const handleSaveAndStartAdventure = () => {
    CampaignManager.saveDossier(dossierText);
    setIsDossierOpen(false);
    const theme = ADVENTURE_THEMES.find(t => t.id === selectedThemeId);
    const themeName = theme ? theme.title : 'Aventura Personalizada';
    
    handleSendMessage(
      `Mestre, definimos o Dossiê da nossa Campanha ("${themeName}").\n\nDiretrizes do Dossiê:\n${dossierText.slice(0, 450)}...\n\nPor favor, dê início à nossa campanha! Descreva a atmosfera inicial e coloque nossos heróis imediatamente na cena de abertura!`
    );
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    if (provider === 'gemini' && !apiKey) {
      setIsConfigOpen(true);
      setConfigTab('gemini');
      setErrorMessage('Para usar o Gemini em nuvem, informe sua chave de API ou mude para o Ollama (Offline).');
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let responseText = '';
      if (provider === 'ollama') {
        responseText = await OllamaApiService.sendMessage(
          textToSend,
          messages,
          characters,
          enemies,
          dossierText,
          ollamaModel
        );
      } else {
        responseText = await GeminiApiService.sendMessage(
          textToSend,
          messages,
          characters,
          enemies,
          dossierText
        );
      }

      const modelMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'model',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao comunicar com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const QUICK_PROMPTS = [
    '⚔️ Descreva o início do confronto contra os inimigos.',
    '🔍 Investigamos o corredor da masmorra em busca de armadilhas.',
    '✨ Conjuramos uma luz arcana para examinar as inscrições na parede.',
    '⛺ Procuramos um local seguro para descansar e recuperar forças.'
  ];

  return (
    <div className="bg-[#0e111a] border-2 border-[#a17036] rounded-2xl flex flex-col h-[670px] shadow-2xl text-stone-200 overflow-hidden">
      {/* Top Header */}
      <div className="p-3 sm:p-4 border-b border-[#231b14] bg-gradient-to-r from-[#17130e] via-[#10131d] to-[#17130e] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#f5ba42] bg-[#0c0d12] flex items-center justify-center shadow">
            {provider === 'ollama' ? (
              <Cpu className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#f5ba42]" />
            )}
          </div>
          <div>
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#f5ba42] tracking-wider flex items-center gap-2">
              <span>MESTRE IA AO VIVO</span>
              <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full border font-semibold ${
                provider === 'ollama'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-sky-950/80 text-sky-300 border-sky-700'
              }`}>
                {provider === 'ollama' ? '🖥️ OFFLINE (OLLAMA)' : '🌐 NUVEM (GEMINI)'}
              </span>
            </h3>
            <span className="text-[10px] text-stone-400 block font-sans">
              {provider === 'ollama'
                ? `Executando 100% no seu PC (${ollamaModel}) • Sem custo e sem internet`
                : `Conectado ao Google AI Studio (${geminiModel}) • Alta velocidade`}
            </span>
          </div>
        </div>

        {/* Controles de Cabeçalho */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Seletor Rápido de Provedor */}
          <div className="flex items-center bg-[#101420] border border-[#2b334a] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => handleSwitchProvider('ollama')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                provider === 'ollama'
                  ? 'bg-emerald-800/80 text-emerald-100 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Mudar para Ollama (IA Local Offline)"
            >
              <Cpu className="w-3 h-3" />
              <span>Offline</span>
            </button>
            <button
              onClick={() => handleSwitchProvider('gemini')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                provider === 'gemini'
                  ? 'bg-sky-800/80 text-sky-100 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Mudar para Google Gemini (Nuvem)"
            >
              <Globe className="w-3 h-3" />
              <span>Gemini</span>
            </button>
          </div>

          {/* Botão Dossiê & Tipos de Aventura */}
          <button
            onClick={() => {
              setIsDossierOpen(!isDossierOpen);
              setIsConfigOpen(false);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
              isDossierOpen
                ? 'bg-[#231b14] text-[#f5ba42] border-[#f5ba42] ring-1 ring-amber-500/50'
                : dossierText
                ? 'bg-[#18130e] text-[#f5ba42] border-[#a17036] hover:border-[#f5ba42]'
                : 'bg-[#141824] text-stone-300 border-[#2b334a] hover:border-stone-500'
            }`}
            title="Dossiê de Campanha & Gerador de Tipos de Aventura"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#f5ba42]" />
            <span className="hidden sm:inline">Dossiê</span>
            {dossierText && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>

          {/* Botão de Configurações */}
          <button
            onClick={() => {
              setIsConfigOpen(!isConfigOpen);
              setIsDossierOpen(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
              provider === 'ollama'
                ? ollamaStatus?.online
                  ? 'bg-[#11231a] text-emerald-300 border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                : apiKey
                ? 'bg-[#141b2b] text-sky-300 border-sky-800'
                : 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
            }`}
            title="Configurar IA e Modelos"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {provider === 'ollama'
                ? ollamaStatus?.online ? `Ollama v${ollamaStatus.version}` : 'Ollama Offline'
                : apiKey ? 'Gemini Conectado' : 'Configurar Chave'}
            </span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja limpar todo o histórico do chat com o Mestre?')) {
                setMessages([]);
              }
            }}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-[#1a1f2c] rounded-lg transition-colors"
            title="Limpar Conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Painel Expansível de Configurações (Ollama / Gemini) */}
      {isConfigOpen && (
        <div className="bg-[#10131d] border-b-2 border-[#a17036] p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-3 text-xs max-h-[85%] overflow-y-auto">
          {/* Abas do Modal de Configuração */}
          <div className="flex items-center justify-between border-b border-[#231b14] pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfigTab('ollama')}
                className={`px-3 py-1.5 rounded-lg font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 border transition-all ${
                  configTab === 'ollama'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow'
                    : 'bg-[#141824] text-stone-400 border-[#262f44] hover:text-stone-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>🖥️ Ollama (Local Offline)</span>
              </button>

              <button
                type="button"
                onClick={() => setConfigTab('gemini')}
                className={`px-3 py-1.5 rounded-lg font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 border transition-all ${
                  configTab === 'gemini'
                    ? 'bg-sky-950/80 text-sky-300 border-sky-600 shadow'
                    : 'bg-[#141824] text-stone-400 border-[#262f44] hover:text-stone-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>🌐 Google Gemini (Nuvem)</span>
              </button>
            </div>

            <button
              onClick={() => setIsConfigOpen(false)}
              className="text-stone-400 hover:text-stone-100 text-xs px-2.5 py-1 rounded border border-transparent hover:border-stone-700"
            >
              Fechar
            </button>
          </div>

          {/* Configuração do Ollama */}
          {configTab === 'ollama' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Configuração do Ollama Local
                  </h4>
                  <p className="text-[11px] text-stone-300 mt-1">
                    A IA roda diretamente no seu computador. Não há cobrança, não requer chaves de API e funciona sem internet!
                  </p>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border ${
                  ollamaStatus?.online
                    ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-700 text-rose-300'
                }`}>
                  {ollamaStatus?.online ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Online (v{ollamaStatus.version})</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Desconectado</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-300">
                    Modelo Local do Ollama:
                  </label>
                  <select
                    value={ollamaModel}
                    onChange={e => setOllamaModel(e.target.value)}
                    className="w-full bg-[#090b10] border border-[#262f44] focus:border-emerald-500 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none"
                  >
                    {installedOllamaModels.length > 0 ? (
                      installedOllamaModels.map(m => (
                        <option key={m} value={m}>{m} (Instalado)</option>
                      ))
                    ) : (
                      <>
                        <option value="qwen2.5:3b">qwen2.5:3b (Narrador D&D Rápido)</option>
                        <option value="qwen2.5:7b">qwen2.5:7b (Avançado em Português)</option>
                        <option value="llama3.2:3b">llama3.2:3b (Ultra leve)</option>
                      </>
                    )}
                  </select>
                  <span className="text-[10px] text-stone-400 block">
                    {installedOllamaModels.length > 0
                      ? `${installedOllamaModels.length} modelo(s) encontrado(s) no seu Ollama local.`
                      : 'Baixando modelo recomendado...'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-300">
                    Endpoint do Ollama:
                  </label>
                  <input
                    type="text"
                    value={ollamaEndpoint}
                    onChange={e => setOllamaEndpoint(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                    className="w-full bg-[#090b10] border border-[#262f44] focus:border-emerald-500 rounded-lg px-3 py-2 text-stone-200 font-mono text-xs outline-none"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    Padrão: <code>http://127.0.0.1:11434</code> (com proxy transparente)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090e17] border border-[#1b273b] space-y-2 text-[11px]">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Acessando via Cloudflare ou Celular?
                </div>
                <div className="text-stone-300 leading-relaxed space-y-1">
                  <p>
                    • <b>Via Túnel Completo (Recomendado):</b> Abra o terminal na pasta e execute:
                    <br />
                    <code className="ml-2 px-1.5 py-0.5 rounded bg-black/60 text-amber-300 font-mono">.\cloudflared.exe tunnel --url http://localhost:5173</code>
                    <br />
                    O link gerado (<code>https://...trycloudflare.com</code>) terá acesso direto ao Ollama através do proxy seguro!
                  </p>
                  <p>
                    • <b>Via Cloudflare Pages (*.pages.dev):</b> O navegador bloqueia chamadas diretas para <code>127.0.0.1</code> em páginas HTTPS públicas (Mixed Content). Para usar no Pages, execute:
                    <br />
                    <code className="ml-2 px-1.5 py-0.5 rounded bg-black/60 text-amber-300 font-mono">.\cloudflared.exe tunnel --url http://127.0.0.1:11434</code>
                    <br />
                    E cole o link HTTPS gerado no campo <b>Endpoint do Ollama</b> acima.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#231b14]">
                <button
                  type="button"
                  disabled={isCheckingOllama}
                  onClick={checkOllamaHealth}
                  className="px-3 py-1.5 rounded-lg border border-emerald-800 bg-[#0d1e15] hover:bg-[#122b1e] text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingOllama ? 'animate-spin' : ''}`} />
                  {isCheckingOllama ? 'Verificando Ollama...' : 'Atualizar Modelos Locais'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow"
                  >
                    Usar Ollama Agora
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Configuração do Gemini */}
          {configTab === 'gemini' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <span className="font-cinzel text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Chave de API do Google AI Studio
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Obtenha gratuitamente em{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    aistudio.google.com/app/apikey
                  </a>
                  . A chave fica salva apenas no seu navegador.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Cole sua API Key (ex: AIzaSy...)"
                    className="w-full bg-[#090b10] border border-[#262f44] focus:border-sky-500 rounded-lg px-3 py-2 text-stone-100 font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <select
                    value={geminiModel}
                    onChange={e => setGeminiModel(e.target.value)}
                    className="w-full bg-[#090b10] border border-[#262f44] focus:border-sky-500 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none"
                  >
                    {discoveredModels.length > 0 ? (
                      discoveredModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))
                    ) : (
                      <>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Latest)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  testResult.success
                    ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-700 text-rose-200'
                }`}>
                  {testResult.message}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#231b14]">
                <button
                  type="button"
                  disabled={isTestingKey || !apiKey.trim()}
                  onClick={handleTestKey}
                  className="px-3 py-1.5 rounded-lg border border-sky-800 bg-[#0d1825] hover:bg-[#142337] text-sky-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all shadow"
                >
                  {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isTestingKey ? 'Testando Conexão...' : 'Testar Chave & Detectar Modelos'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider shadow"
                  >
                    Salvar & Usar Gemini
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Painel Expansível de Dossiê de Campanha e Tipos de Aventura */}
      {isDossierOpen && (
        <div className="bg-[#10131d] border-b-2 border-[#a17036] p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-3 text-xs max-h-[85%] overflow-y-auto">
          <div className="flex items-start justify-between gap-3 border-b border-[#231b14] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#f5ba42]" />
                <h4 className="font-cinzel text-sm sm:text-base font-bold gold-gradient-text tracking-wider uppercase">
                  Dossiê de Campanha & Tipos de Aventura
                </h4>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Escolha o arquétipo de aventura que deseja viver, use a IA para gerar os detalhes ou edite seu próprio lore.
              </p>
            </div>

            <button
              onClick={() => setIsDossierOpen(false)}
              className="text-stone-400 hover:text-stone-100 text-xs px-2.5 py-1 rounded border border-transparent hover:border-stone-700"
            >
              Fechar
            </button>
          </div>

          {/* 1. Escolha entre Vários Tipos de Aventura */}
          <div className="space-y-2">
            <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-[#f5ba42] block">
              1. Escolha o Tipo de Aventura para esta Campanha:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {ADVENTURE_THEMES.map(theme => {
                const isSelected = theme.id === selectedThemeId;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? 'bg-[#22180f] border-[#f5ba42] ring-1 ring-amber-500/50 shadow-md'
                        : 'bg-[#141824] border-[#262f44] hover:border-[#a17036] hover:bg-[#191f30]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl shrink-0">{theme.icon}</span>
                      <div className="min-w-0">
                        <h5 className={`font-cinzel text-xs font-bold leading-tight ${isSelected ? 'text-[#f5ba42]' : 'text-stone-200'}`}>
                          {theme.title}
                        </h5>
                        <span className="text-[10px] text-stone-400 block line-clamp-2 mt-0.5">
                          {theme.shortDesc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#231b14] text-[9px]">
                      <span className="text-stone-400 uppercase font-semibold">{theme.tone.split(',')[0]}</span>
                      {isSelected && <span className="text-emerald-400 font-bold">✓ Ativo</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Personalização & Geração com IA */}
          <div className="bg-[#0b0e15] border border-[#231b14] p-3.5 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f5ba42]" />
                2. O que você quer viver na campanha? (Personalize seu Desejo):
              </span>
              <span className="text-[10px] text-stone-400">
                Gerador ativo via: <b className="text-amber-300">{provider === 'ollama' ? `Ollama (${ollamaModel})` : `Gemini (${geminiModel})`}</b>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userDesires}
                onChange={e => setUserDesires(e.target.value)}
                placeholder="Ex: Quero uma masmorra de mortos-vivos com uma cripta antiga, um livro amaldiçoado e um lich conspirador..."
                className="flex-1 bg-[#141824] border border-[#2b334a] focus:border-[#f5ba42] rounded-xl px-3 py-2 text-stone-100 text-xs outline-none placeholder:text-stone-600"
              />

              <button
                type="button"
                onClick={handleGenerateDossierWithAI}
                disabled={isGeneratingDossier}
                className="bronze-btn px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg text-[#f5ba42] disabled:opacity-50 shrink-0"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGeneratingDossier ? 'animate-spin' : ''}`} />
                <span>
                  {isGeneratingDossier
                    ? 'Criando Aventura...'
                    : provider === 'ollama'
                    ? '⚡ Gerar com Ollama (Offline)'
                    : '⚡ Gerar com Gemini'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Área de Texto do Dossiê (Colável e Editável) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-300">
                3. Texto do Dossiê de Campanha:
              </label>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(dossierText);
                  setDossierFeedback('Dossiê copiado para a área de transferência!');
                  setTimeout(() => setDossierFeedback(null), 2500);
                }}
                className="text-[10px] text-stone-400 hover:text-[#f5ba42] flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" /> Copiar Texto
              </button>
            </div>

            <textarea
              rows={6}
              value={dossierText}
              onChange={e => setDossierText(e.target.value)}
              placeholder="Cole aqui o dossiê da campanha (lore, sinopse, vilão, gancho inicial, locais e segredos)..."
              className="w-full bg-[#090b10] border border-[#262f44] focus:border-[#f5ba42] rounded-xl p-3 text-stone-200 text-xs font-mono outline-none leading-relaxed"
            />
          </div>

          {/* Feedback temporário */}
          {dossierFeedback && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dossierFeedback}</span>
            </div>
          )}

          {/* Rodapé de Ações do Dossiê */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#231b14]">
            <span className="text-[10px] text-stone-400 italic">
              Este dossiê será injetado automaticamente nas instruções do Mestre IA.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDossier}
                className="px-4 py-2 bg-[#141824] hover:bg-[#1d2333] border border-[#2b334a] hover:border-[#a17036] rounded-xl text-xs font-bold text-stone-200 uppercase tracking-wider transition-colors"
              >
                Salvar Dossiê
              </button>

              <button
                type="button"
                onClick={handleSaveAndStartAdventure}
                className="bronze-btn px-5 py-2 rounded-xl text-xs font-cinzel font-bold text-[#f5ba42] uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Salvar & Iniciar Aventura no Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área de Mensagens (Chat Scroll) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow ${
                  provider === 'ollama' ? 'border-emerald-600 bg-[#0d1e15]' : 'border-[#a17036] bg-[#141824]'
                }`}>
                  {provider === 'ollama' ? (
                    <Cpu className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#f5ba42]" />
                  )}
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
                isUser
                  ? 'bg-[#182033] border border-[#2b3a5c] text-stone-100 rounded-tr-none'
                  : 'bg-[#12141e] border border-[#231b14] text-stone-200 rounded-tl-none space-y-1.5'
              }`}>
                <div className="flex items-center justify-between gap-3 text-[10px] text-stone-400 mb-1 border-b border-stone-800/50 pb-1">
                  <span className={`font-bold uppercase tracking-wider ${
                    isUser
                      ? 'text-sky-300'
                      : provider === 'ollama'
                      ? 'text-emerald-400'
                      : 'text-[#f5ba42]'
                  }`}>
                    {isUser
                      ? '👤 Ação dos Jogadores'
                      : provider === 'ollama'
                      ? `🛡️ Mestre Ollama (${ollamaModel})`
                      : `⚔️ Mestre Gemini Pro (${geminiModel})`}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full border border-sky-600 bg-[#141b2b] flex items-center justify-center shrink-0 shadow">
                  <User className="w-4 h-4 text-sky-400" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-amber-300/80 animate-pulse">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow ${
              provider === 'ollama' ? 'border-emerald-600 bg-[#0d1e15]' : 'border-[#a17036] bg-[#141824]'
            }`}>
              {provider === 'ollama' ? (
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <Bot className="w-4 h-4 text-[#f5ba42] animate-spin" />
              )}
            </div>
            <div className="bg-[#12141e] border border-[#231b14] px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#f5ba42]" />
              <span>
                {provider === 'ollama'
                  ? `O Mestre Ollama (${ollamaModel}) está processando a narrativa offline...`
                  : 'O Mestre Gemini está consultando o destino e formulando a narrativa...'}
              </span>
            </div>
          </div>
        )}

        {/* Erro de Comunicação */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3.5 rounded-xl text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-semibold block">{errorMessage}</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {provider === 'ollama'
                    ? 'Verifique se o Ollama está aberto em seu computador ou clique no botão abaixo para alternar para o Gemini.'
                    : 'A chave do Gemini não pôde processar a solicitação. Você pode testá-la ou alternar para o Ollama Offline 100% gratuito.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-1 border-t border-rose-800/40">
              <button
                type="button"
                onClick={() => handleSwitchProvider(provider === 'ollama' ? 'gemini' : 'ollama')}
                className="px-3 py-1 bg-[#141824] border border-stone-600 text-stone-200 rounded-lg text-xs font-bold hover:bg-[#1f2638] flex items-center gap-1.5 transition-all shadow"
              >
                Alternar para {provider === 'ollama' ? '🌐 Gemini (Nuvem)' : '🖥️ Ollama (Offline)'}
              </button>
              <button
                type="button"
                onClick={() => { setIsConfigOpen(true); setErrorMessage(null); }}
                className="px-3 py-1 bg-[#1a140f] border border-[#a17036] text-[#f5ba42] rounded-lg text-xs font-bold hover:bg-[#281f17] flex items-center gap-1.5 transition-all shadow"
              >
                <Settings className="w-3.5 h-3.5" /> Abrir Configurações
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões Rápidas de Ação */}
      <div className="px-3.5 py-2 border-t border-[#1c2130] bg-[#0a0d14] flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-stone-500 font-bold uppercase tracking-wider shrink-0 text-[10px]">Sugestões:</span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#131724] hover:bg-[#1a2133] border border-[#262f44] text-stone-300 hover:text-stone-100 transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Caixa de Entrada de Texto */}
      <div className="p-3.5 border-t border-[#231b14] bg-[#0c0e15]">
        <div className="flex items-end gap-2 bg-[#121520] border border-[#2b334a] focus-within:border-[#f5ba42] rounded-xl p-2 transition-colors">
          <textarea
            rows={2}
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Declare a ação dos heróis para o Mestre (${provider === 'ollama' ? 'Ollama Offline' : 'Gemini Pro'})...`}
            className="w-full bg-transparent text-xs text-stone-100 outline-none resize-none placeholder-stone-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className="bronze-btn p-2 rounded-lg text-[#f5ba42] disabled:opacity-40 disabled:cursor-not-allowed shadow transition-all shrink-0"
            title="Enviar ação (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
