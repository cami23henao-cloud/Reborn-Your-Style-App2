import React, { useState } from 'react';
import { AppView, UserRole, UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';
import { UserAvatar } from './common/UserAvatar';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface TopNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSearch: () => void;
  userRole: UserRole;
  isLoggedIn: boolean;
  onLogout: () => void;
  user: UserProfile;
  onOpenEditProfile: () => void;
  onOpenInfoModal?: (
    type:
      | 'privacidad'
      | 'terminos'
      | 'contacto'
      | 'sostenibilidad'
      | 'quienes-somos'
      | 'mision'
      | 'vision'
      | 'tutoriales'
  ) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenSearch,
  userRole,
  isLoggedIn,
  onLogout,
  user,
  onOpenEditProfile,
  onOpenInfoModal,
}) => {
  const { language, toggleLanguage, theme, toggleTheme, t } = useThemeLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onOpenSearch();
    }
  };

  // Requested Navigation Items: Clean and professional, removed Quiénes somos, Misión, Visión, Impacto, Contacto
  interface NavItem {
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
    isActive?: boolean;
  }

  const navItems: NavItem[] =
    userRole === 'admin'
      ? []
      : [
          {
            id: 'catalogo',
            label: t('nav.catalogo'),
            icon: 'inventory_2',
            isActive: currentView === 'catalogos' || currentView === 'categoria',
            onClick: () => onNavigate('catalogos'),
          },
          {
            id: 'costureros',
            label: t('nav.costureros'),
            icon: 'handyman',
            isActive: currentView === 'costureros' || currentView === 'perfil-profesional',
            onClick: () => onNavigate('costureros'),
          },
          {
            id: 'servicios',
            label: t('nav.servicios'),
            icon: 'content_cut',
            isActive: currentView === 'servicios',
            onClick: () => onNavigate('servicios'),
          },
          {
            id: 'tutoriales',
            label: t('nav.tutoriales'),
            icon: 'school',
            isActive: false,
            onClick: () => onOpenInfoModal?.('tutoriales'),
          },
        ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 lg:px-8 h-20 bg-[#faf9f4]/95 dark:bg-[#071510]/95 backdrop-blur-md shadow-[0_2px_12px_rgba(1,45,29,0.05)] border-b border-[#c1c8c2]/30 dark:border-[#2b694d]/30 flex items-center transition-colors">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-3 sm:gap-6">
        {/* Brand Logo - Aligned, sharp, with clean margins */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onNavigate(userRole === 'admin' ? 'admin' : 'inicio')}
            className="hover:opacity-90 transition-opacity text-left flex items-center shrink-0 cursor-pointer focus:outline-none"
            aria-label={userRole === 'admin' ? 'Panel de Administración' : 'Ir a Inicio'}
          >
            <BrandLogo size="sm" variant="horizontal" />
          </button>

          {userRole === 'admin' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012d1d] text-[#b0f1cc] text-xs font-bold shadow-xs ml-3">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Panel Admin Central</span>
            </span>
          )}
        </div>

        {/* Desktop Navigation Links (Catálogo, Costureros, Servicios, Tutoriales) */}
        {userRole !== 'admin' && (
          <div className="hidden md:flex items-center gap-2 lg:gap-3 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`text-xs md:text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  item.isActive
                    ? 'text-[#012d1d] dark:text-[#b0f1cc] font-bold bg-[#efeee9] dark:bg-[#112920] shadow-xs'
                    : 'text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d] dark:hover:text-white hover:bg-[#efeee9] dark:hover:bg-[#112920]'
                }`}
              >
                <span className="material-symbols-outlined text-base text-[#2b694d] dark:text-[#b0f1cc]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right Side Actions: Language, Dark/Light Mode, Quick Search, User/Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden xl:block">
            <button
              type="button"
              onClick={onOpenSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d] flex items-center justify-center"
              title="Buscar"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
            <input
              type="text"
              placeholder={t('nav.buscar')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onClick={onOpenSearch}
              className="pl-9 pr-4 py-2 rounded-full border border-[#c1c8c2]/80 dark:border-[#2b694d]/40 bg-[#f5f4ef] dark:bg-[#112920] focus:bg-white dark:focus:bg-[#17382c] focus:border-[#012d1d] text-xs text-[#1b1c19] dark:text-[#f2f7f4] outline-none transition-all w-36 lg:w-48 placeholder:text-[#717973]"
            />
          </form>

          {/* PERMANENT CONTROLS: UN SOLO BOTÓN PARA IDIOMA Y UN SOLO BOTÓN PARA MODO CLARO/OSCURO */}
          <div className="flex items-center gap-1.5 bg-[#f5f4ef] dark:bg-[#112920] p-1 rounded-full border border-[#c1c8c2]/60 dark:border-[#2b694d]/40">
            {/* UN SOLO BOTÓN PARA IDIOMA */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full text-xs font-bold text-[#012d1d] dark:text-[#b0f1cc] hover:bg-white dark:hover:bg-[#17382c] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              title={t('nav.cambiar_idioma')}
              aria-label={t('nav.cambiar_idioma')}
            >
              <span className="material-symbols-outlined text-sm">language</span>
              <span className="uppercase">{language === 'es' ? 'ES' : 'EN'}</span>
            </button>

            {/* UN SOLO BOTÓN PARA MODO OSCURO/CLARO */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-7 h-7 rounded-full text-[#012d1d] dark:text-[#b0f1cc] hover:bg-white dark:hover:bg-[#17382c] transition-all flex items-center justify-center shadow-2xs cursor-pointer"
              title={t('nav.cambiar_tema')}
              aria-label={t('nav.cambiar_tema')}
            >
              <span className="material-symbols-outlined text-base">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Authenticated User Menu or Guest Buttons */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {/* Studio Shortcut */}
              <button
                onClick={() => onNavigate('mi-estudio')}
                className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                  currentView === 'mi-estudio'
                    ? 'bg-[#b0f1cc] text-[#002113] font-bold'
                    : 'text-[#012d1d] dark:text-white hover:bg-[#efeee9] dark:hover:bg-[#112920]'
                }`}
                title="Ir a Mi Estudio / Dashboard"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span>{t('nav.mi_estudio')}</span>
              </button>

              {/* Messages Shortcut */}
              <button
                onClick={() => onNavigate('mensajes')}
                className={`p-2 rounded-full text-[#414844] dark:text-[#a7b8ae] hover:text-[#012d1d] hover:bg-[#efeee9] dark:hover:bg-[#112920] transition-colors relative ${
                  currentView === 'mensajes' ? 'bg-[#b0f1cc] text-[#002113]' : ''
                }`}
                title="Mensajes"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
              </button>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#efeee9] dark:hover:bg-[#112920] transition-colors border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 cursor-pointer"
                >
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="xs"
                    borderClassName="border border-[#2b694d]"
                  />
                  <span className="text-xs font-semibold text-[#012d1d] dark:text-white hidden md:inline truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#717973]">expand_more</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0e241c] rounded-2xl shadow-xl border border-[#c1c8c2]/40 dark:border-[#2b694d]/40 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-[#efeee9] dark:border-[#173328] flex items-center gap-2.5">
                      <UserAvatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="md"
                        borderClassName="border-2 border-[#b0f1cc]"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-[#012d1d] dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-[#717973] truncate">{user.email || user.location.split(',')[0]}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenEditProfile();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f5f4ef] dark:hover:bg-[#11281f] text-[#1b1c19] dark:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#2b694d] dark:text-[#b0f1cc]">photo_camera</span>
                      <span>Cambiar foto y perfil</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('mi-estudio');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f5f4ef] dark:hover:bg-[#11281f] text-[#1b1c19] dark:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">dashboard</span>
                      <span>{t('nav.mi_estudio')}</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('mensajes');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#f5f4ef] dark:hover:bg-[#11281f] text-[#1b1c19] dark:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      <span>Mensajes y Solicitudes</span>
                    </button>

                    <div className="border-t border-[#efeee9] dark:border-[#173328] my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#ffdad6] dark:hover:bg-[#4a0715] text-[#ba1a1a] dark:text-[#ffb4ab] flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>{t('nav.cerrar_sesion')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs md:text-sm font-semibold text-[#012d1d] dark:text-white hover:bg-[#efeee9] dark:hover:bg-[#112920] px-3 py-2 rounded-full transition-colors cursor-pointer"
              >
                {t('nav.iniciar_sesion')}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="hidden sm:inline-flex text-xs md:text-sm font-semibold text-[#012d1d] dark:text-[#b0f1cc] bg-[#f5f4ef] dark:bg-[#112920] hover:bg-[#e9e8e3] dark:hover:bg-[#17382c] border border-[#c1c8c2]/60 dark:border-[#2b694d]/40 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
              >
                {t('nav.registrarse')}
              </button>
            </div>
          )}

          {/* Role CTA Button: Publicar Prenda / Mi Taller / Admin */}
          {userRole === 'profesional' ? (
            <button
              onClick={() => onNavigate('mi-estudio')}
              className="text-xs md:text-sm font-semibold bg-[#012d1d] text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#1b4332] active:scale-95 transition-all shadow-[0_4px_12px_rgba(1,45,29,0.15)] flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">design_services</span>
              <span>Mi Taller</span>
            </button>
          ) : userRole === 'admin' ? (
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs md:text-sm font-semibold bg-[#ba1a1a] text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#93000a] active:scale-95 transition-all shadow-[0_4px_12px_rgba(186,26,26,0.2)] flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Panel Admin</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('publicar-prenda')}
              className="text-xs md:text-sm font-semibold bg-[#012d1d] text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#1b4332] active:scale-95 transition-all shadow-[0_4px_12px_rgba(1,45,29,0.15)] flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>{t('nav.publicar')}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#012d1d] dark:text-white hover:bg-[#efeee9] dark:hover:bg-[#112920] rounded-lg transition-colors ml-1 cursor-pointer"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full bg-[#faf9f4] dark:bg-[#071510] border-b border-[#c1c8c2]/50 dark:border-[#2b694d]/40 shadow-2xl p-4 flex flex-col gap-2 z-40 animate-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                item.isActive
                  ? 'bg-[#b0f1cc] text-[#002113] font-bold'
                  : 'text-[#1b1c19] dark:text-white hover:bg-[#efeee9] dark:hover:bg-[#112920]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-[#2b694d] dark:text-[#b0f1cc]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="material-symbols-outlined text-sm text-[#717973]">chevron_right</span>
            </button>
          ))}
          <div className="pt-2 border-t border-[#c1c8c2]/40 dark:border-[#2b694d]/30 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenSearch();
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-xs font-semibold px-4 py-2.5 rounded-xl text-[#012d1d] dark:text-[#b0f1cc] bg-[#f5f4ef] dark:bg-[#112920] flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>{t('nav.buscar')}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
