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
        <span class="game-controls">W/S avanzar · A/D girar · Q/E lateral<br>Encuentra la llave y la puerta de salida.</span>
      </header>
      <main class="game-stage"><app-maze-game /></main>
    </section>
  `,
})
export class TerminalSection {}
