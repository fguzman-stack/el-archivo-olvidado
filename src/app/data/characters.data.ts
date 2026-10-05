import {ADDITIONAL_CHARACTERS, CHARACTER_SIGNATURES} from './extended-characters.data';

export type CharacterCategory = 'internet' | 'games' | 'liminal' | 'latin';

export interface CharacterSignature {
  kind: 'paint' | 'clock' | 'threads' | 'petals' | 'candy' | 'eyes' | 'stitches' | 'specter' | 'static' | 'blood' | 'blades';
  symbol: string;
  label: string;
  color: string;
}

export interface CharacterTheme {
  scene: 'forest' | 'backrooms' | 'river' | 'red_room' | 'submerged' | 'corrupt' | 'rural_road' | 'block_mist' | 'void' | 'asylum' | 'carnival' | 'television' | 'crypt' | 'mountain';
  accentColor: string;
  particles: 'fog' | 'dust' | 'bubbles' | 'static' | 'embers' | 'blood_mist';
  glitchLevel: number; // 0 to 5
  fogDensity: number; // 0.1 to 1.0
  flashlightColor: string;
  droneFreq: number; // Hz for Web Audio drone
}

export interface DossierArtifact {
  title: string;
  badge: string;
  loreText: string;
  paperStyle: 'glitch' | 'blood' | 'water' | 'ashes' | 'scratches' | 'mold' | 'tar';
  tag: string;
  samplePhrase?: string;
}

export interface Character {
  id: string;
  name: string;
  alias: string;
  category: CharacterCategory;
  year: string;
  origin: string;
  summary: string;
  threatLevel: 1 | 2 | 3 | 4 | 5;
  proximitySign: string;
  disturbingNote: string;
  connectedIds: string[];
  silhouetteSvg: string;
  theme: CharacterTheme;
  artifact: DossierArtifact;
  sources?: {label: string; url: string}[];
  versionNote?: string;
  signature?: CharacterSignature;
}

export const CATEGORY_COLORS: Record<CharacterCategory, { name: string; hex: string; desc: string }> = {
  internet: {
    name: 'Leyendas de Internet Clásicas',
    hex: '#7a1f1a', // Rojo sangre oscuro
    desc: 'Pesadillas forjadas en foros olvidados y cadenas de correos.'
  },
  games: {
    name: 'Videojuegos y Medios Malditos',
    hex: '#3b4a3a', // Verde enfermizo
    desc: 'Cartuchos corrompidos, ejecutables letales y transmisiones fantasma.'
  },
  liminal: {
    name: 'Entidades Liminales y SCP',
    hex: '#cfc7b5', // Gris hueso
    desc: 'Aberraciones geométricas y anomalías de espacios no euclidianos.'
  },
  latin: {
    name: 'Leyendas Latinoamericanas',
    hex: '#d9a441', // Ámbar de linterna
    desc: 'Susurros ancestrales de caminos desiertos, ríos lúgubres y selvas.'
  }
};

const BASE_CHARACTERS: Character[] = [
  // ─── 1. INTERNET CLÁSICAS (12) ───
  {
    id: 'slender-man',
    name: 'Slender Man',
    alias: 'El Operador del Bosque',
    category: 'internet',
    year: '2009',
    origin: 'Foros Something Awful (Eric Knudsen)',
    summary: 'Entidad de altura desproporcionada y extremidades retráctiles que acecha en claros boscosos. Carece de rostro distinguible y porta un traje sastre negro perenne. Quienes caen bajo su radio de influencia padecen la Enfermedad de Slender: episodios de tos hemoptísica aguda, paranoia claustrofóbica, amnesia disociativa y distorsiones visuales análogas a cintas magnéticas corrompidas.',
    threatLevel: 5,
    proximitySign: 'Estática en receptores de audio, sabor metálico punzante en la saliva y sensación de agujas detrás del globo ocular.',
    disturbingNote: 'Los dibujos hallados en el hueco de un pino seco mostraban círculos tachados con sangre infantil seca.',
    connectedIds: ['the-rake', 'masky-hoodie', 'eyeless-jack'],
    silhouetteSvg: '<path d="M48 20 C48 10 52 4 50 2 C48 4 52 10 52 20 Z M46 12 C44 2 56 2 54 12 Z M42 22 L58 22 L62 48 L66 88 L63 98 L55 98 L54 60 L51 98 L47 98 L44 60 L38 88 L34 48 Z M38 28 L24 64 L22 96 M62 28 L76 64 L78 96" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    theme: {
      scene: 'forest',
      accentColor: '#cfc7b5',
      particles: 'fog',
      glitchLevel: 4,
      fogDensity: 0.85,
      flashlightColor: 'rgba(200, 210, 220, 0.25)',
      droneFreq: 58
    },
    artifact: {
      title: 'Las 8 Notas Manuscritas de Rosswood',
      badge: 'EVIDENCIA RECUPERADA #08',
      loreText: 'Ocho bocetos en hojas de cuaderno cuadriculadas arrancadas a tirones. Los círculos tachados en cruz fueron trazados con hollín de abedul y fragmentos epidérmicos. Al acercar una brújula a la hoja, la aguja gira descontrolada.',
      paperStyle: 'glitch',
      tag: '8 NOTAS / CÍRCULO EN CRUZ',
      samplePhrase: '«ALWAYS WATCHES · NO EYES · LEAVE ME ALONE»'
    }
  },
  {
    id: 'jeff-the-killer',
    name: 'Jeff the Killer',
    alias: 'Jeffrey Woods',
    category: 'internet',
    year: '2008',
    origin: 'Newgrounds / YouTube (sesseur)',
    summary: 'Joven desfigurado químicamente tras una ignición de lejía y alcohol. Incapaz de contener una psicopatía desbordante, procedió a amputarse los párpados para jamás pestañear y talló una sonrisa permanente con una hoja de afeitar. Se introduce en habitaciones al filo de las tres de la madrugada susurrando una orden fatal antes de asestar estocadas frenéticas.',
    threatLevel: 4,
    proximitySign: 'Chirrido rítmico de un cuchillo rozando la madera del suelo y un persistente aroma a cloroformo y quemaduras ácidas.',
    disturbingNote: 'La víctima dejó escrito con los dedos en la almohada: "no cerré la persiana del balcón".',
    connectedIds: ['homicidal-liu', 'eyeless-jack'],
    silhouetteSvg: '<circle cx="50" cy="35" r="18" fill="currentColor"/><circle cx="44" cy="32" r="4" fill="#0a0908"/><circle cx="56" cy="32" r="4" fill="#0a0908"/><path d="M38 42 Q50 54 62 42" stroke="#7a1f1a" stroke-width="3" fill="none"/><path d="M35 55 L25 95 L75 95 L65 55 Z" fill="currentColor"/><path d="M68 62 L82 80 L88 74" stroke="currentColor" stroke-width="3"/>',
    theme: {
      scene: 'red_room',
      accentColor: '#a01a14',
      particles: 'blood_mist',
      glitchLevel: 3,
      fogDensity: 0.45,
      flashlightColor: 'rgba(220, 40, 30, 0.28)',
      droneFreq: 72
    },
    artifact: {
      title: 'Hoja de Espejo Tallada con Navaja Barbera',
      badge: 'ARMA Y TEXTO HOMICIDA',
      loreText: 'Trozo de sábana ensangrentada y esquirla de espejo donde se grabó a punta de cuchillo la frase icónica. La sangre no coagula del todo y mantiene un pH corrosivo que oxida los sujetapapeles metálicos.',
      paperStyle: 'blood',
      tag: 'INCISIÓN QUIRÚRGICA / SANGRE COAGULADA',
      samplePhrase: '«GO TO SLEEP · SHHH... SOLO DUÉRMETE»'
    }
  },
  {
    id: 'smile-dog',
    name: 'Smile Dog',
    alias: 'smile.jpg',
    category: 'internet',
    year: '2008',
    origin: '4chan /x/ (Paranormal Board)',
    summary: 'Archivo gráfico maldito que exhibe una criatura semejante a un husky siberiano con una dentadura humana hipertrófica en perpetua mueca de goce canino. Aquel que contempla el archivo sufre ataques epilépticos nocturnos y pesadillas recurrentes donde el can exige: "Difunde la palabra". El suicidio sobreviene si el testigo rehúsa propagar el medio.',
    threatLevel: 3,
    proximitySign: 'Aparición espontánea de archivos corruptos .jpg en carpetas del sistema y jadeos caninos pesados tras puertas cerradas.',
    disturbingNote: 'El disco duro confiscado tenía sectores con temperatura de 88°C aun desconectado de corriente.',
    connectedIds: ['slender-man', 'candle-cove'],
    silhouetteSvg: '<ellipse cx="50" cy="50" rx="30" ry="24" fill="currentColor"/><path d="M30 36 L20 18 L34 26 Z M70 36 L80 18 L66 26 Z" fill="currentColor"/><path d="M36 50 Q50 66 64 50 Q50 56 36 50 Z" fill="#7a1f1a"/><circle cx="40" cy="42" r="3" fill="#d9a441"/><circle cx="60" cy="42" r="3" fill="#d9a441"/>',
    theme: {
      scene: 'corrupt',
      accentColor: '#a01a14',
      particles: 'static',
      glitchLevel: 5,
      fogDensity: 0.6,
      flashlightColor: 'rgba(160, 26, 20, 0.3)',
      droneFreq: 94
    },
    artifact: {
      title: 'Fotografía Térmica con Huella Dental Humana',
      badge: 'VECTOR MEMÉTICO FÍSICO',
      loreText: 'Impresión en papel fotográfico corroído. En los bordes se aprecian indentaciones dentales de 32 piezas humanas adultas y una huella palmar canina impregnada de grasa carmesí.',
      paperStyle: 'blood',
      tag: 'MORDEDURA HUMANA / HUELLA CANINA',
      samplePhrase: '«SPREAD THE WORD · DIFUNDE LA PALABRA»'
    }
  },
  {
    id: 'laughing-jack',
    name: 'Laughing Jack',
    alias: 'El Bufón Monocromático',
    category: 'internet',
    year: '2011',
    origin: 'Creepypasta Wiki (SnuffBomb)',
    summary: 'Payaso espectral desprovisto de tonalidad cromática surgido de una caja de música olvidada en 1800. Inicialmente concebido como amigo imaginario infantil, su confinamiento secular mutó su psique en sádico desmembramiento. Sustituye las golosinas de sus elegidos por clavos oxidados y caramelos rellenos de cristal machacado antes de ejecutar su acto final.',
    threatLevel: 4,
    proximitySign: 'Música de carillón desafinada que resuena en las paredes y olor denso a algodón de azúcar putrefacto.',
    disturbingNote: 'El cirujano extrajo doce metros de serpentina negra del abdomen del paciente en el quirófano 3.',
    connectedIds: ['eyeless-jack', 'slender-man'],
    silhouetteSvg: '<circle cx="50" cy="30" r="16" fill="currentColor"/><path d="M50 30 L50 20 L66 24 Z" fill="currentColor"/><path d="M38 50 L20 95 L80 95 L62 50 Z" fill="currentColor"/><path d="M42 28 Q50 36 58 28" stroke="#0a0908" stroke-width="2" fill="none"/><line x1="20" y1="58" x2="10" y2="90" stroke="currentColor" stroke-width="4"/>',
    theme: {
      scene: 'carnival',
      accentColor: '#cfc7b5',
      particles: 'dust',
      glitchLevel: 3,
      fogDensity: 0.7,
      flashlightColor: 'rgba(180, 180, 180, 0.25)',
      droneFreq: 64
    },
    artifact: {
      title: 'Envoltorio de Caramelo Negro & Clavo Ferroviario',
      badge: 'OBJETO MALDITO CONFISCADO',
      loreText: 'Serpentina de papel crepé blanco y negro empapada en jarabe de glucosa rancia. El clavo oxidado de 10 cm fue recuperado de una caja musical victoriana cuyo manubrio gira en solitario.',
      paperStyle: 'scratches',
      tag: 'SERPENTINA NEGRA / DULCE TÓXICO',
      samplePhrase: '«¿POPCAHN? ¿UN CARAMELO PARA MI PEQUEÑO AMIGO?»'
    }
  },
  {
    id: 'eyeless-jack',
    name: 'Eyeless Jack',
    alias: 'El visitante de la máscara azul',
    category: 'internet',
    year: '2012',
    origin: 'Relato de Azelf5000 (2012), inspirado en una fotografía de 2009',
    summary: 'En el relato original, Mitch descubre que le falta un riñón después de mudarse con su hermano Edwin. Una noche sorprende junto a su cama a una figura con sudadera negra y máscara azul, sin ojos, nariz ni boca visibles. Un líquido negro gotea desde sus cuencas vacías. La historia no establece un nombre humano ni un origen militar para la criatura; esas biografías pertenecen a versiones posteriores de fans.',
    sources: [{label: 'Eyeless Jack · relato y origen de la imagen', url: 'https://www.creepypasta.com/eyeless-jack/'}],
    threatLevel: 4,
    proximitySign: 'Líquido alquitranado goteando del techo sobre las sábanas y una incisión limpia de 5 cm en el flanco lumbar.',
    disturbingNote: 'Se encontró la máscara abandonada; el fluido negro derritió la superficie plástica de la bolsa de pruebas.',
    connectedIds: ['jeff-the-killer', 'ticci-toby'],
    silhouetteSvg: '<circle cx="50" cy="36" r="18" fill="currentColor"/><ellipse cx="43" cy="36" rx="3.5" ry="5" fill="#0a0908"/><ellipse cx="57" cy="36" rx="3.5" ry="5" fill="#0a0908"/><path d="M43 41 L43 52 M57 41 L57 52" stroke="#0a0908" stroke-width="2"/><path d="M30 55 Q50 50 70 55 L75 95 L25 95 Z" fill="currentColor"/>',
    theme: {
      scene: 'asylum',
      accentColor: '#3b4a3a',
      particles: 'fog',
      glitchLevel: 2,
      fogDensity: 0.5,
      flashlightColor: 'rgba(59, 74, 58, 0.28)',
      droneFreq: 46
    },
    artifact: {
      title: 'Muestra de Brea Alquitranada y Bisturí N° 11',
      badge: 'EXUDADO OCULAR CORROSIVO',
      loreText: 'Vial de vidrio sellado que contiene 3 ml de fluido alquitranado. La sustancia continúa exudando calor endotérmico y disolvió el papel secante adyacente dejando bordes carbonizados.',
      paperStyle: 'tar',
      tag: 'BREA VISCOSA / BISTURÍ ANATÓMICO',
      samplePhrase: '«EXTRACCIÓN RENAL DERECHA · SIN ANESTESIA»'
    }
  },
  {
    id: 'ticci-toby',
    name: 'Ticci Toby',
    alias: 'Toby Erin Rogers',
    category: 'internet',
    year: '2014',
    origin: 'DeviantArt (Kastoway)',
    summary: 'Joven afligido por insensibilidad congénita al dolor (CIPA) y síndrome de Tourette severo. Tras el trágico deceso de su hermana en un siniestro automovilístico y el acoso familiar desmedido, sufrió un brote psicótico inducido por el Operador, empuñando dos hachas de carnicero y prendiendo fuego a su propio hogar antes de desvanecerse en la espesura.',
    threatLevel: 3,
    proximitySign: 'Crujidos de cuello espasmódicos en la penumbra y golpes metálicos amortiguados en los árboles circundantes.',
    disturbingNote: 'El informe de toxicología reveló una ausencia total de adrenalina y dolor en sus terminaciones nerviosas.',
    connectedIds: ['slender-man', 'masky-hoodie'],
    silhouetteSvg: '<circle cx="50" cy="34" r="16" fill="currentColor"/><circle cx="43" cy="32" r="5" fill="#d9a441"/><circle cx="57" cy="32" r="5" fill="#d9a441"/><rect x="38" y="38" width="24" height="12" rx="4" fill="#0a0908"/><path d="M32 54 L68 54 L72 96 L28 96 Z" fill="currentColor"/><path d="M22 60 L14 85 M10 80 L18 82 L16 88 Z" stroke="currentColor" stroke-width="3"/>',
    theme: {
      scene: 'forest',
      accentColor: '#d9a441',
      particles: 'embers',
      glitchLevel: 3,
      fogDensity: 0.6,
      flashlightColor: 'rgba(217, 164, 65, 0.25)',
      droneFreq: 82
    },
    artifact: {
      title: 'Muesca de Hacha de Mano & Madera Calcinada',
      badge: 'EVIDENCIA ARSONISTA #19',
      loreText: 'Astilla de abeto con hendidura de impacto de 45 mm. El filo del hacha dejó atrapadas fibras sintéticas de las gafas de protección amarillas que el sospechoso usaba durante las crisis convulsivas.',
      paperStyle: 'ashes',
      tag: 'HENDIDURA DE HACHA / CENIZAS RESIDUALES',
      samplePhrase: '«TIC... TIC... CRUJIDO DE VÉRTEBRA CERVICAL»'
    }
  },
  {
    id: 'masky-hoodie',
    name: 'Masky y Hoodie',
    alias: 'Los Proxies de Marble Hornets',
    category: 'internet',
    year: '2009',
    origin: 'Marble Hornets (YouTube / Troy Wagner)',
    summary: 'Agentes serviles quebrados por la radiación del Operador. Uno porta una máscara de teatro con labios femeninos perfilados en negro azabache; el otro viste una sudadera ocre con un pasamontañas de tela burda con dos ojos y boca cosidos en cruz. Documentan y neutralizan a quienes intentan registrar las incursiones en los bosques de Rosswood.',
    threatLevel: 4,
    proximitySign: 'Fallos súbitos en memorias SD y cintas Hi8, sumados al crujido de pisadas sincronizadas sobre ramas secas.',
    disturbingNote: 'La cinta de vídeo recuperada del río contenía 42 minutos de respiración agitada en cámara oculta.',
    connectedIds: ['slender-man', 'ticci-toby'],
    silhouetteSvg: '<ellipse cx="38" cy="32" rx="12" ry="15" fill="currentColor"/><circle cx="34" cy="30" r="3" fill="#0a0908"/><circle cx="42" cy="30" r="3" fill="#0a0908"/><ellipse cx="64" cy="35" rx="13" ry="16" fill="#3b4a3a"/><line x1="58" y1="32" x2="62" y2="36" stroke="#a01a14" stroke-width="2"/><line x1="68" y1="32" x2="72" y2="36" stroke="#a01a14" stroke-width="2"/><path d="M20 50 L50 50 L52 95 L18 95 Z M52 50 L82 50 L84 95 L50 95 Z" fill="currentColor"/>',
    theme: {
      scene: 'forest',
      accentColor: '#3b4a3a',
      particles: 'fog',
      glitchLevel: 4,
      fogDensity: 0.75,
      flashlightColor: 'rgba(100, 120, 100, 0.25)',
      droneFreq: 52
    },
    artifact: {
      title: 'Fotograma de Cinta Hi8 & Símbolo Trazado en Óxido',
      badge: 'REGISTRO DE VIGILANCIA CINTA #26',
      loreText: 'Carcasa plástica de cinta analógica parcialmente derretida. En el reverso de la etiqueta se halló el sello circular con aspa roja y dos comprimidos ansiolíticos sin identificar pegados con cinta de pintor.',
      paperStyle: 'glitch',
      tag: 'CINTA HI8 / SÍMBOLO OPERADOR',
      samplePhrase: '«NO MIRES LA CÁMARA · ÉL ESTÁ JUSTO DETRÁS»'
    }
  },
  {
    id: 'homicidal-liu',
    name: 'Homicidal Liu',
    alias: 'Liu Woods',
    category: 'internet',
    year: '2012',
    origin: 'VampireStudio (DeviantArt)',
    summary: 'Hermano mayor de Jeffrey Woods, dado por fallecido tras las múltiples heridas punzantes infligidas por Jeff. Milagrosamente intervenido en una clínica de cuidados intensivos clandestina, su cuerpo y rostro quedaron unidos por decenas de grapas de acero quirúrgico. Ahora cobija una doble personalidad dividida entre la compasión filial y un odio psicopático vengador.',
    threatLevel: 3,
    proximitySign: 'Rastro de sangre arterial coagulada y fragmentos de puntos de sutura caídos en el alféizar.',
    disturbingNote: 'Susurró al enfermero de guardia: "Él no terminó la obra, así que me toca a mí corregir las imperfecciones."',
    connectedIds: ['jeff-the-killer'],
    silhouetteSvg: '<circle cx="50" cy="34" r="16" fill="currentColor"/><line x1="38" y1="34" x2="62" y2="34" stroke="#7a1f1a" stroke-width="2"/><line x1="42" y1="31" x2="42" y2="37" stroke="#0a0908" stroke-width="1.5"/><line x1="50" y1="31" x2="50" y2="37" stroke="#0a0908" stroke-width="1.5"/><line x1="58" y1="31" x2="58" y2="37" stroke="#0a0908" stroke-width="1.5"/><path d="M30 52 L70 52 L74 95 L26 95 Z" fill="currentColor"/>',
    theme: {
      scene: 'asylum',
      accentColor: '#7a1f1a',
      particles: 'blood_mist',
      glitchLevel: 2,
      fogDensity: 0.5,
      flashlightColor: 'rgba(180, 40, 40, 0.22)',
      droneFreq: 68
    },
    artifact: {
      title: 'Suturas Quirúrgicas Metálicas y Ficha Médica',
      badge: 'MATERIAL QUIRÚRGICO EXTRAÍDO',
      loreText: 'Cinco grapas de acero quirúrgico arrancadas con tenazas de ferretería. La ficha clínica adjunta contiene el registro de paro cardiorrespiratorio durante 14 minutos antes de la reactivación espontánea.',
      paperStyle: 'blood',
      tag: 'GRAPAS METÁLICAS / HERIDAS CERRADAS',
      samplePhrase: '«MI HERMANO ME DIO LA VIDA AL QUERER QUITARLA»'
    }
  },
  {
    id: 'the-rake',
    name: 'The Rake',
    alias: 'El Espécimen de la Agonía',
    category: 'internet',
    year: '2005',
    origin: '4chan /b/ (New England Folklore)',
    summary: 'Humanoide cuadrúpedo de piel cerosa desprovista de pelo, ojos luminiscentes y garras dorsales desmedidas. Descrito en bitácoras marítimas desde el siglo XVII, se agazapa a los pies de las camas rurales susurrando predicciones en un dialecto incomprensible antes de desgarrar las extremidades del durmiente si este comete el error de observarle fijamente.',
    threatLevel: 5,
    proximitySign: 'Respiración sibilante entrecortada al borde del colchón y calor corporal abrasador en la oscuridad.',
    disturbingNote: 'La entrada en el diario de 1964 finaliza con una sola línea: "He visto sus ojos. Me prometió que regresaría cuando apague la vela."',
    connectedIds: ['slender-man', 'el-chupacabras'],
    silhouetteSvg: '<ellipse cx="50" cy="55" rx="28" ry="16" fill="currentColor"/><circle cx="28" cy="40" r="10" fill="currentColor"/><circle cx="26" cy="38" r="2" fill="#d9a441"/><path d="M40 68 L32 94 L22 94 M60 68 L68 94 L78 94 M22 46 L14 74 L8 88" stroke="currentColor" stroke-width="3" fill="none"/>',
    theme: {
      scene: 'void',
      accentColor: '#cfc7b5',
      particles: 'dust',
      glitchLevel: 4,
      fogDensity: 0.7,
      flashlightColor: 'rgba(217, 164, 65, 0.25)',
      droneFreq: 40
    },
    artifact: {
      title: 'Desgarro Cuádruple en Tabla de Cabecero',
      badge: 'SURCOS DE GARRA EN MADERA',
      loreText: 'Cuatro canales profundos de 14 mm perforados en madera de abedul seco. El filo de las garras arrancó tejido de sábanas que aún contiene saliva desecada con alto contenido de enzimas neurotóxicas.',
      paperStyle: 'scratches',
      tag: 'GARRAS ANIMALES / SALIVA NEURÓTICA',
      samplePhrase: '«ESTÁ A LOS PIES DE TU CAMA... NO TE MUEVAS»'
    }
  },
  {
    id: 'zalgo',
    name: 'Zalgo',
    alias: 'Aquel que Espera Detrás de la Pared',
    category: 'internet',
    year: '2004',
    origin: 'Goon City (Dave Kelly / Shmorky)',
    summary: 'Abominación eldritch sin forma física fija que personifica la corrupción memética total. Se manifiesta corrompiendo tiras cómicas clásicas y páginas web mediante caracteres Unicode distorsionados, bocas sangrantes y ojos ennegrecidos. Posee siete bocas; seis entonan himnos de muerte y la séptima cantará la extinción absoluta de la bóveda terrestre.',
    threatLevel: 5,
    proximitySign: 'Texto en pantallas que comienza a desbordarse verticalmente hacia abajo con glifos ilegibles y sangrado de píxeles.',
    disturbingNote: 'Los servidores del nodo local sufrieron corrupción física en las pistas de cobre con forma de ojos abiertos.',
    connectedIds: ['candle-cove', 'sad-satan'],
    silhouetteSvg: '<path d="M50 15 Q20 40 30 75 Q50 95 70 75 Q80 40 50 15 Z" fill="currentColor"/><circle cx="42" cy="45" r="4" fill="#7a1f1a"/><circle cx="58" cy="45" r="4" fill="#7a1f1a"/><path d="M35 65 Q50 80 65 65 Q50 90 35 65" fill="#7a1f1a"/><path d="M20 20 L35 30 M80 20 L65 30 M15 50 L30 55 M85 50 L70 55" stroke="#7a1f1a" stroke-width="2"/>',
    theme: {
      scene: 'corrupt',
      accentColor: '#7a1f1a',
      particles: 'static',
      glitchLevel: 5,
      fogDensity: 0.8,
      flashlightColor: 'rgba(160, 26, 20, 0.35)',
      droneFreq: 110
    },
    artifact: {
      title: 'Pliego Tipográfico con Sangrado de Glifos Unicode',
      badge: 'INFESTACIÓN TEXTUAL CORRUPTA',
      loreText: 'Documento impreso en prensa tipográfica cuyos tipos de plomo se deformaron creando escorrentías de tinta negra que traspasaron cinco folios. Los glifos cambian de orden al apartar la mirada.',
      paperStyle: 'glitch',
      tag: 'TINTA SANGRANTE / SIETE BOCAS',
      samplePhrase: '«H̸E̶ ̵C̸O̶M̷E̶S̶ · ̵T̶H̴E̶ ̴N̵E̸Z̷P̶E̵R̴D̶I̷A̶N̷ ̸H̸I̶V̴E̴»'
    }
  },
  {
    id: 'bloody-mary',
    name: 'Bloody Mary',
    alias: 'La Dama del Azogue',
    category: 'internet',
    year: 'Folclore Clásico / Década de 1970',
    origin: 'Rituales infantiles anglosajones',
    summary: 'Espíritu atrapado en el plano especular que devora el rostro de quienes osan invocar su nombre tres veces frente a un espejo a oscuras iluminado solo por una vela de sebo. Su figura desciende desde la superficie del cristal, arrancando las córneas del invocador para arrastrarlo al laberinto de plata que yace tras los reflejos quebrados.',
    threatLevel: 4,
    proximitySign: 'Empañamiento espontáneo del espejo con huellas dactilares que emergen desde el interior del cristal.',
    disturbingNote: 'Al retirar el marco de nogal, se encontraron grabadas con alfiler las iniciales de 47 personas desaparecidas.',
    connectedIds: ['la-llorona', 'la-sayona'],
    silhouetteSvg: '<ellipse cx="50" cy="40" rx="20" ry="26" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="38" r="10" fill="currentColor"/><path d="M46 36 L46 44 M54 36 L54 44" stroke="#7a1f1a" stroke-width="2"/><path d="M38 52 L62 52 L66 85 L34 85 Z" fill="currentColor"/><path d="M42 20 Q50 10 58 20" stroke="currentColor" stroke-width="2"/>',
    theme: {
      scene: 'crypt',
      accentColor: '#7a1f1a',
      particles: 'fog',
      glitchLevel: 3,
      fogDensity: 0.7,
      flashlightColor: 'rgba(122, 31, 26, 0.3)',
      droneFreq: 55
    },
    artifact: {
      title: 'Esquirla de Espejo Antiguo de Azogue Ennegrecido',
      badge: 'FRAGMENTO ESPECULAR ROTO',
      loreText: 'Espejo biselado de plata con huellas dactilares grabadas desde la cara interna del cristal. Cuando se ilumina con luz rasante, el reflejo proyecta la imagen invertida de una silueta femenina sin ojos.',
      paperStyle: 'scratches',
      tag: 'AZOGUE QUEBRADO / REFLEJO DIFERIDO',
      samplePhrase: '«YRAM YDOOLB · 3 VECES EN LA OSCURIDAD»'
    }
  },
  {
    id: 'candle-cove',
    name: 'Candle Cove',
    alias: 'Emisión Fantasma Canal 58',
    category: 'internet',
    year: '2009',
    origin: 'Kris Straub (Ichor Falls)',
    summary: 'Supuesta serie de televisión infantil transmitida en 1971 protagonizada por marionetas desvencijadas como Pirate Percy y el Skin-Taker, un esqueleto que portaba vestimentas de piel humana cosida. Los adultos recuerdan únicamente 30 minutos de estática blanca ruidosa mientras los niños miraban hipnotizados la pantalla sin parpadear.',
    threatLevel: 2,
    proximitySign: 'Olor a ozono quemado en televisores CRT desconectados y chillidos agudos en sintonías no asignadas.',
    disturbingNote: 'El testigo declaró: "Mi madre me vio sonriendo durante media hora frente a una pantalla apagada que zumbaba."',
    connectedIds: ['polybius', 'zalgo'],
    silhouetteSvg: '<rect x="25" y="25" width="50" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><line x1="35" y1="15" x2="45" y2="25" stroke="currentColor" stroke-width="2"/><line x1="65" y1="15" x2="55" y2="25" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="45" r="8" fill="currentColor"/><path d="M46 43 L54 43 M46 47 L54 47" stroke="#0a0908" stroke-width="2"/>',
    theme: {
      scene: 'television',
      accentColor: '#cfc7b5',
      particles: 'static',
      glitchLevel: 4,
      fogDensity: 0.5,
      flashlightColor: 'rgba(200, 200, 200, 0.25)',
      droneFreq: 90
    },
    artifact: {
      title: 'Página de Guion Mecanografiado & Quemadura de Cigarrillo',
      badge: 'ARCHIVADOR DE PRODUCCIÓN CANAL 58',
      loreText: 'Hoja de papel bond amarillenta con perforaciones circulares de quemadura térmica. El encabezado "REPARTO: SKIN-TAKER" tiene anotaciones a mano: "El actor no usa máscara de plástico, es piel real tratada con salitre".',
      paperStyle: 'ashes',
      tag: 'GUION 1971 / CIGARRILLO QUEMADO',
      samplePhrase: '«TIENES QUE IR ADENTRO... TIENES QUE ABRIR LA PIEL»'
    }
  },

  // ─── 2. VIDEOJUEGOS Y MEDIOS MALDITOS (5) ───
  {
    id: 'ben-drowned',
    name: 'Ben Drowned',
    alias: 'Haunted Majora\'s Mask',
    category: 'games',
    year: '2010',
    origin: '4chan /x/ (Alexander D. Hall / Jadusable)',
    summary: 'Cartucho pirata de Nintendo 64 adquirido a un anciano que albergaba la consciencia de un menor ahogado en un lago ritual. Al ejecutar el juego, la estatua Elegy of Emptiness persigue al jugador por Termina mientras la música se reproduce invertida y las cajas de diálogo anuncian: "No debiste haber hecho eso". Culmina con el colapso del sistema informático.',
    threatLevel: 4,
    proximitySign: 'Música de carrusel reproduciéndose en reversa en altavoces y olor a lodo estancado en la habitación.',
    disturbingNote: 'El archivo de guardado mostraba la fecha 23 de abril de 2002 con cero corazones y 999 muertes registradas.',
    connectedIds: ['sonic-exe', 'polybius'],
    silhouetteSvg: '<polygon points="50,20 25,45 35,80 65,80 75,45" fill="currentColor"/><circle cx="42" cy="45" r="6" fill="#3b4a3a"/><circle cx="58" cy="45" r="6" fill="#3b4a3a"/><circle cx="42" cy="45" r="2" fill="#7a1f1a"/><circle cx="58" cy="45" r="2" fill="#7a1f1a"/><path d="M40 65 Q50 60 60 65" stroke="#0a0908" stroke-width="3" fill="none"/>',
    theme: {
      scene: 'submerged',
      accentColor: '#3b4a3a',
      particles: 'bubbles',
      glitchLevel: 5,
      fogDensity: 0.75,
      flashlightColor: 'rgba(59, 74, 58, 0.3)',
      droneFreq: 75
    },
    artifact: {
      title: 'Placa de Circuito Sumergida en Agua de Lago',
      badge: 'CARTUCHO N64 PIRATA CORROÍDO',
      loreText: 'Pista de circuito impreso con acumulación de sales acuáticas y limo verdoso. El chip EEPROM contiene un bloque hexadecimal continuo que traduce a: "YOU SHOULDN\'T HAVE DONE THAT".',
      paperStyle: 'water',
      tag: 'LIMO ACUÁTICO / GLITCH BINARIO',
      samplePhrase: '«YOU\'VE MET WITH A TERRIBLE FATE, HAVEN\'T YOU?»'
    }
  },
  {
    id: 'sonic-exe',
    name: 'Sonic.exe',
    alias: 'X / La Entidad del Vacío Digital',
    category: 'games',
    year: '2011',
    origin: 'JC-the-Hyena',
    summary: 'Entidad de pesadilla nacida en el éter digital que copió el aspecto del erizo azul clásico para tender trampas a niños solícitos en foros de emulación. En su plano de pixeles sangrientos, los animales del bosque yacen crucificados, el cielo arde en rojo Carmesí y la velocidad supersónica se torna en cacería implacable donde "Él es Dios".',
    threatLevel: 4,
    proximitySign: 'Risas agudas de 8 bits saliendo del disco óptico y manchas de corrosión roja en el metal de la consola.',
    disturbingNote: 'El monitor del usuario quedó congelado con un renderizado anatómico de retina humana sangrante.',
    connectedIds: ['ben-drowned', 'herobrine'],
    silhouetteSvg: '<circle cx="50" cy="45" r="22" fill="currentColor"/><path d="M50 23 L30 10 L40 30 Z M50 23 L70 10 L60 30 Z M50 23 L50 4 Z" fill="currentColor"/><circle cx="43" cy="42" r="5" fill="#0a0908"/><circle cx="57" cy="42" r="5" fill="#0a0908"/><circle cx="43" cy="42" r="2" fill="#7a1f1a"/><circle cx="57" cy="42" r="2" fill="#7a1f1a"/><path d="M38 54 Q50 66 62 54" stroke="#7a1f1a" stroke-width="2" fill="none"/>',
    theme: {
      scene: 'corrupt',
      accentColor: '#a01a14',
      particles: 'static',
      glitchLevel: 5,
      fogDensity: 0.65,
      flashlightColor: 'rgba(160, 26, 20, 0.3)',
      droneFreq: 105
    },
    artifact: {
      title: 'Disquete de 3.5" Calcinado con Grabado a Navaja',
      badge: 'MEDIO DE ALMACENAMIENTO CORRUPTO',
      loreText: 'Soporte magnético con la carcasa plástica deformada por microondas casero. En la ventana metálica protectora se grabó: "I AM GOD". Al inspeccionarlo con lupa se observan restos de piel quemada.',
      paperStyle: 'glitch',
      tag: 'PIXELES SANGRANTES / BLOQUES 16-BIT',
      samplePhrase: '«I AM GOD · ERES DEMASIADO LENTO PARA ESCAPAR»'
    }
  },
  {
    id: 'herobrine',
    name: 'Herobrine',
    alias: 'El Minero de Ojos Blancos',
    category: 'games',
    year: '2010',
    origin: '4chan /v/ / Brocraft Stream',
    summary: 'Figura con el skin por defecto del avatar Steve pero con globos oculares desprovistos de pupila que irradian una luminiscencia albina. Construye pirámides cuadradas perfectas en el océano, túneles de 2x2 en roca madre y deshoja los robles centenarios en mundos monojugador sin mods. Se desvanece en la densa niebla a mínima distancia de renderizado.',
    threatLevel: 3,
    proximitySign: 'Árboles sin copa de hojas a lo largo del horizonte y antorchas de redstone colocadas en orden inverso.',
    disturbingNote: 'Los registros del servidor no guardaron dirección IP para el usuario que conectó durante la tormenta eléctrica.',
    connectedIds: ['sonic-exe', 'polybius'],
    silhouetteSvg: '<rect x="36" y="20" width="28" height="28" fill="currentColor"/><rect x="40" y="30" width="6" height="4" fill="#cfc7b5"/><rect x="54" y="30" width="6" height="4" fill="#cfc7b5"/><rect x="30" y="48" width="40" height="45" fill="currentColor"/><rect x="20" y="48" width="10" height="35" fill="currentColor"/><rect x="70" y="48" width="10" height="35" fill="currentColor"/>',
    theme: {
      scene: 'block_mist',
      accentColor: '#3b4a3a',
      particles: 'fog',
      glitchLevel: 3,
      fogDensity: 0.9,
      flashlightColor: 'rgba(200, 210, 200, 0.25)',
      droneFreq: 48
    },
    artifact: {
      title: 'Polvo de Arena de Alma & Fragmento de Pico de Hierro',
      badge: 'RESIDUO DIGITAL CÚBICO',
      loreText: 'Muestra granulada de origen sintético que desafía la física de partículas. La captura fotográfica muestra la niebla densa a 4 chunks con dos píxeles blancos que no varían con la iluminación ambiental.',
      paperStyle: 'glitch',
      tag: 'NIEBLA CÚBICA / OJOS ALBINOS',
      samplePhrase: '«ESTÁS SOLO EN ESTE MUNDO... O ESO CREÍAS»'
    }
  },
  {
    id: 'polybius',
    name: 'Polybius',
    alias: 'Máquina Arcade MK-Ultra',
    category: 'games',
    year: '1981',
    origin: 'Suburbios de Portland, Oregón',
    summary: 'Mueble arcade negro azabache instalado en salones recreativos periféricos. El videojuego consistía en disparar a una nave central mientras patrones caleidoscópicos giraban a frecuencias estroboscópicas diseñadas por agencias militares para probar control mental, causando amnesia anterógrada, terrores nocturnos y náuseas violentas antes de que hombres de negro retiraran la placa base.',
    threatLevel: 3,
    proximitySign: 'Zumbido de transformador de 60 Hz y mareo repentino con pérdida del equilibrio al acercarse a monitores CRT.',
    disturbingNote: 'El operario del salón arcade encontró el cajetín de monedas repleto de crucifijos doblados y molares.',
    connectedIds: ['sad-satan', 'candle-cove'],
    silhouetteSvg: '<polygon points="30,95 30,30 40,15 60,15 70,30 70,95" fill="currentColor"/><rect x="38" y="30" width="24" height="20" fill="#0a0908"/><circle cx="50" cy="65" r="4" fill="#d9a441"/><rect x="38" y="75" width="24" height="15" fill="#0a0908"/>',
    theme: {
      scene: 'television',
      accentColor: '#3b4a3a',
      particles: 'static',
      glitchLevel: 4,
      fogDensity: 0.5,
      flashlightColor: 'rgba(59, 74, 58, 0.28)',
      droneFreq: 88
    },
    artifact: {
      title: 'Diagrama de Circuito Lógico con Censura Militar',
      badge: 'DESCLASIFICACIÓN MK-ULTRA 1981',
      loreText: 'Esquema de la placa base PCB modelo Sinneslöschen. Todas las patillas del generador de frecuencias vectoriales están tachadas con tinta densa para evitar replicación de la señal subliminal.',
      paperStyle: 'glitch',
      tag: 'CENSURA MILITAR / SEÑAL SUBLIMINAL',
      samplePhrase: '«CONFORM · CONSUME · SUBMIT · SLEEP»'
    }
  },
  {
    id: 'sad-satan',
    name: 'Sad Satan',
    alias: 'El Laberinto de la Deep Web',
    category: 'games',
    year: '2015',
    origin: 'YouTube (Obscure Horror Corner)',
    summary: 'Juego desarrollado en el motor Terror Engine descargado desde un enlace .onion del foro de la red Tor. El protagonista recorre pasillos oscuros y claustrofóbicos mientras se intercalan fotografías de escenas de crímenes reales, discursos invertidos de asesinos en serie y el llanto incesante de niños. Aquellos que lo descargaron reportaron malware destructivo que incineró tarjetas gráficas.',
    threatLevel: 4,
    proximitySign: 'Desaceleración irreversible del ventilador del procesador y distorsión de audio con susurros en bucle.',
    disturbingNote: 'El archivo descargado contenía una partición encriptada con coordenadas geográficas de fosas clandestinas.',
    connectedIds: ['polybius', 'backrooms'],
    silhouetteSvg: '<circle cx="50" cy="30" r="14" fill="currentColor"/><path d="M42 44 L58 44 L64 95 L36 95 Z" fill="currentColor"/><line x1="20" y1="20" x2="80" y2="80" stroke="#7a1f1a" stroke-width="2"/><line x1="80" y1="20" x2="20" y2="80" stroke="#7a1f1a" stroke-width="2"/>',
    theme: {
      scene: 'void',
      accentColor: '#7a1f1a',
      particles: 'static',
      glitchLevel: 5,
      fogDensity: 0.85,
      flashlightColor: 'rgba(122, 31, 26, 0.28)',
      droneFreq: 62
    },
    artifact: {
      title: 'Volcado Hexadecimal de Paquetes de Servidor .onion',
      badge: 'REGISTRO DE TRÁFICO RED TOR',
      loreText: 'Impresión en papel continuo de impresora matricial. Se detectaron pistas de audio esteganográficas con grabaciones de interrogatorios en sótanos clandestinos de la década de 1970.',
      paperStyle: 'glitch',
      tag: 'RED TOR / ESTÁTICA MATRICIAL',
      samplePhrase: '«5 0 2 0 4 1 6 · EL SUELO ESTÁ HECHO DE DIENTES»'
    }
  },

  // ─── 3. ENTIDADES LIMINALES Y SCP (5) ───
  {
    id: 'backrooms',
    name: 'Los Backrooms',
    alias: 'Nivel 0: El Vértigo Monocromático',
    category: 'liminal',
    year: '2019',
    origin: '4chan /4chan/ x /par/ (Anon)',
    summary: 'Espacio no euclidiano infinito al que se accede cuando una persona atraviesa accidentalmente los límites de la realidad tangible ("noclip"). Consta de unos seiscientos millones de millas cuadradas divididas en salas desoladas con papel tapiz amarillento envejecido, alfombras humedecidas y luces fluorescentes que zumban a máxima potencia. En sus esquinas acechan Sabuesos y Sonrientes.',
    threatLevel: 5,
    proximitySign: 'Sensación de ingravidez en el calzado, olor a moho dulce y un zumbido eléctrico monótono constante.',
    disturbingNote: 'El explorador caminó en línea recta durante dieciséis días sin hallar ventanas, puertas exteriores ni alimento.',
    connectedIds: ['scp-173', 'siren-head'],
    silhouetteSvg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="3"/><line x1="20" y1="20" x2="35" y2="35" stroke="currentColor" stroke-width="2"/><line x1="80" y1="20" x2="65" y2="35" stroke="currentColor" stroke-width="2"/><line x1="20" y1="80" x2="35" y2="65" stroke="currentColor" stroke-width="2"/><line x1="80" y1="80" x2="65" y2="65" stroke="currentColor" stroke-width="2"/><rect x="35" y="35" width="30" height="30" fill="currentColor"/>',
    theme: {
      scene: 'backrooms',
      accentColor: '#d9a441',
      particles: 'dust',
      glitchLevel: 3,
      fogDensity: 0.4,
      flashlightColor: 'rgba(217, 164, 65, 0.22)',
      droneFreq: 60
    },
    artifact: {
      title: 'Muestra de Papel Tapiz Amarillo Húmedo & Alfombra',
      badge: 'RECORTE ESPACIO NO EUCLIDIANO',
      loreText: 'Muestra arrancada de yeso y vinilo mohoso. El olor a humedad no se disipa al secarse con calor. Las mediciones de radiación electromagnética fluctúan en múltiplos de 60 Hz sin cableado cercano.',
      paperStyle: 'mold',
      tag: 'VINILO AMARILLO / MOFO PERSISTENTE',
      samplePhrase: '«NOCLIP DETECTADO · 600 MILLONES DE MILLAS CUADRADAS»'
    }
  },
  {
    id: 'scp-173',
    name: 'SCP-173',
    alias: 'La Escultura / El Primer Objeto',
    category: 'liminal',
    year: '2007',
    origin: '4chan /x/ (Fundación SCP)',
    summary: 'Estructura construida en hormigón armado y varillas de acero cubierta con aerosol de la marca Krylon. Permanece completamente inanimada mientras esté dentro de la línea de visión directa de cualquier ser vivo. Si la mirada se interrumpe incluso por un parpadeo de medio segundo, se desplaza a velocidad supersónica quebrando las vértebras cervicales de las víctimas.',
    threatLevel: 4,
    proximitySign: 'Sonido de raspado de piedra seca contra el suelo de hormigón y acumulación de heces y sangre en las esquinas.',
    disturbingNote: 'El protocolo exige que tres investigadores entren juntos y anuncien sus parpadeos por turnos en voz alta.',
    connectedIds: ['backrooms', 'siren-head'],
    silhouetteSvg: '<ellipse cx="50" cy="35" rx="16" ry="20" fill="currentColor"/><circle cx="44" cy="30" r="3" fill="#3b4a3a"/><circle cx="56" cy="30" r="3" fill="#3b4a3a"/><circle cx="50" cy="40" r="4" fill="#7a1f1a"/><ellipse cx="50" cy="72" rx="18" ry="22" fill="currentColor"/><path d="M32 70 L24 88 M68 70 L76 88" stroke="currentColor" stroke-width="4"/>',
    theme: {
      scene: 'crypt',
      accentColor: '#cfc7b5',
      particles: 'dust',
      glitchLevel: 1,
      fogDensity: 0.35,
      flashlightColor: 'rgba(207, 199, 181, 0.25)',
      droneFreq: 44
    },
    artifact: {
      title: 'Ficha de Contención de la Fundación - Clase Euclid/Keter',
      badge: 'DOCUMENTACIÓN OFICIAL FUNDACIÓN SCP',
      loreText: 'Documento oficial con membrete y sello rojo "OJOS ABIERTOS EN TODO MOMENTO". Manchas de pintura en aerosol verde y roja secas sobre raspaduras de hormigón reforzado.',
      paperStyle: 'blood',
      tag: 'SELLO SCP KETER / RASPADO DE CEMENTO',
      samplePhrase: '«ATENCIÓN: AVISAR ANTES DE PARPADEAR · 1, 2, PARPADEO»'
    }
  },
  {
    id: 'siren-head',
    name: 'Siren Head',
    alias: 'El Centinela de los Cables',
    category: 'liminal',
    year: '2018',
    origin: 'Trevor Henderson',
    summary: 'Criatura esquelética de 12 metros de altura compuesta por carne momificada y cables retorcidos de color óxido. En lugar de cabeza, ostenta un poste con dos altavoces de sirena antiaérea que reproducen transmisiones militares de emergencia, alertas de tornado y las voces agonizantes de sus víctimas pasadas para atraer a senderistas a las profundidades de los parques nacionales.',
    threatLevel: 5,
    proximitySign: 'Aullido metálico ensordecedor que retumba en el pecho y aves cayendo muertas por la vibración acústica.',
    disturbingNote: 'Los supervivientes recuerdan haber escuchado la voz de su madre rogando ayuda entre las copas de los abetos.',
    connectedIds: ['slender-man', 'cartoon-cat'],
    silhouetteSvg: '<line x1="50" y1="28" x2="50" y2="95" stroke="currentColor" stroke-width="4"/><polygon points="40,20 48,25 48,32 40,32" fill="currentColor"/><polygon points="60,20 52,25 52,32 60,32" fill="currentColor"/><path d="M42 45 L20 75 M58 45 L80 75 M46 95 L38 100 M54 95 L62 100" stroke="currentColor" stroke-width="3"/>',
    theme: {
      scene: 'forest',
      accentColor: '#cfc7b5',
      particles: 'fog',
      glitchLevel: 4,
      fogDensity: 0.8,
      flashlightColor: 'rgba(217, 164, 65, 0.25)',
      droneFreq: 120
    },
    artifact: {
      title: 'Trozo de Cable Telefónico Trenzado con Tejido Momificado',
      badge: 'RESTOS DE MEGAFONÍA FORESTAL',
      loreText: 'Alambre de cobre galvanizado oxidado con incrustaciones de tendones deshidratados. Al conectarlo a un altavoz pasivo reproduce fragmentos de alertas meteorológicas del año 1994 en bucle.',
      paperStyle: 'scratches',
      tag: 'CABLES RETORCIDOS / SIRENA 120DB',
      samplePhrase: '«ESTA ES UNA PRUEBA DEL SISTEMA DE RADIODIFUSIÓN DE EMERGENCIA»'
    }
  },
  {
    id: 'cartoon-cat',
    name: 'Cartoon Cat',
    alias: 'La Animación Maldita de 1939',
    category: 'liminal',
    year: '2018',
    origin: 'Trevor Henderson',
    summary: 'Felino antropomórfico inspirado en el estilo de animación con manguera de goma de los años 30. Lleva guantes blancos manchados de grasa y dientes humanos sanguinolentos apiñados en su hocico elástico. Es capaz de estirar sus miembros desafiando las leyes de la física newtoniana y ocupa fábricas clausuradas y centros comerciales en ruinas.',
    threatLevel: 5,
    proximitySign: 'Música de swing distorsionada que resuena entre conductos de ventilación y olor a caucho quemado.',
    disturbingNote: 'Encontraron sus guantes dentro de una caja fuerte sellada; no había huellas de entrada en la habitación.',
    connectedIds: ['siren-head', 'laughing-jack'],
    silhouetteSvg: '<circle cx="50" cy="40" r="18" fill="currentColor"/><polygon points="34,28 28,12 40,24" fill="currentColor"/><polygon points="66,28 72,12 60,24" fill="currentColor"/><ellipse cx="44" cy="38" rx="3" ry="5" fill="#cfc7b5"/><ellipse cx="56" cy="38" rx="3" ry="5" fill="#cfc7b5"/><path d="M38 50 Q50 62 62 50 Q50 56 38 50" fill="#7a1f1a"/><path d="M35 58 L20 95 L80 95 L65 58 Z" fill="currentColor"/>',
    theme: {
      scene: 'asylum',
      accentColor: '#cfc7b5',
      particles: 'dust',
      glitchLevel: 3,
      fogDensity: 0.55,
      flashlightColor: 'rgba(200, 200, 200, 0.22)',
      droneFreq: 70
    },
    artifact: {
      title: 'Tira de Celuloide de 35mm con Deformación Anatómica',
      badge: 'ACETATO CINEMATOGRÁFICO DE 1939',
      loreText: 'Cuatro fotogramas en blanco y negro donde los brazos del felino se extienden más allá de los agujeros de arrastre de la película. El material huele a nitrocelulosa ácida y grasa animal rancia.',
      paperStyle: 'mold',
      tag: 'CELULOIDE 1939 / MANGUERA DE GOMA',
      samplePhrase: '«THAT\'S ALL FOLKS! · DIENTES DENTRO DE LA SONRISA»'
    }
  },
  {
    id: 'mr-hands',
    name: 'Mr. Hands (Ficción Propia)',
    alias: 'El Titiritero de los Túneles Subterráneos',
    category: 'liminal',
    year: '2016',
    origin: 'Archivos Confidenciales de la Red Subterránea',
    summary: 'Entidad liminal ficticia que habita en las estaciones clausuradas del ferrocarril subterráneo. Presenta una silueta humana de la que brotan docenas de manos pálidas articuladas en lugar de costillas y columna vertebral. Estas manos se estiran a través de las rejillas de alcantarillado atrayendo a transeúntes solitarios para arrastrarlos a los túneles sin retorno.',
    threatLevel: 4,
    proximitySign: 'Sonido de aplausos desacompasados bajo el asfalto y vibración de los tubos de agua potable.',
    disturbingNote: 'Se hallaron huellas de palmas humanas en el techo del túnel a cuatro metros de altura sin andamios.',
    connectedIds: ['la-mano-peluda', 'the-rake'],
    silhouetteSvg: '<ellipse cx="50" cy="32" rx="10" ry="14" fill="currentColor"/><line x1="50" y1="46" x2="50" y2="85" stroke="currentColor" stroke-width="4"/><path d="M50 52 L30 45 M50 58 L25 55 M50 64 L22 66 M50 52 L70 45 M50 58 L75 55 M50 64 L78 66" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="66" r="3" fill="#cfc7b5"/><circle cx="80" cy="66" r="3" fill="#cfc7b5"/>',
    theme: {
      scene: 'void',
      accentColor: '#3b4a3a',
      particles: 'fog',
      glitchLevel: 3,
      fogDensity: 0.65,
      flashlightColor: 'rgba(100, 120, 100, 0.25)',
      droneFreq: 50
    },
    artifact: {
      title: 'Plano Topográfico con Marcas de Palmas en Tinta UV',
      badge: 'CARTA NAVEGACIÓN METRO INSERVIBLE',
      loreText: 'Plano de red ferroviaria con dieciocho estaciones fantasma marcadas con huellas palmares fosforescentes. Los dedos se superponen en abanico demostrando anatomía de más de siete falanges por mano.',
      paperStyle: 'mold',
      tag: 'HUELLAS PALMARES / SUBTERRÁNEO',
      samplePhrase: '«APLAUSOS BAJO EL HORMIGÓN · MANOS QUE TIRAN»'
    }
  },

  // ─── 4. LEYENDAS LATINOAMERICANAS (12) ───
  {
    id: 'la-llorona',
    name: 'La Llorona',
    alias: 'El Alma en Pena de las Riberas',
    category: 'latin',
    year: 'Siglo XVI (Época Colonial)',
    origin: 'Valle de México / Tradición Mesoamericana',
    summary: 'Espíritu de una mujer vestida con un sudario nupcial blanco que ahogó a sus propios hijos en un ataque de despecho y desesperación. Condenada a errar por las orillas de ríos, arroyos y acequias, lanza un lamento desgarrador que eriza la piel de quienes transitan de noche. La leyenda advierte: cuando su llanto se oye cercano está lejos, pero cuando parece remoto está justo a tu espalda.',
    threatLevel: 4,
    proximitySign: 'Niebla helada repentina sobre el suelo seco y el crujido de pasos descalzos sobre grava mojada.',
    disturbingNote: 'Los testigos aseguran que al voltear la vista, su rostro es una calavera con lágrimas de barro negro.',
    connectedIds: ['la-sayona', 'la-viuda'],
    silhouetteSvg: '<path d="M50 18 Q35 30 40 50 Q25 90 20 95 L80 95 Q75 90 60 50 Q65 30 50 18 Z" fill="currentColor"/><ellipse cx="50" cy="30" rx="8" ry="10" fill="#0a0908"/><path d="M46 28 L46 36 M54 28 L54 36" stroke="#7a1f1a" stroke-width="1.5"/><path d="M44 42 Q50 48 56 42" stroke="#cfc7b5" stroke-width="1.5" fill="none"/>',
    theme: {
      scene: 'river',
      accentColor: '#cfc7b5',
      particles: 'fog',
      glitchLevel: 2,
      fogDensity: 0.8,
      flashlightColor: 'rgba(120, 150, 190, 0.25)',
      droneFreq: 54
    },
    artifact: {
      title: 'Retazo de Velo Nupcial Empapado en Barro Lacustre',
      badge: 'RELIQUIA COLONIAL SIGLO XVI',
      loreText: 'Encaje de bolillos empapado en fango de acequia colonial. A pesar de haber sido secado en cámara de calor a 60°C, el textil destila gotas de agua helada a intervalos regulares de 13 minutos.',
      paperStyle: 'water',
      tag: 'VELO NUPCIAL / LODO LACUSTRE',
      samplePhrase: '«¡AY, MIS HIJOS!... ¿DÓNDE ESTÁN MIS HIJOS?»'
    }
  },
  {
    id: 'el-silbon',
    name: 'El Silbón',
    alias: 'El Espectro de los Llanos',
    category: 'latin',
    year: 'Siglo XIX',
    origin: 'Los Llanos de Venezuela y Colombia',
    summary: 'Gigante famélico de más de seis metros de altura que carga a sus espaldas un saco de arpillera repleto con los huesos de su padre, a quien asesinó en un paroxismo de furia. Emite un silbido siniestro con las notas musicales do-re-mi-fa-sol-la-si. Al igual que otras entidades de la región, escuchar el silbido en lontananza anuncia peligro de muerte inmediata.',
    threatLevel: 5,
    proximitySign: 'El silbido afinado que se desvanece de pronto y el repiqueteo de huesos sueltos al chocar dentro del saco.',
    disturbingNote: 'Si nadie en la choza escucha su silbido de madrugada, un morador amanecerá sin vida al romper el alba.',
    connectedIds: ['el-cadejo', 'la-sayona'],
    silhouetteSvg: '<line x1="50" y1="20" x2="50" y2="85" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="18" r="8" fill="currentColor"/><ellipse cx="38" cy="40" rx="10" ry="15" fill="#7a1f1a"/><line x1="50" y1="85" x2="42" y2="100" stroke="currentColor" stroke-width="3"/><line x1="50" y1="85" x2="58" y2="100" stroke="currentColor" stroke-width="3"/><path d="M38 12 L62 12 L50 8 Z" fill="currentColor"/>',
    theme: {
      scene: 'rural_road',
      accentColor: '#d9a441',
      particles: 'dust',
      glitchLevel: 2,
      fogDensity: 0.6,
      flashlightColor: 'rgba(217, 164, 65, 0.28)',
      droneFreq: 78
    },
    artifact: {
      title: 'Partitura Manuscrita en Hueso de Fémur Calcinado',
      badge: 'EVIDENCIA OSTEOLÓGICA LLANERA',
      loreText: 'Pentanota musical grabada sobre astilla de costilla humana. La escala afinada C-D-E-F-G-A-B produce en perros de caza crisis de histeria y desgarros espontáneos de las orejas.',
      paperStyle: 'ashes',
      tag: 'SACO DE ARPILLERA / HUESOS TRITURADOS',
      samplePhrase: '«DO-RE-MI-FA-SOL-LA-SI... SI SUENA LEJOS, YA ESTÁ AQUÍ»'
    }
  },
  {
    id: 'el-chupacabras',
    name: 'El Chupacabras',
    alias: 'El Depredador de las Granja',
    category: 'latin',
    year: '1995',
    origin: 'Canóvanas, Puerto Rico / Toda América Latina',
    summary: 'Criatura reptiliana bípeda con púas dorsales luminosas y grandes ojos rojizos que succiona la totalidad de la sangre de ganado caprino, vacuno y aves de corral mediante tres incisiones triangulares milimétricas en el cuello. No deja rastro de violencia ni charcos de sangre exterior, desorientando a los biólogos y sembrando el terror en comunidades campesinas.',
    threatLevel: 3,
    proximitySign: 'Fuerte olor a azufre quemado y parálisis absoluta de los perros guardianes que rehúsan ladrar.',
    disturbingNote: 'El forense veterinario halló los cadáveres completamente desprovistos de hemoglobina y sin coagulación.',
    connectedIds: ['the-rake', 'el-pombero'],
    silhouetteSvg: '<ellipse cx="50" cy="50" rx="16" ry="24" fill="currentColor"/><circle cx="48" cy="26" r="10" fill="currentColor"/><circle cx="45" cy="24" r="3" fill="#a01a14"/><circle cx="53" cy="24" r="3" fill="#a01a14"/><path d="M50 20 L50 8 M54 28 L62 20 M54 36 L66 32 M54 44 L66 42" stroke="#d9a441" stroke-width="2.5"/><path d="M42 70 L34 94 M56 70 L64 94" stroke="currentColor" stroke-width="3"/>',
    theme: {
      scene: 'rural_road',
      accentColor: '#a01a14',
      particles: 'embers',
      glitchLevel: 3,
      fogDensity: 0.5,
      flashlightColor: 'rgba(180, 50, 40, 0.25)',
      droneFreq: 66
    },
    artifact: {
      title: 'Molde Forense de Tres Punciones Triangulares',
      badge: 'BIOPSIA YUGULAR GANADERA',
      loreText: 'Molde en yeso odontológico de tres orificios en la carótida de una res. Las cavidades revelaron un vacío manométrico perfecto de -0.8 atmósferas que extrajo 35 litros de sangre sin una sola gota externa.',
      paperStyle: 'blood',
      tag: 'TRES PUNCIONES / PÚAS DORSALES',
      samplePhrase: '«CERO HEMOGLOBINA · CERO COÁGULOS EN EL CUERO»'
    }
  },
  {
    id: 'la-sayona',
    name: 'La Sayona',
    alias: 'El Castigo de los Infieles',
    category: 'latin',
    year: 'Siglo XVIII',
    origin: 'Venezuela y Colombia',
    summary: 'Aparición espectral de una dama de elegante vestido blanco de época que acecha en encrucijadas solitarias. Se muestra inicialmente como una mujer hermosa y desvalida que solicita compañía a los viajeros trasnochadores. Cuando el incauto intenta seducirla o tocarla, su rostro muta en una calavera putrefacta provista de colmillos caninos que desgarran a su víctima.',
    threatLevel: 4,
    proximitySign: 'Aroma exquisito a rosas frescas que muta en milésimas de segundo a carroña descompuesta.',
    disturbingNote: 'Antes de morir en el hospital de campaña, el arriero repitió: "Tenía los dientes como agujas de coser sacos".',
    connectedIds: ['la-llorona', 'el-silbon'],
    silhouetteSvg: '<ellipse cx="50" cy="32" rx="10" ry="14" fill="currentColor"/><path d="M40 44 L60 44 L75 96 L25 96 Z" fill="currentColor"/><circle cx="46" cy="30" r="2.5" fill="#7a1f1a"/><circle cx="54" cy="30" r="2.5" fill="#7a1f1a"/><path d="M46 38 L54 38" stroke="#0a0908" stroke-width="2"/>',
    theme: {
      scene: 'rural_road',
      accentColor: '#7a1f1a',
      particles: 'dust',
      glitchLevel: 3,
      fogDensity: 0.65,
      flashlightColor: 'rgba(122, 31, 26, 0.28)',
      droneFreq: 70
    },
    artifact: {
      title: 'Pétalos de Rosa Marchita & Molar Afilado en Punta',
      badge: 'RESTOS DE EMBOSCADA RURAL',
      loreText: 'Pétalos de rosa blanca convertidos en ceniza negra aceitosa. Adosado se halló un molar humano transformado en colmillo de 22 mm con restos de tejido muscular de una víctima no identificada.',
      paperStyle: 'ashes',
      tag: 'ROSA MARCHITA / COLMILLO CANINO',
      samplePhrase: '«¿LE GUSTO, SEÑOR?... MIRE BIEN MI SONRISA»'
    }
  },
  {
    id: 'el-cuco',
    name: 'El Cuco',
    alias: 'El Devorador de la Infancia',
    category: 'latin',
    year: 'Siglo XIII (Origen Ibérico / Tradición Hispanoamericana)',
    origin: 'Península Ibérica y América Latina',
    summary: 'Monstruo primordial carente de forma física estable que se oculta en armarios entreabiertos, debajo de los somieres de madera y en desvanes sin luz. Se nutre del pavor infantil y de la desobediencia. Se materializa como una masa informe de sombras con garras rugosas que engulle a los infantes que no concilian el sueño al término de la nana.',
    threatLevel: 4,
    proximitySign: 'Crujido de las tablas del piso bajo la cama y una sombra informe proyectada contra la pared sin fuente de luz.',
    disturbingNote: 'El dibujo infantil recuperado de la guardería mostraba unos ojos rojos asomándose por la ranura del ropero.',
    connectedIds: ['the-rake', 'el-pombero'],
    silhouetteSvg: '<path d="M50 20 C25 20 20 50 20 80 Q50 95 80 80 C80 50 75 20 50 20 Z" fill="currentColor"/><circle cx="40" cy="45" r="5" fill="#d9a441"/><circle cx="60" cy="45" r="5" fill="#d9a441"/><path d="M35 65 Q50 50 65 65" stroke="#7a1f1a" stroke-width="3" fill="none"/>',
    theme: {
      scene: 'red_room',
      accentColor: '#d9a441',
      particles: 'fog',
      glitchLevel: 2,
      fogDensity: 0.7,
      flashlightColor: 'rgba(217, 164, 65, 0.25)',
      droneFreq: 42
    },
    artifact: {
      title: 'Recorte de Manta Infantil con Desgarro en Garra',
      badge: 'EVIDENCIA DE DORMITORIO CLAUSURADO',
      loreText: 'Tejido de lana con un desgarro de cuatro puntas y carboncillo escolar donde un infante garabateó: "TIENE MUCHOS BRAZOS Y NO DUERME". Se preserva bajo vacío para evitar desintegración.',
      paperStyle: 'scratches',
      tag: 'DESGARRO TEXTIL / DIBUJO CON CARBÓN',
      samplePhrase: '«DUÉRMETE NIÑO, DUÉRMETE YA... O EL CUCO VENDRÁ»'
    }
  },
  {
    id: 'la-pincoya',
    name: 'La Pincoya',
    alias: 'La Sirena de los Mares del Sur',
    category: 'latin',
    year: 'Mitología Huilliche y Chilota',
    origin: 'Archipiélago de Chiloé, Chile',
    summary: 'Ninfa marina de extrema belleza que emerge de las aguas australes cubierta de algas marinas. Si baila de cara al mar abierto, los pescadores obtendrán abundancia de peces y mariscos; si baila de espaldas al océano hacia la orilla rocosa, sobrevendrán tempestades despiadadas y naufragios inevitables que arrastran las barcazas a la fosa abisal del Caleuche.',
    threatLevel: 2,
    proximitySign: 'Espuma marina fosforescente en las rocas y un aroma dulzón a algas frescas en la ventisca.',
    disturbingNote: 'Los maderos del bote naufragado llegaron a la playa sin un solo rasguño, pero vacíos por completo.',
    connectedIds: ['el-trauco', 'la-viuda'],
    silhouetteSvg: '<ellipse cx="50" cy="30" rx="9" ry="12" fill="currentColor"/><path d="M42 42 L58 42 L65 70 Q50 85 35 70 Z" fill="currentColor"/><path d="M50 75 Q40 85 30 92 Q50 98 70 92 Q60 85 50 75 Z" fill="#3b4a3a"/>',
    theme: {
      scene: 'river',
      accentColor: '#3b4a3a',
      particles: 'bubbles',
      glitchLevel: 1,
      fogDensity: 0.6,
      flashlightColor: 'rgba(100, 150, 160, 0.25)',
      droneFreq: 50
    },
    artifact: {
      title: 'Tallo de Alga Marina con Cristales de Sal Fosforescente',
      badge: 'MUESTRA BIOMARINA DEL SUR',
      loreText: 'Sargazo marino deshidratado que continúa despidiendo un brillo azul verdoso de 490 nm en ausencia de luz. La madera sobre la que descansaba quedó incrustada de salitre en forma de escamas.',
      paperStyle: 'water',
      tag: 'ALGA BIOLUMINISCENTE / SALITRE',
      samplePhrase: '«SI BAILA DE ESPALDAS, NINGÚN BOTE REGRESA»'
    }
  },
  {
    id: 'el-trauco',
    name: 'El Trauco',
    alias: 'El Hechicero de los Bosques Chilotes',
    category: 'latin',
    year: 'Mitología Chilota',
    origin: 'Chiloé, Chile',
    summary: 'Enano deforme de facciones primitivas y sin pies que porta un hacha de piedra (pahueldún) y un bastón retorcido llamado pahueldún. Con su mirada magnética e hipnótica es capaz de encantar a mujeres jóvenes solteras que penetran en el bosque, dejándolas en un estado letárgico mientras quedan encintas de su simiente mágica sin recordar lo sucedido.',
    threatLevel: 3,
    proximitySign: 'Golpeteo rítmico de un hacha de piedra contra un tronco de coigüe seco en la penumbra del bosque.',
    disturbingNote: 'La joven no pronunció palabra durante siete lunas tras ser encontrada descalza en el pantano.',
    connectedIds: ['la-pincoya', 'el-pombero'],
    silhouetteSvg: '<rect x="38" y="35" width="24" height="28" fill="currentColor"/><circle cx="50" cy="25" r="12" fill="currentColor"/><circle cx="46" cy="24" r="2.5" fill="#a01a14"/><circle cx="54" cy="24" r="2.5" fill="#a01a14"/><rect x="40" y="63" width="8" height="20" fill="currentColor"/><rect x="52" y="63" width="8" height="20" fill="currentColor"/><line x1="28" y1="40" x2="28" y2="75" stroke="#d9a441" stroke-width="4"/>',
    theme: {
      scene: 'forest',
      accentColor: '#3b4a3a',
      particles: 'fog',
      glitchLevel: 2,
      fogDensity: 0.7,
      flashlightColor: 'rgba(90, 120, 80, 0.25)',
      droneFreq: 58
    },
    artifact: {
      title: 'Trozo de Pahueldún Tallado en Basalto & Resina Hipnótica',
      badge: 'ARTEFACTO MÁGICO LITOLÓGICO',
      loreText: 'Piedra volcánica pulida con ranuras que contienen resina de quila desecada. Los vapores liberados al frotar la piedra inducen narcolepsia profunda con amnesia anterógrada en 45 segundos.',
      paperStyle: 'mold',
      tag: 'PIEDRA VOLCÁNICA / RESINA HIPNÓTICA',
      samplePhrase: '«EL GOLPE SECO EN EL ÁRBOL... Y EL SUEÑO ETERNO»'
    }
  },
  {
    id: 'la-mano-peluda',
    name: 'La Mano Peluda',
    alias: 'La Garra del Sepulcro',
    category: 'latin',
    year: 'Siglo XVI',
    origin: 'Puebla, México / Tradición Novohispana',
    summary: 'Extremidad mutilada de un usurero avaro que murió sin reconciliarse con la Iglesia. Tras ser sepultado en tierra no consagrada, la mano emergió del fango adquiriendo vida propia. Cubierta por una gruesa capa de cerdas negras y uñas filosas como garfios de carnicero, repta por las vigas del techo para asfixiar a los que acumulan riquezas deshonestas.',
    threatLevel: 3,
    proximitySign: 'Rascado continuo en el reverso de la puerta y un rastro de tierra de panteón fresca en el tapete.',
    disturbingNote: 'Los empleados de la morgue encontraron cinco marcas de quemadura negra con forma de dedos en el cuello.',
    connectedIds: ['mr-hands', 'el-cuco'],
    silhouetteSvg: '<ellipse cx="50" cy="65" rx="18" ry="12" fill="currentColor"/><line x1="38" y1="65" x2="32" y2="35" stroke="currentColor" stroke-width="4"/><line x1="44" y1="65" x2="42" y2="28" stroke="currentColor" stroke-width="4"/><line x1="50" y1="65" x2="50" y2="25" stroke="currentColor" stroke-width="4"/><line x1="56" y1="65" x2="58" y2="28" stroke="currentColor" stroke-width="4"/><line x1="62" y1="65" x2="68" y2="35" stroke="currentColor" stroke-width="4"/>',
    theme: {
      scene: 'crypt',
      accentColor: '#cfc7b5',
      particles: 'dust',
      glitchLevel: 2,
      fogDensity: 0.5,
      flashlightColor: 'rgba(180, 170, 150, 0.22)',
      droneFreq: 46
    },
    artifact: {
      title: 'Mechón de Cerdas Negras de Cadáver Usurero',
      badge: 'FIBRAS EPIDÉRMICAS DE PANTEÓN',
      loreText: 'Fibras queratínicas gruesas adheridas a un fragmento de papel sellado colonial de 1582. Las cerdas se retuercen en espiral cuando entra en contacto con metales preciosos o monedas de plata.',
      paperStyle: 'scratches',
      tag: 'CERDAS CADAVÉRICAS / TIERRA PANTEÓN',
      samplePhrase: '«EL RASPADO EN EL TECHO... LOS CINCO DEDOS EN LA GARGANTA»'
    }
  },
  {
    id: 'el-cadejo',
    name: 'El Cadejo',
    alias: 'El Emisario de las Sombras',
    category: 'latin',
    year: 'Época Colonial',
    origin: 'Guatemala, El Salvador, Honduras y Costa Rica',
    summary: 'Espíritu zoomorfo en forma de can gigantesco. Existen dos encarnaciones: el Cadejo Blanco, protector benévolo de los caminantes ebrios; y el Cadejo Negro, bestia de ojos de brasa incandescente y cadenas arrastradas que muerde el alma de los transeúntes dejándolos postrados en fiebres mortales. Cuando ambos colisionan, el suelo retumba como en un seísmo.',
    threatLevel: 4,
    proximitySign: 'Ecos de cadenas de hierro pesadas chocando sobre piedras y ojos rojos parpadeando en la maleza.',
    disturbingNote: 'El viajero despertó con fiebre de 41 grados y la lengua cubierta de cenizas volcánicas negras.',
    connectedIds: ['smile-dog', 'el-silbon'],
    silhouetteSvg: '<ellipse cx="50" cy="50" rx="28" ry="18" fill="currentColor"/><circle cx="28" cy="38" r="10" fill="currentColor"/><polygon points="20,28 26,18 30,28" fill="currentColor"/><circle cx="24" cy="36" r="3" fill="#a01a14"/><path d="M38 68 L32 94 M60 68 L66 94" stroke="currentColor" stroke-width="4"/><path d="M75 45 Q88 35 85 55" stroke="currentColor" stroke-width="4" fill="none"/>',
    theme: {
      scene: 'rural_road',
      accentColor: '#a01a14',
      particles: 'embers',
      glitchLevel: 3,
      fogDensity: 0.65,
      flashlightColor: 'rgba(180, 40, 30, 0.28)',
      droneFreq: 74
    },
    artifact: {
      title: 'Eslabón de Cadena Forjada con Sulfuro Volcánico',
      badge: 'HIERRO COLONIAL FRACTURADO',
      loreText: 'Eslabón de 8 cm impregnado con azufre y pelo de mastín negro. El metal conserva un calor residual que chamuscó el folio y emite olor a pólvora al contacto con agua bendita.',
      paperStyle: 'ashes',
      tag: 'ESLABÓN OXIDADO / AZUFRE CALIENTE',
      samplePhrase: '«EL TRASTABILLO DE CADENAS EN LA VEREDA OSCURA»'
    }
  },
  {
    id: 'la-tunda',
    name: 'La Tunda',
    alias: 'La Matrona de los Manglares',
    category: 'latin',
    year: 'Tradición Afrocolombiana y Afroecuatoriana',
    origin: 'Costa Pacífica de Colombia y Esmeraldas (Ecuador)',
    summary: 'Monstruo femenino que habita en las ciénagas y esteros del litoral pacífico. Tiene una pata humana y la otra en forma de molinillo de batir chocolate. Con su capacidad camaleónica, adopta el aspecto físico de la madre o tía de los niños desobedientes para engatusarlos con camarones cocidos y encerrarlos en cuevas profundas donde quedan entundados y sin memoria.',
    threatLevel: 4,
    proximitySign: 'Canto melodioso de mujer cantando al arrullo en medio de un manglar impenetrable y olor a marisco hervido.',
    disturbingNote: 'Para rescatar al niño entundado fue necesario llevar tambores de currulao y disparar escopetas al aire.',
    connectedIds: ['el-trauco', 'la-sayona'],
    silhouetteSvg: '<ellipse cx="50" cy="32" rx="10" ry="13" fill="currentColor"/><path d="M40 45 L60 45 L70 95 L30 95 Z" fill="currentColor"/><line x1="38" y1="95" x2="38" y2="100" stroke="currentColor" stroke-width="4"/><line x1="62" y1="95" x2="62" y2="100" stroke="#d9a441" stroke-width="6"/>',
    theme: {
      scene: 'river',
      accentColor: '#3b4a3a',
      particles: 'fog',
      glitchLevel: 2,
      fogDensity: 0.75,
      flashlightColor: 'rgba(80, 110, 80, 0.25)',
      droneFreq: 56
    },
    artifact: {
      title: 'Muesca de Molinillo en Barro de Ciénaga & Camarón Seco',
      badge: 'IMPRONTA DE EXTREMIDAD DEFORMADA',
      loreText: 'Vaciado en resina de una pisada con forma de molinillo de madera de guayacán. Alrededor se encontraron restos de camarón de estero sazonado con cenizas de mangle rojo.',
      paperStyle: 'water',
      tag: 'PATA DE MOLINILLO / BARRO DE ESTERO',
      samplePhrase: '«VEN MI NIÑO... MIRA LOS CAMARONES QUE TRAJE PARA TI»'
    }
  },
  {
    id: 'el-pombero',
    name: 'El Pombero',
    alias: 'El Señor de la Siesta',
    category: 'latin',
    year: 'Mitología Guaraní',
    origin: 'Paraguay, Nordeste Argentino y Sur de Brasil',
    summary: 'Hombrecillo rechoncho cubierto de pelo espeso que calza sombrero de paja y silba imitando a las aves de la selva. Cuida celosamente la fauna silvestre castigando a los cazadores que matan animales por placer. Exige ofrendas diarias de tabaco, caña y miel; si se le respeta protege los cultivos, pero si se le agravia, extravía a los niños durante la siesta.',
    threatLevel: 3,
    proximitySign: 'Un silbido agudo e intermitente en la copa de los árboles y la desaparición de las provisiones de caña.',
    disturbingNote: 'El campesino que olvidó dejar el cigarro en el poste amaneció con su caballo trenzado con barro hasta la cola.',
    connectedIds: ['el-trauco', 'el-cuco'],
    silhouetteSvg: '<ellipse cx="50" cy="55" rx="20" ry="24" fill="currentColor"/><circle cx="50" cy="28" r="14" fill="currentColor"/><ellipse cx="50" cy="18" rx="24" ry="6" fill="#d9a441"/><rect x="36" y="78" width="10" height="18" fill="currentColor"/><rect x="54" y="78" width="10" height="18" fill="currentColor"/>',
    theme: {
      scene: 'forest',
      accentColor: '#d9a441',
      particles: 'dust',
      glitchLevel: 1,
      fogDensity: 0.5,
      flashlightColor: 'rgba(217, 164, 65, 0.25)',
      droneFreq: 62
    },
    artifact: {
      title: 'Hoja de Tabaco Negro Rústico Atada con Cerda de Crin',
      badge: 'OFRENDA RECUPERADA EN TRANQUERA',
      loreText: 'Puro de tabaco silvestre masticado por un extremo. Las crines que lo atan pertenecen a una yegua que amaneció trenzada con barro impenetrable de monte guaraní.',
      paperStyle: 'ashes',
      tag: 'TABACO SILVESTRE / CRIN TRENZADA',
      samplePhrase: '«NO CAZAR POR PLACER · DEJAR LA CAÑA EN EL POSTE»'
    }
  },
  {
    id: 'la-viuda',
    name: 'La Viuda',
    alias: 'La Dama del Puente Negro',
    category: 'latin',
    year: 'Siglo XIX',
    origin: 'Zona Central y Sur de Chile y Argentina',
    summary: 'Espectro de una mujer vestida con luto riguroso y velo fúnebre tupido que sube intempestivamente al anca de los caballos de jinetes solitarios en caminos rurales. Su cuerpo emite un frío polar que congela la sangre de la cabalgadura. Tras recorrer varios kilómetros en silencio, obliga al jinete a desviar el camino hacia barrancos escarpados para despeñarlo.',
    threatLevel: 4,
    proximitySign: 'Descenso repentino de diez grados centígrados en el ambiente y jadeo aterrorizado del caballo que se rehúsa a avanzar.',
    disturbingNote: 'El caballo fue hallado con la crin completamente congelada en pleno mes de enero.',
    connectedIds: ['la-llorona', 'la-sayona'],
    silhouetteSvg: '<path d="M50 15 Q30 30 35 60 L25 96 L75 96 L65 60 Q70 30 50 15 Z" fill="currentColor"/><ellipse cx="50" cy="30" rx="8" ry="12" fill="#0a0908"/><path d="M35 15 Q50 5 65 15 L65 45 L35 45 Z" fill="#7a1f1a"/>',
    theme: {
      scene: 'rural_road',
      accentColor: '#cfc7b5',
      particles: 'fog',
      glitchLevel: 2,
      fogDensity: 0.7,
      flashlightColor: 'rgba(180, 180, 200, 0.25)',
      droneFreq: 52
    },
    artifact: {
      title: 'Malla de Tul de Duelo con Cristales de Escarcha Polar',
      badge: 'TEXTIL FÚNEBRE CONGELADO',
      loreText: 'Red de seda negra rescatada del barandal de un puente de vigas de hierro. Los cristales de escarcha en las fibras no se derritieron al exponerse a una estufa de parafina durante tres horas.',
      paperStyle: 'water',
      tag: 'TUL ENLUTADO / ESCARCHA PERPETUA',
      samplePhrase: '«EL PESO HELADO EN LA GRUPA... Y EL ABISMO AL FRENTE»'
    }
  }
];

export const CHARACTERS: Character[] = [...BASE_CHARACTERS.filter(c => c.id !== 'masky-hoodie'), ...ADDITIONAL_CHARACTERS].map(character => ({
  ...character,
  connectedIds: character.connectedIds.flatMap(id => id === 'masky-hoodie' ? ['masky', 'hoodie'] : [id]),
  signature: character.signature ?? CHARACTER_SIGNATURES[character.id],
  sources: character.sources ?? (CHARACTER_SIGNATURES[character.id] ? [{label: 'Referencia del personaje · versiones del fandom', url: character.id === 'ticci-toby' ? 'https://ficcion-sin-limites.fandom.com/es/wiki/Ticci_Toby' : `https://creepypastafiles.fandom.com/wiki/${encodeURIComponent(({ 'slender-man': 'Slender Man', 'ben-drowned': 'BEN Drowned' } as Record<string, string>)[character.id] ?? character.name).replaceAll('%20', '_')}`}]: undefined),
}));
