import React, { useState } from 'react';
import { AppView, GarmentProject } from '../../types';
import { EXPANDED_CATEGORIES, GarmentCategoryItem } from '../../data/categoriesData';
import { isGarmentInCategory } from './CategoriaView';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface CatalogosViewProps {
  onNavigate: (view: AppView) => void;
  onSelectCategory: (categoryName: string) => void;
  garments: GarmentProject[];
}

export const CatalogosView: React.FC<CatalogosViewProps> = ({
  onNavigate,
  onSelectCategory,
  garments,
}) => {
  const { t, tCategory, language } = useThemeLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to count items per category strictly
  const getItemCount = (category: GarmentCategoryItem) => {
    return garments.filter((g) => isGarmentInCategory(g.category, category.name)).length;
  };

  // Helper to get preview images
  const getPreviewGarments = (category: GarmentCategoryItem) => {
    return garments.filter((g) => isGarmentInCategory(g.category, category.name)).slice(0, 3);
  };

  const filteredCategories = EXPANDED_CATEGORIES.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const catLocalized = tCategory(cat.name).toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      catLocalized.includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.popularUpcyclingIdeas.some((idea) => idea.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-3 sm:py-5 animate-in fade-in catalog-container-fit">
      {/* Contenedor Superior (Fold Area) - Encuadre visual completo */}
      <div className="catalog-fold-container w-full mb-1">
        {/* Hero Header - Proporcional y compacto */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-[#c1c8c2]/40 dark:border-[#2b694d]/40">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b0f1cc]/50 dark:bg-[#112920] text-[#002113] dark:text-[#b0f1cc] text-[11px] font-bold border border-[#2b694d]/20">
              <span className="material-symbols-outlined text-xs">category</span>
              <span>{language === 'en' ? 'Textile Classification by Garment Type' : 'Clasificación Textil por Tipo de Prenda'}</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-black text-[#012d1d] dark:text-white tracking-tight animate-title-entry">
              {t('catalog.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#414844] dark:text-[#a7b8ae] leading-snug">
              {t('catalog.desc')}
            </p>
          </div>
        </div>

        {/* Barra de acciones visible: Buscador, filtros y botón [ Publicar prenda ] en una sola fila responsiva */}
        <div
          className="catalog-actions-bar p-2.5 sm:p-3 bg-white dark:bg-[#0e241c] rounded-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          {/* Lado izquierdo: Buscador y Accesos Rápidos */}
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
            <div className="relative w-full sm:w-64 shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717973] dark:text-[#a7b8ae] text-base">
                search
              </span>
              <input
                type="text"
                placeholder={t('catalog.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/70 dark:border-[#2b694d]/40 rounded-xl text-xs sm:text-sm text-[#012d1d] dark:text-white placeholder-[#717973] dark:placeholder-[#7b9487] focus:outline-none focus:ring-1 focus:ring-[#012d1d]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#717973] hover:text-[#012d1d] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              <span className="text-[#717973] dark:text-[#a7b8ae] font-semibold text-[11px] whitespace-nowrap hidden lg:inline">
                {t('catalog.shortcuts')}
              </span>
              {EXPANDED_CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name)}
                  className="px-2.5 py-1 rounded-lg bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#b0f1cc]/40 dark:hover:bg-[#16382c] border border-[#c1c8c2]/60 dark:border-[#2b694d]/40 hover:border-[#012d1d] text-[#012d1d] dark:text-[#b0f1cc] font-semibold whitespace-nowrap transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc]">{cat.icon}</span>
                  <span>{tCategory(cat.name)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lado derecho: Botón [ Publicar prenda ] y Costureros */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="btn-interactive bg-[#012d1d] hover:bg-[#2b694d] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base text-[#b0f1cc]">add_circle</span>
              <span>{language === 'en' ? 'Post garment' : 'Publicar prenda'}</span>
            </button>
            <button
              onClick={() => onNavigate('costureros')}
              className="btn-interactive bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] dark:hover:bg-[#16382c] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2] dark:border-[#2b694d]/50 font-bold text-xs sm:text-sm px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">person_search</span>
              <span>{t('hero.btn_costurero')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid - Cuadrícula proporcional */}
      <div
        className="scroll-reveal catalog-grid adaptive-catalog-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {filteredCategories.map((cat) => {
          const count = getItemCount(cat);
          const previews = getPreviewGarments(cat);
          const localizedName = tCategory(cat.name);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-6 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 hover:border-[#012d1d] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                {/* Header with Minimalist Icon & Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] group-hover:bg-[#012d1d] flex items-center justify-center transition-colors border border-[#c1c8c2]/40 dark:border-[#2b694d]/30">
                    <span className="material-symbols-outlined text-xl text-[#012d1d] dark:text-[#b0f1cc] group-hover:text-[#b0f1cc] transition-colors">{cat.icon}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#faf9f4] dark:bg-[#112920] text-[#2b694d] dark:text-[#b0f1cc] text-xs font-bold border border-[#c1c8c2]/30 dark:border-[#2b694d]/20">
                    {count} {count === 1 ? t('catalog.garment_count') : t('catalog.garments_count')}
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#012d1d] dark:text-white group-hover:text-[#2b694d] dark:group-hover:text-[#b0f1cc] transition-colors text-hover-lift">
                    {localizedName}
                  </h3>
                  <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {/* Popular ideas tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.popularUpcyclingIdeas.slice(0, 2).map((idea, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-[#faf9f4] dark:bg-[#112920] text-[#414844] dark:text-[#a7b8ae] px-2 py-0.5 rounded-md border border-[#efeee9] dark:border-[#2b694d]/30"
                    >
                      {idea}
                    </span>
                  ))}
                </div>

                {/* Preview thumbnails */}
                {previews.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-[#717973] dark:text-[#a7b8ae] uppercase tracking-wider mb-2">
                      {language === 'en' ? 'Garments in this category:' : 'Prendas en esta categoría:'}
                    </p>
                    <div className="flex gap-2">
                      {previews.map((item) => (
                        <div key={item.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#efeee9] dark:border-[#2b694d]/40 shadow-2xs">
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
              <div className="pt-4 border-t border-[#efeee9] dark:border-[#173328] flex items-center justify-between text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] group-hover:text-[#012d1d] dark:group-hover:text-white">
                <span>{language === 'en' ? `View ${localizedName} catalog` : `Ver catálogo de ${cat.name}`}</span>
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
