import {MobileRenderQuality} from './mobile-render-quality';

describe('Mobile rendering frame budget', () => {
  function runFrames(quality: MobileRenderQuality, count: number, delta: number): void {
    for (let i = 0; i < count; i++) quality.sample(delta);
  }

  it('caps high-DPI phones at CSS resolution before the first frame', () => {
    expect(new MobileRenderQuality(3).pixelRatio).toBe(1);
    expect(new MobileRenderQuality(.8).pixelRatio).toBe(.8);
  });

  it('reduces sustained 30fps load below 1x and respects the readability floor', () => {
    const quality = new MobileRenderQuality(3);
    runFrames(quality, 31, 1 / 30);
    expect(quality.pixelRatio).toBeCloseTo(.9);
    runFrames(quality, 300, 1 / 30);
    expect(quality.pixelRatio).toBeCloseTo(.6);
  });

  it('ignores isolated stutters and paused/background gaps', () => {
    const quality = new MobileRenderQuality(2);
    runFrames(quality, 40, 1 / 60);
    quality.sample(.08);
    runFrames(quality, 20, 1 / 60);
    expect(quality.pixelRatio).toBe(1);
    runFrames(quality, 15, 1 / 30);
    quality.sample(2);
    runFrames(quality, 40, 1 / 60);
    expect(quality.pixelRatio).toBe(1);
  });

  it('requires sustained headroom before recovering and never exceeds the cap', () => {
    const quality = new MobileRenderQuality(3);
    runFrames(quality, 31, 1 / 30);
    runFrames(quality, 240, 1 / 60);
    expect(quality.pixelRatio).toBeCloseTo(.9);
    runFrames(quality, 61, 1 / 60);
    expect(quality.pixelRatio).toBeCloseTo(1);
    runFrames(quality, 600, 1 / 60);
    expect(quality.pixelRatio).toBe(1);
  });
});
