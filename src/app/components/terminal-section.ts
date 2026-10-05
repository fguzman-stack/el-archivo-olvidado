import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MazeGame} from './maze-game';

@Component({
  selector: 'app-terminal-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MazeGame],
  template: `
    <section id="juego" class="horror-section game-section" aria-label="Corredor 13: juego de terror en primera persona">
      <header class="game-heading">
        <div><span class="game-eyebrow">ARCHIVO INTERACTIVO / TRANSMISIÓN 013</span>
          <h2>CORREDOR 13</h2>
          <p>No estás viendo una grabación. Estás dentro.</p>
        </div>
        <div class="game-controls"><span>WASD caminar · ratón / arrastre mirar · Esc pausa<br>Recupera las pruebas y encuentra la salida.</span><a class="new-tab-game" [href]="gameUrl" target="_blank" rel="noopener">Jugar en una nueva pestaña ↗</a></div>
      </header>
      <main class="game-stage">
        @defer (on viewport) { <app-maze-game /> }
        @placeholder { <div class="game-placeholder">TRANSMISIÓN 013 · Conectando con la casa…</div> }
      </main>
    </section>
  `,
})
export class TerminalSection {
  readonly gameUrl = (() => { const url = new URL(window.location.href); url.searchParams.set('play', '1'); url.hash = ''; return url.href; })();
}
