import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {EffectsController} from '../services/effects';

@Component({
  selector: 'app-film-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!effects.reducedEffects()) {
      <div class="camera-frame fixed inset-0 pointer-events-none z-40" aria-hidden="true">
        <span class="camera-status">● REC <span>ARCHIVE / LIVE</span></span>
        @if (interrupted()) {
          <div class="camera-interruption">
            <div class="camera-tracking"></div>
            <span class="camera-error">SIGNAL HOLD · RECONNECTING</span>
          </div>
        }
      </div>
    }
  `,
})
export class FilmOverlay {
  readonly effects = inject(EffectsController);
  readonly interrupted = signal(false);
  private timer?: ReturnType<typeof setTimeout>;
  private recovery?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      clearTimeout(this.recovery);
    });
    if (typeof window !== 'undefined') this.schedule();
  }

  private schedule(): void {
    this.timer = setTimeout(() => {
      if (!document.hidden && !this.effects.reducedEffects() && !this.effects.readingMode()) {
        this.interrupted.set(true);
        this.recovery = setTimeout(() => this.interrupted.set(false), 650);
      }
      this.schedule();
    }, 120000 + Math.random() * 120000);
  }
}
