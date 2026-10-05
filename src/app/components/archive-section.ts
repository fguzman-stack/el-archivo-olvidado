import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CHARACTERS, Character, CATEGORY_COLORS} from '../data/characters.data';
import {CHARACTER_IMAGE_MAP} from '../data/character-images.data';
import {ThemeController} from '../services/theme';
import {ProgressTracker} from '../services/progress';
import {AudioEngine} from '../services/audio-engine';
import {SanityController} from '../services/sanity';
import {BloodDrip} from './blood-drip';
import {MatIconModule} from '@angular/material/icon';
import {CharacterAtmosphere} from './character-atmosphere';
import {CharacterPortraitPipe} from './character-portrait.pipe';

@Component({
  selector: 'app-archive-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BloodDrip, MatIconModule, CharacterAtmosphere, CharacterPortraitPipe],
  template: `
    <section
      id="informacion"
      class="horror-section w-full h-screen relative bg-[#0d0b09] overflow-hidden flex flex-col"
      aria-label="Archivo de Evidencias y Personajes"
    >
      <!-- Viscous blood drip from top border -->
      <app-blood-drip />

      <!-- Top Header & Typewriter Search Paper -->
      <header class="relative z-30 pt-16 sm:pt-14 md:pt-8 pb-2 sm:pb-3 px-3 sm:px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#7a1f1a]/30 bg-gradient-to-b from-[#0a0908]/95 via-[#0a0908]/80 to-transparent">
        <div>
          <div class="flex items-center gap-1.5 text-[#7a1f1a]">
            <mat-icon class="text-xs sm:text-sm">folder_open</mat-icon>
            <span class="font-special text-[10px] sm:text-xs uppercase tracking-widest text-[#a01a14]">
              DEPARTAMENTO FORENSE · ARCHIVO PARANORMAL
            </span>
          </div>
          <h1 class="font-fell-sc text-xl sm:text-2xl md:text-4xl text-[#cfc7b5] tracking-wide mt-0.5">
            EL ARCHIVO OLVIDADO
          </h1>
          <p class="font-fell text-[11px] sm:text-xs md:text-sm text-[#cfc7b5]/70 italic mt-0.5 hidden xs:block sm:block">
            Pared de investigación central. Explora las evidencias Polaroid bajo la penumbra.
          </p>
        </div>

        <!-- Typewriter search paper -->
        <div class="relative aged-paper px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-md border border-[#7a1f1a]/40 rounded-xs flex items-center gap-2 max-w-full sm:max-w-sm w-full -rotate-0.5 sm:-rotate-1">
          <mat-icon class="text-xs sm:text-base text-[#7a1f1a]">search</mat-icon>
          <input
            type="text"
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            placeholder="Buscar en el archivo..."
            class="bg-transparent border-none outline-none font-special text-xs sm:text-sm text-[#1a1614] placeholder:text-[#5a4e42] w-full"
            aria-label="Buscar expediente de personaje"
          />
          @if (searchTerm()) {
            <button
              type="button"
              (click)="clearSearch()"
              aria-label="Limpiar búsqueda"
              class="text-xs text-[#7a1f1a] hover:text-black font-special p-0.5 cursor-pointer"
            >
              ✕
            </button>
          }
        </div>
      </header>

      <!-- Category Legend Indicator Pins -->
      <div class="relative z-20 px-3 sm:px-6 md:px-12 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-4 md:gap-6 text-[10px] sm:text-xs font-special text-[#cfc7b5]/80 bg-[#0a0908]/40 border-b border-white/5 overflow-x-auto scrollbar-none whitespace-nowrap">
        <span class="text-[#cfc7b5]/50 uppercase tracking-widest text-[9px] sm:text-[11px] shrink-0">Hilos:</span>
        <div class="flex items-center gap-1 shrink-0">
          <span class="w-2.5 h-2.5 rounded-full bg-[#7a1f1a] border border-[#a01a14] inline-block shadow-[0_0_4px_#7a1f1a]"></span>
          <span>Internet</span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="w-2.5 h-2.5 rounded-full bg-[#3b4a3a] border border-[#526850] inline-block shadow-[0_0_4px_#3b4a3a]"></span>
          <span>Juegos</span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="w-2.5 h-2.5 rounded-full bg-[#cfc7b5] border border-white inline-block shadow-[0_0_4px_#ffffff]"></span>
          <span>Liminal/SCP</span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="w-2.5 h-2.5 rounded-full bg-[#d9a441] border border-[#ffd175] inline-block shadow-[0_0_4px_#d9a441]"></span>
          <span>Leyendas</span>
        </div>
        <div class="ml-auto font-special text-[9px] sm:text-[11px] text-[#cfc7b5]/60 flex items-center gap-1.5 shrink-0 pl-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#a01a14] animate-ping"></span>
          <span>{{ filteredCharacters().length }} / {{ characters.length }}</span>
        </div>
      </div>

      <!-- Massive Evidence Corkboard Canvas / Scrollable Wall -->
      <div
        class="relative flex-1 overflow-auto p-2.5 sm:p-6 md:p-12 scrollbar-thin select-none"
        style="background-color: #120f0d; background-image: radial-gradient(#1f1a16 1.5px, transparent 1.5px), radial-gradient(#241e19 1px, #120f0d 1px); background-size: 32px 32px; background-position: 0 0, 16px 16px;"
      >
        <!-- Faint handprints and dried blood stains embedded in the wall -->
        <div class="absolute top-1/4 left-1/5 w-64 h-64 bg-[#7a1f1a]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#7a1f1a]/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- The Evidence Wall Grid of Enhanced Polaroids -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-8 max-w-7xl mx-auto py-2 sm:py-4 pb-24 sm:pb-24">
          @for (char of filteredCharacters(); track char.id) {
            @let isMatch = isCharacterMatch(char);
            @let isReviewed = progress.reviewedCharacterIds().has(char.id);
            @let eyeColor = getEyeColor(char);
            @let hasGlitch = isGlitchChar(char);
            @let hasBlood = isBloodChar(char);
            @let hasMist = isSpectralChar(char);

            <article
              (mouseenter)="onHover(char)"
              (focus)="onHover(char)"
              (blur)="onLeave()"
              (mouseleave)="onLeave()"
              (click)="openCase(char)"
              [class.opacity-30]="!isMatch"
              [class.pointer-events-none]="!isMatch"
              class="group relative bg-[#cfc7b5] p-1.5 sm:p-2.5 pb-2 sm:pb-3 shadow-[2px_4px_12px_rgba(0,0,0,0.95)] sm:shadow-[3px_6px_20px_rgba(0,0,0,0.95)] border border-[#a89f8d] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(160,26,20,0.6)] cursor-pointer rounded-xs"
              [style.transform]="'rotate(' + getRotation(char.id) + 'deg)'"
              tabindex="0"
              (keydown.enter)="openCase(char)"
              [attr.aria-label]="'Abrir expediente de ' + char.name"
            >
              <!-- Pushpin Header with colored category thread origin -->
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <svg viewBox="0 0 24 24" class="w-5 h-5 drop-shadow-lg" [style.color]="categoryColors[char.category].hex">
                  <circle cx="12" cy="7" r="5" fill="currentColor" stroke="#0a0908" stroke-width="1.2" />
                  <line x1="12" y1="12" x2="12" y2="23" stroke="#1a1614" stroke-width="2" />
                </svg>
              </div>

              <!-- Corner burnt texture on paper -->
              <div class="absolute top-0 right-0 w-3 h-3 bg-gradient-to-bl from-black/60 to-transparent pointer-events-none"></div>

              <!-- Polaroid Silhouette Photo Container with Rich Visual Effects -->
              <div
                class="relative w-full aspect-[4/5] bg-[#0c0908] flex items-center justify-center border-2 border-black/80 overflow-hidden text-[#cfc7b5]/85 group-hover:text-white transition-colors"
                [class.shadow-[inset_0_0_20px_rgba(160,26,20,0.4)]]="hasBlood"
                [class.shadow-[inset_0_0_20px_rgba(6,182,212,0.3)]]="hasGlitch"
              >
                <!-- 1. CRT Scanlines & Grain Background -->
                <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_3px] pointer-events-none z-10 opacity-70"></div>

                <!-- 2. Glitch Static Scanlines / Twitch Layer -->
                @if (hasGlitch) {
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-vhs-scan pointer-events-none z-10"></div>
                  <div class="absolute top-1 right-1 text-[8px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    ERR_0x9
                  </div>
                }

                <!-- 3. Viscous Blood Drips on Photo Lens -->
                @if (hasBlood) {
                  <div class="absolute -top-1 inset-x-0 h-6 pointer-events-none z-10 flex justify-around">
                    <span class="w-1 bg-[#a01a14] rounded-b-full h-4 animate-blood-creep shadow-[0_0_6px_#a01a14]"></span>
                    <span class="w-1.5 bg-[#7a1f1a] rounded-b-full h-5.5 animate-blood-creep shadow-[0_0_6px_#7a1f1a]" style="animation-delay: 0.8s;"></span>
                    <span class="w-0.5 bg-[#5a1410] rounded-b-full h-3 animate-blood-creep" style="animation-delay: 1.4s;"></span>
                    <span class="w-1 bg-[#a01a14] rounded-b-full h-4.5 animate-blood-creep shadow-[0_0_6px_#a01a14]" style="animation-delay: 0.4s;"></span>
                  </div>
                }

                <!-- 4. Spectral Mist / Floating Ectoplasm -->
                @if (hasMist) {
                  <div class="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent pointer-events-none z-10 animate-mist-drift"></div>
                }

                <!-- 5. Character Image (real photo) with SVG silhouette fallback -->
                @if (getCharacterImage(char.id)) {
                  <img
                    [src]="getCharacterImage(char.id)!"
                    [alt]="char.name"
                    loading="lazy"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 z-5"
                    [class.animate-char-twitch]="hasGlitch"
                    (error)="onImageError($event, char)"
                  />
                } @else {
                  <svg
                    viewBox="0 0 100 100"
                    class="w-4/5 h-4/5 transition-transform duration-500 group-hover:scale-110 relative z-5"
                    [class.animate-char-twitch]="hasGlitch"
                    [innerHTML]="char | characterPortrait"
                  ></svg>
                }

                <!-- 6. Demonic Glowing Eyes Overlay (For silhouette fallback, intensifies on hover) -->
                @if (eyeColor && !getCharacterImage(char.id)) {
                  <div
                    class="absolute inset-0 flex items-center justify-center pointer-events-none z-15 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <!-- Two piercing eye dots with animated glow pulse -->
                    <div class="flex items-center gap-2.5 sm:gap-3 animate-eye-glow" [style.color]="eyeColor">
                      <span class="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                      <span class="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                    </div>
                  </div>
                }

                @if (theme.hoveredCharacter()?.id === char.id) {
                  <app-character-atmosphere [signature]="char.signature" [compact]="true" [seed]="char.id.length" />
                }

                <!-- 7. Dark Vignette overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none z-10"></div>

                <!-- Threat level badge (blood drops) in bottom corner of photo -->
                <div class="absolute bottom-1 right-1 flex items-center gap-0.5 pointer-events-none z-20">
                  @for (drop of [1, 2, 3, 4, 5]; track drop) {
                    @if (drop <= char.threatLevel) {
                      <span class="w-1.5 h-1.5 rounded-full bg-[#a01a14] shadow-[0_0_4px_#a01a14]"></span>
                    }
                  }
                </div>

                <!-- Reviewed stamp on the Polaroid photo -->
                @if (isReviewed) {
                  <div
                    class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 border border-[#7a1f1a] text-[#a01a14] font-special text-[7px] sm:text-[8px] uppercase tracking-widest px-1 py-0.2 rotate-[-12deg] bg-black/70 pointer-events-none font-bold z-20 shadow-md"
                  >
                    REVISADO
                  </div>
                }

                <!-- Subtle hover prompt overlay -->
                <div class="absolute inset-x-0 bottom-0 sm:bottom-1 text-center font-special text-[8px] sm:text-[9px] text-[#cfc7b5]/90 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 bg-black/75 py-0.5">
                  VER EXPEDIENTE
                </div>
              </div>

              <!-- Handwritten Polaroid Label -->
              <div class="mt-1.5 sm:mt-2.5 px-0.5 text-center">
                <h3 class="font-special text-[11px] sm:text-xs md:text-sm font-bold text-[#1a1614] truncate tracking-tight group-hover:text-[#7a1f1a] transition-colors leading-snug">
                  {{ char.name }}
                </h3>
                <p class="font-special text-[9px] sm:text-[10px] text-[#7a1f1a] truncate italic">
                  {{ char.alias }}
                </p>
                <div class="mt-0.5 sm:mt-1 flex items-center justify-between text-[8px] sm:text-[9px] font-special text-[#5a4e42] border-t border-[#1a1614]/15 pt-0.5 sm:pt-1">
                  <span>{{ char.year }}</span>
                  <span class="uppercase font-bold text-[#7a1f1a]">CLASE {{ char.threatLevel }}</span>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ArchiveSection {
  theme = inject(ThemeController);
  progress = inject(ProgressTracker);
  private audio = inject(AudioEngine);
  private sanity = inject(SanityController);

  readonly characters = CHARACTERS;
  readonly categoryColors = CATEGORY_COLORS;
  searchTerm = signal<string>('');

  filteredCharacters = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.characters;
    return this.characters.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.alias.toLowerCase().includes(term) ||
        c.origin.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  });

  isCharacterMatch(char: Character): boolean {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return true;
    return (
      char.name.toLowerCase().includes(term) ||
      char.alias.toLowerCase().includes(term) ||
      char.origin.toLowerCase().includes(term) ||
      char.category.toLowerCase().includes(term)
    );
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
      return '#ff2222'; // Blood red
    }
    if (char.id.includes('ben') || char.id.includes('smiler')) {
      return '#06b6d4'; // Corrupted cyan
    }
    if (char.id.includes('herobrine') || char.id.includes('rake') || char.id.includes('eyeless')) {
      return '#ffffff'; // Piercing white
    }
    if (char.category === 'latin') {
      return '#f59e0b'; // Amber spirit
    }
    if (char.category === 'liminal') {
      return '#a855f7'; // Liminal purple
    }
    return '#e11d48';
  }

  private readonly imageMap = CHARACTER_IMAGE_MAP;
  /** IDs whose image failed to load – renders SVG fallback */
  private readonly brokenImages = new Set<string>();

  getCharacterImage(id: string): string | null {
    if (this.brokenImages.has(id)) return null;
    return this.imageMap[id] ?? null;
  }

  onImageError(event: Event, char: Character): void {
    this.brokenImages.add(char.id);
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getRotation(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return ((hash % 10) - 5) * 0.7; // subtle rotation between -3.5 and +3.5 deg
  }

  onSearchInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.audio.playTypewriterKey();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.audio.playClick();
  }

  onHover(char: Character): void {
    this.theme.setHoverCharacter(char);
    this.audio.playCharacterProximityWhisper();
  }

  onLeave(): void {
    this.theme.setHoverCharacter(null);
  }

  openCase(char: Character): void {
    this.theme.selectCharacter(char);
    this.progress.markCharacterReviewed(char.id);
    this.sanity.drainSanity(2 + char.threatLevel * 0.8, `Expediente de ${char.name}`);
  }
}
