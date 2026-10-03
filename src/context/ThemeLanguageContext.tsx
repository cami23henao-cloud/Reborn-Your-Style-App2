import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';
export type ThemeMode = 'light' | 'dark';

interface ThemeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  es: {
    // Navigation
    'nav.inicio': 'Inicio',
    'nav.catalogo': 'Catálogo',
    'nav.tutoriales': 'Tutoriales',
    'nav.ayuda': 'Centro de Ayuda',
    'nav.perfil': 'Perfil',
    'nav.servicios': 'Servicios',
    'nav.costureros': 'Costureros',
    'nav.iniciar_sesion': 'Iniciar sesión',
    'nav.registrarse': 'Registrarse',
    'nav.mi_estudio': 'Mi Estudio',
    'nav.cerrar_sesion': 'Cerrar sesión',
    'nav.publicar': 'Publicar Prenda',
    'nav.buscar': 'Buscar prendas, talleres o técnicas...',
    'nav.modo_cliente': 'Modo Cliente',
    'nav.modo_taller': 'Modo Taller',
    'nav.cambiar_tema': 'Cambiar a modo oscuro / claro',
    'nav.cambiar_idioma': 'Cambiar idioma (ES / EN)',

    // Hero
    'hero.badge': 'Plataforma de Suprareciclaje y Moda Circular en Colombia',
    'hero.title_pre': 'Dale una nueva vida a tu ropa con ',
    'hero.title_highlight': 'estilo y talento local',
    'hero.desc': 'Transforma, intercambia y rediseña tus prendas olvidadas. Conecta con modistas, artesanos y diseñadores de suprareciclaje textil en toda Colombia.',
    'hero.btn_costurero': 'Encuentra tu costurero',
    'hero.btn_publicar': 'Publicar prenda',
    'hero.btn_explorar': 'Explorar catálogos',
    'hero.card_title': 'Transformación Textil Sostenible',
    'hero.card_desc': 'Prendas intervenidas con técnicas de suprareciclaje',
    'hero.btn_tecnicas': 'Ver técnicas',

    // Home Sections
    'home.categories_title': 'Explora por Categoría Textil',
    'home.categories_sub': 'Prendas para Suprareciclaje',
    'home.categories_all': 'Ver todos los catálogos',
    'home.wardrobe_badge': 'Espacio Personal y Privado',
    'home.wardrobe_title': 'Tu Armario de Suprareciclaje',
    'home.wardrobe_link': 'Acceder a mi perfil',
    'home.how_badge': 'Proceso Circular',
    'home.how_title': '¿Cómo funciona Reborn Your Style?',

    // Garment detail
    'detail.talla': 'Talla',
    'detail.color': 'Color',
    'detail.ubicacion': 'Ubicación',
    'detail.valor': 'Presupuesto / Valor',
    'detail.descripcion': 'Descripción de la prenda',
    'detail.transformacion': 'Transformación propuesta o upcycling deseado',
    'detail.publicado_por': 'Publicado por',
    'detail.iniciar_conversacion': 'Iniciar conversación sobre esta prenda',
    'detail.encontrar_costurero': 'Encontrar costurero asignado',
    'detail.costurero_asignado': 'Costurero / Diseñador asignado',

    // Modals & General
    'common.cerrar': 'Cerrar',
    'common.guardar': 'Guardar',
    'common.cancelar': 'Cancelar',
    'common.volver': 'Volver',
    'common.continuar': 'Continuar',
  },
  en: {
    // Navigation
    'nav.inicio': 'Home',
    'nav.catalogo': 'Catalog',
    'nav.tutoriales': 'Tutorials',
    'nav.ayuda': 'Help Center',
    'nav.perfil': 'Profile',
    'nav.servicios': 'Services',
    'nav.costureros': 'Tailors',
    'nav.iniciar_sesion': 'Sign in',
    'nav.registrarse': 'Register',
    'nav.mi_estudio': 'My Studio',
    'nav.cerrar_sesion': 'Log out',
    'nav.publicar': 'Post Garment',
    'nav.buscar': 'Search garments, workshops or techniques...',
    'nav.modo_cliente': 'Client Mode',
    'nav.modo_taller': 'Workshop Mode',
    'nav.cambiar_tema': 'Toggle dark / light mode',
    'nav.cambiar_idioma': 'Switch language (ES / EN)',

    // Hero
    'hero.badge': 'Upcycling and Circular Fashion Platform in Colombia',
    'hero.title_pre': 'Give a new life to your clothes with ',
    'hero.title_highlight': 'style and local talent',
    'hero.desc': 'Transform, exchange and redesign your forgotten garments. Connect with tailors, artisans and upcycling designers across Colombia.',
    'hero.btn_costurero': 'Find your tailor',
    'hero.btn_publicar': 'Post garment',
    'hero.btn_explorar': 'Explore catalogs',
    'hero.card_title': 'Sustainable Textile Transformation',
    'hero.card_desc': 'Garments redesigned with upcycling techniques',
    'hero.btn_tecnicas': 'View techniques',

    // Home Sections
    'home.categories_title': 'Explore by Textile Category',
    'home.categories_sub': 'Garments for Upcycling',
    'home.categories_all': 'View all catalogs',
    'home.wardrobe_badge': 'Personal & Private Space',
    'home.wardrobe_title': 'Your Upcycling Wardrobe',
    'home.wardrobe_link': 'Go to my profile',
    'home.how_badge': 'Circular Process',
    'home.how_title': 'How does Reborn Your Style work?',

    // Garment detail
    'detail.talla': 'Size',
    'detail.color': 'Color',
    'detail.ubicacion': 'Location',
    'detail.valor': 'Budget / Price',
    'detail.descripcion': 'Garment description',
    'detail.transformacion': 'Proposed redesign or requested upcycling',
    'detail.publicado_por': 'Published by',
    'detail.iniciar_conversacion': 'Start conversation about this garment',
    'detail.encontrar_costurero': 'Find assigned tailor',
    'detail.costurero_asignado': 'Assigned Tailor / Designer',

    // Modals & General
    'common.cerrar': 'Close',
    'common.guardar': 'Save',
    'common.cancelar': 'Cancel',
    'common.volver': 'Back',
    'common.continuar': 'Continue',
  }
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('reborn_lang');
      return saved === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('reborn_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document
  useEffect(() => {
    try {
      localStorage.setItem('reborn_theme', theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage', e);
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist language
  useEffect(() => {
    try {
      localStorage.setItem('reborn_lang', language);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const setTheme = (mode: ThemeMode) => setThemeState(mode);

  const t = (key: string): string => {
    const dict = DICTIONARY[language] || DICTIONARY.es;
    return dict[key] || DICTIONARY.es[key] || key;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
