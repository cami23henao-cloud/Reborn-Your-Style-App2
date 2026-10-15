export interface ReadingArticle {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  category: 'redes' | 'fotografia' | 'ficha-tecnica';
  categoryLabel: string;
  coverImage: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
    proTip?: string;
  }[];
  keyTakeaways: string[];
}

export interface InfographicItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'cadena' | 'anatomia' | 'circular';
  categoryLabel: string;
  previewUrl: string;
  fullDiagramUrl: string;
  description: string;
  steps: {
    number: string;
    title: string;
    detail: string;
    icon: string;
  }[];
  downloadFileName: string;
}

export interface DownloadableResource {
  id: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'DOC' | 'SHEET';
  sizeFormatted: string;
  category: 'plantillas' | 'guias' | 'checklist';
  categoryLabel: string;
  icon: string;
  recommendedFor: string;
  contentPreview: string[];
  mockPdfText: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  context?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswerId: string;
  explanation: string;
  topic: 'buenas-practicas' | 'contenido-digital' | 'cuidado-catalogo';
  topicLabel: string;
}

// -----------------------------------------------------------------------------
// 1. GUÍAS LECTIVAS / ARTÍCULOS INTERACTIVOS
// -----------------------------------------------------------------------------
export const EDUCATIONAL_ARTICLES: ReadingArticle[] = [
  {
    id: 'art-redes-costureros',
    title: 'Manejo de Redes Sociales para Costureros y Modistas',
    subtitle: 'Cómo convertir tus transformaciones de ropa en clientes constantes con contenido visual de alto impacto.',
    readTime: '4 min de lectura',
    category: 'redes',
    categoryLabel: 'Estrategia Digital',
    coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
    summary: 'Aprende a estructurar un perfil profesional en Instagram y TikTok que destaque tus habilidades de costura, el proceso artesanal y genere confianza instantánea en nuevos clientes.',
    sections: [
      {
        heading: '1. El poder irresistible del "Antes y Después"',
        content: 'El cerebro humano reacciona con asombro al contraste entre una prenda vieja, pasada de moda o rota, y su versión moderna estilizada. Es la prueba reina de tu maestría como modista.',
        bulletPoints: [
          'Toma siempre una foto plana (flat lay) de la prenda original extendida con buena luz.',
          'Coloca la prenda original al lado de la pieza final transformada en un carrusel o video dinámico.',
          'Usa transiciones sencillas en video (ej. cubrir la cámara con la tela vieja y destapar con la prenda terminada).',
        ],
        proTip: 'No uses filtros que distorsionen los colores reales del textil; los clientes necesitan confiar en el tono y textura real.',
      },
      {
        heading: '2. Enseña el proceso, no solo el resultado',
        content: 'A la gente le fascina ver los detalles minuciosos del oficio: el sonido de las tijeras cortando denim, el enhebrado de la aguja, el pespunte a máquina y el planchado de costuras abiertas.',
        bulletPoints: [
          'Graba clips cortos de 3 a 5 segundos con el teléfono en un trípode o sobre una repisa.',
          'Muestra cómo solucionas retos complejos (descoser tiros, entallar cinturas, colocar cierres invisibles).',
          'Habla de la historia de la prenda (ej. "Esta camisa de mi cliente llevaba 5 años olvidada").',
        ],
        proTip: 'Los videos de proceso con sonido ambiente (ASMR textil) tienen tasas de reproducción completas altísimas.',
      },
      {
        heading: '3. Llamados a la acción claros y directos',
        content: 'Cada publicación debe guiar al cliente hacia el siguiente paso de forma sencilla, invitándolo a chatear o solicitar cotización a través de Reborn Your Style.',
        bulletPoints: [
          'Incluye en tu biografía: Especialidad, ciudad de cobertura y enlace directo a tu taller en Reborn.',
          'Finaliza tus textos con preguntas sencillas: "¿Tienes una prenda similar en tu armario? Envíame una foto por chat y te cotizo en minutos."',
        ],
      },
    ],
    keyTakeaways: [
      'Documentar el "antes" es obligatorio antes de realizar el primer corte.',
      'La consistencia de luz y encuadre genera una percepción de alta calidad artesanal.',
      'Canaliza a tus seguidores hacia tu perfil verificado en Reborn para gestionar pedidos seguros.',
    ],
  },
  {
    id: 'art-foto-smartphone',
    title: 'Fotografía Digital de Prendas con Smartphone',
    subtitle: 'Técnicas sencillas de iluminación y composición para lograr fotos profesionales sin equipo costoso.',
    readTime: '5 min de lectura',
    category: 'fotografia',
    categoryLabel: 'Producción Visual',
    coverImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
    summary: 'Guía paso a paso para fotografiar prendas con tu celular: iluminación natural, fondos contrastantes, planos de detalle y control de arrugas para el catálogo.',
    sections: [
      {
        heading: '1. La luz natural es tu mejor aliada',
        content: 'La luz artificial de bombillas amarillas caseras desvirtúa los tonos y resta nitidez. Para obtener resultados limpios:',
        bulletPoints: [
          'Ubica la prenda cerca de una ventana amplia en horas de mañana (8:00 AM - 11:00 AM) o tarde (3:00 PM - 5:00 PM).',
          'Evita que el sol pegue de forma directa creando sombras duras; la luz difusa de un día nublado o una cortina blanca delgada es perfecta.',
          'Nunca utilices el flash directo de tu teléfono celular.',
        ],
        proTip: 'Si un lado de la prenda queda muy oscuro, coloca una cartulina blanca en el lado opuesto a la ventana para rebotar la luz suavemente.',
      },
      {
        heading: '2. Fondos limpios y preparación previa',
        content: 'El ojo del comprador o modista debe enfocarse exclusivamente en la prenda, no en el desorden de la habitación o manchas.',
        bulletPoints: [
          'Plancha cuidadosamente la prenda antes de fotografiarla; las arrugas transmiten descuido.',
          'Usa una pared lisa de color neutro (blanco, gris claro, crema) o un piso de madera limpio.',
          'Si cuelgas la prenda, utiliza un gancho de madera o metal estilizado, nunca ganchos plásticos deformes.',
        ],
      },
      {
        heading: '3. Los 4 planos obligatorios para cada publicación',
        content: 'Para que una publicación en el catálogo de Reborn destaque y brinde toda la información necesaria, toma siempre:',
        bulletPoints: [
          'Plano General Frontal: Prenda completa centrada en formato vertical u horizontal.',
          'Plano General Posterior: Espalda de la prenda para ver cortes, costuras o cierres.',
          'Plano de Detalle (Close-up): Textura de la tela, costuras, bordados, botones o parches.',
          'Plano de Etiquetas o Fibras: Muestra la composición textil (100% algodón, lino, mezclilla) y talla original.',
        ],
        proTip: 'Limpia el lente de la cámara de tu smartphone con una microfibra antes de disparar; la grasa de los dedos es la causa #1 de fotos borrosas.',
      },
    ],
    keyTakeaways: [
      'Luz natural difusa siempre > bombillos incandescentes.',
      'Un plano de detalle de las costuras demuestra la calidad de tu mano de obra.',
      'Planchar antes de la sesión eleva el valor percibido de la prenda en un 50%.',
    ],
  },
  {
    id: 'art-ficha-tecnica',
    title: 'Ficha Técnica Digital de la Prenda',
    subtitle: 'El estándar profesional para registrar medidas, composición y requerimientos sin margen de error.',
    readTime: '4 min de lectura',
    category: 'ficha-tecnica',
    categoryLabel: 'Patronaje y Control',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    summary: 'Cómo redactar y comprender la información técnica clave de una prenda para acordar presupuestos claros entre clientes y talleres de costura.',
    sections: [
      {
        heading: '1. ¿Qué es una ficha técnica digital en suprareciclaje?',
        content: 'A diferencia de la producción masiva, en la moda circular cada prenda es única. La ficha técnica documenta el estado inicial, la composición de fibras, las medidas reales del cuerpo y las modificaciones acordadas.',
        bulletPoints: [
          'Evita malentendidos entre el cliente y el costurero respecto a largos o entalles.',
          'Permite estimar el tiempo exacto de mano de obra y el consumo de insumos (hilos, elásticos, cierres).',
          'Sirve como contrato de satisfacción para el control de calidad final.',
        ],
      },
      {
        heading: '2. Puntos anatómicos críticos que debes medir',
        content: 'Las tallas comerciales (S, M, L) varían enormemente entre marcas. Registra siempre las medidas métricas en centímetros:',
        bulletPoints: [
          'Contorno de pecho / busto: En la parte más prominente sin apretar la cinta métrica.',
          'Contorno de cintura: En la parte más estrecha del torso natural (2 cm sobre el ombligo).',
          'Contorno de cadera: En la parte más ancha de los glúteos.',
          'Largo de talle y largo deseado de la prenda terminada.',
          'Tiro total en pantalones y pantalones cortos (tiro delantero + tiro trasero).',
        ],
        proTip: 'Usa una cinta métrica de sastre flexible y pide a la persona que respire con naturalidad al medir.',
      },
      {
        heading: '3. Diagnóstico del textil existente',
        content: 'No todas las telas resisten las mismas intervenciones. Identifica antes de cortar:',
        bulletPoints: [
          'Elasticidad: ¿Es tejido plano rígido (denim clásico, popelina) o de punto elástico (jersey, lycra)?',
          'Grosor y peso: Para elegir el calibre correcto de hilo y aguja de coser.',
          'Desgaste por uso: Revisa si hay fibras debilitadas en axilas o entrepierna que requieran parches de refuerzo preventivo.',
        ],
      },
    ],
    keyTakeaways: [
      'Medir en centímetros elimina la ambigüedad de las tallas genéricas S/M/L.',
      'Evaluar la elasticidad define la técnica de costura (pespunte recto vs zigzag o fileteadora).',
      'Adjuntar la ficha en la solicitud de cotización agiliza la respuesta del costurero.',
    ],
  },
];

// -----------------------------------------------------------------------------
// 2. INFOGRAFÍAS Y DIAGRAMAS VISUALES
// -----------------------------------------------------------------------------
export const EDUCATIONAL_INFOGRAPHICS: InfographicItem[] = [
  {
    id: 'info-cadena-modificacion',
    title: 'Cadena de Modificación Textil y Sostenibilidad Digital',
    subtitle: 'El flujo de valor circular desde la prenda en desuso hasta la pieza de autor con vida renovada.',
    category: 'cadena',
    categoryLabel: 'Flujo Circular',
    previewUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    fullDiagramUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&auto=format&fit=crop&q=90',
    description: 'Esquema metodológico de las 5 etapas del supra-reciclaje: Selección, Desarmado Anatómico, Rediseño y Patronaje, Ensamble Artesanal y Control de Calidad.',
    steps: [
      {
        number: '01',
        title: 'Selección y Diagnóstico',
        detail: 'Revisión del estado de las fibras, pureza de materiales y selección del modelo de upcycling más viable.',
        icon: 'check_circle',
      },
      {
        number: '02',
        title: 'Desmontaje Cuidadoso',
        detail: 'Descosido minucioso de costuras principales para conservar el máximo metraje de tela útil sin desgarrar.',
        icon: 'content_cut',
      },
      {
        number: '03',
        title: 'Patronaje y Corte',
        detail: 'Trazado de los nuevos moldes aprovechando la caída original y evitando zonas desgastadas o manchadas.',
        icon: 'architecture',
      },
      {
        number: '04',
        title: 'Confección y Refuerzo',
        detail: 'Costura con hilatura de alta tenacidad, refuerzo de remates y aplicaciones de técnicas decorativas o parches.',
        icon: 'precision_manufacturing',
      },
      {
        number: '05',
        title: 'Entrega y Ficha de Vida',
        detail: 'Planchado profesional, control de medidas y registro de impacto ecológico (litros de agua y CO2 ahorrados).',
        icon: 'eco',
      },
    ],
    downloadFileName: 'reborn-cadena-modificacion-textil.pdf',
  },
  {
    id: 'info-anatomia-denim',
    title: 'Anatomía de una Transformación Denim Upcycled',
    subtitle: 'Disección técnica de un jean: cómo reutilizar el 100% de sus partes funcionales y estructurales.',
    category: 'anatomia',
    categoryLabel: 'Anatomía de Prenda',
    previewUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800&auto=format&fit=crop&q=80',
    fullDiagramUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=1600&auto=format&fit=crop&q=90',
    description: 'Guía visual para deconstruir un pantalón vaquero y reconfigurarlo en faldas, chalecos, corsets o bolsos sin generar desperdicio textil.',
    steps: [
      {
        number: 'A',
        title: 'Pretina y Pasadores',
        detail: 'Se conservan para la cintura de faldas, asas reforzadas de bolsos tote o cinturones rústicos de alta durabilidad.',
        icon: 'straighten',
      },
      {
        number: 'B',
        title: 'Bolsillos Traseros con Remaches',
        detail: 'Piezas pre-armadas listas para reubicar en pecheras de chalecos, laterales de chaquetas o compartimentos externos.',
        icon: 'tab',
      },
      {
        number: 'C',
        title: 'Perneras y Tubos Rectos',
        detail: 'Los paños más grandes de tela plana. Ideales para armar paneles delanteros, faldas evasé o lienzos de pintura textil.',
        icon: 'view_agenda',
      },
      {
        number: 'D',
        title: 'Retazos de Costura Cerrada',
        detail: 'Las costuras reforzadas de entrepierna se cortan en tiras para tejer correas o detalles trenzados.',
        icon: 'texture',
      },
    ],
    downloadFileName: 'reborn-anatomia-transformacion-denim.pdf',
  },
  {
    id: 'info-ruta-circular',
    title: 'Ruta Circular de la Prenda: Del Descarte al Armario de Autor',
    subtitle: 'El impacto ecológico medible de alargar la vida útil de las prendas frente a la moda rápida.',
    category: 'circular',
    categoryLabel: 'Sostenibilidad',
    previewUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    fullDiagramUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&auto=format&fit=crop&q=90',
    description: 'Comparativa de emisiones y consumo de recursos entre la compra de ropa nueva vs. la intervención artesanal local en Reborn Your Style.',
    steps: [
      {
        number: '💧',
        title: '-2.700 Litros de Agua',
        detail: 'Ahorro promedio por cada chaqueta o pantalón de algodón transformado en lugar de fabricar uno nuevo.',
        icon: 'water_drop',
      },
      {
        number: '🌱',
        title: '-8.5 Kg de CO2e',
        detail: 'Reducción de huella de carbono al evitar el transporte transoceánico de la industria fast-fashion.',
        icon: 'forest',
      },
      {
        number: '🤝',
        title: 'Economía Local Circular',
        detail: 'El 85% del valor económico va directamente a las manos de modistas y artesanos de tu propia ciudad.',
        icon: 'volunteer_activism',
      },
    ],
    downloadFileName: 'reborn-ruta-circular-impacto.pdf',
  },
];

// -----------------------------------------------------------------------------
// 3. RECURSOS EN PDF / GUÍAS DESCARGABLES
// -----------------------------------------------------------------------------
export const DOWNLOADABLE_RESOURCES: DownloadableResource[] = [
  {
    id: 'res-plantilla-medidas',
    title: 'Plantilla de Medidas Anatómicas y Ficha de Cliente',
    description: 'Documento estándar de toma de medidas corporales con diagrama de silueta y casillas para registrar contornos, largos, tiros y observaciones ergonómicas.',
    fileType: 'PDF',
    sizeFormatted: '185 KB',
    category: 'plantillas',
    categoryLabel: 'Plantilla de Trabajo',
    icon: 'straighten',
    recommendedFor: 'Costureros, modistas y clientes que solicitan prendas a medida.',
    contentPreview: [
      'Diagrama anatómico frontal y posterior con líneas guía numeradas.',
      'Tabla de medidas clave: Busto/Pecho, Cintura, Cadera, Largo de Espalda, Sisa y Manga.',
      'Sección de postura y observaciones: Hombro caído, lordosis o asimetrías.',
      'Espacio para firma de conformidad y fecha de toma de medidas.',
    ],
    mockPdfText: `REBORN YOUR STYLE — FICHA TÉCNICA Y DE MEDIDAS ANATÓMICAS
============================================================
Fecha: _______________  Taller/Costurero: _____________________
Cliente: _____________________ Teléfono / WhatsApp: ___________

MEDIDAS SUPERIORES (en centímetros):
- Contorno de Pecho / Busto: _____ cm
- Contorno de Cintura: _____ cm
- Ancho de Espalda: _____ cm
- Largo de Talle Delantero: _____ cm
- Largo de Manga: _____ cm  /  Contorno de Puño: _____ cm

MEDIDAS INFERIORES:
- Contorno de Cadera: _____ cm
- Tiro Delantero: _____ cm  /  Tiro Posterior: _____ cm
- Largo Total de Pantalón/Falda: _____ cm
- Contorno de Bota/Bajo: _____ cm

DESCRIPCIÓN DE LA PRENDA ORIGINAL:
Tipo de prenda: [ ] Jean  [ ] Camisa  [ ] Chaqueta  [ ] Vestido  [ ] Otro: _______
Composición: [ ] 100% Algodón  [ ] Denim rígido  [ ] Algodón con Lycra  [ ] Lino
Observaciones y modificaciones solicitadas: __________________________________`,
  },
  {
    id: 'res-guia-puntadas',
    title: 'Guía de Estilo y Catálogo de Puntadas Upcycling',
    description: 'Manual de puntadas estructurales y decorativas para supra-reciclaje: Sashiko tradicional, punto festón, sobrehilado invisible y refuerzo de remate.',
    fileType: 'PDF',
    sizeFormatted: '340 KB',
    category: 'guias',
    categoryLabel: 'Manual Técnico',
    icon: 'menu_book',
    recommendedFor: 'Creadores textiles que buscan elevar el acabado y estética de sus prendas.',
    contentPreview: [
      'Puntada Sashiko (Kogin): Patrones geométricos japoneses para reparación visible.',
      'Pespunte de seguridad para denim con hilo torzal de calibre 30.',
      'Costura francesa y costura inglesa plana para acabados internos limpios sin overlock.',
      'Tabla de selección de agujas según peso del tejido (calibres 70/10 a 110/18).',
    ],
    mockPdfText: `REBORN YOUR STYLE — GUÍA TÉCNICA DE PUNTADAS Y REFUERZOS UPCYCLING
==================================================================
1. PUNTADA SASHIKO JAPONESA (REPARACIÓN VISIBLE):
- Longitud de puntada recomendada: 3 mm a 4 mm.
- Hilo: Algodón perlé o torzal mate sin encerar.
- Aplicación: Refuerzo de zonas con desgaste o rasgaduras en rodillas y codos.

2. PESPUNTE SUPERFICIAL DOBLE PARA DENIM:
- Separación de hileras: 6 mm (1/4 de pulgada).
- Tensión recomendada: Media-alta (4.5 a 5.5 en máquinas domésticas).
- Aguja recomendada: Schmetz Jeans 100/16.

3. COSTURA FRANCESA PARA TEJIDOS DELGADOS (LINO / POPELINA):
- Paso 1: Coser revés con revés a 4 mm del borde.
- Paso 2: Recortar exceso a 2 mm y voltear derecho con derecho.
- Paso 3: Coser a 6 mm cerrando la pestaña deshilachada en el interior.`,
  },
  {
    id: 'res-checklist-calidad',
    title: 'Checklist de Control de Calidad y Acabados de Modistería',
    description: 'Lista de verificación de 12 puntos antes de entregar o publicar una prenda modificada: tensiones, dobladillos, simetría y planchado.',
    fileType: 'PDF',
    sizeFormatted: '120 KB',
    category: 'checklist',
    categoryLabel: 'Control de Calidad',
    icon: 'checklist',
    recommendedFor: 'Talleres que desean certificar un servicio 5 estrellas libre de reclamos.',
    contentPreview: [
      'Verificación de simetría en mangas, costados y ruedos.',
      'Prueba de resistencia en costuras principales sometidas a tensión.',
      'Limpieza total de hilachas y remates internos seguros.',
      'Planchado con vapor y fijación final de costuras.',
    ],
    mockPdfText: `REBORN YOUR STYLE — CHECKLIST DE CONTROL DE CALIDAD PRE-ENTREGA
================================================================
Prenda Ref: ______________________ Cliente: ____________________

[ ] 1. Simetría de ruedos y mangas verificada sobre plano horizontal.
[ ] 2. Costuras de unión sin frunces ni estiramientos indebidos.
[ ] 3. Tensión de hilo uniforme: sin lazos en el revés ni nudos en el derecho.
[ ] 4. Remates de inicio y fin asegurados con 3 a 4 puntadas hacia atrás.
[ ] 5. Botones y ojales alineados y con holgura de cuello de hilo.
[ ] 6. Cierre / cremallera desliza con suavidad sin morder el forro o tela.
[ ] 7. Todas las hilachas sobrantes recortadas al ras.
[ ] 8. Medidas finales contrastadas contra la Ficha Técnica del cliente.
[ ] 9. Prenda planchada con vapor respetando la temperatura de la fibra.
[ ] 10. Etiqueta o firma artesanal Reborn fijada limpiamente.

ESTADO FINAL: [ ] APROBADO CON EXCELENCIA   [ ] REQUIERE AJUSTE`,
  },
];

// -----------------------------------------------------------------------------
// 4. BANCO DE PREGUNTAS: EVALUACIÓN DE CONOCIMIENTOS (QUIZ)
// -----------------------------------------------------------------------------
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: 'buenas-practicas',
    topicLabel: 'Buenas Prácticas Textiles',
    question: 'Al modificar una prenda de denim grueso (mezclilla pesada de 12 a 14 oz), ¿cuál es la aguja y técnica más recomendada para evitar quiebres y saltos de puntada?',
    options: [
      { id: 'a', text: 'Aguja universal calibre 70/10 con puntada muy rápida y sin planchar.' },
      { id: 'b', text: 'Aguja específica para Jeans/Denim de calibre 90/14 o 100/16 con hilo torzal y avance constante.' },
      { id: 'c', text: 'Aguja punta de bola elástica con hilo de coser poliéster común calibre 120.' },
      { id: 'd', text: 'Coser directamente con doble aguja fina sin importar el grosor de las uniones.' },
    ],
    correctAnswerId: 'b',
    explanation: 'El denim rígido requiere una aguja con punta afilada y cuerpo reforzado (calibre 90/14 a 100/16) que penetre la trama tupida sin desviarse ni despuntarse, además de un hilo de mayor resistencia como el torzal.',
  },
  {
    id: 2,
    topic: 'contenido-digital',
    topicLabel: 'Creación de Contenido Digital',
    question: '¿Cuál es el factor más determinante para lograr fotografías de alta calidad de tus prendas usando únicamente un smartphone?',
    options: [
      { id: 'a', text: 'Usar el flash directo de la cámara a corta distancia en una habitación oscura.' },
      { id: 'b', text: 'Aplicar filtros de saturación intensa para que los colores se vean más brillantes que en la realidad.' },
      { id: 'c', text: 'Aprovechar luz natural difusa (cerca de una ventana sin sol directo), limpiar el lente y usar un fondo neutro.' },
      { id: 'd', text: 'Tomar la foto con la prenda muy arrugada para que se note que es ropa usada.' },
    ],
    correctAnswerId: 'c',
    explanation: 'La luz natural difusa revela la textura y el color fidedigno del textil sin sombras duras. Un fondo neutro y la lente limpia aseguran nitidez y una apariencia profesional para el catálogo.',
  },
  {
    id: 3,
    topic: 'cuidado-catalogo',
    topicLabel: 'Cuidado e Interpretación del Catálogo',
    question: 'En el catálogo de Reborn Your Style, ¿cuál es la diferencia principal entre una publicación de tipo "Transformación" y una de tipo "Intercambio"?',
    options: [
      { id: 'a', text: 'No existe diferencia; en ambas opciones la prenda se vende al precio más alto posible.' },
      { id: 'b', text: '"Transformación" solicita los servicios de un modista para rediseñar la prenda; "Intercambio" busca trocar la pieza por otra prenda o material con otro usuario.' },
      { id: 'c', text: '"Transformación" es solo para prendas de cuero sintético y no admite modistas independientes.' },
      { id: 'd', text: '"Intercambio" implica obligatoriamente regalar la prenda a una fábrica textil industrial.' },
    ],
    correctAnswerId: 'b',
    explanation: 'Reborn Your Style clasifica los proyectos según su propósito circular: en Transformación un cliente busca conectar con un taller/modista para intervenir la prenda, mientras que en Intercambio busca permutarla directamente con otro usuario.',
  },
  {
    id: 4,
    topic: 'buenas-practicas',
    topicLabel: 'Buenas Prácticas Textiles',
    question: 'Al unir retazos de telas de diferente procedencia (ejemplo: algodón de camisa con denim elástico de jean), ¿qué precaución fundamental se debe tomar antes de cortar y coser?',
    options: [
      { id: 'a', text: 'Ninguna; todas las fibras reaccionan exactamente igual al lavado y al calor.' },
      { id: 'b', text: 'Lavar y planchar previamente ambos retazos para evitar encogimientos diferenciales y evaluar la elasticidad.' },
      { id: 'c', text: 'Estirar con fuerza el tejido que no tiene elasticidad para que se rompan las fibras.' },
      { id: 'd', text: 'Pegar las telas con pegamento escolar antes de pasar la máquina de coser.' },
    ],
    correctAnswerId: 'b',
    explanation: 'El pre-lavado y planchado estabiliza las dimensiones del tejido. Si mezclas telas sin pre-lavar, una puede encoger en el primer lavado deformando toda la prenda intervenida.',
  },
  {
    id: 5,
    topic: 'contenido-digital',
    topicLabel: 'Contenido Digital y Ficha Técnica',
    question: 'Al redactar la ficha técnica digital de una prenda en el catálogo, ¿por qué es indispensable registrar medidas en centímetros en vez de solo la talla comercial (S/M/L)?',
    options: [
      { id: 'a', text: 'Porque las tallas comerciales varían radicalmente entre marcas y el suprareciclaje requiere precisión anatómica.' },
      { id: 'b', text: 'Porque las medidas en centímetros son obligatorias únicamente para prendas exportadas fuera del país.' },
      { id: 'c', text: 'Para que la prenda no pueda ser vista por otros costureros de la plataforma.' },
      { id: 'd', text: 'Porque en moda circular está prohibido usar la letra M o L.' },
    ],
    correctAnswerId: 'a',
    explanation: 'En las prendas vintage y modificadas la talla de la etiqueta original casi nunca coincide con el ajuste real. Registrar medidas exactas en centímetros (busto, cintura, cadera, largo) garantiza que el cliente o modista sepan exactamente las dimensiones reales.',
  },
  {
    id: 6,
    topic: 'buenas-practicas',
    topicLabel: 'Buenas Prácticas Textiles',
    question: '¿Qué es la técnica japonesa "Sashiko" aplicada al supra-reciclaje y moda circular?',
    options: [
      { id: 'a', text: 'Un tipo de tinte químico sintético altamente contaminante para ropa oscura.' },
      { id: 'b', text: 'Una técnica de bordado geométrico de reparación visible que refuerza y embellece áreas desgastadas.' },
      { id: 'c', text: 'Un método para quemar con soplete los bordes deshilachados de las telas sintéticas.' },
      { id: 'd', text: 'Una máquina industrial para cortar 100 prendas al mismo tiempo.' },
    ],
    correctAnswerId: 'b',
    explanation: 'El Sashiko es una tradición artesanal japonesa que utiliza puntadas rectas visibles con hilos contrastantes para unir capas de tela desgastadas, transformando la reparación en un elemento estético y funcional de larga duración.',
  },
  {
    id: 7,
    topic: 'cuidado-catalogo',
    topicLabel: 'Sostenibilidad y Cuidado Textil',
    question: '¿Cuál es la recomendación óptima para el lavado y cuidado de prendas que han sido intervenidas con técnicas mixtas (bordados, parches de mezclilla o pintura textil)?',
    options: [
      { id: 'a', text: 'Lavar con agua caliente a 90°C y usar blanqueador con cloro en cada ciclo.' },
      { id: 'b', text: 'Lavar con agua fría, al revés, en ciclo suave o a mano, y secar tendido a la sombra sin retorcer.' },
      { id: 'c', text: 'Secar en secadora a temperatura máxima durante 2 horas continuas.' },
      { id: 'd', text: 'No lavar nunca la prenda bajo ninguna circunstancia.' },
    ],
    correctAnswerId: 'b',
    explanation: 'El agua fría y el lavado al revés protegen las aplicaciones artesanales, evitan el desgaste de las tintas o bordados y previenen la decoloración y el encogimiento del tejido.',
  },
];
