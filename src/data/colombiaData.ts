export interface ColombiaDepartment {
  id: string;
  name: string;
  capital: string;
  municipalities: string[];
}

export const COLOMBIA_DEPARTMENTS: ColombiaDepartment[] = [
  {
    id: 'antioquia',
    name: 'Antioquia',
    capital: 'Medellín',
    municipalities: [
      'Medellín',
      'Envigado',
      'Bello',
      'Itagüí',
      'Sabaneta',
      'Rionegro',
      'La Ceja',
      'Marinilla',
      'Guarne',
      'Copacabana',
      'Girardota',
      'Caldas',
      'Apartadó',
      'Turbo',
      'Caucasia',
      'Santa Fe de Antioquia',
      'Jericó',
      'Jardín',
      'Guatapé',
      'Yarumal',
      'Sonsón',
      'El Retiro',
      'Carmen de Viboral'
    ]
  },
  {
    id: 'bogota',
    name: 'Bogotá D.C.',
    capital: 'Bogotá D.C.',
    municipalities: [
      'Bogotá D.C.',
      'Usaquén',
      'Chapinero',
      'Santa Fe',
      'San Cristóbal',
      'Usme',
      'Tunjuelito',
      'Bosa',
      'Kennedy',
      'Fontibón',
      'Engativá',
      'Suba',
      'Barrios Unidos',
      'Teusaquillo',
      'Los Mártires',
      'Antonio Nariño',
      'Puente Aranda',
      'La Candelaria',
      'Rafael Uribe Uribe',
      'Ciudad Bolívar',
      'Sumapaz'
    ]
  },
  {
    id: 'valle-del-cauca',
    name: 'Valle del Cauca',
    capital: 'Cali',
    municipalities: [
      'Cali',
      'Palmira',
      'Buenaventura',
      'Tuluá',
      'Buga (Guadalajara de Buga)',
      'Cartago',
      'Jamundí',
      'Yumbo',
      'Candelaria',
      'Pradera',
      'Florida',
      'Sevilla',
      'Zarzal',
      'Roldanillo',
      'Ginebra',
      'Guacarí',
      'Dagua',
      'Calima - El Darién',
      'Caicedonia'
    ]
  },
  {
    id: 'atlantico',
    name: 'Atlántico',
    capital: 'Barranquilla',
    municipalities: [
      'Barranquilla',
      'Soledad',
      'Malambo',
      'Puerto Colombia',
      'Sabanalarga',
      'Baranoa',
      'Galapa',
      'Palmar de Varela',
      'Santo Tomás',
      'Tubará',
      'Usiacurí'
    ]
  },
  {
    id: 'bolivar',
    name: 'Bolívar',
    capital: 'Cartagena',
    municipalities: [
      'Cartagena de Indias',
      'Magangué',
      'El Carmen de Bolívar',
      'Turbaco',
      'Arjona',
      'Mompox (Santa Cruz de Mompox)',
      'San Juan Nepomuceno',
      'Turbana',
      'Calamar',
      'San Jacinto'
    ]
  },
  {
    id: 'santander',
    name: 'Santander',
    capital: 'Bucaramanga',
    municipalities: [
      'Bucaramanga',
      'Floridablanca',
      'Girón',
      'Piedecuesta',
      'Barrancabermeja',
      'San Gil',
      'Socorro',
      'Barichara',
      'Zapatoca',
      'Málaga',
      'Vélez',
      'Lebrija',
      'Rionegro'
    ]
  },
  {
    id: 'risaralda',
    name: 'Risaralda',
    capital: 'Pereira',
    municipalities: [
      'Pereira',
      'Dosquebradas',
      'Santa Rosa de Cabal',
      'La Virginia',
      'Belén de Umbría',
      'Santuario',
      'Marsella',
      'Guática',
      'Apía'
    ]
  },
  {
    id: 'caldas',
    name: 'Caldas',
    capital: 'Manizales',
    municipalities: [
      'Manizales',
      'Villamaría',
      'Chinchiná',
      'La Dorada',
      'Riosucio',
      'Anserma',
      'Salamina',
      'Aguadas',
      'Neira',
      'Pensilvania',
      'Supía'
    ]
  },
  {
    id: 'quindio',
    name: 'Quindío',
    capital: 'Armenia',
    municipalities: [
      'Armenia',
      'Calarcá',
      'Circasia',
      'Montenegro',
      'Quimbaya',
      'La Tebaida',
      'Salento',
      'Filandia',
      'Pijao',
      'Génova',
      'Buenavista',
      'Córdoba'
    ]
  },
  {
    id: 'cundinamarca',
    name: 'Cundinamarca',
    capital: 'Bogotá D.C.',
    municipalities: [
      'Soacha',
      'Chía',
      'Zipaquirá',
      'Facatativá',
      'Fusagasugá',
      'Mosquera',
      'Madrid',
      'Funza',
      'Cajicá',
      'Girardot',
      'Cota',
      'Sopó',
      'Tocancipá',
      'Tabio',
      'Tenjo',
      'La Calera',
      'Guasca',
      'Subachoque',
      'Villeta',
      'Ubaté',
      'Silvania'
    ]
  },
  {
    id: 'magdalena',
    name: 'Magdalena',
    capital: 'Santa Marta',
    municipalities: [
      'Santa Marta',
      'Ciénaga',
      'Fundación',
      'El Banco',
      'Plato',
      'Aracataca',
      'Pivijay',
      'Zona Bananera'
    ]
  },
  {
    id: 'meta',
    name: 'Meta',
    capital: 'Villavicencio',
    municipalities: [
      'Villavicencio',
      'Acacías',
      'Granada',
      'Puerto López',
      'Cumaral',
      'Restrepo',
      'San Martín',
      'Puerto Gaitán'
    ]
  },
  {
    id: 'narino',
    name: 'Nariño',
    capital: 'Pasto',
    municipalities: [
      'Pasto (San Juan de Pasto)',
      'Tumaco',
      'Ipiales',
      'Túquerres',
      'Sandoná',
      'La Unión',
      'Buesaco',
      'Samaniego'
    ]
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    capital: 'Montería',
    municipalities: [
      'Montería',
      'Cereté',
      'Lorica (Santa Cruz de Lorica)',
      'Sahagún',
      'Montelíbano',
      'Planeta Rica',
      'Ciénaga de Oro',
      'Tierralta',
      'San Pelayo'
    ]
  },
  {
    id: 'norte-de-santander',
    name: 'Norte de Santander',
    capital: 'Cúcuta',
    municipalities: [
      'Cúcuta (San José de Cúcuta)',
      'Ocaña',
      'Pamplona',
      'Villa del Rosario',
      'Los Patios',
      'Tibú',
      'El Zulia',
      'Chinácota'
    ]
  },
  {
    id: 'tolima',
    name: 'Tolima',
    capital: 'Ibagué',
    municipalities: [
      'Ibagué',
      'Espinal',
      'Melgar',
      'Honda',
      'Chaparral',
      'Mariquita',
      'Líbano',
      'Flandes',
      'Guamo',
      'Fresno'
    ]
  },
  {
    id: 'huila',
    name: 'Huila',
    capital: 'Neiva',
    municipalities: [
      'Neiva',
      'Pitalito',
      'Garzón',
      'La Plata',
      'Campoalegre',
      'San Agustín',
      'Gigante',
      'Palermo',
      'Rivera'
    ]
  },
  {
    id: 'boyaca',
    name: 'Boyacá',
    capital: 'Tunja',
    municipalities: [
      'Tunja',
      'Duitama',
      'Sogamoso',
      'Chiquinquirá',
      'Villa de Leyva',
      'Paipa',
      'Moniquirá',
      'Nobsa',
      'Tibasosa',
      'Ráquira',
      'Puerto Boyacá',
      'Samacá'
    ]
  },
  {
    id: 'cesar',
    name: 'Cesar',
    capital: 'Valledupar',
    municipalities: [
      'Valledupar',
      'Aguachica',
      'Agustín Codazzi',
      'Bosconia',
      'Curumaní',
      'La Paz',
      'San Alberto',
      'El Copey'
    ]
  },
  {
    id: 'cauca',
    name: 'Cauca',
    capital: 'Popayán',
    municipalities: [
      'Popayán',
      'Santander de Quilichao',
      'Puerto Tejada',
      'Patía (El Bordo)',
      'Piendamó',
      'El Tambo',
      'Bolívar',
      'Silvia'
    ]
  },
  {
    id: 'sucre',
    name: 'Sucre',
    capital: 'Sincelejo',
    municipalities: [
      'Sincelejo',
      'Corozal',
      'San Marcos',
      'Tolú (Santiago de Tolú)',
      'Sampués',
      'Coveñas',
      'San Onofre'
    ]
  },
  {
    id: 'la-guajira',
    name: 'La Guajira',
    capital: 'Riohacha',
    municipalities: [
      'Riohacha',
      'Maicao',
      'Uribia',
      'Fonseca',
      'San Juan del Cesar',
      'Manaure',
      'Villanueva'
    ]
  },
  {
    id: 'casanare',
    name: 'Casanare',
    capital: 'Yopal',
    municipalities: [
      'Yopal',
      'Aguazul',
      'Villanueva',
      'Tauramena',
      'Paz de Ariporo',
      'Monterrey',
      'Maní'
    ]
  },
  {
    id: 'caqueta',
    name: 'Caquetá',
    capital: 'Florencia',
    municipalities: [
      'Florencia',
      'San Vicente del Caguán',
      'Puerto Rico',
      'El Doncello',
      'Belén de los Andaquíes'
    ]
  },
  {
    id: 'choco',
    name: 'Chocó',
    capital: 'Quibdó',
    municipalities: [
      'Quibdó',
      'Istmina',
      'Condoto',
      'Tadó',
      'Bahía Solano',
      'Nuquí',
      'Acandí',
      'Riosucio'
    ]
  },
  {
    id: 'arauca',
    name: 'Arauca',
    capital: 'Arauca',
    municipalities: [
      'Arauca',
      'Tame',
      'Saravena',
      'Arauquita',
      'Fortul'
    ]
  },
  {
    id: 'putumayo',
    name: 'Putumayo',
    capital: 'Mocoa',
    municipalities: [
      'Mocoa',
      'Puerto Asís',
      'Orito',
      'Valle del Guamuez',
      'Villagarzón',
      'Sibundoy'
    ]
  },
  {
    id: 'amazonas',
    name: 'Amazonas',
    capital: 'Leticia',
    municipalities: [
      'Leticia',
      'Puerto Nariño'
    ]
  },
  {
    id: 'san-andres',
    name: 'San Andrés y Providencia',
    capital: 'San Andrés',
    municipalities: [
      'San Andrés',
      'Providencia'
    ]
  },
  {
    id: 'guaviare',
    name: 'Guaviare',
    capital: 'San José del Guaviare',
    municipalities: [
      'San José del Guaviare',
      'El Retorno',
      'Calamar'
    ]
  },
  {
    id: 'guainia',
    name: 'Guainía',
    capital: 'Inírida',
    municipalities: [
      'Inírida',
      'Barranco Minas'
    ]
  },
  {
    id: 'vaupes',
    name: 'Vaupés',
    capital: 'Mitú',
    municipalities: [
      'Mitú',
      'Carurú',
      'Taraira'
    ]
  },
  {
    id: 'vichada',
    name: 'Vichada',
    capital: 'Puerto Carreño',
    municipalities: [
      'Puerto Carreño',
      'La Primavera',
      'Santa Rosalía',
      'Cumaribo'
    ]
  }
];

export const POPULAR_LOCATIONS = [
  'Medellín, Antioquia, Colombia',
  'Bogotá D.C., Colombia',
  'Cali, Valle del Cauca, Colombia',
  'Barranquilla, Atlántico, Colombia',
  'Cartagena de Indias, Bolívar, Colombia',
  'Bucaramanga, Santander, Colombia',
  'Pereira, Risaralda, Colombia',
  'Manizales, Caldas, Colombia',
  'Santa Marta, Magdalena, Colombia',
  'Villavicencio, Meta, Colombia',
  'Pasto, Nariño, Colombia',
  'Montería, Córdoba, Colombia',
  'Cúcuta, Norte de Santander, Colombia',
  'Ibagué, Tolima, Colombia',
  'Armenia, Quindío, Colombia',
  'Neiva, Huila, Colombia',
  'Popayán, Cauca, Colombia',
  'Sincelejo, Sucre, Colombia',
  'Valledupar, Cesar, Colombia',
  'Tunja, Boyacá, Colombia'
];

/**
 * Searches locations matching a text query
 */
export function searchColombiaLocations(query: string): string[] {
  if (!query || query.trim().length < 2) return POPULAR_LOCATIONS.slice(0, 8);

  const clean = query.toLowerCase().trim();
  const results: string[] = [];

  for (const dept of COLOMBIA_DEPARTMENTS) {
    // If department matches, include its capital & top municipalities
    if (dept.name.toLowerCase().includes(clean)) {
      dept.municipalities.slice(0, 4).forEach((m) => {
        const full = `${m}, ${dept.name}, Colombia`;
        if (!results.includes(full)) results.push(full);
      });
    }

    // Check individual municipalities
    for (const muni of dept.municipalities) {
      if (muni.toLowerCase().includes(clean)) {
        const full = `${muni}, ${dept.name}, Colombia`;
        if (!results.includes(full)) results.push(full);
      }
    }
  }

  return results.slice(0, 15);
}
