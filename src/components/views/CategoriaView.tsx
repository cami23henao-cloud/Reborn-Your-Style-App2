import React, { useState, useMemo } from 'react';
import { AppView, GarmentProject } from '../../types';
import { EXPANDED_CATEGORIES, GarmentCategoryItem } from '../../data/categoriesData';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface CategoriaViewProps {
  categoryName: string;
  garments: GarmentProject[];
  onBackToCatalogos: () => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectGarment: (garment: GarmentProject) => void;
  onContactGarment?: (garment: GarmentProject) => void;
  onNavigate: (view: AppView) => void;
}

// Strict category filtering matching function
export function isGarmentInCategory(garmentCategory: string, targetCategory: string): boolean {
  if (!garmentCategory || !targetCategory) return false;
  const g = garmentCategory.trim().toLowerCase();
  const target = targetCategory.trim().toLowerCase();

  // 1. Camisas strictly
  if (target === 'camisas' || target === 'camisa') {
    return g === 'camisas' || g === 'camisa' || g.includes('camisa');
  }

  // 2. Blusas strictly
  if (target === 'blusas' || target === 'blusa') {
    return g === 'blusas' || g === 'blusa' || g.includes('blusa');
  }

  // 3. Pantalones strictly
  if (target === 'pantalones' || target === 'pantalon' || target === 'pantalón') {
    return g === 'pantalones' || g === 'pantalon' || g === 'pantalón' || g.includes('pantalon') || g.includes('pantalón') || g.includes('jeans');
  }

  // 4. Vestidos strictly
  if (target === 'vestidos' || target === 'vestido') {
    return g === 'vestidos' || g === 'vestido' || g.includes('vestido');
  }

  // 5. Chaquetas strictly
  if (target === 'chaquetas' || target === 'chaqueta' || target.includes('abrigo')) {
    return g === 'chaquetas' || g === 'chaqueta' || g.includes('chaqueta') || g.includes('blazer') || g.includes('abrigo') || g.includes('cazadora') || g.includes('chaleco');
  }

  // 6. Shorts strictly
  if (target === 'shorts' || target === 'short') {
    return g.includes('short') || g.includes('bermuda');
  }

  // 7. Suéteres strictly
  if (target.includes('sueter') || target.includes('suéter')) {
    return g.includes('suéter') || g.includes('sueter') || g.includes('buzo') || g.includes('saco') || g.includes('cárdigan');
  }

  // 8. Medias y calcetines
  if (target.includes('media') || target.includes('calentador')) {
    return g.includes('media') || g.includes('calentador') || g.includes('calcetines');
  }

  // 9. Ropa (conjuntos o piezas compuestas)
  if (target === 'ropa') {
    return g === 'ropa' || g === 'conjunto';
  }

  // 10. Otras prendas textiles
  if (target.includes('otra')) {
    return g.includes('otra') || g.includes('delantal') || g.includes('enterizo');
  }

  return g === target;
}

export const CategoriaView: React.FC<CategoriaViewProps> = ({
  categoryName,
  garments,
  onBackToCatalogos,
  onSelectCategory,
  onSelectGarment,
  onContactGarment,
  onNavigate,
}) => {
  const { t, tCategory, language } = useThemeLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedDept, setSelectedDept] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'precio-bajo' | 'precio-alto'>('recientes');

  // Find metadata for current category
  const categoryMeta: GarmentCategoryItem = useMemo(() => {
    const found = EXPANDED_CATEGORIES.find(
      (c) =>
        c.name.toLowerCase() === categoryName.toLowerCase() ||
        c.id.toLowerCase() === categoryName.toLowerCase()
    );
    if (found) return found;

    return {
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      icon: 'category',
      description: `Catálogo exclusivo de prendas pertenecientes únicamente a ${categoryName}.`,
      popularUpcyclingIdeas: ['Transformación Textil', 'Arreglo a Medida'],
    };
  }, [categoryName]);

  // Filter garments to ONLY this category - NO mixing, NO all platform items
  const categoryGarments = useMemo(() => {
    return garments.filter((g) => isGarmentInCategory(g.category, categoryMeta.name));
  }, [garments, categoryMeta]);

  // Available departments in this category
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    categoryGarments.forEach((g) => {
      if (g.department) set.add(g.department);
      else if (g.location) {
        const parts = g.location.split(',');
        if (parts.length > 1) set.add(parts[1].trim());
      }
    });
    return Array.from(set);
  }, [categoryGarments]);

  // Filter and sort items
  const displayedGarments = useMemo(() => {
    return categoryGarments
      .filter((g) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            g.title.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q) ||
            g.authorName.toLowerCase().includes(q) ||
            (g.municipality && g.municipality.toLowerCase().includes(q)) ||
            g.location.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (selectedType !== 'todos' && g.listingType.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }

        if (selectedDept !== 'todos') {
          const loc = (g.department || g.location || '').toLowerCase();
          if (!loc.includes(selectedDept.toLowerCase())) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'precio-bajo') {
          return (a.budget || 0) - (b.budget || 0);
        }
        if (sortBy === 'precio-alto') {
          return (b.budget || 0) - (a.budget || 0);
        }
        return 0;
      });
  }, [categoryGarments, searchQuery, selectedType, selectedDept, sortBy]);

  const localizedCategoryName = tCategory(categoryMeta.name);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-3 sm:py-5 animate-in fade-in catalog-container-fit">
      {/* Contenedor Superior (Fold Area) - Encuadre visual completo */}
      <div className="catalog-fold-container w-full mb-1">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#717973] dark:text-[#a7b8ae] mb-2">
          <button
            onClick={onBackToCatalogos}
            className="hover:text-[#012d1d] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>{t('category.back')}</span>
          </button>
          <span>/</span>
          <span className="text-[#012d1d] dark:text-[#b0f1cc] font-bold">{localizedCategoryName}</span>
        </div>

        {/* Category Hero Header - Compact & Framed */}
        <div className="bg-white dark:bg-[#0e241c] rounded-2xl p-3 sm:p-3.5 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-xs mb-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/40 dark:border-[#2b694d]/30 flex items-center justify-center shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-xl text-[#012d1d] dark:text-[#b0f1cc]">
                {categoryMeta.icon}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
                  {language === 'en' ? 'Exclusive Catalog' : 'Catálogo Exclusivo'}
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#b0f1cc]/50 dark:bg-[#112920] text-[#002113] dark:text-[#b0f1cc] text-[10px] font-bold">
                  {categoryGarments.length} {categoryGarments.length === 1 ? t('catalog.garment_count') : t('catalog.garments_count')}
                </span>
              </div>
              <h1 className="font-headline text-lg sm:text-xl md:text-2xl font-black text-[#012d1d] dark:text-white leading-tight animate-title-entry">
                {language === 'en' ? `${localizedCategoryName} Catalog` : `Catálogo de ${categoryMeta.name}`}
              </h1>
            </div>
          </div>

          {/* Fast Category Switcher Inside Header Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {EXPANDED_CATEGORIES.slice(0, 5).map((cat) => {
              const isActive = cat.name.toLowerCase() === categoryMeta.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-[#012d1d] text-[#b0f1cc] shadow-xs'
                      : 'bg-[#faf9f4] dark:bg-[#112920] text-[#012d1d] dark:text-[#a7b8ae] border border-[#c1c8c2]/60 dark:border-[#2b694d]/40 hover:bg-[#efeee9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                  <span>{tCategory(cat.name)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de herramientas: Buscador, filtros y botón [ Publicar prenda ] en una sola fila responsiva */}
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
        {/* Lado izquierdo: Buscador y Filtros */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
          <div className="relative w-full sm:w-56 shrink-0">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#717973] dark:text-[#a7b8ae] text-base">
              search
            </span>
            <input
              type="text"
              placeholder={language === 'en' ? `Search...` : `Buscar prenda...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/70 dark:border-[#2b694d]/40 rounded-xl text-xs sm:text-sm text-[#012d1d] dark:text-white placeholder-[#717973] dark:placeholder-[#7b9487] focus:outline-none focus:ring-1 focus:ring-[#012d1d]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/70 dark:border-[#2b694d]/40 rounded-xl text-[11px] font-semibold text-[#012d1d] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="todos">{t('category.all_modalities')}</option>
              <option value="Venta">{language === 'en' ? 'Sale' : 'Venta'}</option>
              <option value="Transformación">{language === 'en' ? 'Redesign' : 'Transformación'}</option>
              <option value="Intercambio">{language === 'en' ? 'Exchange' : 'Intercambio'}</option>
              <option value="Donación">{language === 'en' ? 'Donation' : 'Donación'}</option>
            </select>

            {availableDepartments.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/70 dark:border-[#2b694d]/40 rounded-xl text-[11px] font-semibold text-[#012d1d] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="todos">{t('category.all_departments')}</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/70 dark:border-[#2b694d]/40 rounded-xl text-[11px] font-semibold text-[#012d1d] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="recientes">{t('category.sort_recent')}</option>
              <option value="precio-bajo">{t('category.sort_low_price')}</option>
              <option value="precio-alto">{t('category.sort_high_price')}</option>
            </select>

            {(searchQuery || selectedType !== 'todos' || selectedDept !== 'todos') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('todos');
                  setSelectedDept('todos');
                }}
                className="text-[11px] text-[#2b694d] dark:text-[#b0f1cc] hover:underline font-bold px-1.5 py-1 cursor-pointer"
              >
                {t('category.clear_filters')}
              </button>
            )}
          </div>
        </div>

        {/* Lado derecho: Botón [ Publicar prenda ] y Costureros */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="btn-interactive bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base text-[#b0f1cc]">add_circle</span>
            <span>{language === 'en' ? `Post garment` : `Publicar prenda`}</span>
          </button>
          <button
            onClick={() => onNavigate('costureros')}
            className="btn-interactive bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] dark:hover:bg-[#16382c] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2] dark:border-[#2b694d]/40 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">person_search</span>
            <span>{language === 'en' ? 'Tailors' : 'Costureros'}</span>
          </button>
        </div>
      </div>
    </div>

      {/* Grid of Garments EXCLUSIVELY for this category */}
      {displayedGarments.length === 0 ? (
        <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-12 text-center border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 max-w-lg mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] border border-[#c1c8c2]/40 dark:border-[#2b694d]/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-[#717973] dark:text-[#a7b8ae]">
              {categoryMeta.icon}
            </span>
          </div>
          <h3 className="font-headline text-lg font-bold text-[#012d1d] dark:text-white">
            {t('category.empty_title')}
          </h3>
          <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
            {language === 'en'
              ? `Be the first to share or request an upcycling project for ${localizedCategoryName}.`
              : `Sé el primero en compartir o solicitar un suprareciclaje para ${categoryMeta.name}.`}
          </p>
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="btn-interactive px-6 py-2.5 bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('category.empty_btn')}
          </button>
        </div>
      ) : (
        <div
          className="scroll-reveal catalog-grid adaptive-catalog-grid garments-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {displayedGarments.map((garment) => (
            <div
              key={garment.id}
              onClick={() => onSelectGarment(garment)}
              className="card hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl overflow-hidden border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 hover:border-[#012d1d] transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between group"
              style={{
                maxWidth: '100%',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                boxSizing: 'border-box',
              }}
            >
              {/* Product Image & Badges */}
              <div
                className="relative aspect-4/3 card-media-fixed w-full bg-[#102b1e] overflow-hidden"
                style={{ aspectRatio: '4/3' }}
              >
                <img
                  src={
                    garment.imageUrl ||
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={garment.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to avoid broken image display
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#012d1d]/85 backdrop-blur-xs text-[#b0f1cc] text-[10px] font-bold">
                    {garment.listingType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#071510]/90 backdrop-blur-xs text-[#012d1d] dark:text-[#b0f1cc] text-[10px] font-bold">
                    {garment.condition}
                  </span>
                </div>
                {garment.budget ? (
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-[#071510]/95 backdrop-blur-sm text-[#012d1d] dark:text-[#b0f1cc] text-xs font-extrabold shadow-sm">
                    ${garment.budget.toLocaleString('es-CO')} COP
                  </div>
                ) : null}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#717973] dark:text-[#a7b8ae]">
                    <span className="font-semibold">{language === 'en' ? 'Size:' : 'Talla:'} {garment.size || (language === 'en' ? 'One size' : 'Única')}</span>
                    <span className="flex items-center gap-1 font-medium text-[#2b694d] dark:text-[#b0f1cc]">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      <span>{garment.municipality || garment.department || garment.location.split(',')[0]}</span>
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-base text-[#012d1d] dark:text-white group-hover:text-[#2b694d] dark:group-hover:text-[#b0f1cc] transition-colors line-clamp-1 text-hover-lift">
                    {garment.title}
                  </h3>

                  {/* Arreglo / Modificación requerida o realizada */}
                  {garment.modifications && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#b0f1cc]/30 dark:bg-[#112920] text-[#002113] dark:text-[#b0f1cc] text-[11px] font-bold border border-[#2b694d]/20 w-full">
                      <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc] shrink-0">tune</span>
                      <span className="line-clamp-1">{garment.modifications}</span>
                    </div>
                  )}

                  {/* Descripción corta */}
                  <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed line-clamp-2">
                    {garment.description}
                  </p>
                </div>

                {/* Footer with author & Contact / Chat button */}
                <div className="pt-3 border-t border-[#efeee9] dark:border-[#173328] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          garment.authorAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                        }
                        alt={garment.authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-[#414844] dark:text-[#a7b8ae] font-medium truncate max-w-[120px]">
                        {garment.authorName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGarment(garment);
                      }}
                      className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{language === 'en' ? 'Details' : 'Detalles'}</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>

                  {/* Botón [ Contactar / Chatear ] */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onContactGarment) {
                        onContactGarment(garment);
                      } else {
                        onSelectGarment(garment);
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] dark:bg-[#b0f1cc] dark:hover:bg-[#8ee7b4] text-white dark:text-[#002113] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer group/btn"
                  >
                    <span className="material-symbols-outlined text-sm text-[#b0f1cc] dark:text-[#002113] group-hover/btn:scale-110 transition-transform">
                      chat
                    </span>
                    <span>{language === 'en' ? 'Contact / Chat' : 'Contactar / Chatear'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
