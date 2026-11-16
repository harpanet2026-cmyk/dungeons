/**
 * Motor de Áudio Procedural para Som Ambiente de Masmorra (Dungeon Ambience)
 * Utiliza a Web Audio API nativa para criar um soundscape imersivo infinito
 * sem necessidade de arquivos externos pesados ou problemas de CORS.
 */

export type AmbiencePreset = 'dungeon' | 'crypt' | 'ruins';

export class DungeonAudioEngine {
  private static ctx: AudioContext | null = null;
  private static isPlaying: boolean = false;
  private static currentPreset: AmbiencePreset = 'dungeon';
  private static masterGain: GainNode | null = null;
  private static volume: number = 0.5;

  // Nodes do Drone (Ressonância Sombria)
  private static droneOsc1: OscillatorNode | null = null;
  private static droneOsc2: OscillatorNode | null = null;
  private static droneFilter: BiquadFilterNode | null = null;
  private static droneGain: GainNode | null = null;

  // Nodes do Vento da Caverna (Ruído Filtrado)
  private static windSource: AudioBufferSourceNode | null = null;
  private static windFilter: BiquadFilterNode | null = null;
  private static windGain: GainNode | null = null;
  private static windLfo: OscillatorNode | null = null;

  // Intervalo de Gotas de Água
  private static dropTimer: any = null;

  // Áudio Customizado (se o usuário carregar um MP3)
  private static customAudioElement: HTMLAudioElement | null = null;
  private static isCustomAudioPlaying: boolean = false;

  private static initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Inicia o som ambiente da masmorra
   */
  public static startAmbience(preset: AmbiencePreset = 'dungeon'): void {
    const ctx = this.initContext();
    this.stopAmbience();

    this.currentPreset = preset;
    this.isPlaying = true;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // 1. Criação do Drone Sombrio de Baixa Frequência
    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.35, ctx.currentTime);

    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(preset === 'crypt' ? 90 : 130, ctx.currentTime);

    this.droneOsc1 = ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(preset === 'crypt' ? 48 : 55, ctx.currentTime); // Fá / Lá grave

    this.droneOsc2 = ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(preset === 'crypt' ? 72 : 82.5, ctx.currentTime); // Harmônico sutil

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();

    // 2. Vento das Cavernas (Ruído Rosa / Branco filtrado e modulado por LFO)
    this.setupWindLayer(ctx, preset);

    // 3. Gotas de Água Periódicas (Eco nas Estalactites)
    if (preset === 'dungeon' || preset === 'crypt') {
      this.startWaterDrops(ctx);
    }
  }

  private static setupWindLayer(ctx: AudioContext, preset: AmbiencePreset): void {
    // Cria buffer de ruído de 5 segundos em loop
    const bufferSize = ctx.sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // Ruído branco
    }

    this.windSource = ctx.createBufferSource();
    this.windSource.buffer = noiseBuffer;
    this.windSource.loop = true;

    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(preset === 'ruins' ? 450 : 280, ctx.currentTime);
    this.windFilter.Q.setValueAtTime(preset === 'ruins' ? 4.0 : 2.5, ctx.currentTime);

    // LFO para simular lufadas de vento variando a intensidade
    this.windLfo = ctx.createOscillator();
    this.windLfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 1 lufada a cada ~12 segundos

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    this.windLfo.connect(lfoGain);
    lfoGain.connect(this.windFilter.frequency);

    this.windGain = ctx.createGain();
    this.windGain.gain.setValueAtTime(preset === 'ruins' ? 0.45 : 0.25, ctx.currentTime);

    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    if (this.masterGain) {
      this.windGain.connect(this.masterGain);
    }

    this.windSource.start();
    this.windLfo.start();
  }

  private static startWaterDrops(ctx: AudioContext): void {
    const triggerDrop = () => {
      if (!this.isPlaying || !this.masterGain) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Frequência aleatória do pingo d'água
      const baseFreq = 900 + Math.random() * 600;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08);

      gain.gain.setValueAtTime(0.18 + Math.random() * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);

      // Próxima gota em intervalo orgânico (entre 1.8s e 5.5s)
      const nextInterval = 1800 + Math.random() * 3700;
      this.dropTimer = setTimeout(triggerDrop, nextInterval);
    };

    this.dropTimer = setTimeout(triggerDrop, 2000);
  }

  /**
   * Para o som ambiente
   */
  public static stopAmbience(): void {
    this.isPlaying = false;

    if (this.dropTimer) {
      clearTimeout(this.dropTimer);
      this.dropTimer = null;
    }

    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.windSource?.stop();
      this.windLfo?.stop();
    } catch {}

    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.windSource = null;
    this.windLfo = null;

    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.isCustomAudioPlaying = false;
    }
  }

  /**
   * Altera o volume (0.0 a 1.0)
   */
  public static setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.volume;
    }
  }

  public static getVolume(): number {
    return this.volume;
  }

  public static getIsPlaying(): boolean {
    return this.isPlaying || this.isCustomAudioPlaying;
  }

  public static getCurrentPreset(): AmbiencePreset {
    return this.currentPreset;
  }

  /**
   * Permite ao usuário tocar seu próprio arquivo de áudio (MP3, WAV, etc.)
   */
  public static loadCustomAudioFile(file: File): void {
    this.stopAmbience();
    const url = URL.createObjectURL(file);
    if (!this.customAudioElement) {
      this.customAudioElement = new Audio();
      this.customAudioElement.loop = true;
    }
    this.customAudioElement.src = url;
    this.customAudioElement.volume = this.volume;
    this.customAudioElement.play();
    this.isCustomAudioPlaying = true;
  }
}
