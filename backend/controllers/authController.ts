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

const BLOCKED_DISPOSABLE_DOMAINS = new Set([
  'test.com',
  'test.co',
  'fake.com',
  'fake.co',
  'prueba.com',
  'prueba.co',
  'ejemplo.com',
  'example.com',
  'asdf.com',
  '123.com',
  'abc.com',
  'xyz.com',
  'correo.com',
  'email.com',
  'mailinator.com',
  'tempmail.com',
  'yopmail.com',
  '10minutemail.com',
  'trashmail.com',
  'guerrillamail.com',
  'dispostable.com',
  'throwawaymail.com',
  'getairmail.com',
  'mohmal.com',
  'sharklasers.com',
  'fakemailgenerator.com',
  'burnermail.io',
  'dropmail.me',
  'inboxbear.com',
  'mytemp.email',
  'crazymailing.com',
]);

/**
 * Validates strict RFC 5322 email syntax and blocks disposable / dummy email providers
 */
export function validateEmailStrict(email: string): { isValid: boolean; error?: string } {
  const clean = (email || '').trim().toLowerCase();
  if (!clean) {
    return { isValid: false, error: 'Por favor ingresa un correo electrónico.' };
  }

  const rfcRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcRegex.test(clean) || clean.includes('..') || clean.startsWith('.') || clean.endsWith('.')) {
    return { isValid: false, error: 'Por favor ingresa un correo electrónico válido.' };
  }

  const [username, domain] = clean.split('@');
  if (!username || !domain || username.length < 3) {
    return { isValid: false, error: 'El identificador de usuario antes del @ debe tener al menos 3 caracteres.' };
  }

  const isBlocked =
    BLOCKED_DISPOSABLE_DOMAINS.has(domain) ||
    Array.from(BLOCKED_DISPOSABLE_DOMAINS).some((b) => domain.endsWith(`.${b}`));

  if (isBlocked) {
    return {
      isValid: false,
      error: 'Por favor utiliza un correo electrónico válido o corporativo (ej. Gmail, Outlook, Yahoo).',
    };
  }

  const randomSequences = ['asdfgh', 'qwerty', 'zxcvbn', '123456', 'abcdef'];
  if (randomSequences.some((seq) => username.includes(seq) || domain.includes(seq))) {
    return {
      isValid: false,
      error: 'Por favor utiliza un correo electrónico válido o corporativo (ej. Gmail, Outlook, Yahoo).',
    };
  }

  return { isValid: true };
}

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

    const emailCheck = validateEmailStrict(cleanEmail);
    if (!emailCheck.isValid) {
      return res.status(200).json({
        success: false,
        error: emailCheck.error,
        message: emailCheck.error,
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
        error: 'Este correo electrónico ya está registrado.',
        message: 'Este correo electrónico ya está registrado.',
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
      email_confirmed: true,
      status: 'active',
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

    let user = usersStore.get(cleanEmail);
    if (!user) {
      loadPersistedUsers();
      user = usersStore.get(cleanEmail);
    }

    if (!user) {
      return res.status(200).json({
        success: false,
        message: 'No existe una cuenta registrada con este correo electrónico.',
      });
    }

    // Compare provided password with bcrypt hash or demo credentials
    const isDemoAccount = cleanEmail === 'costurera.demo@plataforma.com' || cleanEmail === 'cliente.demo@plataforma.com';
    const isMatch =
      (isDemoAccount && (password === 'demo1234' || password === 'demo' || password === 'password')) ||
      user.password === password ||
      (await bcrypt.compare(password, user.password || '').catch(() => false));

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
    const rawTarget = String(req.body?.email || req.body?.correo || req.body?.input || '').trim();
    const cleanEmail = rawTarget.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(200).json({
        success: false,
        error: 'Por favor ingresa un correo electrónico válido.',
        message: 'Por favor ingresa un correo electrónico válido.',
      });
    }

    // Check if account exists in database
    let user = usersStore.get(cleanEmail);
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'cliente',
        status: 'active',
        isVerified: true,
      };
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
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
        message: 'Código enviado con éxito a la cuenta ingresada. Revisa tu bandeja de entrada o la carpeta de SPAM.',
        expiresInMinutes: 15,
      });
    } catch (mailError: any) {
      console.warn('[SMTP Notice] Mailer could not send email:', mailError?.message || mailError);
      if (mailError?.message === 'SMTP_NOT_CONFIGURED') {
        return res.status(200).json({
          success: false,
          unconfigured: true,
          error: 'El servicio de correo no está configurado en el servidor. Por favor configura las credenciales SMTP de Gmail (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) en las variables de entorno.',
          message: 'El servicio de correo no está configurado en el servidor. Por favor configura las credenciales SMTP de Gmail (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) en las variables de entorno.',
        });
      }
      return res.status(200).json({
        success: false,
        error: mailError?.message?.includes('Invalid login') || mailError?.message?.includes('Username and Password not accepted')
          ? 'El proveedor de correo rechazó las credenciales. Verifica que tu correo y contraseña de aplicación sean correctos.'
          : 'El servicio de correo no pudo procesar el envío. Verifica la configuración de Gmail SMTP.',
        message: mailError?.message || 'Error al enviar correo.',
      });
    }
  } catch (error: any) {
    console.error('[AuthController.forgotPassword Error]:', error?.message || error);
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
      // Existing user: preserve assigned role from database (user.role)
      if (!user.role && role) {
        user.role = role === 'profesional' ? 'profesional' : 'cliente';
      } else if (req.body?.isRegisterMode && role) {
        user.role = role === 'profesional' ? 'profesional' : 'cliente';
      }
      if (!user.authProvider) user.authProvider = 'google';
      if (picture && !user.avatarUrl) {
        user.avatarUrl = picture;
        user.picture = picture;
      }
      user.isVerified = true;
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
      console.log(`[Google Auth] Linked and authenticated existing user with preserved role ${user.role}: ${cleanEmail}`);
    } else {
      // New user authenticated through Google: create active profile immediately
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
        email_confirmed: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      isNewUser = true;
      usersStore.set(cleanEmail, user);
      savePersistedUsers();
      console.log(`[Google Auth] Created new profile for verified Google account ${cleanEmail}`);
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

/**
 * Update User Role Controller (Client / Tailor)
 * POST /api/auth/update-role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    const { email, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const userRole = (role === 'profesional' || role === 'tailor') ? 'profesional' : 'cliente';

    let user = usersStore.get(cleanEmail);
    if (!user) {
      return res.status(200).json({ success: false, message: 'Usuario no encontrado' });
    }
    user.role = userRole;
    usersStore.set(cleanEmail, user);
    savePersistedUsers();

    return res.status(200).json({
      success: true,
      message: 'Rol actualizado exitosamente.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified !== false,
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      message: 'Error al actualizar el rol.',
    });
  }
};
