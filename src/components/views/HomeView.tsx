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
  const { t, tCategory, language } = useThemeLanguage();

  return (
    <div className="flex flex-col w-full animate-in fade-in pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION - Viewport Fit, Proportional Heights, Fully Visible Actions*/}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
        {/* Left Column: Brand, Pitch & Primary CTAs */}
        <div className="flex-1 flex flex-col gap-3.5 sm:gap-4.5 items-start w-full">
          {/* Badge (Stagger 1 with delicate float) */}
          <div className="flex flex-wrap items-center gap-2.5 animate-stagger-1">
            <div className="animate-delicate-float">
              <BrandLogo size="xs" variant="emblem" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b0f1cc]/50 dark:bg-[#112920] text-[#002113] dark:text-[#b0f1cc] text-xs sm:text-sm font-bold border border-[#2b694d]/30 shadow-2xs animate-soft-glow">
              <span className="material-symbols-outlined text-sm">recycling</span>
              <span>{t('hero.badge')}</span>
            </div>
          </div>

          {/* Headline (Stagger 2) - Clean proportional scale */}
          <h1
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.3rem)' }}
            className="font-headline font-black text-[#012d1d] dark:text-white leading-[1.18] tracking-tight animate-fade-up text-hover-lift"
          >
            <span className="letter-reveal inline-block">{t('hero.title_pre')}</span>{' '}
            <span className="text-[#2b694d] dark:text-[#b0f1cc] letter-reveal inline-block" style={{ animationDelay: '0.15s' }}>
              {t('hero.title_highlight')}
            </span>
          </h1>

          {/* Subtitle (Stagger 2) - Proportional height */}
          <p
            className="text-xs sm:text-sm md:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed max-w-2xl font-normal animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            {t('hero.desc')}
          </p>

          {/* Action Buttons (Stagger 3) - Framed for immediate 100% visibility */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1 sm:pt-2 overflow-hidden animate-fade-up"
            style={{ animationDelay: '0.35s', marginBottom: '1rem' }}
          >
            <button
              onClick={() => onNavigate('costureros')}
              className="btn-interactive w-full sm:w-auto max-w-full sm:max-w-xs bg-[#012d1d] hover:bg-[#1b4332] active:bg-[#002113] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-lg text-[#b0f1cc]">handyman</span>
              <span>{t('hero.btn_costurero')}</span>
            </button>

            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="btn-interactive w-full sm:w-auto max-w-full sm:max-w-xs bg-white dark:bg-[#0e241c] text-[#012d1d] dark:text-white hover:bg-[#efeee9] dark:hover:bg-[#16382c] border-2 border-[#012d1d]/70 dark:border-[#2b694d] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-lg text-[#2b694d] dark:text-[#b0f1cc]">add_circle</span>
              <span>{t('hero.btn_publicar')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div
          className="w-full lg:flex-1 h-60 sm:h-72 lg:h-[350px] rounded-3xl overflow-hidden shadow-xl relative border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 bg-[#102b1e] animate-fade-up transition-transform duration-500 hover:shadow-[0_20px_50px_rgba(1,45,29,0.2)]"
          style={{ animationDelay: '0.25s' }}
        >
          <img
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            alt="Moda circular y transformación textil Reborn Your Style"
            src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&auto=format&fit=crop&q=80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/90 via-[#012d1d]/25 to-transparent pointer-events-none"></div>

          {/* Floating Brand Stamp with gentle float */}
          <div className="absolute top-4 right-4 p-2 bg-white/95 dark:bg-[#071510]/95 backdrop-blur-md rounded-xl shadow-md border border-white/30 dark:border-[#2b694d]/40 animate-delicate-float">
            <BrandLogo size="xs" variant="horizontal" />
          </div>

          {/* Bottom Project Feature Card */}
          <div className="absolute bottom-4 left-3 right-3 sm:left-5 sm:right-5 p-3 sm:p-3.5 rounded-xl bg-white/95 dark:bg-[#071510]/95 backdrop-blur-md border border-white/50 dark:border-[#2b694d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#012d1d] text-[#b0f1cc] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-xl">recycling</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#012d1d] dark:text-white leading-tight">{t('hero.card_title')}</p>
                <p className="text-[11px] text-[#717973] dark:text-[#a7b8ae]">{t('hero.card_desc')}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inspiracion')}
              className="btn-interactive px-3.5 py-1.5 bg-[#012d1d] text-white text-xs font-bold rounded-lg hover:bg-[#2b694d] transition-colors self-end sm:self-center cursor-pointer shadow-xs whitespace-nowrap"
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
              <span className="text-xs sm:text-sm font-bold text-[#012d1d] dark:text-white group-hover:text-[#2b694d] dark:group-hover:text-[#b0f1cc] transition-colors truncate w-full text-hover-lift">
                {tCategory(cat.name)}
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
                className="font-headline font-bold text-[#012d1d] dark:text-white mt-1 leading-snug animate-fade-in-down"
              >
                {t('home.wardrobe_title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('mi-estudio')}
              className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1.5 cursor-pointer self-start md:self-end text-hover-lift"
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
                <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white text-hover-lift">
                  {t('home.card1_title')}
                </h3>
                <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  {t('home.card1_desc')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('publicar-prenda')}
                className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1 pt-4 border-t border-[#efeee9] dark:border-[#173328] cursor-pointer text-hover-lift"
              >
                <span>{t('home.card1_btn')}</span>
              </button>
            </div>

            {/* Card 2: Conversaciones */}
            <div className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-7 sm:p-8 border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f4ef] dark:bg-[#112920] flex items-center justify-center text-[#012d1d] dark:text-[#b0f1cc]">
                  <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                </div>
                <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white text-hover-lift">
                  {t('home.card2_title')}
                </h3>
                <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  {t('home.card2_desc')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('mensajes')}
                className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1 pt-4 border-t border-[#efeee9] dark:border-[#173328] cursor-pointer text-hover-lift"
              >
                <span>{t('home.card2_btn')}</span>
              </button>
            </div>

            {/* Card 3: Impacto */}
            <div className="hover-elevate bg-white dark:bg-[#0e241c] rounded-3xl p-7 sm:p-8 border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f4ef] dark:bg-[#112920] flex items-center justify-center text-[#012d1d] dark:text-[#b0f1cc]">
                  <span className="material-symbols-outlined text-3xl">eco</span>
                </div>
                <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#012d1d] dark:text-white text-hover-lift">
                  {t('home.card3_title')}
                </h3>
                <p className="text-sm sm:text-base text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  {t('home.card3_desc')}
                </p>
              </div>
              <button
                onClick={() => onNavigate('inspiracion')}
                className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] hover:text-[#012d1d] dark:hover:text-white flex items-center gap-1 pt-4 border-t border-[#efeee9] dark:border-[#173328] cursor-pointer text-hover-lift"
              >
                <span>{t('home.card3_btn')}</span>
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
            className="font-headline font-bold text-[#012d1d] dark:text-white leading-snug animate-fade-in-down"
          >
            {t('home.how_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: language === 'en' ? 'Step 1' : 'Paso 1',
              title: t('home.step1_title'),
              desc: t('home.step1_desc'),
              icon: 'photo_camera',
              action: () => onNavigate('publicar-prenda')
            },
            {
              step: language === 'en' ? 'Step 2' : 'Paso 2',
              title: t('home.step2_title'),
              desc: t('home.step2_desc'),
              icon: 'person_pin_circle',
              action: () => onNavigate('costureros')
            },
            {
              step: language === 'en' ? 'Step 3' : 'Paso 3',
              title: t('home.step3_title'),
              desc: t('home.step3_desc'),
              icon: 'content_cut',
              action: () => onNavigate('mensajes')
            },
            {
              step: language === 'en' ? 'Step 4' : 'Paso 4',
              title: t('home.step4_title'),
              desc: t('home.step4_desc'),
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
                <h3 className="font-headline font-bold text-lg text-[#012d1d] dark:text-white text-hover-lift">
                  {item.title}
                </h3>
                <p className="text-sm text-[#414844] dark:text-[#a7b8ae] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <span className="text-sm font-bold text-[#2b694d] dark:text-[#b0f1cc] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{language === 'en' ? 'Start' : 'Comenzar'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
