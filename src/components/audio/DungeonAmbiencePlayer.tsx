import React, { useState, useEffect } from 'react';
import { DungeonAudioEngine, AmbiencePreset, AMBIENCE_TRACKS } from '../../core/audio/dungeonAudioEngine';
import { Volume2, VolumeX, Play, Pause, Sliders, Music, Sparkles, Upload } from 'lucide-react';

export const DungeonAmbiencePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [preset, setPreset] = useState<AmbiencePreset>('moria');
  const [volume, setVolume] = useState<number>(60);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    DungeonAudioEngine.setVolume(volume / 100);
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) {
      DungeonAudioEngine.stopAmbience();
      setIsPlaying(false);
    } else {
      DungeonAudioEngine.startAmbience(preset);
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (newPreset: AmbiencePreset) => {
    setPreset(newPreset);
    if (isPlaying) {
      DungeonAudioEngine.startAmbience(newPreset);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      DungeonAudioEngine.loadCustomAudioFile(file);
      setIsPlaying(true);
      setIsMenuOpen(false);
    }
  };

  const currentTrack = AMBIENCE_TRACKS[preset];

  return (
    <div className="relative">
      {/* Botão Principal do Tocador de Som Ambiente */}
      <div className="flex items-center gap-1.5 bg-[#141824] border border-[#262f44] hover:border-[#a17036] rounded-full px-2.5 py-1 transition-all shadow">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all ${
            isPlaying
              ? 'bg-[#231b14] text-[#f5ba42] border border-[#a17036] shadow-sm shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title={isPlaying ? "Pausar Trilha de Fantasia" : "Iniciar Trilha Sonora Épica"}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#f5ba42] animate-pulse" />
              {/* Barrinhas Animadas do Equalizador */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-3 bg-[#f5ba42] rounded-full animate-bounce" />
                <span className="w-0.5 h-2 bg-[#f5ba42] rounded-full animate-bounce delay-75" />
                <span className="w-0.5 h-2.5 bg-[#f5ba42] rounded-full animate-bounce delay-150" />
              </div>
              <span className="text-[10px] hidden sm:inline">{currentTrack.id === 'moria' ? 'Moria' : currentTrack.id === 'silence' ? 'Silêncio' : 'Thorin'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-[10px] hidden sm:inline">Som Ambiente</span>
            </>
          )}
        </button>

        {/* Botão de Ajustes / Menu */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-1 rounded-full text-stone-400 hover:text-[#f5ba42] transition-colors ${
            isMenuOpen ? 'text-[#f5ba42]' : ''
          }`}
          title="Configurações e Seleção de Faixas MP3"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Menu Popover Flutuante com Presets MP3 e Volume */}
      {isMenuOpen && (
        <div className="absolute right-0 top-11 z-50 w-80 bg-[#10121a] border-2 border-[#a17036] rounded-2xl p-4 shadow-2xl space-y-4 text-stone-200 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#231b14] pb-2">
            <span className="font-cinzel text-xs font-bold text-[#f5ba42] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#f5ba42]" /> Trilhas dos Reinos & LOTR
            </span>
            <span className="text-[10px] text-stone-400 font-semibold">
              {isPlaying ? '● Reproduzindo' : '○ Pausado'}
            </span>
          </div>

          {/* Lista de Faixas MP3 Oficiais */}
          <div className="space-y-2 text-xs">
            <label className="text-[10px] uppercase font-bold text-stone-400 block">
              Trilhas Ambientais da Masmorra:
            </label>

            {Object.values(AMBIENCE_TRACKS).map((track) => {
              const isSelected = preset === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectPreset(track.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#231b14] border-[#f5ba42] text-[#f5ba42] font-bold shadow-md shadow-amber-500/10'
                      : 'bg-[#141824] border-[#262f44] text-stone-300 hover:border-[#a17036] hover:bg-[#181e2e]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="block font-semibold text-xs truncate group-hover:text-[#f5ba42]">
                      {track.title}
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal block truncate mt-0.5">
                      {track.subtitle}
                    </span>
                  </div>
                  {isSelected && <span className="text-xs text-[#f5ba42] font-black shrink-0">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Controle de Volume */}
          <div className="space-y-1.5 pt-2 border-t border-[#231b14]">
            <div className="flex justify-between text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400">Volume Ambiente:</span>
              <strong className="text-[#f5ba42] font-cinzel">{volume}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full accent-[#f5ba42] bg-[#141824] rounded-lg cursor-pointer h-1.5"
            />
          </div>

          {/* Upload de Trilha Própria (Opcional) */}
          <div className="pt-2 border-t border-[#231b14]">
            <label className="w-full bronze-btn py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow">
              <Upload className="w-3 h-3 text-[#f5ba42]" /> Carregar Outro MP3 Local
              <input
                type="file"
                accept="audio/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
