import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
import {EffectsController} from '../services/effects';
import {AudioEngine} from '../services/audio-engine';

export type SectionId = 'informacion' | 'rituales' | 'juego';

interface NavDot {
  id: SectionId;
  label: string;
  ariaLabel: string;
}

@Component({
  selector: 'app-side-dots-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="fixed right-1.5 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3.5 sm:gap-6 md:gap-8"
      aria-label="Navegación del Archivo"
    >
      @for (dot of navDots; track dot.id) {
        <div class="relative flex items-center group">
          <!-- Text label in Special Elite on hover/focus -->
          <span
            class="absolute right-10 sm:right-12 md:right-14 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 font-special text-[10px] sm:text-xs md:text-sm tracking-wider uppercase whitespace-nowrap px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#0a0908]/95 border border-[#7a1f1a]/60 text-[#cfc7b5] shadow-lg rounded-sm"
          >
            {{ dot.label }}
          </span>

          <!-- Macabre Blood Drop / Ember Button -->
          <button
            type="button"
            (click)="selectSection(dot.id)"
            [attr.aria-label]="dot.ariaLabel"
            [attr.aria-current]="activeSection() === dot.id ? 'true' : null"
            class="relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-transform duration-300 focus:outline-none rounded-full p-1 sm:p-2"
          >
            <!-- Blood drop SVG with visceral organic contours -->
            <svg
              viewBox="0 0 32 38"
              class="w-4 h-5 sm:w-5 sm:h-6 md:w-6 md:h-7 transition-all duration-300 overflow-visible"
              [class.scale-125]="activeSection() === dot.id"
              [class.animate-blood-pulse]="activeSection() === dot.id && !effects.reducedEffects()"
            >
              <defs>
                <radialGradient [id]="'emberGlow-' + dot.id" cx="50%" cy="60%" r="50%">
                  <stop offset="0%" stop-color="#ff3322" stop-opacity="0.9" />
                  <stop offset="40%" stop-color="#a01a14" stop-opacity="0.8" />
                  <stop offset="85%" stop-color="#4a0e0a" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#1a0402" stop-opacity="1" />
                </radialGradient>
                <filter [id]="'dropShadow-' + dot.id" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#a01a14" flood-opacity="0.7" />
                </filter>
              </defs>

              <!-- Aura Halo behind active dot -->
              @if (activeSection() === dot.id) {
                <circle
                  cx="16"
                  cy="24"
                  r="13"
                  fill="none"
                  stroke="#a01a14"
                  stroke-width="1.5"
                  opacity="0.6"
                  class="animate-ping"
                  style="animation-duration: 3s;"
                />
              }

              <!-- The organic blood drop shape -->
              <path
                d="M16 3 C16 3 8 16 8 24 C8 29.5 11.5 34 16 34 C20.5 34 24 29.5 24 24 C24 16 16 3 16 3 Z"
                [attr.fill]="activeSection() === dot.id ? 'url(#emberGlow-' + dot.id + ')' : '#3d1210'"
                [attr.stroke]="activeSection() === dot.id ? '#ff4d3d' : '#220807'"
                stroke-width="1.2"
                [attr.filter]="activeSection() === dot.id ? 'url(#dropShadow-' + dot.id + ')' : null"
                [style.opacity]="activeSection() === dot.id ? '1' : '0.45'"
              />

              <!-- Specular tear reflection highlight -->
              <path
                d="M13 18 C13 14 15 8 15 8 C15 8 11 15 11 22"
                stroke="rgba(255, 255, 255, 0.4)"
                stroke-width="1"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      }
    </nav>
  `,
})
export class SideDotsNav {
  effects = inject(EffectsController);
  private audio = inject(AudioEngine);

  activeSection = input.required<SectionId>();
  navigate = output<SectionId>();

  readonly navDots: NavDot[] = [
    {id: 'informacion', label: 'Archivo', ariaLabel: 'Ir a sección Archivo de Personajes'},
    {id: 'rituales', label: 'Rituales', ariaLabel: 'Ir a sección Rituales Arcanos'},
    {id: 'juego', label: 'Terminal', ariaLabel: 'Ir a sección El Laberinto Terminal CRT'},
  ];

  selectSection(id: SectionId): void {
    if (this.activeSection() !== id) {
      this.effects.triggerGlitch(2, 280);
      this.audio.playClick();
      this.navigate.emit(id);
    }
  }
}
