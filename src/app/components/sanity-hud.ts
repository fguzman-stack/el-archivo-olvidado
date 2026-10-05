import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {SanityController} from '../services/sanity';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-sanity-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <aside
      class="fixed top-2 left-2 sm:top-3 sm:left-3 md:top-5 md:left-5 z-40 bg-[#0a0908]/95 backdrop-blur-md border border-[#7a1f1a]/50 p-1.5 sm:p-2 md:p-3 rounded-xs shadow-[0_4px_20px_rgba(0,0,0,0.95)] transition-all duration-300 max-w-[calc(100vw-70px)] sm:max-w-none"
      [class.border-red-600]="sanity.sanity() < 30"
      [class.animate-pulse]="sanity.sanity() < 15"
      role="region"
      aria-label="Medidor Biométrico de Cordura"
    >
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Occult Heartbeat Pulse Icon -->
        <div class="relative flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" class="w-5 h-5 sm:w-6 sm:h-6 text-[#7a1f1a]" [class.animate-ping]="sanity.sanity() < 30">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
          <span class="absolute text-[7px] sm:text-[8px] font-mono font-bold text-white">
            {{ Math.round(sanity.sanity()) }}%
          </span>
        </div>

        <!-- Sanity Bar & Status Name -->
        <div class="flex flex-col">
          <div class="flex items-center justify-between gap-1.5 sm:gap-3 text-[9px] sm:text-[10px] md:text-xs font-special tracking-wider">
            <span class="text-[#cfc7b5]/70 hidden xs:inline sm:inline">CORDURA:</span>
            <span
              class="font-bold uppercase text-[9px] sm:text-[11px]"
              [class.text-emerald-400]="sanity.state() === 'STABLE'"
              [class.text-[#d9a441]]="sanity.state() === 'UNSETTLED'"
              [class.text-[#a01a14]]="sanity.state() === 'DISTURBED'"
              [class.text-red-500]="sanity.state() === 'PSYCHOTIC' || sanity.state() === 'COLLAPSED'"
            >
              @switch (sanity.state()) {
                @case ('STABLE') { LÚCIDO }
                @case ('UNSETTLED') { INQUIETO }
                @case ('DISTURBED') { PERTURBADO }
                @case ('PSYCHOTIC') { DELIRIO }
                @case ('COLLAPSED') { COLAPSO }
              }
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-20 xs:w-24 sm:w-32 md:w-40 h-1.5 sm:h-2 bg-[#1c1815] border border-[#3d2f28] rounded-xs overflow-hidden mt-0.5 sm:mt-1">
            <div
              class="h-full transition-all duration-300"
              [class.bg-emerald-600]="sanity.sanity() >= 60"
              [class.bg-[#d9a441]]="sanity.sanity() < 60 && sanity.sanity() >= 30"
              [class.bg-[#a01a14]]="sanity.sanity() < 30"
              [style.width]="sanity.sanity() + '%'"
            ></div>
          </div>
        </div>

        <!-- Stabilize / Calm down action -->
        @if (sanity.sanity() < 80) {
          <button
            type="button"
            (click)="sanity.calmMind()"
            [disabled]="!sanity.canCalmDown()"
            [attr.title]="sanity.canCalmDown() ? 'Tomar aliento para calmar la mente (+20% cordura)' : 'Esperando estabilización...'"
            class="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-special uppercase tracking-wider rounded-xs border border-[#7a1f1a]/60 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none shrink-0"
            [class.bg-[#7a1f1a]]="sanity.canCalmDown()"
            [class.text-white]="sanity.canCalmDown()"
            [class.opacity-40]="!sanity.canCalmDown()"
            [class.cursor-not-allowed]="!sanity.canCalmDown()"
          >
            <mat-icon class="text-[11px] sm:text-[12px] w-3 h-3">self_improvement</mat-icon>
            <span class="hidden sm:inline">Calmarse</span>
          </button>
        }
      </div>
    </aside>
  `,
})
export class SanityHud {
  sanity = inject(SanityController);
  readonly Math = Math;
}
