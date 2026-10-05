import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {SideDotsNav, SectionId} from './components/side-dots-nav';
import {FilmOverlay} from './components/film-overlay';
import {GlitchLayer} from './components/glitch-layer';
import {SubliminalFlash} from './components/subliminal-flash';
import {WarningDialog} from './components/warning-dialog';
import {ControlsBar} from './components/controls-bar';
import {ArchiveSection} from './components/archive-section';
import {RitualsSection} from './components/rituals-section';
import {TerminalSection} from './components/terminal-section';
import {CaseFile} from './components/case-file';
import {SanityHud} from './components/sanity-hud';
import {HallucinationOverlay} from './components/hallucination-overlay';
import {FlashlightController} from './services/flashlight';
import {ThemeController} from './services/theme';
import {EffectsController} from './services/effects';
import {SanityController} from './services/sanity';
import {AudioEngine} from './services/audio-engine';
import {GameRoom} from './components/game-room';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SideDotsNav,
    FilmOverlay,
    GlitchLayer,
    SubliminalFlash,
    WarningDialog,
    ControlsBar,
    ArchiveSection,
    RitualsSection,
    TerminalSection,
    CaseFile,
    SanityHud,
    HallucinationOverlay,
    GameRoom,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  readonly standaloneGame = new URLSearchParams(window.location.search).get('play') === '1';
  flashlight = inject(FlashlightController);
  theme = inject(ThemeController);
  effects = inject(EffectsController);
  sanity = inject(SanityController);
  audio = inject(AudioEngine);

  @ViewChild('scrollContainer')
  scrollContainerRef!: ElementRef<HTMLDivElement>;

  readonly activeSection = signal<SectionId>('informacion');

  private observer: IntersectionObserver | null = null;
  private hasInteracted = false;

  ngOnInit(): void {
    if (!this.standaloneGame) this.flashlight.init();
  }

  ngAfterViewInit(): void {
    if (!this.standaloneGame) {
      this.setupIntersectionObserver();
      if (window.location.hash === '#juego') setTimeout(() => this.scrollToSection('juego'));
    }
  }

  ngOnDestroy(): void {
    if (!this.standaloneGame) this.flashlight.destroy();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('document:click')
  @HostListener('document:touchstart')
  onFirstUserInteraction(): void {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      if (this.audio.isEnabled() && !this.audio.isMusicPlaying()) {
        this.audio.startAmbientMusic();
      }
    }
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined') return;

    const options: IntersectionObserverInit = {
      root: this.scrollContainerRef.nativeElement,
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id as SectionId;
          if (id && id !== this.activeSection()) {
            this.activeSection.set(id);
            this.sanity.drainSanity(2.5, 'Transición de sección');
          }
        }
      }
    }, options);

    const sections = this.scrollContainerRef.nativeElement.querySelectorAll('.horror-section');
    sections.forEach((sec) => this.observer?.observe(sec));
  }

  scrollToSection(id: SectionId): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({behavior: 'smooth'});
      this.activeSection.set(id);
      this.sanity.drainSanity(2.0, 'Navegación manual');
    }
  }
}
