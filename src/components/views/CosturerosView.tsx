import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Professional, AppView } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

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
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('todos');
  const [selectedTag, setSelectedTag] = useState<string>('todos');

  // Extract cities from location
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach(p => {
      const parts = p.location.split(',');
      if (parts.length > 1) {
        set.add(parts[parts.length - 3]?.trim() || parts[0]?.trim());
      } else {
        set.add(p.location);
      }
    });
    return Array.from(set).filter(Boolean);
  }, [professionals]);

  // Extract common specialty tags
  const popularTags = [
    'Todos',
    'Bordado Creativo',
    'Sastrería Clásica',
    'Upcycling',
    'Denim',
    'Reparación visible',
    'Teñido Natural'
  ];

  // Filter professionals
  const filteredProfessionals = useMemo(() => {
    return professionals.filter(pro => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = (
          pro.name.toLowerCase().includes(q) ||
          pro.specialty.toLowerCase().includes(q) ||
          pro.bio.toLowerCase().includes(q) ||
          pro.location.toLowerCase().includes(q) ||
          pro.tags.some(t => t.toLowerCase().includes(q))
        );
        if (!matches) return false;
      }

      // City filter
      if (selectedCity !== 'todos') {
        if (!pro.location.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag !== 'todos' && selectedTag !== 'Todos') {
        const hasTag = pro.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())) ||
                       pro.specialty.toLowerCase().includes(selectedTag.toLowerCase()) ||
                       pro.category?.toLowerCase().includes(selectedTag.toLowerCase());
        if (!hasTag) return false;
      }

      return true;
    });
  }, [professionals, searchQuery, selectedCity, selectedTag]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-14 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#c1c8c2]/50 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b0f1cc]/50 text-[#002113] text-xs font-bold border border-[#2b694d]/20">
            <span className="material-symbols-outlined text-sm">handyman</span>
            <span>Directorio Oficial de Modistas y Confeccionistas</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#012d1d] tracking-tight">
            Encuentra tu costurero
          </h1>

          <p className="text-sm sm:text-base text-[#414844] leading-relaxed">
            Conecta con modistas, sastres y talleres artesanales certificados en toda Colombia. Puedes ver su perfil detallado, solicitar un presupuesto o <strong>iniciar una conversación directa por chat</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => onNavigate('catalogos')}
            className="bg-[#faf9f4] hover:bg-[#efeee9] text-[#012d1d] border border-[#c1c8c2] text-xs sm:text-sm font-bold px-5 py-3 rounded-full transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">category</span>
            <span>Ver Catálogos de Ropa</span>
          </button>
          <button
            onClick={() => onNavigate('servicios')}
            className="bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">design_services</span>
            <span>Servicios de confección</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#faf9f4] p-4 sm:p-5 rounded-2xl border border-[#c1c8c2]/40 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973] text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, técnica (ej. bordado, denim)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs sm:text-sm text-[#012d1d] placeholder-[#717973] focus:outline-none focus:ring-2 focus:ring-[#012d1d]/30"
          />
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* City selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-semibold text-[#012d1d] focus:outline-none"
          >
            <option value="todos">Todas las ubicaciones</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {(searchQuery || selectedCity !== 'todos' || selectedTag !== 'todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('todos');
                setSelectedTag('todos');
              }}
              className="text-xs text-[#2b694d] hover:underline font-bold px-2 py-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Specialty Quick Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none text-xs">
        <span className="text-[#717973] font-bold whitespace-nowrap">Especialidad:</span>
        {popularTags.map(tag => {
          const isActive = (tag === 'Todos' && selectedTag === 'todos') || selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === 'Todos' ? 'todos' : tag)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#012d1d] text-[#b0f1cc] shadow-2xs'
                  : 'bg-white text-[#414844] border border-[#c1c8c2]/50 hover:border-[#012d1d]'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Grid of Costureros */}
      {filteredProfessionals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c1c8c2]/50 max-w-lg mx-auto space-y-4 my-8">
          <span className="material-symbols-outlined text-5xl text-[#717973]">
            person_search
          </span>
          <h3 className="font-headline text-lg font-bold text-[#012d1d]">
            No encontramos costureros con estos criterios
          </h3>
          <p className="text-xs text-[#414844]">
            Intenta borrar los filtros de búsqueda o seleccionar otra ubicación.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('todos');
              setSelectedTag('todos');
            }}
            className="px-5 py-2.5 bg-[#012d1d] text-white text-xs font-bold rounded-xl hover:bg-[#2b694d]"
          >
            Ver todos los costureros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((pro) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 hover:border-[#012d1d] hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
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
                      <span className="text-[#717973] font-normal">({pro.reviewsCount} reseñas)</span>
                    </div>

                    <h3 className="font-headline text-lg font-bold text-[#012d1d] truncate">
                      {pro.name}
                    </h3>

                    <p className="text-xs font-semibold text-[#2b694d] truncate">
                      {pro.specialty}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-[#717973] mt-1 truncate">
                      <span className="material-symbols-outlined text-xs text-[#2b694d]">location_on</span>
                      <span className="truncate">{pro.location.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Brief Bio */}
                <p className="text-xs text-[#414844] leading-relaxed line-clamp-3">
                  {pro.bio}
                </p>

                {/* Specialty Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {pro.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-[#faf9f4] text-[#012d1d] px-2.5 py-1 rounded-lg border border-[#c1c8c2]/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Pricing info */}
                <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#717973] block">Tarifa base desde</span>
                    <span className="font-black text-sm text-[#012d1d]">
                      ${pro.startingPrice.toLocaleString()} COP
                    </span>
                  </div>

                  <button
                    onClick={() => onRequestService(pro)}
                    className="text-[11px] font-bold text-[#e37b5e] hover:underline"
                  >
                    Solicitar cotización
                  </button>
                </div>
              </div>

              {/* Action Buttons: "Ver perfil" and "Contactar / Iniciar conversación" */}
              <div className="pt-3 border-t border-[#efeee9] grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectProfessional(pro)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#faf9f4] hover:bg-[#efeee9] text-[#012d1d] border border-[#c1c8c2] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  <span>Ver perfil</span>
                </button>

                <button
                  onClick={() => onSendMessage(pro)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#012d1d] hover:bg-[#2b694d] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">chat_bubble</span>
                  <span>Contactar</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
