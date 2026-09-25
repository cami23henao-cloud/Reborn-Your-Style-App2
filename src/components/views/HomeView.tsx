import React from 'react';
import { AppView, Professional, UserProfile } from '../../types';
import { EXPANDED_CATEGORIES } from '../../data/categoriesData';
import { BrandLogo } from '../BrandLogo';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  featuredProfessionals: Professional[];
  onSelectProfessional: (pro: Professional) => void;
  user: UserProfile;
  onNavigateToDesigners?: () => void;
  onSelectCategory?: (categoryName: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  featuredProfessionals,
  onSelectProfessional,
  user,
  onNavigateToDesigners,
  onSelectCategory
}) => {
  return (
    <div className="flex flex-col w-full animate-in fade-in">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-12 py-10 md:py-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        <div className="flex-1 flex flex-col gap-5 items-start">
          {/* Logo Badge & Purpose */}
          <div className="flex items-center gap-3">
            <BrandLogo size="xs" variant="emblem" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b0f1cc]/50 text-[#002113] text-xs font-bold border border-[#2b694d]/20">
              <span className="material-symbols-outlined text-sm">recycling</span>
              <span>Plataforma de Suprareciclaje y Moda Circular en Colombia</span>
            </div>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-[#012d1d] leading-[1.12] tracking-tight">
            Dale una nueva vida a tu ropa con <span className="text-[#2b694d]">estilo y talento local</span>
          </h1>

          <p className="text-sm sm:text-base text-[#414844] leading-relaxed max-w-xl">
            Transforma, intercambia y rediseña tus prendas olvidadas. Conecta con modistas, artesanos y diseñadores de suprareciclaje textil en toda Colombia.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => onNavigate('costureros')}
              className="bg-[#012d1d] hover:bg-[#2b694d] text-white active:scale-95 font-bold text-xs md:text-sm px-6 py-3.5 rounded-full transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">handyman</span>
              <span>Encuentra tu costurero</span>
            </button>

            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="bg-white text-[#012d1d] hover:bg-[#efeee9] border border-[#c1c8c2] font-bold text-xs md:text-sm px-6 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>Publicar prenda</span>
            </button>

            <button
              onClick={() => onNavigate('catalogos')}
              className="text-[#2b694d] hover:text-[#012d1d] font-bold text-xs md:text-sm px-4 py-3.5 rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>Explorar catálogos</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Showcase with Brand Logo */}
        <div className="flex-1 w-full h-[380px] sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl relative border border-[#c1c8c2]/40 bg-[#102b1e]">
          <img
            className="w-full h-full object-cover opacity-90"
            alt="Moda circular y transformación textil Reborn Your Style"
            src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/90 via-[#012d1d]/20 to-transparent"></div>

          {/* Floating Brand Stamp */}
          <div className="absolute top-5 right-5 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg">
            <BrandLogo size="xs" variant="horizontal" />
          </div>

          {/* Bottom Project Feature Card */}
          <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">recycling</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#012d1d]">Transformación Textil Sostenible</p>
                <p className="text-[11px] text-[#717973]">Prendas intervenidas con técnicas de suprareciclaje</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inspiracion')}
              className="px-3.5 py-1.5 bg-[#012d1d] text-white text-xs font-bold rounded-xl hover:bg-[#2b694d] transition-colors"
            >
              Ver técnicas
            </button>
          </div>
        </div>
      </section>

      {/* 16 Expanded Categories Carousel / Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d]">
              Prendas para Suprareciclaje
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#012d1d] mt-1">
              Explora por Categoría Textil
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogos')}
            className="text-xs font-bold text-[#2b694d] hover:text-[#012d1d] flex items-center gap-1"
          >
            <span>Ver todos los catálogos</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {EXPANDED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory ? onSelectCategory(cat.name) : onNavigate('catalogos')}
              className="group p-3.5 rounded-2xl bg-white border border-[#c1c8c2]/50 hover:border-[#012d1d] hover:shadow-md transition-all text-center flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#faf9f4] group-hover:bg-[#012d1d] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-lg text-[#012d1d] group-hover:text-[#b0f1cc] transition-colors">
                  {cat.icon}
                </span>
              </div>
              <span className="text-xs font-bold text-[#012d1d] group-hover:text-[#2b694d] transition-colors truncate w-full">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Private Upcycling Studio & Circular Wardrobe Section */}
      <section className="w-full bg-[#fcfbf9] py-16 border-y border-[#c1c8c2]/30">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d]">
                Espacio Personal y Privado
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#012d1d] mt-1">
                Tu Armario de Suprareciclaje
              </h2>
            </div>
            <button
              onClick={() => onNavigate('mi-estudio')}
              className="text-xs font-bold text-[#2b694d] hover:text-[#012d1d] flex items-center gap-1"
            >
              <span>Acceder a mi perfil</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/40 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f4ef] flex items-center justify-center text-[#012d1d]">
                  <span className="material-symbols-outlined text-2xl">inventory_2</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                  Inventario Protegido
                </h3>
                <p className="text-xs text-[#414844] leading-relaxed">
                  Registra tus prendas en desuso, fotos de detalle y solicitudes de transformación dentro de tu espacio privado y confidencial.
                </p>
              </div>
              <button
                onClick={() => onNavigate('publicar-prenda')}
                className="text-xs font-bold text-[#2b694d] hover:text-[#012d1d] flex items-center gap-1 pt-2 border-t border-[#efeee9]"
              >
                <span>Registrar nueva prenda →</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/40 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f4ef] flex items-center justify-center text-[#012d1d]">
                  <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                  Conversaciones Directas
                </h3>
                <p className="text-xs text-[#414844] leading-relaxed">
                  Comunícate exclusivamente con el modista asignado a tu proyecto para acordar medidas, presupuesto y avances sin intermediarios.
                </p>
              </div>
              <button
                onClick={() => onNavigate('mensajes')}
                className="text-xs font-bold text-[#2b694d] hover:text-[#012d1d] flex items-center gap-1 pt-2 border-t border-[#efeee9]"
              >
                <span>Mis mensajes y solicitudes →</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/40 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f4ef] flex items-center justify-center text-[#012d1d]">
                  <span className="material-symbols-outlined text-2xl">eco</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-[#012d1d]">
                  Impacto Ambiental Medible
                </h3>
                <p className="text-xs text-[#414844] leading-relaxed">
                  Calcula los litros de agua y kilogramos de CO2 ahorrados en cada transformación textil realizada en territorio colombiano.
                </p>
              </div>
              <button
                onClick={() => onNavigate('inspiracion')}
                className="text-xs font-bold text-[#2b694d] hover:text-[#012d1d] flex items-center gap-1 pt-2 border-t border-[#efeee9]"
              >
                <span>Ver guía de sostenibilidad →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-12 py-16">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2b694d]">
            Proceso Circular
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#012d1d]">
            ¿Cómo funciona Reborn Your Style?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              step: 'Paso 1',
              title: 'Sube tu prenda o proyecto',
              desc: 'Comparte fotos de esa prenda en tu armario y describe la idea o transformación que imaginas.',
              icon: 'photo_camera',
              action: () => onNavigate('publicar-prenda')
            },
            {
              step: 'Paso 2',
              title: 'Elige tu diseñador o taller',
              desc: 'Explora perfiles de diseñadores y modistas certificados en Colombia y solicita una cotización.',
              icon: 'person_pin_circle',
              action: () => onNavigate('costureros')
            },
            {
              step: 'Paso 3',
              title: 'Confección y rediseño',
              desc: 'Coordina detalles, medidas y técnicas sostenibles directamente por el chat interno.',
              icon: 'content_cut',
              action: () => onNavigate('mensajes')
            },
            {
              step: 'Paso 4',
              title: 'Estrena y genera impacto',
              desc: 'Recibe una pieza única de moda circular con huella de agua y carbono positiva para el planeta.',
              icon: 'eco',
              action: () => onNavigate('inspiracion')
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="p-6 rounded-3xl bg-white border border-[#c1c8c2]/50 hover:shadow-xl hover:border-[#012d1d] transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#faf9f4] group-hover:bg-[#b0f1cc] text-[#012d1d] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-[#2b694d] uppercase tracking-wider block">
                  {item.step}
                </span>
                <h3 className="font-headline font-bold text-base text-[#012d1d]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#414844] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <span className="text-xs font-bold text-[#2b694d] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Comenzar</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
