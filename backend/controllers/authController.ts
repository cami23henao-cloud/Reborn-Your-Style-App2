import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sendRecoveryCodeEmail } from '../services/mailer';

// JWT Secret Key from server environment
const JWT_SECRET = process.env.JWT_SECRET || 'reborn_your_style_secure_jwt_secret_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Data structures for users and recovery codes with disk persistence
export const usersStore = new Map<string, any>();
export const recoveryCodesStore = new Map<string, any>();

const USERS_FILE_PATH = path.resolve(process.cwd(), 'backend/data/users.json');

function loadPersistedUsers() {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach((u: any) => {
          if (u.email) {
            usersStore.set(u.email.trim().toLowerCase(), u);
          }
        });
      }
    }
  } catch (err) {
    console.error('Error loading users from disk:', err);
  }
}

export function savePersistedUsers() {
  try {
    const list = Array.from(usersStore.values());
    fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true });
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

// Initial load on server startup
loadPersistedUsers();

/**
 * Helper to generate JWT Token for authenticated sessions
 */
export const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );
};

/**
 * User Registration Controller
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { name, email, password, role } = req.body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const userRole = role === 'profesional' ? 'profesional' : 'cliente';

    if (!cleanName) {
      return res.status(200).json({
        success: false,
        message: 'Por favor ingresa tu nombre completo o nombre del taller.',
      });
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(200).json({
        success: false,
        message: 'Por favor ingresa un correo electrónico válido.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(200).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Check if user already exists
    if (usersStore.has(cleanEmail)) {
      return res.status(200).json({
        success: false,
        message: 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
      });
    }

    // Hash password securely with bcrypt salt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: passwordHash,
      role: userRole,
      isVerified: true,
      createdAt: nowIso,
      lastLoginAt: nowIso,
    };

    usersStore.set(cleanEmail, newUser);
    savePersistedUsers();

    // Generate authenticated JWT session token
    const token = generateToken(newUser);

    return res.status(200).json({
      success: true,
      message: 'Cuenta creada y verificada exitosamente.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: true,
        createdAt: newUser.createdAt,
        lastLoginAt: newUser.lastLoginAt,
      },
    });
  } catch (error: any) {
    console.error('[AuthController.register Error]:', error.message);
    return res.status(200).json({
      success: false,
      message: 'No pudimos procesar el registro. Por favor intenta nuevamente.',
    });
  }
};

/**
 * Secure User Login Controller
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(200).json({
        success: false,
        message: 'Por favor proporciona tu correo y contraseña.',
      });
    }

    const user = usersStore.get(cleanEmail);
    if (!user) {
      return res.status(200).json({
        success: false,
        message: 'No existe una cuenta registrada con este correo electrónico.',
      });
    }

    // Compare provided password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: 'Contraseña incorrecta. Inténtalo de nuevo.',
      });
    }

    if (user.isVerified === false) {
      return res.status(200).json({
        success: false,
        message: 'Tu cuenta aún no ha sido verificada. Por favor confirma el código enviado a tu correo antes de iniciar sesión.',
      });
    }

    // Update last access timestamp
    user.lastLoginAt = new Date().toISOString();
    usersStore.set(cleanEmail, user);
    savePersistedUsers();

    // Generate JWT Session Token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified !== false,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        avatarUrl: user.picture || user.avatarUrl || null,
      },
    });
  } catch (error: any) {
    console.error('[AuthController.login Error]:', error.message);
    return res.status(200).json({
      success: false,
      message: 'No pudimos procesar el inicio de sesión. Por favor intenta nuevamente.',
    });
  }
};

/**
 * Session Validation & Profile Retrieval
 * GET /api/auth/session
 */
export const getSession = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({
        success: false,
        message: 'No se proporcionó token de sesión.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(200).json({
        success: false,
        message: 'Token de sesión vacío.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return res.status(200).json({
      success: true,
      message: 'Sesión válida.',
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch {
    return res.status(200).json({
      success: false,
      message: 'Sesión no válida o expirada.',
    });
  }
};

/**
 * Password Recovery Request
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(200).json({
        success: false,
        error: 'Por favor ingresa un correo electrónico válido.',
        message: 'Por favor ingresa un correo electrónico válido.',
      });
    }

    // Check if account exists in database
    const user = usersStore.get(cleanEmail);
    const exists =
      Boolean(user) ||
      cleanEmail === 'admin@rebornyourstyle.com' ||
      cleanEmail === 'admin@rebornstyle.co' ||
      cleanEmail === 'alex.moreno@rebornyourstyle.co' ||
      cleanEmail === 'cami23henao@gmail.com';

    if (!exists) {
      return res.status(200).json({
        success: false,
        exists: false,
        error: 'No existe una cuenta asociada a este correo electrónico.',
        message: 'No existe una cuenta asociada a este correo electrónico.',
      });
    }

    // Generate cryptographically secure 6-digit numeric recovery code (valid for 15 minutes)
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const existingRecord = recoveryCodesStore.get(cleanEmail);
    if (existingRecord && existingRecord.lastRequestedAt && Date.now() - existingRecord.lastRequestedAt < 60000) {
      return res.status(200).json({
        success: false,
        error: 'Por favor espera un minuto antes de solicitar un nuevo código de verificación.',
        message: 'Por favor espera un minuto antes de solicitar un nuevo código de verificación.',
      });
    }

    try {
      await sendRecoveryCodeEmail(cleanEmail, code);

      recoveryCodesStore.set(cleanEmail, {
        code: '',
        codeHash,
        expiresAt,
        attempts: 0,
        lastRequestedAt: Date.now(),
        purpose: 'recovery',
      } as any);

      // Save hash directly to the user in database
      if (user) {
        user.reset_code_hash = codeHash;
        user.reset_expires_at = new Date(expiresAt).toISOString();
        delete user.reset_code;
        usersStore.set(cleanEmail, user);
        savePersistedUsers();
      }

      return res.status(200).json({
        success: true,
        exists: true,
        message: 'Enviamos un código de verificación a tu correo electrónico.',
        expiresInMinutes: 15,
      });
    } catch (mailError: any) {
      console.warn('[SMTP Notice] Mailer could not send email:', mailError.message);
      return res.status(200).json({
        success: false,
        error: 'No pudimos enviar el código. Inténtalo nuevamente.',
        message: 'No pudimos enviar el código. Inténtalo nuevamente.',
      });
    }
  } catch (error: any) {
    console.error('[AuthController.forgotPassword Error]:', error.message);
    return res.status(200).json({
      success: false,
      error: 'No pudimos enviar el código. Inténtalo nuevamente.',
      message: 'No pudimos enviar el código. Inténtalo nuevamente.',
    });
  }
};

/**
 * Verify Recovery Code
 * POST /api/auth/verify-recovery-code
 */
export const verifyRecoveryCode = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { email, code } = req.body;
    const cleanEmail = (email || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode || cleanCode.length !== 6) {
      return res.status(200).json({
        success: false,
        error: 'Por favor ingresa el código de 6 dígitos completo.',
        message: 'Por favor ingresa el código de 6 dígitos completo.',
      });
    }

    const record = recoveryCodesStore.get(cleanEmail) as any;
    const user = usersStore.get(cleanEmail);

    const validHash = record?.codeHash || user?.reset_code_hash;
    const validExpiry = record?.expiresAt || (user?.reset_expires_at ? new Date(user.reset_expires_at).getTime() : 0);

    if (!validHash) {
      return res.status(200).json({
        success: false,
        error: 'No hay un código pendiente para este correo o ya fue utilizado.',
        message: 'No hay un código pendiente para este correo o ya fue utilizado.',
      });
    }

    if (Date.now() > validExpiry) {
      recoveryCodesStore.delete(cleanEmail);
      if (user) {
        user.reset_code_hash = '';
        savePersistedUsers();
      }
      return res.status(200).json({
        success: false,
        error: 'El código de recuperación ha expirado. Por favor solicita uno nuevo.',
        message: 'El código de recuperación ha expirado. Por favor solicita uno nuevo.',
      });
    }

    if (record && record.attempts >= 5) {
      recoveryCodesStore.delete(cleanEmail);
      if (user) {
        user.reset_code_hash = '';
        savePersistedUsers();
      }
      return res.status(200).json({
        success: false,
        error: 'Has superado el número máximo de intentos permitidos. Por seguridad solicita un nuevo código.',
        message: 'Has superado el número máximo de intentos permitidos. Por seguridad solicita un nuevo código.',
      });
    }

    const submittedHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    if (submittedHash !== validHash) {
      if (record) {
        record.attempts = (record.attempts || 0) + 1;
        const remaining = 5 - record.attempts;
        if (remaining <= 0) {
          recoveryCodesStore.delete(cleanEmail);
          if (user) {
            user.reset_code_hash = '';
            savePersistedUsers();
          }
          return res.status(200).json({
            success: false,
            error: 'Has superado el número máximo de intentos permitidos. Por seguridad solicita un nuevo código.',
            message: 'Has superado el número máximo de intentos permitidos. Por seguridad solicita un nuevo código.',
          });
        }
        return res.status(200).json({
          success: false,
          error: `El código ingresado es incorrecto (${remaining} intento${remaining === 1 ? '' : 's'} restante${remaining === 1 ? '' : 's'}).`,
          message: `El código ingresado es incorrecto (${remaining} intento${remaining === 1 ? '' : 's'} restante${remaining === 1 ? '' : 's'}).`,
        });
      }
      return res.status(200).json({
        success: false,
        error: 'El código de 6 dígitos ingresado es incorrecto.',
        message: 'El código de 6 dígitos ingresado es incorrecto.',
      });
    }

    // Mark verified: generate reset token and invalidate used OTP immediately
    const resetToken = jwt.sign({ email: cleanEmail, purpose: 'password_reset' }, JWT_SECRET, {
      expiresIn: '15m',
    });

    recoveryCodesStore.delete(cleanEmail);
    if (user) {
      user.reset_code_hash = '';
      user.reset_expires_at = '';
      user.reset_token = resetToken;
      savePersistedUsers();
    }

    return res.status(200).json({
      success: true,
      message: 'Código verificado correctamente.',
      resetToken,
    });
  } catch (error: any) {
    console.error('[AuthController.verifyRecoveryCode Error]:', error.message);
    return res.status(200).json({
      success: false,
      error: 'No pudimos verificar el código. Por favor intenta nuevamente.',
      message: 'No pudimos verificar el código. Por favor intenta nuevamente.',
    });
  }
};

/**
 * Reset Password with Verified Token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { email, resetToken, newPassword } = req.body;
    const cleanEmail = (email || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();

    if (!resetToken) {
      return res.status(200).json({
        success: false,
        error: 'Token de restablecimiento no proporcionado.',
        message: 'Token de restablecimiento no proporcionado.',
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(200).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres.',
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(resetToken, JWT_SECRET) as any;
      if (decoded.purpose !== 'password_reset' || decoded.email !== cleanEmail) {
        return res.status(200).json({
          success: false,
          error: 'Token de restablecimiento inválido.',
          message: 'Token de restablecimiento inválido.',
        });
      }
    } catch {
      return res.status(200).json({
        success: false,
        error: 'Token de restablecimiento expirado o inválido.',
        message: 'Token de restablecimiento expirado o inválido.',
      });
    }

    // Update password hash if user exists
    const user = usersStore.get(cleanEmail);
    if (user) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
      delete user.reset_code;
      delete user.reset_expires_at;
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
    }

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    });
  } catch (error: any) {
    console.error('[AuthController.resetPassword Error]:', error.message);
    return res.status(200).json({
      success: false,
      error: 'No pudimos restablecer la contraseña. Intenta nuevamente.',
      message: 'No pudimos restablecer la contraseña. Intenta nuevamente.',
    });
  }
};

/**
 * Session Logout
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente.',
  });
};

/**
 * Check if user is registered in database
 * POST /api/auth/check-user
 */
export const checkUser = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const { email } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail) {
    return res.status(200).json({
      success: false,
      exists: false,
      message: 'Correo no válido',
    });
  }

  const user = usersStore.get(cleanEmail);
  const exists =
    Boolean(user) ||
    cleanEmail === 'admin@rebornyourstyle.com' ||
    cleanEmail === 'admin@rebornstyle.co' ||
    cleanEmail === 'alex.moreno@rebornyourstyle.co';

  const isGoogleUser = Boolean(user?.authProvider === 'google');

  return res.status(200).json({
    success: true,
    exists,
    isGoogleUser,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'cliente',
          avatarUrl: user.avatarUrl || user.picture || null,
        }
      : exists && cleanEmail === 'alex.moreno@rebornyourstyle.co'
      ? {
          id: 'usr-alex-moreno',
          name: 'Álex Moreno',
          email: 'alex.moreno@rebornyourstyle.co',
          role: 'cliente',
          avatarUrl: null,
        }
      : exists && (cleanEmail === 'admin@rebornyourstyle.com' || cleanEmail === 'admin@rebornstyle.co')
      ? {
          id: 'usr-admin',
          name: 'Administrador Reborn',
          email: cleanEmail,
          role: 'admin',
          avatarUrl: null,
        }
      : null,
    message: exists
      ? 'Cuenta registrada en Reborn Your Style.'
      : 'Esta cuenta de Google todavía no está registrada en Reborn Your Style.',
  });
};

/**
 * Strict Google Login for Existing Users Only
 * POST /api/auth/google/login
 */
export const googleLogin = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { email, name, picture, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Rigorous email validation (valid format, no dummy/fake emails)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(200).json({
        success: false,
        message: 'Por favor ingresa un correo electrónico de Google válido y real.',
      });
    }

    // Reject obvious placeholders or fake strings
    const domain = cleanEmail.split('@')[1];
    if (
      domain === 'test.com' ||
      domain === 'test' ||
      domain === 'fake.com' ||
      domain === 'ejemplo.com' ||
      domain === 'example.com' ||
      cleanEmail.startsWith('test@') ||
      cleanEmail.startsWith('fake@')
    ) {
      return res.status(200).json({
        success: false,
        message: 'No se permiten correos ficticios o de prueba. Ingresa una cuenta real de Google.',
      });
    }

    let user = usersStore.get(cleanEmail);
    let isNewUser = false;

    if (user) {
      // Existing user (e.g. registered previously via email/password): link to Google without duplicating
      if (!user.authProvider) user.authProvider = 'google';
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
        user.picture = picture;
      }
      user.isVerified = true;
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
      console.log(`[Google Auth] Linked and authenticated existing user: ${cleanEmail}`);
    } else {
      // If user is not registered and request did not explicitly confirm account creation:
      // Requirement 3: "Si no está registrada: no crear automáticamente una cuenta; mostrar la opción de crear una cuenta."
      const { createAccount } = req.body;
      const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const userName = (name && name.trim()) ? name.trim() : derivedName;

      if (!createAccount) {
        return res.status(200).json({
          success: false,
          notRegistered: true,
          email: cleanEmail,
          name: userName,
          picture: picture || null,
          message: 'Esta cuenta de Google todavía no está registrada en Reborn Your Style.',
        });
      }

      // User confirmed creation: create profile
      const userRole = role === 'profesional' ? 'profesional' : 'cliente';
      user = {
        id: `usr-g-${Date.now()}`,
        name: userName,
        email: cleanEmail,
        role: userRole,
        authProvider: 'google',
        picture: picture || null,
        avatarUrl: picture || null,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      isNewUser = true;
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
      console.log(`[Google Auth] Created new profile upon user confirmation for ${cleanEmail}`);
    }

    // Update last access timestamp
    user.lastLoginAt = new Date().toISOString();
    usersStore.set(cleanEmail, user);
    savePersistedUsers();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: isNewUser ? '¡Bienvenido(a) a Reborn Your Style con tu cuenta de Google!' : 'Inicio de sesión con Google exitoso.',
      token,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified !== false,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLoginAt: user.lastLoginAt,
        avatarUrl: user.picture || user.avatarUrl || null,
      },
    });
  } catch (error: any) {
    console.error('[AuthController.googleLogin Error]:', error.message);
    return res.status(200).json({
      success: false,
      message: 'No pudimos procesar la autenticación con Google. Por favor intenta nuevamente.',
    });
  }
};
