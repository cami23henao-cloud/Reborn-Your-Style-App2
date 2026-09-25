import {
  UserProfile,
  GarmentProject,
  ServiceItem,
  ReportItem,
  ReportStatus,
  ReportType,
  AdminAuditLogEntry,
  SystemIncident,
  PlatformConfig,
  UserRole,
} from '../types';
import {
  computeSHA256,
  verifyAdminCredentials,
  EXCLUSIVE_ADMIN_EMAIL,
} from './securityService';
import {
  getUsersDatabase,
  saveUsersDatabase,
  StoredUserAccount,
  getActiveSession,
  setActiveSession,
} from './userStore';
import { EXPANDED_CATEGORIES, GarmentCategoryItem } from '../data/categoriesData';

// Storage Keys
const AUDIT_LOGS_KEY = 'reborn_admin_audit_logs_v6';
const REPORTS_KEY = 'reborn_reports_v6';
const CATEGORIES_KEY = 'reborn_admin_categories_v6';
const PLATFORM_CONFIG_KEY = 'reborn_platform_config_v6';
const INCIDENTS_KEY = 'reborn_system_incidents_v6';
const ADMIN_HASH_KEY = 'reborn_admin_hash_v6';

// Recovery Master Key for Administrator emergency recovery
export const ADMIN_MASTER_RECOVERY_KEY = 'REBORN-SECURE-KEY-2026';

// -----------------------------------------------------------------------------
// 1. BACKEND VALIDATION & AUTH CHECK
// -----------------------------------------------------------------------------
export function isAdminAuthorized(emailAttempt?: string): boolean {
  if (!emailAttempt) return false;
  const clean = emailAttempt.trim().toLowerCase();
  return clean === 'admin@rebornyourstyle.com' || clean === 'admin@rebornstyle.co';
}

function enforceAdminAuth(adminEmail: string, actionName: string): void {
  if (!isAdminAuthorized(adminEmail)) {
    throw new Error(
      `Acceso Denegado (Backend Validation): La acción "${actionName}" requiere credenciales administrativas válidas.`
    );
  }
}

// -----------------------------------------------------------------------------
// 2. AUDIT LOGGING SERVICE
// -----------------------------------------------------------------------------
export function getAdminAuditLogs(adminEmail: string): AdminAuditLogEntry[] {
  enforceAdminAuth(adminEmail, 'Consultar historial de auditoría');
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) {
      const initialLogs: AdminAuditLogEntry[] = [
        {
          id: `log-init-1`,
          action: 'inicializacion_sistema',
          targetType: 'seguridad',
          targetId: 'sys-001',
          targetName: 'Purga de Seguridad y Cuentas Legacy',
          details: 'Eliminación completa de sesiones antiguas, perfiles enlazados de Google y caché de Camila Henao.',
          adminEmail: 'admin@rebornyourstyle.com',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: `log-init-2`,
          action: 'politica_acceso',
          targetType: 'seguridad',
          targetId: 'sys-002',
          targetName: 'Autenticación SHA-256 Aislada',
          details: 'Separación definitiva del registro público. Activación de credenciales exclusivas.',
          adminEmail: 'admin@rebornyourstyle.com',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordAdminAuditLog(
  entry: Omit<AdminAuditLogEntry, 'id' | 'timestamp'>
): void {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    const logs: AdminAuditLogEntry[] = raw ? JSON.parse(raw) : [];
    const newLog: AdminAuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 300 logs
    if (logs.length > 300) logs.length = 300;
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error recording admin audit log:', err);
  }
}

// -----------------------------------------------------------------------------
// 3. USER MANAGEMENT (Suspend, Block, Unblock, Delete, Change Role)
// -----------------------------------------------------------------------------
export function adminGetAllUsers(adminEmail: string): StoredUserAccount[] {
  enforceAdminAuth(adminEmail, 'Consultar base de usuarios');
  return getUsersDatabase();
}

export function adminSuspendUser(
  adminEmail: string,
  userId: string,
  reason: string,
  durationDays: number
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Suspender cuenta de usuario');
  if (!reason.trim()) {
    return { success: false, error: 'Debes indicar el motivo de la suspensión.' };
  }

  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'Usuario no encontrado.' };
  }
  if (user.role === 'admin') {
    return { success: false, error: 'No es posible suspender la cuenta de administrador principal.' };
  }

  const suspendedUntil = new Date(Date.now() + durationDays * 86400000).toISOString();
  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        profile: {
          ...u.profile,
          accountStatus: 'suspendido' as const,
          suspensionReason: reason.trim(),
          suspendedUntil,
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'suspender_usuario',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Cuenta suspendida por ${durationDays} días. Motivo: ${reason}`,
    adminEmail,
  });

  return { success: true };
}

export function adminBlockUser(
  adminEmail: string,
  userId: string,
  reason: string
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Bloquear / vetear usuario');
  if (!reason.trim()) {
    return { success: false, error: 'Debes indicar el motivo del bloqueo permanente.' };
  }

  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'Usuario no encontrado.' };
  }
  if (user.role === 'admin') {
    return { success: false, error: 'No se puede bloquear al administrador del sistema.' };
  }

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        profile: {
          ...u.profile,
          accountStatus: 'bloqueado' as const,
          blockReason: reason.trim(),
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  // If this user is currently active in session, clear active session
  const active = getActiveSession();
  if (active && active.id === userId) {
    setActiveSession(null);
  }

  recordAdminAuditLog({
    action: 'bloquear_usuario',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Cuenta vetada permanentemente de la plataforma. Motivo: ${reason}`,
    adminEmail,
  });

  return { success: true };
}

export function adminUnblockUser(
  adminEmail: string,
  userId: string
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Desbloquear usuario');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        profile: {
          ...u.profile,
          accountStatus: 'activo' as const,
          suspensionReason: undefined,
          suspendedUntil: undefined,
          blockReason: undefined,
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'desbloquear_usuario',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: 'Cuenta reactivada y reestablecida al estado activo.',
    adminEmail,
  });

  return { success: true };
}

export function adminBanUser(
  adminEmail: string,
  userId: string,
  reason: string
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Banear cuenta permanentemente');
  if (!reason.trim()) {
    return { success: false, error: 'Debes indicar el motivo del baneo permanente.' };
  }

  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'Usuario no encontrado.' };
  }
  if (user.role === 'admin') {
    return { success: false, error: 'No se puede banear al administrador del sistema.' };
  }

  const newModerationEntry = {
    id: `mod-${Date.now()}`,
    action: 'baneo' as const,
    reason: reason.trim(),
    date: new Date().toISOString(),
    adminName: 'Administrador Reborn',
  };

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      const history = u.profile.moderationHistory || [];
      return {
        ...u,
        profile: {
          ...u.profile,
          accountStatus: 'baneado' as const,
          banReason: reason.trim(),
          moderationHistory: [newModerationEntry, ...history],
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  const active = getActiveSession();
  if (active && active.id === userId) {
    setActiveSession(null);
  }

  recordAdminAuditLog({
    action: 'bloquear_usuario',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Cuenta BANEADA permanentemente. Motivo: ${reason}`,
    adminEmail,
  });

  return { success: true };
}

export function adminUnbanUser(
  adminEmail: string,
  userId: string
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Desbanear usuario');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };

  const newModerationEntry = {
    id: `mod-${Date.now()}`,
    action: 'desbaneo' as const,
    reason: 'Baneo levantado por el administrador.',
    date: new Date().toISOString(),
    adminName: 'Administrador Reborn',
  };

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      const history = u.profile.moderationHistory || [];
      return {
        ...u,
        profile: {
          ...u.profile,
          accountStatus: 'activo' as const,
          banReason: undefined,
          moderationHistory: [newModerationEntry, ...history],
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'desbloquear_usuario',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: 'Baneo revocado. Cuenta restablecida al estado activo.',
    adminEmail,
  });

  return { success: true };
}

export function adminSendWarning(
  adminEmail: string,
  userId: string,
  warning: { reason: string; level: 'leve' | 'moderada' | 'grave'; details?: string }
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Enviar advertencia formal a usuario');
  if (!warning.reason.trim()) {
    return { success: false, error: 'Debes especificar el motivo de la advertencia.' };
  }

  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };

  const newWarning = {
    id: `warn-${Date.now()}`,
    level: warning.level,
    reason: warning.reason.trim(),
    details: warning.details?.trim(),
    date: new Date().toISOString(),
    adminName: 'Administrador Reborn',
  };

  const newModEntry = {
    id: `mod-${Date.now()}`,
    action: 'advertencia' as const,
    reason: `Advertencia [${warning.level.toUpperCase()}]: ${warning.reason}`,
    date: new Date().toISOString(),
    adminName: 'Administrador Reborn',
  };

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      const warnings = u.profile.warnings || [];
      const history = u.profile.moderationHistory || [];
      return {
        ...u,
        profile: {
          ...u.profile,
          warnings: [newWarning, ...warnings],
          moderationHistory: [newModEntry, ...history],
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'politica_acceso',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Advertencia emitida (${warning.level}): ${warning.reason}`,
    adminEmail,
  });

  return { success: true };
}

export function adminUpdateUserInfo(
  adminEmail: string,
  userId: string,
  updates: {
    name?: string;
    email?: string;
    bio?: string;
    phone?: string;
    location?: string;
    role?: 'cliente' | 'profesional';
  }
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Editar información de usuario');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        name: updates.name?.trim() || u.name,
        email: updates.email?.trim().toLowerCase() || u.email,
        role: updates.role || u.role,
        profile: {
          ...u.profile,
          name: updates.name?.trim() || u.profile.name,
          email: updates.email?.trim().toLowerCase() || u.profile.email,
          bio: updates.bio !== undefined ? updates.bio : u.profile.bio,
          phone: updates.phone !== undefined ? updates.phone : u.profile.phone,
          location: updates.location !== undefined ? updates.location : u.profile.location,
          role: updates.role || u.profile.role,
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'actualizar_configuracion',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Datos de perfil administrativo actualizados.`,
    adminEmail,
  });

  return { success: true };
}

export function adminToggleWorkshopVerification(
  adminEmail: string,
  userId: string,
  isVerified: boolean
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Verificar taller textil');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        profile: {
          ...u.profile,
          isVerifiedWorkshop: isVerified,
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'moderar_servicios',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: isVerified ? 'Taller verificado con insignia de calidad Reborn.' : 'Insignia de taller verificado removida.',
    adminEmail,
  });

  return { success: true };
}

// Support tickets persistence
const SUPPORT_TICKETS_KEY = 'reborn_support_tickets_v6';

export function getSupportTickets(): import('../types').SupportTicket[] {
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_KEY);
    if (!raw) {
      const initial: import('../types').SupportTicket[] = [
        {
          id: 'tkt-101',
          userName: 'María Camila Gómez',
          userEmail: 'camila.gomez@gmail.com',
          subject: 'Consulta sobre tiempo estimado de entrega en suprareciclaje',
          category: 'consulta',
          priority: 'media',
          status: 'abierto',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          messages: [
            {
              id: 'msg-1',
              sender: 'user',
              senderName: 'María Camila Gómez',
              message: 'Hola equipo de Reborn, solicité una transformación de una chaqueta de mezclilla con un taller en Medellín y quisiera confirmar cómo coordino la entrega y recepción.',
              timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
          ],
        },
        {
          id: 'tkt-102',
          userName: 'Taller Costura Viva',
          userEmail: 'contacto@costuraviva.co',
          subject: 'Solicitud de verificación oficial de taller artesanal',
          category: 'ayuda_tecnica',
          priority: 'alta',
          status: 'en_progreso',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          messages: [
            {
              id: 'msg-2',
              sender: 'user',
              senderName: 'Taller Costura Viva',
              message: 'Buenas tardes. Ya hemos subido 4 servicios y completado más de 8 pedidos con excelentes calificaciones. Queremos solicitar la insignia de Taller Verificado.',
              timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            },
            {
              id: 'msg-3',
              sender: 'admin',
              senderName: 'Administrador Reborn',
              message: 'Hola Taller Costura Viva, estamos revisando sus valoraciones y portafolio de bordado. En breve actualizaremos su certificación.',
              timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            },
          ],
        },
        {
          id: 'tkt-103',
          userName: 'Sebastián Morales',
          userEmail: 'sebas.morales@hotmail.com',
          subject: 'Aclaración de política de intercambio circular',
          category: 'consulta',
          priority: 'baja',
          status: 'resuelto',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          messages: [
            {
              id: 'msg-4',
              sender: 'user',
              senderName: 'Sebastián Morales',
              message: '¿El intercambio de prendas incluye costo de envío o se acuerda entre las dos partes?',
              timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            },
            {
              id: 'msg-5',
              sender: 'admin',
              senderName: 'Administrador Reborn',
              message: 'Hola Sebastián, en la modalidad de Intercambio los usuarios coordinan libremente el método de entrega presencial o envío por mensajería.',
              timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
            },
          ],
        },
      ];
      localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function replySupportTicket(
  ticketId: string,
  message: string,
  adminName: string = 'Administrador Reborn'
): boolean {
  try {
    const tickets = getSupportTickets();
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'en_progreso' as const,
          messages: [
            ...t.messages,
            {
              id: `msg-${Date.now()}`,
              sender: 'admin' as const,
              senderName: adminName,
              message: message.trim(),
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return t;
    });
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function updateSupportTicketStatus(
  ticketId: string,
  status: import('../types').SupportTicket['status']
): boolean {
  try {
    const tickets = getSupportTickets();
    const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function adminDeleteUser(
  adminEmail: string,
  userId: string
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Eliminar cuenta de usuario permanentemente');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };
  if (user.role === 'admin') {
    return { success: false, error: 'No es posible eliminar la cuenta de administración.' };
  }

  const updatedDb = db.filter((u) => u.id !== userId);
  saveUsersDatabase(updatedDb);

  const active = getActiveSession();
  if (active && active.id === userId) {
    setActiveSession(null);
  }

  recordAdminAuditLog({
    action: 'eliminar_usuario',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Cuenta eliminada definitivamente junto con sus datos y registros asociados.`,
    adminEmail,
  });

  return { success: true };
}

export function adminChangeUserRole(
  adminEmail: string,
  userId: string,
  newRole: 'cliente' | 'profesional'
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Modificar rol de usuario');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };
  if (user.role === 'admin') {
    return { success: false, error: 'El rol de Administrador no puede ser cambiado.' };
  }

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        role: newRole,
        profile: {
          ...u.profile,
          role: newRole,
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'cambiar_rol',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: `Rol modificado de ${user.role} a ${newRole}.`,
    adminEmail,
  });

  return { success: true };
}

export function adminToggleVerifiedWorkshop(
  adminEmail: string,
  userId: string
): { success: boolean; error?: string; isVerified?: boolean } {
  enforceAdminAuth(adminEmail, 'Verificar / certificar taller de costura');
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'Usuario no encontrado.' };

  const currentStatus = !!user.profile.isVerifiedWorkshop;
  const newStatus = !currentStatus;

  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        profile: {
          ...u.profile,
          isVerifiedWorkshop: newStatus,
        },
      };
    }
    return u;
  });

  saveUsersDatabase(updatedDb);

  recordAdminAuditLog({
    action: 'verificar_taller',
    targetType: 'usuario',
    targetId: userId,
    targetName: user.name,
    details: newStatus
      ? 'Taller verificado y certificado con sello de calidad textil.'
      : 'Sello de taller verificado retirado.',
    adminEmail,
  });

  return { success: true, isVerified: newStatus };
}

// -----------------------------------------------------------------------------
// 4. REPORTS SERVICE (Community Reports for Garments, Users, Services)
// -----------------------------------------------------------------------------
export function getAdminReports(adminEmail: string): ReportItem[] {
  enforceAdminAuth(adminEmail, 'Consultar reportes de la comunidad');
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      const initialReports: ReportItem[] = [
        {
          id: 'rep-101',
          reportedType: 'prenda',
          reportedId: 'garment-denim-01',
          reportedTitle: 'Chaqueta Denim Vintage intervenida',
          reportedUser: 'Mateo Cardona',
          reportedImageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
          reportedBy: 'Laura Sánchez',
          reporterRole: 'cliente',
          reason: 'Foto no corresponde al estado real',
          details: 'La fotografía muestra bordados dorados que según el usuario ya no están en la prenda real.',
          status: 'pendiente',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'rep-102',
          reportedType: 'usuario',
          reportedId: 'usr-spam-44',
          reportedTitle: 'Cuenta con actividad sospechosa',
          reportedUser: 'Comercializadora Textil X',
          reportedBy: 'Taller San Antonio',
          reporterRole: 'profesional',
          reason: 'Spam o publicidad engañosa masiva',
          details: 'Envía mensajes privados promocionando telas importadas fuera de los lineamientos de suprareciclaje.',
          status: 'pendiente',
          createdAt: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: 'rep-103',
          reportedType: 'prenda',
          reportedId: 'garment-vestido-02',
          reportedTitle: 'Vestido de lino natural',
          reportedUser: 'Beatriz Gómez',
          reportedImageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
          reportedBy: 'Carlos Mario Ruiz',
          reporterRole: 'cliente',
          reason: 'Prenda sintética catalogada como 100% lino',
          details: 'Se evidencia etiqueta de poliéster en una de las fotos auxiliares.',
          status: 'revisado',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          resolutionNotes: 'Se solicitó al autor corregir la composición del material en la ficha técnica.',
          resolvedAt: new Date(Date.now() - 43200000).toISOString(),
          resolvedBy: 'admin@rebornyourstyle.com',
        },
      ];
      localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports));
      return initialReports;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function adminCreateReport(
  report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>
): ReportItem {
  const raw = localStorage.getItem(REPORTS_KEY);
  const reports: ReportItem[] = raw ? JSON.parse(raw) : [];
  const newReport: ReportItem = {
    ...report,
    id: `rep-${Date.now()}`,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  };
  reports.unshift(newReport);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  return newReport;
}

export function adminResolveReport(
  adminEmail: string,
  reportId: string,
  resolution: {
    action: 'desestimar' | 'sancionar' | 'ocultar_contenido' | 'marcar_revisado';
    notes: string;
  }
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Resolver reporte de la comunidad');
  const raw = localStorage.getItem(REPORTS_KEY);
  if (!raw) return { success: false, error: 'No se encontraron reportes.' };

  const reports: ReportItem[] = JSON.parse(raw);
  const targetReport = reports.find((r) => r.id === reportId);
  if (!targetReport) return { success: false, error: 'Reporte no encontrado.' };

  let nextStatus: ReportStatus = 'revisado';
  if (resolution.action === 'desestimar') nextStatus = 'desestimado';
  if (resolution.action === 'sancionar') nextStatus = 'sancionado';

  const updatedReports = reports.map((r) => {
    if (r.id === reportId) {
      return {
        ...r,
        status: nextStatus,
        resolutionNotes: resolution.notes,
        resolvedAt: new Date().toISOString(),
        resolvedBy: adminEmail,
      };
    }
    return r;
  });

  localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports));

  recordAdminAuditLog({
    action: 'resolver_reporte',
    targetType: 'reporte',
    targetId: reportId,
    targetName: `Reporte de ${targetReport.reportedType}: ${targetReport.reportedTitle}`,
    details: `Acción: ${resolution.action}. Estado: ${nextStatus}. Notas: ${resolution.notes}`,
    adminEmail,
  });

  return { success: true };
}

// -----------------------------------------------------------------------------
// 5. CATEGORIES MANAGEMENT (Add, Toggle, Edit)
// -----------------------------------------------------------------------------
export interface ManagedCategory extends GarmentCategoryItem {
  isActive?: boolean;
  itemCount?: number;
}

export function getAdminCategories(): ManagedCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      const initial: ManagedCategory[] = EXPANDED_CATEGORIES.map((cat) => ({
        ...cat,
        isActive: true,
        itemCount: 12,
      }));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return EXPANDED_CATEGORIES.map((c) => ({ ...c, isActive: true }));
  }
}

export function adminAddCategory(
  adminEmail: string,
  category: Omit<ManagedCategory, 'id'>
): { success: boolean; category?: ManagedCategory; error?: string } {
  enforceAdminAuth(adminEmail, 'Crear nueva categoría');
  if (!category.name.trim()) {
    return { success: false, error: 'El nombre de la categoría es obligatorio.' };
  }

  const categories = getAdminCategories();
  const id = category.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (categories.some((c) => c.id === id)) {
    return { success: false, error: 'Ya existe una categoría con ese identificador.' };
  }

  const newCat: ManagedCategory = {
    ...category,
    id,
    isActive: true,
    itemCount: 0,
    popularUpcyclingIdeas: category.popularUpcyclingIdeas || ['Transformación básica', 'Reciclaje creativo'],
  };

  categories.push(newCat);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));

  recordAdminAuditLog({
    action: 'crear_categoria',
    targetType: 'categoria',
    targetId: id,
    targetName: newCat.name,
    details: `Nueva categoría agregada al catálogo: ${newCat.description}`,
    adminEmail,
  });

  return { success: true, category: newCat };
}

export function adminToggleCategory(
  adminEmail: string,
  categoryId: string
): { success: boolean; error?: string; isActive?: boolean } {
  enforceAdminAuth(adminEmail, 'Activar / Desactivar categoría');
  const categories = getAdminCategories();
  const target = categories.find((c) => c.id === categoryId);
  if (!target) return { success: false, error: 'Categoría no encontrada.' };

  const nextState = !target.isActive;
  const updated = categories.map((c) =>
    c.id === categoryId ? { ...c, isActive: nextState } : c
  );

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));

  recordAdminAuditLog({
    action: 'toggle_categoria',
    targetType: 'categoria',
    targetId: categoryId,
    targetName: target.name,
    details: `Estado de categoría cambiado a: ${nextState ? 'Activa' : 'Desactivada'}`,
    adminEmail,
  });

  return { success: true, isActive: nextState };
}

// -----------------------------------------------------------------------------
// 6. SYSTEM INCIDENTS SERVICE
// -----------------------------------------------------------------------------
export function getSystemIncidents(): SystemIncident[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_KEY);
    if (!raw) {
      const initialIncidents: SystemIncident[] = [
        {
          id: 'inc-01',
          title: 'Monitoreo de latencia en compresión de imágenes',
          description: 'Optimización de entrega para previews de telas y bocetos de upcycling en conexiones móviles.',
          severity: 'baja',
          status: 'resuelta',
          reportedBy: 'Sistema Automático',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          solution: 'Se implementaron límites de compresión WebP en el navegador antes de almacenamiento.',
        },
        {
          id: 'inc-02',
          title: 'Validación estricta de códigos OTP de 6 dígitos',
          description: 'Asegurar que ningún usuario pueda registrarse con dominios de correo temporales o falsos.',
          severity: 'media',
          status: 'resuelta',
          reportedBy: 'Auditoría de Seguridad',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          solution: 'Filtro de dominios desechables activo con hashes SHA-256 en cliente y persistencia.',
        },
      ];
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(initialIncidents));
      return initialIncidents;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function adminCreateIncident(
  adminEmail: string,
  incident: Omit<SystemIncident, 'id' | 'createdAt' | 'status'>
): SystemIncident {
  enforceAdminAuth(adminEmail, 'Crear reporte de incidencia técnica');
  const incidents = getSystemIncidents();
  const newInc: SystemIncident = {
    ...incident,
    id: `inc-${Date.now()}`,
    status: 'abierta',
    createdAt: new Date().toISOString(),
  };
  incidents.unshift(newInc);
  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));

  recordAdminAuditLog({
    action: 'crear_incidencia',
    targetType: 'incidencia',
    targetId: newInc.id,
    targetName: newInc.title,
    details: `Severidad: ${newInc.severity}. Descripción: ${newInc.description}`,
    adminEmail,
  });

  return newInc;
}

export function adminResolveIncident(
  adminEmail: string,
  incidentId: string,
  solution: string,
  newStatus: 'en_revision' | 'resuelta' = 'resuelta'
): { success: boolean; error?: string } {
  enforceAdminAuth(adminEmail, 'Actualizar estado de incidencia');
  const incidents = getSystemIncidents();
  const target = incidents.find((i) => i.id === incidentId);
  if (!target) return { success: false, error: 'Incidencia no encontrada.' };

  const updated = incidents.map((i) => {
    if (i.id === incidentId) {
      return {
        ...i,
        status: newStatus,
        solution,
        resolvedAt: newStatus === 'resuelta' ? new Date().toISOString() : undefined,
      };
    }
    return i;
  });

  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(updated));

  recordAdminAuditLog({
    action: 'resolver_incidencia',
    targetType: 'incidencia',
    targetId: incidentId,
    targetName: target.title,
    details: `Estado: ${newStatus}. Solución registrada: ${solution}`,
    adminEmail,
  });

  return { success: true };
}

// -----------------------------------------------------------------------------
// 7. PLATFORM CONFIGURATION SERVICE
// -----------------------------------------------------------------------------
export function getPlatformConfig(): PlatformConfig {
  try {
    const raw = localStorage.getItem(PLATFORM_CONFIG_KEY);
    if (!raw) {
      const initial: PlatformConfig = {
        announcement: 'Plataforma oficial de suprareciclaje textil y confección artesanal en Colombia.',
        isAnnouncementActive: false,
        systemStatus: 'operativo',
        supportEmail: 'contacto@rebornyourstyle.com',
        allowNewRegistrations: true,
        maintenanceNotice: '',
      };
      localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      announcement: '',
      isAnnouncementActive: false,
      systemStatus: 'operativo',
      supportEmail: 'contacto@rebornyourstyle.com',
      allowNewRegistrations: true,
    };
  }
}

export function adminUpdatePlatformConfig(
  adminEmail: string,
  updates: Partial<PlatformConfig>
): { success: boolean; config?: PlatformConfig; error?: string } {
  enforceAdminAuth(adminEmail, 'Actualizar configuración global de la plataforma');
  const current = getPlatformConfig();
  const updated: PlatformConfig = {
    ...current,
    ...updates,
  };

  localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(updated));

  recordAdminAuditLog({
    action: 'actualizar_configuracion',
    targetType: 'seguridad',
    targetId: 'platform-cfg',
    targetName: 'Configuración General de Reborn Your Style',
    details: `Estado: ${updated.systemStatus}. Registro permitido: ${updated.allowNewRegistrations}. Anuncio: ${updated.announcement}`,
    adminEmail,
  });

  return { success: true, config: updated };
}

// -----------------------------------------------------------------------------
// 8. SECURE ADMIN PASSWORD MANAGEMENT (Change & Recovery)
// -----------------------------------------------------------------------------
export async function adminChangePassword(
  adminEmail: string,
  currentPasswordAttempt: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  enforceAdminAuth(adminEmail, 'Cambiar contraseña de administrador');

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: 'La nueva contraseña debe tener al menos 8 caracteres de longitud.',
    };
  }

  // Validate current credentials
  const checkCurrent = await verifyAdminCredentials(adminEmail, currentPasswordAttempt);
  if (!checkCurrent.success) {
    return {
      success: false,
      error: 'La contraseña actual de administrador es incorrecta.',
    };
  }

  const newHash = await computeSHA256(newPassword);
  localStorage.setItem(ADMIN_HASH_KEY, newHash);

  recordAdminAuditLog({
    action: 'cambiar_password_admin',
    targetType: 'seguridad',
    targetId: 'admin-auth',
    targetName: 'Credenciales del Administrador',
    details: 'Actualización exitosa de contraseña administrativa con digest SHA-256.',
    adminEmail,
  });

  return { success: true };
}

export async function adminRecoverPasswordWithMasterKey(
  recoveryKeyInput: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (recoveryKeyInput.trim() !== ADMIN_MASTER_RECOVERY_KEY) {
    return {
      success: false,
      error: 'Clave maestra de recuperación institucional no válida.',
    };
  }

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: 'La nueva contraseña debe tener al menos 8 caracteres.',
    };
  }

  const newHash = await computeSHA256(newPassword);
  localStorage.setItem(ADMIN_HASH_KEY, newHash);

  recordAdminAuditLog({
    action: 'recuperar_password_admin',
    targetType: 'seguridad',
    targetId: 'admin-recovery',
    targetName: 'Recuperación Maestra',
    details: 'Contraseña de administrador reestablecida mediante clave maestra de recuperación institucional.',
    adminEmail: 'admin@rebornyourstyle.com',
  });

  return { success: true };
}
