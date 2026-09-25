import React, { useState, useMemo, useEffect } from 'react';
import { Professional, AppView, GarmentProject, UserProfile } from '../../types';
import { EXPANDED_CATEGORIES } from '../../data/categoriesData';
import { COLOMBIA_DEPARTMENTS } from '../../data/colombiaData';
import { BrandLogo } from '../BrandLogo';

interface ExploraViewProps {
  professionals: Professional[];
  garments: GarmentProject[];
  onSelectProfessional: (pro: Professional) => void;
  onNavigate: (view: AppView) => void;
  user: UserProfile;
  onRequestGarment?: (garment: GarmentProject) => void;
  initialTab?: 'profesionales' | 'prendas';
  initialCategory?: string;
  onSelectCategory?: (categoryName: string) => void;
}

export const ExploraView: React.FC<ExploraViewProps> = ({
  professionals,
  garments,
  onSelectProfessional,
  onNavigate,
  user,
  initialTab = 'prendas',
  initialCategory = 'Todas',
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'profesionales' | 'prendas'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      if (initialCategory !== 'Todas') {
        setActiveTab('prendas');
      }
    }
  }, [initialCategory]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setActiveTab('prendas');
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
  };

  const currentCategoryInfo = useMemo(() => {
    if (selectedCategory === 'Todas') return null;
    return EXPANDED_CATEGORIES.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory]);
  const [selectedDepartment, setSelectedDepartment] = useState('Todos los departamentos');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'recent'>('recent');

  const filteredGarments = useMemo(() => {
    return garments
      .filter((item) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q);

        const matchesCat =
          selectedCategory === 'Todas' ||
          item.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesDept =
          selectedDepartment === 'Todos los departamentos' ||
          item.location.toLowerCase().includes(selectedDepartment.toLowerCase());

        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        const matchesPrice = (item.budget || 0) >= min && (item.budget || 0) <= max;

        return matchesSearch && matchesCat && matchesDept && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.budget || 0) - (b.budget || 0);
        return 0;
      });
  }, [garments, searchTerm, selectedCategory, selectedDepartment, minPrice, maxPrice, sortBy]);

  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter((pro) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          pro.name.toLowerCase().includes(q) ||
          pro.specialty.toLowerCase().includes(q) ||
          pro.tags.some((t) => t.toLowerCase().includes(q)) ||
          pro.bio.toLowerCase().includes(q);

        const matchesDept =
          selectedDepartment === 'Todos los departamentos' ||
          pro.location.toLowerCase().includes(selectedDepartment.toLowerCase());

        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        const matchesPrice = pro.startingPrice >= min && pro.startingPrice <= max;

        return matchesSearch && matchesDept && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
        return 0;
      });
  }, [professionals, searchTerm, selectedDepartment, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setSelectedDepartment('Todos los departamentos');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-12 flex flex-col gap-8 animate-in fade-in">
      {/* Header Tabs (Prendas vs Diseñadores) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#efeee9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrandLogo size="xs" variant="emblem" />
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#012d1d]">
              Explorar Catálogo y Diseñadores
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#414844]">
            Prendas para suprareciclaje, venta, intercambio y directorio de diseñadores en Colombia.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#f5f4ef] p-1.5 rounded-2xl border border-[#c1c8c2]/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('prendas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'prendas'
                ? 'bg-white text-[#012d1d] shadow-sm'
                : 'text-[#717973] hover:text-[#012d1d]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">checkroom</span>
            <span>Prendas en Circulación ({garments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profesionales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profesionales'
                ? 'bg-white text-[#012d1d] shadow-sm'
                : 'text-[#717973] hover:text-[#012d1d]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">design_services</span>
            <span>Diseñadores y Modistas ({professionals.length})</span>
          </button>
        </div>
      </div>

      {/* 16 Category Quick Pills (When in Prendas Tab) */}
      {activeTab === 'prendas' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#012d1d] uppercase tracking-wider">
              Categorías ({EXPANDED_CATEGORIES.length})
            </span>
            {selectedCategory !== 'Todas' && (
              <button
                onClick={() => handleCategorySelect('Todas')}
                className="text-xs text-[#2b694d] hover:underline font-bold"
              >
                Ver todas las prendas
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('Todas')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCategory === 'Todas'
                  ? 'bg-[#012d1d] text-white border-[#012d1d]'
                  : 'bg-white text-[#414844] border-[#c1c8c2]/50 hover:bg-[#efeee9]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              <span>Todas ({garments.length})</span>
            </button>
            {EXPANDED_CATEGORIES.map((cat) => {
              const count = garments.filter(g => g.category.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#012d1d] text-white border-[#012d1d]'
                      : 'bg-white text-[#414844] border-[#c1c8c2]/50 hover:bg-[#efeee9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                  {count > 0 && <span className="opacity-75 text-[10px]">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Active Category Information Banner */}
          {currentCategoryInfo && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#f5f4ef] border border-[#2b694d]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 animate-in fade-in">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-[#2b694d]">{currentCategoryInfo.icon}</span>
                  <h2 className="font-headline text-base sm:text-lg font-bold text-[#012d1d]">
                    Categoría: {currentCategoryInfo.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#b0f1cc] text-[#002113] text-[11px] font-bold">
                    {filteredGarments.length} {filteredGarments.length === 1 ? 'prenda' : 'prendas'}
                  </span>
                </div>
                <p className="text-xs text-[#414844]">
                  {currentCategoryInfo.description}
                </p>
                {currentCategoryInfo.popularIdeas && currentCategoryInfo.popularIdeas.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-[#717973]">Ideas sugeridas:</span>
                    {currentCategoryInfo.popularIdeas.map((idea, idx) => (
                      <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#c1c8c2]/50 text-[#012d1d]">
                        {idea}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCategorySelect('Todas')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#c1c8c2] text-xs font-bold text-[#717973] hover:text-[#012d1d] transition-colors"
                >
                  Ver todas
                </button>
                <button
                  onClick={() => onNavigate('publicar-prenda')}
                  className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d] shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Publicar en {currentCategoryInfo.name}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Layout: Sidebar & Content Grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#c1c8c2]/50 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-base text-[#012d1d] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#2b694d]">tune</span>
                <span>Filtros</span>
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#717973] hover:text-[#012d1d] underline"
              >
                Limpiar
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#012d1d] block">Búsqueda</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#717973]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] outline-none focus:border-[#012d1d]"
                />
              </div>
            </div>

            {/* Colombia Department Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#012d1d] block">
                Ubicación en Colombia
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] bg-white text-xs text-[#1b1c19] outline-none focus:border-[#012d1d] cursor-pointer"
              >
                <option value="Todos los departamentos">Todos los departamentos</option>
                {COLOMBIA_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#012d1d] block">
                Presupuesto ($ COP)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#c1c8c2] text-xs text-[#1b1c19] outline-none"
                />
                <span className="text-[#717973] text-xs">-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#c1c8c2] text-xs text-[#1b1c19] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Action in Sidebar */}
          <div className="p-5 rounded-3xl bg-[#faf9f4] border border-[#c1c8c2]/50 text-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-[#2b694d]">add_circle</span>
            <h4 className="font-headline font-bold text-xs text-[#012d1d]">
              ¿Tienes una prenda para transformar?
            </h4>
            <p className="text-[11px] text-[#717973] leading-relaxed">
              Publica con fotos y conecta con artesanos locales para cotizar tu rediseño.
            </p>
            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="w-full py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d] transition-colors shadow-sm"
            >
              Publicar Prenda
            </button>
          </div>
        </aside>

        {/* Content Results */}
        <div className="flex-1 space-y-6">
          {/* Sorter */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#717973] font-medium">
              {activeTab === 'prendas'
                ? `Mostrando ${filteredGarments.length} prendas`
                : `Mostrando ${filteredProfessionals.length} modistas y talleres`}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#414844] font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#c1c8c2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#012d1d] outline-none"
              >
                {activeTab === 'prendas' ? (
                  <>
                    <option value="recent">Más recientes</option>
                    <option value="price-asc">Menor precio</option>
                  </>
                ) : (
                  <>
                    <option value="rating">Mejor calificación</option>
                    <option value="price-asc">Precio más bajo</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Tab 1: Prendas Grid */}
          {activeTab === 'prendas' && (
            <div>
              {filteredGarments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGarments.map((garment) => (
                    <div
                      key={garment.id}
                      className="bg-white rounded-3xl p-4 border border-[#c1c8c2]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3 group"
                    >
                      {/* Image & Badges */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f4ef]">
                        <img
                          src={garment.imageUrl}
                          alt={garment.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs">apparel</span>
                          <span>{garment.category}</span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm text-[#012d1d] text-[10px] font-bold shadow-xs">
                          {garment.listingType || 'Transformación'}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5 flex-1">
                        <h3 className="font-headline font-bold text-sm text-[#012d1d] group-hover:text-[#2b694d] transition-colors leading-snug line-clamp-1">
                          {garment.title}
                        </h3>
                        <p className="text-xs text-[#414844] line-clamp-2 leading-relaxed">
                          {garment.description}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-[#717973] pt-1">
                          <span className="material-symbols-outlined text-xs text-[#2b694d]">location_on</span>
                          <span className="truncate">{garment.location.split(',')[0]}</span>
                        </div>
                      </div>

                      {/* Author Profile Footer */}
                      <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={garment.authorAvatar || user.avatarUrl}
                            alt={garment.authorName}
                            className="w-7 h-7 rounded-full object-cover border border-[#b0f1cc]"
                          />
                          <div className="text-left">
                            <span className="text-[11px] font-bold text-[#012d1d] block leading-tight truncate max-w-[90px]">
                              {garment.authorName}
                            </span>
                            <span className="text-[9px] text-[#717973] block">{garment.condition}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#012d1d] block">
                            {garment.listingType === 'Donación'
                              ? 'Gratis'
                              : garment.listingType === 'Intercambio'
                              ? 'Intercambio'
                              : garment.budget && garment.budget > 0
                              ? `$${garment.budget.toLocaleString()} COP`
                              : 'Por acordar'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 shadow-xs space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#717973]">search_off</span>
                  <h3 className="font-headline font-bold text-base text-[#012d1d]">
                    No se encontraron prendas con estos filtros
                  </h3>
                  <p className="text-xs text-[#717973] max-w-sm mx-auto">
                    Prueba seleccionando otra categoría o limpiando la búsqueda.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d]"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Modistas Grid */}
          {activeTab === 'profesionales' && (
            <div>
              {filteredProfessionals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfessionals.map((pro) => (
                    <div
                      key={pro.id}
                      onClick={() => onSelectProfessional(pro)}
                      className="bg-white rounded-3xl p-5 border border-[#c1c8c2]/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#e3e3de]">
                          <img
                            src={pro.imageUrl}
                            alt={pro.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#012d1d] text-xs font-bold flex items-center gap-1 shadow-xs">
                            <span className="material-symbols-outlined text-xs text-amber-500 fill-amber-500">star</span>
                            <span>{pro.rating}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-headline font-bold text-base text-[#012d1d] group-hover:text-[#2b694d] transition-colors">
                            {pro.name}
                          </h3>
                          <p className="text-xs text-[#717973] font-medium">{pro.specialty}</p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#414844]">
                          <span className="material-symbols-outlined text-xs text-[#2b694d]">location_on</span>
                          <span className="truncate">{pro.location}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#717973] block">Desde</span>
                          <span className="text-xs font-black text-[#012d1d]">${pro.startingPrice.toLocaleString()} COP</span>
                        </div>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-[#faf9f4] text-[#012d1d] text-xs font-bold border border-[#c1c8c2]/50 group-hover:bg-[#b0f1cc] transition-colors"
                        >
                          Ver perfil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 shadow-xs space-y-3">
                  <span className="material-symbols-outlined text-4xl text-[#717973]">search_off</span>
                  <h3 className="font-headline font-bold text-base text-[#012d1d]">
                    No se encontraron modistas con estos filtros
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#2b694d]"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
