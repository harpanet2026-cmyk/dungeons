/**
 * Motor de Áudio para Som Ambiente de Masmorra e Reinos (Dungeon Ambience)
 * Reproduz as faixas atmosféricas oficiais de O Senhor dos Anéis / O Hobbit
 * fornecidas pelo usuário, em loop contínuo com controle de volume e suporte a uploads.
 */

export type AmbiencePreset = 'moria' | 'silence' | 'thorin';

export interface AmbienceTrackInfo {
  id: AmbiencePreset;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

export const AMBIENCE_TRACKS: Record<AmbiencePreset, AmbienceTrackInfo> = {
  moria: {
    id: 'moria',
    title: '🏰 Sozinho em Moria (Alone in Moria)',
    subtitle: 'Fogueira, Salões Ancestrais & Trilha Suave',
    url: '/audio/moria.mp3',
    icon: '🏰'
  },
  silence: {
    id: 'silence',
    title: '🕯️ Silêncio & Esperança (LOTR Focus)',
    subtitle: 'Foco Emocional Profundo & Atmosfera Épica',
    url: '/audio/hope_silence.mp3',
    icon: '🕯️'
  },
  thorin: {
    id: 'thorin',
    title: '⚔️ Cântico dos Anões (Thorin’s Song)',
    subtitle: 'Vocais Épicos dos Anões & Melodia de Concentração',
    url: '/audio/thorin_song.mp3',
    icon: '⚔️'
  }
};

export class DungeonAudioEngine {
  private static audioElement: HTMLAudioElement | null = null;
  private static isPlaying: boolean = false;
  private static currentPreset: AmbiencePreset = 'moria';
  private static volume: number = 0.5;

  private static getOrCreateAudio(): HTMLAudioElement {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
    }
    return this.audioElement;
  }

  /**
   * Inicia a reprodução do som ambiente selecionado
   */
  public static startAmbience(preset: AmbiencePreset = 'moria'): void {
    const audio = this.getOrCreateAudio();
    this.currentPreset = preset;
    const track = AMBIENCE_TRACKS[preset];

    // Atualiza a fonte se necessário
    if (!audio.src.endsWith(track.url)) {
      audio.src = track.url;
    }

    audio.volume = this.volume;
    audio.play().catch(err => {
      console.warn('Reprodução de áudio prevenida pelo navegador:', err);
    });
    this.isPlaying = true;
  }

  /**
   * Pausa a reprodução
   */
  public static stopAmbience(): void {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  /**
   * Altera o volume (0.0 a 1.0)
   */
  public static setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public static getVolume(): number {
    return this.volume;
  }

  public static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public static getCurrentPreset(): AmbiencePreset {
    return this.currentPreset;
  }

  /**
   * Permite ao usuário carregar uma faixa MP3 personalizada do disco
   */
  public static loadCustomAudioFile(file: File): void {
    this.stopAmbience();
    const url = URL.createObjectURL(file);
    const audio = this.getOrCreateAudio();
    audio.src = url;
    audio.volume = this.volume;
    audio.play().catch(() => {});
    this.isPlaying = true;
  }
}
