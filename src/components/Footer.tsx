import React from 'react';
import { AppView, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { EXPANDED_CATEGORIES } from '../data/categoriesData';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onOpenInfoModal: (type: 'privacidad' | 'terminos' | 'contacto' | 'sostenibilidad') => void;
  onSharePlatform: () => void;
  onSelectCategory?: (categoryName: string) => void;
  userRole?: UserRole;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenInfoModal,
  onSharePlatform,
  onSelectCategory,
  userRole,
}) => {
  const { t, tCategory, language } = useThemeLanguage();

  return (
    <footer className="w-full py-12 md:py-16 px-6 md:px-16 bg-[#012d1d] text-[#faf9f4] mt-auto border-t border-[#1b4332]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <div className="bg-white/95 p-3 rounded-2xl w-fit shadow-md inline-block">
            <BrandLogo size="sm" variant="horizontal" onClick={() => onNavigate('inicio')} />
          </div>
          <p className="text-xs text-[#faf9f4]/80 leading-relaxed max-w-sm">
            {t('footer.brand_desc')}
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-[#b0f1cc]">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>Medellín • Bogotá • Cali • Colombia</span>
          </div>
          <p className="text-[11px] text-[#86af99] mt-2">
            © {new Date().getFullYear()} Reborn Your Style. {t('footer.rights')}
          </p>
        </div>

        {/* Navigation Column */}
        <div className="flex flex-col gap-2">
          <h4 className="font-headline text-xs font-bold text-[#b0f1cc] tracking-wider uppercase mb-1">
            {t('footer.col_explore')}
          </h4>
          <button
            onClick={() => onNavigate('inicio')}
            className="text-left text-xs text-[#faf9f4]/80 hover:text-white transition-colors py-0.5 cursor-pointer"
          >
            {t('nav.inicio')}
          </button>
          <button
            onClick={() => onNavigate('catalogos')}
            className="text-left text-xs text-[#faf9f4]/80 hover:text-white transition-colors py-0.5 font-semibold text-[#b0f1cc] cursor-pointer"
          >
            {t('nav.catalogo')}
          </button>
          <button
            onClick={() => onNavigate('costureros')}
            className="text-left text-xs text-[#faf9f4]/80 hover:text-white transition-colors py-0.5 font-semibold text-[#b0f1cc] cursor-pointer"
          >
            {t('nav.costureros')}
          </button>
          <button
            onClick={() => onNavigate('servicios')}
            className="text-left text-xs text-[#faf9f4]/80 hover:text-white transition-colors py-0.5 cursor-pointer"
          >
            {t('nav.servicios')}
          </button>
          <button
            onClick={() => onNavigate('inspiracion')}
            className="text-left text-xs text-[#faf9f4]/80 hover:text-white transition-colors py-0.5 cursor-pointer"
          >
            {language === 'en' ? 'Inspiration Gallery' : 'Galería de Inspiración'}
          </button>
          <button
            onClick={() => onNavigate('como-funciona')}
            className="text-left text-xs text-[#faf9f4]/80 hover:text-white transition-colors py-0.5 cursor-pointer"
          >
            {language === 'en' ? 'How Reborn Works' : 'Cómo Funciona Reborn'}
          </button>
        </div>

        {/* Categories preview */}
        <div className="flex flex-col gap-2">
          <h4 className="font-headline text-xs font-bold text-[#b0f1cc] tracking-wider uppercase mb-1">
            {t('footer.col_categories')}
          </h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[#faf9f4]/70">
            {EXPANDED_CATEGORIES.slice(0, 8).map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCategory ? onSelectCategory(c.name) : onNavigate('catalogos')}
                className="text-left hover:text-white transition-colors truncate flex items-center gap-1.5 cursor-pointer"
              >
                <span className="w-1 h-1 rounded-full bg-[#b0f1cc]/60"></span>
                <span>{tCategory(c.name)}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => onNavigate('catalogos')}
            className="text-left text-[11px] text-[#b0f1cc] font-semibold hover:underline mt-1 cursor-pointer"
          >
            {language === 'en' ? 'View all categories →' : 'Ver todas las categorías →'}
          </button>
        </div>

        {/* Actions & Legal */}
        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-xs font-bold text-[#b0f1cc] tracking-wider uppercase mb-1">
            {t('footer.col_legal')}
          </h4>
          <div className="flex flex-col gap-1 text-xs text-[#faf9f4]/80">
            <button
              onClick={() => onOpenInfoModal('privacidad')}
              className="text-left hover:text-white transition-colors py-0.5 cursor-pointer"
            >
              {t('footer.privacy')}
            </button>
            <button
              onClick={() => onOpenInfoModal('terminos')}
              className="text-left hover:text-white transition-colors py-0.5 cursor-pointer"
            >
              {t('footer.terms')}
            </button>
            <button
              onClick={() => onOpenInfoModal('sostenibilidad')}
              className="text-left hover:text-white transition-colors py-0.5 cursor-pointer"
            >
              {t('footer.sustainability')}
            </button>
            <button
              onClick={() => onOpenInfoModal('contacto')}
              className="text-left hover:text-white transition-colors py-0.5 cursor-pointer"
            >
              {t('nav.ayuda')}
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="text-left text-[10px] text-[#faf9f4]/60 hover:text-[#b0f1cc] transition-colors py-1 flex items-center gap-1 mt-1 pt-1 border-t border-white/10 font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px] text-[#b0f1cc]">shield_person</span>
                <span>{language === 'en' ? 'Admin Panel' : 'Panel de Administración'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="bg-[#2b694d] text-white hover:bg-[#3f6653] text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>{t('nav.publicar')}</span>
            </button>
            <button
              onClick={onSharePlatform}
              className="p-2 rounded-xl bg-[#1b4332] text-white hover:bg-[#2b694d] transition-colors cursor-pointer"
              title={language === 'en' ? 'Share' : 'Compartir'}
            >
              <span className="material-symbols-outlined text-base">share</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
