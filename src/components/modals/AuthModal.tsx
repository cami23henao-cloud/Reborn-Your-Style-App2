import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../BrandLogo';
import {
  registerVerifiedUser,
  loginUser,
  loginAdministrator,
  loginWithGoogleExistingOnly,
  updateUserPassword,
  isAccountRegistered,
  getUsersDatabase,
  StoredUserAccount
} from '../../services/userStore';
import {
  validateEmailFormat,
  EXCLUSIVE_ADMIN_EMAIL
} from '../../services/securityService';

// Safe API helper that strictly parses JSON and never crashes on HTML or network errors
async function safeApiCall<T = any>(
  url: string,
  method: 'GET' | 'POST' = 'POST',
  body?: any
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const text = await res.text();

    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<!doctype') || text.includes('<html')) {
      return {
        success: false,
        error: 'No pudimos conectar con el servicio en este momento. Por favor intenta nuevamente.',
      };
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: 'No pudimos procesar la respuesta del servidor. Por favor intenta nuevamente.',
      };
    }

    if (!res.ok || parsed.success === false) {
      return {
        success: false,
        error: parsed.error || parsed.message || 'No pudimos completar tu solicitud.',
        data: parsed,
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch {
    return {
      success: false,
      error: 'No fue posible conectar con el servidor. Revisa tu conexión a internet.',
    };
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAccount: (account: StoredUserAccount) => void;
  initialMode?: 'login' | 'register';
}

type AuthViewMode = 'login' | 'register' | 'forgot_password' | 'admin';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginAccount,
  initialMode = 'login',
}) => {
  // Navigation View State
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode === 'register' ? 'register' : 'login');
  const [selectedRole, setSelectedRole] = useState<'cliente' | 'profesional'>('cliente');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Recovery Flow: 1 ('request') -> 2 ('verify') -> 3 ('new_password')
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryResetToken, setRecoveryResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Google OAuth State & Strict Existing User Check
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState('');
  const [unregisteredGoogleEmail, setUnregisteredGoogleEmail] = useState('');
  const [showGoogleNotRegistered, setShowGoogleNotRegistered] = useState(false);

  // Admin access
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset all states when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode === 'register' ? 'register' : 'login');
      setSelectedRole('cliente');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setRecoveryStep('request');
      setRecoveryEmail('');
      setRecoveryCodeInput('');
      setRecoveryResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setShowGoogleConfig(false);
      setGoogleClientIdInput('');
      setUnregisteredGoogleEmail('');
      setShowGoogleNotRegistered(false);
      setAdminEmail('');
      setAdminPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  // Resend code cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Helper to process an authenticated Google Email strictly against Reborn Your Style database
  const processGoogleEmail = async (
    rawEmail: string,
    extraProfile?: { name?: string; picture?: string }
  ) => {
    const cleanEmail = (rawEmail || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor selecciona una cuenta de Google válida.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setShowGoogleNotRegistered(false);

    // 1. Check in local registered database
    let isRegistered = isAccountRegistered(cleanEmail);

    // 2. Also verify in backend database
    if (!isRegistered) {
      const checkRes = await safeApiCall<{ exists: boolean }>('/api/auth/check-user', 'POST', {
        email: cleanEmail,
      });
      if (checkRes.success && checkRes.data?.exists) {
        isRegistered = true;
      }
    }

    // A) If user is in REGISTRATION mode:
    if (viewMode === 'register') {
      if (isRegistered) {
        setIsLoading(false);
        setErrorMsg('Esta cuenta de Google ya está registrada en Reborn Your Style. Por favor inicia sesión.');
        return;
      }

      // Create new verified account with chosen role and real Google details
      try {
        const regRes = await registerVerifiedUser({
          name: extraProfile?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: selectedRole,
          avatarUrl: extraProfile?.picture,
        });

        setIsLoading(false);
        if (regRes.success && regRes.user) {
          setSuccessMsg(`¡Bienvenido(a) a Reborn Your Style, ${regRes.user.name}!`);
          setTimeout(() => {
            onLoginAccount(regRes.user!);
            onClose();
          }, 600);
        } else {
          setErrorMsg(regRes.error || 'No fue posible registrar la cuenta con Google.');
        }
      } catch {
        setIsLoading(false);
        setErrorMsg('No pudimos procesar el registro con Google. Inténtalo nuevamente.');
      }
      return;
    }

    // B) If user is in LOGIN mode:
    // STRICT RULE: If the account does NOT exist in Reborn Your Style:
    // - Deny access
    // - Do NOT create an account
    // - Do NOT create a profile
    // - Do NOT login
    // - Show the exact professional message requested
    if (!isRegistered) {
      setIsLoading(false);
      setUnregisteredGoogleEmail(cleanEmail);
      setShowGoogleNotRegistered(true);
      setErrorMsg('Esta cuenta de Google no está registrada en Reborn Your Style. Crea una cuenta antes de iniciar sesión.');
      return;
    }

    // Account exists: login securely to the existing account
    try {
      const result = await loginWithGoogleExistingOnly(cleanEmail);
      setIsLoading(false);

      if (result.success && result.user) {
        setSuccessMsg(`¡Bienvenido(a) de nuevo, ${result.user.name}!`);
        setTimeout(() => {
          onLoginAccount(result.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.error || 'No fue posible iniciar sesión con esta cuenta de Google.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar la autenticación. Por favor intenta nuevamente.');
    }
  };

  // Listen for Google OAuth postMessage if popup flow is used
  useEffect(() => {
    const handleGoogleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.user) {
        const gUser = event.data.user;
        await processGoogleEmail(gUser.email);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsLoading(false);
        setErrorMsg('Acceso con Google no completado: ' + (event.data.error || 'Operación cancelada'));
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, [onLoginAccount, onClose]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  // 1. Standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(cleanEmail, cleanPassword);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`¡Bienvenido(a) de nuevo, ${res.user.name}!`);
        setTimeout(() => {
          onLoginAccount(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.error || 'Correo o contraseña incorrectos.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // 2. Standard Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Por favor ingresa tu nombre completo o nombre de tu taller.');
      return;
    }

    const emailCheck = validateEmailFormat(cleanEmail);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.error || 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (isAccountRegistered(cleanEmail)) {
      setErrorMsg('Este correo ya está registrado en Reborn Your Style. Por favor inicia sesión.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    try {
      // Sync with backend API
      await safeApiCall('/api/auth/register', 'POST', {
        name: cleanName,
        email: cleanEmail,
        password,
        role: selectedRole,
      });

      // Save in persistent verified users database
      const res = await registerVerifiedUser({
        name: cleanName,
        email: cleanEmail,
        password,
        role: selectedRole,
      });

      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`¡Cuenta creada con éxito! Bienvenido(a) a Reborn Your Style, ${cleanName}.`);
        setTimeout(() => {
          onLoginAccount(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || 'No fue posible registrar la cuenta. Intenta nuevamente.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // 3. Initiate "Continuar con Google" with prompt=select_account
  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setShowGoogleNotRegistered(false);

    // Check if Google Client ID is configured
    let effectiveClientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('reborn_google_client_id') ||
      '';

    if (!effectiveClientId) {
      const cfg = await safeApiCall<{ configured: boolean; clientId?: string }>('/api/auth/google/config', 'GET');
      if (cfg.success && cfg.data?.clientId) {
        effectiveClientId = cfg.data.clientId;
      }
    }

    const gClient = (window as any).google?.accounts?.oauth2;

    // If official Google Identity Services client is available with client_id, open official Google selector
    if (gClient && effectiveClientId) {
      try {
        setIsLoading(true);
        const tokenClient = gClient.initTokenClient({
          client_id: effectiveClientId,
          scope: 'email profile openid',
          prompt: 'select_account', // Explicitly request account chooser
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsLoading(false);
              setErrorMsg('Acceso con Google cancelado o no completado.');
              return;
            }
            if (tokenResponse.access_token) {
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await userRes.json();
                if (googleProfile && googleProfile.email) {
                  await processGoogleEmail(googleProfile.email, {
                    name: googleProfile.name,
                    picture: googleProfile.picture,
                  });
                  return;
                }
              } catch {
                setIsLoading(false);
                setErrorMsg('No pudimos obtener la información de tu cuenta de Google.');
                return;
              }
            }
            setIsLoading(false);
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch {
        setIsLoading(false);
      }
    }

    // If client ID is not configured yet, show clean configuration prompt for real Google OAuth Client ID
    setIsLoading(false);
    setShowGoogleConfig(true);
  };

  // Save Google OAuth Client ID for real Google Identity Services
  const handleSaveGoogleClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = googleClientIdInput.trim();
    if (!cleanId) {
      setErrorMsg('Por favor ingresa un Google Client ID válido.');
      return;
    }
    localStorage.setItem('reborn_google_client_id', cleanId);
    setShowGoogleConfig(false);
    setErrorMsg('');
    setSuccessMsg('Google Client ID configurado correctamente. Conectando con Google...');
    setTimeout(() => {
      setSuccessMsg('');
      handleGoogleClick();
    }, 400);
  };

  // 5. Password Recovery - Step 1: Request 6-digit Code (Real Email Dispatch)
  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Verify account exists
    if (!isAccountRegistered(cleanEmail)) {
      setErrorMsg('No encontramos ninguna cuenta registrada con este correo electrónico. Por favor verifica o crea una cuenta.');
      return;
    }

    setIsLoading(true);
    const res = await safeApiCall<{ configured?: boolean; message?: string }>('/api/auth/send-recovery-code', 'POST', {
      email: cleanEmail,
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Hemos enviado un código de seguridad de 6 dígitos a tu correo electrónico.');
      setRecoveryStep('verify');
      setResendCooldown(60);
    } else {
      setErrorMsg(res.error || 'No pudimos procesar el envío del código. Revisa la configuración del servidor.');
    }
  };

  // 6. Password Recovery - Step 2: Verify 6-digit Code
  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCode = recoveryCodeInput.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('Por favor ingresa el código completo de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    const res = await safeApiCall<{ resetToken?: string }>('/api/auth/verify-recovery-code', 'POST', {
      email: recoveryEmail.trim().toLowerCase(),
      code: cleanCode,
    });
    setIsLoading(false);

    if (res.success && res.data?.resetToken) {
      setRecoveryResetToken(res.data.resetToken);
      setRecoveryStep('new_password');
      setSuccessMsg('Código verificado con éxito. Ahora define tu nueva contraseña.');
    } else {
      setErrorMsg(res.error || 'El código ingresado es incorrecto o ha expirado.');
    }
  };

  // 7. Password Recovery - Step 3: Set New Password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    // Invalidate reset token on server
    await safeApiCall('/api/auth/reset-password', 'POST', {
      email: recoveryEmail.trim().toLowerCase(),
      resetToken: recoveryResetToken,
      newPassword,
    });

    // Update password in persistent users database
    const updateRes = await updateUserPassword(recoveryEmail.trim().toLowerCase(), newPassword);
    setIsLoading(false);

    if (updateRes.success) {
      setSuccessMsg('¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.');
      setEmail(recoveryEmail);
      setPassword('');
      setTimeout(() => {
        setViewMode('login');
      }, 1000);
    } else {
      setErrorMsg(updateRes.error || 'No pudimos actualizar la contraseña. Intenta nuevamente.');
    }
  };

  // 8. Administrative Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Por favor ingresa el correo del administrador.');
      return;
    }
    if (!adminPassword) {
      setErrorMsg('Por favor ingresa la clave de administrador.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAdministrator(cleanEmail, adminPassword);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg('Acceso de dirección administrativa concedido.');
        setTimeout(() => {
          onLoginAccount(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.error || 'Credenciales administrativas no válidas.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#efeee9] overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#012d1d] via-[#2b694d] to-[#b0f1cc]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] text-[#414844] hover:text-[#1b1c19] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <BrandLogo size="md" className="mb-2" />
            <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
              Reborn Your Style
            </h2>
            <p className="text-xs text-[#717973] font-medium">
              Moda Circular y Suprareciclaje Textil
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && !showGoogleNotRegistered && (
            <div className="mb-5 p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-start gap-2.5 text-xs text-[#991b1b]">
              <span className="material-symbols-outlined text-[18px] text-[#dc2626] shrink-0 mt-0.5">
                error
              </span>
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-start gap-2.5 text-xs text-[#166534]">
              <span className="material-symbols-outlined text-[18px] text-[#16a34a] shrink-0 mt-0.5">
                check_circle
              </span>
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* SPECIAL DIALOG: GOOGLE ACCOUNT NOT REGISTERED IN REBORN           */}
          {/* ================================================================= */}
          {showGoogleNotRegistered && (
            <div className="mb-5 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-2xl text-center space-y-3 shadow-sm animate-fadeIn">
              <div className="w-11 h-11 rounded-full bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[24px]">person_off</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#991b1b]">
                  Acceso no permitido
                </h4>
                <p className="text-xs text-[#7f1d1d] mt-1.5 leading-relaxed font-medium">
                  Esta cuenta de Google ({unregisteredGoogleEmail}) no está registrada en Reborn Your Style. Crea una cuenta antes de iniciar sesión.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setEmail(unregisteredGoogleEmail);
                    setShowGoogleNotRegistered(false);
                    setViewMode('register');
                  }}
                  className="w-full py-2.5 px-4 bg-[#012d1d] hover:bg-[#0c3927] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Crear una cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setShowGoogleNotRegistered(false);
                    setViewMode('login');
                  }}
                  className="w-full py-2 px-4 bg-white border border-[#e2e0d8] hover:bg-[#faf9f4] text-[#414844] text-xs font-medium rounded-xl transition-all cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* GOOGLE CLIENT ID CONFIGURATION PROMPT                             */}
          {/* ================================================================= */}
          {showGoogleConfig && (
            <div className="mb-5 p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl space-y-3 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-[#dadce0] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c19]">Conexión Oficial con Google</h4>
                  <p className="text-[11px] text-[#5f6368]">Selector oficial de Google (prompt=select_account)</p>
                </div>
              </div>
              <p className="text-xs text-[#414844] leading-relaxed">
                Para desplegar el selector oficial de Google con tus cuentas reales, introduce el <strong>Google Client ID</strong> de tu proyecto en Google Cloud Console:
              </p>
              <form onSubmit={handleSaveGoogleClientId} className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={googleClientIdInput}
                  onChange={(e) => setGoogleClientIdInput(e.target.value)}
                  placeholder="ej: 1234567890-xxx.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-white border border-[#dadce0] focus:border-[#012d1d] rounded-xl text-xs text-[#1b1c19] outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-[#012d1d] hover:bg-[#0c3927] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Guardar y Conectar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleConfig(false)}
                    className="py-2 px-3 bg-white border border-[#dadce0] text-xs font-medium text-[#5f6368] rounded-xl hover:bg-[#f1f3f4] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: LOGIN                                                      */}
          {/* ================================================================= */}
          {viewMode === 'login' && !showGoogleNotRegistered && (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-[#1b1c19]">Iniciar Sesión</h3>
                <p className="text-xs text-[#717973] mt-0.5">
                  Ingresa tus datos para acceder a tu estudio y gestionar tus prendas.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@correo.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#414844]">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                        setRecoveryEmail(email);
                        setRecoveryStep('request');
                        setViewMode('forgot_password');
                      }}
                      className="text-xs font-medium text-[#2b694d] hover:text-[#012d1d] hover:underline transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ingresando...</span>
                    </>
                  ) : (
                    <span>Iniciar sesión</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#efeee9]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#8e918f] font-medium tracking-wider">
                    o continúa con
                  </span>
                </div>
              </div>

              {/* Continue with Google Button (Invokes Account Selector) */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#faf9f4] border border-[#d3d0c7] hover:border-[#b0b3af] text-[#1b1c19] font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              {/* Bottom Switch to Register */}
              <div className="mt-6 pt-4 border-t border-[#f0efe9] text-center">
                <p className="text-xs text-[#717973]">
                  ¿Aún no tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('register');
                    }}
                    className="font-semibold text-[#012d1d] hover:text-[#2b694d] hover:underline transition-colors cursor-pointer"
                  >
                    Crear una cuenta
                  </button>
                </p>
              </div>

              {/* Subtle Admin Portal Link */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setViewMode('admin');
                  }}
                  className="text-[11px] text-[#a0a5a1] hover:text-[#414844] transition-colors cursor-pointer"
                >
                  Acceso Administrativo
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: REGISTER ("Crear una cuenta")                              */}
          {/* ================================================================= */}
          {viewMode === 'register' && !showGoogleNotRegistered && (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-[#1b1c19]">Crear una Cuenta</h3>
                <p className="text-xs text-[#717973] mt-0.5">
                  Únete a la comunidad de moda circular y suprareciclaje de Colombia.
                </p>
              </div>

              {/* Account Type Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                  Tipo de perfil
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('cliente')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                      selectedRole === 'cliente'
                        ? 'border-[#012d1d] bg-[#f2f8f4] text-[#012d1d]'
                        : 'border-[#e2e0d8] bg-[#faf9f4] text-[#717973] hover:border-[#b0b3af]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>Cliente / Creador</span>
                    </div>
                    <span className="block text-[10px] text-[#717973] font-normal mt-0.5">
                      Transformar prendas
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('profesional')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                      selectedRole === 'profesional'
                        ? 'border-[#012d1d] bg-[#f2f8f4] text-[#012d1d]'
                        : 'border-[#e2e0d8] bg-[#faf9f4] text-[#717973] hover:border-[#b0b3af]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">content_cut</span>
                      <span>Taller / Modista</span>
                    </div>
                    <span className="block text-[10px] text-[#717973] font-normal mt-0.5">
                      Ofrecer servicios
                    </span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    {selectedRole === 'profesional' ? 'Nombre o Nombre del Taller' : 'Nombre completo'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={selectedRole === 'profesional' ? 'Ej. Taller Artesanal Liliana' : 'Ej. Camila Rojas'}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@correo.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <span>Registrarme</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#efeee9]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#8e918f] font-medium tracking-wider">
                    o continúa con
                  </span>
                </div>
              </div>

              {/* Continue with Google Button in Register */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#faf9f4] border border-[#d3d0c7] hover:border-[#b0b3af] text-[#1b1c19] font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Registrarse con Google</span>
              </button>

              {/* Bottom Switch to Login */}
              <div className="mt-5 pt-3.5 border-t border-[#f0efe9] text-center">
                <p className="text-xs text-[#717973]">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('login');
                    }}
                    className="font-semibold text-[#012d1d] hover:text-[#2b694d] hover:underline transition-colors cursor-pointer"
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: FORGOT PASSWORD FLOW (3 STEPS)                              */}
          {/* ================================================================= */}
          {viewMode === 'forgot_password' && (
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0efe9]">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      recoveryStep === 'request'
                        ? 'bg-[#012d1d] text-white'
                        : 'bg-[#b0f1cc] text-[#002113]'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-xs font-semibold text-[#1b1c19]">Correo</span>
                </div>
                <div className="w-6 h-0.5 bg-[#e2e0d8]" />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      recoveryStep === 'verify'
                        ? 'bg-[#012d1d] text-white'
                        : recoveryStep === 'new_password'
                        ? 'bg-[#b0f1cc] text-[#002113]'
                        : 'bg-[#efeee9] text-[#8e918f]'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs font-semibold text-[#1b1c19]">Código</span>
                </div>
                <div className="w-6 h-0.5 bg-[#e2e0d8]" />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      recoveryStep === 'new_password'
                        ? 'bg-[#012d1d] text-white'
                        : 'bg-[#efeee9] text-[#8e918f]'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-semibold text-[#1b1c19]">Contraseña</span>
                </div>
              </div>

              {/* STEP 1: Enter Email */}
              {recoveryStep === 'request' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#1b1c19]">Recuperar Contraseña</h3>
                    <p className="text-xs text-[#717973] mt-1 leading-relaxed">
                      Escribe el correo electrónico asociado a tu cuenta. Te enviaremos un código de seguridad de 6 dígitos para restablecer tu contraseña.
                    </p>
                  </div>

                  <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                        Correo de tu cuenta
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                        </span>
                        <input
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="nombre@correo.com"
                          autoFocus
                          className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enviando código...</span>
                        </>
                      ) : (
                        <span>Enviar código de recuperación</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Enter 6-digit Code */}
              {recoveryStep === 'verify' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#1b1c19]">Código de Verificación</h3>
                    <p className="text-xs text-[#717973] mt-1 leading-relaxed">
                      Hemos enviado un código de seguridad de 6 dígitos a{' '}
                      <strong className="text-[#012d1d]">{recoveryEmail}</strong>. Escríbelo a continuación para validar tu identidad.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1.5 text-center">
                        Código de 6 dígitos
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={recoveryCodeInput}
                        onChange={(e) => setRecoveryCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        autoFocus
                        className="w-full text-center tracking-[0.5em] font-mono font-bold text-2xl py-3 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-[#012d1d] placeholder-[#a0a5a1] outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || recoveryCodeInput.length < 6}
                      className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <span>Verificar código</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#717973]">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('request')}
                      className="hover:text-[#012d1d] transition-colors cursor-pointer"
                    >
                      Cambiar correo
                    </button>
                    {resendCooldown > 0 ? (
                      <span className="text-[#a0a5a1]">Reenviar en {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestRecoveryCode}
                        className="font-semibold text-[#2b694d] hover:underline cursor-pointer"
                      >
                        Reenviar código
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Enter New Password */}
              {recoveryStep === 'new_password' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#1b1c19]">Nueva Contraseña</h3>
                    <p className="text-xs text-[#717973] mt-1 leading-relaxed">
                      Crea una nueva contraseña segura para tu cuenta en Reborn Your Style.
                    </p>
                  </div>

                  <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                        </span>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          autoFocus
                          className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        </span>
                        <input
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Repite la nueva contraseña"
                          className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showConfirmNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Actualizando contraseña...</span>
                        </>
                      ) : (
                        <span>Guardar contraseña y entrar</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Back to Login Link */}
              <div className="mt-5 pt-3.5 border-t border-[#f0efe9] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setViewMode('login');
                  }}
                  className="text-xs font-semibold text-[#012d1d] hover:text-[#2b694d] hover:underline transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Volver al inicio de sesión</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: ADMINISTRATIVE ACCESS                                       */}
          {/* ================================================================= */}
          {viewMode === 'admin' && (
            <div>
              <div className="mb-5 text-center">
                <div className="w-10 h-10 rounded-full bg-[#f2f8f4] text-[#012d1d] flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                </div>
                <h3 className="text-lg font-bold text-[#012d1d]">Portal de Dirección</h3>
                <p className="text-xs text-[#717973] mt-0.5">
                  Acceso restringido y confidencial para la administración de la plataforma.
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    Correo administrativo
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder={EXCLUSIVE_ADMIN_EMAIL}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    Contraseña de administración
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validando credenciales...</span>
                    </>
                  ) : (
                    <span>Acceder como Administrador</span>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-3.5 border-t border-[#f0efe9] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setViewMode('login');
                  }}
                  className="text-xs font-semibold text-[#012d1d] hover:text-[#2b694d] hover:underline transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Volver al inicio de sesión de usuario</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
