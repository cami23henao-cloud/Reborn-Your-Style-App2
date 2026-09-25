export type AppView = 
  | 'inicio' 
  | 'catalogos'
  | 'categoria'
  | 'costureros'
  | 'explora' 
  | 'servicios' 
  | 'inspiracion' 
  | 'como-funciona' 
  | 'publicar-prenda' 
  | 'perfil-profesional' 
  | 'mi-estudio' 
  | 'mensajes' 
  | 'solicitud-resumen'
  | 'admin';

export type UserRole = 'cliente' | 'profesional' | 'admin';

export type AccountStatus = 'activo' | 'suspendido' | 'bloqueado' | 'baneado';

export interface UserWarning {
  id: string;
  level: 'leve' | 'moderada' | 'grave';
  reason: string;
  details?: string;
  date: string;
  adminName: string;
}

export interface UserModerationEntry {
  id: string;
  action: 'bloqueo' | 'desbloqueo' | 'baneo' | 'desbaneo' | 'advertencia' | 'edicion';
  reason: string;
  duration?: string;
  date: string;
  adminName: string;
}

export interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  userId?: string;
  subject: string;
  category: 'consulta' | 'reclamo' | 'ayuda_tecnica' | 'cuenta' | 'pagos';
  priority: 'baja' | 'media' | 'alta';
  status: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  createdAt: string;
  messages: {
    id: string;
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  location: string;
  department: string;
  municipality: string;
  address?: string;
  phone?: string;
  instagram?: string;
  joinedDate: string;
  publishedCount: number;
  upcycledCount: number;
  waterSavedLiters: number;
  co2SavedKg: number;
  accountStatus?: AccountStatus;
  suspensionReason?: string;
  suspendedUntil?: string;
  blockReason?: string;
  banReason?: string;
  isVerifiedWorkshop?: boolean;
  warnings?: UserWarning[];
  moderationHistory?: UserModerationEntry[];
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  category: 'Bordado' | 'Pintura Textil' | 'Upcycling Estructural' | 'Teñido';
  rating: number;
  reviewsCount: number;
  location: string;
  address?: string;
  distanceKm: number;
  startingPrice: number;
  imageUrl: string;
  bio: string;
  tags: string[];
  isTopSeller?: boolean;
  portfolio: {
    id: string;
    title: string;
    imageUrl: string;
  }[];
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface GarmentProject {
  id: string;
  title: string;
  category: string;
  categoryEmoji?: string;
  condition: string;
  description: string;
  modifications?: string;
  size: string;
  color: string;
  colorHex?: string;
  budget: number;
  listingType: 'Venta' | 'Intercambio' | 'Donación' | 'Transformación';
  allowExchange: boolean;
  location: string;
  department?: string;
  municipality?: string;
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: UserRole;
  status: 'Publicada' | 'En revisión' | 'En Proceso' | 'Completado' | 'Oculta';
  createdAt: string;
  views?: number;
  saves?: number;
  isHidden?: boolean;
  hiddenReason?: string;
  hiddenAt?: string;
  isReported?: boolean;
  reportCount?: number;
  additionalPhotos?: string[];
}

export type ReportType = 'prenda' | 'usuario' | 'servicio' | 'comentario';
export type ReportStatus = 'pendiente' | 'revisado' | 'desestimado' | 'sancionado';

export interface ReportItem {
  id: string;
  reportedType: ReportType;
  reportedId: string;
  reportedTitle: string;
  reportedUser: string;
  reportedImageUrl?: string;
  reportedBy: string;
  reporterRole: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AdminAuditLogEntry {
  id: string;
  action: string;
  targetType: 'usuario' | 'publicacion' | 'foto' | 'reporte' | 'categoria' | 'seguridad' | 'incidencia';
  targetId: string;
  targetName: string;
  details: string;
  adminEmail: string;
  timestamp: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  severity: 'baja' | 'media' | 'alta' | 'critica';
  status: 'abierta' | 'en_revision' | 'resuelta';
  reportedBy: string;
  createdAt: string;
  resolvedAt?: string;
  solution?: string;
}

export interface PlatformConfig {
  announcement: string;
  isAnnouncementActive: boolean;
  systemStatus: 'operativo' | 'mantenimiento' | 'incidencia';
  supportEmail: string;
  allowNewRegistrations: boolean;
  maintenanceNotice?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  icon: string;
}

export interface InspirationItem {
  id: string;
  title: string;
  creatorName: string;
  creatorAvatar: string;
  imageUrl: string;
  category: string;
  description: string;
  tags: string[];
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface MessageItem {
  id: string;
  sender: 'user' | 'pro' | 'other';
  text: string;
  time: string;
}

export type ChatMessage = MessageItem;

export interface ChatConversation {
  id: string;
  participantId?: string;
  participantName: string;
  participantRole?: string;
  participantAvatar: string;
  projectTitle?: string;
  lastUpdated?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: boolean;
  unreadCount?: number;
  messages: MessageItem[];
}

export interface ServiceRequest {
  id: string;
  clientName: string;
  clientAvatar: string;
  garmentTitle: string;
  serviceType: string;
  budget: number;
  status: 'Pendiente' | 'Aceptada' | 'Rechazada' | 'En Proceso' | 'Completada';
  createdAt: string;
  description: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

// AI Transformation Models & Data Structures
export interface AITransformationIdea {
  id: string;
  targetGarmentName: string;
  targetCategory: string;
  difficulty: 'Fácil (Principiante)' | 'Medio (Intermedio)' | 'Avanzado (Sastrería)';
  estimatedTime: string;
  description: string;
  visualPreviewUrl: string;
  styleTags: string[];
  materialsNeeded: string[];
  toolsNeeded: string[];
  waterSavedLiters: number;
  co2SavedKg: number;
  steps: {
    number: number;
    title: string;
    instruction: string;
  }[];
}

export interface AIGarmentAnalysis {
  detectedCategory: string;
  detectedFabric: string;
  detectedCondition: string;
  detectedColor: string;
  detectedPattern?: string;
  detectedTexture?: string;
  detectedWeave?: string;
  detectedComposition?: string;
  detectedPalette?: { hex: string; name: string }[];
  textureMapUrl?: string;
  drapePhysics?: {
    type: string;
    drapeScore: number;
    foldDescription: string;
    fallBehavior: string;
  };
  target3DMold?: {
    moldName: string;
    category: string;
    description: string;
  };
  reusableElements?: string[];
  upcyclingPotentialScore: number;
  summary: string;
  originalImageUrl?: string;
  generatedImageUrl?: string;
  aiImageStatus?: {
    success: boolean;
    modelUsed?: string;
    message?: string;
    quotaExceeded?: boolean;
  };
  ideas: AITransformationIdea[];
}
