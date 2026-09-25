import React, { useState } from 'react';
import { InspirationItem, AppView, Professional } from '../../types';
import { BrandLogo } from '../BrandLogo';

interface InspiracionViewProps {
  inspirations: InspirationItem[];
  professionals: Professional[];
  onSelectProfessional: (pro: Professional) => void;
  onNavigate: (view: AppView) => void;
  onLikeInspiration: (id: string) => void;
}

export const InspiracionView: React.FC<InspiracionViewProps> = ({
  inspirations,
  professionals,
  onSelectProfessional,
  onNavigate,
  onLikeInspiration,
}) => {
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [activeItem, setActiveItem] = useState<InspirationItem | null>(null);

  const tags = ['Todos', 'Denim Upcycling', 'Bordados', 'Patchwork', 'Botánica', 'Sastrería'];

  const filteredItems = selectedTag === 'Todos'
    ? inspirations
    : inspirations.filter((item) => item.category === selectedTag || item.tags.includes(selectedTag));

  const getCreatorProfile = (creatorName: string): Professional | undefined => {
    return professionals.find((p) => p.name.toLowerCase().includes(creatorName.toLowerCase())) || professionals[0];
  };

  const handleCreatorClick = (creatorName: string) => {
    const matched = getCreatorProfile(creatorName);
    if (matched) {
      onSelectProfessional(matched);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-12 animate-in fade-in">
      {/* Header with Brand Logo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 bg-white p-6 rounded-3xl border border-[#c1c8c2]/50 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrandLogo size="xs" variant="emblem" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d]">
              Galería Comunitaria Reborn
            </span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#012d1d]">
            Inspiración y Proyectos de Suprareciclaje
          </h1>
          <p className="text-xs md:text-sm text-[#414844] mt-1 max-w-xl">
            Descubre transformaciones reales creadas por artesanos y modistas colombianos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('explora')}
            className="bg-[#b0f1cc] text-[#002113] text-xs font-bold px-4 py-2.5 rounded-full hover:bg-white transition-all flex items-center gap-1.5 border border-[#2b694d]/30"
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>Ver Diseñadores</span>
          </button>
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="bg-[#012d1d] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#1b4332] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Publicar mi prenda</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === tag
                ? 'bg-[#012d1d] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#efeee9] border border-[#c1c8c2]/60'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const pro = getCreatorProfile(item.creatorName);
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all border border-[#c1c8c2]/50 flex flex-col group"
            >
              <div
                onClick={() => setActiveItem(item)}
                className="h-64 w-full relative overflow-hidden bg-[#e3e3de] cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-[#012d1d]">
                  {item.category}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    onClick={() => setActiveItem(item)}
                    className="font-headline font-bold text-base text-[#012d1d] hover:text-[#2b694d] cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>
                  <button
                    onClick={() => onLikeInspiration(item.id)}
                    className="flex items-center gap-1 text-xs text-[#717973] hover:text-[#ba1a1a] p-1 transition-colors"
                    title="Me gusta"
                  >
                    <span
                      className="material-symbols-outlined text-base text-rose-500"
                      style={{ fontVariationSettings: item.isLiked ? '"FILL" 1' : '"FILL" 0' }}
                    >
                      favorite
                    </span>
                    <span className="font-bold">{item.likes}</span>
                  </button>
                </div>

                <p className="text-xs text-[#414844] line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-[#faf9f4] text-[#012d1d] px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-[#c1c8c2]/30"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3 border-t border-[#efeee9] flex justify-between items-center">
                  <div
                    onClick={() => handleCreatorClick(item.creatorName)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={pro?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                      alt={item.creatorName}
                      className="w-7 h-7 rounded-full object-cover border border-[#b0f1cc]"
                    />
                    <span className="text-xs font-bold text-[#012d1d]">{item.creatorName}</span>
                  </div>

                  <button
                    onClick={() => handleCreatorClick(item.creatorName)}
                    className="text-xs font-bold text-[#2b694d] hover:text-[#012d1d] flex items-center gap-0.5"
                  >
                    <span>Ver taller</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Modal Detail */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#efeee9] flex flex-col max-h-[90vh]">
            <div className="relative h-72 sm:h-80 bg-[#e3e3de]">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-[#b0f1cc] text-[#002113] text-xs font-bold">
                  {activeItem.category}
                </span>
                <span className="text-xs text-[#717973] flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-base text-rose-500 fill-rose-500">favorite</span>
                  {activeItem.likes} personas inspiradas
                </span>
              </div>

              <h2 className="font-headline font-bold text-xl text-[#012d1d]">
                {activeItem.title}
              </h2>

              <p className="text-xs md:text-sm text-[#414844] leading-relaxed">
                {activeItem.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#faf9f4] border border-[#c1c8c2]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getCreatorProfile(activeItem.creatorName)?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                    alt={activeItem.creatorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#b0f1cc]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#012d1d]">{activeItem.creatorName}</h4>
                    <p className="text-[11px] text-[#717973]">Creador certificado en Reborn</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleCreatorClick(activeItem.creatorName);
                    setActiveItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d] transition-colors"
                >
                  Contactar taller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
