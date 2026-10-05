import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {GameEngine} from '../services/game-engine';
import {ProgressTracker} from '../services/progress';
import {EffectsController} from '../services/effects';
import {MatIconModule} from '@angular/material/icon';

interface RayHit {
  x: number;
  y: number;
  dist: number;
  vertical: boolean;
}

interface Projection {
  x: number;
  size: number;
  dist: number;
}

@Component({
  selector: 'app-maze-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="w-full h-full flex flex-col justify-between p-2 md:p-3 relative select-none bg-black">
      <div class="flex items-center justify-between font-mono text-[10px] md:text-xs text-red-400 border-b border-red-950 pb-1 shrink-0">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
          <span>CAM_03 // TUNEL_OS 3D</span>
        </div>
        <div class="flex items-center gap-3">
          <span>TIEMPO: {{ engine.gameTime() }}s</span>
          @if (engine.hasKey()) {
            <span class="text-amber-300 font-bold flex items-center gap-0.5">
              <mat-icon class="text-[12px] w-3 h-3">key</mat-icon> LLAVE
            </span>
          }
        </div>
      </div>

      <div class="relative flex-1 flex items-center justify-center my-1 overflow-hidden bg-black">
        <canvas
          #gameCanvas
          width="640"
          height="360"
          class="w-full h-full object-contain rounded-xs bg-black cursor-crosshair"
        ></canvas>

        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,transparent_32%,rgba(0,0,0,.55)_65%,rgba(0,0,0,.92)_100%)] mix-blend-multiply"></div>
        <div class="absolute inset-0 pointer-events-none opacity-35 bg-[linear-gradient(rgba(255,0,0,.04)_50%,rgba(0,0,0,.18)_50%)] bg-[length:100%_3px]"></div>

        @if (engine.status() === 'TITLE') {
          <div class="absolute inset-0 bg-black/92 flex flex-col items-center justify-center p-2 sm:p-4 text-center z-20 space-y-2 sm:space-y-3 font-mono">
            <h3 class="text-base sm:text-xl md:text-2xl text-red-500 font-bold tracking-[0.25em] animate-pulse">
              CORREDOR 13
            </h3>
            <p class="text-[10px] sm:text-xs text-zinc-400 max-w-sm leading-tight sm:leading-relaxed">
              Simulación 3D recuperada del mainframe. Encuentra la llave, abre la salida y no mires demasiado tiempo a la cosa del fondo.
            </p>
            <div class="flex items-center gap-1 p-0.5 sm:p-1 bg-zinc-950 border border-red-950 rounded-sm">
              <button type="button" (click)="engine.setDifficulty('easy')" [class.bg-red-900]="engine.difficulty() === 'easy'" [class.text-white]="engine.difficulty() === 'easy'" class="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] text-zinc-400 rounded-xs cursor-pointer transition-colors">Fácil</button>
              <button type="button" (click)="engine.setDifficulty('normal')" [class.bg-red-900]="engine.difficulty() === 'normal'" [class.text-white]="engine.difficulty() === 'normal'" class="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] text-zinc-400 rounded-xs cursor-pointer transition-colors">Normal</button>
              <button type="button" (click)="engine.setDifficulty('nightmare')" [class.bg-red-800]="engine.difficulty() === 'nightmare'" [class.text-white]="engine.difficulty() === 'nightmare'" class="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] text-zinc-400 rounded-xs cursor-pointer transition-colors">Pesadilla</button>
            </div>
            <button type="button" (click)="engine.startNewGame()" class="px-4 py-1.5 sm:px-6 sm:py-2 bg-red-800 hover:bg-red-700 active:bg-red-950 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-[0_0_24px_rgba(127,29,29,.75)] flex items-center gap-1">
              <mat-icon class="text-xs sm:text-sm">visibility</mat-icon>
              <span>ENTRAR</span>
            </button>
            @if (bestTime() !== null) {
              <div class="text-[9px] sm:text-[10px] text-zinc-500">Récord: {{ bestTime() }}s</div>
            }
          </div>
        }

        @if (engine.status() === 'WON') {
          <div class="absolute inset-0 bg-black/92 flex flex-col items-center justify-center p-2 sm:p-4 text-center z-20 space-y-1.5 sm:space-y-2 font-mono text-emerald-400">
            <mat-icon class="text-3xl sm:text-4xl text-emerald-400">door_open</mat-icon>
            <h3 class="text-base sm:text-xl md:text-2xl font-bold tracking-widest">SALIDA ABIERTA</h3>
            <p class="text-[11px] sm:text-xs text-zinc-300">Escapaste en {{ engine.gameTime() }} segundos.</p>
            <button type="button" (click)="engine.startNewGame()" class="mt-1 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors">Reiniciar</button>
          </div>
        }

        @if (engine.status() === 'LOST') {
          <div class="absolute inset-0 bg-[#120000]/95 flex flex-col items-center justify-center p-2 sm:p-4 text-center z-20 space-y-1.5 sm:space-y-2 font-mono text-red-500">
            <mat-icon class="text-3xl sm:text-5xl text-red-600 animate-pulse">dangerous</mat-icon>
            <h3 class="text-base sm:text-xl md:text-2xl font-bold tracking-[0.25em] text-red-500">TE VIO</h3>
            <p class="text-[10px] sm:text-xs text-zinc-300 max-w-xs">La transmisión termina con uñas contra el vidrio.</p>
            <button type="button" (click)="engine.startNewGame()" class="mt-1 px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xs cursor-pointer transition-colors">Reiniciar</button>
          </div>
        }
      </div>

      <div class="shrink-0 flex items-center justify-between gap-1 pt-1 border-t border-red-950 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono text-zinc-300">
        <div class="flex items-center gap-0.5 sm:gap-1">
          <mat-icon class="text-[10px] sm:text-[12px] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" [class.text-red-500]="engine.battery() < 25" [class.text-amber-400]="engine.battery() >= 25">flashlight_on</mat-icon>
          <span class="hidden sm:inline">LIN:</span>
          <div class="w-6 xs:w-8 sm:w-14 h-1.5 sm:h-2 bg-zinc-950 border border-zinc-700 rounded-xs overflow-hidden">
            <div class="h-full transition-all duration-300" [class.bg-emerald-500]="engine.battery() >= 50" [class.bg-amber-500]="engine.battery() < 50 && engine.battery() >= 25" [class.bg-red-600]="engine.battery() < 25" [style.width]="engine.battery() + '%'"></div>
          </div>
          <span>{{ Math.round(engine.battery()) }}%</span>
        </div>

        <div class="flex items-center gap-0.5 sm:gap-1">
          <mat-icon class="text-[10px] sm:text-[12px] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-cyan-400">psychology</mat-icon>
          <span class="hidden sm:inline">CORD:</span>
          <div class="w-6 xs:w-8 sm:w-14 h-1.5 sm:h-2 bg-zinc-950 border border-zinc-700 rounded-xs overflow-hidden">
            <div class="h-full bg-cyan-700 transition-all duration-300" [style.width]="engine.sanity() + '%'"></div>
          </div>
        </div>

        <div class="flex md:hidden items-center gap-0.5">
          <button type="button" (touchstart)="setMobileDir(0, -1)" (touchend)="clearMobileDir()" class="w-6 h-6 xs:w-7 xs:h-7 bg-zinc-900 text-zinc-200 border border-zinc-700 flex items-center justify-center active:bg-red-900 rounded-xs text-[9px] xs:text-xs" aria-label="Avanzar">▲</button>
          <button type="button" (touchstart)="setMobileDir(-1, 0)" (touchend)="clearMobileDir()" class="w-6 h-6 xs:w-7 xs:h-7 bg-zinc-900 text-zinc-200 border border-zinc-700 flex items-center justify-center active:bg-red-900 rounded-xs text-[9px] xs:text-xs" aria-label="Girar izquierda">◀</button>
          <button type="button" (touchstart)="setMobileDir(0, 1)" (touchend)="clearMobileDir()" class="w-6 h-6 xs:w-7 xs:h-7 bg-zinc-900 text-zinc-200 border border-zinc-700 flex items-center justify-center active:bg-red-900 rounded-xs text-[9px] xs:text-xs" aria-label="Retroceder">▼</button>
          <button type="button" (touchstart)="setMobileDir(1, 0)" (touchend)="clearMobileDir()" class="w-6 h-6 xs:w-7 xs:h-7 bg-zinc-900 text-zinc-200 border border-zinc-700 flex items-center justify-center active:bg-red-900 rounded-xs text-[9px] xs:text-xs" aria-label="Girar derecha">▶</button>
        </div>
      </div>
    </div>
  `,
})
export class MazeGame implements OnInit, OnDestroy {
  engine = inject(GameEngine);
  private progress = inject(ProgressTracker);
  effects = inject(EffectsController);

  @ViewChild('gameCanvas', {static: true})
  canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly Math = Math;

  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private lastTime = 0;
  private keysPressed = new Set<string>();
  private mobileTurn = 0;
  private mobileForward = 0;
  private fearPulse = 0;
  private readonly viewWidth = 640;
  private readonly viewHeight = 360;
  private readonly fov = Math.PI / 3;

  ngOnInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.lastTime = performance.now();
    this.startLoop();
  }

  ngOnDestroy(): void {
    if (this.animId !== null) cancelAnimationFrame(this.animId);
    this.engine.stopGame();
  }

  bestTime(): number | null {
    const scores = this.progress.bestScores();
    return scores[this.engine.difficulty()] ?? null;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'q', 'e', 'W', 'A', 'S', 'D', 'Q', 'E'].includes(e.key)) {
      this.keysPressed.add(e.key.toLowerCase());
      if (this.engine.status() === 'PLAYING') e.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    this.keysPressed.delete(e.key.toLowerCase());
  }

  @HostListener('window:blur')
  clearInputs(): void {
    this.keysPressed.clear();
    this.clearMobileDir();
  }

  setMobileDir(x: number, y: number): void {
    this.mobileTurn = x;
    this.mobileForward = -y;
  }

  clearMobileDir(): void {
    this.mobileTurn = 0;
    this.mobileForward = 0;
  }

  private startLoop = (): void => {
    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.engine.status() === 'PLAYING') {
      let turn = this.mobileTurn;
      let forward = this.mobileForward;
      let strafe = 0;

      if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) turn -= 1;
      if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) turn += 1;
      if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) forward += 1;
      if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) forward -= 0.75;
      if (this.keysPressed.has('q')) strafe -= 0.75;
      if (this.keysPressed.has('e')) strafe += 0.75;

      const nextAngle = this.engine.playerAngle + turn * delta * 2.45;
      const moveX = Math.cos(nextAngle) * forward + Math.cos(nextAngle + Math.PI / 2) * strafe;
      const moveY = Math.sin(nextAngle) * forward + Math.sin(nextAngle + Math.PI / 2) * strafe;
      this.engine.update(delta, moveX, moveY, nextAngle);
    }

    this.render();
    this.animId = requestAnimationFrame(this.startLoop);
  };

  private render(): void {
    if (!this.ctx) return;
    const c = this.ctx;
    const w = this.viewWidth;
    const h = this.viewHeight;
    c.clearRect(0, 0, w, h);
    this.drawVoid(c, w, h);
    if (this.engine.grid.length === 0) return;

    this.drawCorridor(c, w, h);
    this.drawItems3d(c, w, h);
    this.drawExit(c, h);
    this.drawCreature3d(c, w, h);
    this.drawHudNoise(c, w, h);
  }

  private drawVoid(c: CanvasRenderingContext2D, w: number, h: number): void {
    const ceiling = c.createLinearGradient(0, 0, 0, h * 0.52);
    ceiling.addColorStop(0, '#020101');
    ceiling.addColorStop(1, '#140706');
    c.fillStyle = ceiling;
    c.fillRect(0, 0, w, h * 0.52);

    const floor = c.createLinearGradient(0, h * 0.48, 0, h);
    floor.addColorStop(0, '#0b0908');
    floor.addColorStop(1, '#020101');
    c.fillStyle = floor;
    c.fillRect(0, h * 0.48, w, h * 0.52);
  }

  private drawCorridor(c: CanvasRenderingContext2D, w: number, h: number): void {
    const strip = 2;
    const px = this.engine.playerX;
    const py = this.engine.playerY;
    const angle = this.engine.playerAngle;
    const battery = this.engine.battery();
    const maxSight = battery > 25 ? 360 : 210;

    for (let sx = 0; sx < w; sx += strip) {
      const rayAngle = angle - this.fov / 2 + (sx / w) * this.fov;
      const hit = this.castRay3d(px, py, rayAngle, maxSight);
      const corrected = Math.max(1, hit.dist * Math.cos(rayAngle - angle));
      const wallHeight = Math.min(h * 1.8, (this.engine.cellSize * 255) / corrected);
      const wallTop = h / 2 - wallHeight / 2;
      const shade = Math.max(0, 1 - corrected / maxSight);
      const flicker = battery < 25 && Math.random() < 0.04 ? 0.16 : 0;
      const red = Math.floor(34 + shade * 82 + flicker * 255);
      const green = Math.floor(18 + shade * 28);
      const blue = Math.floor(15 + shade * 22);
      c.fillStyle = hit.vertical ? `rgb(${red},${green},${blue})` : `rgb(${Math.max(8, red - 24)},${green},${blue})`;
      c.fillRect(sx, wallTop, strip + 1, wallHeight);

      // Perspective masonry and damp seams, anchored to the world hit.
      const textureX = (hit.vertical ? hit.y : hit.x) % this.engine.cellSize;
      if (textureX < 1.2) {
        c.fillStyle = 'rgba(0,0,0,.38)';
        c.fillRect(sx, wallTop, strip, wallHeight);
      }
      for (let course = 1; course < 7; course++) {
        c.fillStyle = 'rgba(0,0,0,.25)';
        c.fillRect(sx, wallTop + wallHeight * course / 7, strip, Math.max(1, wallHeight / 180));
      }

      if (shade > 0.45 && sx % 18 === 0) {
        c.fillStyle = `rgba(0,0,0,${0.22 - shade * 0.08})`;
        c.fillRect(sx, wallTop, 1, wallHeight);
      }
    }
  }

  private drawItems3d(c: CanvasRenderingContext2D, w: number, h: number): void {
    for (const item of this.engine.items) {
      if (item.collected) continue;
      const projection = this.project(item.x, item.y);
      if (!projection || projection.dist > 280) continue;
      const glow = Math.max(0.18, 1 - projection.dist / 280);
      c.save();
      c.globalAlpha = glow;
      if (item.type === 'key') {
        c.fillStyle = '#fbbf24';
        c.shadowColor = '#f59e0b';
        c.shadowBlur = 20;
        c.fillRect(projection.x - projection.size * 0.12, h / 2 - projection.size * 0.22, projection.size * 0.24, projection.size * 0.44);
        c.beginPath();
        c.arc(projection.x, h / 2 - projection.size * 0.32, projection.size * 0.18, 0, Math.PI * 2);
        c.strokeStyle = '#fde68a';
        c.lineWidth = 3;
        c.stroke();
      } else if (item.type === 'battery') {
        c.fillStyle = '#22c55e';
        c.shadowColor = '#86efac';
        c.shadowBlur = 18;
        c.fillRect(projection.x - projection.size * 0.2, h / 2 - projection.size * 0.22, projection.size * 0.4, projection.size * 0.44);
      } else {
        c.fillStyle = '#cfc7b5';
        c.shadowColor = '#ffffff';
        c.shadowBlur = 12;
        c.fillRect(projection.x - projection.size * 0.22, h / 2 - projection.size * 0.18, projection.size * 0.44, projection.size * 0.36);
        c.fillStyle = '#7a1f1a';
        c.fillRect(projection.x - projection.size * 0.14, h / 2 - projection.size * 0.03, projection.size * 0.28, 2);
      }
      c.restore();
    }
  }

  private drawCreature3d(c: CanvasRenderingContext2D, w: number, h: number): void {
    const projection = this.project(this.engine.creatureX, this.engine.creatureY);
    const dist = Math.hypot(this.engine.playerX - this.engine.creatureX, this.engine.playerY - this.engine.creatureY);
    this.fearPulse = Math.max(0, 1 - dist / 170);
    if (!projection || dist > 320) return;

    const bodyHeight = Math.min(h * 1.35, projection.size * 2.7);
    const bodyWidth = bodyHeight * 0.34;
    const x = projection.x;
    const y = h / 2 - bodyHeight * 0.42;
    const visible = Math.max(0.18, 1 - dist / 320);

    c.save();
    c.globalAlpha = visible;
    c.shadowColor = '#ff1111';
    c.shadowBlur = 22 + this.fearPulse * 32;
    c.fillStyle = this.engine.creatureStateInternal === 'STUNNED' ? '#1f2937' : '#120303';
    c.beginPath();
    c.ellipse(x, y + bodyHeight * 0.55, bodyWidth, bodyHeight * 0.44, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#090101';
    c.beginPath();
    c.ellipse(x, y + bodyHeight * 0.18, bodyWidth * 0.72, bodyHeight * 0.18, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = this.engine.creatureStateInternal === 'STUNNED' ? '#93c5fd' : '#ff2222';
    c.shadowColor = c.fillStyle;
    c.shadowBlur = 16;
    const eyeY = y + bodyHeight * 0.15;
    const eyeGap = Math.max(3, bodyWidth * 0.28);
    c.beginPath();
    c.arc(x - eyeGap, eyeY, Math.max(2, bodyWidth * 0.08), 0, Math.PI * 2);
    c.arc(x + eyeGap, eyeY, Math.max(2, bodyWidth * 0.08), 0, Math.PI * 2);
    c.fill();

    if (this.fearPulse > 0.45) {
      c.globalAlpha = this.fearPulse * 0.35;
      c.fillStyle = '#7f0000';
      c.fillRect(0, 0, w, h);
    }
    c.restore();
  }

  private drawHudNoise(c: CanvasRenderingContext2D, w: number, h: number): void {
    const battery = this.engine.battery();
    const noiseCount = battery < 25 ? 60 : 22;
    c.save();
    for (let i = 0; i < noiseCount; i++) {
      c.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
      c.fillRect(Math.random() * w, Math.random() * h, Math.random() * 42, 1);
    }
    const vignette = c.createRadialGradient(w / 2, h / 2, h * 0.16, w / 2, h / 2, h * 0.74);
    vignette.addColorStop(0, `rgba(217,164,65,${battery > 20 ? 0.06 : 0.02})`);
    vignette.addColorStop(0.42, 'rgba(0,0,0,0.18)');
    vignette.addColorStop(1, `rgba(0,0,0,${0.84 + this.fearPulse * 0.12})`);
    c.fillStyle = vignette;
    c.fillRect(0, 0, w, h);
    c.restore();
  }

  private project(x: number, y: number): Projection | null {
    const dx = x - this.engine.playerX;
    const dy = y - this.engine.playerY;
    const dist = Math.hypot(dx, dy);
    let rel = Math.atan2(dy, dx) - this.engine.playerAngle;
    while (rel < -Math.PI) rel += Math.PI * 2;
    while (rel > Math.PI) rel -= Math.PI * 2;
    if (Math.abs(rel) > this.fov * 0.62 || dist < 1) return null;
    // Objects must disappear behind walls instead of glowing through them.
    const obstruction = this.castRay3d(this.engine.playerX, this.engine.playerY, Math.atan2(dy, dx), dist);
    if (obstruction.dist < dist - 4) return null;
    return {
      x: (0.5 + rel / this.fov) * this.viewWidth,
      size: Math.max(7, (this.engine.cellSize * 190) / dist),
      dist,
    };
  }

  private drawExit(c: CanvasRenderingContext2D, h: number): void {
    const door = this.project(this.engine.exitX, this.engine.exitY);
    if (!door) return;
    const height = door.size * 2;
    c.save();
    c.fillStyle = '#17221d';
    c.fillRect(door.x - height * .23, h / 2 - height / 2, height * .46, height);
    c.strokeStyle = this.engine.hasKey() ? '#5ce0a1' : '#9c5647';
    c.lineWidth = 2;
    c.strokeRect(door.x - height * .23, h / 2 - height / 2, height * .46, height);
    c.fillStyle = this.engine.hasKey() ? '#5ce0a1' : '#b99b71';
    c.font = `${Math.max(8, height * .09)}px monospace`;
    c.textAlign = 'center';
    c.fillText('EXIT', door.x, h / 2 - height * .28);
    c.fillRect(door.x + height * .14, h / 2, 3, 3);
    c.restore();
  }

  private castRay3d(ox: number, oy: number, angle: number, maxDist: number): RayHit {
    const step = 2.4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let curDist = 0;
    while (curDist < maxDist) {
      curDist += step;
      const tx = ox + cos * curDist;
      const ty = oy + sin * curDist;
      const cellX = Math.floor(tx / this.engine.cellSize);
      const cellY = Math.floor(ty / this.engine.cellSize);
      if (cellX < 0 || cellX >= this.engine.cols || cellY < 0 || cellY >= this.engine.rows) {
        return {x: tx, y: ty, dist: curDist, vertical: false};
      }
      const cell = this.engine.grid[cellY][cellX];
      const lx = tx - cellX * this.engine.cellSize;
      const ly = ty - cellY * this.engine.cellSize;
      if (cell.top && ly < 2.4) return {x: tx, y: ty, dist: curDist, vertical: false};
      if (cell.bottom && ly > this.engine.cellSize - 2.4) return {x: tx, y: ty, dist: curDist, vertical: false};
      if (cell.left && lx < 2.4) return {x: tx, y: ty, dist: curDist, vertical: true};
      if (cell.right && lx > this.engine.cellSize - 2.4) return {x: tx, y: ty, dist: curDist, vertical: true};
    }
    return {x: ox + cos * maxDist, y: oy + sin * maxDist, dist: maxDist, vertical: false};
  }
}
