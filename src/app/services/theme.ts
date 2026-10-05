import {Injectable, inject, signal} from '@angular/core';
import {Character, CharacterTheme, CHARACTERS} from '../data/characters.data';
import {AudioEngine} from './audio-engine';

export const DEFAULT_THEME: CharacterTheme = {
  scene: 'forest',
  accentColor: '#7a1f1a',
  particles: 'fog',
  glitchLevel: 1,
  fogDensity: 0.6,
  flashlightColor: 'rgba(217, 164, 65, 0.22)',
  droneFreq: 55,
};

@Injectable({
  providedIn: 'root',
})
export class ThemeController {
  private audio = inject(AudioEngine);

  readonly activeTheme = signal<CharacterTheme>(DEFAULT_THEME);
  readonly selectedCharacter = signal<Character | null>(null);
  readonly hoveredCharacter = signal<Character | null>(null);

  setHoverCharacter(character: Character | null): void {
    this.hoveredCharacter.set(character);
    if (!this.selectedCharacter()) {
      if (character) {
        this.applyTheme(character.theme, false);
      } else {
        this.applyTheme(DEFAULT_THEME, false);
      }
    }
  }

  selectCharacter(character: Character | null): void {
    this.selectedCharacter.set(character);
    if (character) {
      this.applyTheme(character.theme, true);
    } else if (this.hoveredCharacter()) {
      this.applyTheme(this.hoveredCharacter()!.theme, false);
    } else {
      this.applyTheme(DEFAULT_THEME, false);
    }
  }

  selectNextCharacter(): void {
    const current = this.selectedCharacter();
    if (!current) return;
    const idx = CHARACTERS.findIndex(c => c.id === current.id);
    const nextIdx = (idx + 1) % CHARACTERS.length;
    this.selectCharacter(CHARACTERS[nextIdx]);
  }

  selectPrevCharacter(): void {
    const current = this.selectedCharacter();
    if (!current) return;
    const idx = CHARACTERS.findIndex(c => c.id === current.id);
    const prevIdx = (idx - 1 + CHARACTERS.length) % CHARACTERS.length;
    this.selectCharacter(CHARACTERS[prevIdx]);
  }

  selectConnectedCharacter(id: string): void {
    const found = CHARACTERS.find(c => c.id === id);
    if (found) {
      this.selectCharacter(found);
    }
  }

  private applyTheme(theme: CharacterTheme, isModalOpen: boolean): void {
    this.activeTheme.set(theme);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--scene-accent', theme.accentColor);
      root.style.setProperty('--flashlight-color', theme.flashlightColor);
    }
    this.audio.updateDroneFrequency(theme.droneFreq);
    if (isModalOpen) {
      this.audio.playFolderOpen();
      this.audio.playChillingStinger();
    }
  }
}
