import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MazeGame} from './maze-game';
import {BloodDrip} from './blood-drip';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-terminal-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MazeGame, BloodDrip, MatIconModule],
  template: `
    <section
      id="juego"
      class="horror-section w-full h-screen relative bg-[#070605] overflow-hidden flex flex-col justify-between"
      aria-label="Terminal CRT y Juego de Supervivencia"
    >
      <app-blood-drip />

      <!-- Section Title Header -->
      <header class="relative z-30 pt-16 sm:pt-14 md:pt-8 pb-2 px-3 sm:px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-[#7a1f1a]/30 bg-gradient-to-b from-[#0a0908]/95 via-[#0a0908]/80 to-transparent">
        <div>
          <div class="flex items-center gap-1.5 text-emerald-500">
            <mat-icon class="text-xs sm:text-sm">terminal</mat-icon>
            <span class="font-special text-[10px] sm:text-xs uppercase tracking-widest text-emerald-400">
              SISTEMA MAINFRAME MK-III · SIMULADOR 3D DE ESCAPE
            </span>
          </div>
          <h2 class="font-fell-sc text-xl sm:text-2xl md:text-4xl text-[#cfc7b5] tracking-wide mt-0.5">
            CORREDOR 13: LA PENUMBRA
          </h2>
        </div>

        <div class="font-special text-[10px] sm:text-[11px] text-zinc-400 border border-zinc-700 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/60 rounded-xs">
          Control: W/S avanzar · A/D girar · Q/E lateral · D-Pad móvil
        </div>
      </header>

      <!-- Detective's Desk Setting with Compact CRT Monitor Window -->
      <main class="relative z-20 flex-1 flex items-center justify-center p-1.5 sm:p-3 md:p-6 overflow-y-auto pb-20 sm:pb-6">
        <!-- Desk Backdrop with dried blood and notes -->
        <div class="relative w-full max-w-4xl flex items-center justify-center my-auto">
          
          <!-- Pinned desk note left -->
          <div class="hidden lg:block absolute -left-6 top-8 w-44 aged-paper p-3 shadow-xl rotate-[-5deg] border border-[#a89f8d] text-[#1a1614] z-10">
            <div class="w-3 h-3 rounded-full bg-[#7a1f1a] mx-auto -mt-4 mb-2 shadow"></div>
            <span class="font-special text-[10px] text-[#7a1f1a] block font-bold mb-1">PROTOCOLO DE LINTERNA</span>
            <p class="font-fell text-xs leading-tight">
              «Si la cosa aparece al fondo del pasillo, mantén la linterna sobre sus ojos. No corras a ciegas.»
            </p>
          </div>

          <!-- Pinned desk note right -->
          <div class="hidden lg:block absolute -right-6 bottom-12 w-44 aged-paper p-3 shadow-xl rotate-[4deg] border border-[#a89f8d] text-[#1a1614] z-10">
            <div class="w-3 h-3 rounded-full bg-[#3b4a3a] mx-auto -mt-4 mb-2 shadow"></div>
            <span class="font-special text-[10px] text-[#3b4a3a] block font-bold mb-1">AVISO FORENSE</span>
            <p class="font-fell text-xs leading-tight">
              «La cámara proyecta profundidad falsa. Si la pared respira, ya está demasiado cerca.»
            </p>
          </div>

          <!-- The Vintage CRT Monitor Chassis -->
          <div class="relative w-full max-w-[360px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[540px] bg-[#1a1614] border-3 sm:border-8 md:border-12 border-[#2b221d] rounded-lg sm:rounded-2xl md:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.98),0_20px_50px_rgba(0,0,0,0.9)] p-1.5 sm:p-3 md:p-5 flex flex-col items-center">
            
            <!-- Monitor Bezel Details: Brand name + vents -->
            <div class="w-full flex items-center justify-between text-zinc-500 font-mono text-[7px] sm:text-[9px] px-1 mb-1 sm:mb-2">
              <span class="tracking-widest font-bold">MONITOR CATHODE-RAY 1983</span>
              <div class="flex items-center gap-1 sm:gap-1.5">
                <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]"></span>
                <span>CH-01 ON</span>
              </div>
            </div>

            <!-- The Inner CRT Screen -->
            <div class="crt-screen w-full aspect-[4/3] rounded-sm sm:rounded-lg md:rounded-xl border-2 sm:border-4 border-[#0d0a08] relative overflow-hidden flex flex-col">
              <app-maze-game />
            </div>

            <!-- Monitor Bottom Panel: Knobs and Power switch -->
            <div class="w-full flex items-center justify-between px-1.5 pt-1 sm:pt-3 text-zinc-500 text-[8px] sm:text-[10px] font-mono">
              <div class="flex items-center gap-1 sm:gap-2">
                <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-zinc-800 border border-zinc-600"></div>
                <span class="hidden xs:inline sm:inline">BRILLO</span>
                <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-zinc-800 border border-zinc-600 ml-1"></div>
                <span class="hidden xs:inline sm:inline">CONTRASTE</span>
              </div>

              <!-- Power badge -->
              <span class="text-zinc-600 tracking-wider">
                60Hz NTSC
              </span>
            </div>
          </div>
        </div>
      </main>

      <!-- Bottom Spacer -->
      <div class="h-4"></div>
    </section>
  `,
})
export class TerminalSection {}
