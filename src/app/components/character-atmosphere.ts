import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import type {CharacterSignature} from '../data/characters.data';

@Component({
  selector: 'app-character-atmosphere',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './character-atmosphere.css',
  template: `
    @if (signature(); as fx) {
      <div class="signature-field" [attr.data-kind]="fx.kind" [style.--signature-color]="fx.color" [class.compact]="compact()" aria-hidden="true">
        @for (mark of marks; track mark) {
          <span class="signature-mark" [style.--i]="mark" [style.left.%]="(mark * 31 + seed()) % 94" [style.top.%]="(mark * 19 + seed()) % 86" [style.animationDelay.s]="-mark * .7">{{ fx.symbol }}</span>
        }
        @if (fx.kind === 'clock') {
          <svg class="signature-clock" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><path d="M50 10V17M90 50H83M50 90V83M10 50H17"/><g class="clock-hand"><path d="M50 50V23M50 50L67 61"/></g></svg>
        }
        @if (fx.kind === 'eyes') {
          <svg class="signature-eye" viewBox="0 0 100 60"><path d="M5 30Q50-10 95 30Q50 70 5 30Z"/><circle cx="50" cy="30" r="13"/><circle cx="50" cy="30" r="5"/></svg>
        }
        <div class="signature-edge"></div>
      </div>
    }
  `,
})
export class CharacterAtmosphere {
  signature = input<CharacterSignature>();
  compact = input(false);
  seed = input(0);
  readonly marks = [1, 2, 3, 4, 5, 6, 7];
}
