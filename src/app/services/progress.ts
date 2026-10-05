import {Injectable, signal} from '@angular/core';

export interface MazeHighScore {
  timeSeconds: number;
  difficulty: 'easy' | 'normal' | 'nightmare';
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProgressTracker {
  readonly reviewedCharacterIds = signal<Set<string>>(new Set());
  readonly completedRitualIds = signal<Set<string>>(new Set());
  readonly bestScores = signal<Record<string, number>>({});

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedChars = localStorage.getItem('archivo_olvidado_reviewed_chars');
      if (savedChars) {
        this.reviewedCharacterIds.set(new Set(JSON.parse(savedChars)));
      }

      const savedRituals = localStorage.getItem('archivo_olvidado_rituals');
      if (savedRituals) {
        this.completedRitualIds.set(new Set(JSON.parse(savedRituals)));
      }

      const savedScores = localStorage.getItem('archivo_olvidado_maze_scores');
      if (savedScores) {
        this.bestScores.set(JSON.parse(savedScores));
      }
    } catch (e: unknown) {
      void e;
    }
  }

  markCharacterReviewed(id: string): void {
    const current = new Set(this.reviewedCharacterIds());
    if (!current.has(id)) {
      current.add(id);
      this.reviewedCharacterIds.set(current);
      try {
        localStorage.setItem(
          'archivo_olvidado_reviewed_chars',
          JSON.stringify(Array.from(current))
        );
      } catch (e: unknown) {
        void e;
      }
    }
  }

  markRitualCompleted(id: string): void {
    const current = new Set(this.completedRitualIds());
    if (!current.has(id)) {
      current.add(id);
      this.completedRitualIds.set(current);
      try {
        localStorage.setItem(
          'archivo_olvidado_rituals',
          JSON.stringify(Array.from(current))
        );
      } catch (e: unknown) {
        void e;
      }
    }
  }

  saveMazeScore(difficulty: string, timeSeconds: number): boolean {
    const current = {...this.bestScores()};
    const prev = current[difficulty];
    let isNewRecord = false;

    if (prev === undefined || timeSeconds < prev) {
      current[difficulty] = timeSeconds;
      this.bestScores.set(current);
      isNewRecord = true;
      try {
        localStorage.setItem('archivo_olvidado_maze_scores', JSON.stringify(current));
      } catch (e: unknown) {
        void e;
      }
    }
    return isNewRecord;
  }
}
