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
  t: (key: string, fallback?: string) => string;
  tCategory: (categoryName: string) => string;
}

const CATEGORY_MAP: Record<string, { es: string; en: string }> = {
  camisas: { es: 'Camisas', en: 'Shirts' },
  blusas: { es: 'Blusas', en: 'Blouses' },
  pantalones: { es: 'Pantalones', en: 'Pants' },
  vestidos: { es: 'Vestidos', en: 'Dresses' },
  bolsos: { es: 'Bolsos', en: 'Bags' },
  chaquetas: { es: 'Chaquetas', en: 'Jackets' },
  shorts: { es: 'Shorts', en: 'Shorts' },
  sueteres: { es: 'Suéteres', en: 'Sweaters' },
  'gorras y sombreros': { es: 'Gorras y Sombreros', en: 'Caps & Hats' },
  mochilas: { es: 'Mochilas', en: 'Backpacks' },
  'calzones y ropa íntima': { es: 'Calzones y Ropa Íntima', en: 'Underwear & Intimates' },
  accesorios: { es: 'Accesorios', en: 'Accessories' },
  'trajes de baño': { es: 'Trajes de Baño', en: 'Swimwear' },
  medias: { es: 'Medias', en: 'Socks & Hosiery' },
  ropa: { es: 'Ropa', en: 'Clothing' },
  'otras prendas': { es: 'Otras Prendas', en: 'Other Garments' },
};

const DICTIONARY: Record<Language, Record<string, string>> = {
  es: {
    // Top Navigation
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
    'nav.mensajes': 'Mensajes y Solicitudes',
    'nav.cambiar_foto': 'Cambiar foto y perfil',

    // Hero Section
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
    'home.wardrobe_link': 'Acceder a mi estudio',
    'home.card1_title': 'Inventario Protegido',
    'home.card1_desc': 'Registra tus prendas en desuso, fotos de detalle y solicitudes de transformación dentro de tu espacio privado y confidencial.',
    'home.card1_btn': 'Subir nueva prenda →',
    'home.card2_title': 'Interacción Directa',
    'home.card2_desc': 'Comunícate directamente con costureros y artesanos para acordar presupuestos, entregas y tiempos de transformación.',
    'home.card2_btn': 'Mis mensajes y solicitudes →',
    'home.card3_title': 'Impacto Ambiental Medible',
    'home.card3_desc': 'Calcula los litros de agua y kilogramos de CO2 ahorrados en cada transformación textil realizada en territorio colombiano.',
    'home.card3_btn': 'Ver guía de sostenibilidad →',
    'home.how_badge': 'Proceso Circular',
    'home.how_title': '¿Cómo funciona Reborn Your Style?',
    'home.step1_title': 'Sube tu prenda o proyecto',
    'home.step1_desc': 'Comparte la prenda que deseas transformar o donar con fotos y el estilo que imaginas.',
    'home.step2_title': 'Conecta con un costurero',
    'home.step2_desc': 'Elige al artesano ideal por ubicación, especialidad y valoraciones de la comunidad.',
    'home.step3_title': 'Acuerda el diseño y presupuesto',
    'home.step3_desc': 'Conversa por chat directo para definir los detalles de patronaje y confección.',
    'home.step4_title': 'Estrena una pieza única',
    'home.step4_desc': 'Recibe tu prenda renovada y reduce el desperdicio textil con moda responsable.',

    // Catalog & Category Views
    'catalog.title': 'Catálogos por Categoría',
    'catalog.desc': 'Cada botón abre una sección exclusiva con productos que pertenecen únicamente a esa categoría. Haz clic en la categoría que deseas explorar para ver sus prendas disponibles.',
    'catalog.search_placeholder': 'Buscar categoría (ej. Bolsos, Calzones, Pantalones...)',
    'catalog.shortcuts': 'Accesos directos:',
    'catalog.garments_count': 'prendas',
    'catalog.garment_count': 'prenda',
    'catalog.ideas_title': 'Ideas de Upcycling:',
    'catalog.view_btn': 'Ver prendas en esta categoría →',
    'category.back': '← Volver a todos los catálogos',
    'category.search_in': 'Buscar en',
    'category.all_modalities': 'Todas las modalidades',
    'category.all_departments': 'Todos los departamentos',
    'category.sort_recent': 'Más recientes',
    'category.sort_low_price': 'Menor presupuesto',
    'category.sort_high_price': 'Mayor presupuesto',
    'category.clear_filters': 'Limpiar filtros',
    'category.empty_title': 'No hay prendas disponibles en esta categoría',
    'category.empty_desc': 'Sé el primero en compartir o solicitar un suprareciclaje para esta categoría.',
    'category.empty_btn': 'Publicar prenda ahora',

    // Tailors / Costureros
    'tailors.badge': 'Red Nacional de Confección',
    'tailors.title': 'Costureros y Diseñadores de Suprareciclaje',
    'tailors.desc': 'Encuentra al profesional textil ideal en tu ciudad o departamento. Modistas expertos listos para transformar tus prendas.',
    'tailors.search_placeholder': 'Buscar por nombre, especialidad o ciudad...',
    'tailors.all_departments': 'Todos los departamentos',
    'tailors.all_specialties': 'Todas las especialidades',
    'tailors.verified': 'Verificado',
    'tailors.experience': 'de experiencia',
    'tailors.rating': 'calificación',
    'tailors.contact_btn': 'Contactar Taller',
    'tailors.request_btn': 'Solicitar Servicio',

    // Garment detail
    'detail.talla': 'Talla',
    'detail.color': 'Color',
    'detail.ubicacion': 'Ubicación',
    'detail.valor': 'Precio / Presupuesto',
    'detail.descripcion': 'Descripción de la prenda',
    'detail.transformacion': 'Transformación propuesta o upcycling deseado',
    'detail.publicado_por': 'Publicado por',
    'detail.iniciar_conversacion': 'Iniciar conversación sobre esta prenda',
    'detail.encontrar_costurero': 'Encontrar costurero',
    'detail.costurero_asignado': 'Costurero / Diseñador asignado',
    'detail.ver_perfil': 'Ver perfil del costurero',

    // Publish Form
    'publish.title': 'Publicar Prenda para Suprareciclaje',
    'publish.desc': 'Sube fotos y detalla la prenda que deseas transformar, intercambiar o vender.',
    'publish.field_photo': 'Fotografía de la Prenda',
    'publish.field_title': 'Título de la Publicación',
    'publish.field_category': 'Categoría Textil',
    'publish.field_condition': 'Estado de la Prenda',
    'publish.field_size': 'Talla',
    'publish.field_color': 'Color Predominante',
    'publish.field_price': 'Presupuesto Estimado o Precio (COP)',
    'publish.field_desc': 'Descripción Detallada',
    'publish.field_mods': 'Transformación o Idea Deseada',
    'publish.btn_submit': 'Publicar Prenda Ahora',

    // Modals & General
    'common.cerrar': 'Cerrar',
    'common.guardar': 'Guardar',
    'common.cancelar': 'Cancelar',
    'common.volver': 'Volver',
    'common.continuar': 'Continuar',
    'common.eliminar': 'Eliminar',
    'common.editar': 'Editar',
    'common.entendido': 'Entendido',

    // Footer
    'footer.brand_desc': 'Plataforma de moda circular, suprareciclaje y confección colaborativa. Conectamos tus prendas con modistas y talleres locales en toda Colombia.',
    'footer.col_explore': 'Explorar Plataforma',
    'footer.col_categories': 'Catálogos de Prendas',
    'footer.col_legal': 'Información y Soporte',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos y Condiciones',
    'footer.sustainability': 'Impacto y Sostenibilidad',
    'footer.contact': 'Contacto y Soporte',
    'footer.rights': 'Todos los derechos reservados.',
  },
  en: {
    // Top Navigation
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
    'nav.mensajes': 'Messages & Requests',
    'nav.cambiar_foto': 'Edit photo & profile',

    // Hero Section
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
    'home.wardrobe_link': 'Go to my studio',
    'home.card1_title': 'Protected Inventory',
    'home.card1_desc': 'Register your unused garments, detailed photos and redesign requests inside your private, confidential space.',
    'home.card1_btn': 'Upload new garment →',
    'home.card2_title': 'Direct Interaction',
    'home.card2_desc': 'Communicate directly with tailors and artisans to agree on budgets, deliveries and transformation timelines.',
    'home.card2_btn': 'My messages & requests →',
    'home.card3_title': 'Measurable Environmental Impact',
    'home.card3_desc': 'Calculate liters of water and kilograms of CO2 saved with every textile redesign made in Colombia.',
    'home.card3_btn': 'View sustainability guide →',
    'home.how_badge': 'Circular Process',
    'home.how_title': 'How does Reborn Your Style work?',
    'home.step1_title': 'Upload your garment or project',
    'home.step1_desc': 'Share the piece you want to redesign or donate with photos and the style you imagine.',
    'home.step2_title': 'Connect with a tailor',
    'home.step2_desc': 'Choose the ideal artisan by location, specialty and community reviews.',
    'home.step3_title': 'Agree on design & budget',
    'home.step3_desc': 'Chat directly to define pattern making, tailoring details and schedule.',
    'home.step4_title': 'Wear a unique piece',
    'home.step4_desc': 'Receive your redesigned garment and reduce textile waste with conscious fashion.',

    // Catalog & Category Views
    'catalog.title': 'Catalogs by Category',
    'catalog.desc': 'Each button opens an exclusive section with items that belong strictly to that category. Click on the category you want to explore to view available garments.',
    'catalog.search_placeholder': 'Search category (e.g. Bags, Pants, Shirts...)',
    'catalog.shortcuts': 'Quick shortcuts:',
    'catalog.garments_count': 'items',
    'catalog.garment_count': 'item',
    'catalog.ideas_title': 'Upcycling Ideas:',
    'catalog.view_btn': 'View garments in this category →',
    'category.back': '← Back to all catalogs',
    'category.search_in': 'Search in',
    'category.all_modalities': 'All modalities',
    'category.all_departments': 'All departments',
    'category.sort_recent': 'Most recent',
    'category.sort_low_price': 'Lowest budget',
    'category.sort_high_price': 'Highest budget',
    'category.clear_filters': 'Clear filters',
    'category.empty_title': 'No garments available in this category',
    'category.empty_desc': 'Be the first to share or request an upcycling project for this category.',
    'category.empty_btn': 'Post garment now',

    // Tailors / Costureros
    'tailors.badge': 'National Tailoring Network',
    'tailors.title': 'Upcycling Tailors & Designers',
    'tailors.desc': 'Find the ideal textile professional in your city or region. Expert tailors ready to transform your garments.',
    'tailors.search_placeholder': 'Search by name, specialty or city...',
    'tailors.all_departments': 'All departments',
    'tailors.all_specialties': 'All specialties',
    'tailors.verified': 'Verified',
    'tailors.experience': 'of experience',
    'tailors.rating': 'rating',
    'tailors.contact_btn': 'Contact Workshop',
    'tailors.request_btn': 'Request Service',

    // Garment detail
    'detail.talla': 'Size',
    'detail.color': 'Color',
    'detail.ubicacion': 'Location',
    'detail.valor': 'Price / Budget',
    'detail.descripcion': 'Garment description',
    'detail.transformacion': 'Proposed redesign or requested upcycling',
    'detail.publicado_por': 'Published by',
    'detail.iniciar_conversacion': 'Start conversation about this garment',
    'detail.encontrar_costurero': 'Find tailor',
    'detail.costurero_asignado': 'Assigned Tailor / Designer',
    'detail.ver_perfil': 'View tailor profile',

    // Publish Form
    'publish.title': 'Post Garment for Upcycling',
    'publish.desc': 'Upload photos and detail the garment you wish to transform, exchange or sell.',
    'publish.field_photo': 'Garment Photo',
    'publish.field_title': 'Listing Title',
    'publish.field_category': 'Textile Category',
    'publish.field_condition': 'Garment Condition',
    'publish.field_size': 'Size',
    'publish.field_color': 'Main Color',
    'publish.field_price': 'Estimated Budget or Price (COP)',
    'publish.field_desc': 'Detailed Description',
    'publish.field_mods': 'Desired Redesign or Upcycling Idea',
    'publish.btn_submit': 'Post Garment Now',

    // Modals & General
    'common.cerrar': 'Close',
    'common.guardar': 'Save',
    'common.cancelar': 'Cancel',
    'common.volver': 'Back',
    'common.continuar': 'Continue',
    'common.eliminar': 'Delete',
    'common.editar': 'Edit',
    'common.entendido': 'Got it',

    // Footer
    'footer.brand_desc': 'Circular fashion, upcycling and collaborative tailoring platform. We connect your garments with local tailors across Colombia.',
    'footer.col_explore': 'Explore Platform',
    'footer.col_categories': 'Garment Catalogs',
    'footer.col_legal': 'Information & Support',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.sustainability': 'Impact & Sustainability',
    'footer.contact': 'Contact & Support',
    'footer.rights': 'All rights reserved.',
  },
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

  const t = (key: string, fallback?: string): string => {
    const dict = DICTIONARY[language] || DICTIONARY.es;
    return dict[key] || fallback || DICTIONARY.es[key] || key;
  };

  const tCategory = (categoryName: string): string => {
    if (!categoryName) return '';
    const key = categoryName.trim().toLowerCase();
    const entry = CATEGORY_MAP[key];
    if (entry) {
      return entry[language] || entry.es;
    }
    return categoryName;
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
        tCategory,
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
