import React from 'react';
import { AppView, Professional, UserProfile } from '../../types';
import { EXPANDED_CATEGORIES } from '../../data/categoriesData';
import { BrandLogo } from '../BrandLogo';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

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
  const { t } = useThemeLanguage();

  return (
    <div className="flex flex-col w-full animate-in fade-in pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION - Clean, Responsive Proportions, No Cut-off Buttons        */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        {/* Left Column: Brand, Pitch & Primary CTAs */}
        <div className="flex-1 flex flex-col gap-6 sm:gap-7 items-start w-full">
          {/* Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo size="xs" variant="emblem" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b0f1cc]/50 dark:bg-[#112920] text-[#002113] dark:text-[#b0f1cc] text-xs sm:text-sm font-bold border border-[#2b694d]/30 shadow-2xs">
              <span className="material-symbols-outlined text-base">recycling</span>
              <span>{t('hero.badge')}</span>
            </div>
          </div>

          {/* Headline - Responsive typography with clamp(1.8rem, 4vw, 2.8rem) */}
          <h1
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            className="font-headline font-black text-[#012d1d] dark:text-white leading-[1.15] tracking-tight"
          >
            {t('hero.title_pre')}
            <span className="text-[#2b694d] dark:text-[#b0f1cc]">{t('hero.title_highlight')}</span>
          </h1>

          {/* Subtitle - Increased readability and spacing */}
          <p className="text-base sm:text-lg text-[#414844] dark:text-[#a7b8ae] leading-relaxed max-w-2xl font-normal">
            {t('hero.desc')}
          </p>

          {/* Action Buttons - Fully responsive, width 100% on mobile, max-width on desktop, no overflow */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto pt-2 overflow-hidden">
            <button
              onClick={() => onNavigate('costureros')}
              className="btn-interactive w-full sm:w-auto max-w-full sm:max-w-xs bg-[#012d1d] hover:bg-[#1b4332] active:bg-[#002113] text-white font-bold text-sm sm:text-base px-7 py-4 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-xl text-[#b0f1cc]">handyman</span>
              <span>{t('hero.btn_costurero')}</span>
            </button>

            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="btn-interactive w-full sm:w-auto max-w-full sm:max-w-xs bg-white dark:bg-[#0e241c] text-[#012d1d] dark:text-white hover:bg-[#efeee9] dark:hover:bg-[#16382c] border border-[#c1c8c2] dark:border-[#2b694d]/50 font-bold text-sm sm:text-base px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-xl text-[#2b694d] dark:text-[#b0f1cc]">add_circle</span>
              <span>{t('hero.btn_publicar')}</span>
            </button>

            <button
              onClick={() => onNavigate('catalogos')}
              className="link-animated w-full sm:w-auto text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white font-bold text-sm sm:text-base px-4 py-3 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>{t('hero.btn_explorar')}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="w-full lg:flex-1 h-80 sm:h-[440px] lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl relative border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 bg-[#102b1e]">
          <img
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            alt="Moda circular y transformación textil Reborn Your Style"
            src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&auto=format&fit=crop&q=80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/90 via-[#012d1d]/25 to-transparent pointer-events-none"></div>

          {/* Floating Brand Stamp */}
          <div className="absolute top-5 right-5 p-2.5 bg-white/95 dark:bg-[#071510]/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 dark:border-[#2b694d]/40">
            <BrandLogo size="xs" variant="horizontal" />
          </div>

          {/* Bottom Project Feature Card */}
          <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-6 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#071510]/95 backdrop-blur-md border border-white/50 dark:border-[#2b694d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-2xl">recycling</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#012d1d] dark:text-white">{t('hero.card_title')}</p>
                <p className="text-xs text-[#717973] dark:text-[#a7b8ae]">{t('hero.card_desc')}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inspiracion')}
              className="px-4 py-2 bg-[#012d1d] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#2b694d] transition-colors self-end sm:self-center cursor-pointer shadow-xs whitespace-nowrap"
            >
              {t('hero.btn_tecnicas')}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TEXTILE CATEGORIES GRID - Clean, spacious, strictly organized          */}
      {/* ========================================================================= */}
      <section className="scroll-reveal w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
              {t('home.categories_sub')}
            </span>
            <h2
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
              className="font-headline font-bold text-[#012d1d] dark:text-white mt-1 leading-snug"
            >
              {t('home.categories_title')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogos')}
            className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1.5 cursor-pointer self-start md:self-end"
          >
            <span>{t('home.categories_all')}</span>
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {EXPANDED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory ? onSelectCategory(cat.name) : onNavigate('catalogos')}
              className="group hover-elevate p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e241c] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 hover:border-[#012d1d] hover:shadow-md transition-all text-center flex flex-col items-center gap-2.5 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-[#faf9f4] dark:bg-[#112920] group-hover:bg-[#012d1d] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-xl text-[#012d1d] dark:text-[#b0f1cc] group-hover:text-[#b0f1cc] transition-colors">
                  {cat.icon}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#012d1d] dark:text-white group-hover:text-[#2b694d] dark:group-hover:text-[#b0f1cc] transition-colors truncate w-full">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TU ARMARIO DE SUPRARECICLAJE - Spacious Cards & Professional Hierarchy */}
      {/* ========================================================================= */}
      <section className="scroll-reveal w-full bg-[#fcfbf9] dark:bg-[#0b1e17] py-14 sm:py-20 border-y border-[#c1c8c2]/30 dark:border-[#2b694d]/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
                {t('home.wardrobe_badge')}
              </span>
              <h2
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
                className="font-headline font-bold text-[#012d1d] dark:text-white mt-1 leading-snug"
              >
                {t('home.wardrobe_title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('mi-estudio')}
              className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1.5 cursor-pointer self-start md:self-end"
            >
              <span>{t('home.wardrobe_link')}</span>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Inventario */}
            <div className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-7 sm:p-8 border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f4ef] dark:bg-[#112920] flex items-center justify-center text-[#012d1d] dark:text-[#b0f1cc]">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white">
                  Inventario Protegido
                </h3>
                <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  Registra tus prendas en desuso, fotos de detalle y solicitudes de transformación dentro de tu espacio privado y confidencial.
                </p>
              </div>
              <button
                onClick={() => onNavigate('publicar-prenda')}
                className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1 pt-4 border-t border-[#efeee9] dark:border-[#173328] cursor-pointer"
              >
                <span>Registrar nueva prenda →</span>
              </button>
            </div>

            {/* Card 2: Conversaciones */}
            <div className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-7 sm:p-8 border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f4ef] dark:bg-[#112920] flex items-center justify-center text-[#012d1d] dark:text-[#b0f1cc]">
                  <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                </div>
                <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white">
                  Conversaciones Directas
                </h3>
                <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  Comunícate exclusivamente con el modista asignado a tu proyecto para acordar medidas, presupuesto y avances sin intermediarios.
                </p>
              </div>
              <button
                onClick={() => onNavigate('mensajes')}
                className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1 pt-4 border-t border-[#efeee9] dark:border-[#173328] cursor-pointer"
              >
                <span>Mis mensajes y solicitudes →</span>
              </button>
            </div>

            {/* Card 3: Impacto */}
            <div className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-7 sm:p-8 border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f4ef] dark:bg-[#112920] flex items-center justify-center text-[#012d1d] dark:text-[#b0f1cc]">
                  <span className="material-symbols-outlined text-3xl">eco</span>
                </div>
                <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white">
                  Impacto Ambiental Medible
                </h3>
                <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  Calcula los litros de agua y kilogramos de CO2 ahorrados en cada transformación textil realizada en territorio colombiano.
                </p>
              </div>
              <button
                onClick={() => onNavigate('inspiracion')}
                className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1 pt-4 border-t border-[#efeee9] dark:border-[#173328] cursor-pointer"
              >
                <span>Ver guía de sostenibilidad →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PROCESO CIRCULAR - 4 Steps clearly legible with good margins            */}
      {/* ========================================================================= */}
      <section className="scroll-reveal w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2b694d] dark:text-[#b0f1cc]">
            {t('home.how_badge')}
          </span>
          <h2
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
            className="font-headline font-bold text-[#012d1d] dark:text-white leading-snug"
          >
            {t('home.how_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className="hover-elevate p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0e241c] border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 hover:shadow-xl hover:border-[#012d1d] transition-all cursor-pointer flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#faf9f4] dark:bg-[#112920] group-hover:bg-[#b0f1cc] text-[#012d1d] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <span className="text-xs font-bold text-[#2b694d] dark:text-[#b0f1cc] uppercase tracking-wider block">
                  {item.step}
                </span>
                <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <span className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Comenzar</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
