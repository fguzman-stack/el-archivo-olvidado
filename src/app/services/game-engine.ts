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
  playerSpeed = 1.6;

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

  setDifficulty(diff: GameDifficulty): void {
    this.difficulty.set(diff);
  }

  startNewGame(): void {
    this.generateMaze();
    this.spawnEntities();
    this.battery.set(100);
    this.sanity.set(100);
    this.hasKey.set(false);
    this.gameTime.set(0);
    this.loreFound.set([]);
    this.creatureStateInternal = 'PATROL';
    this.creatureState.set('PATROL');
    this.creatureIlluminatedTimer = 0;
    this.creatureStunTimer = 0;
    this.status.set('PLAYING');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status() === 'PLAYING') {
        this.gameTime.update(t => t + 1);

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

    // Exit is at bottom-right
    this.exitX = (this.cols - 1) * this.cellSize + this.cellSize * 0.5;
    this.exitY = (this.rows - 1) * this.cellSize + this.cellSize * 0.5;

    // Creature starts near bottom center
    this.creatureX = Math.floor(this.cols / 2) * this.cellSize + this.cellSize * 0.5;
    this.creatureY = (this.rows - 2) * this.cellSize + this.cellSize * 0.5;
    this.creatureTargetX = this.creatureX;
    this.creatureTargetY = this.creatureY;

    // Adjust creature speed by difficulty
    const diff = this.difficulty();
    this.creatureSpeed = diff === 'easy' ? 0.75 : diff === 'normal' ? 1.05 : 1.35;

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
    if (this.status() !== 'PLAYING') return;

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
    if (distToExit < 20 && this.hasKey()) {
      this.status.set('WON');
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.progress.saveMazeScore(this.difficulty(), this.gameTime());
      this.audio.playElevatorBell();
      return;
    }

    // Creature AI update
    this.updateCreatureAI(delta);

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
    if (distToCreature < 18) {
      this.status.set('LOST');
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.effects.triggerGlitch(5, 600);
      this.effects.triggerDirectSubliminal('IT\'S ME');
      this.globalSanity.drainSanity(50, 'Captura fatal');
    }
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

    if (cell.top && localY - radius < 0) return true;
    if (cell.bottom && localY + radius > this.cellSize) return true;
    if (cell.left && localX - radius < 0) return true;
    if (cell.right && localX + radius > this.cellSize) return true;

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
            this.hasKey.set(true);
            this.globalSanity.restoreSanity(15);
          } else if (item.type === 'battery') {
            this.battery.update(b => Math.min(100, b + 40));
            this.globalSanity.restoreSanity(10);
          } else if (item.type === 'lore' && item.loreSnippet) {
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
    const angleToCreature = Math.atan2(dy, dx);
    let diffAngle = angleToCreature - this.playerAngle;
    while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

    const flashlightRange = this.battery() > 25 ? 130 : 65;
    const inFlashlightCone = Math.abs(diffAngle) < 0.45 && distToPlayer < flashlightRange && this.battery() > 0;

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
      const moveX = (targetDx / targetDist) * step;
      const moveY = (targetDy / targetDist) * step;

      // Soft collision for creature
      if (!this.checkWallCollision(this.creatureX + moveX, this.creatureY, 8)) {
        this.creatureX += moveX;
      }
      if (!this.checkWallCollision(this.creatureX, this.creatureY + moveY, 8)) {
        this.creatureY += moveY;
      }
    }
  }
}
