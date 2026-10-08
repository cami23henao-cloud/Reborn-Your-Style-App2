import React, { useState } from 'react';
import { Professional, GarmentProject, InspirationItem, ServiceItem, AppView } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionals: Professional[];
  garments: GarmentProject[];
  inspirations: InspirationItem[];
  services: ServiceItem[];
  onSelectProfessional: (pro: Professional) => void;
  onNavigate: (view: AppView) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  professionals,
  garments,
  inspirations,
  services,
  onSelectProfessional,
  onNavigate,
}) => {
  const { language, tCategory } = useThemeLanguage();
  const isEn = language === 'en';
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredPros = query
    ? professionals.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.location.toLowerCase().includes(q)
      )
    : professionals.slice(0, 3);

  const filteredGarments = query
    ? garments.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      )
    : garments.slice(0, 2);

  const filteredInspiration = query
    ? inspirations.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.creatorName.toLowerCase().includes(q)
      )
    : inspirations.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0e241c] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#efeee9] dark:border-[#2b694d]/40 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-[#efeee9] dark:border-[#2b694d]/30 flex items-center gap-3 bg-[#faf9f4] dark:bg-[#002113]/50">
          <span className="material-symbols-outlined text-[#2b694d] dark:text-[#b0f1cc] text-2xl">search</span>
          <input
            type="text"
            autoFocus
            placeholder={isEn ? 'Search by tailor, garment, technique (e.g. embroidery, denim, tailoring)...' : 'Buscar por diseñador, prenda, técnica (ej: bordado, denim, ajuste)...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base text-[#1b1c19] dark:text-white outline-none placeholder:text-[#717973] dark:placeholder:text-[#a0a5a1] font-body"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#717973] dark:text-[#a0a5a1] hover:text-[#1b1c19] dark:hover:text-white p-1 text-sm cursor-pointer"
              title={isEn ? 'Clear search' : 'Borrar búsqueda'}
            >
              <span className="material-symbols-outlined text-base">cancel</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeee9] dark:bg-[#002113] hover:bg-[#e3e3de] text-[#1b1c19] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Shortcuts */}
          {!query && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-[#717973] dark:text-[#a0a5a1] self-center mr-1">
                {isEn ? 'Suggestions:' : 'Sugerencias:'}
              </span>
              {(isEn ? ['Embroidery', 'Denim', 'Jackets', 'Comuna 9', 'Upcycling', 'Botanical Dye'] : ['Bordado', 'Denim', 'Chaquetas', 'Comuna 9', 'Upcycling', 'Teñido']).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1 rounded-full bg-[#f5f4ef] dark:bg-[#002113]/50 hover:bg-[#b0f1cc] hover:text-[#002113] text-xs font-medium text-[#012d1d] dark:text-[#b0f1cc] transition-colors border border-[#c1c8c2]/40 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Professionals Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[#717973] dark:text-[#a0a5a1]">
                {isEn ? 'Designers & Tailors' : 'Diseñadores y Talleres'} ({filteredPros.length})
              </h3>
              <button
                onClick={() => {
                  onNavigate('explora');
                  onClose();
                }}
                className="text-xs font-semibold text-[#2b694d] dark:text-[#b0f1cc] hover:underline cursor-pointer"
              >
                {isEn ? 'View all' : 'Ver todos'}
              </button>
            </div>
            {filteredPros.length > 0 ? (
              <div className="space-y-2">
                {filteredPros.map((pro) => (
                  <div
                    key={pro.id}
                    onClick={() => {
                      onSelectProfessional(pro);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f4ef] dark:hover:bg-[#002113]/40 transition-colors cursor-pointer border border-[#efeee9] dark:border-[#2b694d]/30 group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pro.imageUrl}
                        alt={pro.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#efeee9] dark:border-[#2b694d]/30"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-[#012d1d] dark:text-white group-hover:text-[#2b694d] transition-colors">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-[#717973] dark:text-[#a0a5a1]">{pro.specialty} • {pro.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#012d1d] dark:text-[#b0f1cc] bg-[#efeee9] dark:bg-[#002113] px-2.5 py-1 rounded-full">
                        {isEn ? `From $${(pro.startingPrice).toLocaleString('es-CO')}` : `Desde $${(pro.startingPrice).toLocaleString('es-CO')}`}
                      </span>
                      <span className="material-symbols-outlined text-[#717973] group-hover:translate-x-1 transition-transform text-sm">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#717973] dark:text-[#a0a5a1] italic">
                {isEn ? 'No professionals found with that search.' : 'No se encontraron profesionales con esa búsqueda.'}
              </p>
            )}
          </div>

          {/* Inspiration Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[#717973] dark:text-[#a0a5a1]">
                {isEn ? 'Inspiration Ideas' : 'Ideas de Inspiración'} ({filteredInspiration.length})
              </h3>
              <button
                onClick={() => {
                  onNavigate('inspiracion');
                  onClose();
                }}
                className="text-xs font-semibold text-[#2b694d] dark:text-[#b0f1cc] hover:underline cursor-pointer"
              >
                {isEn ? 'View gallery' : 'Ver galería'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredInspiration.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate('inspiracion');
                    onClose();
                  }}
                  className="flex gap-3 p-2.5 rounded-xl hover:bg-[#f5f4ef] dark:hover:bg-[#002113]/40 border border-[#efeee9] dark:border-[#2b694d]/30 cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#012d1d] dark:text-white truncate">{item.title}</h5>
                    <p className="text-[11px] text-[#717973] dark:text-[#a0a5a1] mt-0.5">{item.creatorName}</p>
                    <span className="inline-block mt-1 text-[10px] bg-[#b0f1cc]/40 text-[#002113] dark:text-[#b0f1cc] px-2 py-0.5 rounded-full font-semibold">
                      {tCategory(item.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
