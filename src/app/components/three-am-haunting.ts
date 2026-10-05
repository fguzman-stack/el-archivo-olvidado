import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal} from '@angular/core';

interface HauntingEntity {
  name: string;
  mark: string;
  phrase: string;
  accent: string;
}

const ENTITIES: HauntingEntity[] = [
  {name: 'Slender Man', mark: 'NO EYES', phrase: 'El bosque acaba de entrar al archivo.', accent: '#cfc7b5'},
  {name: 'BEN Drowned', mark: 'YOU SHOULD NOT', phrase: 'La pagina recuerda una partida que no jugaste.', accent: '#4c7f5b'},
  {name: 'Smile Dog', mark: 'SPREAD', phrase: 'Hay una sonrisa guardada en la cache.', accent: '#a01a14'},
  {name: 'Jeff the Killer', mark: 'GO TO SLEEP', phrase: 'No cierres la pestana. No todavia.', accent: '#ff3322'},
  {name: 'Zalgo', mark: 'HE COMES', phrase: 'El texto esta respirando debajo del vidrio.', accent: '#7a1f1a'},
];

@Component({
  selector: 'app-three-am-haunting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      @let entity = activeEntity();
      <aside
        class="three-am-haunt"
        [style.--haunt-accent]="entity.accent"
        aria-live="polite"
        aria-label="Interferencia de las tres de la manana"
      >
        <div class="haunt-static"></div>
        <div class="haunt-vignette"></div>
        <div class="haunt-tear haunt-tear-a"></div>
        <div class="haunt-tear haunt-tear-b"></div>
        <div class="haunt-figure" aria-hidden="true">
          <div class="haunt-head"></div>
          <div class="haunt-body"></div>
          <div class="haunt-arm haunt-arm-left"></div>
          <div class="haunt-arm haunt-arm-right"></div>
        </div>
        <div class="haunt-eyes haunt-eyes-left" aria-hidden="true"><span></span><span></span></div>
        <div class="haunt-eyes haunt-eyes-right" aria-hidden="true"><span></span><span></span></div>
        <div class="haunt-card">
          <span class="haunt-time">03:00 LOCAL</span>
          <strong>{{ entity.name }}</strong>
          <em>{{ entity.mark }}</em>
          <p>{{ entity.phrase }}</p>
        </div>
      </aside>
    }
  `,
  styles: [`
    :host { display: contents; }

    .three-am-haunt {
      --haunt-accent: #a01a14;
      position: fixed;
      inset: 0;
      z-index: 70;
      pointer-events: none;
      overflow: hidden;
      mix-blend-mode: normal;
      isolation: isolate;
      animation: haunt-shock 8s steps(1, end) infinite;
    }

    .haunt-static,
    .haunt-vignette,
    .haunt-tear,
    .haunt-figure,
    .haunt-card,
    .haunt-eyes {
      position: absolute;
      pointer-events: none;
    }

    .haunt-static {
      inset: -20%;
      opacity: 0.32;
      background:
        repeating-radial-gradient(circle at 18% 24%, rgba(255,255,255,0.12) 0 1px, transparent 1px 3px),
        repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 5px),
        linear-gradient(90deg, rgba(255,0,0,0.08), rgba(0,255,255,0.04));
      filter: contrast(180%) brightness(130%);
      animation: haunt-static 0.22s steps(2, end) infinite;
    }

    .haunt-vignette {
      inset: 0;
      background:
        radial-gradient(circle at 50% 48%, transparent 0 28%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.92) 100%),
        linear-gradient(110deg, rgba(122,31,26,0.28), transparent 42%, rgba(0,0,0,0.45));
      box-shadow: inset 0 0 140px rgba(0,0,0,0.98);
      animation: haunt-pulse 5.8s ease-in-out infinite;
    }

    .haunt-tear {
      top: -10%;
      bottom: -10%;
      width: 15vw;
      background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--haunt-accent), transparent 45%), transparent);
      filter: blur(10px);
      opacity: 0.45;
      transform: skewX(-8deg);
      animation: haunt-tear 4.5s ease-in-out infinite;
    }

    .haunt-tear-a { left: 9%; animation-delay: -1.7s; }
    .haunt-tear-b { right: 14%; width: 9vw; animation-delay: -3s; }

    .haunt-figure {
      left: 50%;
      bottom: 5vh;
      width: clamp(150px, 24vw, 320px);
      height: clamp(300px, 64vh, 650px);
      transform: translateX(-50%);
      opacity: 0.34;
      filter: drop-shadow(0 0 36px var(--haunt-accent));
      animation: haunt-approach 9s ease-in-out infinite;
    }

    .haunt-head {
      position: absolute;
      left: 50%;
      top: 0;
      width: 28%;
      height: 14%;
      border-radius: 48% 48% 42% 42%;
      background: #d8d4c7;
      transform: translateX(-50%);
      box-shadow: inset 0 -24px 30px rgba(0,0,0,0.32);
    }

    .haunt-body {
      position: absolute;
      left: 50%;
      top: 13%;
      width: 34%;
      height: 72%;
      transform: translateX(-50%);
      background: linear-gradient(90deg, #080808, #1b1718 45%, #080808);
      clip-path: polygon(28% 0, 72% 0, 83% 100%, 58% 100%, 51% 45%, 43% 100%, 16% 100%);
    }

    .haunt-arm {
      position: absolute;
      top: 19%;
      width: 8%;
      height: 80%;
      background: #090909;
      transform-origin: top center;
      border-radius: 999px;
    }

    .haunt-arm-left { left: 20%; transform: rotate(16deg); }
    .haunt-arm-right { right: 20%; transform: rotate(-16deg); }

    .haunt-eyes {
      display: flex;
      gap: 10px;
      opacity: 0;
      animation: haunt-eyes 7s steps(1, end) infinite;
    }

    .haunt-eyes-left { left: 8vw; top: 23vh; animation-delay: -1s; }
    .haunt-eyes-right { right: 10vw; bottom: 22vh; animation-delay: -3.4s; }

    .haunt-eyes span {
      width: clamp(10px, 2vw, 22px);
      height: clamp(10px, 2vw, 22px);
      border-radius: 50%;
      background: var(--haunt-accent);
      box-shadow: 0 0 18px var(--haunt-accent), 0 0 45px var(--haunt-accent);
    }

    .haunt-card {
      left: clamp(14px, 4vw, 52px);
      bottom: clamp(80px, 9vh, 110px);
      max-width: min(360px, calc(100vw - 28px));
      padding: 14px 16px 13px;
      border: 1px solid color-mix(in srgb, var(--haunt-accent), white 24%);
      background: linear-gradient(135deg, rgba(10,9,8,0.9), rgba(24,10,10,0.74));
      color: #e7ded0;
      box-shadow: 0 0 34px rgba(0,0,0,0.85), 0 0 28px color-mix(in srgb, var(--haunt-accent), transparent 30%);
      font-family: 'Special Elite', 'Courier New', monospace;
      text-transform: uppercase;
      transform: rotate(-1deg);
      animation: haunt-card 6.5s steps(2, end) infinite;
    }

    .haunt-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid rgba(255,255,255,0.08);
      transform: translate(4px, -4px);
    }

    .haunt-time {
      display: block;
      color: var(--haunt-accent);
      font-size: 11px;
      letter-spacing: 0.22em;
      margin-bottom: 5px;
    }

    .haunt-card strong,
    .haunt-card em,
    .haunt-card p { display: block; }

    .haunt-card strong {
      font-size: clamp(18px, 4.2vw, 34px);
      line-height: 1;
      text-shadow: 2px 0 rgba(255,0,0,0.45), -2px 0 rgba(0,255,255,0.28);
    }

    .haunt-card em {
      color: #0a0908;
      background: var(--haunt-accent);
      width: fit-content;
      margin-top: 8px;
      padding: 3px 7px 2px;
      font-size: 12px;
      font-style: normal;
      letter-spacing: 0.18em;
    }

    .haunt-card p {
      margin: 10px 0 0;
      font-size: 12px;
      line-height: 1.45;
      color: #cfc7b5;
      text-transform: none;
    }

    @keyframes haunt-static {
      0% { transform: translate3d(-1%, -1%, 0); }
      50% { transform: translate3d(1.5%, 0.8%, 0); }
      100% { transform: translate3d(-0.5%, 1.3%, 0); }
    }

    @keyframes haunt-pulse {
      0%, 100% { opacity: 0.72; filter: brightness(1); }
      45% { opacity: 0.95; filter: brightness(0.82) saturate(1.4); }
      47% { opacity: 0.4; filter: brightness(1.45) saturate(2); }
      49% { opacity: 0.9; filter: brightness(0.75); }
    }

    @keyframes haunt-tear {
      0%, 100% { transform: translateY(-8%) skewX(-8deg); opacity: 0.12; }
      50% { transform: translateY(10%) skewX(-14deg); opacity: 0.5; }
    }

    @keyframes haunt-approach {
      0%, 100% { transform: translateX(-50%) scale(0.94); opacity: 0.22; }
      50% { transform: translateX(-50%) scale(1.04); opacity: 0.42; }
      52% { transform: translateX(calc(-50% + 10px)) scale(1.08); opacity: 0.58; }
      54% { transform: translateX(calc(-50% - 8px)) scale(0.98); opacity: 0.28; }
    }

    @keyframes haunt-eyes {
      0%, 18%, 100% { opacity: 0; transform: translateY(0); }
      19%, 25% { opacity: 0.95; transform: translateY(-4px); }
      26% { opacity: 0; }
    }

    @keyframes haunt-card {
      0%, 100% { transform: rotate(-1deg) translateX(0); filter: none; }
      35% { transform: rotate(-1deg) translateX(0); }
      36% { transform: rotate(0.5deg) translateX(8px); filter: hue-rotate(20deg); }
      37% { transform: rotate(-1.4deg) translateX(-5px); filter: hue-rotate(-30deg); }
      38% { transform: rotate(-1deg) translateX(0); filter: none; }
    }

    @keyframes haunt-shock {
      0%, 8%, 100% { filter: none; }
      9% { filter: contrast(1.6) brightness(0.72) hue-rotate(-20deg); }
      10% { filter: contrast(1.2) brightness(1.2); }
      11% { filter: none; }
    }

    @media (max-width: 640px) {
      .haunt-card {
        bottom: 74px;
        padding: 12px 13px;
      }
      .haunt-figure {
        bottom: 9vh;
        opacity: 0.28;
      }
      .haunt-eyes-left { left: 7vw; top: 18vh; }
      .haunt-eyes-right { right: 7vw; bottom: 30vh; }
    }

    @media (prefers-reduced-motion: reduce) {
      .three-am-haunt,
      .haunt-static,
      .haunt-vignette,
      .haunt-tear,
      .haunt-figure,
      .haunt-card,
      .haunt-eyes {
        animation: none;
      }
      .haunt-static { opacity: 0.16; }
      .haunt-figure { opacity: 0.22; }
    }
  `],
})
export class ThreeAmHaunting implements OnInit, OnDestroy {
  readonly isActive = signal(false);
  readonly entityIndex = signal(0);
  readonly activeEntity = computed(() => ENTITIES[this.entityIndex()]);

  private clockTimer: number | undefined;
  private entityTimer: number | undefined;

  ngOnInit(): void {
    this.refreshState();
    this.clockTimer = window.setInterval(() => this.refreshState(), 30_000);
    this.entityTimer = window.setInterval(() => {
      if (!this.isActive()) return;
      this.entityIndex.set((this.entityIndex() + 1) % ENTITIES.length);
    }, 18_000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
    if (this.entityTimer) window.clearInterval(this.entityTimer);
  }

  private refreshState(): void {
    const now = new Date();
    const active = now.getHours() === 3;
    this.isActive.set(active);
    if (active) {
      this.entityIndex.set(Math.floor(now.getMinutes() / 12) % ENTITIES.length);
    }
  }
}
