import React, { useState } from 'react';
import { Professional, GarmentProject, InspirationItem, ServiceItem, AppView } from '../../types';

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#efeee9] flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-[#efeee9] flex items-center gap-3 bg-[#faf9f4]">
          <span className="material-symbols-outlined text-[#2b694d] text-2xl">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Buscar por diseñador, prenda, técnica (ej: bordado, denim, ajuste)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base text-[#1b1c19] outline-none placeholder:text-[#717973] font-body"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#717973] hover:text-[#1b1c19] p-1 text-sm"
              title="Borrar búsqueda"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeee9] hover:bg-[#e3e3de] text-[#1b1c19] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Shortcuts */}
          {!query && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-[#717973] self-center mr-1">Sugerencias:</span>
              {['Bordado', 'Denim', 'Chaquetas', 'Comuna 9', 'Upcycling', 'Teñido'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1 rounded-full bg-[#f5f4ef] hover:bg-[#b0f1cc] text-xs font-medium text-[#012d1d] transition-colors border border-[#c1c8c2]/40"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Professionals Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[#717973]">
                Diseñadores y Talleres ({filteredPros.length})
              </h3>
              <button
                onClick={() => {
                  onNavigate('explora');
                  onClose();
                }}
                className="text-xs font-semibold text-[#2b694d] hover:underline"
              >
                Ver todos
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
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f5f4ef] transition-colors cursor-pointer border border-[#efeee9] group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pro.imageUrl}
                        alt={pro.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#efeee9]"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-[#012d1d] group-hover:text-[#2b694d] transition-colors">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-[#717973]">{pro.specialty} • {pro.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#012d1d] bg-[#efeee9] px-2.5 py-1 rounded-full">
                        Desde ${(pro.startingPrice).toLocaleString('es-CO')}
                      </span>
                      <span className="material-symbols-outlined text-[#717973] group-hover:translate-x-1 transition-transform text-sm">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#717973] italic">No se encontraron profesionales con esa búsqueda.</p>
            )}
          </div>

          {/* Inspiration Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[#717973]">
                Ideas de Inspiración ({filteredInspiration.length})
              </h3>
              <button
                onClick={() => {
                  onNavigate('inspiracion');
                  onClose();
                }}
                className="text-xs font-semibold text-[#2b694d] hover:underline"
              >
                Ver galería
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
                  className="flex gap-3 p-2.5 rounded-xl hover:bg-[#f5f4ef] border border-[#efeee9] cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#012d1d] truncate">{item.title}</h5>
                    <p className="text-[11px] text-[#717973] mt-0.5">{item.creatorName}</p>
                    <span className="inline-block mt-1 text-[10px] bg-[#b0f1cc]/40 text-[#002113] px-2 py-0.5 rounded-full font-semibold">
                      {item.category}
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
