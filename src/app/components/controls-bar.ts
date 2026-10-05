import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {EffectsController} from '../services/effects';
import {AudioEngine} from '../services/audio-engine';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-controls-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <aside
      class="fixed bottom-14 left-2 sm:bottom-3 sm:left-3 md:bottom-5 md:left-5 z-40 flex items-center gap-1 sm:gap-2 bg-[#0a0908]/95 backdrop-blur-md border border-[#7a1f1a]/50 p-1 sm:p-1.5 md:p-2 rounded-xs shadow-[0_4px_20px_rgba(0,0,0,0.9)] max-w-[calc(100vw-65px)] overflow-x-auto scrollbar-none"
      aria-label="Controles de accesibilidad, atmósfera y música de terror"
    >
      <!-- Vintage Rotary Knob for Reduced / Full Effects -->
      <button
        type="button"
        (click)="effects.toggleReducedEffects()"
        [attr.aria-pressed]="effects.reducedEffects()"
        [attr.title]="effects.reducedEffects() ? 'Modo actual: Efectos Reducidos (Clic para Activar Efectos)' : 'Modo actual: Efectos Completos (Clic para Reducir)'"
        class="flex items-center gap-1 px-1.5 py-1 hover:bg-[#1a1412] text-[#cfc7b5] transition-colors rounded text-[11px] font-special cursor-pointer shrink-0"
      >
        <!-- Vintage Dial / Knob SVG graphic -->
        <svg viewBox="0 0 28 28" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-300" [style.transform]="effects.reducedEffects() ? 'rotate(90deg)' : 'rotate(0deg)'">
          <circle cx="14" cy="14" r="12" fill="#1f1815" stroke="#7a1f1a" stroke-width="1.5" />
          <circle cx="14" cy="14" r="8" fill="#2d221d" />
          <line x1="14" y1="6" x2="14" y2="12" stroke="#d9a441" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="hidden sm:inline">
          {{ effects.reducedEffects() ? 'FX: Reducido' : 'FX: Intenso' }}
        </span>
      </button>

      <!-- Reading Mode Toggle -->
      <button
        type="button"
        (click)="effects.toggleReadingMode()"
        [attr.aria-pressed]="effects.readingMode()"
        [attr.title]="effects.readingMode() ? 'Desactivar Modo Lectura (Volver a Penumbra)' : 'Activar Modo Lectura (Mayor Claridad)'"
        class="flex items-center gap-1 px-1.5 py-1 hover:bg-[#1a1412] text-[#cfc7b5] transition-colors rounded text-[11px] font-special cursor-pointer shrink-0"
        [class.text-[#d9a441]]="effects.readingMode()"
      >
        <mat-icon class="text-xs sm:text-base w-3.5 h-3.5 sm:w-4 sm:h-4 text-center">
          {{ effects.readingMode() ? 'light_mode' : 'nightlight' }}
        </mat-icon>
        <span class="hidden sm:inline">
          {{ effects.readingMode() ? 'Lectura: ON' : 'Lectura' }}
        </span>
      </button>

      <!-- Ambient Horror Music Master Toggle -->
      <button
        type="button"
        (click)="audio.toggleSound()"
        [attr.aria-pressed]="audio.isEnabled()"
        [attr.title]="audio.isEnabled() ? 'Pausar Música y Efectos de Ambiente' : 'Iniciar Banda Sonora y Música de Terror'"
        class="flex items-center gap-1.5 px-2 py-1 bg-[#15100e] hover:bg-[#201815] text-[#cfc7b5] transition-all rounded text-[11px] font-special cursor-pointer border border-[#7a1f1a]/40 shrink-0"
        [class.border-[#a01a14]]="audio.isEnabled()"
        [class.shadow-[0_0_10px_rgba(160,26,20,0.5)]]="audio.isEnabled()"
      >
        <mat-icon class="text-xs sm:text-base w-3.5 h-3.5 sm:w-4 sm:h-4 text-center" [class.text-[#a01a14]]="audio.isEnabled()">
          {{ audio.isEnabled() ? 'music_note' : 'music_off' }}
        </mat-icon>
        
        <div class="flex items-center gap-1">
          <span class="font-bold tracking-wider text-[10px] sm:text-xs" [class.text-[#a01a14]]="audio.isEnabled()">
            {{ audio.isEnabled() ? 'MÚSICA' : 'AUDIO: OFF' }}
          </span>

          <!-- Animated Equalizer Bars when music is active -->
          @if (audio.isEnabled()) {
            <div class="flex items-end gap-0.5 h-2.5 ml-0.5" aria-hidden="true">
              <span class="w-0.5 sm:w-1 bg-[#a01a14] rounded-xs animate-[pulse_0.8s_ease-in-out_infinite] h-2"></span>
              <span class="w-0.5 sm:w-1 bg-[#d9a441] rounded-xs animate-[pulse_1.2s_ease-in-out_infinite] h-2.5"></span>
              <span class="w-0.5 sm:w-1 bg-[#a01a14] rounded-xs animate-[pulse_0.6s_ease-in-out_infinite] h-1.5"></span>
            </div>
          }
        </div>
      </button>

      <!-- Volume quick step button -->
      @if (audio.isEnabled()) {
        <button
          type="button"
          (click)="cycleVolume()"
          title="Ajustar volumen"
          class="px-1.5 py-1 hover:bg-[#1a1412] text-[#cfc7b5]/80 hover:text-white transition-colors rounded text-[10px] font-special cursor-pointer border border-white/5 shrink-0"
        >
          {{ (audio.masterVolume() * 100).toFixed(0) }}%
        </button>
      }
    </aside>
  `,
})
export class ControlsBar {
  effects = inject(EffectsController);
  audio = inject(AudioEngine);

  cycleVolume(): void {
    const current = this.audio.masterVolume();
    let next = 0.4;
    if (current <= 0.25) next = 0.5;
    else if (current <= 0.55) next = 0.8;
    else next = 0.25;
    this.audio.setVolume(next);
  }
}
