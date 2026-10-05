import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioEngine {
  private ctx: AudioContext | null = null;

  // Master ambient music nodes
  private isMusicRunning = false;
  private musicIntervalId: number | null = null;
  private chordTimerId: number | null = null;
  private windNoiseNode: AudioNode | null = null;
  private windGainNode: GainNode | null = null;

  // Drone nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneSubOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // Chord synth nodes (3 voices for dark harmony)
  private chordOscs: OscillatorNode[] = [];
  private chordGains: GainNode[] = [];
  private chordFilter: BiquadFilterNode | null = null;
  private chordMasterGain: GainNode | null = null;
  private currentChordIndex = 0;

  // Master state signals
  readonly isEnabled = signal<boolean>(true);
  readonly isMusicPlaying = signal<boolean>(false);
  readonly masterVolume = signal<number>(0.4);
  readonly musicLevel = signal<number>(0.65);
  readonly audioVisualizerActivity = signal<number>(0);

  // Eerie horror chord progressions (frequencies in Hz: Root, Fifth, Minor Third / Tritone)
  private readonly horrorChords = [
    [73.42, 110.0, 174.61], // D minor (D2, A2, F3)
    [58.27, 87.31, 146.83], // Bb major inversion (Bb1, F2, D3)
    [82.41, 123.47, 185.0], // Eb minor / Neapolitan (Eb2, Bb2, Gb3)
    [51.91, 73.42, 123.47], // G# dim / Tritone suspense (G#1, D2, B2)
    [65.41, 98.0, 155.56], // C minor (C2, G2, Eb3)
  ];

  // Music box / Celesta notes (High eerie pentatonic / chromatic pitches)
  private readonly musicBoxNotes = [
    587.33, // D5
    622.25, // Eb5
    698.46, // F5
    783.99, // G5
    830.61, // Ab5
    880.0, // A5
    932.33, // Bb5
    1046.5, // C6
    1174.66, // D6
    1244.51, // Eb6
  ];

  /**
   * Safe AudioContext initialization ensuring resume on user interaction
   */
  initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err: unknown) => {
        void err;
      });
    }
    return this.ctx;
  }

  /**
   * Enable/disable audio master
   */
  enableSound(enable = true): void {
    this.isEnabled.set(enable);
    if (enable) {
      const ctx = this.initContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.startAmbientMusic();
        }).catch((err: unknown) => {
          void err;
        });
      } else {
        this.startAmbientMusic();
      }
    } else {
      this.stopAmbientMusic();
    }
  }

  toggleSound(): boolean {
    const newState = !this.isEnabled();
    this.enableSound(newState);
    if (newState) {
      this.playClick();
    }
    return newState;
  }

  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterVolume.set(clamped);
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.12 * clamped, this.ctx.currentTime, 0.2);
    }
    if (this.chordMasterGain && this.ctx) {
      this.chordMasterGain.gain.setTargetAtTime(0.18 * clamped * this.musicLevel(), this.ctx.currentTime, 0.2);
    }
  }

  /**
   * START THE PROCEDURAL DARK HORROR AMBIENT MUSIC
   * Multi-layered: Sub-bass drone + evolving dark minor choir pad + music box bells + spectral wind
   */
  startAmbientMusic(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    if (this.isMusicRunning) return;
    this.isMusicRunning = true;
    this.isMusicPlaying.set(true);

    try {
      const now = ctx.currentTime;

      // ── 1. DEEP SUB-BASS DRONE WITH SLOW HARMONIC DETUNING ──
      this.droneOsc1 = ctx.createOscillator();
      this.droneOsc2 = ctx.createOscillator();
      this.droneSubOsc = ctx.createOscillator();
      this.droneFilter = ctx.createBiquadFilter();
      this.droneGain = ctx.createGain();

      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(55, now); // A1 base

      this.droneOsc2.type = 'sawtooth';
      this.droneOsc2.frequency.setValueAtTime(55.6, now); // Slight detune for thick chorus

      this.droneSubOsc.type = 'sine';
      this.droneSubOsc.frequency.setValueAtTime(27.5, now); // A0 Sub-bass rumble

      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(160, now);
      this.droneFilter.Q.setValueAtTime(3.5, now);

      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.1 * this.masterVolume(), now + 3.0);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneSubOsc.connect(this.droneGain);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(ctx.destination);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.droneSubOsc.start(now);

      // ── 2. HAUNTING CHORD VOICES (EVOLVING MINOR / DIMINISHED PAD) ──
      this.chordFilter = ctx.createBiquadFilter();
      this.chordFilter.type = 'bandpass';
      this.chordFilter.frequency.setValueAtTime(320, now);
      this.chordFilter.Q.setValueAtTime(1.8, now);

      this.chordMasterGain = ctx.createGain();
      this.chordMasterGain.gain.setValueAtTime(0.001, now);
      this.chordMasterGain.gain.exponentialRampToValueAtTime(0.16 * this.masterVolume() * this.musicLevel(), now + 4.0);

      this.chordFilter.connect(this.chordMasterGain);
      this.chordMasterGain.connect(ctx.destination);

      this.chordOscs = [];
      this.chordGains = [];
      const initialChord = this.horrorChords[0];

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(initialChord[i], now);
        g.gain.setValueAtTime(0.33, now);
        osc.connect(g);
        g.connect(this.chordFilter);
        osc.start(now);
        this.chordOscs.push(osc);
        this.chordGains.push(g);
      }

      // Chord progression transition timer (shifts harmony every 9 seconds smoothly)
      this.currentChordIndex = 0;
      this.chordTimerId = window.setInterval(() => {
        if (!this.isMusicRunning || !this.ctx) return;
        this.transitionChord();
      }, 9000);

      // ── 3. SPECTRAL WIND NOISE WITH LFO FILTER SWEEP ──
      const bufferSize = ctx.sampleRate * 4.0;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Pink noise
        lastOut = output[i];
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(260, now);
      windFilter.Q.setValueAtTime(4.0, now);

      this.windGainNode = ctx.createGain();
      this.windGainNode.gain.setValueAtTime(0.001, now);
      this.windGainNode.gain.exponentialRampToValueAtTime(0.07 * this.masterVolume(), now + 3.0);

      noiseSource.connect(windFilter);
      windFilter.connect(this.windGainNode);
      this.windGainNode.connect(ctx.destination);

      noiseSource.start(now);
      this.windNoiseNode = noiseSource;

      // ── 4. CREEPY MUSIC BOX / CELESTA NOTES SPORADICALLY ECHOING ──
      this.musicIntervalId = window.setInterval(() => {
        if (!this.isMusicRunning) return;
        if (Math.random() > 0.35) {
          this.playMusicBoxNote();
        }
      }, 3200);

      // Trigger first note after 2 seconds
      setTimeout(() => {
        if (this.isMusicRunning) this.playMusicBoxNote();
      }, 2000);

    } catch (err: unknown) {
      void err;
    }
  }

  /**
   * Smoothly crossfade chord voices to next horror chord
   */
  private transitionChord(): void {
    if (!this.ctx || this.chordOscs.length < 3) return;
    try {
      this.currentChordIndex = (this.currentChordIndex + 1) % this.horrorChords.length;
      const nextChord = this.horrorChords[this.currentChordIndex];
      const now = this.ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        // Slow glide over 4 seconds into the new frequency
        this.chordOscs[i].frequency.exponentialRampToValueAtTime(nextChord[i], now + 4.2);
      }

      // Slightly modulate filter cutoff to create breathing motion
      if (this.chordFilter) {
        const nextCutoff = 260 + Math.random() * 200;
        this.chordFilter.frequency.exponentialRampToValueAtTime(nextCutoff, now + 5.0);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Play an isolated, echoing music-box / dark chime note in space
   */
  playMusicBoxNote(freq?: number): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const targetFreq =
        freq ??
        this.musicBoxNotes[Math.floor(Math.random() * this.musicBoxNotes.length)];

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Dual tone with high pure sine & gentle harmonic
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(targetFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(targetFreq * 2.003, now); // Slight detuned octave overtone

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(targetFreq * 2.8, now);

      const noteDuration = 2.6;
      const vol = (0.09 + Math.random() * 0.05) * this.masterVolume() * this.musicLevel();

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);

      // Stereo panning if supported
      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.random() * 1.6 - 0.8, now);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        gain.connect(ctx.destination);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + noteDuration);
      osc2.stop(now + noteDuration);

      // Visual activity indicator
      this.audioVisualizerActivity.set(Math.random() * 0.5 + 0.5);
      setTimeout(() => this.audioVisualizerActivity.set(0), 400);
    } catch {
      // ignore
    }
  }

  /**
   * Stop all ambient music safely
   */
  stopAmbientMusic(): void {
    this.isMusicRunning = false;
    this.isMusicPlaying.set(false);

    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.chordTimerId !== null) {
      clearInterval(this.chordTimerId);
      this.chordTimerId = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      try {
        if (this.droneGain) {
          this.droneGain.gain.setTargetAtTime(0.0001, now, 0.4);
        }
        if (this.chordMasterGain) {
          this.chordMasterGain.gain.setTargetAtTime(0.0001, now, 0.4);
        }
        if (this.windGainNode) {
          this.windGainNode.gain.setTargetAtTime(0.0001, now, 0.4);
        }
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      try {
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.droneSubOsc?.stop();
        this.droneOsc1?.disconnect();
        this.droneOsc2?.disconnect();
        this.droneSubOsc?.disconnect();
        this.droneFilter?.disconnect();
        this.droneGain?.disconnect();

        for (const osc of this.chordOscs) {
          osc.stop();
          osc.disconnect();
        }
        this.chordOscs = [];
        this.chordGains = [];
        this.chordFilter?.disconnect();
        this.chordMasterGain?.disconnect();

        (this.windNoiseNode as AudioBufferSourceNode)?.stop?.();
        this.windNoiseNode?.disconnect();
        this.windGainNode?.disconnect();
      } catch {
        // ignore
      }
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.droneSubOsc = null;
      this.droneFilter = null;
      this.droneGain = null;
      this.chordFilter = null;
      this.chordMasterGain = null;
      this.windNoiseNode = null;
      this.windGainNode = null;
    }, 600);
  }

  // Legacy drone wrapper for backwards compatibility
  startDrone(freq = 55): void {
    if (!this.isMusicRunning) {
      this.startAmbientMusic();
    }
    if (this.droneOsc1 && this.ctx) {
      try {
        this.droneOsc1.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.8);
      } catch {
        // ignore
      }
    }
  }

  stopDrone(): void {
    this.stopAmbientMusic();
  }

  updateDroneFrequency(freq: number): void {
    if (this.droneOsc1 && this.ctx) {
      try {
        this.droneOsc1.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.8);
        if (this.droneOsc2) {
          this.droneOsc2.frequency.setTargetAtTime(freq + 0.6, this.ctx.currentTime, 0.8);
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Sound effect when opening a heavy forensic dossier folder
   */
  playFolderOpen(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(110, now);
      thudOsc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
      thudGain.gain.setValueAtTime(0.28 * this.masterVolume(), now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.18);

      this.playPaperTurn(0.08);
      this.playChillingStinger();
    } catch {
      // ignore
    }
  }

  /**
   * Sound effect of flipping or turning aged paper sheets
   */
  playPaperTurn(delaySec = 0): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime + delaySec;
      const bufferSize = Math.floor(ctx.sampleRate * 0.14);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.8;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.14);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2 * this.masterVolume(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  /**
   * Chilling spine-tingling spectral chord / horror stinger
   */
  playChillingStinger(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const duration = 2.8;

      // Unsettling dissonant cluster (Tritone + minor second: 220Hz, 311Hz, 329Hz, 440Hz)
      const freqs = [220, 311.13, 329.63, 440];
      for (const freq of freqs) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * (1 + (Math.random() * 0.04 - 0.02)), now + duration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.07 * this.masterVolume(), now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        if (pan) {
          pan.pan.setValueAtTime(Math.random() * 1.6 - 0.8, now);
          osc.connect(gain);
          gain.connect(pan);
          pan.connect(ctx.destination);
        } else {
          osc.connect(gain);
          gain.connect(ctx.destination);
        }

        osc.start(now);
        osc.stop(now + duration);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Creepy demonic whisper sound when hovering a dangerous creepypasta
   */
  playCharacterProximityWhisper(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const duration = 0.8;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + duration);
      filter.Q.setValueAtTime(5.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.masterVolume(), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  playHeartbeat(rate = 1.0): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    this.createThud(t, 60, 0.22);
    this.createThud(t + 0.22 / rate, 52, 0.16);
  }

  private createThud(time: number, freq: number, duration: number): void {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(24, time + duration);

      gain.gain.setValueAtTime(0.18 * this.masterVolume(), time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // ignore
    }
  }

  playClick(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12 * this.masterVolume(), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  playTypewriterKey(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.03);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 300, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14 * this.masterVolume(), ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // ignore
    }
  }

  playStaticGlitch(duration = 0.15): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08 * this.masterVolume(), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // ignore
    }
  }

  playElevatorBell(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, ctx.currentTime);

      gain.gain.setValueAtTime(0.15 * this.masterVolume(), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // ignore
    }
  }

  playWhisperMurmur(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const duration = 2.4;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.4;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(780, ctx.currentTime + 1.2);
      filter.frequency.linearRampToValueAtTime(380, ctx.currentTime + 2.4);
      filter.Q.setValueAtTime(8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.masterVolume(), ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // ignore
    }
  }

  playFootstep(): void {
    if (!this.isEnabled()) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08 * this.masterVolume(), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }
}
