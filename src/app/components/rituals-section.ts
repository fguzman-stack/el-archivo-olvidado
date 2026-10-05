import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RITUALS} from '../data/rituals.data';
import {AudioEngine} from '../services/audio-engine';
import {EffectsController} from '../services/effects';
import {ProgressTracker} from '../services/progress';
import {SanityController} from '../services/sanity';
import {BloodDrip} from './blood-drip';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-rituals-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BloodDrip, MatIconModule],
  template: `
    <section
      id="rituales"
      class="horror-section w-full h-screen relative bg-[#090807] overflow-hidden flex flex-col justify-between"
      aria-label="Altar de Rituales Arcanos"
    >
      <app-blood-drip [accent]="true" />

      <!-- Section Title & Atmospheric Ambient -->
      <header class="relative z-30 pt-16 sm:pt-14 md:pt-8 pb-2 px-3 sm:px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-[#7a1f1a]/30 bg-gradient-to-b from-[#0a0908]/95 via-[#0a0908]/80 to-transparent">
        <div>
          <div class="flex items-center gap-1.5 text-[#d9a441]">
            <mat-icon class="text-xs sm:text-sm">auto_stories</mat-icon>
            <span class="font-special text-[10px] sm:text-xs uppercase tracking-widest text-[#d9a441]">
              SÓTANO OCULTO · GRIMORIO DE EXPERIMENTACIÓN
            </span>
          </div>
          <h2 class="font-fell-sc text-xl sm:text-2xl md:text-4xl text-[#cfc7b5] tracking-wide mt-0.5">
            EL ALTAR DE LOS RITUALES
          </h2>
        </div>

        <div class="font-special text-[10px] sm:text-[11px] text-[#cfc7b5]/50 border border-[#7a1f1a]/30 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/40">
          Nota: Ficción de terror concebida para entretenimiento.
        </div>
      </header>

      <!-- The Ritual Book on Dark Wood Altar -->
      <main class="relative z-20 flex-1 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto pb-28 sm:pb-8">
        <div class="w-full max-w-5xl aged-paper border-2 sm:border-4 border-[#2b1f1a] shadow-[0_0_90px_rgba(0,0,0,0.98)] rounded-xs p-3 sm:p-6 md:p-10 relative overflow-hidden text-[#1a1614] my-auto">
          <!-- Candle Wax drip effects and burnt edge graphics -->
          <div class="absolute -top-8 -right-8 w-24 h-24 bg-[#7a1f1a]/20 rounded-full blur-xl pointer-events-none"></div>
          <div class="absolute top-0 right-0 border-t-16 sm:border-t-24 border-r-16 sm:border-r-24 border-t-[#0a0908] border-r-transparent"></div>

          <!-- Book Header: Index of 8 Rituals as Bookmarks -->
          <nav
            class="flex items-center gap-1 sm:gap-2 pb-2 sm:pb-4 mb-2.5 sm:mb-6 border-b border-[#1a1614]/20 overflow-x-auto scrollbar-none"
            aria-label="Capítulos de Rituales"
          >
            @for (ritual of rituals; track ritual.id; let idx = $index) {
              <button
                type="button"
                (click)="selectRitual(idx)"
                [class.bg-[#7a1f1a]]="activeRitualIndex() === idx"
                [class.text-white]="activeRitualIndex() === idx"
                [class.bg-black/10]="activeRitualIndex() !== idx"
                [class.text-[#1a1614]]="activeRitualIndex() !== idx"
                class="px-2 py-1 sm:px-3 sm:py-1.5 font-special text-[10px] sm:text-xs md:text-sm uppercase tracking-wider rounded-xs border border-[#1a1614]/20 hover:border-[#7a1f1a] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 sm:gap-1.5 focus:outline-none shrink-0"
              >
                <mat-icon class="text-xs w-3.5 h-3.5">{{ ritual.icon }}</mat-icon>
                <span>{{ idx + 1 }}. {{ ritual.title }}</span>
              </button>
            }
          </nav>

          <!-- Current Ritual Presentation Grid -->
          @let current = rituals[activeRitualIndex()];
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 md:gap-8 items-start">
            <!-- Left Side: Narrative Rules and Warnings -->
            <div class="md:col-span-6 space-y-2.5 sm:space-y-4">
              <div>
                <span class="font-special text-[9px] sm:text-xs tracking-widest text-[#7a1f1a] uppercase font-bold block mb-0.5">
                  Capítulo {{ activeRitualIndex() + 1 }} de {{ rituals.length }} · Folio Arcano
                </span>
                <h3 class="font-fell-sc text-lg sm:text-2xl md:text-3xl font-bold tracking-wide text-[#110e0c] leading-tight">
                  {{ current.title }}
                </h3>
                <p class="font-special text-[10px] sm:text-xs text-[#7a1f1a] italic mt-0.5">
                  {{ current.subtitle }}
                </p>
              </div>

              <!-- Lore snippet -->
              <p class="font-fell text-xs sm:text-base text-[#26201b] italic border-l-2 border-[#7a1f1a] pl-2 sm:pl-3 py-0.5 sm:py-1">
                «{{ current.loreSnippet }}»
              </p>

              <!-- Rule -->
              <div class="p-2 sm:p-3 bg-black/5 border border-[#1a1614]/15 rounded-xs">
                <span class="font-special text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1a1614] block mb-0.5">
                  Regla de Ejecución:
                </span>
                <p class="font-fell text-xs sm:text-sm leading-relaxed text-[#26201b]">
                  {{ current.rule }}
                </p>
              </div>

              <!-- Warning -->
              <div class="p-2 sm:p-3 bg-[#a01a14]/10 border-l-4 border-[#a01a14] rounded-r-xs">
                <span class="font-special text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#a01a14] block mb-0.5">
                  Advertencia:
                </span>
                <p class="font-fell text-[11px] sm:text-xs md:text-sm text-[#1a1614]">
                  {{ current.warning }}
                </p>
              </div>
            </div>

            <!-- Right Side: Dedicated Interactive Simulator per Ritual -->
            <div class="md:col-span-6 bg-[#0f0c0a] p-2.5 sm:p-4 md:p-6 rounded-xs border-2 border-[#2b1f1a] text-[#cfc7b5] min-h-[220px] sm:min-h-[300px] flex flex-col justify-center shadow-inner relative overflow-hidden">
              
              <!-- 1. BLOODY MARY: Hold 10s on Mirror -->
              @if (current.type === 'bloody_mary') {
                <div class="text-center space-y-2.5 sm:space-y-3">
                  <div
                    (mousedown)="startMirrorHold()"
                    (mouseup)="stopMirrorHold()"
                    (mouseleave)="stopMirrorHold()"
                    (touchstart)="startMirrorHold()"
                    (touchend)="stopMirrorHold()"
                    class="w-36 h-48 sm:w-44 sm:h-56 mx-auto rounded-t-full border-4 border-[#3d2f28] bg-gradient-to-b from-[#1c1815] to-[#0a0908] flex items-center justify-center relative overflow-hidden cursor-pointer select-none group shadow-2xl"
                  >
                    <!-- Mirror surface distortion -->
                    <div
                      class="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                      [style.opacity]="mirrorProgress() / 100"
                      style="background: radial-gradient(circle at center, rgba(160, 26, 20, 0.4), rgba(0,0,0,0.85));"
                    ></div>

                    @if (mirrorComplete()) {
                      <div class="text-center animate-fade-in p-2">
                        <span class="font-special text-2xl text-[#a01a14] font-bold block animate-pulse">
                          IT'S ME
                        </span>
                        <span class="font-fell text-xs text-[#cfc7b5]/80 block mt-1">
                          No mires hacia atrás...
                        </span>
                      </div>
                    } @else {
                      <div class="text-center p-3">
                        <mat-icon class="text-3xl text-[#cfc7b5]/40 mb-1">face</mat-icon>
                        <p class="font-special text-[11px] text-[#cfc7b5]/70">
                          {{ isHoldingMirror() ? 'Mirando fijo...' : 'Mantén presionado 10s' }}
                        </p>
                        @if (isHoldingMirror()) {
                          <div class="w-24 h-1.5 bg-black/60 rounded-full mx-auto mt-2 overflow-hidden border border-white/20">
                            <div class="h-full bg-[#a01a14] transition-all duration-100" [style.width]="mirrorProgress() + '%'"></div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  <span class="font-special text-xs text-[#cfc7b5]/60 block">
                    {{ mirrorComplete() ? 'La presencia ha respondido.' : 'Mantén pulsado sin parpadear.' }}
                  </span>
                </div>
              }

              <!-- 2. OUIJA: Spirit Board Question -->
              @if (current.type === 'ouija') {
                <div class="space-y-4">
                  <div class="bg-[#1a1412] p-4 border border-[#3d2f28] rounded-xs text-center relative overflow-hidden">
                    <div class="font-fell-sc text-lg text-[#d9a441] tracking-widest mb-1">
                      YES · OUIJA · NO
                    </div>
                    <div class="font-fell text-xs text-[#cfc7b5]/60 tracking-widest mb-3">
                      A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z
                    </div>

                    <!-- Planchette / Pointer animation -->
                    <div
                      class="w-12 h-14 mx-auto border-2 border-[#d9a441] rounded-t-full rounded-b-xs flex items-center justify-center bg-black/80 shadow-lg transition-transform duration-500"
                      [style.transform]="ouijaTransform()"
                    >
                      <div class="w-3 h-3 rounded-full border border-[#d9a441]"></div>
                    </div>

                    <div class="font-special text-sm text-[#a01a14] mt-3 min-h-[24px]">
                      {{ ouijaSpelledText() || '...' }}
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      [value]="ouijaQuestion()"
                      (input)="onOuijaInput($event)"
                      placeholder="Escribe tu pregunta..."
                      class="flex-1 bg-black/60 border border-[#3d2f28] px-3 py-1.5 font-special text-xs text-[#cfc7b5] outline-none focus:border-[#7a1f1a]"
                    />
                    <button
                      type="button"
                      (click)="askOuija()"
                      class="px-4 py-1.5 bg-[#7a1f1a] hover:bg-[#a01a14] text-white font-special text-xs uppercase cursor-pointer transition-colors"
                    >
                      Preguntar
                    </button>
                  </div>
                </div>
              }

              <!-- 3. CHARLIE CHARLIE: Crossed Pencils -->
              @if (current.type === 'charlie') {
                <div class="text-center space-y-3 sm:space-y-4">
                  <div class="w-44 h-44 sm:w-56 sm:h-56 mx-auto bg-[#1a1412] border border-[#3d2f28] p-2 sm:p-3 relative flex items-center justify-center select-none">
                    <!-- Quadrants -->
                    <div class="absolute inset-0 grid grid-cols-2 grid-rows-2 text-center p-2 sm:p-3 font-fell-sc text-xs sm:text-sm text-[#cfc7b5]/70 pointer-events-none">
                      <div class="border-r border-b border-[#3d2f28] flex items-center justify-center">SÍ</div>
                      <div class="border-b border-[#3d2f28] flex items-center justify-center">NO</div>
                      <div class="border-r border-[#3d2f28] flex items-center justify-center">NO</div>
                      <div class="flex items-center justify-center">SÍ</div>
                    </div>

                    <!-- Bottom horizontal pencil -->
                    <div class="absolute w-36 sm:w-44 h-2 bg-[#d9a441] border border-black shadow-md rounded-sm"></div>

                    <!-- Top vertical pivoting pencil with physics tilt -->
                    <div
                      class="absolute w-2 h-36 sm:h-44 bg-[#cfc7b5] border border-black shadow-lg rounded-sm transition-transform duration-700 ease-out origin-center"
                      [style.transform]="'rotate(' + charlieAngle() + 'deg)'"
                    >
                      <div class="w-full h-4 bg-[#7a1f1a]"></div>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="spinCharlie()"
                    class="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#7a1f1a] hover:bg-[#a01a14] text-white font-special text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                  >
                    «Charlie, Charlie... ¿estás aquí?»
                  </button>
                  <p class="font-special text-xs text-[#cfc7b5]/70">
                    {{ charlieResult() }}
                  </p>
                </div>
              }

              <!-- 4. LA VELA DEL NOMBRE: Melting Candle & Name Omen -->
              @if (current.type === 'name_candle') {
                <div class="space-y-3 sm:space-y-4 text-center">
                  <div class="w-20 sm:w-24 h-32 sm:h-40 mx-auto relative flex flex-col items-center justify-end">
                    <!-- Flame with flicker -->
                    @if (candleLit()) {
                      <div class="w-4 sm:w-5 h-6 sm:h-8 bg-gradient-to-t from-[#a01a14] via-[#d9a441] to-white rounded-full blur-[1px] animate-pulse mb-1 shadow-[0_0_15px_#d9a441]"></div>
                    } @else {
                      <div class="w-1 h-3 bg-black/70 mb-1"></div>
                    }
                    <!-- Candle wax stick -->
                    <div class="w-10 sm:w-12 h-20 sm:h-24 bg-[#cfc7b5] border border-[#3d2f28] rounded-t-sm shadow-md relative overflow-hidden">
                      <div class="absolute top-0 inset-x-0 h-3 bg-[#b5ad9b] rounded-b-md"></div>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
                    <input
                      type="text"
                      [value]="candleName()"
                      (input)="onCandleNameInput($event)"
                      placeholder="Nombre del destinatario..."
                      class="flex-1 bg-black/60 border border-[#3d2f28] px-3 py-1.5 font-special text-xs text-[#cfc7b5] outline-none"
                    />
                    <button
                      type="button"
                      (click)="burnCandle()"
                      class="px-3 py-1.5 bg-[#d9a441] hover:bg-[#ffd175] text-[#1a1614] font-special text-xs uppercase font-bold cursor-pointer transition-colors"
                    >
                      Prender
                    </button>
                  </div>

                  @if (candleOmen()) {
                    <div class="p-2.5 bg-black/40 border border-[#7a1f1a]/50 text-xs font-special text-[#a01a14] animate-fade-in">
                      {{ candleOmen() }}
                    </div>
                  }
                </div>
              }

              <!-- 5. EL ASCENSOR: Floor Button Sequence -->
              @if (current.type === 'elevator') {
                <div class="space-y-4 text-center">
                  <div class="font-special text-xs text-[#cfc7b5]/70">
                    Secuencia requerida: 4 · 2 · 6 · 2 · 10 · 5
                  </div>

                  <!-- Elevator Display Screen -->
                  <div class="bg-black border border-[#3d2f28] p-3 rounded-xs font-special text-base tracking-widest text-[#a01a14] shadow-inner">
                    PISO ACTUAL: {{ elevatorFloor() }} · {{ elevatorStatus() }}
                  </div>

                  <!-- Keypad 1 to 10 -->
                  <div class="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                    @for (floor of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track floor) {
                      <button
                        type="button"
                        (click)="pressElevatorFloor(floor)"
                        class="p-2 bg-[#1c1815] hover:bg-[#7a1f1a] active:bg-[#a01a14] border border-[#3d2f28] font-special text-sm rounded-xs transition-colors cursor-pointer"
                      >
                        {{ floor }}
                      </button>
                    }
                  </div>

                  <button
                    type="button"
                    (click)="resetElevator()"
                    class="text-[11px] font-special text-[#cfc7b5]/50 hover:text-white underline cursor-pointer"
                  >
                    Reiniciar secuencia
                  </button>
                </div>
              }

              <!-- 6. LA CINTA VHS: Static & 03:17 AM REC -->
              @if (current.type === 'vhs') {
                <div class="crt-screen p-4 rounded-xs border-2 border-[#2b241e] text-left relative min-h-[200px] flex flex-col justify-between font-special">
                  <div class="flex items-center justify-between text-xs text-red-500">
                    <span class="flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                      REC ● 03:17:42 AM
                    </span>
                    <span class="text-zinc-500">SP PLAY 0:14:02</span>
                  </div>

                  <div class="my-3 text-xs md:text-sm text-zinc-300 space-y-1">
                    <p class="text-emerald-400 font-mono text-[11px]">// SEÑAL DE CINTA ANÁLOGA DETECTADA</p>
                    <p>{{ vhsTranscript() }}</p>
                  </div>

                  <div class="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      (click)="playVhsTape()"
                      class="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-600 flex items-center gap-1 cursor-pointer"
                    >
                      <mat-icon class="text-xs w-3.5 h-3.5">play_arrow</mat-icon>
                      <span>Reproducir cinta</span>
                    </button>
                    <span class="text-[11px] text-zinc-500">Cabezal sucio</span>
                  </div>
                </div>
              }

              <!-- 7. LA VENTANA DE LAS 3:00 AM -->
              @if (current.type === 'window_3am') {
                <div class="space-y-4 text-center">
                  <div class="w-40 h-40 mx-auto rounded-full border-4 border-[#3d2f28] bg-[#0a0908] flex items-center justify-center p-3 relative shadow-inner">
                    <mat-icon class="text-4xl text-[#7a1f1a]">access_time</mat-icon>
                    <div class="absolute bottom-4 font-special text-xs text-[#cfc7b5]">
                      {{ windowClockText() }}
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="advanceClockTo3Am()"
                    class="px-4 py-2 bg-[#7a1f1a] hover:bg-[#a01a14] text-white font-special text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                  >
                    Esperar a las 03:00 AM
                  </button>

                  @if (windowRevealed()) {
                    <div class="p-3 bg-black/60 border border-[#7a1f1a] font-fell text-xs text-[#cfc7b5] animate-fade-in">
                      «Tres golpes secos resonaron en el vidrio exterior... El reflejo no correspondía a tu propia habitación.»
                    </div>
                  }
                </div>
              }

              <!-- 8. EL SUSURRO EVP -->
              @if (current.type === 'whisper') {
                <div class="space-y-4 text-center">
                  <div class="w-32 h-32 mx-auto rounded-full border-2 border-[#7a1f1a] bg-black/60 flex items-center justify-center relative overflow-hidden">
                    <mat-icon
                      class="text-4xl transition-all duration-300"
                      [class.text-[#a01a14]]="isListeningWhisper()"
                      [class.scale-125]="isListeningWhisper()"
                      [class.text-[#cfc7b5]/50]="!isListeningWhisper()"
                    >
                      hearing
                    </mat-icon>
                  </div>

                  <button
                    type="button"
                    (click)="triggerWhisper()"
                    class="px-4 py-2 bg-[#7a1f1a] hover:bg-[#a01a14] text-white font-special text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
                  >
                    {{ isListeningWhisper() ? 'Sintonizando murmullo...' : 'Escuchar la pared' }}
                  </button>

                  <p class="font-special text-xs text-[#a01a14] min-h-[20px]">
                    {{ whisperSubtitle() }}
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- Bottom book pager navigation -->
          <div class="flex items-center justify-between border-t border-[#1a1614]/20 pt-2.5 sm:pt-4 mt-3 sm:mt-6">
            <button
              type="button"
              (click)="prevRitual()"
              class="font-special text-[11px] sm:text-xs uppercase tracking-wider text-[#1a1614] hover:text-[#7a1f1a] flex items-center gap-1 cursor-pointer"
            >
              <mat-icon class="text-xs sm:text-sm">west</mat-icon>
              <span><span class="hidden sm:inline">Ritual </span>Anterior</span>
            </button>
            <span class="font-special text-[10px] sm:text-xs text-[#5a4e42]">
              Pág. {{ activeRitualIndex() + 1 }} / {{ rituals.length }}
            </span>
            <button
              type="button"
              (click)="nextRitual()"
              class="font-special text-[11px] sm:text-xs uppercase tracking-wider text-[#1a1614] hover:text-[#7a1f1a] flex items-center gap-1 cursor-pointer"
            >
              <span><span class="hidden sm:inline">Ritual </span>Siguiente</span>
              <mat-icon class="text-xs sm:text-sm">east</mat-icon>
            </button>
          </div>
        </div>
      </main>

      <!-- Bottom Spacer -->
      <div class="h-4"></div>
    </section>
  `,
})
export class RitualsSection {
  private audio = inject(AudioEngine);
  private effects = inject(EffectsController);
  private progress = inject(ProgressTracker);
  private sanity = inject(SanityController);

  readonly rituals = RITUALS;
  activeRitualIndex = signal<number>(0);

  // 1. Mirror state
  isHoldingMirror = signal<boolean>(false);
  mirrorProgress = signal<number>(0);
  mirrorComplete = signal<boolean>(false);
  private mirrorTimer: ReturnType<typeof setInterval> | null = null;

  // 2. Ouija state
  ouijaQuestion = signal<string>('');
  ouijaSpelledText = signal<string>('');
  ouijaTransform = signal<string>('translate(0, 0)');

  // 3. Charlie Charlie state
  charlieAngle = signal<number>(0);
  charlieResult = signal<string>('Los lápices reposan en la cruz.');

  // 4. Name Candle state
  candleName = signal<string>('');
  candleLit = signal<boolean>(false);
  candleOmen = signal<string>('');

  // 5. Elevator sequence state
  elevatorFloor = signal<number>(1);
  elevatorStep = signal<number>(0);
  elevatorStatus = signal<string>('EN ESPERA');
  private readonly targetElevatorSeq = [4, 2, 6, 2, 10, 5];

  // 6. VHS state
  vhsTranscript = signal<string>('Cinta vacía. Presione reproducir.');

  // 7. Window 3AM state
  windowClockText = signal<string>('02:58 AM');
  windowRevealed = signal<boolean>(false);

  // 8. Whisper state
  isListeningWhisper = signal<boolean>(false);
  whisperSubtitle = signal<string>('');

  selectRitual(index: number): void {
    this.activeRitualIndex.set(index);
    this.audio.playTypewriterKey();
    this.progress.markRitualCompleted(this.rituals[index].id);
  }

  nextRitual(): void {
    const next = (this.activeRitualIndex() + 1) % this.rituals.length;
    this.selectRitual(next);
  }

  prevRitual(): void {
    const prev = (this.activeRitualIndex() - 1 + this.rituals.length) % this.rituals.length;
    this.selectRitual(prev);
  }

  // 1. Mirror functions
  startMirrorHold(): void {
    if (this.mirrorComplete()) return;
    this.isHoldingMirror.set(true);
    this.sanity.drainSanity(2, 'Mirando al espejo oscuro');
    this.mirrorTimer = setInterval(() => {
      const next = this.mirrorProgress() + 5;
      if (next >= 100) {
        this.mirrorProgress.set(100);
        this.mirrorComplete.set(true);
        this.isHoldingMirror.set(false);
        if (this.mirrorTimer) clearInterval(this.mirrorTimer);
        this.audio.playStaticGlitch(0.3);
        this.effects.triggerDirectSubliminal('IT\'S ME');
        this.sanity.drainSanity(8, 'Aparición en el espejo de Bloody Mary');
      } else {
        this.mirrorProgress.set(next);
      }
    }, 500); // 10 seconds total
  }

  stopMirrorHold(): void {
    if (this.mirrorComplete()) return;
    this.isHoldingMirror.set(false);
    this.mirrorProgress.set(0);
    if (this.mirrorTimer) clearInterval(this.mirrorTimer);
  }

  // 2. Ouija functions
  onOuijaInput(e: Event): void {
    this.ouijaQuestion.set((e.target as HTMLInputElement).value);
  }

  askOuija(): void {
    const q = this.ouijaQuestion().trim();
    if (!q) return;

    this.audio.playFootstep();
    this.ouijaSpelledText.set('La planchette se desliza...');
    this.sanity.drainSanity(4.5, 'Consulta a la Ouija');

    // Animate planchette movement
    const randomOffsets = [
      'translate(-25px, -15px)',
      'translate(30px, -20px)',
      'translate(15px, 18px)',
      'translate(-10px, 10px)',
    ];
    let step = 0;
    const interval = setInterval(() => {
      this.ouijaTransform.set(randomOffsets[step % randomOffsets.length]);
      step++;
      if (step > 4) {
        clearInterval(interval);
        this.ouijaTransform.set('translate(0, 0)');
        const answers = [
          'NO DEBISTE PREGUNTAR ESO',
          'ESTAMOS AQUÍ CONTIGO',
          'MIRA DETRÁS DE LA PUERTA',
          'EL TIEMPO SE AGOTA',
          'YA SABES LA RESPUESTA',
        ];
        const chosen = answers[Math.floor(Math.random() * answers.length)];
        this.ouijaSpelledText.set(chosen);
        this.audio.playTypewriterKey();
      }
    }, 400);
  }

  // 3. Charlie Charlie functions
  spinCharlie(): void {
    this.audio.playClick();
    this.charlieResult.set('El aire se agita...');
    this.sanity.drainSanity(3.5, 'Invocación Charlie Charlie');
    const randomAngle = Math.random() > 0.5 ? 90 + (Math.random() * 8 - 4) : 180 + (Math.random() * 8 - 4);
    this.charlieAngle.set(randomAngle);

    setTimeout(() => {
      if (Math.abs(randomAngle - 90) < 10) {
        this.charlieResult.set('El lápiz apunta con firmeza hacia: SÍ.');
      } else {
        this.charlieResult.set('El lápiz oscila y marca: NO.');
      }
      this.audio.playFootstep();
    }, 800);
  }

  // 4. Name Candle functions
  onCandleNameInput(e: Event): void {
    this.candleName.set((e.target as HTMLInputElement).value);
  }

  burnCandle(): void {
    const name = this.candleName().trim() || 'Aquel sin nombre';
    this.candleLit.set(true);
    this.audio.playClick();
    this.candleOmen.set('La mecha chisporrotea consumiendo la cera negra...');
    this.sanity.drainSanity(4.0, 'Vela del nombre');

    setTimeout(() => {
      const omens = [
        `Para ${name}: «La sombra que camina a tu lado no es tu reflejo.»`,
        `Para ${name}: «El reloj se detendrá antes del alba.»`,
        `Para ${name}: «Alguien pronunció tu nombre en una habitación vacía.»`,
        `Para ${name}: «Las ventanas nunca deben quedar abiertas esta noche.»`,
      ];
      this.candleOmen.set(omens[Math.floor(Math.random() * omens.length)]);
      this.audio.playTypewriterKey();
    }, 1200);
  }

  // 5. Elevator sequence functions
  pressElevatorFloor(floor: number): void {
    this.audio.playElevatorBell();
    this.elevatorFloor.set(floor);
    this.sanity.drainSanity(2.0, 'Botón de ascensor maldito');

    const step = this.elevatorStep();
    if (floor === this.targetElevatorSeq[step]) {
      const nextStep = step + 1;
      this.elevatorStep.set(nextStep);
      if (nextStep >= this.targetElevatorSeq.length) {
        this.elevatorStatus.set('¡DIMENSIÓN CAMBIADA! NO MIRES A LA MUJER.');
        this.audio.playStaticGlitch(0.4);
        this.effects.triggerGlitch(4, 400);
        this.sanity.drainSanity(9.0, 'Llegada a la dimensión del ascensor');
      } else {
        this.elevatorStatus.set(`SECUENCIA ${nextStep} / ${this.targetElevatorSeq.length}`);
      }
    } else {
      this.elevatorStep.set(0);
      this.elevatorStatus.set('SECUENCIA QUEBRADA · VUELVA AL PISO 1');
    }
  }

  resetElevator(): void {
    this.elevatorFloor.set(1);
    this.elevatorStep.set(0);
    this.elevatorStatus.set('EN ESPERA');
    this.audio.playClick();
  }

  // 6. VHS functions
  playVhsTape(): void {
    this.audio.playStaticGlitch(0.5);
    this.effects.triggerGlitch(3, 300);
    this.vhsTranscript.set('ESTÁTICA... // "Si estás viendo esto, ellos ya saben que encontraste el archivo."');
    this.sanity.drainSanity(5.0, 'Reproducción de cinta VHS maldita');
  }

  // 7. Window 3AM functions
  advanceClockTo3Am(): void {
    this.windowClockText.set('03:00 AM');
    this.audio.playElevatorBell();
    this.effects.triggerGlitch(2, 250);
    this.windowRevealed.set(true);
    this.sanity.drainSanity(5.0, 'La hora de las 3:00 AM');
  }

  // 8. Whisper functions
  triggerWhisper(): void {
    this.isListeningWhisper.set(true);
    this.audio.playWhisperMurmur();
    this.whisperSubtitle.set('Escuchando frecuencia EVP...');
    this.sanity.drainSanity(4.0, 'Sintonización EVP de susurros');

    setTimeout(() => {
      const phrases = [
        '«...estás buscando en el lugar equivocado...»',
        '«...la puerta del sótano nunca tuvo cerrojo...»',
        '«...él camina entre los árboles secos...»',
        '«...no apagues la linterna...»',
      ];
      this.whisperSubtitle.set(phrases[Math.floor(Math.random() * phrases.length)]);
      this.isListeningWhisper.set(false);
    }, 2400);
  }
}
