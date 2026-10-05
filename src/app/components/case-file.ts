import {ChangeDetectionStrategy, Component, HostListener, inject, signal} from '@angular/core';
import {ThemeController} from '../services/theme';
import {ProgressTracker} from '../services/progress';
import {AudioEngine} from '../services/audio-engine';
import {EffectsController} from '../services/effects';
import {Character, CATEGORY_COLORS} from '../data/characters.data';
import {CHARACTER_IMAGE_MAP} from '../data/character-images.data';
import {MatIconModule} from '@angular/material/icon';
import {CharacterAtmosphere} from './character-atmosphere';
import {CharacterPortraitPipe} from './character-portrait.pipe';

export type DossierSheet = 'profile' | 'evidence' | 'connections';
type DossierEffect =
  | 'blood'
  | 'static'
  | 'water'
  | 'claws'
  | 'tar'
  | 'mirror'
  | 'mold'
  | 'ashes'
  | 'spectral'
  | 'embers';

@Component({
  selector: 'app-case-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, CharacterAtmosphere, CharacterPortraitPipe],
  template: `
    @if (theme.selectedCharacter(); as char) {
      <div
        class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-1 sm:p-4 md:p-8 bg-black/95 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Expediente de ' + char.name"
      >
        <!-- Outer Manila / Leather Dossier Folder Container -->
        <div
          class="relative w-full max-w-5xl my-1 sm:my-auto transition-all duration-300 transform scale-100 flex flex-col items-center"
        >
          <!-- Folder Tab sticking out on top -->
          <div class="w-full flex items-center justify-between px-1.5 sm:px-8 mb-[-2px] z-10 select-none">
            <div class="flex items-center gap-1 sm:gap-2">
              <div
                class="bg-[#2a2019] border-t-2 border-x-2 border-[#543d2f] text-[#cfc7b5] px-2 sm:px-4 py-1 sm:py-1.5 rounded-t-md font-special text-[10px] sm:text-sm uppercase tracking-widest flex items-center gap-1 sm:gap-2 shadow-lg"
              >
                <mat-icon class="text-xs text-[#a01a14]">folder_shared</mat-icon>
                <span class="font-bold text-[#e6ded0]">EXP-[{{ char.id }}]</span>
                <span class="text-[10px] text-[#8c7a6b] hidden sm:inline">· CARPETA CONFIDENCIAL</span>
              </div>
            </div>

            <!-- Hand-drawn X close button in folder corner -->
            <button
              type="button"
              (click)="close()"
              aria-label="Cerrar carpeta de expediente"
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1c1511] border border-[#543d2f] text-[#a01a14] hover:text-[#ff3322] hover:bg-[#2b1f18] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg focus:outline-none"
            >
              <svg viewBox="0 0 36 36" class="w-5 h-5 sm:w-6 sm:h-6 stroke-current stroke-[3] stroke-linecap-round fill-none">
                <line x1="10" y1="10" x2="26" y2="26" />
                <line x1="26" y1="10" x2="10" y2="26" />
              </svg>
            </button>
          </div>

          <!-- The Folder Body (Kraft/Leather texture with layered sheets inside) -->
          <div
            class="relative w-full bg-[#201813] border-2 sm:border-4 border-[#3d2c21] rounded-b-md rounded-tr-md p-1.5 sm:p-6 md:p-8 shadow-[0_0_100px_rgba(0,0,0,0.99)] overflow-hidden"
          >
            <!-- Heavy Brass Binding Fastener at the Top Center -->
            <div class="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 sm:gap-12 pointer-events-none">
              <div class="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-[#8c6d3b] border-2 border-[#3d2c18] shadow-inner flex items-center justify-center">
                <div class="w-0.5 h-2 sm:w-1 sm:h-3 bg-[#3d2c18] rotate-45"></div>
              </div>
              <div class="w-8 sm:w-16 h-1.5 sm:h-2.5 bg-gradient-to-r from-[#6b5128] via-[#a88444] to-[#6b5128] border border-[#3d2c18] rounded-xs shadow-md"></div>
              <div class="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-[#8c6d3b] border-2 border-[#3d2c18] shadow-inner flex items-center justify-center">
                <div class="w-0.5 h-2 sm:w-1 sm:h-3 bg-[#3d2c18] rotate-45"></div>
              </div>
            </div>

            <!-- Stacked Sheets Under-layers -->
            <div
              class="absolute inset-x-2 sm:inset-x-5 inset-y-3 sm:inset-y-6 bg-[#b8af9b] rounded-xs shadow-lg transform rotate-[1deg] opacity-70 pointer-events-none border border-[#8a806d]"
            ></div>
            <div
              class="absolute inset-x-1.5 sm:inset-x-4 inset-y-2 sm:inset-y-5 bg-[#c4bcab] rounded-xs shadow-md transform rotate-[-0.8deg] opacity-80 pointer-events-none border border-[#9c917e]"
            >
              <div class="absolute top-0 right-10 w-24 h-5 bg-[#7a1f1a]/20 blur-sm"></div>
            </div>

            <!-- Active Document Sheet -->
            <div
              class="relative z-20 aged-paper rounded-xs border border-[#a39783] shadow-[0_4px_25px_rgba(0,0,0,0.85)] p-2.5 sm:p-7 md:p-9 text-[#1a1614] overflow-hidden"
            >
              @let dossierEffect = getDossierEffect(char);
              @let intensity = dossierEffectIntensity();

              <app-character-atmosphere [signature]="char.signature" [seed]="char.id.length" />

              <div class="absolute inset-0 pointer-events-none z-0 dossier-effect-layer" [attr.data-effect]="dossierEffect">
                @if (dossierEffect === 'blood') {
                  @for (corner of [0, 1, 2, 3]; track corner) {
                    <svg class="blood-corner" [class.corner-right]="corner % 2 === 1" [class.corner-bottom]="corner > 1" viewBox="0 0 160 180" aria-hidden="true">
                      <path fill="#63100e" d="M0 0H78L72 12 93 22 68 28 82 40 55 36 63 58 43 47 37 71 28 53 12 68 0 49Z"/>
                      <path fill="#941e17" d="M0 0H48L52 14 40 20 51 29 30 28 34 42 20 33 10 44 0 35Z"/>
                      <path fill="#64110e" d="M12 35Q18 62 14 104Q13 115 16 115Q20 115 18 102L22 42ZM40 27Q43 52 42 73Q40 81 43 82Q47 81 46 74L47 28Z"/>
                      <g fill="#72130f"><ellipse cx="88" cy="48" rx="3" ry="7" transform="rotate(-40 88 48)"/><circle cx="63" cy="78" r="3"/><circle cx="104" cy="23" r="2"/><ellipse cx="30" cy="91" rx="2" ry="4"/><circle cx="78" cy="96" r="1.5"/><circle cx="51" cy="117" r="2"/></g>
                    </svg>
                  }
                  @for (splash of getEffectMarks(intensity); track splash) {
                    <span
                      class="blood-impact absolute animate-dossier-blood-splash"
                      [style.left.%]="splash % 2 === 0 ? 88 + splash % 5 : 2 + splash % 5"
                      [style.top.%]="(splash * 29 + 7) % 90"
                      [style.width.px]="6 + ((splash * 5) % 18)"
                      [style.height.px]="6 + ((splash * 7) % 22)"
                    ></span>
                  }
                } @else if (dossierEffect === 'static') {
                  <div class="absolute inset-0 opacity-30 animate-dossier-static"></div>
                  <div class="absolute inset-x-0 top-1/3 h-10 bg-cyan-400/10 blur-sm animate-vhs-scan"></div>
                  <div class="absolute inset-0 animate-dossier-rgb-tear"></div>
                } @else if (dossierEffect === 'water') {
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,116,144,.22),transparent_34%),radial-gradient(circle_at_80%_100%,rgba(8,47,73,.2),transparent_34%)] animate-dossier-water"></div>
                  @for (drop of getEffectMarks(5); track drop) {
                    <span class="absolute top-0 w-1 bg-cyan-900/30 rounded-b-full animate-dossier-drip" [style.left.%]="drop * 16" [style.height.px]="22 + drop * 8" [style.animationDelay.s]="drop * .35"></span>
                  }
                } @else if (dossierEffect === 'claws') {
                  <div class="absolute inset-0 opacity-55">
                    @for (slash of getEffectMarks(5); track slash) {
                      <span class="absolute h-32 w-1 bg-[#2a221d]/35 rotate-[18deg] shadow-[8px_0_0_rgba(42,34,29,.18),16px_0_0_rgba(42,34,29,.12)]" [style.left.%]="10 + slash * 17" [style.top.%]="(slash * 19) % 70"></span>
                    }
                  </div>
                } @else if (dossierEffect === 'tar') {
                  <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent"></div>
                  @for (drop of getEffectMarks(6); track drop) {
                    <span class="absolute top-0 w-2 bg-black/55 rounded-b-full animate-dossier-drip" [style.left.%]="8 + drop * 14" [style.height.px]="26 + ((drop * 13) % 58)" [style.animationDelay.s]="drop * .28"></span>
                  }
                } @else if (dossierEffect === 'mirror') {
                  <div class="absolute inset-0 bg-[linear-gradient(120deg,transparent_15%,rgba(255,255,255,.22)_18%,transparent_22%,transparent_62%,rgba(255,255,255,.16)_65%,transparent_69%)] opacity-45 animate-dossier-glint"></div>
                  <div class="absolute inset-5 border border-white/25 rotate-[-1deg]"></div>
                } @else if (dossierEffect === 'mold') {
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(47,83,38,.24),transparent_17%),radial-gradient(circle_at_88%_22%,rgba(74,92,43,.2),transparent_16%),radial-gradient(circle_at_72%_82%,rgba(25,71,42,.22),transparent_22%)]"></div>
                } @else if (dossierEffect === 'ashes') {
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,0,0,.18),transparent_18%),radial-gradient(circle_at_78%_86%,rgba(80,35,20,.16),transparent_24%)]"></div>
                  <div class="absolute -right-12 -bottom-12 w-44 h-44 bg-black/20 rounded-full blur-2xl"></div>
                } @else if (dossierEffect === 'embers') {
                  @for (ember of getEffectMarks(10); track ember) {
                    <span class="absolute w-1.5 h-1.5 rounded-full bg-amber-600/45 animate-dossier-ember" [style.left.%]="(ember * 23) % 92" [style.top.%]="(ember * 31) % 88" [style.animationDelay.s]="ember * .22"></span>
                  }
                } @else {
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,.14),transparent_28%)] animate-mist-drift"></div>
                }
              </div>

              @if (char.id === 'jeff-the-killer') {
                <button type="button" (click)="intensifyDossierEffect($event)" aria-label="Tocar mancha de sangre superior izquierda" class="absolute top-1 left-1 sm:top-3 sm:left-3 z-30 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#7a1f1a]/35 hover:bg-[#a01a14]/45 blur-[1px] cursor-crosshair transition-all animate-dossier-blood-pulse"></button>
                <button type="button" (click)="intensifyDossierEffect($event)" aria-label="Tocar mancha de sangre superior derecha" class="absolute top-1 right-1 sm:top-3 sm:right-3 z-30 w-[72px] h-[72px] sm:w-28 sm:h-28 rounded-full bg-[#5a100c]/30 hover:bg-[#a01a14]/45 blur-[1px] cursor-crosshair transition-all animate-dossier-blood-pulse"></button>
                <button type="button" (click)="intensifyDossierEffect($event)" aria-label="Tocar mancha de sangre inferior izquierda" class="absolute bottom-1 left-2 sm:bottom-3 sm:left-4 z-30 w-20 h-14 sm:w-28 sm:h-20 rounded-full bg-[#7a1f1a]/25 hover:bg-[#a01a14]/45 blur-[1px] cursor-crosshair transition-all animate-dossier-blood-pulse"></button>
                <div class="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_62%,rgba(80,7,5,.18)_100%)]"></div>
              }

              <!-- Two Hole Punches at the Top matching the fastener -->
              <div class="relative z-10 w-full flex items-center justify-center gap-8 sm:gap-16 mb-2 sm:mb-4 select-none pointer-events-none">
                <div class="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-[#201813] border border-black/40 shadow-inner"></div>
                <div class="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-[#201813] border border-black/40 shadow-inner"></div>
              </div>

              <div class="case-annotation relative z-10">
                <span>REGISTRO DE CAMPO · {{ char.name }}</span>
                <p>«{{ char.proximitySign }}»</p>
                <small>La evidencia no debe interpretarse fuera del contexto del testimonio. Examina la fotografía con luz UV.</small>
              </div>

              <!-- Sheet Navigation Tabs (Flipping between piled sheets in the dossier) -->
              <div class="relative z-10 flex items-center justify-between border-b-2 border-[#1a1614]/30 pb-2 sm:pb-3 mb-2.5 sm:mb-5 gap-1.5 sm:gap-2">
                <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
                  <button
                    type="button"
                    (click)="setSheet('profile')"
                    [class.bg-[#1a1614]]="activeSheet() === 'profile'"
                    [class.text-[#cfc7b5]]="activeSheet() === 'profile'"
                    [class.bg-black/10]="activeSheet() !== 'profile'"
                    [class.text-[#3d2e24]]="activeSheet() !== 'profile'"
                    class="px-2 sm:px-3.5 py-1 sm:py-1.5 font-special text-[10px] sm:text-xs uppercase tracking-wider rounded-xs border border-[#1a1614]/30 hover:border-[#7a1f1a] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <mat-icon class="text-xs w-3 h-3 sm:w-3.5 sm:h-3.5">assignment</mat-icon>
                    <span><span class="hidden xs:inline sm:inline">Hoja 1: </span>Registro</span>
                  </button>

                  <button
                    type="button"
                    (click)="setSheet('evidence')"
                    [class.bg-[#7a1f1a]]="activeSheet() === 'evidence'"
                    [class.text-white]="activeSheet() === 'evidence'"
                    [class.bg-black/10]="activeSheet() !== 'evidence'"
                    [class.text-[#3d2e24]]="activeSheet() !== 'evidence'"
                    class="px-2 sm:px-3.5 py-1 sm:py-1.5 font-special text-[10px] sm:text-xs uppercase tracking-wider rounded-xs border border-[#1a1614]/30 hover:border-[#a01a14] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <mat-icon class="text-xs w-3 h-3 sm:w-3.5 sm:h-3.5">biotech</mat-icon>
                    <span class="font-bold"><span class="hidden xs:inline sm:inline">Hoja 2: </span>Evidencia</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-[#a01a14] animate-ping ml-0.5"></span>
                  </button>

                  <button
                    type="button"
                    (click)="setSheet('connections')"
                    [class.bg-[#1a1614]]="activeSheet() === 'connections'"
                    [class.text-[#cfc7b5]]="activeSheet() === 'connections'"
                    [class.bg-black/10]="activeSheet() !== 'connections'"
                    [class.text-[#3d2e24]]="activeSheet() !== 'connections'"
                    class="px-2 sm:px-3.5 py-1 sm:py-1.5 font-special text-[10px] sm:text-xs uppercase tracking-wider rounded-xs border border-[#1a1614]/30 hover:border-[#7a1f1a] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <mat-icon class="text-xs w-3 h-3 sm:w-3.5 sm:h-3.5">hub</mat-icon>
                    <span><span class="hidden xs:inline sm:inline">Hoja 3: </span>Red</span>
                  </button>
                </div>

                <!-- Forensic Department Seal -->
                <div class="hidden sm:flex items-center gap-2 text-right">
                  <span
                    class="font-special text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded border uppercase font-bold"
                    [style.borderColor]="categoryColors[char.category].hex"
                    [style.color]="categoryColors[char.category].hex"
                  >
                    {{ categoryColors[char.category].name }}
                  </span>
                </div>
              </div>

              <!-- ══════════ SHEET 1: SUBJECT PROFILE & ADVANCED VISUAL RECORD ══════════ -->
              @if (activeSheet() === 'profile') {
                @let eyeColor = getEyeColor(char);
                @let hasGlitch = isGlitchChar(char);
                @let hasBlood = isBloodChar(char);
                @let hasMist = isSpectralChar(char);

                <div class="space-y-3 sm:space-y-6">
                  <!-- Header: Subject Identity -->
                  <div class="flex items-start justify-between flex-wrap gap-1 sm:gap-2">
                    <div>
                      <div class="inline-block border-2 border-[#7a1f1a] text-[#7a1f1a] font-special px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-xs uppercase tracking-widest font-bold -rotate-1 mb-0.5">
                        SUJETO NO IDENTIFICADO · AÑO: {{ char.year }}
                      </div>
                      <h2 class="font-fell-sc text-xl sm:text-4xl md:text-5xl font-bold tracking-wide text-[#110e0c] leading-tight break-words">
                        {{ char.name }}
                      </h2>
                      <p class="font-special text-xs sm:text-base text-[#7a1f1a] italic mt-0.5">
                        Alias: «{{ char.alias }}»
                      </p>
                    </div>

                    <div class="text-left sm:text-right font-special text-[9px] sm:text-xs text-[#5a4e42]">
                      <div>ORIGEN: {{ char.origin }}</div>
                      <div class="text-[#7a1f1a] font-bold">ESTATUS: ACTIVO</div>
                    </div>
                  </div>

                  <!-- Content Grid: Polaroid & Incident Report -->
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 items-start">
                    <!-- Left: Enhanced Polaroid with Visual FX & UV Blacklight -->
                    <div class="md:col-span-5 flex flex-col items-center">
                      <div
                        class="w-full max-w-[200px] sm:max-w-[260px] md:max-w-[280px] bg-[#110f0d] p-2 sm:p-3 pt-2 sm:pt-3 pb-3 sm:pb-6 shadow-2xl border-2 border-black/80 relative overflow-hidden transition-all duration-300"
                        [class.uv-blacklight]="isUvActive()"
                      >
                        <!-- Pushpin SVG -->
                        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 text-[#7a1f1a] z-30">
                          <svg viewBox="0 0 24 24" class="fill-current drop-shadow-md">
                            <circle cx="12" cy="7" r="5" />
                            <line x1="12" y1="12" x2="12" y2="23" stroke="#1a1412" stroke-width="2" />
                          </svg>
                        </div>

                        <!-- Photograph Frame with Animated Character FX -->
                        <div
                          class="relative w-full aspect-[4/5] bg-[#0d0a09] flex items-center justify-center border border-black/80 overflow-hidden text-[#cfc7b5]/85"
                          [class.shadow-[inset_0_0_30px_rgba(160,26,20,0.5)]]="hasBlood && !isUvActive()"
                          [class.shadow-[inset_0_0_30px_rgba(6,182,212,0.4)]]="hasGlitch && !isUvActive()"
                        >
                          <!-- CRT Scanlines -->
                          <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_3px] pointer-events-none z-10 opacity-75"></div>

                          <!-- Glitch Tracking Scanline -->
                          @if (hasGlitch && !isUvActive()) {
                            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent animate-vhs-scan pointer-events-none z-10"></div>
                          }

                          <!-- Blood Drip Overlay -->
                          @if (hasBlood && !isUvActive()) {
                            <div class="absolute -top-1 inset-x-0 h-8 pointer-events-none z-10 flex justify-around">
                              <span class="w-1.5 bg-[#a01a14] rounded-b-full h-6 animate-blood-creep shadow-[0_0_8px_#a01a14]"></span>
                              <span class="w-2 bg-[#7a1f1a] rounded-b-full h-8 animate-blood-creep shadow-[0_0_8px_#7a1f1a]" style="animation-delay: 0.6s;"></span>
                              <span class="w-1 bg-[#5a1410] rounded-b-full h-5 animate-blood-creep" style="animation-delay: 1.2s;"></span>
                              <span class="w-1.5 bg-[#a01a14] rounded-b-full h-7 animate-blood-creep shadow-[0_0_8px_#a01a14]" style="animation-delay: 0.3s;"></span>
                            </div>
                          }

                          <!-- Spectral Mist -->
                          @if (hasMist && !isUvActive()) {
                            <div class="absolute inset-0 bg-radial from-white/15 via-transparent to-transparent pointer-events-none z-10 animate-mist-drift"></div>
                          }

                          <!-- 5. Real Photo or Silhouette SVG fallback -->
                          @if (getCharacterImage(char.id)) {
                            <img
                              [src]="getCharacterImage(char.id)!"
                              [alt]="char.name"
                              class="absolute inset-0 w-full h-full object-cover relative z-5 transition-transform duration-500 hover:scale-105"
                              [class.animate-char-twitch]="hasGlitch"
                              (error)="onImageError(char.id)"
                            />
                          } @else {
                            <svg
                              viewBox="0 0 100 100"
                              class="w-4/5 h-4/5 relative z-5 transition-transform duration-500 hover:scale-105"
                              [class.animate-char-twitch]="hasGlitch"
                              [innerHTML]="char | characterPortrait"
                            ></svg>
                          }

                          <!-- Demonic Glowing Eyes (only on silhouette) -->
                          @if (eyeColor && !getCharacterImage(char.id) && !isUvActive()) {
                            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
                              <div class="flex items-center gap-3.5 animate-eye-glow" [style.color]="eyeColor">
                                <span class="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
                                <span class="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]"></span>
                              </div>
                            </div>
                          }

                          <!-- UV Blacklight Overlay -->
                          @if (isUvActive()) {
                            <div class="absolute inset-0 z-20 flex flex-col items-center justify-between p-2 sm:p-3 pointer-events-none bg-purple-950/40 backdrop-blur-[0.5px]">
                              <div class="w-full flex items-center justify-between text-[8px] sm:text-[9px] font-mono uv-marking uppercase tracking-widest">
                                <span>ANOMALÍA_UV</span>
                                <span>SIGIL_0x7</span>
                              </div>

                              <div class="text-center my-auto p-1 bg-black/60 border border-purple-500/50 rounded-xs">
                                <p class="font-special text-[11px] sm:text-sm font-bold uv-blood-mark tracking-wider leading-tight">
                                  {{ getUvSecretMessage(char) }}
                                </p>
                                <span class="font-mono text-[8px] sm:text-[9px] uv-marking block mt-1">
                                  {{ getUvCoordinates(char) }}
                                </span>
                              </div>

                              <div class="text-[7px] sm:text-[8px] font-special uv-marking tracking-widest uppercase">
                                [LUZ NEGRA 365nm]
                              </div>
                            </div>
                          }

                          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-10"></div>
                        </div>

                        <!-- Photo Footnote & UV Toggle Button -->
                        <div class="mt-2 sm:mt-3 flex flex-col items-center gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            (click)="toggleUv()"
                            [attr.aria-pressed]="isUvActive()"
                            class="w-full py-1 sm:py-1.5 px-2 sm:px-3 rounded-xs font-special text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-md"
                            [class.bg-[#3b1250]]="isUvActive()"
                            [class.border-[#a855f7]]="isUvActive()"
                            [class.text-[#f3e8ff]]="isUvActive()"
                            [class.bg-[#1f1713]]="!isUvActive()"
                            [class.border-[#543d2f]]="!isUvActive()"
                            [class.text-[#cfc7b5]]="!isUvActive()"
                          >
                            <mat-icon class="text-xs w-3.5 h-3.5" [class.text-[#a855f7]]="isUvActive()">
                              {{ isUvActive() ? 'highlight' : 'flash_on' }}
                            </mat-icon>
                            <span>{{ isUvActive() ? 'Apagar Luz UV' : 'Luz UV Forense' }}</span>
                          </button>
                        </div>
                      </div>

                      <!-- Threat Level meter -->
                      <div class="w-full max-w-[210px] sm:max-w-[260px] md:max-w-[280px] mt-2.5 sm:mt-4 p-2 sm:p-2.5 bg-black/5 border border-black/15 rounded-xs">
                        <div class="flex items-center justify-between text-[11px] sm:text-xs font-special font-bold mb-1 text-[#2a221d]">
                          <span>NIVEL:</span>
                          <span class="text-[#7a1f1a]">CLASE {{ char.threatLevel }}/5</span>
                        </div>
                        <div class="flex items-center gap-1.5 justify-center">
                          @for (drop of [1, 2, 3, 4, 5]; track drop) {
                            <svg viewBox="0 0 24 28" class="w-4 h-5 sm:w-5 sm:h-6">
                              <path
                                d="M12 2 C12 2 5 12 5 18 C5 22.5 8 26 12 26 C16 26 19 22.5 19 18 C19 12 12 2 12 2 Z"
                                [attr.fill]="drop <= char.threatLevel ? '#a01a14' : '#b8af9b'"
                                [attr.stroke]="drop <= char.threatLevel ? '#5a100c' : '#8c8371'"
                                stroke-width="1.5"
                              />
                            </svg>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Right: Narrative Incident Summary in Typewriter Style -->
                    <div class="md:col-span-7 space-y-3 sm:space-y-4">
                      <div class="p-3 sm:p-4 bg-black/5 border-l-4 border-[#7a1f1a] rounded-r-xs">
                        <span class="font-special text-[11px] sm:text-xs uppercase tracking-wider font-bold text-[#7a1f1a] block mb-1">
                          INFORME NARRATIVO Y HECHOS:
                        </span>
                        <p class="font-fell text-sm sm:text-base md:text-lg leading-relaxed text-[#26201b]">
                          {{ char.summary }}
                        </p>
                        @if (char.versionNote) {
                          <p class="font-special text-[11px] mt-3 text-[#675343]">{{ char.versionNote }}</p>
                        }
                        @if (char.sources?.length) {
                          <div class="mt-3 border-t border-black/15 pt-2 font-special text-xs">
                            <span class="block font-bold text-[#7a1f1a] mb-1">REFERENCIAS DEL EXPEDIENTE:</span>
                            @for (source of char.sources; track source.url) {
                              <a [href]="source.url" target="_blank" rel="noopener noreferrer" class="block underline text-[#49392d] py-1">{{ source.label }} ↗</a>
                            }
                          </div>
                        }
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-2.5 sm:p-3 bg-black/5 rounded-xs border border-black/10 font-special text-[11px] sm:text-xs text-[#3d2e24]">
                        <div>
                          <span class="text-[#7a1f1a] font-bold block">PATRÓN DE ACECHO:</span>
                          <span>{{ char.proximitySign }}</span>
                        </div>
                        <div>
                          <span class="text-[#7a1f1a] font-bold block">PARTÍCULAS:</span>
                          <span class="uppercase">{{ char.theme.particles }} (Nivel FX: {{ char.theme.glitchLevel }}/5)</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 pt-1 sm:pt-2">
                        <button
                          type="button"
                          (click)="setSheet('evidence')"
                          class="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-[#7a1f1a] hover:bg-[#a01a14] text-white font-special text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <mat-icon class="text-xs w-4 h-4">biotech</mat-icon>
                          <span>Examinar Pieza de Evidencia</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- ══════════ SHEET 2: UNIQUE ARTIFACT & PHYSICAL EVIDENCE ══════════ -->
              @if (activeSheet() === 'evidence') {
                <div class="space-y-4 sm:space-y-6">
                  <!-- Artifact Header Badge -->
                  <div class="flex items-center justify-between border-b border-[#1a1614]/20 pb-2 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <span class="border border-[#7a1f1a] text-[#7a1f1a] font-special text-[10px] sm:text-xs uppercase px-2 py-0.5 font-bold">
                        {{ char.artifact.badge }}
                      </span>
                      <h3 class="font-fell-sc text-lg sm:text-xl md:text-2xl font-bold text-[#110e0c]">
                        {{ char.artifact.title }}
                      </h3>
                    </div>
                    <span class="font-special text-[11px] sm:text-xs text-[#a01a14] font-bold">
                      TAG: {{ char.artifact.tag }}
                    </span>
                  </div>

                  <!-- TACTILE VISUAL ARTIFACT CONTAINER -->
                  <div
                    class="relative p-3.5 sm:p-5 md:p-7 rounded-xs border-2 shadow-inner overflow-hidden select-none min-h-[220px] sm:min-h-[260px] flex flex-col justify-between"
                    [class.bg-[#120f0d]]="char.artifact.paperStyle === 'glitch' || char.artifact.paperStyle === 'tar'"
                    [class.text-[#cfc7b5]]="char.artifact.paperStyle === 'glitch' || char.artifact.paperStyle === 'tar'"
                    [class.border-[#7a1f1a]]="char.artifact.paperStyle === 'blood' || char.artifact.paperStyle === 'glitch'"
                    [class.bg-[#e0d6c3]]="char.artifact.paperStyle === 'blood' || char.artifact.paperStyle === 'scratches' || char.artifact.paperStyle === 'ashes'"
                    [class.text-[#1a1614]]="char.artifact.paperStyle === 'blood' || char.artifact.paperStyle === 'scratches' || char.artifact.paperStyle === 'ashes'"
                    [class.bg-[#b8c7b5]]="char.artifact.paperStyle === 'mold' || char.artifact.paperStyle === 'water'"
                    [class.text-[#1a1614]]="char.artifact.paperStyle === 'mold' || char.artifact.paperStyle === 'water'"
                  >

                    <!-- Blood Splatters on Paper -->
                    @if (char.artifact.paperStyle === 'blood') {
                      <div class="blood-impact absolute top-3 right-4 w-5 h-7 pointer-events-none"></div>
                      <div class="blood-impact absolute bottom-4 left-3 w-7 h-5 pointer-events-none"></div>
                    }

                    <!-- Glitch Tracking Scanlines -->
                    @if (char.artifact.paperStyle === 'glitch') {
                      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none animate-vhs-scan"></div>
                      <div class="absolute top-2 right-2 text-[9px] sm:text-[10px] font-mono text-emerald-400">
                        ERR_0x7A // CORRUPT
                      </div>
                    }

                    <!-- Forensic Lore Description -->
                    <div class="relative z-10 space-y-1.5 sm:space-y-2">
                      <span class="font-special text-[11px] sm:text-xs uppercase tracking-widest text-[#7a1f1a] font-bold block">
                        ANÁLISIS PERICIAL DE LA PIEZA:
                      </span>
                      <p class="font-fell text-sm sm:text-base md:text-lg leading-relaxed max-w-prose">
                        {{ char.artifact.loreText }}
                      </p>
                    </div>

                    <!-- ════ INTERACTIVE ARTIFACT SPECIAL FEATURES ════ -->
                    <!-- 1. Slender Man: 8 Collectable Rosswood Notes -->
                    @if (char.id === 'slender-man') {
                      <div class="relative z-10 my-3 p-2.5 sm:p-3 bg-black/40 border border-[#cfc7b5]/30 rounded-xs">
                        <div class="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                          <span class="font-special text-[11px] sm:text-xs uppercase tracking-wider text-emerald-400 font-bold">
                            Bocetos de Rosswood: {{ collectedSlenderNotes().length }} / 8 encontrados
                          </span>
                          <span class="font-special text-[10px] sm:text-[11px] text-[#cfc7b5]/70">
                            Toca cada nota para examinar
                          </span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                          @for (note of slenderNotes; track note.id) {
                            @let isCollected = collectedSlenderNotes().includes(note.id);
                            <button
                              type="button"
                              (click)="collectSlenderNote(note.id)"
                              class="p-1.5 sm:p-2 text-left rounded-xs border font-special text-[10px] sm:text-[11px] transition-all cursor-pointer"
                              [class.bg-[#cfc7b5]]="isCollected"
                              [class.text-[#1a1614]]="isCollected"
                              [class.border-[#7a1f1a]]="isCollected"
                              [class.bg-black/60]="!isCollected"
                              [class.text-[#cfc7b5]/60]="!isCollected"
                              [class.border-white/10]="!isCollected"
                            >
                              <div class="font-bold flex items-center justify-between">
                                <span>Nota {{ note.id }}/8</span>
                                @if (isCollected) {
                                  <span class="text-[#a01a14]">✓</span>
                                }
                              </div>
                              <p class="text-[9px] sm:text-[10px] italic mt-0.5 truncate">{{ note.text }}</p>
                            </button>
                          }
                        </div>
                      </div>
                    }

                    <!-- 2. Jeff The Killer: Mirror Blade with Blood Cleaning -->
                    @if (char.id === 'jeff-the-killer') {
                      <div class="relative z-10 my-3 p-2.5 sm:p-3 bg-black/20 border border-[#7a1f1a] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                        <div>
                          <span class="font-special text-[11px] sm:text-xs uppercase font-bold text-[#7a1f1a] block">
                            {{ jeffBloodWiped() ? 'SANGRE RETIRADA: REFLEJO DEL CUCHILLO' : 'MANCHA DE SANGRE VISCOSA BLOQUEANDO EL TEXTO' }}
                          </span>
                          <p class="font-special text-[10px] sm:text-xs text-[#26201b] mt-0.5">
                            {{ jeffBloodWiped() ? '«Se observa la incisión del filo y los dientes tallados con precisión homicida.»' : 'Frotar gasa forense para retirar el plasma seco.' }}
                          </p>
                        </div>
                        <button
                          type="button"
                          (click)="toggleJeffBlood()"
                          class="w-full sm:w-auto px-3 py-1.5 bg-[#7a1f1a] hover:bg-[#a01a14] text-white font-special text-[11px] sm:text-xs uppercase tracking-wider rounded-xs cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-1.5"
                        >
                          <mat-icon class="text-xs">cleaning_services</mat-icon>
                          <span>{{ jeffBloodWiped() ? 'Restaurar' : 'Limpiar sangre' }}</span>
                        </button>
                      </div>
                    }

                    <!-- 3. Unique Hand-Carved or Glitched Sample Phrase -->
                    @if (char.artifact.samplePhrase) {
                      <div class="relative z-10 mt-3 p-2.5 sm:p-3 bg-black/25 border-l-4 border-[#7a1f1a] rounded-r-xs">
                        <span class="font-special text-xs sm:text-base font-bold tracking-wider text-[#a01a14] block">
                          {{ char.artifact.samplePhrase }}
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Next Step Prompt -->
                  <div class="flex items-center justify-between pt-2 gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      (click)="setSheet('profile')"
                      class="font-special text-[11px] sm:text-xs text-[#5a4e42] hover:text-[#1a1614] flex items-center gap-1 cursor-pointer"
                    >
                      <mat-icon class="text-xs">west</mat-icon>
                      <span>Volver al Registro</span>
                    </button>
                    <button
                      type="button"
                      (click)="setSheet('connections')"
                      class="w-full sm:w-auto px-3.5 py-1.5 sm:py-2 bg-[#1a1614] hover:bg-[#7a1f1a] text-white font-special text-[11px] sm:text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Testimonio & Red</span>
                      <mat-icon class="text-xs">east</mat-icon>
                    </button>
                  </div>
                </div>
              }

              <!-- ══════════ SHEET 3: WITNESS TESTIMONY & CONNECTED CASES ══════════ -->
              @if (activeSheet() === 'connections') {
                <div class="space-y-4 sm:space-y-6">
                  <!-- Proximity Signal Block -->
                  <div class="p-3 sm:p-4 bg-[#a01a14]/10 border-l-4 border-[#7a1f1a] rounded-r-xs">
                    <span class="font-special text-[11px] sm:text-xs tracking-wider uppercase font-bold text-[#7a1f1a] block mb-1">
                      Señal de que está cerca (Protocolo de Advertencia):
                    </span>
                    <p class="font-fell text-sm sm:text-base text-[#1a1614] italic">
                      «{{ char.proximitySign }}»
                    </p>
                  </div>

                  <!-- Forensic Hand-written Annotation in Special Elite -->
                  <div class="p-3.5 sm:p-5 bg-black/5 border border-dashed border-[#7a1f1a]/70 rounded-xs relative">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-special text-[10px] sm:text-xs tracking-widest text-[#7a1f1a] uppercase font-bold">
                        Anotación manuscrita del perito:
                      </span>
                      <span class="font-special text-[9px] sm:text-[10px] text-[#5a4e42]">TINTA INDELEBLE</span>
                    </div>
                    <p class="font-special text-xs sm:text-base text-[#7a1f1a] tracking-wide rotate-[-0.5deg]">
                      {{ char.disturbingNote }}
                    </p>
                  </div>

                  <!-- Connected Cases Links (Colored Threads) -->
                  @if (char.connectedIds.length > 0) {
                    <div class="p-3 sm:p-4 bg-[#1a1412] text-[#cfc7b5] rounded-xs border border-[#3d2c21]">
                      <span class="font-special text-[11px] sm:text-xs tracking-wider uppercase text-[#d9a441] block mb-2 font-bold">
                        Hilos directos de la pared de investigación:
                      </span>
                      <div class="flex flex-wrap gap-1.5 sm:gap-2">
                        @for (conId of char.connectedIds; track conId) {
                          <button
                            type="button"
                            (click)="selectConnected(conId)"
                            class="px-2.5 py-1 text-[10px] sm:text-xs font-special uppercase tracking-wider bg-[#261c16] text-[#cfc7b5] hover:bg-[#7a1f1a] hover:text-white transition-colors duration-200 border border-[#7a1f1a]/50 rounded-xs cursor-pointer flex items-center gap-1 focus:outline-none"
                          >
                            <mat-icon class="text-xs w-3 h-3 text-[#a01a14]">timeline</mat-icon>
                            <span>Caso #{{ conId }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Bottom Folder Footer Controls: Prev / Next Case Navigation -->
              <div class="flex items-center justify-between border-t-2 border-[#1a1614]/20 pt-3 sm:pt-4 mt-4 sm:mt-8 gap-2">
                <button
                  type="button"
                  (click)="prevCase()"
                  class="px-2.5 sm:px-3 py-1 sm:py-1.5 font-special text-[11px] sm:text-sm uppercase tracking-wider text-[#1a1614] hover:text-[#7a1f1a] flex items-center gap-1 transition-colors cursor-pointer focus:outline-none"
                >
                  <mat-icon class="text-xs sm:text-sm">west</mat-icon>
                  <span>Anterior</span>
                </button>

                <span class="font-special text-[10px] sm:text-xs text-[#5a4e42] hidden sm:inline">
                  ESC para cerrar
                </span>

                <button
                  type="button"
                  (click)="nextCase()"
                  class="px-2.5 sm:px-3 py-1 sm:py-1.5 font-special text-[11px] sm:text-sm uppercase tracking-wider text-[#1a1614] hover:text-[#7a1f1a] flex items-center gap-1 transition-colors cursor-pointer focus:outline-none"
                >
                  <span>Siguiente</span>
                  <mat-icon class="text-xs sm:text-sm">east</mat-icon>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CaseFile {
  theme = inject(ThemeController);
  private progress = inject(ProgressTracker);
  private audio = inject(AudioEngine);
  private effects = inject(EffectsController);

  readonly categoryColors = CATEGORY_COLORS;
  readonly activeSheet = signal<DossierSheet>('profile');
  readonly isUvActive = signal<boolean>(false);
  readonly dossierEffectIntensity = signal<number>(2);

  // Slender Notes interactive collection
  readonly collectedSlenderNotes = signal<number[]>([]);
  readonly slenderNotes = [
    {id: 1, text: 'ALWAYS WATCHES · NO EYES'},
    {id: 2, text: 'LEAVE ME ALONE'},
    {id: 3, text: 'CAN\'T RUN'},
    {id: 4, text: 'HELP ME'},
    {id: 5, text: 'DON\'T LOOK OR IT TAKES YOU'},
    {id: 6, text: 'FOLLOWS'},
    {id: 7, text: 'NO NO NO NO NO NO'},
    {id: 8, text: 'TREES TREES TREES'},
  ];

  // Jeff mirror wiping
  readonly jeffBloodWiped = signal<boolean>(false);

  setSheet(sheet: DossierSheet): void {
    if (this.activeSheet() !== sheet) {
      this.activeSheet.set(sheet);
      this.audio.playPaperTurn();
      if (sheet === 'evidence') {
        this.audio.playChillingStinger();
      }
    }
  }

  toggleUv(): void {
    const next = !this.isUvActive();
    this.isUvActive.set(next);
    this.audio.playClick();
    if (next) {
      this.audio.playStaticGlitch(0.08);
    }
  }

  collectSlenderNote(id: number): void {
    const current = this.collectedSlenderNotes();
    if (!current.includes(id)) {
      const updated = [...current, id];
      this.collectedSlenderNotes.set(updated);
      this.audio.playPaperTurn();
      if (updated.length === 8) {
        this.effects.triggerGlitch(5, 800);
        this.audio.playStaticGlitch(0.6);
        this.audio.playChillingStinger();
      }
    }
  }

  toggleJeffBlood(): void {
    this.jeffBloodWiped.update(v => !v);
    this.audio.playPaperTurn();
    this.audio.playClick();
  }

  intensifyDossierEffect(event: MouseEvent): void {
    event.stopPropagation();
    this.dossierEffectIntensity.update(value => Math.min(value + 3, 18));
    this.audio.playClick();
    this.audio.playPaperTurn();
  }

  getEffectMarks(count: number): number[] {
    return Array.from({length: count}, (_, index) => index + 1);
  }

  getDossierEffect(char: Character): DossierEffect {
    switch (char.id) {
      case 'jeff-the-killer':
      case 'homicidal-liu':
      case 'smile-dog':
      case 'scp-173':
      case 'el-chupacabras':
        return 'blood';
      case 'slender-man':
      case 'ben-drowned':
      case 'sonic-exe':
      case 'herobrine':
      case 'polybius':
      case 'sad-satan':
      case 'zalgo':
      case 'masky-hoodie':
      case 'candle-cove':
        return 'static';
      case 'la-llorona':
      case 'la-pincoya':
      case 'la-tunda':
      case 'la-viuda':
        return 'water';
      case 'the-rake':
      case 'ticci-toby':
      case 'laughing-jack':
      case 'el-cuco':
      case 'la-mano-peluda':
      case 'siren-head':
        return 'claws';
      case 'eyeless-jack':
        return 'tar';
      case 'bloody-mary':
        return 'mirror';
      case 'backrooms':
      case 'cartoon-cat':
      case 'mr-hands':
      case 'el-trauco':
        return 'mold';
      case 'el-silbon':
      case 'la-sayona':
      case 'el-pombero':
        return 'ashes';
      case 'el-cadejo':
        return 'embers';
      default:
        if (char.theme.particles === 'embers') return 'embers';
        if (char.artifact.paperStyle === 'blood') return 'blood';
        if (char.artifact.paperStyle === 'water') return 'water';
        if (char.artifact.paperStyle === 'scratches') return 'claws';
        if (char.artifact.paperStyle === 'tar') return 'tar';
        if (char.artifact.paperStyle === 'mold') return 'mold';
        if (char.artifact.paperStyle === 'ashes') return 'ashes';
        if (char.artifact.paperStyle === 'glitch') return 'static';
        return 'spectral';
    }
  }

  selectConnected(id: string): void {
    this.theme.selectConnectedCharacter(id);
    this.resetState();
    this.audio.playFolderOpen();
  }

  prevCase(): void {
    this.theme.selectPrevCharacter();
    this.resetState();
    this.audio.playFolderOpen();
  }

  nextCase(): void {
    this.theme.selectNextCharacter();
    this.resetState();
    this.audio.playFolderOpen();
  }

  private resetState(): void {
    this.activeSheet.set('profile');
    this.isUvActive.set(false);
    this.jeffBloodWiped.set(false);
    this.dossierEffectIntensity.set(2);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.theme.selectedCharacter()) {
      this.close();
    }
  }

  close(): void {
    const char = this.theme.selectedCharacter();
    if (char) {
      this.progress.markCharacterReviewed(char.id);
    }
    this.theme.selectCharacter(null);
    this.resetState();
    this.audio.playPaperTurn();
  }

  isGlitchChar(char: Character): boolean {
    return (
      char.theme.particles === 'static' ||
      char.artifact.paperStyle === 'glitch' ||
      char.theme.glitchLevel >= 4 ||
      char.id.includes('slender') ||
      char.id.includes('sonic') ||
      char.id.includes('ben')
    );
  }

  isBloodChar(char: Character): boolean {
    return (
      char.artifact.paperStyle === 'blood' ||
      char.theme.particles === 'blood_mist' ||
      char.id.includes('jeff') ||
      char.id.includes('smile') ||
      char.id.includes('jack') ||
      char.id.includes('chupacabra')
    );
  }

  isSpectralChar(char: Character): boolean {
    return (
      char.theme.particles === 'fog' ||
      char.artifact.paperStyle === 'water' ||
      char.artifact.paperStyle === 'ashes' ||
      char.category === 'latin' ||
      char.category === 'liminal'
    );
  }

  getEyeColor(char: Character): string | null {
    if (char.signature && !['jeff-the-killer', 'sonic-exe', 'smile-dog', 'ben-drowned'].includes(char.id)) return null;
    if (['eyeless-jack', 'lulu', 'slender-man', 'masky', 'hoodie', 'skully', 'splendorman', 'offenderman'].includes(char.id)) return null;
    if (char.id.includes('jeff') || char.id.includes('sonic') || char.id.includes('smile')) {
      return '#ff2222';
    }
    if (char.id.includes('ben') || char.id.includes('smiler')) {
      return '#06b6d4';
    }
    if (char.id.includes('herobrine') || char.id.includes('rake') || char.id.includes('eyeless')) {
      return '#ffffff';
    }
    if (char.category === 'latin') {
      return '#f59e0b';
    }
    if (char.category === 'liminal') {
      return '#a855f7';
    }
    return '#e11d48';
  }

  getUvSecretMessage(char: Character): string {
    if (char.id === 'slender-man') return '«NO TIENE ROSTRO · ÉL CONTROLA EL BOSQUE»';
    if (char.id === 'jeff-the-killer') return '«GO TO SLEEP · SHHH... NO MIRES AL ESPEJO»';
    if (char.id === 'ben-drowned') return '«YOU SHOULDN\'T HAVE DONE THAT · AHOGADO EN EL CÓDIGO»';
    if (char.id === 'sonic-exe') return '«I AM GOD · NO HAY SALVACIÓN EN ESTE CARTUCHO»';
    if (char.id === 'smile-dog') return '«SPREAD THE WORD · MORDEDURA MORTAL»';
    if (char.id === 'la-llorona') return '«¿DÓNDE ESTÁN? · SUS ALMAS DUERMEN BAJO EL AGUA»';
    if (char.id === 'el-silbon') return '«1-2-3-4-5-6-7 · SI LO ESCUCHAS LEJOS ESTÁ DETRÁS»';
    if (char.id === 'scp-173') return '«CONTACTO VISUAL ININTERRUMPIDO · NO PESTAÑEES»';
    if (char.id === 'herobrine') return '«REMOVED HEROBRINE · EL MUNDO ESTÁ CORROMPIDO»';
    return `«ANOMALÍA #0x${char.threatLevel} · RASTRO BIOLÓGICO INDELEBLE»`;
  }

  getUvCoordinates(char: Character): string {
    return `COORD: 47°18'N 122°08'W // SIGIL_${char.category.toUpperCase()}`;
  }

  private readonly imageMap = CHARACTER_IMAGE_MAP;
  private readonly brokenImages = new Set<string>();

  getCharacterImage(id: string): string | null {
    if (this.brokenImages.has(id)) return null;
    return this.imageMap[id] ?? null;
  }

  onImageError(id: string): void {
    this.brokenImages.add(id);
  }
}
