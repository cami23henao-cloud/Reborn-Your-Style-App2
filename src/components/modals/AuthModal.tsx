import React, { useState, useEffect, useMemo } from 'react';
import { BrandLogo } from '../BrandLogo';
import {
  registerVerifiedUser,
  loginUser,
  loginAdministrator,
  loginWithGoogleExistingOnly,
  loginOrRegisterWithGoogle,
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

  // Email Registration Verification Flow
  const [registerStep, setRegisterStep] = useState<'form' | 'verify'>('form');
  const [registerCodeInput, setRegisterCodeInput] = useState('');
  const [registerResendCooldown, setRegisterResendCooldown] = useState(0);

  // Google Account Flow State
  const [showGoogleAccountDialog, setShowGoogleAccountDialog] = useState(false);
  const [googleAccountEmail, setGoogleAccountEmail] = useState('');
  const [googleSelectorMode, setGoogleSelectorMode] = useState<'chooser' | 'manual'>('chooser');

  // Detected & active Google accounts list
  const detectedGoogleAccounts = useMemo(() => {
    const list = getUsersDatabase();
    const result: { email: string; name: string; avatarUrl?: string }[] = [];
    const seen = new Set<string>();

    const candidateAccounts: { email: string; name: string; avatarUrl?: string }[] = [
      { email: 'cami23henao@gmail.com', name: 'Camila Henao' },
      ...list
        .filter((u) => u.email && (u.email.includes('@gmail.com') || u.email.includes('@googlemail.com') || (u as any).authProvider === 'google'))
        .map((u) => ({ email: u.email, name: u.name, avatarUrl: u.profile?.avatarUrl })),
    ];

    candidateAccounts.forEach((acc) => {
      const em = (acc.email || '').trim().toLowerCase();
      if (em && !seen.has(em)) {
        seen.add(em);
        result.push({
          email: em,
          name: acc.name || em.split('@')[0],
          avatarUrl: acc.avatarUrl,
        });
      }
    });

    return result;
  }, [isOpen, showGoogleAccountDialog]);

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
      setRegisterStep('form');
      setRegisterCodeInput('');
      setRegisterResendCooldown(0);
      setShowGoogleAccountDialog(false);
      setGoogleAccountEmail('');
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

  // Register resend code cooldown countdown
  useEffect(() => {
    if (registerResendCooldown > 0) {
      const timer = setTimeout(() => setRegisterResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [registerResendCooldown]);

  // Listen for Google Auth Popup postMessage if server-side OAuth redirect was triggered
  useEffect(() => {
    const handleGoogleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.user?.email) {
        await processGoogleEmail(event.data.user.email, {
          name: event.data.user.name,
          picture: event.data.user.picture,
        });
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsLoading(false);
        setErrorMsg(event.data?.error || 'Error durante la autenticación con Google.');
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, [viewMode, selectedRole]);

  // Helper to validate real Google email format
  const validateGoogleEmail = (emailStr: string): { valid: boolean; error?: string } => {
    const clean = (emailStr || '').trim().toLowerCase();
    if (!clean) {
      return { valid: false, error: 'Por favor ingresa un correo de Google.' };
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return { valid: false, error: 'Por favor ingresa un formato de correo electrónico válido (ej. tu_cuenta@gmail.com).' };
    }
    const domain = clean.split('@')[1];
    const invalidDomains = ['test.com', 'test', 'fake.com', 'ejemplo.com', 'example.com', 'abc.com', 'temp.com'];
    if (invalidDomains.includes(domain) || clean.startsWith('test@') || clean.startsWith('fake@')) {
      return { valid: false, error: 'No se permiten correos ficticios o de prueba. Ingresa una cuenta real de Google.' };
    }
    return { valid: true };
  };

  // Helper to process an authenticated Google Email
  const processGoogleEmail = async (
    rawEmail: string,
    extraProfile?: { name?: string; picture?: string }
  ) => {
    const cleanEmail = (rawEmail || '').trim().toLowerCase();
    const val = validateGoogleEmail(cleanEmail);
    if (!val.valid) {
      setErrorMsg(val.error || 'Por favor ingresa un correo electrónico de Google válido.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // loginOrRegisterWithGoogle:
      // If user exists: logs in directly.
      // If first-time user: automatically creates the profile without asking for extra passwords.
      const result = await loginOrRegisterWithGoogle({
        email: cleanEmail,
        name: extraProfile?.name,
        avatarUrl: extraProfile?.picture,
        role: selectedRole || 'cliente',
      });

      // Synchronize with authoritative backend
      await safeApiCall('/api/auth/google/direct', 'POST', {
        email: cleanEmail,
        name: result.user?.name || extraProfile?.name,
        picture: extraProfile?.picture,
        role: selectedRole || 'cliente',
      });

      setIsLoading(false);

      if (result.success && result.user) {
        setShowGoogleAccountDialog(false);
        if (result.isNewUser) {
          setSuccessMsg(`¡Bienvenido(a) a Reborn Your Style, ${result.user.name}! Cuenta configurada.`);
        } else {
          setSuccessMsg(`¡Bienvenido(a) de nuevo, ${result.user.name}!`);
        }
        setTimeout(() => {
          onLoginAccount(result.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.error || 'No fue posible acceder con esta cuenta de Google.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar la autenticación con Google. Por favor intenta nuevamente.');
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

  // 2. Standard Registration - Step 1: Validate inputs and send 6-digit verification code
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
      // Send 6-digit verification code to the real email
      const sendRes = await safeApiCall<{ configured?: boolean; message?: string }>('/api/auth/send-verification-code', 'POST', {
        email: cleanEmail,
        name: cleanName,
      });

      setIsLoading(false);

      if (sendRes.success) {
        setRegisterStep('verify');
        setRegisterCodeInput('');
        setRegisterResendCooldown(60);
        setSuccessMsg('Hemos enviado un código de activación de 6 dígitos a tu correo electrónico.');
      } else {
        setErrorMsg(sendRes.error || 'No fue posible enviar el código de verificación al correo ingresado. Verifica que el correo exista.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // 2b. Standard Registration - Step 2: Verify 6-digit code and create account
  const handleVerifyRegisterCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCode = registerCodeInput.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('Por favor ingresa el código completo de 6 dígitos.');
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    setIsLoading(true);
    try {
      // Verify code with backend authoritative endpoint
      const verifyRes = await safeApiCall('/api/auth/verify-registration-code', 'POST', {
        email: cleanEmail,
        code: cleanCode,
      });

      if (!verifyRes.success) {
        setIsLoading(false);
        setErrorMsg(verifyRes.error || 'Código de activación incorrecto o expirado.');
        return;
      }

      // Code is valid: register user in backend
      await safeApiCall('/api/auth/register', 'POST', {
        name: cleanName,
        email: cleanEmail,
        password,
        role: selectedRole,
      });

      // Save user in persistent verified users database
      const res = await registerVerifiedUser({
        name: cleanName,
        email: cleanEmail,
        password,
        role: selectedRole,
      });

      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`¡Cuenta verificada y activada con éxito! Bienvenido(a) a Reborn Your Style, ${cleanName}.`);
        setTimeout(() => {
          onLoginAccount(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMsg(res.error || 'No fue posible registrar la cuenta. Intenta nuevamente.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos completar la activación de tu cuenta. Por favor intenta nuevamente.');
    }
  };

  // 2c. Resend Registration Code
  const handleResendRegisterCode = async () => {
    if (registerResendCooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await safeApiCall<{ configured?: boolean; message?: string }>('/api/auth/send-verification-code', 'POST', {
        email: email.trim().toLowerCase(),
        name: name.trim(),
      });
      setIsLoading(false);

      if (res.success) {
        setRegisterResendCooldown(60);
        setSuccessMsg('Hemos reenviado un nuevo código de activación a tu correo.');
      } else {
        setErrorMsg(res.error || 'No fue posible reenviar el código. Intenta nuevamente.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Error al reenviar el código. Por favor intenta de nuevo.');
    }
  };

  // 3. Initiate "Continuar con Google" with official Google Identity Services (prompt: 'select_account')
  const handleGoogleClick = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(false);

    const googleClientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (window as any).GOOGLE_CLIENT_ID ||
      '';

    const googleObj = typeof window !== 'undefined' ? (window as any).google : null;

    if (googleClientId && googleObj?.accounts) {
      try {
        // Initialize official Google Identity Services
        googleObj.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response?.credential) {
              try {
                const payloadBase64 = response.credential.split('.')[1];
                const decodedJson = JSON.parse(
                  atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
                );
                if (decodedJson?.email) {
                  await processGoogleEmail(decodedJson.email, {
                    name: decodedJson.name,
                    picture: decodedJson.picture,
                  });
                  return;
                }
              } catch (e) {
                console.error('Error decoding credential:', e);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Trigger prompt with prompt: 'select_account'
        googleObj.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            // Fallback to OAuth2 Token Client with prompt: 'select_account'
            try {
              const tokenClient = googleObj.accounts.oauth2.initTokenClient({
                client_id: googleClientId,
                scope: 'email profile openid',
                prompt: 'select_account',
                callback: async (tokenRes: any) => {
                  if (tokenRes?.access_token) {
                    try {
                      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${tokenRes.access_token}` },
                      }).then((r) => r.json());
                      if (userInfo?.email) {
                        await processGoogleEmail(userInfo.email, {
                          name: userInfo.name,
                          picture: userInfo.picture,
                        });
                      }
                    } catch (err) {
                      setErrorMsg('No fue posible obtener la información de la cuenta de Google.');
                    }
                  }
                },
              });
              tokenClient.requestAccessToken({ prompt: 'select_account' });
            } catch (err: any) {
              console.warn('OAuth2 client fallback error:', err);
              setGoogleAccountEmail('');
              setGoogleSelectorMode('chooser');
              setShowGoogleAccountDialog(true);
            }
          }
        });
        return;
      } catch (gisErr) {
        console.warn('Google Identity Services invocation error:', gisErr);
      }
    }

    // If no Client ID in environment (VITE_GOOGLE_CLIENT_ID) or in iframe sandbox:
    // Open friendly integrated selector without crashing with HTML errors or blocking UI
    setGoogleAccountEmail('');
    setGoogleSelectorMode('chooser');
    setShowGoogleAccountDialog(true);
  };

  // 4. Password Recovery - Step 1: Request 6-digit Code (Real Database Check & Email Dispatch)
  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    const res = await safeApiCall<{ exists?: boolean; configured?: boolean; message?: string }>('/api/auth/send-recovery-code', 'POST', {
      email: cleanEmail,
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Hemos enviado un código de seguridad de 6 dígitos a tu correo electrónico.');
      setRecoveryStep('verify');
      setResendCooldown(60);
    } else {
      // If user does not exist or sending failed, show clear message and STOP flow
      setErrorMsg(res.error || 'No existe una cuenta asociada a este correo electrónico');
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
    // Hash new password and invalidate reset token on server
    const serverRes = await safeApiCall<{ message?: string }>('/api/auth/reset-password', 'POST', {
      email: recoveryEmail.trim().toLowerCase(),
      resetToken: recoveryResetToken,
      newPassword,
    });

    // Update password in local users database as well
    const updateRes = await updateUserPassword(recoveryEmail.trim().toLowerCase(), newPassword);
    setIsLoading(false);

    if (serverRes.success || updateRes.success) {
      setSuccessMsg('¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.');
      setEmail(recoveryEmail);
      setPassword('');
      setTimeout(() => {
        setViewMode('login');
      }, 1000);
    } else {
      setErrorMsg(serverRes.error || updateRes.error || 'No pudimos actualizar la contraseña. Intenta nuevamente.');
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
          {errorMsg && (
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
          {/* GOOGLE ACCOUNT SELECTION MODAL (Professional Native Chooser)       */}
          {/* ================================================================= */}
          {showGoogleAccountDialog && (
            <div className="mb-5 bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
              {/* Google Header */}
              <div className="p-5 pb-4 text-center border-b border-[#f1f3f4]">
                <div className="w-10 h-10 mx-auto mb-2.5 flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
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
                <h3 className="text-base font-medium text-[#202124] tracking-tight">Elegir una cuenta</h3>
                <p className="text-xs text-[#5f6368] mt-0.5">para continuar en Reborn Your Style</p>
              </div>

              {/* Mode: Account Chooser List */}
              {googleSelectorMode === 'chooser' ? (
                <div className="divide-y divide-[#f1f3f4]">
                  {detectedGoogleAccounts.length > 0 && (
                    <div className="p-1">
                      {detectedGoogleAccounts.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          disabled={isLoading}
                          onClick={() => processGoogleEmail(acc.email, { name: acc.name, picture: acc.avatarUrl })}
                          className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-[#f8f9fa] rounded-xl transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                            {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#202124] truncate group-hover:text-[#1a73e8] transition-colors">
                              {acc.name}
                            </div>
                            <div className="text-xs text-[#5f6368] truncate">
                              {acc.email}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-[#188038] bg-[#e6f4ea] px-2 py-0.5 rounded-full shrink-0">
                            Google
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Option: Use another account */}
                  <div className="p-1">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setGoogleSelectorMode('manual');
                        setErrorMsg('');
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-[#f8f9fa] rounded-xl transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#f1f3f4] text-[#5f6368] group-hover:bg-[#e8eaed] flex items-center justify-center shrink-0 transition-colors">
                        <span className="material-symbols-outlined text-xl">person_add</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#202124] group-hover:text-[#1a73e8] transition-colors">
                          Usar otra cuenta de Google
                        </div>
                        <div className="text-xs text-[#5f6368]">
                          Escribe cualquier cuenta real de Google
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-sm text-[#5f6368]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode: Manual Email Input */
                <div className="p-5 space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleSelectorMode('chooser');
                      setErrorMsg('');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#1a73e8] hover:underline font-medium cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Volver a cuentas disponibles</span>
                  </button>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      processGoogleEmail(googleAccountEmail);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-[#202124] mb-1.5">
                        Correo electrónico de Google
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          autoFocus
                          value={googleAccountEmail}
                          onChange={(e) => setGoogleAccountEmail(e.target.value)}
                          placeholder="tu_cuenta@gmail.com"
                          autoComplete="email"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-xl text-sm text-[#202124] placeholder-[#80868b] outline-none transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-[#5f6368] mt-1.5 leading-relaxed">
                        Introduce tu cuenta de Google real (@gmail.com o Google Workspace). Se verificará que el correo exista.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isLoading || !googleAccountEmail.trim()}
                        className="flex-1 py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Accediendo...</span>
                          </>
                        ) : (
                          <span>Continuar con esta cuenta</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGoogleSelectorMode('chooser');
                          setGoogleAccountEmail('');
                          setErrorMsg('');
                        }}
                        className="py-2.5 px-4 bg-white border border-[#dadce0] hover:bg-[#f8f9fa] text-[#3c4043] text-xs font-medium rounded-xl transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Google Trust & Privacy Footer */}
              <div className="px-5 py-3.5 bg-[#f8f9fa] border-t border-[#f1f3f4] text-[11px] text-[#5f6368] leading-relaxed">
                <p>
                  Para continuar, Google compartirá tu nombre, dirección de correo electrónico y preferencia de idioma con Reborn Your Style.
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoogleAccountDialog(false);
                      setGoogleAccountEmail('');
                      setErrorMsg('');
                    }}
                    className="text-xs text-[#1a73e8] hover:underline font-medium cursor-pointer"
                  >
                    Volver a Reborn Your Style
                  </button>
                  <span className="text-[10px] text-[#70757a]">Reborn Your Style</span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: LOGIN                                                      */}
          {/* ================================================================= */}
          {viewMode === 'login' && !showGoogleAccountDialog && (
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
                      setRegisterStep('form');
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
          {viewMode === 'register' && !showGoogleAccountDialog && (
            <div>
              {/* STEP 1: Registration Form */}
              {registerStep === 'form' && (
                <>
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
                          <span>Enviando código al correo...</span>
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
                </>
              )}

              {/* STEP 2: Email Verification (6-digit code) */}
              {registerStep === 'verify' && (
                <div>
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#f2f8f4] text-[#012d1d] flex items-center justify-center mb-2.5">
                      <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1b1c19]">Verifica tu Correo</h3>
                    <p className="text-xs text-[#717973] mt-1 leading-relaxed">
                      Hemos enviado un código de activación de 6 dígitos a{' '}
                      <strong className="text-[#012d1d]">{email}</strong>. Ingrésalo a continuación para activar tu cuenta.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyRegisterCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1.5 text-center">
                        Código de activación (6 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={registerCodeInput}
                        onChange={(e) => setRegisterCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        autoFocus
                        className="w-full text-center tracking-[0.5em] font-mono font-bold text-2xl py-3 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-[#012d1d] placeholder-[#a0a5a1] outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || registerCodeInput.length < 6}
                      className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verificando y activando cuenta...</span>
                        </>
                      ) : (
                        <span>Activar cuenta y acceder</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#717973]">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                        setRegisterStep('form');
                      }}
                      className="hover:text-[#012d1d] transition-colors cursor-pointer"
                    >
                      Modificar datos
                    </button>
                    {registerResendCooldown > 0 ? (
                      <span className="text-[#a0a5a1]">Reenviar en {registerResendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendRegisterCode}
                        className="font-semibold text-[#2b694d] hover:underline cursor-pointer"
                      >
                        Reenviar código
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Switch to Login */}
              <div className="mt-5 pt-3.5 border-t border-[#f0efe9] text-center">
                <p className="text-xs text-[#717973]">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setRegisterStep('form');
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
