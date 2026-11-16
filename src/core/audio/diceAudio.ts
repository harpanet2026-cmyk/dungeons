// Sintetizador procedural de som de rolagem de dados em madeira/veludo via Web Audio API
export class DiceAudioEngine {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Gera o som tátil e satisfatório de dados de madeira rolando e quicando na mesa
  static playDiceRollSound(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // 4 a 6 pequenos impactos e ricochetes rápidos
      const impacts = 4 + Math.floor(Math.random() * 3);
      let timeOffset = 0;

      for (let i = 0; i < impacts; i++) {
        const impactTime = now + timeOffset;
        const decayTime = 0.04 + Math.random() * 0.03;
        const pitch = 280 + Math.random() * 240;

        // Oscilador de impacto da madeira
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, impactTime);
        osc.frequency.exponentialRampToValueAtTime(80, impactTime + decayTime);

        // Ruído de atrito do dado
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800 + Math.random() * 400, impactTime);
        noiseFilter.Q.setValueAtTime(3, impactTime);

        const noiseGain = ctx.createGain();

        // Envelopes de ganho
        const volumeFactor = 1 - (i / impacts) * 0.45;
        oscGain.gain.setValueAtTime(0.18 * volumeFactor, impactTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, impactTime + decayTime);

        noiseGain.gain.setValueAtTime(0.12 * volumeFactor, impactTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, impactTime + decayTime);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        osc.start(impactTime);
        osc.stop(impactTime + decayTime);

        noise.start(impactTime);
        noise.stop(impactTime + decayTime);

        timeOffset += 0.06 + Math.random() * 0.07;
      }
    } catch {
      // Falha silenciosa em navegadores com restrições
    }
  }
}
