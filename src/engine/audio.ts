// -------------------------------------------------------------
// Authentic 8-Bit NES Chiptune Synthesizer via Web Audio API
// Zero external audio files; pure browser programmatic synthesis.
// -------------------------------------------------------------

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private rollNoiseNode: AudioBufferSourceNode | null = null;
  private rollGainNode: GainNode | null = null;

  constructor() {
    // AudioContext will initialize on first user gesture
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
      this.stopRoll();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  // Ollie Pop: Quick downward square wave frequency sweep
  public playOllie(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(170, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  // Flip Trick: Rapid triangle whoosh sweep
  public playFlip(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(640, ctx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  // Grab Tweak: Short punchy pulse blip
  public playGrab(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Rail Grind Hiss: Metallic bandpass noise burst
  public playGrindTick(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 4.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  // Bail Crash: Deep triangle thump + burst of noise
  public playBail(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Low thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.28);
    oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);

    // Noise crunch
    const bufferSize = ctx.sampleRate * 0.22;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
  }

  // Objective Collect Chime: Bright high two-tone bell
  public playCollect(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const playTone = (freq: number, startOffset: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startOffset + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + 0.15);
    };

    playTone(659.25, 0); // E5
    playTone(987.77, 0.08); // B5
    playTone(1318.51, 0.16); // E6
  }

  // Signature Special Fanfare: Fast 8-bit triad fanfare
  public playSpecialFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.14);
    });
  }

  // Landing Board Snap
  public playLand(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // --- Rolling Loop ---
  public updateRoll(isGrounded: boolean, speed: number): void {
    if (this.isMuted || !isGrounded || Math.abs(speed) < 0.2) {
      this.stopRoll();
      return;
    }
    const ctx = this.initContext();
    if (!ctx) return;

    if (!this.rollNoiseNode) {
      const bufferSize = ctx.sampleRate * 1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 2.5;
      }
      this.rollNoiseNode = ctx.createBufferSource();
      this.rollNoiseNode.buffer = buffer;
      this.rollNoiseNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      this.rollGainNode = ctx.createGain();
      this.rollGainNode.gain.setValueAtTime(0.04, ctx.currentTime);

      this.rollNoiseNode.connect(filter);
      filter.connect(this.rollGainNode);
      this.rollGainNode.connect(ctx.destination);

      this.rollNoiseNode.start();
    }

    if (this.rollGainNode) {
      const targetGain = Math.min(0.08, Math.max(0.01, (Math.abs(speed) / 3.5) * 0.07));
      this.rollGainNode.gain.setValueAtTime(targetGain, ctx.currentTime);
    }
  }

  private stopRoll(): void {
    if (this.rollNoiseNode) {
      try {
        this.rollNoiseNode.stop();
        this.rollNoiseNode.disconnect();
      } catch {
        // ignore
      }
      this.rollNoiseNode = null;
      this.rollGainNode = null;
    }
  }

  // --- 8-Bit Skate Punk Music Loop ---
  public startMusic(): void {
    if (this.isMuted || this.musicInterval !== null) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // 16-step fast skate-punk rhythm (C-G-Am-F chord progression)
    // 160 BPM -> 16th note ~ 94ms
    const MELODY_LEAD = [
      523.25, 0, 523.25, 659.25, 587.33, 0, 523.25, 0,
      440.00, 0, 440.00, 523.25, 392.00, 0, 440.00, 523.25
    ];
    const BASS_LINE = [
      130.81, 130.81, 130.81, 130.81, 196.00, 196.00, 196.00, 196.00,
      220.00, 220.00, 220.00, 220.00, 174.61, 174.61, 196.00, 196.00
    ];

    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (this.isMuted) return;
      const c = this.initContext();
      if (!c) return;

      const step = this.musicStep % 16;
      const t = c.currentTime;

      // Channel 1: Pulse wave lead
      const note = MELODY_LEAD[step];
      if (note > 0) {
        const leadOsc = c.createOscillator();
        const leadGain = c.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(note, t);
        leadGain.gain.setValueAtTime(0.04, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        leadOsc.connect(leadGain);
        leadGain.connect(c.destination);
        leadOsc.start(t);
        leadOsc.stop(t + 0.08);
      }

      // Channel 2: Triangle bass
      const bassNote = BASS_LINE[step];
      const bassOsc = c.createOscillator();
      const bassGain = c.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassNote, t);
      bassGain.gain.setValueAtTime(0.08, t);
      bassGain.gain.linearRampToValueAtTime(0.01, t + 0.08);
      bassOsc.connect(bassGain);
      bassGain.connect(c.destination);
      bassOsc.start(t);
      bassOsc.stop(t + 0.08);

      // Channel 3: Drum beat (Snare on 4, 12; Kick on 0, 8; Hi-hat on every odd step)
      if (step === 4 || step === 12) {
        // Snare
        const snareBuf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
        const sData = snareBuf.getChannelData(0);
        for (let i = 0; i < sData.length; i++) sData[i] = Math.random() * 2 - 1;
        const sNode = c.createBufferSource();
        sNode.buffer = snareBuf;
        const sGain = c.createGain();
        sGain.gain.setValueAtTime(0.06, t);
        sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        sNode.connect(sGain);
        sGain.connect(c.destination);
        sNode.start(t);
      } else if (step === 0 || step === 8) {
        // Kick
        const kickOsc = c.createOscillator();
        const kickGain = c.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(120, t);
        kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.07);
        kickGain.gain.setValueAtTime(0.12, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        kickOsc.connect(kickGain);
        kickGain.connect(c.destination);
        kickOsc.start(t);
        kickOsc.stop(t + 0.07);
      }

      this.musicStep++;
    }, 100);
  }

  public stopMusic(): void {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new SoundEngine();
