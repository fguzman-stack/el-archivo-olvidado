import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {EffectsController} from '../services/effects';
import {AudioEngine} from '../services/audio-engine';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-warning-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (effects.showWarningModal()) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="warning-title"
      >
        <div
          class="max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 md:p-8 aged-paper rounded-xs border-2 border-[#7a1f1a]/80 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative"
        >
          <!-- Corner blood stain & burnt corner -->
          <div
            class="absolute -top-12 -right-12 w-28 h-28 bg-[#7a1f1a]/30 rounded-full blur-xl pointer-events-none"
          ></div>
          <div
            class="absolute top-0 right-0 border-t-16 border-r-16 border-t-[#0a0908] border-r-transparent"
          ></div>

          <!-- Header with icon -->
          <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 text-[#7a1f1a]">
            <mat-icon class="text-2xl sm:text-3xl">warning</mat-icon>
            <h2 id="warning-title" class="font-fell-sc text-xl sm:text-2xl md:text-3xl font-bold tracking-wider leading-tight">
              EL ARCHIVO OLVIDADO
            </h2>
          </div>

          <!-- Classified stamp in Special Elite -->
          <div class="inline-block border-2 border-[#7a1f1a] text-[#7a1f1a] font-special px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs uppercase tracking-widest -rotate-2 mb-3 sm:mb-4">
            CONFIDENCIAL · ACCESO RESTRINGIDO
          </div>

          <!-- Narrative warning body -->
          <p class="font-fell text-sm sm:text-base md:text-lg leading-relaxed text-[#1a1614] mb-2 sm:mb-3">
            Contenido de ficción con efectos de parpadeo, distorsiones sonoras, música atmosférica opresiva y glitch visual.
            Los expedientes y rituales aquí compilados están diseñados para generar tensión psicológica y pueden inquietar a personas sensibles.
          </p>
          <p class="font-special text-[11px] sm:text-xs text-[#4a3f35] mb-4 sm:mb-6">
            AVISO: Todo el contenido es una obra de ficción e investigación folclórica. Ningún ritual debe tomarse como instrucción real.
          </p>

          <!-- Buttons -->
          <div class="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <button
              type="button"
              (click)="enterWithEffects(false)"
              class="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-[#7a1f1a] hover:bg-[#a01a14] active:bg-[#5a1410] text-[#cfc7b5] font-fell-sc text-sm sm:text-base font-semibold tracking-wider transition-colors duration-200 shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <mat-icon class="text-sm sm:text-base">visibility</mat-icon>
              <span>Entrar con efectos y música</span>
            </button>
            <button
              type="button"
              (click)="enterWithEffects(true)"
              class="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-[#2b241e] hover:bg-[#3d332b] text-[#cfc7b5] font-fell-sc text-sm sm:text-base tracking-wider transition-colors duration-200 border border-[#4a3f35] flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1f1a]"
            >
              <mat-icon class="text-sm sm:text-base">visibility_off</mat-icon>
              <span>Efectos reducidos</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class WarningDialog {
  effects = inject(EffectsController);
  audio = inject(AudioEngine);

  enterWithEffects(reduced: boolean): void {
    this.effects.dismissWarning(reduced);
    this.audio.enableSound(true);
    this.audio.playFolderOpen();
  }
}
