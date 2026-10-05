# El Archivo Olvidado

Experiencia web de horror interactivo construida con Angular 21 y Three.js. Reúne expedientes de creepypastas, leyendas latinoamericanas, entidades liminales, ocho rituales, audio atmosférico y una casa abandonada en primera persona.

**Web:** https://fguzman-stack.github.io/el-archivo-olvidado/

## Requisitos

- Node.js 22.12 o superior (recomendado: Node 22 LTS)
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
- `npm run build:pages`: producción con la ruta base `/el-archivo-olvidado/`.
- `npm run watch`: compilación en modo observación.
- `npm run test`: pruebas unitarias.
- `npm run lint`: análisis estático.

## Estructura Principal

- `src/app/components`: secciones visuales, expedientes, terminal, HUD y efectos.
- `src/app/data`: datos de personajes y rituales.
- `src/app/services`: audio, progreso, temas, linterna y efectos globales.
- `src/app/services/house-world.ts`: renderizado Three.js, materiales procedurales, mobiliario, sangre y personajes estilizados. Se carga bajo demanda al iniciar la historia.
- `src/app/services/game-engine.ts`: habitaciones conectadas, colisiones, persecución, inventario, pausas y objetivos.
- `src/styles.css`: estilos globales, animaciones y utilidades visuales.

## Expedientes

Cada personaje tiene una ficha con identidad, evidencia, conexiones y efectos visuales propios. Algunos expedientes incluyen interacciones especiales que alteran la hoja, activan sonido o revelan pistas forenses.

El archivo reúne **61 expedientes**. Masky y Hoodie tienen fichas individuales; Slender Doll y Nightmare Ally comparten una sola identidad. Los nuevos perfiles están en `src/app/data/extended-characters.data.ts`, con referencias visibles y notas que distinguen relatos, series, rediseños y versiones de fans. Candy Cane usa una historia que la fuente identifica expresamente como inventada por un fan; Nemesis corresponde a **The Reaper Nemesis**. Las evidencias escénicas no forman parte de los relatos originales.

Las firmas visuales incluyen pinceladas de Bloody Painter, relojes de Clockwork, hilos de The Puppeteer, pétalos de Offenderman, cascabeles y dulces, suturas, vigilancia y apariciones espectrales. Se activan al explorar una tarjeta o abrir un expediente y respetan la preferencia de movimiento reducido. Las ilustraciones SVG son locales y solo se admiten desde el catálogo interno.

## Rituales y espejo con cámara

Los ocho rituales tienen escenas diferenciadas: espejo de azogue, tablero Ouija, lápices cruzados, vela, ascensor, cinta VHS, ventana de las tres y receptor EVP. El tablero deletrea su respuesta; el ascensor revela una presencia; el tracking VHS permite recuperar la señal.

En el espejo, **Activar cámara frontal** solicita permiso del navegador. La cámara es opcional; sin permiso se mantiene la simulación. El vídeo se muestra localmente, sin grabaciones, cargas ni acceso al micrófono. El reflejo se oscurece y aparece Bloody Mary al mantener pulsado el cristal diez segundos. También funciona manteniendo Espacio con el espejo enfocado.

La cámara se apaga al cambiar de ritual, salir de la sección, ocultar la pestaña o pulsar **Apagar cámara**. Solicitudes pendientes se invalidan al salir. Requiere HTTPS o `localhost`; una dirección HTTP de la red local no permite probarla en un teléfono. GitHub Pages utiliza HTTPS.

El progreso de un ritual se guarda al ejecutarlo, no al seleccionarlo.

## La Casa del Azogue — juego 3D

La historia empieza con un prólogo de cuatro fragmentos, que se puede avanzar o saltar. Explora una casa de habitaciones y pasillos conectados, con madera deteriorada, humedad, mobiliario, sangre, iluminación cálida y niebla. Recupera **la llave y las dos pruebas**, y alcanza la puerta de salida.

- **Jeff the Killer:** perseguidor con navegación por las habitaciones, sonrisa y cuchillo. Iluminarlo de frente durante 1,5 segundos lo detiene temporalmente.
- **Bloody Painter:** modelo de chaqueta azul y máscara blanca, lienzos con sonrisas rojas y patrulla independiente. Comienza a moverse después de 12 segundos; iluminarlo de frente durante 1,2 segundos lo detiene durante 3,5 segundos. La derrota identifica al perseguidor que te atrapó. Ambos dejan rastros en el suelo.
- **Slender Man:** figura sin rostro que cambia de ubicación y desaparece periódicamente.
- **Smile Dog:** presencia física en una habitación y efecto psicológico al mirarlo de cerca.
- **Sonic.exe:** televisor maldito y aparición 3D durante la partida.

Son modelos estilizados creados con geometría y texturas procedurales, sin recursos externos ni modelos descargados. Las risas, susurros, latidos y ambientes se sintetizan con Web Audio y respetan el control de sonido y volumen de la web.

### Controles

- **Computadora:** WASD para avanzar, retroceder y desplazarse lateralmente; ratón para mirar en ambos ejes. Haz clic en la escena para capturar el ratón; Escape libera la captura y pausa.
- **Alternativa de teclado:** flechas izquierda/derecha para girar, Page Up / Page Down para mirar arriba/abajo; Q/E para desplazamiento lateral.
- **Celular:** cruceta táctil para movimiento y arrastre sobre la escena para mirar. Ambas acciones se pueden realizar simultáneamente.
- **Pausa:** Escape o P; P también reanuda. Permite ajustar sensibilidad, consultar las pruebas y salir. Se activa al abandonar la sección o perder el foco de la ventana.
- **Pantalla completa:** incluye la escena y el HUD; en móvil solicita orientación horizontal. Si el navegador no admite el bloqueo, muestra una indicación para girar el dispositivo.
- **Pestaña independiente:** «Jugar en una nueva pestaña» abre `?play=1`, con decoración, sonido, pantalla completa y enlace de regreso al Archivo. La URL conserva el subdirectorio de GitHub Pages y puede recargarse directamente.

Tres dificultades cambian la velocidad de los perseguidores y el consumo de batería. Los récords se guardan por dificultad. Three.js se carga de forma diferida, las paredes se dibujan mediante instancias y las rutas se reutilizan. La resolución se limita a 1,5× y baja a 1× si se detectan fotogramas lentos. El renderizado se detiene al pausar y la animación se reduce si el sistema solicita menos movimiento. El navegador necesita WebGL y aceleración gráfica.

## Verificación y publicación

```bash
npm run lint
npm test -- --watch=false
npm run build:pages
```

Las pruebas cubren conectividad de habitaciones, pausa, requisitos de escape, recogida de pruebas, reinicio, consentimiento de cámara, permisos tardíos, rechazo de permisos y duración del ritual del espejo.

`.github/workflows/pages.yml` compila y verifica automáticamente cada push a `master`, y publica `dist/app/browser` mediante GitHub Actions. En **Settings → Pages → Build and deployment**, la fuente debe ser **GitHub Actions**. No requiere servidor de backend ni claves de API.
