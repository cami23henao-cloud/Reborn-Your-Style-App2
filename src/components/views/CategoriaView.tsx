import React, { useState, useMemo } from 'react';
import { AppView, GarmentProject } from '../../types';
import { EXPANDED_CATEGORIES, GarmentCategoryItem } from '../../data/categoriesData';

interface CategoriaViewProps {
  categoryName: string;
  garments: GarmentProject[];
  onBackToCatalogos: () => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectGarment: (garment: GarmentProject) => void;
  onNavigate: (view: AppView) => void;
}

export const CategoriaView: React.FC<CategoriaViewProps> = ({
  categoryName,
  garments,
  onBackToCatalogos,
  onSelectCategory,
  onSelectGarment,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedDept, setSelectedDept] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'recientes' | 'precio-bajo' | 'precio-alto'>('recientes');

  // Find metadata for current category
  const categoryMeta: GarmentCategoryItem = useMemo(() => {
    const found = EXPANDED_CATEGORIES.find(
      c => c.name.toLowerCase() === categoryName.toLowerCase() ||
           c.id.toLowerCase() === categoryName.toLowerCase()
    );
    if (found) return found;

    // Fallback if not exact match
    return {
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      icon: 'category',
      description: `Catálogo exclusivo de prendas y proyectos de ${categoryName}.`,
      popularUpcyclingIdeas: ['Transformación Textil', 'Arreglo a Medida']
    };
  }, [categoryName]);

  // Filter garments to ONLY this category
  const categoryGarments = useMemo(() => {
    return garments.filter(g => {
      const catLower = categoryMeta.name.toLowerCase();
      const gCat = g.category.toLowerCase();

      if (categoryMeta.id === 'calzones' || catLower.includes('calzon')) {
        return gCat.includes('calzon') || gCat.includes('ropa interior') || gCat.includes('íntima');
      }
      if (categoryMeta.id === 'ropa' || catLower === 'ropa') {
        return gCat.includes('ropa') || gCat.includes('chaqueta') || gCat.includes('suéter') || gCat.includes('conjunto');
      }
      if (categoryMeta.id === 'camisas-blusas' || catLower.includes('camisa') || catLower.includes('blusa')) {
        return gCat.includes('camisa') || gCat.includes('blusa');
      }
      if (categoryMeta.id === 'bolsos' || catLower.includes('bolso')) {
        return gCat.includes('bolso');
      }
      if (categoryMeta.id === 'pantalones' || catLower.includes('pantalon')) {
        return gCat.includes('pantalon');
      }
      if (categoryMeta.id === 'vestidos' || catLower.includes('vestido')) {
        return gCat.includes('vestido');
      }
      if (categoryMeta.id === 'chaquetas' || catLower.includes('chaqueta')) {
        return gCat.includes('chaqueta');
      }
      if (categoryMeta.id === 'shorts' || catLower.includes('short')) {
        return gCat.includes('short');
      }
      if (categoryMeta.id === 'sueteres' || catLower.includes('suéter')) {
        return gCat.includes('suéter') || gCat.includes('sueter');
      }
      if (categoryMeta.id === 'gorras' || catLower.includes('gorra')) {
        return gCat.includes('gorra');
      }
      if (categoryMeta.id === 'mochilas' || catLower.includes('mochila')) {
        return gCat.includes('mochila');
      }
      if (categoryMeta.id === 'accesorios' || catLower.includes('accesorio')) {
        return gCat.includes('accesorio');
      }
      if (categoryMeta.id === 'trajes-de-bano' || catLower.includes('traje')) {
        return gCat.includes('traje') || gCat.includes('baño') || gCat.includes('playa');
      }
      if (categoryMeta.id === 'medias' || catLower.includes('media')) {
        return gCat.includes('media') || gCat.includes('calentador');
      }

      return gCat.includes(catLower) || catLower.includes(gCat);
    });
  }, [garments, categoryMeta]);

  // Available departments in this category
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    categoryGarments.forEach(g => {
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
    return categoryGarments.filter(g => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = (
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.authorName.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }

      // Listing Type
      if (selectedType !== 'todos' && g.listingType.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Department
      if (selectedDept !== 'todos') {
        const loc = (g.department || g.location || '').toLowerCase();
        if (!loc.includes(selectedDept.toLowerCase())) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'precio-bajo') {
        return (a.budget || 0) - (b.budget || 0);
      }
      if (sortBy === 'precio-alto') {
        return (b.budget || 0) - (a.budget || 0);
      }
      return 0; // Default recent
    });
  }, [categoryGarments, searchQuery, selectedType, selectedDept, sortBy]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12 animate-in fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#717973] mb-6">
        <button
          onClick={onBackToCatalogos}
          className="hover:text-[#012d1d] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Catálogos</span>
        </button>
        <span>/</span>
        <span className="text-[#012d1d] font-bold">{categoryMeta.name}</span>
      </div>

      {/* Category Hero Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#c1c8c2]/50 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#faf9f4] border border-[#c1c8c2]/40 flex items-center justify-center shadow-2xs shrink-0">
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#012d1d]">{categoryMeta.icon}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d]">
                Catálogo Exclusivo
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#b0f1cc]/50 text-[#002113] text-[11px] font-bold">
                {categoryGarments.length} {categoryGarments.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black text-[#012d1d]">
              Catálogo de {categoryMeta.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#414844] max-w-2xl leading-relaxed">
              {categoryMeta.description}
            </p>
          </div>
        </div>

        {/* Action CTAs in Header */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Publicar {categoryMeta.name.toLowerCase()}</span>
          </button>
          <button
            onClick={() => onNavigate('costureros')}
            className="bg-[#faf9f4] hover:bg-[#efeee9] text-[#012d1d] border border-[#c1c8c2] text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">person_search</span>
            <span>Costureros recomendados</span>
          </button>
        </div>
      </div>

      {/* Fast Category Switcher Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-[#717973] whitespace-nowrap">Cambiar a otra categoría:</span>
        {EXPANDED_CATEGORIES.map((cat) => {
          const isActive = cat.name.toLowerCase() === categoryMeta.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#012d1d] text-[#b0f1cc] shadow-xs'
                  : 'bg-white text-[#012d1d] border border-[#c1c8c2]/60 hover:bg-[#efeee9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#faf9f4] p-4 rounded-2xl border border-[#c1c8c2]/40 mb-8 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717973] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder={`Buscar en ${categoryMeta.name.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c1c8c2] rounded-xl text-xs sm:text-sm text-[#012d1d] placeholder-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d]/30"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Listing type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-semibold text-[#012d1d] focus:outline-none"
          >
            <option value="todos">Todos los tipos</option>
            <option value="Venta">En Venta</option>
            <option value="Transformación">Para Transformar</option>
            <option value="Intercambio">Intercambio</option>
          </select>

          {/* Department */}
          {availableDepartments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-semibold text-[#012d1d] focus:outline-none"
            >
              <option value="todos">Todas las ciudades</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-semibold text-[#012d1d] focus:outline-none"
          >
            <option value="recientes">Más recientes</option>
            <option value="precio-bajo">Menor presupuesto</option>
            <option value="precio-alto">Mayor presupuesto</option>
          </select>

          {(searchQuery || selectedType !== 'todos' || selectedDept !== 'todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('todos');
                setSelectedDept('todos');
              }}
              className="text-xs text-[#2b694d] hover:underline font-bold px-2 py-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid of Garments EXCLUSIVELY for this category */}
      {displayedGarments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 max-w-lg mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#faf9f4] border border-[#c1c8c2]/40 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-[#717973]">{categoryMeta.icon}</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-[#012d1d]">
            No se encontraron prendas con estos filtros
          </h3>
          <p className="text-xs text-[#414844] leading-relaxed">
            Prueba cambiando los términos de búsqueda o publica la primera prenda en la categoría <strong>{categoryMeta.name}</strong>.
          </p>
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="px-6 py-2.5 bg-[#012d1d] text-white text-xs font-bold rounded-xl hover:bg-[#2b694d] transition-colors"
          >
            Publicar prenda ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedGarments.map((garment) => (
            <div
              key={garment.id}
              onClick={() => onSelectGarment(garment)}
              className="bg-white rounded-3xl overflow-hidden border border-[#c1c8c2]/40 hover:shadow-xl hover:border-[#012d1d] transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-4/3 w-full bg-[#102b1e] overflow-hidden">
                <img
                  src={garment.imageUrl}
                  alt={garment.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#012d1d]/85 backdrop-blur-xs text-[#b0f1cc] text-[10px] font-bold">
                    {garment.listingType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#012d1d] text-[10px] font-bold">
                    {garment.condition}
                  </span>
                </div>
                {garment.budget && (
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-sm text-[#012d1d] text-xs font-extrabold shadow-sm">
                    ${garment.budget.toLocaleString()} COP
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#717973]">
                    <span>Talla {garment.size || 'Única'}</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-[#2b694d]">location_on</span>
                      <span>{garment.municipality || garment.location.split(',')[0]}</span>
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-base text-[#012d1d] group-hover:text-[#2b694d] transition-colors line-clamp-1">
                    {garment.title}
                  </h3>

                  <p className="text-xs text-[#414844] leading-relaxed line-clamp-2">
                    {garment.description}
                  </p>
                </div>

                {/* Author footer */}
                <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={garment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                      alt={garment.authorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-[#414844] font-medium truncate max-w-[120px]">
                      {garment.authorName}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#2b694d] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    <span>Ver detalle</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
