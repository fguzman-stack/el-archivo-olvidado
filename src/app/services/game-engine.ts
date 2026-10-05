import {Injectable, inject, signal} from '@angular/core';
import {AudioEngine} from './audio-engine';
import {ProgressTracker} from './progress';
import {EffectsController} from './effects';
import {SanityController} from './sanity';

export type GameDifficulty = 'easy' | 'normal' | 'nightmare';
export type CreatureState = 'PATROL' | 'ALERT' | 'CHASE' | 'STUNNED';
export type GameStatus = 'TITLE' | 'PLAYING' | 'WON' | 'LOST';

export interface MazeCell {
  x: number;
  y: number;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

export interface Item {
  type: 'key' | 'battery' | 'lore';
  x: number;
  y: number;
  collected: boolean;
  loreSnippet?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameEngine {
  private audio = inject(AudioEngine);
  private progress = inject(ProgressTracker);
  private effects = inject(EffectsController);
  private globalSanity = inject(SanityController);

  readonly status = signal<GameStatus>('TITLE');
  readonly difficulty = signal<GameDifficulty>('normal');
  readonly battery = signal<number>(100);
  readonly sanity = signal<number>(100);
  readonly hasKey = signal<boolean>(false);
  readonly gameTime = signal<number>(0);
  readonly loreFound = signal<string[]>([]);
  readonly creatureState = signal<CreatureState>('PATROL');
  readonly painterState = signal<CreatureState>('PATROL');
  readonly killedBy = signal<'jeff' | 'painter'>('jeff');
  painterX = 0;
  painterY = 0;
  private painterTarget = {x: 0, y: 0};
  private painterWait = 0;
  private painterStun = 0;
  private routeCache = new Map<string, number[]>();

  // Maze dimensions
  readonly cols = 15;
  readonly rows = 11;
  readonly cellSize = 32; // world pixels per cell

  grid: MazeCell[][] = [];
  visitedGrid: boolean[][] = [];

  // Player state
  playerX = 48;
  playerY = 48;
  playerAngle = 0; // radians
  playerPitch = 0;
  readonly encounter = signal('');
  playerSpeed = .48;

  // Creature state
  creatureX = 0;
  creatureY = 0;
  creatureSpeed = 1.0;
  creatureStateInternal: CreatureState = 'PATROL';
  creatureTargetX = 0;
  creatureTargetY = 0;
  creatureIlluminatedTimer = 0;
  creatureStunTimer = 0;

  // Exit door
  exitX = 0;
  exitY = 0;

  // Items
  items: Item[] = [];

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private lastStepTime = 0;
  private paused = false;

  pauseGame(): void { this.paused = true; }
  resumeGame(): void { this.paused = false; }

  setDifficulty(diff: GameDifficulty): void {
    this.difficulty.set(diff);
  }

  startNewGame(): void {
    this.paused = false;
    this.generateMaze();
    this.routeCache.clear();
    this.spawnEntities();
    this.battery.set(100);
    this.sanity.set(100);
    this.hasKey.set(false);
    this.gameTime.set(0);
    this.loreFound.set([]);
    this.encounter.set('Encuentra la cinta y la llave. La salida está al fondo de la casa.');
    this.creatureStateInternal = 'PATROL';
    this.creatureState.set('PATROL');
    this.creatureIlluminatedTimer = 0;
    this.creatureStunTimer = 0;
    this.painterState.set('PATROL'); this.painterWait = 0; this.painterStun = 0; this.killedBy.set('jeff');
    this.status.set('PLAYING');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status() === 'PLAYING' && !this.paused) {
        this.gameTime.update(t => t + 1);
        if (this.gameTime() % 17 === 0) {
          this.audio.playHorrorLaugh();
          this.encounter.set('Jeff the Killer: «Ve a dormir». La risa viene de dentro de la casa.');
        } else if (this.gameTime() % 11 === 0) {
          this.audio.playWhisperMurmur();
          this.encounter.set('Algo ha cambiado detrás de ti. No recuerdas haber abierto esa puerta.');
        }

        // Battery drainage rate
        const drain = this.difficulty() === 'easy' ? 0.8 : this.difficulty() === 'normal' ? 1.2 : 1.8;
        this.battery.update(b => Math.max(0, b - drain));

        // Heartbeat speed based on creature distance
        const dx = this.playerX - this.creatureX;
        const dy = this.playerY - this.creatureY;
        const dist = Math.hypot(dx, dy);

        if (dist < 140) {
          const rate = dist < 70 ? 2.0 : 1.3;
          this.audio.playHeartbeat(rate);
        }
      }
    }, 1000);

    this.audio.playClick();
  }

  stopGame(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.status.set('TITLE');
  }

  // Procedural maze generation using Recursive Backtracker with braiding
  private generateMaze(): void {
    this.grid = [];
    this.visitedGrid = [];

    for (let y = 0; y < this.rows; y++) {
      this.grid[y] = [];
      this.visitedGrid[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = {
          x,
          y,
          top: true,
          right: true,
          bottom: true,
          left: true,
          visited: false,
        };
        this.visitedGrid[y][x] = false;
      }
    }

    const stack: MazeCell[] = [];
    let current = this.grid[0][0];
    current.visited = true;

    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.removeWalls(current, next);
        stack.push(current);
        current = next;
        current.visited = true;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }

    // Braiding: randomly remove ~15% of interior walls to prevent dead ends
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cols - 1; x++) {
        if (Math.random() < 0.16) {
          if (Math.random() < 0.5) {
            this.grid[y][x].right = false;
            this.grid[y][x + 1].left = false;
          } else {
            this.grid[y][x].bottom = false;
            this.grid[y + 1][x].top = false;
          }
        }
      }
    }
    // Carve connected rooms into the generated house; corridors remain navigable.
    for (const [rx, ry, width, height] of [[0, 0, 3, 3], [4, 1, 4, 3], [9, 3, 4, 3], [1, 6, 4, 3], [7, 7, 4, 3]]) {
      for (let y = ry; y < ry + height; y++) {
        for (let x = rx; x < rx + width; x++) {
          if (x < rx + width - 1) this.removeWalls(this.grid[y][x], this.grid[y][x + 1]);
          if (y < ry + height - 1) this.removeWalls(this.grid[y][x], this.grid[y + 1][x]);
        }
      }
    }
  }

  private getUnvisitedNeighbors(cell: MazeCell): MazeCell[] {
    const list: MazeCell[] = [];
    const {x, y} = cell;
    if (y > 0 && !this.grid[y - 1][x].visited) list.push(this.grid[y - 1][x]);
    if (x < this.cols - 1 && !this.grid[y][x + 1].visited) list.push(this.grid[y][x + 1]);
    if (y < this.rows - 1 && !this.grid[y + 1][x].visited) list.push(this.grid[y + 1][x]);
    if (x > 0 && !this.grid[y][x - 1].visited) list.push(this.grid[y][x - 1]);
    return list;
  }

  private removeWalls(a: MazeCell, b: MazeCell): void {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    if (dx === 1) {
      a.left = false;
      b.right = false;
    } else if (dx === -1) {
      a.right = false;
      b.left = false;
    }
    if (dy === 1) {
      a.top = false;
      b.bottom = false;
    } else if (dy === -1) {
      a.bottom = false;
      b.top = false;
    }
  }

  private spawnEntities(): void {
    // Player starts at top-left
    this.playerX = this.cellSize * 0.5 + 4;
    this.playerY = this.cellSize * 0.5 + 4;
    this.playerAngle = 0;
    this.playerPitch = 0;

    // Exit is at bottom-right
    this.exitX = (this.cols - 1) * this.cellSize + this.cellSize * 0.5;
    this.exitY = (this.rows - 1) * this.cellSize + this.cellSize * 0.5;

    // Creature starts near bottom center
    this.creatureX = Math.floor(this.cols / 2) * this.cellSize + this.cellSize * 0.5;
    this.creatureY = (this.rows - 2) * this.cellSize + this.cellSize * 0.5;
    this.creatureTargetX = this.creatureX;
    this.creatureTargetY = this.creatureY;
    this.painterX = 10 * this.cellSize + this.cellSize / 2;
    this.painterY = 4 * this.cellSize + this.cellSize / 2;
    this.painterTarget = {x: this.painterX, y: this.painterY};

    // Adjust creature speed by difficulty
    const diff = this.difficulty();
    this.creatureSpeed = diff === 'easy' ? .23 : diff === 'normal' ? .32 : .43;

    // Items
    this.items = [];

    // Key in a far quadrant (top right or bottom left)
    const keyCellX = this.cols - 2;
    const keyCellY = 1;
    this.items.push({
      type: 'key',
      x: keyCellX * this.cellSize + this.cellSize * 0.5,
      y: keyCellY * this.cellSize + this.cellSize * 0.5,
      collected: false,
    });

    // Batteries (2 items)
    this.items.push({
      type: 'battery',
      x: 3 * this.cellSize + this.cellSize * 0.5,
      y: (this.rows - 3) * this.cellSize + this.cellSize * 0.5,
      collected: false,
    });
    this.items.push({
      type: 'battery',
      x: (this.cols - 4) * this.cellSize + this.cellSize * 0.5,
      y: 4 * this.cellSize + this.cellSize * 0.5,
      collected: false,
    });

    // Lore notes (2 items with quotes)
    const quotes = [
      'Slender Man: «No intentes mirar las ramas...»',
      'Jeff: «Ve a dormir antes de las tres...»',
      'Bloody Painter: las sonrisas rojas marcan su taller. La linterna lo frena; no te acerques a la máscara.',
      'Backrooms: «Si sientes que el suelo cede, no grites...»',
      'El Silbón: «Cuando lo oyes lejos, está a tu espalda...»',
    ];
    this.items.push({
      type: 'lore',
      x: 6 * this.cellSize + this.cellSize * 0.5,
      y: 2 * this.cellSize + this.cellSize * 0.5,
      collected: false,
      loreSnippet: quotes[Math.floor(Math.random() * quotes.length)],
    });
    this.items.push({
      type: 'lore',
      x: 2 * this.cellSize + this.cellSize * 0.5,
      y: 7 * this.cellSize + this.cellSize * 0.5,
      collected: false,
      loreSnippet: quotes[Math.floor(Math.random() * quotes.length)],
    });
  }

  // Update physics and AI per frame
  update(delta: number, moveX: number, moveY: number, targetAngle: number): void {
    if (this.status() !== 'PLAYING' || this.paused) return;

    this.playerAngle = targetAngle;

    // Move player with collision
    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const nx = (moveX / len) * this.playerSpeed * (delta * 60);
      const ny = (moveY / len) * this.playerSpeed * (delta * 60);

      this.movePlayerWithCollision(nx, ny);

      // Footstep sound throttled
      const now = performance.now();
      if (now - this.lastStepTime > 360) {
        this.audio.playFootstep();
        this.lastStepTime = now;
      }
    }

    // Mark current cell as visited
    const cellX = Math.floor(this.playerX / this.cellSize);
    const cellY = Math.floor(this.playerY / this.cellSize);
    if (cellX >= 0 && cellX < this.cols && cellY >= 0 && cellY < this.rows) {
      this.visitedGrid[cellY][cellX] = true;
    }

    // Item pickups
    this.checkItemCollisions();

    // Check exit
    const distToExit = Math.hypot(this.playerX - this.exitX, this.playerY - this.exitY);
    if (distToExit < 20 && this.hasKey() && this.loreFound().length >= 2) {
      this.status.set('WON');
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.progress.saveMazeScore(this.difficulty(), this.gameTime());
      this.audio.playElevatorBell();
      return;
    }
    if (distToExit < 20 && this.hasKey() && this.loreFound().length < 2) {
      this.encounter.set('La cinta sigue incompleta. Recupera las dos pruebas antes de salir.');
    }

    // Creature AI update
    this.updateCreatureAI(delta);
    this.updatePainterAI(delta);

    // Sanity calculation
    const distToCreature = Math.hypot(this.playerX - this.creatureX, this.playerY - this.creatureY);
    if (distToCreature < 80) {
      this.sanity.update(s => Math.max(0, s - 0.45 * (delta * 60)));
      this.globalSanity.drainSanity(0.45 * (delta * 60), 'Proximidad de la criatura');
    } else if (this.battery() <= 0) {
      this.sanity.update(s => Math.max(0, s - 0.2 * (delta * 60)));
      this.globalSanity.drainSanity(0.2 * (delta * 60), 'Oscuridad total');
    }

    // Creature catches player
    if (distToCreature < 18 && this.hasLineOfSight(this.creatureX, this.creatureY)) {
      this.lose('jeff');
    }
  }

  private lose(killer: 'jeff' | 'painter'): void {
    if (this.status() !== 'PLAYING') return;
    this.killedBy.set(killer); this.status.set('LOST');
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.effects.triggerGlitch(5, 600);
    this.effects.triggerDirectSubliminal('IT\'S ME');
    this.globalSanity.drainSanity(50, 'Captura fatal');
  }

  private updatePainterAI(delta: number): void {
    if (this.gameTime() < 12) return;
    if (this.painterStun > 0) { this.painterStun -= delta; this.painterState.set('STUNNED'); return; }
    const dx = this.painterX - this.playerX; const dy = this.painterY - this.playerY;
    const distance = Math.hypot(dx, dy);
    const visible = distance < 125 && this.hasLineOfSight(this.painterX, this.painterY);
    const angle = Math.atan2(dy, dx) - this.playerAngle;
    const illuminated = visible && this.battery() > 0 && Math.abs(this.playerPitch) < .35 && Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) < .4;
    if (distance < 16 && visible) { this.lose('painter'); return; }
    if (illuminated) {
      this.painterState.set('ALERT'); this.painterWait += delta;
      if (this.painterWait > 1.2) { this.painterStun = 3.5; this.painterWait = 0; this.encounter.set('Bloody Painter protege su máscara de la luz. Aprovecha para alejarte.'); }
      return;
    }
    this.painterWait = Math.max(0, this.painterWait - delta);
    this.painterState.set(visible ? 'CHASE' : 'PATROL');
    if (visible) this.painterTarget = {x: this.playerX, y: this.playerY};
    else if (Math.hypot(this.painterTarget.x - this.painterX, this.painterTarget.y - this.painterY) < 10) {
      const room = [[5, 2], [10, 4], [8, 8]][Math.floor(Math.random() * 3)];
      this.painterTarget = {x: room[0] * this.cellSize + 16, y: room[1] * this.cellSize + 16};
    }
    const next = this.nextWaypoint(this.painterTarget.x, this.painterTarget.y, this.painterX, this.painterY);
    const length = Math.hypot(next.x - this.painterX, next.y - this.painterY);
    const speed = this.creatureSpeed * (visible ? .85 : .55) * delta * 60;
    if (length > .1) {
      const mx = (next.x - this.painterX) / length * Math.min(length, speed);
      const my = (next.y - this.painterY) / length * Math.min(length, speed);
      if (!this.checkWallCollision(this.painterX + mx, this.painterY, 7)) this.painterX += mx;
      if (!this.checkWallCollision(this.painterX, this.painterY + my, 7)) this.painterY += my;
    }
    if (visible && distance < 65) this.sanity.update(value => Math.max(0, value - delta * 2));
  }

  private movePlayerWithCollision(dx: number, dy: number): void {
    const radius = 6;
    const nextX = this.playerX + dx;
    const nextY = this.playerY + dy;

    if (!this.checkWallCollision(nextX, this.playerY, radius)) {
      this.playerX = nextX;
    }
    if (!this.checkWallCollision(this.playerX, nextY, radius)) {
      this.playerY = nextY;
    }
  }

  private checkWallCollision(px: number, py: number, radius: number): boolean {
    const cellX = Math.floor(px / this.cellSize);
    const cellY = Math.floor(py / this.cellSize);

    if (cellX < 0 || cellX >= this.cols || cellY < 0 || cellY >= this.rows) {
      return true;
    }

    const cell = this.grid[cellY][cellX];
    const localX = px - cellX * this.cellSize;
    const localY = py - cellY * this.cellSize;

    if (cell.top && localY - radius <= 0) return true;
    if (cell.bottom && localY + radius >= this.cellSize) return true;
    if (cell.left && localX - radius <= 0) return true;
    if (cell.right && localX + radius >= this.cellSize) return true;

    return false;
  }

  private checkItemCollisions(): void {
    for (const item of this.items) {
      if (!item.collected) {
        const d = Math.hypot(this.playerX - item.x, this.playerY - item.y);
        if (d < 18) {
          item.collected = true;
          this.audio.playClick();
          if (item.type === 'key') {
            this.encounter.set('Llave recuperada. La puerta del fondo ya puede abrirse.');
            this.hasKey.set(true);
            this.globalSanity.restoreSanity(15);
          } else if (item.type === 'battery') {
            this.battery.update(b => Math.min(100, b + 40));
            this.globalSanity.restoreSanity(10);
          } else if (item.type === 'lore' && item.loreSnippet) {
            this.encounter.set(item.loreSnippet);
            this.loreFound.update(list => [...list, item.loreSnippet!]);
            this.globalSanity.restoreSanity(8);
          }
        }
      }
    }
  }

  private updateCreatureAI(delta: number): void {
    // If stunned by flashlight
    if (this.creatureStunTimer > 0) {
      this.creatureStunTimer -= delta;
      this.creatureStateInternal = 'STUNNED';
      this.creatureState.set('STUNNED');
      return;
    }

    const dx = this.playerX - this.creatureX;
    const dy = this.playerY - this.creatureY;
    const distToPlayer = Math.hypot(dx, dy);

    // Check if player's flashlight is shining on creature
    const angleToCreature = Math.atan2(-dy, -dx);
    let diffAngle = angleToCreature - this.playerAngle;
    while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

    const flashlightRange = this.battery() > 25 ? 130 : 65;
    const inFlashlightCone = Math.abs(diffAngle) < 0.45 && Math.abs(this.playerPitch) < 0.35 && distToPlayer < flashlightRange && this.battery() > 0 && this.hasLineOfSight(this.creatureX, this.creatureY);

    if (inFlashlightCone) {
      this.creatureIlluminatedTimer += delta;
      if (this.creatureIlluminatedTimer >= 1.5) {
        // Stun creature for 2.6 seconds!
        this.creatureStunTimer = 2.6;
        this.creatureIlluminatedTimer = 0;
        this.audio.playStaticGlitch(0.3);
        return;
      }
    } else {
      this.creatureIlluminatedTimer = Math.max(0, this.creatureIlluminatedTimer - delta * 0.5);
    }

    // Creature State Machine (PATROL, ALERT, CHASE)
    if (distToPlayer < 90 || inFlashlightCone) {
      this.creatureStateInternal = 'CHASE';
      this.creatureTargetX = this.playerX;
      this.creatureTargetY = this.playerY;
    } else if (distToPlayer < 180) {
      this.creatureStateInternal = 'ALERT';
      this.creatureTargetX = this.playerX;
      this.creatureTargetY = this.playerY;
    } else {
      this.creatureStateInternal = 'PATROL';
      const distToWp = Math.hypot(this.creatureX - this.creatureTargetX, this.creatureY - this.creatureTargetY);
      if (distToWp < 15) {
        const randX = Math.floor(Math.random() * this.cols) * this.cellSize + this.cellSize * 0.5;
        const randY = Math.floor(Math.random() * this.rows) * this.cellSize + this.cellSize * 0.5;
        this.creatureTargetX = randX;
        this.creatureTargetY = randY;
      }
    }

    this.creatureState.set(this.creatureStateInternal);

    // Move creature towards target
    const targetDx = this.creatureTargetX - this.creatureX;
    const targetDy = this.creatureTargetY - this.creatureY;
    const targetDist = Math.hypot(targetDx, targetDy);

    if (targetDist > 2) {
      const step = this.creatureSpeed * (delta * 60);
      const waypoint = this.nextWaypoint(this.creatureTargetX, this.creatureTargetY);
      const routeDx = waypoint.x - this.creatureX;
      const routeDy = waypoint.y - this.creatureY;
      const routeDist = Math.max(1, Math.hypot(routeDx, routeDy));
      const moveX = (routeDx / routeDist) * Math.min(step, routeDist);
      const moveY = (routeDy / routeDist) * Math.min(step, routeDist);

      // Soft collision for creature
      if (!this.checkWallCollision(this.creatureX + moveX, this.creatureY, 8)) {
        this.creatureX += moveX;
      }
      if (!this.checkWallCollision(this.creatureX, this.creatureY + moveY, 8)) {
        this.creatureY += moveY;
      }
    }
  }

  private hasLineOfSight(x: number, y: number): boolean {
    const distance = Math.hypot(x - this.playerX, y - this.playerY);
    for (let d = 2; d < distance; d += 2) {
      if (this.checkWallCollision(this.playerX + (x - this.playerX) * d / distance, this.playerY + (y - this.playerY) * d / distance, 1)) return false;
    }
    return true;
  }

  private nextWaypoint(tx: number, ty: number, fromX = this.creatureX, fromY = this.creatureY): {x: number; y: number} {
    const sx = Math.floor(fromX / this.cellSize);
    const sy = Math.floor(fromY / this.cellSize);
    const gx = Math.floor(tx / this.cellSize);
    const gy = Math.floor(ty / this.cellSize);
    if (sx === gx && sy === gy) return {x: tx, y: ty};
    const routeKey = `${sx},${sy}:${gx},${gy}`;
    let next = this.routeCache.get(routeKey);
    if (!next) {
    const queue = [[sx, sy]];
    const parents = new Map<string, number[]>();
    parents.set(`${sx},${sy}`, [sx, sy]);
    for (const [x, y] of queue) {
      if (x === gx && y === gy) break;
      const cell = this.grid[y][x];
      for (const [nx, ny, blocked] of [[x, y - 1, cell.top], [x + 1, y, cell.right], [x, y + 1, cell.bottom], [x - 1, y, cell.left]] as [number, number, boolean][]) {
        const key = `${nx},${ny}`;
        if (!blocked && nx >= 0 && ny >= 0 && nx < this.cols && ny < this.rows && !parents.has(key)) {
          parents.set(key, [x, y]); queue.push([nx, ny]);
        }
      }
    }
    next = [gx, gy];
    if (!parents.has(`${gx},${gy}`)) return {x: fromX, y: fromY};
    while (true) {
      const parent: number[] = parents.get(`${next[0]},${next[1]}`)!;
      if (parent[0] === sx && parent[1] === sy) break;
      next = parent;
    }
    this.routeCache.set(routeKey, next);
    }
    const centerX = sx * this.cellSize + this.cellSize / 2;
    const centerY = sy * this.cellSize + this.cellSize / 2;
    // Align with the doorway before entering the neighboring room.
    if ((next[0] !== sx && Math.abs(fromY - centerY) > 2) || (next[1] !== sy && Math.abs(fromX - centerX) > 2)) return {x: centerX, y: centerY};
    return {x: next[0] * this.cellSize + this.cellSize / 2, y: next[1] * this.cellSize + this.cellSize / 2};
  }
}
