import React, { useState } from 'react';
import { AppView, UserRole, UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';
import { UserAvatar } from './common/UserAvatar';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onOpenSearch();
    }
  };

  // Requested Navigation Items: Quiénes somos, Misión, Visión, Catálogo, Servicios, Tutoriales, Impacto, Contacto
  interface NavItem {
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
    isActive?: boolean;
    priority?: boolean;
  }

  const navItems: NavItem[] =
    userRole === 'admin'
      ? []
      : [
          {
            id: 'quienes-somos',
            label: 'Quiénes somos',
            icon: 'groups',
            onClick: () => onOpenInfoModal?.('quienes-somos'),
          },
          {
            id: 'mision',
            label: 'Misión',
            icon: 'target',
            onClick: () => onOpenInfoModal?.('mision'),
          },
          {
            id: 'vision',
            label: 'Visión',
            icon: 'visibility',
            onClick: () => onOpenInfoModal?.('vision'),
          },
          {
            id: 'catalogo',
            label: 'Catálogo',
            icon: 'inventory_2',
            priority: true,
            isActive: currentView === 'catalogos' || currentView === 'categoria',
            onClick: () => onNavigate('catalogos'),
          },
          {
            id: 'servicios',
            label: 'Servicios',
            icon: 'content_cut',
            priority: true,
            isActive: currentView === 'servicios',
            onClick: () => onNavigate('servicios'),
          },
          {
            id: 'tutoriales',
            label: 'Tutoriales',
            icon: 'school',
            priority: true,
            onClick: () => onOpenInfoModal?.('tutoriales'),
          },
          {
            id: 'impacto',
            label: 'Impacto',
            icon: 'nature_people',
            priority: true,
            onClick: () => onOpenInfoModal?.('sostenibilidad'),
          },
          {
            id: 'contacto',
            label: 'Contacto',
            icon: 'mail',
            priority: true,
            onClick: () => onOpenInfoModal?.('contacto'),
          },
        ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-3 sm:px-6 lg:px-8 h-20 bg-[#faf9f4]/95 backdrop-blur-md shadow-[0_2px_12px_rgba(1,45,29,0.05)] border-b border-[#c1c8c2]/30 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-2 sm:gap-4">
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

        {/* Desktop Navigation Links (Quiénes somos, Misión, Visión, Catálogo, Servicios, Tutoriales, Impacto, Contacto) */}
        {userRole !== 'admin' && (
          <div className="hidden xl:flex items-center gap-1 2xl:gap-1.5 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`text-xs 2xl:text-[13px] font-semibold px-2.5 2xl:px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  item.isActive
                    ? 'text-[#012d1d] font-bold bg-[#efeee9] shadow-xs'
                    : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#efeee9]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Compact Navigation for medium screens (lg to xl) */}
        {userRole !== 'admin' && (
          <div className="hidden lg:flex xl:hidden items-center gap-1 px-1">
            {navItems.filter((i) => i.priority).map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  item.isActive
                    ? 'text-[#012d1d] font-bold bg-[#efeee9]'
                    : 'text-[#414844] hover:text-[#012d1d] hover:bg-[#efeee9]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className="text-xs font-semibold px-2 py-1.5 rounded-lg text-[#414844] hover:text-[#012d1d] hover:bg-[#efeee9] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Más</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>

              {isMoreDropdownOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#c1c8c2]/50 py-1.5 z-50 text-xs animate-in fade-in">
                  {navItems.filter((i) => !i.priority).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.onClick();
                        setIsMoreDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[#414844] hover:text-[#012d1d] hover:bg-[#f5f4ef] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-[#2b694d]">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side Actions (Search, Login Button, Role CTA, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#414844] hover:text-[#012d1d] flex items-center justify-center"
            title="Buscar"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
          <input
            type="text"
            placeholder="Buscar prenda o artesano..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClick={onOpenSearch}
            className="pl-9 pr-4 py-2 rounded-full border border-[#c1c8c2]/80 bg-[#f5f4ef] focus:bg-white focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] text-xs text-[#1b1c19] outline-none transition-all w-36 lg:w-48 placeholder:text-[#717973]"
          />
        </form>

        {/* Only show private shortcuts if user is authenticated */}
        {isLoggedIn && (
          <>
            {/* User Role Badge (Immutable per user account) */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#efeee9] text-[#2b694d] border border-[#c1c8c2]/50 select-none"
              title="Rol asignado a tu cuenta"
            >
              <span className="material-symbols-outlined text-sm">
                {userRole === 'admin' ? 'admin_panel_settings' : userRole === 'profesional' ? 'handyman' : 'person'}
              </span>
              <span>{userRole === 'admin' ? 'Modo Admin' : userRole === 'profesional' ? 'Modo Taller' : 'Modo Cliente'}</span>
            </div>

            {/* Studio / Dashboard Quick Access */}
            <button
              onClick={() => onNavigate('mi-estudio')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                currentView === 'mi-estudio'
                  ? 'bg-[#b0f1cc] text-[#002113] font-bold'
                  : 'text-[#012d1d] hover:bg-[#efeee9]'
              }`}
              title="Ir a Mi Estudio / Dashboard"
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span className="hidden sm:inline">Mi Estudio</span>
            </button>

            {/* Messages Shortcut */}
            <button
              onClick={() => onNavigate('mensajes')}
              className={`p-2 rounded-full text-[#414844] hover:text-[#012d1d] hover:bg-[#efeee9] transition-colors relative ${
                currentView === 'mensajes' ? 'bg-[#b0f1cc] text-[#002113]' : ''
              }`}
              title="Mensajes"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
            </button>
          </>
        )}

        {/* Auth / User Profile */}
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#efeee9] transition-colors border border-[#c1c8c2]/50"
            >
              <UserAvatar
                src={user.avatarUrl}
                name={user.name}
                size="xs"
                borderClassName="border border-[#2b694d]"
              />
              <span className="text-xs font-semibold text-[#012d1d] hidden md:inline truncate max-w-[90px]">
                {user.name.split(' ')[0]}
              </span>
              <span className="material-symbols-outlined text-sm text-[#717973]">expand_more</span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#c1c8c2]/40 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-[#efeee9] flex items-center gap-2.5">
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="md"
                    borderClassName="border-2 border-[#b0f1cc]"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-[#012d1d] truncate">{user.name}</p>
                    <p className="text-[10px] text-[#717973] truncate">{user.email || user.location.split(',')[0]}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenEditProfile();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#f5f4ef] text-[#1b1c19] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-[#2b694d]">photo_camera</span>
                  <span>Cambiar foto y perfil</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('mi-estudio');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#f5f4ef] text-[#1b1c19] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">dashboard</span>
                  <span>Mi Estudio Textil</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('mensajes');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#f5f4ef] text-[#1b1c19] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Mensajes y Solicitudes</span>
                </button>

                <div className="px-4 py-1.5 text-[10px] text-[#717973] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#2b694d]">verified_user</span>
                  <span>Rol: {userRole === 'admin' ? 'Administrador' : userRole === 'profesional' ? 'Modista / Taller' : 'Cliente'}</span>
                </div>

                <div className="border-t border-[#efeee9] my-1"></div>

                <button
                  onClick={() => {
                    onLogout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs md:text-sm font-semibold text-[#012d1d] hover:bg-[#efeee9] px-3 py-2 rounded-full transition-colors"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="hidden sm:inline-flex text-xs md:text-sm font-semibold text-[#012d1d] bg-[#f5f4ef] hover:bg-[#e9e8e3] border border-[#c1c8c2]/60 px-3.5 py-2 rounded-full transition-colors"
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Role-specific CTA Button */}
        {userRole === 'profesional' ? (
          <button
            onClick={() => onNavigate('mi-estudio')}
            className="text-xs md:text-sm font-semibold bg-[#012d1d] text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#1b4332] active:scale-95 transition-all shadow-[0_4px_12px_rgba(1,45,29,0.15)] flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-base">design_services</span>
            <span>Mi Taller</span>
          </button>
        ) : userRole === 'admin' ? (
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs md:text-sm font-semibold bg-[#ba1a1a] text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#93000a] active:scale-95 transition-all shadow-[0_4px_12px_rgba(186,26,26,0.2)] flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>Panel Admin</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('publicar-prenda')}
            className="text-xs md:text-sm font-semibold bg-[#012d1d] text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#1b4332] active:scale-95 transition-all shadow-[0_4px_12px_rgba(1,45,29,0.15)] flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Publicar prenda</span>
          </button>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-[#012d1d] hover:bg-[#efeee9] rounded-lg transition-colors ml-1"
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
        <div className="lg:hidden fixed top-20 left-0 w-full bg-[#faf9f4] border-b border-[#c1c8c2]/50 shadow-2xl p-4 flex flex-col gap-1.5 z-40 animate-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                setIsMobileMenuOpen(false);
              }}
              className={`text-left text-sm font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                item.isActive
                  ? 'bg-[#b0f1cc] text-[#002113] font-bold'
                  : 'text-[#1b1c19] hover:bg-[#efeee9]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-base text-[#2b694d]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="material-symbols-outlined text-sm text-[#717973]">chevron_right</span>
            </button>
          ))}
          <div className="pt-2 border-t border-[#c1c8c2]/40 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenSearch();
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-xs font-semibold px-4 py-2.5 rounded-xl text-[#012d1d] bg-[#f5f4ef] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>Buscar prendas o artesanos</span>
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    onOpenEditProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-semibold px-4 py-2.5 rounded-xl text-[#012d1d] bg-[#f5f4ef] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-[#2b694d]">photo_camera</span>
                  <span>Cambiar foto y datos de perfil</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('mi-estudio');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-semibold px-4 py-2.5 rounded-xl text-[#012d1d] bg-[#f5f4ef] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">dashboard</span>
                  <span>Mi Estudio Textil</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('mensajes');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-semibold px-4 py-2.5 rounded-xl text-[#012d1d] bg-[#f5f4ef] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Mensajes y Solicitudes</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-xs font-semibold px-4 py-2.5 rounded-xl text-[#ba1a1a] bg-[#ffdad6]/40 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-xs font-semibold py-2.5 px-4 rounded-xl bg-[#012d1d] text-white flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Iniciar sesión / Registrarse</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
