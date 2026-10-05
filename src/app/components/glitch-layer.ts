import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {EffectsController} from '../services/effects';

@Component({
  selector: 'app-glitch-layer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (effects.glitchActive() && !effects.reducedEffects()) {
      <div
        class="fixed inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-70"
        aria-hidden="true"
      >
        <!-- RGB Split horizontal bands -->
        <div class="absolute inset-0 flex flex-col justify-between">
          <div class="h-14 w-full bg-cyan-600/30 -translate-x-3 mix-blend-color-dodge"></div>
          <div class="h-20 w-full bg-red-600/35 translate-x-4 mix-blend-color-dodge"></div>
          <div class="h-10 w-full bg-emerald-600/25 -translate-x-2 mix-blend-color-dodge"></div>
        </div>

        <!-- VHS Tracking bar moving downwards -->
        <div
          class="absolute left-0 right-0 h-16 bg-white/20 blur-[2px] animate-vhs-scan"
        ></div>

        <!-- Heavy scanline distortion line -->
        <div
          class="absolute inset-x-0 h-[2px] bg-red-400/80 top-1/3 shadow-[0_0_8px_rgba(255,0,0,0.8)]"
        ></div>
      </div>
    }
  `,
})
export class GlitchLayer {
  effects = inject(EffectsController);
}
