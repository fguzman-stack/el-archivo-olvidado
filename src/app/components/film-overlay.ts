import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {EffectsController} from '../services/effects';

@Component({
  selector: 'app-film-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!effects.reducedEffects()) {
      <div
        class="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none"
        aria-hidden="true"
      >
        <!-- Heavy dark vignette with burnt edges -->
        <div
          class="absolute inset-0"
          style="background: radial-gradient(ellipse at center, transparent 40%, rgba(10, 9, 8, 0.4) 70%, rgba(5, 4, 3, 0.92) 100%), linear-gradient(to bottom, rgba(122, 31, 26, 0.04), rgba(59, 74, 58, 0.05));"
        ></div>

        <!-- Animated grain / noise overlay using SVG turbulence -->
        <svg class="absolute inset-0 w-full h-full opacity-[0.14] mix-blend-overlay animate-film-flicker">
          <filter id="filmGrainFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#filmGrainFilter)" />
        </svg>

        <!-- Vertical film scratch lines with subtle shifting -->
        <div class="absolute inset-0 opacity-[0.22] mix-blend-screen overflow-hidden">
          <div
            class="absolute top-0 bottom-0 w-[1px] bg-amber-100/40"
            [style.left]="scratchLeft1() + '%'"
          ></div>
          <div
            class="absolute top-0 bottom-0 w-[1.5px] bg-white/30"
            [style.left]="scratchLeft2() + '%'"
          ></div>
          <div
            class="absolute top-0 bottom-0 w-[1px] bg-red-200/25"
            [style.left]="scratchLeft3() + '%'"
          ></div>
        </div>

        <!-- Occasional Cigarette Burn / Changeover Cue (top right corner) -->
        @if (showCue()) {
          <div
            class="absolute top-6 right-16 w-8 h-8 rounded-full border-2 border-black/80 bg-black/70 flex items-center justify-center opacity-85 shadow-[0_0_8px_rgba(0,0,0,0.9)] animate-pulse"
          >
            <div class="w-3.5 h-3.5 rounded-full bg-[#d9a441]/80"></div>
          </div>
        }

        <!-- Frame jump effect (subtle vertical hitch every 35-50s) -->
        @if (isFrameJumping()) {
          <div class="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]"></div>
        }
      </div>
    }
  `,
})
export class FilmOverlay {
  effects = inject(EffectsController);

  scratchLeft1 = signal<number>(23);
  scratchLeft2 = signal<number>(68);
  scratchLeft3 = signal<number>(44);
  showCue = signal<boolean>(false);
  isFrameJumping = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      // Scratches drift periodically
      setInterval(() => {
        if (!this.effects.reducedEffects()) {
          this.scratchLeft1.set(Math.floor(10 + Math.random() * 80));
          this.scratchLeft2.set(Math.floor(15 + Math.random() * 70));
          this.scratchLeft3.set(Math.floor(5 + Math.random() * 90));
        }
      }, 4200);

      // Cigarette burn trigger occasionally
      setInterval(() => {
        if (!this.effects.reducedEffects()) {
          this.showCue.set(true);
          setTimeout(() => this.showCue.set(false), 280);
        }
      }, 34000);

      // Occasional frame skip / jump
      setInterval(() => {
        if (!this.effects.reducedEffects()) {
          this.isFrameJumping.set(true);
          setTimeout(() => this.isFrameJumping.set(false), 90);
        }
      }, 45000);
    }
  }
}
