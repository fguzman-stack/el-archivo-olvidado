# El Archivo Olvidado

Experiencia web de horror interactivo construida con Angular. Reune expedientes de creepypastas, leyendas latinoamericanas, entidades liminales, rituales arcanos, audio atmosférico y una terminal CRT con juego de supervivencia.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación se sirve por defecto en `http://localhost:3000`.

## Scripts

- `npm run dev`: servidor local de desarrollo.
- `npm run build`: compilación de producción.
- `npm run watch`: compilación en modo observación.
- `npm run test`: pruebas unitarias.
- `npm run lint`: análisis estático.

## Estructura Principal

- `src/app/components`: secciones visuales, expedientes, terminal, HUD y efectos.
- `src/app/data`: datos de personajes y rituales.
- `src/app/services`: audio, progreso, temas, linterna y efectos globales.
- `src/styles.css`: estilos globales, animaciones y utilidades visuales.

## Expedientes

Cada personaje tiene una ficha con identidad, evidencia, conexiones y efectos visuales propios. Algunos expedientes incluyen interacciones especiales que alteran la hoja, activan sonido o revelan pistas forenses.
