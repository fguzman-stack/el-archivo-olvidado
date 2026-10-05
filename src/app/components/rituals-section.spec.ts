import {ElementRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {RitualsSection} from './rituals-section';
import {AudioEngine} from '../services/audio-engine';
import {ProgressTracker} from '../services/progress';
import {EffectsController} from '../services/effects';
import {SanityController} from '../services/sanity';

describe('Mirror consent and ritual lifecycle', () => {
  let ritual: RitualsSection;
  let originalMedia: PropertyDescriptor | undefined;
  const stop = vi.fn();
  const stream = {getTracks: () => [{stop}]} as unknown as MediaStream;
  beforeEach(() => {
    vi.useFakeTimers(); stop.mockClear();
    originalMedia = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
    TestBed.configureTestingModule({providers: [
      {provide: ElementRef, useValue: new ElementRef(document.createElement('div'))},
      {provide: AudioEngine, useValue: {playTypewriterKey: vi.fn(), playStaticGlitch: vi.fn()}},
      {provide: ProgressTracker, useValue: {markRitualCompleted: vi.fn()}},
      {provide: EffectsController, useValue: {triggerDirectSubliminal: vi.fn()}},
      {provide: SanityController, useValue: {drainSanity: vi.fn()}},
    ]});
    ritual = TestBed.runInInjectionContext(() => new RitualsSection());
    const video = document.createElement('video'); video.play = vi.fn().mockResolvedValue(undefined);
    ritual.mirrorVideo = new ElementRef(video);
  });
  afterEach(() => {
    ritual.ngOnDestroy(); vi.useRealTimers();
    if (originalMedia) Object.defineProperty(navigator, 'mediaDevices', originalMedia);
    else Reflect.deleteProperty(navigator, 'mediaDevices');
  });
  function media(getUserMedia: ReturnType<typeof vi.fn>): void { Object.defineProperty(navigator, 'mediaDevices', {configurable: true, value: {getUserMedia}}); }

  it('requests video only on explicit activation and stops tracks when leaving', async () => {
    const permission = vi.fn().mockResolvedValue(stream); media(permission);
    expect(permission).not.toHaveBeenCalled(); await ritual.enableCamera();
    expect(permission).toHaveBeenCalledWith(expect.objectContaining({audio: false}));
    expect(ritual.cameraActive()).toBe(true);
    ritual.selectRitual(1); expect(stop).toHaveBeenCalledOnce(); expect(ritual.cameraActive()).toBe(false);
  });

  it('disposes a late permission result after leaving the mirror', async () => {
    let resolve!: (stream: MediaStream) => void;
    media(vi.fn().mockReturnValue(new Promise<MediaStream>(done => { resolve = done; })));
    const pending = ritual.enableCamera(); ritual.selectRitual(1); resolve(stream); await pending;
    expect(stop).toHaveBeenCalledOnce(); expect(ritual.cameraActive()).toBe(false); expect(ritual.cameraPending()).toBe(false);
  });

  it('keeps the simulated mirror usable after permission denial', async () => {
    media(vi.fn().mockRejectedValue(new Error('Permission denied'))); await ritual.enableCamera();
    expect(ritual.cameraPending()).toBe(false); expect(ritual.cameraMessage()).toContain('simulado');
    ritual.startMirrorHold(); vi.advanceTimersByTime(10000); expect(ritual.mirrorComplete()).toBe(true);
  });

  it('cannot accelerate the ten-second hold through duplicate input', () => {
    ritual.startMirrorHold(); ritual.startMirrorHold(); vi.advanceTimersByTime(5000);
    expect(ritual.mirrorProgress()).toBe(50);
    ritual.stopMirrorHold(); expect(ritual.mirrorProgress()).toBe(0);
    vi.advanceTimersByTime(10000); expect(ritual.mirrorComplete()).toBe(false);
  });

  it('marks completion only after performing the ritual', () => {
    ritual.selectRitual(0);
    expect(TestBed.inject(ProgressTracker).markRitualCompleted).not.toHaveBeenCalled();
    ritual.startMirrorHold(); vi.advanceTimersByTime(10000);
    expect(TestBed.inject(ProgressTracker).markRitualCompleted).toHaveBeenCalledWith('bloody-mary');
  });
});
