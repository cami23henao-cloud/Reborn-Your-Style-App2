const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRecoveryCodeEmail } = require('../services/mailer');

// JWT Secret Key from server environment
const JWT_SECRET = process.env.JWT_SECRET || 'reborn_your_style_secure_jwt_secret_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory data structures for users and recovery codes
// Compatible with database integrations or persistent storage
const usersStore = new Map();
const recoveryCodesStore = new Map();

/**
 * Helper to generate JWT Token for authenticated sessions
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * User Registration Controller
 * POST /api/auth/register
 */
const register = async (req, res) => {
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
  } catch (error) {
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
const login = async (req, res) => {
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
        message: 'Correo o contraseña incorrectos.',
      });
    }

    // Compare provided password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: 'Correo o contraseña incorrectos.',
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
  } catch (error) {
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
const getSession = async (req, res) => {
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

    const decoded = jwt.verify(token, JWT_SECRET);

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
  } catch (error) {
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
const forgotPassword = async (req, res) => {
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
    } catch (mailError) {
      console.warn('[SMTP Notice] Mailer could not send email:', mailError.message);
      // Graceful fallback: return success without leaking technical SMTP errors to user
      return res.status(200).json({
        success: true,
        message: 'Hemos generado el código de recuperación para tu cuenta.',
        code, // Provided for testing resilience when SMTP is unconfigured in development
      });
    }
  } catch (error) {
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
const verifyRecoveryCode = async (req, res) => {
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
  } catch (error) {
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
const resetPassword = async (req, res) => {
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
      const decoded = jwt.verify(resetToken, JWT_SECRET);
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
    }

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    });
  } catch (error) {
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
const logout = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente.',
  });
};

module.exports = {
  register,
  login,
  getSession,
  forgotPassword,
  verifyRecoveryCode,
  resetPassword,
  logout,
  usersStore,
};
