import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {EffectsController} from '../services/effects';

@Component({
  selector: 'app-subliminal-flash',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (effects.subliminalActive() && !effects.reducedEffects()) {
      <div
        class="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center bg-black/40 transition-opacity duration-150 ease-in-out select-none"
        aria-hidden="true"
      >
        <span
          class="font-special text-4xl md:text-7xl lg:text-8xl tracking-widest text-[#7a1f1a]/80 drop-shadow-[0_0_12px_#3d0e0c] select-none scale-105"
        >
          {{ effects.subliminalText() }}
        </span>
      </div>
    }
  `,
})
export class SubliminalFlash {
  effects = inject(EffectsController);
}
