import React, { useState } from 'react';

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
];

interface TutorialsSectionProps {
  onSelectTutorial?: (tutorial: TutorialVideo) => void;
  isStandalonePage?: boolean;
}

export const TutorialsSection: React.FC<TutorialsSectionProps> = ({
  isStandalonePage = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<TutorialVideo | null>(null);

  const categories = [
    { id: 'todos', label: 'Todos los Videos' },
    { id: 'diy', label: 'Transformación DIY' },
    { id: 'denim', label: 'Denim & Jeans' },
    { id: 'upcycling', label: 'Upcycling Textil' },
    { id: 'costura', label: 'Costura Básica' },
  ];

  const filteredVideos = YOUTUBE_TUTORIAL_VIDEOS.filter((vid) => {
    const matchesCat = selectedCategory === 'todos' || vid.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className={`space-y-6 ${isStandalonePage ? 'w-full max-w-7xl mx-auto px-4 md:px-12 py-10' : ''}`}>
      {/* Banner de Presentación */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#113a29] to-[#012d1d] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#b0f1cc]/20 text-[#b0f1cc] border border-[#b0f1cc]/30">
              Reproducción Directa en Reborn
            </span>
            <span className="text-[11px] text-[#b0f1cc]">Sin Redirección Externa</span>
          </div>
          <h2 className="font-headline text-lg sm:text-2xl font-bold tracking-tight text-white">
            Tutoriales de Upcycling Textil y Modistería
          </h2>
          <p className="text-xs sm:text-sm text-[#e1eee7] max-w-xl">
            Aprende a transformar y reparar tus prendas con guías prácticas en video reproducidas directamente en la plataforma.
          </p>
        </div>

        <div className="w-full sm:w-auto relative shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tutorial..."
            className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-white/10 text-white placeholder-white/60 text-xs border border-white/20 focus:bg-white focus:text-[#012d1d] focus:placeholder-[#717973] outline-none transition-all"
          />
        </div>
      </div>

      {/* Selector de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#012d1d] text-[#b0f1cc] shadow-xs'
                : 'bg-[#faf9f4] dark:bg-[#112920] text-[#414844] dark:text-[#a7b8ae] hover:bg-[#efeee9] dark:hover:bg-[#17382c] border border-[#c1c8c2]/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Retícula responsive (Grid de tarjetas) donde los videos se reproducen DIRECTAMENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-[#0e241c] rounded-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Reproductor iFrame Directo Embebido con relación de aspecto responsive */}
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              <iframe
                title={video.title}
                src={video.embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
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
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae] mt-1.5 line-clamp-3 leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Botón para ver pasos detallados en modal */}
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

      {filteredVideos.length === 0 && (
        <div className="text-center py-12 bg-[#faf9f4] dark:bg-[#112920] rounded-2xl border border-dashed border-[#c1c8c2] dark:border-[#2b694d]/40">
          <span className="material-symbols-outlined text-4xl text-[#717973] mb-2">videocam_off</span>
          <p className="text-sm font-bold text-[#012d1d] dark:text-white">
            No encontramos videos para "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('todos');
            }}
            className="mt-3 text-xs text-[#2b694d] dark:text-[#b0f1cc] font-bold hover:underline"
          >
            Ver todos los tutoriales
          </button>
        </div>
      )}

      {/* MODAL DETALLADO CON PASOS Y REPRODUCTOR EMBEBIDO AMPLIADO */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#0e241c] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-[#efeee9] dark:border-[#2b694d]/40">
            {/* Header del Modal */}
            <div className="p-4 sm:px-6 sm:py-3.5 border-b border-[#efeee9] dark:border-[#2b694d]/30 flex items-center justify-between bg-[#faf9f4] dark:bg-[#071610]">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[#2b694d] dark:text-[#b0f1cc]">
                  smart_display
                </span>
                <div className="truncate">
                  <h3 className="font-headline font-bold text-sm sm:text-base text-[#012d1d] dark:text-white truncate">
                    {activeVideo.title}
                  </h3>
                  <span className="text-[11px] text-[#717973] dark:text-[#a7b8ae]">
                    {activeVideo.categoryLabel} • {activeVideo.duration}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-[#efeee9] dark:bg-[#17382c] hover:bg-[#c1c8c2] dark:hover:bg-[#2b694d] text-[#1b1c19] dark:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Cerrar video"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* iFrame Embebido Directo en Modal */}
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              <iframe
                title={activeVideo.title}
                src={activeVideo.embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Resumen y Pasos Clave del Video */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#012d1d] dark:text-white">
                  Descripción y Consejos
                </h4>
                <p className="text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#efeee9] dark:border-[#2b694d]/30">
                <h5 className="font-bold text-[#012d1d] dark:text-[#b0f1cc] uppercase tracking-wider text-[11px]">
                  Pasos destacados para transformar tu prenda:
                </h5>
                <ol className="space-y-2 list-none">
                  {activeVideo.steps.map((st, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-[#faf9f4] dark:bg-[#112920] border border-[#efeee9] dark:border-[#2b694d]/30"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#012d1d] dark:bg-[#b0f1cc] text-[#b0f1cc] dark:text-[#012d1d] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[#1b1c19] dark:text-[#e1eee7] leading-relaxed">
                        {st}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Botón de cierre */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#113a29] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
