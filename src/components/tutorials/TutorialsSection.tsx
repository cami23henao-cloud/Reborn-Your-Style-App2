import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  EDUCATIONAL_ARTICLES,
  EDUCATIONAL_INFOGRAPHICS,
  DOWNLOADABLE_RESOURCES,
  ReadingArticle,
  InfographicItem,
  DownloadableResource,
} from '../../data/educationalContent';
import { AppView } from '../../types';

export interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  category: 'upcycling' | 'diy' | 'costura' | 'denim' | 'plataforma';
  categoryLabel: string;
  embedUrl: string;
  aspectRatio: '16:9' | '9:16';
  thumbnailUrl: string;
  description: string;
  steps: string[];
}

export const YOUTUBE_TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: 'tut-camisa-falda',
    title: 'Convertir Camisa en Falda - DIY',
    duration: '0:45 min',
    category: 'diy',
    categoryLabel: 'Transformación DIY',
    embedUrl: 'https://www.youtube.com/embed/MSIhhOWsfdw',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    description: 'Aprende a transformar una camisa oversize en desuso en una falda moderna con pretina elástica y botones frontales decorativos.',
    steps: [
      'Corta la parte superior de la camisa justo por debajo de las sisas.',
      'Dobla 3 cm en el borde superior cortado para crear la jareta de la pretina.',
      'Inserta un elástico de 2.5 cm con un gancho nodriza y ajusta a tu medida.',
      'Cose el dobladillo inferior y aprovecha la hilera de botones existente como detalle frontal.',
    ],
  },
  {
    id: 'tut-calcetines',
    title: 'Coser Calcetines de Ropa Vieja',
    duration: '1:00 min',
    category: 'costura',
    categoryLabel: 'Costura Básica',
    embedUrl: 'https://www.youtube.com/embed/wsGAvoVTbsc',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    description: 'Guía paso a paso para confeccionar calcetines y calentadores cómodos aprovechando mangas de suéteres o tela de camisetas viejas.',
    steps: [
      'Usa un calcetín existente como plantilla y trázalo sobre el retazo textil dejando 1 cm de margen.',
      'Corta las dos piezas cuidando que la elasticidad de la tela quede en sentido horizontal.',
      'Une los bordes con una puntada elástica en zigzag o fileteadora para evitar deshilachados.',
      'Prueba y refuerza la zona del talón y la puntera con doble costura resistente.',
    ],
  },
  {
    id: 'tut-camiseta-blusa',
    title: 'Transformar Camiseta en Blusa',
    duration: '0:50 min',
    category: 'upcycling',
    categoryLabel: 'Upcycling Textil',
    embedUrl: 'https://www.youtube.com/embed/Z0pH_Ssm8K8',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
    description: 'Convierte una camiseta básica o aburrida en una blusa campesina o top estilizado con vuelos y corte favorecedor.',
    steps: [
      'Marca el nuevo escote deseado con tiza de sastre y corta el cuello original.',
      'Haz aberturas laterales o frunces en las mangas para darle movimiento y textura.',
      'Añade un cordón o elástico en el bajo para un efecto abullonado sofisticado.',
      'Remata los bordes con puntada invisible o déjalo al corte si es tela jersey de algodón.',
    ],
  },
  {
    id: 'tut-jeans-falda',
    title: 'Transforma tus Jeans Viejos en Falda',
    duration: '1:15 min',
    category: 'denim',
    categoryLabel: 'Denim & Jeans',
    embedUrl: 'https://www.youtube.com/embed/EE6_NpTTUEk',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800&auto=format&fit=crop&q=80',
    description: 'Técnica clásica e infalible para descoser el tiro de tus vaqueros desgastados y convertirlos en una falda midi o mini de tendencia.',
    steps: [
      'Desose la entrepierna y la curva del tiro delantero y trasero hasta la base del cierre.',
      'Superpón los paneles de mezclilla de forma plana formando un triángulo simétrico.',
      'Rellena el triángulo frontal con un retazo de tela de la bota del pantalón.',
      'Cose con hilo contrastante dorado característico de denim y define el largo final.',
    ],
  },
  {
    id: 'tut-jeans-short',
    title: 'Convierte un Jeans en Short Super Fácil',
    duration: '0:40 min',
    category: 'denim',
    categoryLabel: 'Denim & Shorts',
    embedUrl: 'https://www.youtube.com/embed/xGF5gynHJn8',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
    description: 'Crea shorts personalizados en menos de 10 minutos con dobladillo deshilachado o vuelto limpio a partir de pantalones en desuso.',
    steps: [
      'Ponte el jean y marca con una tiza la altura deseada (considera 2 cm extra para el dobladillo).',
      'Extiende el jean plano y corta en diagonal suave, ligeramente más largo hacia la entrepierna.',
      'Usa la pernera cortada como molde para cortar la otra exactamente a la misma altura.',
      'Deshilacha con un cepillo de cerdas duras para un look rústico o haz dos dobleces con plancha.',
    ],
  },
  {
    id: 'tut-pantalones-reparar',
    title: 'Reparar Pantalones Desgastados con Patchwork',
    duration: '0:45 min',
    category: 'costura',
    categoryLabel: 'Costura & Reparación',
    embedUrl: 'https://www.youtube.com/embed/O8Y8Zz2rV4w',
    aspectRatio: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
    description: 'Repara roturas en la entrepierna o rodillas aplicando parches internos reforzados con pespunte en abanico.',
    steps: [
      'Coloca entretela termoadhesiva por el revés de la rotura para estabilizar el tejido.',
      'Añade un parche de tela resistente por el interior que sobrepase 2 cm el agujero.',
      'Pasa múltiples líneas de pespunte paralelo en el sentido de la sarga del pantalón.',
      'Plancha con vapor para sellar y comprobar la flexibilidad de la reparación.',
    ],
  },
];

interface TutorialsSectionProps {
  isStandalonePage?: boolean;
  onNavigate?: (view: AppView) => void;
}

type TutorialFormat = 'todos' | 'videos' | 'articulos' | 'infografias' | 'descargas';

export const TutorialsSection: React.FC<TutorialsSectionProps> = ({
  isStandalonePage = false,
  onNavigate,
}) => {
  const [activeFormat, setActiveFormat] = useState<TutorialFormat>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>('todos');

  // Modals state
  const [activeVideo, setActiveVideo] = useState<TutorialVideo | null>(null);
  const [activeArticle, setActiveArticle] = useState<ReadingArticle | null>(null);
  const [activeInfographic, setActiveInfographic] = useState<InfographicItem | null>(null);
  const [activeResource, setActiveResource] = useState<DownloadableResource | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const videoCategories = [
    { id: 'todos', label: 'Todos los Videos' },
    { id: 'denim', label: 'Denim & Jeans' },
    { id: 'diy', label: 'Transformación DIY' },
    { id: 'upcycling', label: 'Upcycling Textil' },
    { id: 'costura', label: 'Costura Básica' },
  ];

  const filteredVideos = YOUTUBE_TUTORIAL_VIDEOS.filter((vid) => {
    const matchesCat = selectedVideoCategory === 'todos' || vid.category === selectedVideoCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredArticles = EDUCATIONAL_ARTICLES.filter((art) => {
    return (
      !searchQuery.trim() ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredInfographics = EDUCATIONAL_INFOGRAPHICS.filter((info) => {
    return (
      !searchQuery.trim() ||
      info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredResources = DOWNLOADABLE_RESOURCES.filter((res) => {
    return (
      !searchQuery.trim() ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const triggerDownload = (resource: DownloadableResource) => {
    try {
      const blob = new Blob([resource.mockPdfText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resource.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccessToast(`¡"${resource.title}" descargado con éxito!`);
      setTimeout(() => setDownloadSuccessToast(null), 3500);
    } catch {
      window.print();
    }
  };

  return (
    <div className={`space-y-8 ${isStandalonePage ? 'w-full max-w-7xl mx-auto px-4 md:px-8 py-8' : ''}`}>
      {/* Toast de descarga */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#012d1d] text-[#b0f1cc] px-5 py-3 rounded-2xl shadow-xl border border-[#b0f1cc]/50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 text-xs font-bold">
          <span className="material-symbols-outlined text-lg">download_done</span>
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Hero Banner Multiformato */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#012d1d] via-[#113a29] to-[#012d1d] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#b0f1cc] text-[#002113]">
              Centro de Aprendizaje & Contenidos Digitales
            </span>
            <span className="text-xs text-[#b0f1cc] font-semibold">
              Videos • Artículos • Infografías • Recursos Descargables
            </span>
          </div>

          <h1 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Formación Práctica en Upcycling y Contenido Digital
          </h1>

          <p className="text-xs sm:text-sm text-[#e1eee7] leading-relaxed">
            Domina las técnicas de deconstrucción y costura artesanal, documenta tus prendas con fotografía profesional para smartphone, gestiona fichas técnicas y certifica tus conocimientos.
          </p>

          {/* Quick Call to Action: Ir al Test de Evaluación */}
          {onNavigate && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('evaluacion')}
                className="px-5 py-2.5 rounded-xl bg-[#b0f1cc] hover:bg-[#86efac] text-[#002113] text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Evalúa tus Conocimientos (Test & Certificado)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat('articulos')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>Ver Guías Lectivas</span>
              </button>
            </div>
          )}
        </div>

        {/* Decorative pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[240px]">architecture</span>
        </div>
      </div>

      {/* Selector de Formatos y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#0e241c] p-3 rounded-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs">
        {/* Format Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'todos', label: 'Todo el Contenido', icon: 'auto_stories' },
            { id: 'videos', label: 'Videos Embebidos', icon: 'smart_display' },
            { id: 'articulos', label: 'Guías Lectivas', icon: 'article' },
            { id: 'infografias', label: 'Infografías', icon: 'schema' },
            { id: 'descargas', label: 'Recursos PDF', icon: 'download' },
          ].map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setActiveFormat(fmt.id as TutorialFormat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFormat === fmt.id
                  ? 'bg-[#012d1d] text-[#b0f1cc] shadow-xs'
                  : 'text-[#414844] dark:text-[#a7b8ae] hover:bg-[#faf9f4] dark:hover:bg-[#112920]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{fmt.icon}</span>
              <span>{fmt.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en contenidos..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#faf9f4] dark:bg-[#112920] text-xs text-[#012d1d] dark:text-white border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 outline-none focus:border-[#012d1d]"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECCIÓN 1: GUÍAS LECTIVAS / ARTÍCULOS INTERACTIVOS                   */}
      {/* ===================================================================== */}
      {(activeFormat === 'todos' || activeFormat === 'articulos') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#e8f5ed] dark:bg-[#16382c] text-[#2b694d] dark:text-[#b0f1cc] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">article</span>
              </span>
              <div>
                <h2 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                  Guías Lectivas y Artículos Interactivos
                </h2>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">
                  Estrategias digitales, técnica fotográfica de prendas y fichas técnicas estándar.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc]">
              {filteredArticles.length} guías
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 overflow-hidden shadow-xs hover:border-[#012d1d] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video w-full overflow-hidden bg-[#102b1e]">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#012d1d]/85 backdrop-blur-xs text-[#b0f1cc] text-[10px] font-bold">
                      {article.categoryLabel}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#012d1d] text-[10px] font-bold shadow-2xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">timer</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white group-hover:text-[#2b694d] dark:group-hover:text-[#b0f1cc] transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-[#efeee9] dark:border-[#173328] flex items-center justify-between text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] group-hover:text-[#012d1d]">
                    <span>Leer guía completa</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECCIÓN 2: INFOGRAFÍAS Y DIAGRAMAS VISUALES                         */}
      {/* ===================================================================== */}
      {(activeFormat === 'todos' || activeFormat === 'infografias') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#e8f5ed] dark:bg-[#16382c] text-[#2b694d] dark:text-[#b0f1cc] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">schema</span>
              </span>
              <div>
                <h2 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                  Infografías y Diagramas Visuales
                </h2>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">
                  Esquemas paso a paso sobre la cadena de modificación textil, anatomía denim y sostenibilidad.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc]">
              {filteredInfographics.length} diagramas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredInfographics.map((info) => (
              <div
                key={info.id}
                className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 overflow-hidden shadow-xs hover:border-[#012d1d] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    onClick={() => setActiveInfographic(info)}
                    className="relative aspect-video w-full overflow-hidden bg-[#102b1e] cursor-pointer group"
                  >
                    <img
                      src={info.previewUrl}
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-white text-[#012d1d] text-xs font-bold flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                        <span>Ampliar diagrama</span>
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#012d1d]/85 backdrop-blur-xs text-[#b0f1cc] text-[10px] font-bold">
                      {info.categoryLabel}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white">
                      {info.title}
                    </h3>
                    <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed line-clamp-2">
                      {info.description}
                    </p>

                    {/* Step pill preview */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {info.steps.map((st, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-[#2b694d] dark:text-[#b0f1cc]"
                        >
                          {st.number}. {st.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-[#efeee9] dark:border-[#173328]">
                  <button
                    type="button"
                    onClick={() => setActiveInfographic(info)}
                    className="py-2 px-3 rounded-xl bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] text-[#012d1d] dark:text-[#b0f1cc] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Ver detalle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDownloadSuccessToast(`Descargando esquema: ${info.title}...`);
                      setTimeout(() => setDownloadSuccessToast(null), 3000);
                    }}
                    className="py-2 px-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECCIÓN 3: RECURSOS DESCARGABLES (PDF / PLANTILLAS)                 */}
      {/* ===================================================================== */}
      {(activeFormat === 'todos' || activeFormat === 'descargas') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#e8f5ed] dark:bg-[#16382c] text-[#2b694d] dark:text-[#b0f1cc] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">download</span>
              </span>
              <div>
                <h2 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                  Guías en PDF y Recursos Descargables
                </h2>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">
                  Plantillas de medidas, guías de puntadas upcycling y checklist de control de calidad listos para usar.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc]">
              {filteredResources.length} recursos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-6 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs hover:border-[#012d1d] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-2xl">{res.icon}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-[10px] font-black text-[#2b694d] dark:text-[#b0f1cc] uppercase">
                      {res.fileType} • {res.sizeFormatted}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white">
                      {res.title}
                    </h3>
                    <p className="text-xs text-[#414844] dark:text-[#a7b8ae] mt-1 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  {/* Bullet Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717973] dark:text-[#a7b8ae] block">
                      Contenido incluido:
                    </span>
                    {res.contentPreview.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-[#414844] dark:text-[#a7b8ae]">
                        <span className="material-symbols-outlined text-sm text-[#2b694d] dark:text-[#b0f1cc] shrink-0">check_small</span>
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#efeee9] dark:border-[#173328] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveResource(res)}
                    className="py-2.5 px-3 rounded-xl bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] text-[#012d1d] dark:text-[#b0f1cc] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Ver ficha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerDownload(res)}
                    className="py-2.5 px-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECCIÓN 4: GALERÍA DE VIDEOS EMBEBIDOS (MANTENIDA Y REFORZADA)        */}
      {/* ===================================================================== */}
      {(activeFormat === 'todos' || activeFormat === 'videos') && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#e8f5ed] dark:bg-[#16382c] text-[#2b694d] dark:text-[#b0f1cc] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">smart_display</span>
              </span>
              <div>
                <h2 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                  Galería de Videos Tutoriales Embebidos
                </h2>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">
                  Reproducción fluida directa sin salir de la plataforma.
                </p>
              </div>
            </div>

            {/* Categorías de video */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {videoCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedVideoCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedVideoCategory === cat.id
                      ? 'bg-[#012d1d] text-[#b0f1cc] shadow-xs'
                      : 'bg-white dark:bg-[#112920] text-[#414844] dark:text-[#a7b8ae] border border-[#c1c8c2]/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-[#0e241c] rounded-3xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <iframe
                      title={video.title}
                      src={video.embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#012d1d]/10 dark:bg-[#b0f1cc]/15 text-[#012d1d] dark:text-[#b0f1cc] border border-[#012d1d]/20 dark:border-[#b0f1cc]/30">
                        {video.categoryLabel}
                      </span>
                      <span className="text-[10px] text-[#717973] dark:text-[#a7b8ae] flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-xs">timer</span>
                        {video.duration}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white line-clamp-2">
                      {video.title}
                    </h3>

                    <p className="text-xs text-[#717973] dark:text-[#a7b8ae] leading-relaxed line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-2 border-t border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <span className="material-symbols-outlined text-sm">checklist</span>
                      <span>Ver pasos detallados</span>
                    </button>
                    <span className="text-[10px] text-[#717973] dark:text-[#a7b8ae]">
                      {video.steps.length} pasos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* BANNER INFERIOR DESTACADO: TEST DIGITAL & CERTIFICACIÓN               */}
      {/* ===================================================================== */}
      {onNavigate && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#f2f8f4] via-white to-[#f2f8f4] dark:from-[#0c261b] dark:via-[#0e241c] dark:to-[#0c261b] border-2 border-[#b0f1cc] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
                Módulo Interactivo de Evaluación
              </span>
              <h3 className="font-headline font-extrabold text-lg sm:text-xl text-[#012d1d] dark:text-white">
                ¿Listo para certificar tus conocimientos?
              </h3>
              <p className="text-xs text-[#414844] dark:text-[#a7b8ae] max-w-lg mt-0.5">
                Realiza el cuestionario de buenas prácticas de suprareciclaje, contenido digital e interpretación del catálogo para desbloquear tu certificado oficial.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('evaluacion')}
            className="px-6 py-3 rounded-2xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-black transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">quiz</span>
            <span>Comenzar Evaluación (Quiz)</span>
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: LECTOR DE ARTÍCULO / GUÍA INTERACTIVA COMPLETA               */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-[#0e241c] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#c1c8c2] dark:border-[#2b694d] shadow-2xl flex flex-col"
            >
              {/* Cover & Close Button */}
              <div className="relative aspect-[21/9] w-full bg-[#102b1e] overflow-hidden">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black transition-colors flex items-center justify-center cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
                <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-[#012d1d]/90 text-[#b0f1cc] text-xs font-bold">
                  {activeArticle.categoryLabel} • {activeArticle.readTime}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white">
                    {activeArticle.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#717973] dark:text-[#a7b8ae] leading-relaxed">
                    {activeArticle.subtitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed italic">
                  "{activeArticle.summary}"
                </div>

                {/* Article Sections */}
                <div className="space-y-6 divide-y divide-[#efeee9] dark:divide-[#173328]">
                  {activeArticle.sections.map((sec, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-6 space-y-3' : 'space-y-3'}>
                      <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white">
                        {sec.heading}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                        {sec.content}
                      </p>

                      {sec.bulletPoints && (
                        <ul className="space-y-1.5 pl-2">
                          {sec.bulletPoints.map((bp, bidx) => (
                            <li key={bidx} className="flex items-start gap-2 text-xs text-[#414844] dark:text-[#a7b8ae]">
                              <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc] shrink-0 mt-0.5">check_circle</span>
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {sec.proTip && (
                        <div className="p-3.5 rounded-xl bg-[#e8f5ed] dark:bg-[#16382c] border border-[#b0f1cc]/80 text-xs text-[#012d1d] dark:text-[#b0f1cc] flex items-start gap-2">
                          <span className="material-symbols-outlined text-base text-[#2b694d] dark:text-[#b0f1cc] shrink-0">tips_and_updates</span>
                          <div>
                            <strong className="block font-bold">Pro-Tip de Modistería:</strong>
                            <span>{sec.proTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key takeaways */}
                <div className="p-5 rounded-2xl bg-[#012d1d] text-white space-y-2">
                  <h4 className="font-headline font-bold text-sm text-[#b0f1cc] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Puntos Clave para Recordar:</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-[#e1eee7]">
                    {activeArticle.keyTakeaways.map((kt, kidx) => (
                      <li key={kidx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{kt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cerrar Guía
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* MODAL 2: VISOR DE INFOGRAFÍA Y DIAGRAMA DETALLADO                     */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeInfographic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-[#0e241c] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#c1c8c2] dark:border-[#2b694d] shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] uppercase tracking-wider">
                    {activeInfographic.categoryLabel}
                  </span>
                  <h2 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white mt-1">
                    {activeInfographic.title}
                  </h2>
                  <p className="text-xs text-[#717973] dark:text-[#a7b8ae] mt-1">
                    {activeInfographic.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInfographic(null)}
                  className="w-9 h-9 rounded-full bg-[#faf9f4] dark:bg-[#112920] text-[#717973] hover:text-[#012d1d] flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Graphic Banner */}
              <div className="relative aspect-[16/7] w-full rounded-2xl overflow-hidden bg-[#102b1e]">
                <img
                  src={activeInfographic.fullDiagramUrl}
                  alt={activeInfographic.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-3">
                <h3 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white uppercase tracking-wider">
                  Etapas y Componentes del Esquema:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeInfographic.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center font-black text-xs">
                          {st.number}
                        </span>
                        <h4 className="font-headline font-bold text-xs text-[#012d1d] dark:text-white">
                          {st.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed pl-9">
                        {st.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#efeee9] dark:border-[#173328] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveInfographic(null)}
                  className="text-xs font-bold text-[#717973] hover:text-[#012d1d] cursor-pointer"
                >
                  Cerrar visor
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDownloadSuccessToast(`Descargando esquema: ${activeInfographic.downloadFileName}`);
                    setTimeout(() => setDownloadSuccessToast(null), 3000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Descargar Diagrama PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* MODAL 3: FICHA DE RECURSO DESCARGABLE Y GENERADOR DE ARCHIVO          */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-[#0e241c] rounded-3xl max-w-xl w-full border border-[#c1c8c2] dark:border-[#2b694d] shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{activeResource.icon}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] uppercase">
                      {activeResource.categoryLabel} • {activeResource.fileType} ({activeResource.sizeFormatted})
                    </span>
                    <h2 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white mt-0.5">
                      {activeResource.title}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveResource(null)}
                  className="w-8 h-8 rounded-full bg-[#faf9f4] text-[#717973] hover:text-[#012d1d] flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-xs space-y-2">
                <span className="font-bold text-[#012d1d] dark:text-white block">Vista previa del documento:</span>
                <pre className="font-mono text-[11px] text-[#414844] dark:text-[#a7b8ae] whitespace-pre-wrap max-h-48 overflow-y-auto bg-white dark:bg-[#071510] p-3 rounded-xl border border-[#c1c8c2]/40">
                  {activeResource.mockPdfText}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveResource(null)}
                  className="text-xs font-bold text-[#717973] hover:text-[#012d1d] cursor-pointer"
                >
                  Volver
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerDownload(activeResource);
                    setActiveResource(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Descargar Archivo Ahora</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* MODAL 4: PASOS DETALLADOS DE VIDEO (EXISTENTE)                        */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0e241c] rounded-3xl max-w-lg w-full border border-[#c1c8c2] dark:border-[#2b694d] shadow-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#012d1d]/10 text-[#012d1d] dark:text-[#b0f1cc]">
                    {activeVideo.categoryLabel}
                  </span>
                  <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white mt-1.5">
                    {activeVideo.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 rounded-full bg-[#faf9f4] text-[#717973] hover:text-[#012d1d] flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-[#012d1d] dark:text-white block uppercase tracking-wider">
                  Pasos de Confección:
                </span>
                <div className="space-y-2">
                  {activeVideo.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] text-xs flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                        {st}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="px-5 py-2 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
