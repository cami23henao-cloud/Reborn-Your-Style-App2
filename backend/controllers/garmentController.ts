import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { usersStore, savePersistedUsers } from './authController';

const GARMENTS_FILE = path.resolve(process.cwd(), 'backend/data/garments.json');

export interface BackendGarment {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  additionalImages?: string[];
  location: string;
  department?: string;
  city?: string;
  authorName: string;
  ownerId?: string;
  budget?: number;
  listingType?: string;
  condition?: string;
  createdAt: string;
}

let garmentsStore: BackendGarment[] = [];

const DEFAULT_EXAMPLE_GARMENTS: BackendGarment[] = [
  {
    id: 'garment-camisa-1',
    title: 'Camisa de Lino Blanco',
    category: 'Camisas',
    condition: 'Como nuevo (1-2 usos)',
    description: 'Camisa de lino 100% blanco con ajuste de talle y entalle en costuras laterales para silueta contemporánea.',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
    location: 'El Poblado, Medellín, Antioquia, Colombia',
    department: 'Antioquia',
    city: 'Medellín',
    authorName: 'Valentina Castro',
    ownerId: 'user-valentina-castro',
    budget: 35000,
    listingType: 'Transformación',
    createdAt: new Date().toISOString()
  },
  {
    id: 'garment-camisa-2',
    title: 'Camisa Oversize Denim',
    category: 'Camisas',
    condition: 'Usado - Buen estado',
    description: 'Camisa denim oversize intervenida con acortado de mangas estilo tres cuartos y cuello Mao renovado con costura invisible.',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    location: 'Chapinero, Bogotá D.C., Cundinamarca, Colombia',
    department: 'Bogotá D.C.',
    city: 'Bogotá D.C.',
    authorName: 'Santiago Mejía',
    ownerId: 'user-santiago-mejia',
    budget: 42000,
    listingType: 'Transformación',
    createdAt: new Date().toISOString()
  },
  {
    id: 'garment-camisa-3',
    title: 'Camisa Formal Estampada',
    category: 'Camisas',
    condition: 'Excelente',
    description: 'Camisa formal con microestampado geométrico; arreglo de basta / dobladillo inferior curvado y entalle de pinzas traseras.',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    location: 'San Antonio, Cali, Valle del Cauca, Colombia',
    department: 'Valle del Cauca',
    city: 'Cali',
    authorName: 'Andrés Caicedo',
    ownerId: 'user-andres-caicedo',
    budget: 28000,
    listingType: 'Transformación',
    createdAt: new Date().toISOString()
  },
  {
    id: 'garment-vestido-1',
    title: 'Vestido de Fiesta Largo',
    category: 'Vestidos',
    condition: 'Nuevo con etiquetas',
    description: 'Vestido de gala largo en satén esmeralda con ajuste de basta/dobladillo al piso y adaptación anatómica del escote en V.',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80',
    location: 'El Prado, Barranquilla, Atlántico, Colombia',
    department: 'Atlántico',
    city: 'Barranquilla',
    authorName: 'Mariana Gómez',
    ownerId: 'user-mariana-gomez',
    budget: 65000,
    listingType: 'Transformación',
    createdAt: new Date().toISOString()
  },
  {
    id: 'garment-vestido-2',
    title: 'Vestido Casual de Verano',
    category: 'Vestidos',
    condition: 'Como nuevo (1-2 usos)',
    description: 'Vestido midi floral de algodón fresco para verano; reducción de talle en costura de cintura y regulación de tirantes finos.',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
    location: 'Cabecera, Bucaramanga, Santander, Colombia',
    department: 'Santander',
    city: 'Bucaramanga',
    authorName: 'Camila Torres',
    ownerId: 'user-camila-torres',
    budget: 32000,
    listingType: 'Transformación',
    createdAt: new Date().toISOString()
  },
  {
    id: 'garment-vestido-3',
    title: 'Vestido Midi Impreso',
    category: 'Vestidos',
    condition: 'Usado - Buen estado',
    description: 'Vestido midi vintage estampado con sustitución de cremallera invisible trasera reforzada y renovación del vuelo inferior.',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    location: 'Circunvalar, Pereira, Risaralda, Colombia',
    department: 'Risaralda',
    city: 'Pereira',
    authorName: 'Lucía Beltrán',
    ownerId: 'user-lucia-beltran',
    budget: 38000,
    listingType: 'Transformación',
    createdAt: new Date().toISOString()
  }
];

export function loadPersistedGarments(): BackendGarment[] {
  try {
    if (fs.existsSync(GARMENTS_FILE)) {
      const data = fs.readFileSync(GARMENTS_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) {
        garmentsStore = list;
        return garmentsStore;
      }
    }
  } catch (err) {
    console.error('Error loading garments from disk:', err);
  }
  garmentsStore = [...DEFAULT_EXAMPLE_GARMENTS];
  savePersistedGarments();
  return garmentsStore;
}

export function savePersistedGarments() {
  try {
    fs.mkdirSync(path.dirname(GARMENTS_FILE), { recursive: true });
    fs.writeFileSync(GARMENTS_FILE, JSON.stringify(garmentsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving garments to disk:', err);
  }
}

// Initial load
loadPersistedGarments();

/**
 * Controller: Publish a garment to the catalog
 * POST /api/garments
 */
export const publishGarment = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const {
      title,
      category,
      description,
      imageUrl,
      additionalImages,
      location,
      department,
      city,
      authorName,
      ownerId,
      budget,
      listingType,
      condition,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(200).json({
        success: false,
        message: 'Título, categoría y descripción de la prenda son obligatorios.',
      });
    }

    const newGarment: BackendGarment = {
      id: req.body?.id || `garment-${Date.now()}`,
      title: String(title).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
      additionalImages: Array.isArray(additionalImages) ? additionalImages : [],
      location: location || 'Medellín, Antioquia, Colombia',
      department: department || 'Antioquia',
      city: city || 'Medellín',
      authorName: authorName || 'Usuario Reborn',
      ownerId: ownerId || `usr-${Date.now()}`,
      budget: Number(budget) || 0,
      listingType: listingType || 'Transformación',
      condition: condition || 'Excelente',
      createdAt: new Date().toISOString(),
    };

    garmentsStore.unshift(newGarment);
    savePersistedGarments();

    // Also attach to user account if found
    if (ownerId) {
      for (const u of usersStore.values()) {
        if (u.id === ownerId || u.email === ownerId) {
          if (!Array.isArray(u.garments)) u.garments = [];
          u.garments.unshift(newGarment);
          usersStore.set(u.email.toLowerCase(), u);
          savePersistedUsers();
          break;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Prenda publicada exitosamente en el catálogo público.',
      garment: newGarment,
    });
  } catch (err: any) {
    console.error('Error in publishGarment:', err);
    return res.status(200).json({
      success: false,
      message: 'No pudimos registrar la publicación.',
    });
  }
};

/**
 * Controller: Get all published garments in the catalog
 * GET /api/garments
 */
export const getGarments = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    loadPersistedGarments();
    return res.status(200).json({
      success: true,
      garments: garmentsStore,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      garments: [],
    });
  }
};
