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
    popularUpcyclingIdeas: ['Zurcido visible japonés', 'Mitones y calentadores', 'Cuello térmico']
  },
  {
    id: 'medias',
    name: 'Medias',
    icon: 'interests',
    description: 'Calcetines de algodón, calentadores de punto rústico y medias térmicas.',
    popularUpcyclingIdeas: ['Calentadores de punto', 'Muñecos artesanales', 'Protectores térmicos']
  },
  {
    id: 'otras-prendas',
    name: 'Otras prendas',
    icon: 'more_horiz',
    description: 'Delantales de cocina, enterizos, chalecos y prendas textiles especiales.',
    popularUpcyclingIdeas: ['Delantal de cocina patchwork', 'Chaleco acolchado', 'Enterizo utilitario']
  }
];
