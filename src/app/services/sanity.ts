import {Injectable, computed, inject, signal} from '@angular/core';
import {AudioEngine} from './audio-engine';
import {EffectsController} from './effects';

export type SanityState = 'STABLE' | 'UNSETTLED' | 'DISTURBED' | 'PSYCHOTIC' | 'COLLAPSED';

export type HallucinationType =
  | 'PEEKING_HANDS'
  | 'FLEETING_SHADOW'
  | 'GHOST_FACE'
  | 'CORRUPT_KERNEL_PANIC'
  | 'BLOOD_MELT'
  | 'STROBE_FLASH'
  | 'TEXT_CORRUPT';

export interface HallucinationEvent {
  type: HallucinationType;
  durationMs: number;
  edge?: 'left' | 'right' | 'top' | 'bottom';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SanityController {
  private audio = inject(AudioEngine);
  private effects = inject(EffectsController);

  // Core sanity level: 0 to 100
  readonly sanity = signal<number>(100);

  // Computed psychological state
  readonly state = computed<SanityState>(() => {
    const s = this.sanity();
    if (s >= 80) return 'STABLE';
    if (s >= 55) return 'UNSETTLED';
    if (s >= 30) return 'DISTURBED';
    if (s >= 10) return 'PSYCHOTIC';
    return 'COLLAPSED';
  });

  // Active hallucination in DOM
  readonly activeHallucination = signal<HallucinationEvent | null>(null);

  // Corrupted text banner / whispers in UI
  readonly textCorruptionActive = signal<boolean>(false);
  readonly corruptedTextSnippet = signal<string>('');

  // Can stabilize cooldown
  readonly canCalmDown = signal<boolean>(true);

  private hallucinationTimer: ReturnType<typeof setTimeout> | null = null;
  private passiveDrainTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startPassiveDrain();
      this.scheduleNextHallucination();
    }
  }

  /**
   * Drain sanity by an explicit amount with audio cue if significant.
   */
  drainSanity(amount: number, _reason?: string): void {
    void _reason;
    const prev = this.sanity();
    const next = Math.max(0, Math.min(100, prev - amount));
    this.sanity.set(next);

    // If severe drop, trigger small audio jitter or glitch
    if (amount >= 5 && !this.effects.reducedEffects()) {
      if (Math.random() < 0.4) {
        this.audio.playFootstep();
      }
    }

    // High chance of immediate disturbance if entering critical sanity
    if (prev >= 30 && next < 30) {
      this.triggerRandomHallucination(true);
    }
  }

  /**
   * Restore sanity (e.g. calming down, reading mode, finding lore).
   */
  restoreSanity(amount: number): void {
    this.sanity.update(s => Math.min(100, s + amount));
  }

  /**
   * Stabilize / Calm down action initiated by the user via the Sanity HUD.
   */
  calmMind(): void {
    if (!this.canCalmDown()) return;
    this.canCalmDown.set(false);
    this.restoreSanity(20);
    this.audio.playWhisperMurmur();

    // 12-second cooldown on calm down
    setTimeout(() => {
      this.canCalmDown.set(true);
    }, 12000);
  }

  /**
   * Passive sanity drain:
   * Staying in pitch darkness slowly erodes psychological resilience.
   * Reading mode slightly regenerates it.
   */
  private startPassiveDrain(): void {
    this.passiveDrainTimer = setInterval(() => {
      if (this.effects.readingMode()) {
        // Safe light restores slight composure
        this.restoreSanity(0.4);
      } else {
        // Darkness consumes sanity slowly
        const drain = this.sanity() > 50 ? 0.35 : 0.6;
        this.drainSanity(drain);
      }
    }, 4000);
  }

  /**
   * Dynamic scheduler: lower sanity -> exponentially shorter delay between hallucinations.
   */
  private scheduleNextHallucination(): void {
    if (typeof window === 'undefined') return;

    const s = this.sanity();
    // Sanity 100 -> ~30-45s delay; Sanity 15 -> ~5-9s delay
    const baseDelay = 5000 + (s / 100) * 32000;
    const jitter = Math.random() * 4000;
    const finalDelay = Math.max(3500, baseDelay + jitter);

    this.hallucinationTimer = setTimeout(() => {
      if (!this.effects.reducedEffects() && !this.effects.showWarningModal()) {
        this.triggerRandomHallucination(false);
      }
      this.scheduleNextHallucination();
    }, finalDelay);
  }

  /**
   * Triggers an organic hallucination based on the current sanity level.
   */
  triggerRandomHallucination(forceAggressive = false): void {
    if (this.effects.reducedEffects() || this.activeHallucination()) return;

    const s = this.sanity();
    const isCritical = s < 35 || forceAggressive;
    const isMedium = s < 65;

    const possibleTypes: HallucinationType[] = [];

    // Fleeting shadows and peeking hands happen at medium sanity
    if (isMedium) {
      possibleTypes.push('FLEETING_SHADOW');
      possibleTypes.push('PEEKING_HANDS');
      possibleTypes.push('TEXT_CORRUPT');
    }

    // High horror events happen at low sanity (<35%)
    if (isCritical) {
      possibleTypes.push('GHOST_FACE');
      possibleTypes.push('CORRUPT_KERNEL_PANIC');
      possibleTypes.push('BLOOD_MELT');
      possibleTypes.push('STROBE_FLASH');
    }

    if (possibleTypes.length === 0) {
      // Very high sanity: only subtle text corruption
      if (Math.random() < 0.25) {
        this.triggerTextCorruption();
      }
      return;
    }

    const chosen = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
    const edges: ('left' | 'right' | 'top' | 'bottom')[] = ['left', 'right', 'top', 'bottom'];
    const edge = edges[Math.floor(Math.random() * edges.length)];

    let durationMs = 1800;
    if (chosen === 'STROBE_FLASH') durationMs = 450;
    if (chosen === 'FLEETING_SHADOW') durationMs = 1200;
    if (chosen === 'GHOST_FACE') durationMs = 1500;
    if (chosen === 'CORRUPT_KERNEL_PANIC') durationMs = 2800;
    if (chosen === 'BLOOD_MELT') durationMs = 3200;
    if (chosen === 'PEEKING_HANDS') durationMs = 2400;

    // Trigger audio cues according to hallucination
    if (chosen === 'CORRUPT_KERNEL_PANIC' || chosen === 'STROBE_FLASH') {
      this.audio.playStaticGlitch(0.4);
      this.effects.triggerGlitch(4, 400);
    } else if (chosen === 'GHOST_FACE') {
      this.audio.playWhisperMurmur();
      this.effects.triggerDirectSubliminal('NO MIRES');
    } else if (chosen === 'PEEKING_HANDS' || chosen === 'FLEETING_SHADOW') {
      this.audio.playFootstep();
    }

    this.activeHallucination.set({
      type: chosen,
      durationMs,
      edge,
    });

    setTimeout(() => {
      this.activeHallucination.set(null);
    }, durationMs);
  }

  private triggerTextCorruption(): void {
    const corruptions = [
      'TE ESTÁN OBSERVANDO',
      'NO MIRES HACIA ATRÁS',
      'ALGUIEN ESTÁ EN LA HABITACIÓN',
      'ESTE ARCHIVO NO DEBERÍA EXISTIR',
      'LA PUERTA ESTÁ ABIERTA',
    ];
    const phrase = corruptions[Math.floor(Math.random() * corruptions.length)];
    this.corruptedTextSnippet.set(phrase);
    this.textCorruptionActive.set(true);

    setTimeout(() => {
      this.textCorruptionActive.set(false);
    }, 2200);
  }
}
