import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {GameEngine} from './game-engine';
import {AudioEngine} from './audio-engine';
import {ProgressTracker} from './progress';
import {EffectsController} from './effects';
import {SanityController} from './sanity';

describe('House game progression', () => {
  let engine: GameEngine;
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({providers: [
      {provide: AudioEngine, useValue: {playClick: vi.fn(), playHeartbeat: vi.fn(), playFootstep: vi.fn(), playHorrorLaugh: vi.fn(), playWhisperMurmur: vi.fn(), playElevatorBell: vi.fn()}},
      {provide: ProgressTracker, useValue: {saveMazeScore: vi.fn()}},
      {provide: EffectsController, useValue: {triggerGlitch: vi.fn(), triggerDirectSubliminal: vi.fn()}},
      {provide: SanityController, useValue: {drainSanity: vi.fn(), restoreSanity: vi.fn()}},
    ]});
    engine = TestBed.inject(GameEngine); engine.startNewGame();
  });
  afterEach(() => { engine.stopGame(); vi.useRealTimers(); });

  it('keeps every room and objective reachable from the entrance', () => {
    const queue = [[0, 0]]; const visited = new Set(['0,0']);
    for (const [x, y] of queue) {
      const cell = engine.grid[y][x];
      for (const [nx, ny, blocked] of [[x, y - 1, cell.top], [x + 1, y, cell.right], [x, y + 1, cell.bottom], [x - 1, y, cell.left]] as [number, number, boolean][]) {
        if (!blocked && !visited.has(`${nx},${ny}`)) { expect(engine.grid[ny]?.[nx]).toBeDefined(); visited.add(`${nx},${ny}`); queue.push([nx, ny]); }
      }
    }
    expect(visited.size).toBe(engine.rows * engine.cols);
  });

  it('freezes time, battery and movement while paused', () => {
    engine.pauseGame(); const x = engine.playerX;
    vi.advanceTimersByTime(5000); engine.update(1, 1, 0, 0);
    expect(engine.gameTime()).toBe(0); expect(engine.battery()).toBe(100); expect(engine.playerX).toBe(x);
    engine.resumeGame(); vi.advanceTimersByTime(1000); expect(engine.gameTime()).toBe(1);
  });

  it('requires both evidence notes and the key to escape', () => {
    engine.playerX = engine.exitX; engine.playerY = engine.exitY;
    engine.hasKey.set(true); engine.update(0, 0, 0, 0);
    expect(engine.status()).toBe('PLAYING');
    engine.loreFound.set(['Cinta A', 'Cinta B']); engine.update(0, 0, 0, 0);
    expect(engine.status()).toBe('WON');
    expect(TestBed.inject(ProgressTracker).saveMazeScore).toHaveBeenCalled();
  });

  it('collects evidence only once and makes it readable', () => {
    const note = engine.items.find(item => item.type === 'lore')!;
    engine.playerX = note.x; engine.playerY = note.y;
    engine.update(0, 0, 0, 0); engine.update(0, 0, 0, 0);
    expect(engine.loreFound()).toEqual([note.loreSnippet]); expect(engine.encounter()).toBe(note.loreSnippet);
  });

  it('resets camera and inventory when restarting', () => {
    engine.playerPitch = 1; engine.hasKey.set(true); engine.loreFound.set(['old']);
    engine.startNewGame(); expect(engine.playerPitch).toBe(0); expect(engine.hasKey()).toBe(false); expect(engine.loreFound()).toEqual([]);
  });

  it('allows walking through room doorways without crossing closed walls', () => {
    const start = engine.grid[0][0];
    const destination = !start.right ? {x: 48, y: 16} : {x: 16, y: 48};
    engine.playerX = 16; engine.playerY = 16; engine.creatureStunTimer = 100;
    for (let i = 0; i < 70; i++) engine.update(1 / 60, destination.x === 48 ? 1 : 0, destination.y === 48 ? 1 : 0, 0);
    expect(Math.hypot(engine.playerX - destination.x, engine.playerY - destination.y)).toBeLessThan(3);
    engine.playerX = 16; engine.playerY = 16;
    for (let i = 0; i < 70; i++) engine.update(1 / 60, -1, 0, Math.PI);
    expect(engine.playerX).toBeGreaterThanOrEqual(6);
  });
});
