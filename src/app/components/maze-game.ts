import {ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, ViewChild, inject, signal} from '@angular/core';
import {GameEngine} from '../services/game-engine';
import {ProgressTracker} from '../services/progress';
import {AudioEngine} from '../services/audio-engine';
import type {HouseWorld} from '../services/house-world';

@Component({
  selector: 'app-maze-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './maze-game.css',
  template: `
    <div class="house-game" #gameShell>
      <header class="transmission"><span>● ARCHIVO 013 / CASA DEL AZOGUE</span><span>{{ engine.gameTime() }}s · {{ engine.difficulty() }}</span></header>
      <div class="viewport" #viewport>
        <canvas #gameCanvas tabindex="0" aria-label="Casa abandonada en 3D. WASD para moverse; ratón o arrastre para mirar." (pointerdown)="lookStart($event)" (pointermove)="lookMove($event)" (pointerup)="lookEnd($event)" (pointercancel)="lookEnd($event)"></canvas>
        <div class="view-grain" aria-hidden="true"></div>
        @if (engine.status() === 'PLAYING' && !intro() && !paused()) {
          <span class="crosshair" aria-hidden="true">+</span>
          <div class="objective">{{ engine.hasKey() && engine.loreFound().length >= 2 ? 'OBJETIVO / Encuentra la salida' : 'OBJETIVO / Recupera la llave y las pruebas' }} · PRUEBAS {{ engine.loreFound().length }}/2</div>
          <div class="encounter" aria-live="polite">{{ engine.encounter() }}</div>
          <div class="view-tools"><button type="button" (click)="pause()">Pausar</button><button type="button" (click)="fullscreen()">Pantalla completa</button></div>
          <div class="mobile-pad" aria-label="Movimiento táctil">
            @for (direction of directions; track direction.label) {
              <button type="button" [attr.aria-label]="direction.label" (pointerdown)="moveStart($event, direction.x, direction.y)" (pointerup)="moveEnd($event)" (pointercancel)="moveEnd($event)">{{ direction.symbol }}</button>
            }
          </div>
        }
        @if (engine.status() === 'TITLE' && !intro()) {
          <div class="game-dialog title-dialog">
            <span class="chapter-label">EXPEDIENTE JUGABLE · TERROR PSICOLÓGICO</span>
            <h3>LA CASA<br>DEL AZOGUE</h3>
            <p>Una cinta. Cinco presencias. Una casa que recuerda tu nombre.<br>Jeff te persigue. Bloody Painter prepara su siguiente obra.</p>
            <div class="difficulty">
              @for (level of levels; track level.value) { <button type="button" (click)="engine.setDifficulty(level.value)" [attr.aria-pressed]="engine.difficulty() === level.value">{{ level.label }}</button> }
            </div>
            <button type="button" class="primary" (click)="beginStory()" [disabled]="loading()">{{ loading() ? 'Preparando la casa…' : 'Abrir el expediente' }}</button>
            <button type="button" class="fullscreen-mobile" (click)="fullscreen()">Pantalla completa · horizontal</button>
            <p class="error" role="status">{{ error() }}</p>
            <small>WASD · flechas · ratón / arrastrar para mirar · Esc / P pausa<br>Celular: cruceta para caminar + arrastre para mirar. Las pruebas se recogen al acercarte.</small>
            @if (bestTime() !== null) { <small>Mejor escape: {{ bestTime() }} segundos</small> }
          </div>
        }
        @if (intro()) {
          <div class="game-dialog story-dialog">
            <span class="chapter-label">PRÓLOGO / {{ chapter() + 1 }} DE {{ story.length }}</span>
            <h3>{{ story[chapter()].title }}</h3>
            <p class="narration">{{ story[chapter()].text }}</p>
            <button type="button" class="primary" (click)="nextChapter()">{{ chapter() === story.length - 1 ? 'Cruzar la puerta' : 'Continuar' }}</button>
            <button type="button" class="subtle" (click)="enterHouse()">Saltar introducción</button>
          </div>
        }
        @if (paused() && !intro() && engine.status() === 'PLAYING') {
          <div class="game-dialog">
            <span class="chapter-label">TRANSMISIÓN EN PAUSA</span><h3>NO ESTÁS SOLO</h3>
            <label>Sensibilidad de mirada <input type="range" min="0.5" max="2" step="0.1" [value]="sensitivity()" (input)="setSensitivity($event)" /></label>
            <div class="found-notes"><h4>Pruebas recuperadas</h4>@for (note of engine.loreFound(); track $index) { <p>{{ note }}</p> } @empty { <p>Aún no encontraste ninguna nota.</p> }</div>
            <button type="button" class="primary" (click)="resume()">Volver a la casa</button>
            <button type="button" class="subtle" (click)="returnToTitle()">Salir al expediente</button>
          </div>
        }
        @if (engine.status() === 'WON' || engine.status() === 'LOST') {
          <div class="game-dialog">
            <span class="chapter-label">FIN DE LA TRANSMISIÓN</span><h3>{{ engine.status() === 'WON' ? 'EL ARCHIVO SIGUE ABIERTO' : engine.killedBy() === 'painter' ? 'NO HAY UN MAÑANA' : 'VE A DORMIR' }}</h3>
            <p>{{ engine.status() === 'WON' ? 'Saliste con la cinta. En la grabación se oyen tus pasos… y otros justo detrás. Tiempo: ' + engine.gameTime() + ' segundos.' : engine.killedBy() === 'painter' ? 'La máscara quedó inmóvil ante ti. Bloody Painter terminó su siguiente obra.' : 'La sonrisa era lo último que iluminaba tu linterna. Jeff te encontró.' }}</p>
            <button type="button" class="primary" (click)="beginStory()">Volver a entrar</button>
            <button type="button" class="subtle" (click)="returnToTitle()">Volver al expediente</button>
          </div>
        }
      </div>
      <footer class="game-hud"><span>LINTERNА <meter min="0" max="100" [value]="engine.battery()"></meter> {{ Math.round(engine.battery()) }}%</span><span>CORDURA <meter min="0" max="100" [value]="engine.sanity()"></meter></span><span>{{ engine.hasKey() ? 'LLAVE RECUPERADA' : 'SIN LLAVE' }}</span></footer>
      @if (screenNotice()) { <div class="screen-notice" role="status">{{ screenNotice() }} <button type="button" (click)="screenNotice.set('')" aria-label="Cerrar indicación de pantalla">×</button></div> }
    </div>
  `,
})
export class MazeGame implements OnDestroy {
  readonly engine = inject(GameEngine);
  private progress = inject(ProgressTracker);
  private audio = inject(AudioEngine);
  @ViewChild('gameCanvas', {static: true}) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('viewport', {static: true}) viewportRef!: ElementRef<HTMLElement>;
  @ViewChild('gameShell', {static: true}) shellRef!: ElementRef<HTMLElement>;
  readonly screenNotice = signal('');
  readonly Math = Math;
  readonly levels = [{value: 'easy' as const, label: 'Fácil'}, {value: 'normal' as const, label: 'Normal'}, {value: 'nightmare' as const, label: 'Pesadilla'}];
  readonly directions = [{label: 'Avanzar', symbol: '▲', x: 0, y: 1}, {label: 'Desplazarse izquierda', symbol: '◀', x: -1, y: 0}, {label: 'Retroceder', symbol: '▼', x: 0, y: -1}, {label: 'Desplazarse derecha', symbol: '▶', x: 1, y: 0}];
  readonly story = [
    {title: 'La última llamada', text: 'Hace tres noches, tu hermano te envió una cinta desde una casa clausurada en 2013. «Encontré el origen del Archivo», dijo. Su voz se cortó. La risa que le respondió continuó durante trece minutos.'},
    {title: 'Los expedientes', text: 'Las pruebas hablan de un hombre sin rostro que observa desde los pasillos. De una sonrisa tallada en la oscuridad. De un perro cuya imagen no debes compartir. Y de un juego que sigue encendido aunque lo desenchufes: Sonic.exe. Slender Man, Jeff y Smile Dog no eran solo nombres en internet.'},
    {title: 'El taller del pintor', text: 'Las sonrisas rojas de los lienzos no son pintura. Helen Otis, Bloody Painter, camina lentamente entre sus obras. La máscara blanca no cambia de expresión. La linterna lo obliga a protegerse: mantén la luz sobre él y aprovecha la pausa para escapar.'},
    {title: '03:17 · Casa del Azogue', text: 'La puerta se ha cerrado detrás de ti. Hay sangre seca entre las tablas, pero algunas huellas todavía brillan. Recupera las notas y la llave para abrir la salida del fondo. La linterna puede detener a Jeff por unos segundos si lo iluminas de frente. No persigas las risas. Tu hermano no se reía así.'},
  ];
  intro = signal(false); chapter = signal(0); paused = signal(false); loading = signal(false); error = signal(''); sensitivity = signal(1);
  private world: HouseWorld | null = null;
  private frame: number | null = null;
  private lastTime = 0;
  private keys = new Set<string>();
  private moves = new Map<number, {x: number; y: number}>();
  private lookPointer: number | null = null;
  private lookX = 0; private lookY = 0;
  private destroyed = false;
  private observer: IntersectionObserver | null = null;
  private needsRender = true;
  private animationTime = 0;

  bestTime(): number | null { return this.progress.bestScores()[this.engine.difficulty()] ?? null; }

  async beginStory(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true); this.error.set(''); this.releaseInputs(); this.unlock();
    this.world?.dispose(); this.world = null;
    this.engine.startNewGame(); this.engine.pauseGame();
    try {
      const {HouseWorld} = await import('../services/house-world');
      if (this.destroyed) return;
      this.world = new HouseWorld(this.canvasRef.nativeElement, this.engine);
      this.needsRender = true; this.animationTime = 0;
      this.chapter.set(0); this.intro.set(true); this.paused.set(false);
      if (this.frame === null) { this.lastTime = performance.now(); this.loop(); }
      if (!this.observer) {
        this.observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) this.pause(); }, {threshold: .1});
        this.observer.observe(this.viewportRef.nativeElement);
      }
    } catch {
      this.engine.stopGame(); this.error.set('No se pudo iniciar WebGL. Activa la aceleración gráfica del navegador y vuelve a intentarlo.');
    } finally { this.loading.set(false); }
  }

  nextChapter(): void { if (this.chapter() < this.story.length - 1) this.chapter.update(value => value + 1); else this.enterHouse(); }
  enterHouse(): void { this.intro.set(false); this.paused.set(false); this.engine.resumeGame(); this.canvasRef.nativeElement.focus(); this.audio.playClick(); }
  pause(): void { if (this.engine.status() !== 'PLAYING') return; this.paused.set(true); this.engine.pauseGame(); this.releaseInputs(); this.unlock(); this.needsRender = true; }
  resume(): void { this.paused.set(false); this.engine.resumeGame(); this.canvasRef.nativeElement.focus(); }
  returnToTitle(): void { this.intro.set(false); this.paused.set(false); this.engine.stopGame(); this.releaseInputs(); this.unlock(); }
  setSensitivity(event: Event): void { this.sensitivity.set(Number((event.target as HTMLInputElement).value)); }
  async fullscreen(): Promise<void> {
    this.screenNotice.set('');
    try {
      if (!document.fullscreenElement) {
        if (!this.shellRef.nativeElement.requestFullscreen) throw new Error('unavailable');
        await this.shellRef.nativeElement.requestFullscreen();
      }
      if (matchMedia('(pointer: coarse)').matches) {
        const orientation = screen.orientation as ScreenOrientation & {lock?: (mode: string) => Promise<void>};
        try { if (!orientation?.lock) throw new Error('unavailable'); await orientation.lock('landscape'); }
        catch { this.screenNotice.set('Gira el dispositivo para jugar en horizontal. Este navegador no permite bloquear la orientación.'); }
      }
    } catch { this.screenNotice.set('La pantalla completa no está disponible en este navegador. Usa la pestaña de juego y gira el móvil para jugar en horizontal.'); }
    this.needsRender = true;
  }
  @HostListener('window:resize') resized(): void { this.needsRender = true; }
  @HostListener('document:fullscreenchange') fullscreenChanged(): void { if (!document.fullscreenElement) screen.orientation?.unlock?.(); this.needsRender = true; }
  private unlock(): void { if (document.pointerLockElement === this.canvasRef?.nativeElement) document.exitPointerLock(); }

  lookStart(event: PointerEvent): void {
    if (!this.active()) return;
    this.canvasRef.nativeElement.focus();
    if (event.pointerType === 'mouse' && this.canvasRef.nativeElement.requestPointerLock) {
      try { const request = this.canvasRef.nativeElement.requestPointerLock(); if (request) void request.catch(() => { /* Drag remains available. */ }); } catch { /* Drag remains available. */ }
    }
    this.lookPointer = event.pointerId; this.lookX = event.clientX; this.lookY = event.clientY;
    this.canvasRef.nativeElement.setPointerCapture(event.pointerId);
  }
  lookMove(event: PointerEvent): void {
    if (document.pointerLockElement || event.pointerId !== this.lookPointer || !this.active()) return;
    this.rotate(event.clientX - this.lookX, event.clientY - this.lookY);
    this.lookX = event.clientX; this.lookY = event.clientY;
  }
  lookEnd(event: PointerEvent): void { if (event.pointerId === this.lookPointer) this.lookPointer = null; }
  @HostListener('document:mousemove', ['$event']) mouseLook(event: MouseEvent): void { if (document.pointerLockElement === this.canvasRef.nativeElement && this.active()) this.rotate(event.movementX, event.movementY); }
  private rotate(x: number, y: number): void {
    this.engine.playerAngle += x * .0025 * this.sensitivity();
    this.engine.playerPitch = Math.max(-1.45, Math.min(1.45, this.engine.playerPitch - y * .0025 * this.sensitivity()));
  }
  moveStart(event: PointerEvent, x: number, y: number): void { if (!this.active()) return; event.preventDefault(); (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); this.moves.set(event.pointerId, {x, y}); }
  moveEnd(event: PointerEvent): void { this.moves.delete(event.pointerId); }
  @HostListener('window:keydown', ['$event']) keyDown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    if (event.key.toLowerCase() === 'p' && this.paused() && !this.intro()) { this.resume(); event.preventDefault(); return; }
    if (!this.active()) return;
    const key = event.key.toLowerCase();
    if (key === 'escape' || key === 'p') { this.pause(); event.preventDefault(); return; }
    if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'pageup', 'pagedown'].includes(key)) { this.keys.add(key); event.preventDefault(); }
  }
  @HostListener('window:keyup', ['$event']) keyUp(event: KeyboardEvent): void { this.keys.delete(event.key.toLowerCase()); }
  @HostListener('window:blur') windowBlur(): void { this.pause(); }
  @HostListener('document:visibilitychange') visibilityChange(): void { if (document.hidden) this.pause(); }
  @HostListener('document:pointerlockchange') lockChange(): void { if (!document.pointerLockElement && this.active()) this.pause(); }
  private active(): boolean { return this.engine.status() === 'PLAYING' && !this.intro() && !this.paused(); }
  private releaseInputs(): void { this.keys.clear(); this.moves.clear(); this.lookPointer = null; }

  private loop = (): void => {
    const now = performance.now(); const frameDelta = (now - this.lastTime) / 1000;
    const delta = Math.min(.05, frameDelta); this.lastTime = now;
    if (this.active()) {
      this.animationTime += delta;
      let forward = 0; let strafe = 0;
      for (const move of this.moves.values()) { forward += move.y; strafe += move.x; }
      if (this.keys.has('w') || this.keys.has('arrowup')) forward++;
      if (this.keys.has('s') || this.keys.has('arrowdown')) forward--;
      if (this.keys.has('a') || this.keys.has('q')) strafe--;
      if (this.keys.has('d') || this.keys.has('e')) strafe++;
      if (this.keys.has('arrowleft')) this.engine.playerAngle -= delta * 1.8;
      if (this.keys.has('arrowright')) this.engine.playerAngle += delta * 1.8;
      if (this.keys.has('pageup')) this.rotate(0, -delta * 400);
      if (this.keys.has('pagedown')) this.rotate(0, delta * 400);
      const angle = this.engine.playerAngle;
      this.engine.update(delta, Math.cos(angle) * forward + Math.cos(angle + Math.PI / 2) * strafe, Math.sin(angle) * forward + Math.sin(angle + Math.PI / 2) * strafe, angle);
      if (this.engine.status() !== 'PLAYING') { this.releaseInputs(); this.unlock(); }
    }
    if (!document.hidden && (this.active() || this.needsRender)) { this.world?.render(this.animationTime, this.active() ? frameDelta : 0); this.needsRender = false; }
    this.frame = requestAnimationFrame(this.loop);
  };
  ngOnDestroy(): void { this.destroyed = true; if (this.frame !== null) cancelAnimationFrame(this.frame); this.observer?.disconnect(); this.unlock(); this.world?.dispose(); this.engine.stopGame(); }
}
