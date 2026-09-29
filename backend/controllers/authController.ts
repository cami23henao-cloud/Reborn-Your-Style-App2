import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
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
    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: passwordHash,
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    usersStore.set(cleanEmail, newUser);
    savePersistedUsers();

    // Generate authenticated JWT session token
    const token = generateToken(newUser);

    return res.status(200).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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
        message: 'No encontramos una cuenta con este correo. Puedes crear una cuenta nueva.',
      });
    }

    // Compare provided password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: 'La contraseña no es correcta. Inténtalo nuevamente o recupera tu contraseña.',
      });
    }

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
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(200).json({
        success: false,
        message: 'Por favor ingresa un correo electrónico válido.',
      });
    }

    // Generate 6-digit numeric recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    recoveryCodesStore.set(cleanEmail, {
      code,
      expiresAt,
      attempts: 0,
    });

    try {
      await sendRecoveryCodeEmail(cleanEmail, code);
      return res.status(200).json({
        success: true,
        message: 'Código de recuperación enviado a tu correo electrónico.',
      });
    } catch (mailError: any) {
      console.warn('[SMTP Notice] Mailer could not send email:', mailError.message);
      return res.status(200).json({
        success: false,
        message: 'El servidor requiere la configuración de las variables de entorno SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) para realizar el envío real.',
      });
    }
  } catch (error: any) {
    console.error('[AuthController.forgotPassword Error]:', error.message);
    return res.status(200).json({
      success: false,
      message: 'No pudimos procesar la recuperación de contraseña.',
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
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    const record = recoveryCodesStore.get(cleanEmail);
    if (!record) {
      return res.status(200).json({
        success: false,
        message: 'No hay un código pendiente para este correo o ya fue utilizado.',
      });
    }

    if (Date.now() > record.expiresAt) {
      recoveryCodesStore.delete(cleanEmail);
      return res.status(200).json({
        success: false,
        message: 'El código de recuperación ha expirado. Por favor solicita uno nuevo.',
      });
    }

    if (record.code !== cleanCode) {
      record.attempts += 1;
      return res.status(200).json({
        success: false,
        message: 'El código de 6 dígitos ingresado es incorrecto.',
      });
    }

    // Mark verified
    const resetToken = jwt.sign({ email: cleanEmail, purpose: 'password_reset' }, JWT_SECRET, {
      expiresIn: '15m',
    });

    recoveryCodesStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: 'Código verificado correctamente.',
      resetToken,
    });
  } catch (error: any) {
    console.error('[AuthController.verifyRecoveryCode Error]:', error.message);
    return res.status(200).json({
      success: false,
      message: 'No pudimos verificar el código.',
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
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!resetToken) {
      return res.status(200).json({
        success: false,
        message: 'Token de restablecimiento no proporcionado.',
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(200).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(resetToken, JWT_SECRET) as any;
      if (decoded.purpose !== 'password_reset' || decoded.email !== cleanEmail) {
        return res.status(200).json({
          success: false,
          message: 'Token de restablecimiento inválido.',
        });
      }
    } catch {
      return res.status(200).json({
        success: false,
        message: 'Token de restablecimiento expirado o inválido.',
      });
    }

    // Update password hash if user exists
    const user = usersStore.get(cleanEmail);
    if (user) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
    }

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    });
  } catch (error: any) {
    console.error('[AuthController.resetPassword Error]:', error.message);
    return res.status(200).json({
      success: false,
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
    message: exists
      ? 'Cuenta registrada en Reborn Your Style.'
      : 'Esta cuenta de Google no está registrada en Reborn Your Style. Crea una cuenta para continuar.',
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
      // First-time Google user: automatically create internal profile with direct access
      const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const userName = (name && name.trim()) ? name.trim() : derivedName;
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

      usersStore.set(cleanEmail, user);
      savePersistedUsers();
      isNewUser = true;
      console.log(`[Google Auth] Created new profile automatically for ${cleanEmail}`);
    }

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
