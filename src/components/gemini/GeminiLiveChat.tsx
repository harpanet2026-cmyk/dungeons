import React, { useState, useEffect, useRef } from 'react';
import { Character, Enemy } from '../../core/types/dnd';
import { GeminiApiService, ChatMessage } from '../../core/gemini/geminiApiService';
import { CampaignManager } from '../../core/state/campaignManager';
import { ADVENTURE_THEMES, AdventureTheme } from '../../core/campaign/adventureThemes';
import { Sparkles, Send, Key, Settings, Trash2, Bot, User, AlertCircle, RefreshCw, BookOpen, Wand2, Check, Copy, ChevronDown, ChevronUp, Play, Flame, Shield } from 'lucide-react';

interface GeminiLiveChatProps {
  characters: Character[];
  enemies: Enemy[];
  onRollDiceRequest?: () => void;
}

export const GeminiLiveChat: React.FC<GeminiLiveChatProps> = ({
  characters,
  enemies
}) => {
  const [apiKey, setApiKey] = useState<string>(() => GeminiApiService.getApiKey());
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(() => !GeminiApiService.getApiKey());
  const [model, setModel] = useState<string>(() => GeminiApiService.getModel());

  // Estado do Dossiê de Campanha e Tipos de Aventura
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => CampaignManager.getThemeId());
  const [dossierText, setDossierText] = useState<string>(() => CampaignManager.getDossier());
  const [userDesires, setUserDesires] = useState<string>('');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState<boolean>(false);
  const [dossierFeedback, setDossierFeedback] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg_initial',
        role: 'model',
        text: 'Saudações, nobres aventureiros. Eu sou o Gemini Pro, seu Mestre da Masmorra sob os antigos juramentos de imparcialidade de D&D 5e. Os ventos gélidos uivam pelas fendas da masmorra. O que o grupo decide fazer a seguir?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    GeminiApiService.setApiKey(apiKey);
    GeminiApiService.setModel(model);
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
    if (!apiKey) {
      setIsConfigOpen(true);
      setErrorMessage('Por favor, informe sua API Key do Google AI Studio para gerar a aventura com IA.');
      return;
    }

    const currentTheme = ADVENTURE_THEMES.find(t => t.id === selectedThemeId) || ADVENTURE_THEMES[0];
    setIsGeneratingDossier(true);
    setDossierFeedback(null);

    try {
      const generated = await GeminiApiService.generateCustomDossierWithAI(
        currentTheme.title,
        currentTheme.shortDesc,
        userDesires,
        characters
      );

      if (generated) {
        setDossierText(generated);
        CampaignManager.saveDossier(generated);
        setDossierFeedback('✨ Aventura épica criada com sucesso pelo Gemini Pro e salva no Dossiê!');
      }
    } catch (err: any) {
      setDossierFeedback(`Erro ao gerar aventura: ${err.message || 'Falha na API'}`);
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
    
    // Envia a ação para iniciar no chat
    handleSendMessage(
      `Mestre, definimos o Dossiê da nossa Campanha ("${themeName}").\n\nDiretrizes do Dossiê:\n${dossierText.slice(0, 450)}...\n\nPor favor, dê início à nossa campanha! Descreva a atmosfera inicial e coloque nossos heróis imediatamente na cena de abertura!`
    );
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    if (!apiKey) {
      setIsConfigOpen(true);
      setErrorMessage('Por favor, informe sua chave de API gratuita do Google AI Studio para começar a conversar.');
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
      const responseText = await GeminiApiService.sendMessage(
        textToSend,
        messages,
        characters,
        enemies,
        dossierText
      );

      const modelMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'model',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao comunicar com o Gemini.');
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
    <div className="bg-[#0e111a] border-2 border-[#a17036] rounded-2xl flex flex-col h-[650px] shadow-2xl text-stone-200 overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#231b14] bg-gradient-to-r from-[#17130e] via-[#10131d] to-[#17130e] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#f5ba42] bg-[#0c0d12] flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-[#f5ba42]" />
          </div>
          <div>
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#f5ba42] tracking-wider flex items-center gap-1.5">
              MESTRE IA AO VIVO • GEMINI PRO
            </h3>
            <span className="text-[10px] text-stone-400 block font-sans">
              Narração em tempo real com regras e estado determinístico de D&D 5e
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span className="hidden sm:inline">Dossiê de Campanha</span>
            <span className="sm:hidden">Dossiê</span>
            {dossierText && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>

          {/* Status da API Key */}
          <button
            onClick={() => {
              setIsConfigOpen(!isConfigOpen);
              setIsDossierOpen(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
              apiKey
                ? 'bg-[#141b2b] text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
            }`}
            title="Configurações da API do Google AI Studio"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{apiKey ? 'API Conectada' : 'Configurar Chave'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja limpar todo o histórico do chat com o Gemini?')) {
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
                Escolha o arquétipo de aventura que deseja viver, use a IA para gerar os detalhes ou cole seu próprio lore de campanha.
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

          {/* 2. Personalização & Geração com Gemini */}
          <div className="bg-[#0b0e15] border border-[#231b14] p-3.5 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f5ba42]" />
                2. O que você quer viver na campanha? (Personalize seu Desejo):
              </span>
              <span className="text-[10px] text-stone-400">O Gemini Pro adaptará a aventura aos seus heróis</span>
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
                <span>{isGeneratingDossier ? 'Criando Aventura...' : '⚡ Gerar com IA (Gemini)'}</span>
              </button>
            </div>
          </div>

          {/* 3. Área de Texto do Dossiê (Colável e Editável) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-300">
                3. Texto do Dossiê de Campanha (Cole aqui seu material ou edite as diretrizes):
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
              Este dossiê será injetado diretamente nas diretrizes secretas do Mestre Gemini Pro.
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

      {/* Painel Expansível de Configuração da API */}
      {isConfigOpen && (
        <form onSubmit={handleSaveConfig} className="bg-[#121520] border-b border-[#231b14] p-4 space-y-3 animate-in slide-in-from-top-3 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-cinzel text-xs font-bold text-[#f5ba42] uppercase tracking-wider block">
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
                . A chave fica salva apenas no seu próprio navegador.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="password"
                required
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Cole sua API Key (ex: AIzaSy...)"
                className="w-full bg-[#090b10] border border-[#262f44] focus:border-[#f5ba42] rounded-lg px-3 py-2 text-stone-100 font-mono text-xs outline-none"
              />
            </div>

            <div>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-[#090b10] border border-[#262f44] focus:border-[#f5ba42] rounded-lg px-3 py-2 text-stone-200 text-xs outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado - Rápido)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Narrativa Épica)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Latest)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="px-3 py-1.5 rounded-lg text-stone-400 hover:text-stone-200 text-xs"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="bronze-btn px-4 py-1.5 rounded-lg text-xs font-bold text-[#f5ba42] uppercase tracking-wider shadow"
            >
              Salvar Chave
            </button>
          </div>
        </form>
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
                <div className="w-8 h-8 rounded-full border border-[#a17036] bg-[#141824] flex items-center justify-center shrink-0 shadow">
                  <Bot className="w-4 h-4 text-[#f5ba42]" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
                isUser
                  ? 'bg-[#182033] border border-[#2b3a5c] text-stone-100 rounded-tr-none'
                  : 'bg-[#12141e] border border-[#231b14] text-stone-200 rounded-tl-none space-y-1.5'
              }`}>
                <div className="flex items-center justify-between gap-3 text-[10px] text-stone-400 mb-1 border-b border-stone-800/50 pb-1">
                  <span className={`font-bold uppercase tracking-wider ${isUser ? 'text-sky-300' : 'text-[#f5ba42]'}`}>
                    {isUser ? '👤 Ação dos Jogadores' : '⚔️ Mestre Gemini Pro'}
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
            <div className="w-8 h-8 rounded-full border border-[#a17036] bg-[#141824] flex items-center justify-center shadow">
              <Bot className="w-4 h-4 text-[#f5ba42] animate-spin" />
            </div>
            <div className="bg-[#12141e] border border-[#231b14] px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#f5ba42]" />
              <span>O Mestre está consultando o destino e formulando a narrativa...</span>
            </div>
          </div>
        )}

        {/* Erro de Comunicação */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
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
            placeholder="Declare a ação dos heróis... (Ex: Thorin ataca o orc pela retaguarda, Lyra prepara Escudo Arcano)"
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
