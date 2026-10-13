import React, { useState, useMemo } from 'react';
import { Professional, AppView } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface CosturerosViewProps {
  professionals: Professional[];
  onSelectProfessional: (pro: Professional) => void;
  onSendMessage: (pro: Professional) => void;
  onRequestService: (pro: Professional) => void;
  onNavigate: (view: AppView) => void;
}

export const CosturerosView: React.FC<CosturerosViewProps> = ({
  professionals,
  onSelectProfessional,
  onSendMessage,
  onRequestService,
  onNavigate,
}) => {
  const { t, language } = useThemeLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('todos');
  const [selectedTag, setSelectedTag] = useState<string>('todos');

  // Extract cities and departments from location
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    // Common Colombian cities
    ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Bucaramanga', 'Envigado', 'Cartagena'].forEach((c) => set.add(c));
    professionals.forEach((p) => {
      const parts = p.location.split(',');
      if (parts.length > 1) {
        const city = parts[parts.length - 3]?.trim() || parts[0]?.trim();
        if (city) set.add(city);
      } else if (p.location) {
        set.add(p.location.trim());
      }
    });
    return Array.from(set).filter(Boolean);
  }, [professionals]);

  // Extract common specialty and garment tags
  const popularTags = language === 'en' ? [
    'All',
    'Denim / Jeans',
    'Jackets & Coats',
    'Dresses & Skirts',
    'Classic Tailoring',
    'Creative Embroidery',
    'Upcycling',
    'Visible Mending',
    'Natural Dyeing',
  ] : [
    'Todos',
    'Jeans y Denim',
    'Chaquetas y Abrigos',
    'Vestidos y Faldas',
    'Sastrería Clásica',
    'Bordado Creativo',
    'Upcycling',
    'Reparación visible',
    'Teñido Natural',
  ];

  // Filter professionals
  const filteredProfessionals = useMemo(() => {
    return professionals.filter((pro) => {
      // Search text (checks name, specialty, bio, location, address, and tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          pro.name.toLowerCase().includes(q) ||
          pro.specialty.toLowerCase().includes(q) ||
          pro.bio.toLowerCase().includes(q) ||
          pro.location.toLowerCase().includes(q) ||
          (pro.address && pro.address.toLowerCase().includes(q)) ||
          pro.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // City / Location filter
      if (selectedCity !== 'todos') {
        const cLower = selectedCity.toLowerCase();
        const inLoc = pro.location.toLowerCase().includes(cLower);
        const inAddr = pro.address ? pro.address.toLowerCase().includes(cLower) : false;
        if (!inLoc && !inAddr) return false;
      }

      // Tag & Garment Type filter
      if (selectedTag !== 'todos' && selectedTag !== 'Todos' && selectedTag !== 'All') {
        const tagLower = selectedTag.toLowerCase();
        const isDenim = tagLower.includes('denim') || tagLower.includes('jeans');
        const isJacket = tagLower.includes('chaqueta') || tagLower.includes('jacket');
        const isDress = tagLower.includes('vestido') || tagLower.includes('dress') || tagLower.includes('falda');
        const isTailoring = tagLower.includes('sastrería') || tagLower.includes('tailoring') || tagLower.includes('traje');
        const isEmbroidery = tagLower.includes('bordado') || tagLower.includes('embroidery');

        const hasTag =
          pro.tags.some((t) => {
            const tl = t.toLowerCase();
            if (tl.includes(tagLower)) return true;
            if (isDenim && (tl.includes('denim') || tl.includes('jean') || tl.includes('mezclilla'))) return true;
            if (isJacket && (tl.includes('chaqueta') || tl.includes('abrigo') || tl.includes('blazer'))) return true;
            if (isDress && (tl.includes('vestido') || tl.includes('falda') || tl.includes('novia'))) return true;
            if (isTailoring && (tl.includes('sastre') || tl.includes('traje') || tl.includes('alta costura'))) return true;
            if (isEmbroidery && (tl.includes('bordad') || tl.includes('sashiko'))) return true;
            return false;
          }) ||
          pro.specialty.toLowerCase().includes(tagLower) ||
          pro.bio.toLowerCase().includes(tagLower) ||
          pro.category?.toLowerCase().includes(tagLower);

        if (!hasTag) return false;
      }

      return true;
    });
  }, [professionals, searchQuery, selectedCity, selectedTag]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-14 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-6 md:p-10 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b0f1cc]/50 dark:bg-[#112920] text-[#002113] dark:text-[#b0f1cc] text-xs font-bold border border-[#2b694d]/20">
            <span className="material-symbols-outlined text-sm">handyman</span>
            <span>{t('tailors.badge')}</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#012d1d] dark:text-white tracking-tight animate-title-entry text-hover-lift">
            {t('tailors.title')}
          </h1>

          <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
            {t('tailors.desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => onNavigate('catalogos')}
            className="btn-interactive bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] dark:hover:bg-[#16382c] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2] dark:border-[#2b694d]/40 text-xs sm:text-sm font-bold px-5 py-3 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">category</span>
            <span>{t('home.categories_all')}</span>
          </button>
          <button
            onClick={() => onNavigate('servicios')}
            className="btn-interactive bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">design_services</span>
            <span>{language === 'en' ? 'Tailoring services' : 'Servicios de confección'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#faf9f4] dark:bg-[#112920] p-4 sm:p-5 rounded-2xl border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973] dark:text-[#a7b8ae] text-xl">
            search
          </span>
          <input
            type="text"
            placeholder={t('tailors.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#0e241c] border border-[#c1c8c2] dark:border-[#2b694d]/40 rounded-xl text-xs sm:text-sm text-[#012d1d] dark:text-white placeholder-[#717973] dark:placeholder-[#7b9487] focus:outline-none focus:ring-2 focus:ring-[#012d1d]/30"
          />
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* City selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3.5 py-2.5 bg-white dark:bg-[#0e241c] border border-[#c1c8c2] dark:border-[#2b694d]/40 rounded-xl text-xs font-semibold text-[#012d1d] dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="todos">{t('tailors.all_departments')}</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCity !== 'todos' || (selectedTag !== 'todos' && selectedTag !== 'Todos' && selectedTag !== 'All')) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('todos');
                setSelectedTag('todos');
              }}
              className="text-xs text-[#2b694d] dark:text-[#b0f1cc] hover:underline font-bold px-2 py-1 cursor-pointer"
            >
              {t('category.clear_filters')}
            </button>
          )}
        </div>
      </div>

      {/* Specialty Quick Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none text-xs">
        <span className="text-[#717973] dark:text-[#a7b8ae] font-bold whitespace-nowrap">
          {language === 'en' ? 'Specialty:' : 'Especialidad:'}
        </span>
        {popularTags.map((tag) => {
          const isAll = tag === 'Todos' || tag === 'All';
          const isActive = (isAll && selectedTag === 'todos') || selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(isAll ? 'todos' : tag)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#012d1d] text-[#b0f1cc] shadow-2xs'
                  : 'bg-white dark:bg-[#0e241c] text-[#414844] dark:text-[#a7b8ae] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 hover:border-[#012d1d]'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Grid of Costureros */}
      {filteredProfessionals.length === 0 ? (
        <div className="bg-white dark:bg-[#0e241c] rounded-3xl p-12 text-center border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 max-w-lg mx-auto space-y-4 my-8">
          <span className="material-symbols-outlined text-5xl text-[#717973] dark:text-[#a7b8ae]">
            person_search
          </span>
          <h3 className="font-headline text-lg font-bold text-[#012d1d] dark:text-white">
            {language === 'en' ? 'No tailors match these criteria' : 'No encontramos costureros con estos criterios'}
          </h3>
          <p className="text-xs text-[#414844] dark:text-[#a7b8ae]">
            {language === 'en'
              ? 'Try clearing the search filters or choosing another location.'
              : 'Intenta borrar los filtros de búsqueda o seleccionar otra ubicación.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('todos');
              setSelectedTag('todos');
            }}
            className="btn-interactive px-5 py-2.5 bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {language === 'en' ? 'View all tailors' : 'Ver todos los costureros'}
          </button>
        </div>
      ) : (
        <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((pro) => (
            <div
              key={pro.id}
              className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-6 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 hover:border-[#012d1d] hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Specialty, Rating */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <UserAvatar
                      src={pro.imageUrl}
                      name={pro.name}
                      size="lg"
                      borderClassName="border-2 border-white shadow-md"
                    />
                    {pro.isTopSeller && (
                      <span className="absolute -bottom-2 -right-1 bg-[#b0f1cc] text-[#002113] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        Top
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                      <span className="material-symbols-outlined text-sm fill-amber-500">star</span>
                      <span>{pro.rating}</span>
                      <span className="text-[#717973] dark:text-[#a7b8ae] font-normal">
                        ({pro.reviewsCount} {language === 'en' ? 'reviews' : 'reseñas'})
                      </span>
                    </div>

                    <h3 className="font-headline text-lg font-bold text-[#012d1d] dark:text-white truncate text-hover-lift">
                      {pro.name}
                    </h3>

                    <p className="text-xs font-semibold text-[#2b694d] dark:text-[#b0f1cc] truncate">
                      {pro.specialty}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-[#717973] dark:text-[#a7b8ae] mt-1 truncate">
                      <span className="material-symbols-outlined text-xs text-[#2b694d] dark:text-[#b0f1cc]">location_on</span>
                      <span className="truncate">{pro.location.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Brief Bio */}
                <p className="text-xs text-[#414844] dark:text-[#a7b8ae] leading-relaxed line-clamp-3">
                  {pro.bio}
                </p>

                {/* Specialty Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {pro.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-[#faf9f4] dark:bg-[#112920] text-[#012d1d] dark:text-[#b0f1cc] px-2.5 py-1 rounded-lg border border-[#c1c8c2]/40 dark:border-[#2b694d]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Pricing info */}
                <div className="pt-3 border-t border-[#efeee9] dark:border-[#173328] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#717973] dark:text-[#a7b8ae] block">
                      {language === 'en' ? 'Starting from' : 'Tarifa base desde'}
                    </span>
                    <span className="font-black text-sm text-[#012d1d] dark:text-white">
                      ${pro.startingPrice.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <button
                    onClick={() => onRequestService(pro)}
                    className="text-[11px] font-bold text-[#e37b5e] hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Request quote' : 'Solicitar cotización'}
                  </button>
                </div>
              </div>

              {/* Action Buttons: "Ver perfil" and [ 💬 Chatear en vivo ] */}
              <div className="pt-3 border-t border-[#efeee9] dark:border-[#173328] grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectProfessional(pro)}
                  className="btn-interactive w-full py-2.5 px-3 rounded-xl bg-[#faf9f4] dark:bg-[#112920] hover:bg-[#efeee9] dark:hover:bg-[#16382c] text-[#012d1d] dark:text-[#b0f1cc] border border-[#c1c8c2] dark:border-[#2b694d]/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  <span>{t('detail.ver_perfil')}</span>
                </button>

                <button
                  onClick={() => onSendMessage(pro)}
                  className="btn-interactive w-full py-2.5 px-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  title={language === 'en' ? 'Enter workshop and chat in real-time' : 'Entrar al taller y chatear en tiempo real'}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                  </span>
                  <span>{language === 'en' ? '💬 Enter workshop & chat' : '💬 Entrar al taller y chatear'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
