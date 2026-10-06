/** Frame-time feedback with hysteresis; UI pauses must not count as slow frames. */
export class MobileRenderQuality {
  private elapsed = 0;
  private frames = 0;
  private healthyWindows = 0;
  private readonly maximum: number;
  private ratio: number;

  constructor(deviceRatio: number) {
    this.maximum = Math.min(deviceRatio, 1);
    this.ratio = this.maximum;
  }

  get pixelRatio(): number { return this.ratio; }

  sample(delta: number): boolean {
    if (delta <= 0 || delta > .2) { this.reset(); return false; }
    this.elapsed += delta;
    this.frames++;
    if (this.elapsed < 1) return false;
    const average = this.elapsed / this.frames;
    this.elapsed = 0; this.frames = 0;
    const previous = this.ratio;
    if (average > .022) {
      this.ratio = Math.max(Math.min(.6, this.maximum), this.ratio - .1);
      this.healthyWindows = 0;
    } else if (average < .018) {
      // Recover more slowly than we degrade, to avoid resolution oscillation.
      if (++this.healthyWindows >= 5) {
        this.ratio = Math.min(this.maximum, this.ratio + .1);
        this.healthyWindows = 0;
      }
    } else this.healthyWindows = 0;
    return Math.abs(previous - this.ratio) > .001;
  }

  reset(): void { this.elapsed = 0; this.frames = 0; this.healthyWindows = 0; }
}
