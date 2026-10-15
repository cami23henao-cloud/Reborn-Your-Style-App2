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

export function loadPersistedGarments(): BackendGarment[] {
  try {
    if (fs.existsSync(GARMENTS_FILE)) {
      const data = fs.readFileSync(GARMENTS_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        garmentsStore = list;
        return garmentsStore;
      }
    }
  } catch (err) {
    console.error('Error loading garments from disk:', err);
  }
  garmentsStore = [];
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
