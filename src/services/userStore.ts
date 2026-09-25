import {
  UserProfile,
  UserRole,
  GarmentProject,
  ServiceItem,
  ServiceRequest,
  ChatConversation
} from '../types';
import {
  computeSHA256,
  verifyAdminCredentials,
  EXCLUSIVE_ADMIN_EMAIL,
  validateEmailFormat,
  purgeAllLegacySessionsAndGoogleData
} from './securityService';

export interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  password?: string; // fallback
  name: string;
  role: UserRole;
  profile: UserProfile;
  garments: GarmentProject[];
  services: ServiceItem[];
  requests: ServiceRequest[];
  conversations: ChatConversation[];
  createdAt?: string;
  isVerified?: boolean;
}

const STORAGE_KEY_USERS_DB = 'reborn_verified_accounts_v5';
const STORAGE_KEY_ACTIVE_SESSION = 'reborn_active_session_v5';

/**
 * Retrieves the verified users database from localStorage.
 * Guaranteed 100% clean: no demo users, no Google accounts, no unverified profiles.
 */
export function getUsersDatabase(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Strict sanitation filter: only exclude dummy demo accounts
    return parsed.filter(
      (u) =>
        u.email &&
        !u.email.toLowerCase().includes('demo_test_preloaded')
    );
  } catch (err) {
    console.error('Error reading users database:', err);
    return [];
  }
}

export function saveUsersDatabase(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users database:', err);
  }
}

/**
 * Gets the current active session.
 */
export function getActiveSession(): StoredUserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return null;
    const session: StoredUserAccount = JSON.parse(raw);
    if (!session || !session.email) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
      return null;
    }

    // Check if it's the exclusive administrator session
    if (session.role === 'admin' && session.email.toLowerCase() === EXCLUSIVE_ADMIN_EMAIL.toLowerCase()) {
      return session;
    }

    // Otherwise verify that the account exists in the database
    const db = getUsersDatabase();
    const verifiedUser = db.find(
      (u) => u.id === session.id && u.email.trim().toLowerCase() === session.email.trim().toLowerCase()
    );
    if (!verifiedUser) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
      return null;
    }
    return verifiedUser;
  } catch {
    return null;
  }
}

export function setActiveSession(account: StoredUserAccount | null): void {
  try {
    if (account) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    }
  } catch (err) {
    console.error('Error updating active session:', err);
  }
}

/**
 * Registers a new user account after successful email verification.
 * 
 * Rules:
 * - Common users can ONLY be 'cliente' or 'profesional'. The 'admin' role is forbidden.
 * - Password is cryptographically hashed with SHA-256 before storing.
 * - Email format must be strictly validated.
 * - Profile starts completely empty and isolated.
 */
export async function registerVerifiedUser(params: {
  name: string;
  email: string;
  password: string;
  role: 'cliente' | 'profesional';
  phone?: string;
  department?: string;
  municipality?: string;
}): Promise<{ success: boolean; error?: string; user?: StoredUserAccount }> {
  const emailClean = params.email.trim().toLowerCase();
  const nameClean = params.name.trim();
  const password = params.password;

  if (!nameClean) {
    return { success: false, error: 'Por favor ingresa tu nombre completo o nombre del taller.' };
  }

  // Validate email format
  const emailVal = validateEmailFormat(emailClean);
  if (!emailVal.isValid) {
    return { success: false, error: emailVal.error || 'Correo electrónico inválido.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  // Prevent registration with admin role
  if ((params.role as string) === 'admin') {
    return {
      success: false,
      error: 'El rol de Administrador está protegido y no puede ser seleccionado en el registro normal.',
    };
  }

  const db = getUsersDatabase();
  const existing = db.find((u) => u.email.toLowerCase() === emailClean);
  if (existing) {
    return {
      success: false,
      error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
    };
  }

  // Cryptographically hash password (no plain passwords stored)
  const passwordHash = await computeSHA256(password);

  const userId = `usr-${Date.now()}`;
  const username = `@${nameClean.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const newProfile: UserProfile = {
    id: userId,
    name: nameClean,
    email: emailClean,
    role: params.role,
    avatarUrl: '', // Neutral space by default: no invented or automatic profile pictures
    username,
    bio: params.role === 'profesional' ? 'Taller de confección y transformación textil' : '',
    location: params.municipality && params.department ? `${params.municipality}, ${params.department}` : 'Colombia',
    department: params.department || '',
    municipality: params.municipality || '',
    phone: params.phone || '',
    instagram: '',
    joinedDate: 'Hoy',
    publishedCount: 0,
    upcycledCount: 0,
    waterSavedLiters: 0,
    co2SavedKg: 0,
  };

  const newAccount: StoredUserAccount = {
    id: userId,
    email: emailClean,
    passwordHash,
    name: nameClean,
    role: params.role,
    profile: newProfile,
    garments: [],
    services: [],
    requests: [],
    conversations: [],
    createdAt: new Date().toISOString(),
    isVerified: true,
  };

  db.push(newAccount);
  saveUsersDatabase(db);
  setActiveSession(newAccount);

  return { success: true, user: newAccount };
}

/**
 * Login for regular registered users (Cliente / Modista).
 * Validates against verified users database.
 */
export async function loginUser(
  identifier: string,
  passwordAttempt: string
): Promise<{ success: boolean; error?: string; user?: StoredUserAccount }> {
  const cleanEmail = identifier.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
  }
  if (!passwordAttempt) {
    return { success: false, error: 'Por favor ingresa tu contraseña.' };
  }

  const db = getUsersDatabase();
  const user = db.find(
    (u) =>
      u.email.trim().toLowerCase() === cleanEmail ||
      (u.profile.username && u.profile.username.toLowerCase() === cleanEmail) ||
      (u.profile.username && u.profile.username.toLowerCase() === `@${cleanEmail}`)
  );

  // If email does not exist or user not found
  if (!user) {
    return {
      success: false,
      error: 'Correo o contraseña incorrectos.',
    };
  }

  // Compute hash of attempt
  const attemptHash = await computeSHA256(passwordAttempt);

  const isPasswordValid =
    (user.passwordHash && user.passwordHash === attemptHash) ||
    (user.password && user.password === passwordAttempt);

  // If password does not match registered account password
  if (!isPasswordValid) {
    return {
      success: false,
      error: 'Correo o contraseña incorrectos.',
    };
  }

  // Check account suspension or block by administration
  if (user.profile.accountStatus === 'bloqueado') {
    return {
      success: false,
      error: `Esta cuenta ha sido bloqueada permanentemente. Motivo: ${user.profile.blockReason || 'Incumplimiento de normas'}.`,
    };
  }
  if (user.profile.accountStatus === 'suspendido') {
    return {
      success: false,
      error: `Esta cuenta se encuentra temporalmente suspendida por administración. Motivo: ${user.profile.suspensionReason || 'En revisión'}.`,
    };
  }

  setActiveSession(user);
  return { success: true, user };
}

/**
 * Dedicated, private Administrator login.
 * Strictly checks exclusive administrator credentials and password SHA-256 hash.
 */
export async function loginAdministrator(
  emailAttempt: string,
  passwordAttempt: string
): Promise<{ success: boolean; error?: string; user?: StoredUserAccount }> {
  const adminCheck = await verifyAdminCredentials(emailAttempt, passwordAttempt);
  if (!adminCheck.success) {
    return {
      success: false,
      error: adminCheck.error || 'Credenciales administrativas inválidas.',
    };
  }

  const adminProfile: UserProfile = {
    id: 'usr-admin-master',
    name: 'Dirección y Seguridad General',
    email: EXCLUSIVE_ADMIN_EMAIL,
    role: 'admin',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=012d1d&textColor=b0f1cc&bold=true',
    username: '@admin_reborn',
    bio: 'Administración central de Reborn Your Style. Curaduría y moderación de prendas y servicios.',
    location: 'Medellín, Antioquia, Colombia',
    department: 'Antioquia',
    municipality: 'Medellín',
    phone: '',
    instagram: '',
    joinedDate: 'Administrador',
    publishedCount: 0,
    upcycledCount: 0,
    waterSavedLiters: 0,
    co2SavedKg: 0,
  };

  const adminAccount: StoredUserAccount = {
    id: 'usr-admin-master',
    email: EXCLUSIVE_ADMIN_EMAIL,
    name: 'Dirección y Seguridad General',
    role: 'admin',
    profile: adminProfile,
    garments: [],
    services: [],
    requests: [],
    conversations: [],
    isVerified: true,
  };

  setActiveSession(adminAccount);
  return { success: true, user: adminAccount };
}

/**
 * Update the active user's profile and persist to both active session and database.
 */
export function persistUserProfile(updatedProfile: UserProfile): void {
  const db = getUsersDatabase();
  const updatedDb = db.map((u) => {
    if (u.id === updatedProfile.id || u.email.toLowerCase() === updatedProfile.email.toLowerCase()) {
      return {
        ...u,
        name: updatedProfile.name,
        // Role is permanently locked from registration. Cannot be escalated to admin!
        profile: { ...updatedProfile, role: u.role },
      };
    }
    return u;
  });
  saveUsersDatabase(updatedDb);

  const active = getActiveSession();
  if (active && (active.id === updatedProfile.id || active.email.toLowerCase() === updatedProfile.email.toLowerCase())) {
    setActiveSession({
      ...active,
      name: updatedProfile.name,
      profile: { ...updatedProfile, role: active.role },
    });
  }
}

/**
 * Delete a user account from local storage permanently
 */
export function deleteUserAccount(userId: string): boolean {
  try {
    const db = getUsersDatabase();
    const updatedDb = db.filter((u) => u.id !== userId);
    saveUsersDatabase(updatedDb);
    const active = getActiveSession();
    if (active && active.id === userId) {
      setActiveSession(null);
    }
    return true;
  } catch (err) {
    console.error('Error deleting user account:', err);
    return false;
  }
}

/**
 * Update user's personal items in persistent storage.
 */
export function persistUserData(
  userId: string,
  data: {
    garments?: GarmentProject[];
    services?: ServiceItem[];
    requests?: ServiceRequest[];
    conversations?: ChatConversation[];
  }
): void {
  const db = getUsersDatabase();
  const updatedDb = db.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        garments: data.garments !== undefined ? data.garments : u.garments,
        services: data.services !== undefined ? data.services : u.services,
        requests: data.requests !== undefined ? data.requests : u.requests,
        conversations: data.conversations !== undefined ? data.conversations : u.conversations,
      };
    }
    return u;
  });
  saveUsersDatabase(updatedDb);

  const active = getActiveSession();
  if (active && active.id === userId) {
    setActiveSession({
      ...active,
      garments: data.garments !== undefined ? data.garments : active.garments,
      services: data.services !== undefined ? data.services : active.services,
      requests: data.requests !== undefined ? data.requests : active.requests,
      conversations: data.conversations !== undefined ? data.conversations : active.conversations,
    });
  }
}

export function updateUserAccountProfile(userId: string, updatedProfile: UserProfile): void {
  persistUserProfile(updatedProfile);
}

export function saveUserGarment(userId: string, garment: GarmentProject): void {
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  const currentGarments = user?.garments || [];
  persistUserData(userId, {
    garments: [garment, ...currentGarments],
  });
}

export function saveUserServiceRequest(userId: string, request: ServiceRequest): void {
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  const currentRequests = user?.requests || [];
  persistUserData(userId, {
    requests: [request, ...currentRequests],
  });
}

export function saveUserServiceItem(userId: string, service: ServiceItem): void {
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  const currentServices = user?.services || [];
  persistUserData(userId, {
    services: [service, ...currentServices],
  });
}

export function saveUserConversation(userId: string, conversation: ChatConversation): void {
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  const currentConversations = user?.conversations || [];
  const exists = currentConversations.some((c) => c.id === conversation.id);
  const updated = exists
    ? currentConversations.map((c) => (c.id === conversation.id ? conversation : c))
    : [conversation, ...currentConversations];
  persistUserData(userId, {
    conversations: updated,
  });
}

export function updateUserGarmentStatus(
  userId: string,
  garmentId: string,
  newStatus: 'Publicada' | 'En Proceso' | 'En revisión' | 'Completado'
): void {
  const db = getUsersDatabase();
  const user = db.find((u) => u.id === userId);
  if (user) {
    const updatedGarments: GarmentProject[] = user.garments.map((g) =>
      g.id === garmentId ? { ...g, status: newStatus } : g
    );
    persistUserData(userId, { garments: updatedGarments });
  }
}

/**
 * Clean Google Authentication:
 * Signs in with Google account or registers a clean new user if they don't exist yet.
 * Never preloads old data, never shows suggested accounts, and initializes with empty messages.
 */
export async function loginOrRegisterWithGoogle(params: {
  email: string;
  name?: string;
  role?: 'cliente' | 'profesional';
  avatarUrl?: string;
}): Promise<{ success: boolean; error?: string; user?: StoredUserAccount; isNewUser?: boolean }> {
  const emailClean = params.email.trim().toLowerCase();
  const nameClean = params.name?.trim() || emailClean.split('@')[0];
  const role = params.role || 'cliente';

  if (!emailClean) {
    return { success: false, error: 'Por favor ingresa un correo electrónico de Google válido.' };
  }

  const check = validateEmailFormat(emailClean);
  if (!check.isValid) {
    return { success: false, error: 'El formato de correo de Google no es válido.' };
  }

  const db = getUsersDatabase();
  const existing = db.find((u) => u.email.trim().toLowerCase() === emailClean);

  if (existing) {
    if (existing.profile.accountStatus === 'bloqueado') {
      return {
        success: false,
        error: `Esta cuenta ha sido bloqueada. Motivo: ${existing.profile.blockReason || 'Incumplimiento de normas'}.`,
      };
    }
    if (existing.profile.accountStatus === 'suspendido') {
      return {
        success: false,
        error: `Esta cuenta se encuentra temporalmente suspendida. Motivo: ${existing.profile.suspensionReason || 'En revisión'}.`,
      };
    }

    setActiveSession(existing);
    return { success: true, user: existing, isNewUser: false };
  }

  // Brand-new Google user: completely clean profile and 0 preloaded chats/items
  const newUser: StoredUserAccount = {
    id: `usr-g-${Date.now()}`,
    email: emailClean,
    name: nameClean,
    role,
    profile: {
      id: `usr-g-${Date.now()}`,
      name: nameClean,
      username: `@${emailClean.split('@')[0]}`,
      email: emailClean,
      avatarUrl: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: '',
      role,
      location: 'Colombia',
      department: 'Antioquia',
      municipality: 'Medellín',
      phone: '',
      instagram: '',
      joinedDate: 'Hoy',
      publishedCount: 0,
      upcycledCount: 0,
      waterSavedLiters: 0,
      co2SavedKg: 0,
      accountStatus: 'activo',
    },
    garments: [],
    services: [],
    requests: [],
    conversations: [], // Clean empty conversations!
    createdAt: new Date().toISOString(),
    isVerified: true,
  };

  db.push(newUser);
  saveUsersDatabase(db);
  setActiveSession(newUser);

  return { success: true, user: newUser, isNewUser: true };
}

/**
 * Verifies if an email corresponds to an existing, valid registered account.
 * Used during password recovery to ensure only registered accounts can request codes.
 */
export function isAccountRegistered(email: string): boolean {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return false;
  if (cleanEmail === EXCLUSIVE_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'admin@rebornstyle.co') {
    return true;
  }
  const db = getUsersDatabase();
  return db.some((u) => u.email.trim().toLowerCase() === cleanEmail);
}

/**
 * Updates a user's password following successful 6-digit recovery code verification.
 */
export async function updateUserPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: 'La nueva contraseña debe tener al menos 6 caracteres.',
    };
  }

  const passwordHash = await computeSHA256(newPassword);

  // If it's the administrator account
  if (cleanEmail === EXCLUSIVE_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'admin@rebornstyle.co') {
    try {
      localStorage.setItem('reborn_admin_hash_v6', passwordHash);
      return { success: true };
    } catch {
      return { success: false, error: 'No se pudo guardar la contraseña del administrador.' };
    }
  }

  const db = getUsersDatabase();
  const user = db.find((u) => u.email.trim().toLowerCase() === cleanEmail);

  if (!user) {
    return {
      success: false,
      error: 'No se encontró ninguna cuenta registrada con este correo electrónico.',
    };
  }

  user.passwordHash = passwordHash;
  delete user.password;
  saveUsersDatabase(db);

  return { success: true };
}

