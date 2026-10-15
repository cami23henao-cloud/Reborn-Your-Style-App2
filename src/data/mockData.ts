import {
  Professional,
  GarmentProject,
  ServiceItem,
  ServiceRequest,
  InspirationItem,
  ChatConversation,
  UserProfile
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-alex-moreno',
  name: 'Álex Moreno',
  username: '@alex_reborn',
  email: 'alex.moreno@rebornyourstyle.co',
  avatarUrl: '', // Neutral space: user has not uploaded a photo yet
  bio: 'Apasionado por la moda circular, el denim vintage y el suprareciclaje textil en Medellín. Dándole una segunda vida a prendas con historia.',
  role: 'cliente',
  location: 'Medellín, Antioquia, Colombia',
  department: 'Antioquia',
  municipality: 'Medellín',
  phone: '+57 312 456 7890',
  instagram: '@alex.reborn',
  joinedDate: 'Marzo 2025',
  publishedCount: 4,
  upcycledCount: 6,
  waterSavedLiters: 16200,
  co2SavedKg: 24.8
};

export const INITIAL_USER_PROFILE = INITIAL_USER;

export const GUEST_USER_PROFILE: UserProfile = {
  id: 'guest',
  name: '',
  username: '',
  email: '',
  avatarUrl: '',
  bio: '',
  role: 'cliente',
  location: '',
  department: '',
  municipality: '',
  phone: '',
  instagram: '',
  joinedDate: '',
  publishedCount: 0,
  upcycledCount: 0,
  waterSavedLiters: 0,
  co2SavedKg: 0
};

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'usr-demo-costurera',
    name: 'Taller Demo Sostenible (Costurera)',
    specialty: 'Upcycling Creativo y Alta Modistería',
    category: 'Upcycling Estructural',
    rating: 5.0,
    reviewsCount: 18,
    location: 'El Poblado, Medellín, Antioquia, Colombia',
    address: 'Carrera 43A # 1-50',
    distanceKm: 0.5,
    startingPrice: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    bio: 'Taller modelo oficial para pruebas y demostraciones del equipo Reborn Your Style. Confección artesanal, rediseño de prendas denim y patronaje sostenible.',
    tags: ['Upcycling', 'Alta Modistería', 'Denim', 'Arreglos'],
    isTopSeller: true,
    portfolio: [
      {
        id: 'p-demo-1',
        title: 'Chaqueta Denim Upcycling Floral',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
      }
    ],
    reviews: [
      {
        id: 'r-demo-1',
        author: 'Cliente Demo',
        rating: 5,
        comment: 'Excelente confección y atención inmediata en el chat. ¡100% recomendado!',
        date: 'Ayer',
      }
    ],
    services: [
      {
        id: 'srv-demo-1',
        title: 'Upcycling y Parches en Chaqueta Denim',
        description: 'Reconstrucción con telas recuperadas, refuerzo estructural y bordado decorativo.',
        startingPrice: 35000,
        priceRange: '$35.000 - $50.000 COP',
        deliveryTime: '2 a 3 días hábiles',
        icon: 'styler',
      },
      {
        id: 'srv-demo-2',
        title: 'Ajuste Fino de Cintura y Dobladillo Invisible',
        description: 'Ajuste ergonómico en pantalones o faldas sin alterar el diseño original.',
        startingPrice: 20000,
        priceRange: '$20.000 COP',
        deliveryTime: '24 a 48 horas',
        icon: 'content_cut',
      }
    ]
  },
  {
    id: 'dona-marta',
    name: 'Doña Marta',
    specialty: 'Especialista Textil y Modistería Ancestral',
    category: 'Bordado',
    rating: 4.9,
    reviewsCount: 124,
    location: 'Buenos Aires, Medellín, Antioquia, Colombia',
    distanceKm: 1.5,
    startingPrice: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    bio: 'Con más de 20 años de experiencia en la industria textil, me dedico a transformar prendas olvidadas en piezas únicas mediante bordado a mano, parches decorativos y ajustes de alta costura.',
    tags: ['Bordado Creativo', 'Teñido Natural', 'Parches Visibles', 'Sastrería Clásica'],
    isTopSeller: true,
    portfolio: [
      {
        id: 'p5',
        title: 'Chaqueta Bordada de Flores Silvestres',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'p6',
        title: 'Vestido Lino con Parches y Encajes Antiguos',
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
      }
    ],
    reviews: [
      {
        id: 'r5',
        author: 'Ana María S.',
        rating: 5,
        comment: 'Doña Marta tiene manos mágicas. El bordado en mi chaqueta quedó espectacular, superó todas mis expectativas.',
        date: 'Hace 3 días'
      },
      {
        id: 'r6',
        author: 'Esteban Q.',
        rating: 5,
        comment: 'Excelente atención, muy atenta a los detalles y entregó antes de tiempo.',
        date: 'Hace 1 semana'
      }
    ]
  },
  {
    id: 'sofia-m',
    name: 'Sofía Montoya',
    specialty: 'Bordado Creativo y Sashiko Japonés',
    category: 'Bordado',
    rating: 4.9,
    reviewsCount: 142,
    location: 'Laureles, Medellín, Antioquia, Colombia',
    distanceKm: 1.2,
    startingPrice: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Especialista en bordado botánico a mano y técnica japonesa Sashiko para transformar prendas denim y lino en obras de arte duraderas.',
    tags: ['Denim', 'Hilos orgánicos', 'Bordado a mano', 'Reparación visible'],
    isTopSeller: true,
    portfolio: [
      {
        id: 'p1',
        title: 'Chaqueta Flora Colombiana',
        imageUrl: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'p2',
        title: 'Bordado de Espalda en Jeans Vintage',
        imageUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600&auto=format&fit=crop&q=80',
      }
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Carolina G.',
        rating: 5,
        comment: 'Sofía convirtió mi chaqueta vieja en una joya única. ¡El bordado es impecable!',
        date: 'Hace 3 días'
      },
      {
        id: 'r2',
        author: 'Mateo R.',
        rating: 5,
        comment: 'Puntual, amable y con un talento increíble para el upcycling.',
        date: 'Hace 1 semana'
      }
    ]
  },
  {
    id: 'carlos-r',
    name: 'Carlos Restrepo',
    specialty: 'Pintura Textil y Customización Urbana',
    category: 'Pintura Textil',
    rating: 4.8,
    reviewsCount: 89,
    location: 'El Poblado, Medellín, Antioquia, Colombia',
    distanceKm: 2.5,
    startingPrice: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Artista visual e ilustrador. Utilizo acrílicos textiles ecológicos y tintas termo-fijadas para crear chaquetas y prendas intervenidas con arte.',
    tags: ['Acrílicos eco', 'Algodón', 'Ilustración urbana', 'Chaquetas'],
    portfolio: [
      {
        id: 'p3',
        title: 'Mural Textil Orquídeas',
        imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
      }
    ],
    reviews: [
      {
        id: 'r3',
        author: 'Felipe V.',
        rating: 5,
        comment: 'La ilustración quedó viva y no se despinta con las lavadas. 100% recomendado.',
        date: 'Hace 2 semanas'
      }
    ]
  },
  {
    id: 'taller-verde',
    name: 'Taller Verde & Co.',
    specialty: 'Upcycling Estructural y Sastrería Contemporánea',
    category: 'Upcycling Estructural',
    rating: 5.0,
    reviewsCount: 215,
    location: 'Chapinero, Bogotá D.C., Colombia',
    distanceKm: 0.8,
    startingPrice: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    bio: 'Laboratorio de diseño donde desarmamos y reensamblamos piezas antiguas en nuevos patrones contemporáneos: sacos, blazers y faldas.',
    tags: ['Sastrería', 'Lana', 'Patchwork', 'Estructural'],
    isTopSeller: true,
    portfolio: [
      {
        id: 'p4',
        title: 'Blazer Reconstruido de Pantalones',
        imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
      }
    ],
    reviews: [
      {
        id: 'r4',
        author: 'Valentina P.',
        rating: 5,
        comment: 'Transformaron tres pantalones de mi abuelo en una falda estructurada maravillosa.',
        date: 'Hace 4 días'
      }
    ]
  },
  {
    id: 'studio-alba',
    name: 'Studio Alba Textil',
    specialty: 'Patchwork Contemporáneo y Tintes Botánicos',
    category: 'Teñido',
    rating: 4.9,
    reviewsCount: 68,
    location: 'Cali, Valle del Cauca, Colombia',
    distanceKm: 3.4,
    startingPrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    bio: 'Laboratorio de tintes extraídos de plantas locales, aguacate, cúrcuma y remodelación mediante técnicas shibori y sashiko.',
    tags: ['Teñido Botánico', 'Shibori', 'Parches Japoneses'],
    portfolio: [
      {
        id: 'p7',
        title: 'Seda Vintage Botánica',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
      }
    ],
    reviews: [
      {
        id: 'r7',
        author: 'Mariana H.',
        rating: 5,
        comment: 'El color natural que le dieron a mi vestido de lino es insuperable.',
        date: 'Ayer'
      }
    ]
  }
];

// Catálogo depurado y limpio para publicaciones reales de usuarios y costureros
export const INITIAL_GARMENTS: GarmentProject[] = [];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 's1',
    title: 'Ajuste de Talla y Entalle',
    description: 'Reducción o ampliación de prendas estructuradas conservando la caída original.',
    startingPrice: 15000,
    icon: 'content_cut'
  },
  {
    id: 's2',
    title: 'Bordado Personalizado Botánico',
    description: 'Diseños a mano para cubrir manchas, agujeros o renovar completamente el estilo.',
    startingPrice: 25000,
    icon: 'draw'
  },
  {
    id: 's3',
    title: 'Transformación Estructural (Upcycling)',
    description: 'Convertir pantalones en faldas, camisas en bolsos o mezclar varias prendas.',
    startingPrice: 40000,
    icon: 'styler'
  },
  {
    id: 's4',
    title: 'Teñido y Restauración de Color',
    description: 'Baños de color con tintes botánicos o reactivos para devolver la vida al textil.',
    startingPrice: 22000,
    icon: 'palette'
  }
];

export const INITIAL_INSPIRATIONS: InspirationItem[] = [
  {
    id: 'ins-1',
    title: 'Chaqueta Patchwork Denim Reborn',
    creatorName: 'Studio Alba Textil',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    category: 'Chaquetas',
    description: 'Reconstrucción con retazos de 4 pantalones vaqueros distintos y costuras doradas en contraste.',
    tags: ['Patchwork', 'Denim', 'Sashiko'],
    imageUrl: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600&auto=format&fit=crop&q=80',
    likes: 84,
    isLiked: false,
    isSaved: true
  },
  {
    id: 'ins-2',
    title: 'Conjunto Seda Vintage & Botánica',
    creatorName: 'Doña Marta',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    category: 'Vestidos',
    description: 'Transformación de vestido de novia de los años 80 en conjunto moderno de 2 piezas teñido con cúrcuma y aguacate.',
    tags: ['Seda', 'Teñido Natural', 'Dos Piezas'],
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    likes: 112,
    isLiked: false,
    isSaved: false
  },
  {
    id: 'ins-3',
    title: 'Bordado Botánico en Denim',
    creatorName: 'Sofía Montoya',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    category: 'Bordados',
    description: 'Bordado artesanal de orquídeas y flores silvestres colombianas sobre bolsillos de chaqueta recuperada.',
    tags: ['Bordado', 'Flores', 'Denim'],
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    likes: 95,
    isLiked: false,
    isSaved: true
  },
  {
    id: 'ins-4',
    title: 'Blazer Desestructurado de Paño',
    creatorName: 'Taller Verde & Co.',
    creatorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    category: 'Chaquetas',
    description: 'Saco oversize adaptado a silueta cropped contemporánea con bolsillos añadidos de cuero sintético recuperado.',
    tags: ['Sastrería', 'Cropped', 'Oversize'],
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
    likes: 67,
    isLiked: false,
    isSaved: false
  }
];

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ-4819',
    clientName: 'Álex Moreno',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    garmentTitle: 'Chaqueta Vaquera Levi\'s',
    serviceType: 'Upcycling Creativo: Bordado Personalizado',
    budget: 45000,
    status: 'Pendiente',
    createdAt: 'Hoy, 10:30 AM',
    description: 'Añadir detalles florales bordados a mano en la espalda y puños, utilizando hilos de algodón orgánico remanentes.'
  },
  {
    id: 'REQ-3920',
    clientName: 'Mariana Ríos',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    garmentTitle: 'Vestido Lino Verde',
    serviceType: 'Ajuste de Talla y Entalle Estructural',
    budget: 35000,
    status: 'En Proceso',
    createdAt: 'Ayer, 04:15 PM',
    description: 'Ajuste de cintura y ruedo para adaptar a talla S.'
  },
  {
    id: 'REQ-2811',
    clientName: 'Carlos Gómez',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    garmentTitle: 'Pantalón Denim Clásico',
    serviceType: 'Técnica Sashiko y Parches',
    budget: 30000,
    status: 'Completada',
    createdAt: 'Hace 3 días',
    description: 'Reforzar rodillas desgastadas con parches internos y puntadas Sashiko en hilo blanco.'
  }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [];

export const AVATAR_PRESETS: { id: string; name: string; url: string }[] = [];

