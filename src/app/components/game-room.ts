import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MazeGame} from './maze-game';
import {AudioEngine} from '../services/audio-engine';

@Component({
  selector: 'app-game-room',
  imports: [MazeGame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './game-room.css',
  template: `
    <main class="game-room">
      <header class="room-header">
        <div class="room-brand"><span class="live-dot"></span><div><span>EL ARCHIVO OLVIDADO</span><h1>CORREDOR 13 <small>ESTANCIA INDEPENDIENTE</small></h1></div></div>
        <nav aria-label="Opciones del juego">
          <a [href]="archiveUrl">← Volver al Archivo</a>
          <button type="button" (click)="audio.enableSound(!audio.isEnabled())">{{ audio.isEnabled() ? 'Sonido: activo' : 'Sonido: apagado' }}</button>
          <button type="button" (click)="game.fullscreen()">Pantalla completa · horizontal</button>
        </nav>
      </header>
      <section class="room-stage" aria-label="La Casa del Azogue"><app-maze-game #game /></section>
      <footer class="room-footer"><span>WASD / flechas · ratón o arrastre para mirar · Esc / P pausa</span><span>JEFF THE KILLER + BLOODY PAINTER · NO ESTÁS SOLO</span></footer>
    </main>
  `,
})
export class GameRoom {
  readonly audio = inject(AudioEngine);
  readonly archiveUrl = (() => { const url = new URL(window.location.href); url.searchParams.delete('play'); url.hash = 'juego'; return url.href; })();
}
