import {Injectable, inject, signal} from '@angular/core';
import {EffectsController} from './effects';

@Injectable({
  providedIn: 'root',
})
export class FlashlightController {
  private effects = inject(EffectsController);

  readonly targetX = signal<number>(50); // percentage or pixels
  readonly targetY = signal<number>(50);
  readonly currentX = signal<number>(50);
  readonly currentY = signal<number>(50);

  private rafId: number | null = null;
  private currentPxX = 0;
  private currentPxY = 0;
  private targetPxX = 0;
  private targetPxY = 0;
  private lastMoveTime = 0;
  private isMobile = false;

  init(): void {
    if (typeof window === 'undefined') return;

    this.isMobile = window.innerWidth < 768;
    this.targetPxX = window.innerWidth / 2;
    this.targetPxY = window.innerHeight / 2;
    this.currentPxX = this.targetPxX;
    this.currentPxY = this.targetPxY;
    this.lastMoveTime = performance.now();

    window.addEventListener('mousemove', this.handleMouseMove, {passive: true});
    window.addEventListener('touchmove', this.handleTouchMove, {passive: true});
    window.addEventListener('touchstart', this.handleTouchMove, {passive: true});

    this.loop();
  }

  destroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchstart', this.handleTouchMove);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.targetPxX = e.clientX;
    this.targetPxY = e.clientY;
    this.lastMoveTime = performance.now();
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.targetPxX = e.touches[0].clientX;
      this.targetPxY = e.touches[0].clientY;
      this.lastMoveTime = performance.now();
    }
  };

  private loop = (): void => {
    const now = performance.now();
    const idleTime = now - this.lastMoveTime;

    // Organic breathing jitter / idle drift if idle for > 2 seconds
    let jitterX = 0;
    let jitterY = 0;
    if (idleTime > 2000 && !this.effects.reducedEffects()) {
      const t = now * 0.0015;
      jitterX = Math.sin(t) * 12 + Math.cos(t * 1.7) * 6;
      jitterY = Math.cos(t * 1.2) * 10 + Math.sin(t * 0.9) * 5;
    }

    // Smooth lerp (inertia)
    const factor = this.effects.reducedEffects() ? 0.35 : 0.14;
    this.currentPxX += (this.targetPxX + jitterX - this.currentPxX) * factor;
    this.currentPxY += (this.targetPxY + jitterY - this.currentPxY) * factor;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--flashlight-x', `${Math.round(this.currentPxX)}px`);
      root.style.setProperty('--flashlight-y', `${Math.round(this.currentPxY)}px`);
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}
