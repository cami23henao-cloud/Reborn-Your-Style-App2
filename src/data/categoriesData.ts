export interface GarmentCategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  popularUpcyclingIdeas: string[];
}

export const EXPANDED_CATEGORIES: GarmentCategoryItem[] = [
  {
    id: 'camisas',
    name: 'Camisas',
    icon: 'apparel',
    description: 'Camisas formales, casuales, de rayas, lino y prendas camiseras para caballero y dama.',
    popularUpcyclingIdeas: ['Crop Top Estructurado', 'Camisa Desestructurada', 'Corset con Botones']
  },
  {
    id: 'blusas',
    name: 'Blusas',
    icon: 'styler',
    description: 'Blusas campesinas, tops de lino, blusas con vuelos, encajes y prendas superiores delicadas.',
    popularUpcyclingIdeas: ['Blusa Campesina con Vuelos', 'Top Halter de Lino', 'Bordado Botánico']
  },
  {
    id: 'pantalones',
    name: 'Pantalones',
    icon: 'straighten',
    description: 'Jeans vaqueros, pantalones de dril, sastre, lino, bota campana o cargo.',
    popularUpcyclingIdeas: ['Falda Asimétrica Denim', 'Pantalón Cargo Upcycled', 'Ajuste de Sastrería']
  },
  {
    id: 'vestidos',
    name: 'Vestidos',
    icon: 'dresser',
    description: 'Vestidos largos, cortos, casuales, camiseros, de fiesta y lino.',
    popularUpcyclingIdeas: ['Conjunto de Falda y Top', 'Vestido Midi Upcycled', 'Kimono Fluido']
  },
  {
    id: 'bolsos',
    name: 'Bolsos',
    icon: 'shopping_bag',
    description: 'Tote bags, carteras, bandoleras y bolsos de mano hechos con mezclilla y lonas recicladas.',
    popularUpcyclingIdeas: ['Tote Bag Denim Resistente', 'Bandolera Bohemio Patchwork', 'Bolso Playero de Lona']
  },
  {
    id: 'chaquetas',
    name: 'Chaquetas',
    icon: 'layers',
    description: 'Chaquetas de jean, blazers sastre, cazadoras y abrigos de paño.',
    popularUpcyclingIdeas: ['Chaqueta cropped bordada', 'Chaleco sin mangas', 'Intervención de pintura textil']
  },
  {
    id: 'shorts',
    name: 'Shorts',
    icon: 'content_cut',
    description: 'Shorts de mezclilla, bermudas, playeros y prendas cortas.',
    popularUpcyclingIdeas: ['Minifalda patchwork', 'Bermuda Sashiko', 'Bolsillos decorativos']
  },
  {
    id: 'sueteres',
    name: 'Suéteres',
    icon: 'texture',
    description: 'Buzos de lana, sacos de punto, cárdigans y suéteres tejidos.',
    popularUpcyclingIdeas: ['Zurcido visible japonés', 'Mitones y bufanda', 'Gorro beanie cálido']
  },
  {
    id: 'gorras',
    name: 'Gorras',
    icon: 'wb_sunny',
    description: 'Gorras snapback, viseras, sombreros, pavas y boinas.',
    popularUpcyclingIdeas: ['Gorra denim con parches', 'Pintura textil artística', 'Visera bordada a mano']
  },
  {
    id: 'mochilas',
    name: 'Mochilas',
    icon: 'backpack',
    description: 'Morrales urbanos, mochilas de lona militar y tulas deportivas.',
    popularUpcyclingIdeas: ['Compartimento para portátil', 'Bolsillos modulares cargo', 'Refuerzo de lona']
  },
  {
    id: 'calzones',
    name: 'Calzones',
    icon: 'spa',
    description: 'Calzones, panties, bralettes, culottes y prendas íntimas sostenibles de algodón orgánico.',
    popularUpcyclingIdeas: ['Calzones en Algodón Pima', 'Bralette y Panty de Encaje', 'Culotte Anatómico']
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    icon: 'auto_fix_high',
    description: 'Bufandas, cinturones tipo faja, pañuelos de seda, scrunchies y estuches.',
    popularUpcyclingIdeas: ['Cinturón faja obi', 'Coleteros de seda', 'Diademas trenzadas']
  },
  {
    id: 'trajes-de-bano',
    name: 'Trajes de baño',
    icon: 'waves',
    description: 'Bikinis, enterizos de licra reciclada y salidas de baño.',
    popularUpcyclingIdeas: ['Top deportivo resistente al cloro', 'Bandeau cruzado', 'Bikini upcycled']
  },
  {
    id: 'medias',
    name: 'Medias',
    icon: 'interests',
    description: 'Calcetines de algodón, calentadores de punto rústico y medias térmicas.',
    popularUpcyclingIdeas: ['Calentadores de punto', 'Muñecos artesanales', 'Protectores térmicos']
  },
  {
    id: 'ropa',
    name: 'Ropa',
    icon: 'checkroom',
    description: 'Prendas de vestir compuestas, conjuntos textiles coordinados y trajes de dos piezas.',
    popularUpcyclingIdeas: ['Chaqueta Bomber Reversible', 'Conjunto de 2 Piezas', 'Chaleco Patchwork']
  },
  {
    id: 'otras-prendas',
    name: 'Otras prendas',
    icon: 'more_horiz',
    description: 'Delantales de cocina, retazos textiles, manteles y prendas artesanales especiales.',
    popularUpcyclingIdeas: ['Delantal de cocina patchwork', 'Manta artesanal', 'Portavasos acolchados']
  }
];
