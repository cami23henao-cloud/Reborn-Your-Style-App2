import React, { useState } from 'react';
import { AppView, GarmentProject } from '../../types';
import { EXPANDED_CATEGORIES, GarmentCategoryItem } from '../../data/categoriesData';

interface CatalogosViewProps {
  onNavigate: (view: AppView) => void;
  onSelectCategory: (categoryName: string) => void;
  garments: GarmentProject[];
}

export const CatalogosView: React.FC<CatalogosViewProps> = ({
  onNavigate,
  onSelectCategory,
  garments
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to count items per category
  const getItemCount = (category: GarmentCategoryItem) => {
    return garments.filter(g => {
      const catLower = category.name.toLowerCase();
      const gCat = g.category.toLowerCase();
      if (category.id === 'calzones') {
        return gCat.includes('calzon') || gCat.includes('ropa interior') || gCat.includes('íntima');
      }
      if (category.id === 'ropa') {
        return gCat.includes('ropa') || gCat.includes('chaqueta') || gCat.includes('suéter') || gCat.includes('conjunto');
      }
      if (category.id === 'camisas-blusas') {
        return gCat.includes('camisa') || gCat.includes('blusa');
      }
      return gCat.includes(catLower) || catLower.includes(gCat);
    }).length;
  };

  // Helper to get preview images
  const getPreviewGarments = (category: GarmentCategoryItem) => {
    return garments.filter(g => {
      const catLower = category.name.toLowerCase();
      const gCat = g.category.toLowerCase();
      if (category.id === 'calzones') {
        return gCat.includes('calzon') || gCat.includes('ropa interior') || gCat.includes('íntima');
      }
      if (category.id === 'ropa') {
        return gCat.includes('ropa') || gCat.includes('chaqueta') || gCat.includes('suéter') || gCat.includes('conjunto');
      }
      if (category.id === 'camisas-blusas') {
        return gCat.includes('camisa') || gCat.includes('blusa');
      }
      return gCat.includes(catLower) || catLower.includes(gCat);
    }).slice(0, 3);
  };

  const filteredCategories = EXPANDED_CATEGORIES.filter(cat => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.popularUpcyclingIdeas.some(idea => idea.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-14 animate-in fade-in">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#c1c8c2]/40">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b0f1cc]/50 text-[#002113] text-xs font-bold border border-[#2b694d]/20">
            <span className="material-symbols-outlined text-sm">category</span>
            <span>Clasificación Textil por Tipo de Prenda</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#012d1d] tracking-tight">
            Catálogos por Categoría
          </h1>
          <p className="text-sm sm:text-base text-[#414844] leading-relaxed">
            Cada botón abre una sección exclusiva con productos que pertenecen <strong>únicamente</strong> a esa categoría. Haz clic en la categoría que deseas explorar para ver sus prendas disponibles.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="bg-[#012d1d] hover:bg-[#2b694d] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Publicar en catálogo</span>
          </button>
          <button
            onClick={() => onNavigate('costureros')}
            className="bg-[#faf9f4] hover:bg-[#efeee9] text-[#012d1d] border border-[#c1c8c2] font-bold text-xs sm:text-sm px-5 py-3 rounded-full transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">person_search</span>
            <span>Encuentra tu costurero</span>
          </button>
        </div>
      </div>

      {/* Search and Category Quick Chips */}
      <div className="my-8 flex flex-col gap-4">
        <div className="relative max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973] text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar categoría (ej. Bolsos, Calzones, Pantalones...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#c1c8c2] rounded-2xl text-xs sm:text-sm text-[#012d1d] placeholder-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d]/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#717973] hover:text-[#012d1d]"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Priority Quick Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-[#717973] font-semibold whitespace-nowrap">Accesos directos:</span>
          {EXPANDED_CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#b0f1cc]/40 border border-[#c1c8c2]/60 hover:border-[#012d1d] text-[#012d1d] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm text-[#2b694d]">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const count = getItemCount(cat);
          const previews = getPreviewGarments(cat);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 hover:border-[#012d1d] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                {/* Header with Minimalist Icon & Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#faf9f4] group-hover:bg-[#012d1d] flex items-center justify-center transition-colors border border-[#c1c8c2]/40">
                    <span className="material-symbols-outlined text-xl text-[#012d1d] group-hover:text-[#b0f1cc] transition-colors">{cat.icon}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#faf9f4] text-[#2b694d] text-xs font-bold border border-[#c1c8c2]/30">
                    {count} {count === 1 ? 'prenda' : 'prendas'}
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#012d1d] group-hover:text-[#2b694d] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#414844] leading-relaxed mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {/* Popular ideas tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.popularUpcyclingIdeas.slice(0, 2).map((idea, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-[#faf9f4] text-[#414844] px-2 py-0.5 rounded-md border border-[#efeee9]"
                    >
                      {idea}
                    </span>
                  ))}
                </div>

                {/* Preview thumbnails */}
                {previews.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-[#717973] uppercase tracking-wider mb-2">
                      Prendas en esta categoría:
                    </p>
                    <div className="flex gap-2">
                      {previews.map((item) => (
                        <div key={item.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#efeee9] shadow-2xs">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="pt-4 border-t border-[#efeee9] flex items-center justify-between text-xs font-bold text-[#2b694d] group-hover:text-[#012d1d]">
                <span>Ver catálogo de {cat.name}</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
