class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('selah_muted');
      this.muted = saved === 'true';
    } catch {
      this.muted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('selah_muted', String(muted));
    } catch {
      // Ignore storage errors
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playCorrect(step = 0): void {
    // Gentle pentatonic harp notes (C5, D5, E5, G5, A5, C6)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[step % scale.length];
    this.playTone(freq, 0.22, 'triangle', 0.08);
  }

  public playWrong(): void {
    this.playTone(196.0, 0.14, 'sine', 0.07);
    this.playTone(164.81, 0.16, 'sine', 0.05, 0.05);
  }

  public playHint(): void {
    this.playTone(659.25, 0.18, 'sine', 0.06);
  }

  public playRoundComplete(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.35, 'triangle', 0.07, idx * 0.07);
    });
  }

  public playPsalmComplete(): void {
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.45, 'triangle', 0.08, idx * 0.08);
    });
  }
}

export const soundFX = new SoundEffects();
