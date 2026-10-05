export type RitualType =
  | 'bloody_mary'
  | 'ouija'
  | 'charlie'
  | 'name_candle'
  | 'elevator'
  | 'vhs'
  | 'window_3am'
  | 'whisper';

export interface Ritual {
  id: string;
  type: RitualType;
  title: string;
  subtitle: string;
  rule: string;
  warning: string;
  loreSnippet: string;
  icon: string;
}

export const RITUALS: Ritual[] = [
  {
    id: 'bloody-mary',
    type: 'bloody_mary',
    title: 'El Espejo de Azogue',
    subtitle: 'La Invocación de Bloody Mary',
    rule: 'Posiciona tu mirada fija sobre el reflejo oscuro del cristal y mantén presionado el centro durante 10 segundos continuos sin apartar la vista ni pestañear.',
    warning: 'Si el cristal comienza a agrietarse o la silueta tras tu hombro abre los ojos antes de tiempo, retira los dedos de inmediato y voltea el espejo boca abajo.',
    loreSnippet: 'El azogue antiguo no refleja lo que eres, sino lo que espera al otro lado de la luz plateada.',
    icon: 'visibility'
  },
  {
    id: 'ouija',
    type: 'ouija',
    title: 'El Tablero de Cenizas',
    subtitle: 'La Tabla Ouija Espiritual',
    rule: 'Coloca tus yemas sobre la planchette de roble y formula una pregunta corta a los espíritus que rondan este recinto.',
    warning: 'Bajo ninguna circunstancia retires la planchette hacia los bordes antes de despedir la sesión pronunciando "ADIÓS". Dejar la puerta abierta es una invitación irrevocable.',
    loreSnippet: 'Las letras grabadas en madera quemada canalizan pulsaciones del subconsciente y frecuencias de radio sepulcrales.',
    icon: 'touch_app'
  },
  {
    id: 'charlie-charlie',
    type: 'charlie',
    title: 'Los Lápices Cruzados',
    subtitle: 'El Susurro de Charlie Charlie',
    rule: 'Dos lápices en perfecto equilibrio sobre una cruz de papel dividida en SÍ y NO. Mantén la concentración y pregunta en voz baja si la presencia está presente.',
    warning: 'Si el lápiz superior cae al suelo rodando hacia ti sin detenerse, la entidad se ha desprendido del papel.',
    loreSnippet: 'El más leve aliento es suficiente para romper el equilibrio entre dos planos contiguos.',
    icon: 'compare_arrows'
  },
  {
    id: 'name-candle',
    type: 'name_candle',
    title: 'La Vela del Nombre',
    subtitle: 'El Ósculo de Cera y Sangre',
    rule: 'Escribe el nombre del destinatario, pulsa Prender y aguarda a que el calor revele el presagio.',
    warning: 'Nunca apagues la llama con un soplido directo; ahógala con la palma de la mano o el fuego recordará tu rostro en tus pesadillas.',
    loreSnippet: 'El fuego de sebo negro consume la tinta antes de que se seque, dejando solo palabras condenadas.',
    icon: 'whatshot'
  },
  {
    id: 'elevator',
    type: 'elevator',
    title: 'El Ascensor al Otro Mundo',
    subtitle: 'La Secuencia 4-2-6-2-10-5',
    rule: 'Introduce minuciosamente la secuencia numérica en el panel de pisos del montacargas clausurado sin vacilar ni saltar ninguna estación intermedia.',
    warning: 'En el quinto piso una mujer entrará a la cabina. Está terminantemente prohibido mirarla a la cara, hablarle o intentar salir antes de que las puertas se cierren.',
    loreSnippet: 'La arquitectura vertical de los rascacielos crea vacíos en las dimensiones cuando los cables cruzan frecuencias armónicas.',
    icon: 'elevator'
  },
  {
    id: 'vhs',
    type: 'vhs',
    title: 'La Cinta Sin Etiqueta',
    subtitle: 'Transmisión 03:17 AM',
    rule: 'Presiona PLAY en la pletina de cabezales sucios y ajusta la rueda de tracking para decodificar la señal de vídeo grabada en cinta magnética desmagnetizada.',
    warning: 'No intentes rebobinar si ves una silueta caminando por tu propio pasillo en la pantalla del televisor.',
    loreSnippet: 'El óxido de hierro de las cintas VHS degrada los recuerdos de quien las contempla repetidas veces.',
    icon: 'videocam'
  },
  {
    id: 'window-3am',
    type: 'window_3am',
    title: 'La Ventana de las Tres',
    subtitle: 'La Hora Muerta',
    rule: 'Espera pacientemente a que el minutero alcance las 03:00 AM para observar qué silueta aguarda detrás del marco de cristal.',
    warning: 'Si escuchas tres golpes leves en el cristal desde el exterior estando en un cuarto piso, no corras las cortinas.',
    loreSnippet: 'A las tres de la madrugada la barrera entre el mundo físico y el etéreo se adelgaza hasta parecer papel de fumar.',
    icon: 'access_time'
  },
  {
    id: 'whisper',
    type: 'whisper',
    title: 'El Susurro de la Pared',
    subtitle: 'Frecuencia EVP Subatómica',
    rule: 'Pulsa Escuchar la pared para activar el receptor acústico y sintonizar los murmullos atrapados en las grietas del yeso.',
    warning: 'Usa auriculares a volumen moderado. Si comienzas a escuchar tu propio nombre de pila deletreado en reversa, interrumpe la conexión.',
    loreSnippet: 'El yeso poroso absorbe las últimas palabras pronunciadas en habitaciones donde alguien dejó de respirar.',
    icon: 'hearing'
  }
];
