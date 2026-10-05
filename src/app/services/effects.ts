import {Injectable, inject, signal} from '@angular/core';
import {AudioEngine} from './audio-engine';

export type SubliminalPhrase = 'IT\'S ME' | 'NO MIRES' | 'ESTOY AQUÍ' | 'DETRÁS DE TI' | 'NO PUEDES SALIR';

@Injectable({
  providedIn: 'root',
})
export class EffectsController {
  private audio = inject(AudioEngine);

  readonly reducedEffects = signal<boolean>(false);
  readonly readingMode = signal<boolean>(false);
  readonly showWarningModal = signal<boolean>(true);

  readonly glitchActive = signal<boolean>(false);
  readonly glitchIntensity = signal<number>(0); // 0 to 5

  readonly subliminalActive = signal<boolean>(false);
  readonly subliminalText = signal<SubliminalPhrase>('IT\'S ME');

  private subliminalTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly phrases: SubliminalPhrase[] = [
    'IT\'S ME',
    'NO MIRES',
    'ESTOY AQUÍ',
    'DETRÁS DE TI',
    'NO PUEDES SALIR',
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedReduced = localStorage.getItem('archivo_olvidado_reduced_fx');
        if (savedReduced !== null) {
          this.reducedEffects.set(savedReduced === 'true');
        } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.reducedEffects.set(true);
        }

        const warningSeen = localStorage.getItem('archivo_olvidado_warning_seen');
        if (warningSeen === 'true') {
          this.showWarningModal.set(false);
        }
      } catch (e: unknown) {
        void e;
      }

      this.scheduleNextSubliminal();
    }
  }

  dismissWarning(reduced: boolean): void {
    this.reducedEffects.set(reduced);
    this.showWarningModal.set(false);
    try {
      localStorage.setItem('archivo_olvidado_reduced_fx', String(reduced));
      localStorage.setItem('archivo_olvidado_warning_seen', 'true');
    } catch (e: unknown) {
      void e;
    }
    this.audio.playClick();
  }

  toggleReducedEffects(): void {
    const next = !this.reducedEffects();
    this.reducedEffects.set(next);
    try {
      localStorage.setItem('archivo_olvidado_reduced_fx', String(next));
    } catch (e: unknown) {
      void e;
    }
    this.audio.playClick();
  }

  toggleReadingMode(): void {
    const next = !this.readingMode();
    this.readingMode.set(next);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--ambient-light', next ? '0.6' : '0.12');
      root.style.setProperty('--flashlight-radius', next ? '450px' : '280px');
    }
    this.audio.playClick();
  }

  triggerGlitch(intensity = 3, durationMs = 380): void {
    if (this.reducedEffects()) return;

    this.glitchIntensity.set(Math.min(5, Math.max(1, intensity)));
    this.glitchActive.set(true);
    this.audio.playStaticGlitch(durationMs / 1000);

    setTimeout(() => {
      this.glitchActive.set(false);
      this.glitchIntensity.set(0);
    }, durationMs);
  }

  triggerDirectSubliminal(customPhrase?: SubliminalPhrase): void {
    if (this.reducedEffects()) return;
    this.subliminalText.set(customPhrase || 'IT\'S ME');
    this.subliminalActive.set(true);
    setTimeout(() => {
      this.subliminalActive.set(false);
    }, 320); // 320ms duration: gentle fade in and out, safe per rules
  }

  private scheduleNextSubliminal(): void {
    if (typeof window === 'undefined') return;
    // Every 45 - 90 seconds
    const delay = Math.floor(45000 + Math.random() * 45000);

    this.subliminalTimer = setTimeout(() => {
      if (!this.reducedEffects() && !this.showWarningModal()) {
        const randomIndex = Math.floor(Math.random() * this.phrases.length);
        this.subliminalText.set(this.phrases[randomIndex]);
        this.subliminalActive.set(true);

        setTimeout(() => {
          this.subliminalActive.set(false);
        }, 300);
      }
      this.scheduleNextSubliminal();
    }, delay);
  }
}
