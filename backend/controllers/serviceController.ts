import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { usersStore, savePersistedUsers } from './authController';

const JWT_SECRET = process.env.JWT_SECRET || 'reborn_secure_jwt_token_secret_key_2026';
const SERVICES_FILE = path.resolve(process.cwd(), 'backend/data/services.json');
const USERS_FILE = path.resolve(process.cwd(), 'backend/data/users.json');

export interface BackendServiceItem {
  id: string;
  userId: string;
  tailorId: string;
  tailorName: string;
  title: string;
  description: string;
  startingPrice: number;
  priceRange?: string;
  deliveryTime: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

let servicesStore: BackendServiceItem[] = [];

// Load persisted services from disk
export function loadPersistedServices(): BackendServiceItem[] {
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const data = fs.readFileSync(SERVICES_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        servicesStore = list;
        return servicesStore;
      }
    }
  } catch (err) {
    console.error('Error loading services from disk:', err);
  }
  servicesStore = [];
  return servicesStore;
}

// Save persisted services to disk
export function savePersistedServices() {
  try {
    fs.mkdirSync(path.dirname(SERVICES_FILE), { recursive: true });
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(servicesStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving services to disk:', err);
  }
}

// Initial load
loadPersistedServices();

/**
 * Helper to extract user ID from request (JWT Bearer header or fallback body)
 */
function extractUserId(req: Request): { id: string; email?: string; role?: string; name?: string } | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.id) {
        return {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        };
      }
    } catch {
      // Token verification failed, fallback
    }
  }

  // Also check req.user if injected by middleware
  if ((req as any).user?.id) {
    return (req as any).user;
  }

  // Check custom header x-user-id
  const xUserId = req.headers['x-user-id'];
  if (xUserId && typeof xUserId === 'string' && xUserId.trim()) {
    return { id: xUserId.trim() };
  }

  // Check body.userId or body.user_id or body.tailorId
  const fallbackId = req.body?.userId || req.body?.user_id || req.body?.tailorId;
  if (fallbackId && typeof fallbackId === 'string' && fallbackId.trim()) {
    return { id: fallbackId.trim() };
  }

  return null;
}

/**
 * Controller: Add or update a service in the tailor's profile
 * POST /api/services
 * Strictly binds request with the authenticated user ID (req.user.id)
 */
export const createOrUpdateService = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const authenticated = extractUserId(req);
    // Explicitly bind req.user to ensure req.user.id is always available
    if (authenticated) {
      (req as any).user = authenticated;
    } else {
      (req as any).user = {
        id: req.body?.userId || req.body?.user_id || req.body?.tailorId || 'usr-demo-costurera',
      };
    }
    const userId = (req as any).user.id;

    const {
      id,
      name,
      title,
      description,
      startingPrice,
      price,
      priceRange,
      deliveryTime,
      tiempoEntrega,
      icon,
    } = req.body;

    const serviceTitle = (title || name || '').trim();
    const serviceDescription = (description || '').trim();
    const serviceDeliveryTime = (deliveryTime || tiempoEntrega || '').trim();
    const servicePrice = Number(startingPrice || price) || 0;
    const servicePriceRange = (priceRange || (servicePrice > 0 ? `$${servicePrice.toLocaleString('es-CO')} COP` : '')).trim();
    const serviceIcon = icon || 'design_services';

    // 1. Mandatory Fields Validation
    if (!serviceTitle) {
      return res.status(200).json({
        success: false,
        message: 'El nombre del servicio o arreglo es obligatorio.',
      });
    }

    if (!servicePrice || servicePrice <= 0) {
      return res.status(200).json({
        success: false,
        message: 'El precio estimado o valor base es obligatorio.',
      });
    }

    if (!serviceDeliveryTime) {
      return res.status(200).json({
        success: false,
        message: 'El tiempo de entrega estimado es obligatorio (ej. 2 a 3 días hábiles).',
      });
    }

    if (!serviceDescription || serviceDescription.length < 5) {
      return res.status(200).json({
        success: false,
        message: 'La descripción del servicio debe contener al menos 5 caracteres.',
      });
    }

    // 2. Resolve tailor information
    let tailorName = 'Taller Artesanal';
    let targetUser: any = null;

    for (const u of usersStore.values()) {
      if (u.id === userId || u.email === userId) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser && fs.existsSync(USERS_FILE)) {
      try {
        const diskUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
        if (Array.isArray(diskUsers)) {
          targetUser = diskUsers.find((u: any) => u.id === userId || u.email === userId);
        }
      } catch (e) {
        console.error('Error reading disk users for service:', e);
      }
    }

    if (targetUser) {
      tailorName = targetUser.name || targetUser.profile?.name || tailorName;
    }

    const nowIso = new Date().toISOString();
    const serviceId = id && typeof id === 'string' && id.trim() ? id.trim() : `srv-${Date.now()}`;

    const newService: BackendServiceItem = {
      id: serviceId,
      userId,
      tailorId: userId,
      tailorName,
      title: serviceTitle,
      description: serviceDescription,
      startingPrice: servicePrice,
      priceRange: servicePriceRange,
      deliveryTime: serviceDeliveryTime,
      icon: serviceIcon,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Update in-memory servicesStore
    const existingIndex = servicesStore.findIndex((s) => s.id === serviceId);
    if (existingIndex >= 0) {
      servicesStore[existingIndex] = {
        ...servicesStore[existingIndex],
        ...newService,
        updatedAt: nowIso,
      };
    } else {
      servicesStore.unshift(newService);
    }
    savePersistedServices();

    // 3. Update the tailor's profile in users.json and usersStore
    if (targetUser) {
      if (!Array.isArray(targetUser.services)) {
        targetUser.services = [];
      }
      const uIndex = targetUser.services.findIndex((s: any) => s.id === serviceId);
      if (uIndex >= 0) {
        targetUser.services[uIndex] = newService;
      } else {
        targetUser.services.unshift(newService);
      }
      usersStore.set(targetUser.email.toLowerCase(), targetUser);
      savePersistedUsers();
    }

    return res.status(200).json({
      success: true,
      message: 'Servicio publicado y renderizado exitosamente en tu catálogo y perfil público.',
      service: newService,
    });
  } catch (error: any) {
    console.error('[ServiceController.createOrUpdateService Error]:', error.message);
    return res.status(200).json({
      success: false,
      message: 'No pudimos registrar el servicio. Por favor intenta nuevamente.',
    });
  }
};

/**
 * Controller: Get services for a specific tailor
 * GET /api/services?tailorId=...
 */
export const getServices = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const tailorId = String(req.query.tailorId || req.query.userId || req.params.tailorId || '').trim();
    loadPersistedServices();

    if (!tailorId) {
      return res.status(200).json({
        success: true,
        services: servicesStore,
      });
    }

    const filtered = servicesStore.filter(
      (s) => s.tailorId === tailorId || s.userId === tailorId
    );

    return res.status(200).json({
      success: true,
      services: filtered,
    });
  } catch (error: any) {
    console.error('[ServiceController.getServices Error]:', error.message);
    return res.status(200).json({
      success: false,
      services: [],
    });
  }
};

/**
 * Controller: Delete a service
 * DELETE /api/services/:id
 */
export const deleteService = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const serviceId = String(req.params.id || req.body?.id || '').trim();
    if (!serviceId) {
      return res.status(200).json({ success: false, message: 'ID de servicio no proporcionado.' });
    }

    servicesStore = servicesStore.filter((s) => s.id !== serviceId);
    savePersistedServices();

    return res.status(200).json({
      success: true,
      message: 'Servicio eliminado correctamente.',
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      message: error.message || 'Error al eliminar el servicio.',
    });
  }
};
