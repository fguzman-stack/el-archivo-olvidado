import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {SanityController} from '../services/sanity';
import {EffectsController} from '../services/effects';

@Component({
  selector: 'app-hallucination-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sanity.activeHallucination(); as h) {
      @if (!effects.reducedEffects()) {
        <div
          class="fixed inset-0 pointer-events-none z-[70] overflow-hidden select-none"
          aria-hidden="true"
        >

          <!-- 1. PEEKING HANDS / CLAWS FROM SCREEN EDGES -->
          @if (h.type === 'PEEKING_HANDS') {
            <div
              class="absolute transition-transform duration-500 ease-out"
              [class.left-0]="h.edge === 'left'"
              [class.top-1/3]="h.edge === 'left' || h.edge === 'right'"
              [class.right-0]="h.edge === 'right'"
              [class.top-0]="h.edge === 'top'"
              [class.left-1/3]="h.edge === 'top' || h.edge === 'bottom'"
              [class.bottom-0]="h.edge === 'bottom'"
            >
              <!-- Bony claw SVG reaching into viewport -->
              <svg
                viewBox="0 0 140 260"
                class="w-24 md:w-36 h-48 md:h-72 drop-shadow-[0_0_15px_rgba(10,9,8,0.9)] opacity-95 animate-hand-twitch"
                [class.rotate-90]="h.edge === 'top'"
                [class.-rotate-90]="h.edge === 'bottom'"
                [class.scale-x-[-1]]="h.edge === 'right'"
              >
                <!-- Skeletal forearm and elongated claw fingers -->
                <path
                  d="M0,130 C20,135 45,130 65,120 C85,110 105,100 135,90 C125,100 95,115 80,130 C110,130 135,135 138,140 C115,145 90,145 75,150 C100,165 125,180 128,190 C105,180 85,170 70,165 C85,190 100,215 102,230 C85,205 65,180 50,160 C35,150 15,145 0,140 Z"
                  fill="#14110e"
                  stroke="#5a1410"
                  stroke-width="2"
                />
                <!-- Dried blood on claws -->
                <circle cx="135" cy="90" r="3.5" fill="#a01a14" />
                <circle cx="138" cy="140" r="3" fill="#a01a14" />
                <circle cx="128" cy="190" r="3.5" fill="#a01a14" />
                <circle cx="102" cy="230" r="3" fill="#a01a14" />
              </svg>
            </div>
          }

          <!-- 2. FLEETING SHADOW GLIDING ACROSS SCREEN -->
          @if (h.type === 'FLEETING_SHADOW') {
            <div class="absolute inset-0 flex items-center justify-center animate-shadow-dash">
              <div
                class="w-64 h-96 bg-black/95 rounded-full blur-2xl transform -skew-x-12 opacity-85 shadow-[0_0_60px_#000]"
              ></div>
            </div>
          }

          <!-- 3. TERRIFYING GHOST FACE IN PENUMBRA -->
          @if (h.type === 'GHOST_FACE') {
            <div class="absolute inset-0 flex items-center justify-center bg-black/50 animate-ghost-fade">
              <div class="relative w-72 h-96 opacity-65 flex flex-col items-center justify-center text-[#cfc7b5]/80">
                <svg viewBox="0 0 200 280" class="w-full h-full drop-shadow-[0_0_25px_rgba(160,26,20,0.6)]">
                  <!-- Distorted hollow skull outline -->
                  <path
                    d="M100,20 C45,20 30,70 30,140 C30,210 60,260 100,260 C140,260 170,210 170,140 C170,70 155,20 100,20 Z"
                    fill="#0d0a08"
                    stroke="#7a1f1a"
                    stroke-width="3"
                  />
                  <!-- Sunken black eye sockets with tiny red embers -->
                  <ellipse cx="65" cy="115" rx="20" ry="26" fill="#000" />
                  <ellipse cx="135" cy="115" rx="20" ry="26" fill="#000" />
                  <circle cx="65" cy="118" r="2.5" fill="#ff2222" class="animate-pulse" />
                  <circle cx="135" cy="118" r="2.5" fill="#ff2222" class="animate-pulse" />
                  <!-- Gaping screaming jaw -->
                  <ellipse cx="100" cy="200" rx="24" ry="40" fill="#000" stroke="#5a100c" stroke-width="2" />
                </svg>
              </div>
            </div>
          }

          <!-- 4. FAKE SYSTEM KERNEL PANIC CORRUPT CRASH -->
          @if (h.type === 'CORRUPT_KERNEL_PANIC') {
            <div class="absolute inset-0 bg-[#060404] text-red-600 font-mono p-6 md:p-12 z-[80] flex flex-col justify-between overflow-hidden shadow-2xl border-4 border-red-950">
              <div class="space-y-2 text-xs md:text-sm">
                <div class="bg-red-950/80 text-red-200 px-3 py-1 font-bold inline-block tracking-widest uppercase">
                  *** KERNEL PANIC: REALIDAD_DESINCRONIZADA (ERROR 0x7A1F1A) ***
                </div>
                <p class="text-zinc-400">
                  FALLO CEREBRAL CRÍTICO: La tasa de cordura cayó por debajo del límite biológico seguro.
                </p>
                <div class="p-3 bg-black/80 border border-red-900/60 text-[11px] md:text-xs text-red-400 font-mono leading-relaxed space-y-1">
                  <div>CPU 0: PARITY CORRUPTION DETECTED AT 0x00A0:98BF:13EE</div>
                  <div>STACK_TRACE: SOUL_DEREFERENCE() -> ENTITY_ATTACHMENT() -> MEM_BLEED()</div>
                  <div class="text-zinc-500">DUMP: 4E 4F 20 4D 49 52 45 53 20 44 45 54 52 41 53 (NO MIRES DETRAS)</div>
                  <div>REINICIANDO NEURONAS EN {{ (h.durationMs / 1000).toFixed(1) }}s ...</div>
                </div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-zinc-600 border-t border-red-950 pt-2">
                <span>ARCHIVO_OLVIDADO // SISTEMA DE EMERGENCIA</span>
                <span class="animate-pulse text-red-500">PULSO CARDÍACO INESTABLE</span>
              </div>
            </div>
          }

          <!-- 5. DIGITAL BLOOD MELT LIQUID CURTAIN -->
          @if (h.type === 'BLOOD_MELT') {
            <div class="absolute inset-0 bg-[#0a0908]/30 backdrop-blur-[0.5px]">
              <svg viewBox="0 0 1200 800" preserveAspectRatio="none" class="w-full h-full text-[#7a1f1a] drop-shadow-[0_8px_18px_rgba(0,0,0,0.95)] animate-blood-melt">
                <defs>
                  <linearGradient id="meltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3d0c0a" stop-opacity="0.95" />
                    <stop offset="70%" stop-color="#7a1f1a" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#a01a14" stop-opacity="0.95" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,0 L1200,0 L1200,160 
                     Q1100,240 1020,480 Q980,560 920,220 
                     Q840,180 780,540 Q750,680 700,240 
                     Q620,180 540,490 Q500,590 460,200 
                     Q380,180 320,620 Q280,720 240,240 
                     Q180,190 120,450 Q80,540 0,220 Z"
                  fill="url(#meltGrad)"
                />
              </svg>
            </div>
          }

          <!-- 6. RAPID STROBE FLASH (RED / BLACK PULSE) -->
          @if (h.type === 'STROBE_FLASH') {
            <div class="absolute inset-0 bg-[#a01a14] opacity-80 mix-blend-difference animate-strobe-fast"></div>
          }

        </div>
      }
    }

    <!-- 7. CORRUPTED TEXT WHISPER BANNER OVERLAY -->
    @if (sanity.textCorruptionActive() && !effects.reducedEffects()) {
      <div
        class="fixed top-16 left-1/2 -translate-x-1/2 z-[65] px-4 py-1.5 bg-[#7a1f1a]/90 border border-red-500 text-white font-special text-xs md:text-sm tracking-widest uppercase shadow-[0_0_20px_#a01a14] animate-pulse"
        aria-live="polite"
      >
        ⚠ {{ sanity.corruptedTextSnippet() }} ⚠
      </div>
    }
  `,
})
export class HallucinationOverlay {
  sanity = inject(SanityController);
  effects = inject(EffectsController);
}
