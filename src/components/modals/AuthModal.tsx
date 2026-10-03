import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../BrandLogo';
import {
  registerVerifiedUser,
  loginUser,
  loginAdministrator,
  loginOrRegisterWithGoogle,
  loginWithGoogleExistingOnly,
  updateUserPassword,
  isAccountRegistered,
  getDeviceGoogleAccounts,
  saveDeviceGoogleAccount,
  removeDeviceGoogleAccount,
  DeviceGoogleAccount,
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

type AuthViewMode =
  | 'login'
  | 'google_account_picker'
  | 'register'
  | 'register_verify'
  | 'forgot_password'
  | 'admin';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginAccount,
  initialMode = 'login',
}) => {
  // Navigation View State
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode === 'register' ? 'register' : 'login');
  const [selectedRole, setSelectedRole] = useState<'cliente' | 'profesional'>('cliente');

  // Input states for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // States for Google Account Chooser (Device accounts)
  const [deviceAccounts, setDeviceAccounts] = useState<DeviceGoogleAccount[]>([]);
  const [isUsingOtherGoogleAccount, setIsUsingOtherGoogleAccount] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Input states for Register
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Email verification state (Step 2 of Register)
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  // Password Recovery Flow: 1 ('request') -> 2 ('verify') -> 3 ('new_password') -> 4 ('success')
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'new_password' | 'success'>('request');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryResetToken, setRecoveryResetToken] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmNewPassword, setRecoveryConfirmNewPassword] = useState('');
  const [showRecoveryNewPassword, setShowRecoveryNewPassword] = useState(false);
  const [showRecoveryConfirmNewPassword, setShowRecoveryConfirmNewPassword] = useState(false);
  const [recoveryCooldown, setRecoveryCooldown] = useState(0);

  // Administrative access
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset all states cleanly when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode === 'register' ? 'register' : 'login');
      setSelectedRole('cliente');
      setLoginEmail('');
      setLoginPassword('');
      setShowLoginPassword(false);

      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setShowRegisterPassword(false);
      setShowRegisterConfirmPassword(false);

      setVerificationCode('');
      setVerificationCooldown(0);

      setDeviceAccounts(getDeviceGoogleAccounts());
      setIsUsingOtherGoogleAccount(false);
      setCustomGoogleEmail('');
      setCustomGoogleName('');

      setRecoveryStep('request');
      setRecoveryEmail('');
      setRecoveryCodeInput('');
      setRecoveryResetToken('');
      setRecoveryNewPassword('');
      setRecoveryConfirmNewPassword('');
      setShowRecoveryNewPassword(false);
      setShowRecoveryConfirmNewPassword(false);
      setRecoveryCooldown(0);

      setAdminEmail('');
      setAdminPassword('');

      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  // Verification cooldown timer
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => setVerificationCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  // Recovery cooldown timer
  useEffect(() => {
    if (recoveryCooldown > 0) {
      const timer = setTimeout(() => setRecoveryCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [recoveryCooldown]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // 1. INICIAR SESIÓN CON CORREO
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword;

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
        // Displays exact user-specified message:
        // "No encontramos una cuenta con este correo. Puedes crear una cuenta nueva."
        // or "La contraseña no es correcta. Inténtalo nuevamente o recupera tu contraseña."
        setErrorMsg(res.error || 'La contraseña no es correcta. Inténtalo nuevamente o recupera tu contraseña.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // ---------------------------------------------------------------------------
  // 2. CONTINUAR CON GOOGLE
  // ---------------------------------------------------------------------------
  const processGoogleEmail = async (rawEmail: string, rawName?: string, rawPicture?: string, isExplicitRegister = false) => {
    const cleanEmail = (rawEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('El correo electrónico no es válido.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const fallbackName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const displayName = rawName?.trim() || fallbackName;
      const avatarUrl =
        rawPicture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=012d1d&textColor=b0f1cc`;

      // Requirement 3:
      // "Si una cuenta Google ya está registrada en Reborn Your Style: permitir acceso.
      // Si no está registrada: no crear automáticamente una cuenta; mostrar la opción de crear una cuenta."
      if (!isExplicitRegister && viewMode !== 'register') {
        const verifyRes = await loginWithGoogleExistingOnly(cleanEmail, displayName, avatarUrl);
        if (verifyRes.notRegistered) {
          setIsLoading(false);
          setRegisterEmail(cleanEmail);
          setRegisterName(displayName);
          setErrorMsg('Esta cuenta de Google no está registrada en Reborn Your Style. Por favor crea tu cuenta para continuar.');
          return;
        }

        if (verifyRes.success && verifyRes.user) {
          saveDeviceGoogleAccount({
            email: cleanEmail,
            name: displayName,
            avatarUrl,
          });
          setDeviceAccounts(getDeviceGoogleAccounts());
          setIsLoading(false);
          setSuccessMsg(`¡Bienvenido(a) a Reborn Your Style, ${verifyRes.user.name}!`);
          setTimeout(() => {
            onLoginAccount(verifyRes.user!);
            onClose();
          }, 400);
          return;
        }
      }

      // If user is explicitly in register mode or confirmed creation:
      // 1. Authenticate with backend API (POST /api/auth/google/login)
      const apiRes = await safeApiCall<{
        success: boolean;
        token?: string;
        user?: any;
        message?: string;
      }>('/api/auth/google/login', 'POST', {
        email: cleanEmail,
        name: displayName,
        picture: avatarUrl,
        role: selectedRole || 'cliente',
      });

      if (apiRes.success && apiRes.data?.token) {
        try {
          localStorage.setItem('reborn_auth_token', apiRes.data.token);
        } catch (e) {
          console.warn('Could not store token in localStorage:', e);
        }
      }

      // 2. Synchronize with client-side user database
      const storeRes = await loginOrRegisterWithGoogle({
        email: cleanEmail,
        name: displayName,
        role: selectedRole || 'cliente',
        avatarUrl,
      });

      // 3. Save as active account on this device
      saveDeviceGoogleAccount({
        email: cleanEmail,
        name: displayName,
        avatarUrl,
      });
      setDeviceAccounts(getDeviceGoogleAccounts());

      setIsLoading(false);

      if (storeRes.success && storeRes.user) {
        setSuccessMsg(`¡Bienvenido(a) a Reborn Your Style, ${storeRes.user.name}!`);
        setTimeout(() => {
          onLoginAccount(storeRes.user!);
          onClose();
        }, 400);
      } else {
        setErrorMsg(storeRes.error || apiRes.error || 'Los datos ingresados no son correctos.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar la autenticación con Google. Por favor intenta nuevamente.');
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      let googleClientId =
        (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
        (window as any).GOOGLE_CLIENT_ID ||
        '';

      if (!googleClientId) {
        const cfgRes = await safeApiCall<{ configured?: boolean; clientId?: string }>('/api/auth/google/config', 'GET');
        if (cfgRes.success && cfgRes.data?.clientId) {
          googleClientId = cfgRes.data.clientId;
        }
      }

      const googleObj = typeof window !== 'undefined' ? (window as any).google : null;

      // If Google Identity Services (GIS) native account chooser is configured
      if (googleClientId && googleObj?.accounts?.oauth2) {
        const tokenClient = googleObj.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenRes: any) => {
            if (tokenRes?.error) {
              setIsLoading(false);
              if (tokenRes.error !== 'access_denied') {
                setDeviceAccounts(getDeviceGoogleAccounts());
                setIsUsingOtherGoogleAccount(false);
                setViewMode('google_account_picker');
              }
              return;
            }

            if (tokenRes?.access_token) {
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenRes.access_token}` },
                });
                const userInfo = await userInfoRes.json();
                if (userInfo?.email) {
                  await processGoogleEmail(userInfo.email, userInfo.name, userInfo.picture);
                  return;
                }
              } catch (err) {
                console.error('Error fetching Google user profile:', err);
              }
            }
            setIsLoading(false);
            setDeviceAccounts(getDeviceGoogleAccounts());
            setIsUsingOtherGoogleAccount(false);
            setViewMode('google_account_picker');
          },
          error_callback: () => {
            setIsLoading(false);
            setDeviceAccounts(getDeviceGoogleAccounts());
            setIsUsingOtherGoogleAccount(false);
            setViewMode('google_account_picker');
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }

      // If GIS client_id is not configured or in sandbox, present the Google account chooser for device
      setIsLoading(false);
      setDeviceAccounts(getDeviceGoogleAccounts());
      setIsUsingOtherGoogleAccount(false);
      setViewMode('google_account_picker');
    } catch {
      setIsLoading(false);
      setDeviceAccounts(getDeviceGoogleAccounts());
      setIsUsingOtherGoogleAccount(false);
      setViewMode('google_account_picker');
    }
  };

  // ---------------------------------------------------------------------------
  // 3. CREAR UNA CUENTA - PASO 1: FORMULARIO Y ENVÍO DE CÓDIGO
  // ---------------------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = registerName.trim();
    const cleanEmail = registerEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
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

    if (!registerPassword || registerPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    try {
      // Send real 6-digit verification code to the email
      const sendRes = await safeApiCall<{ success?: boolean; message?: string; error?: string }>(
        '/api/auth/send-verification-code',
        'POST',
        {
          email: cleanEmail,
          name: cleanName,
        }
      );

      setIsLoading(false);

      if (sendRes.success) {
        setVerificationCode('');
        setVerificationCooldown(60);
        setViewMode('register_verify');
      } else {
        // If email does not exist or cannot receive code, account is NOT created
        setErrorMsg(
          sendRes.error ||
          'No fue posible enviar el código de verificación al correo ingresado. Verifica que el correo exista y pueda recibir mensajes.'
        );
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud de registro. Por favor intenta nuevamente.');
    }
  };

  // ---------------------------------------------------------------------------
  // 4. CREAR UNA CUENTA - PASO 2: VERIFICAR CÓDIGO Y ACTIVAR CUENTA
  // ---------------------------------------------------------------------------
  const handleVerifyRegisterCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('Por favor ingresa el código completo de 6 dígitos.');
      return;
    }

    const cleanName = registerName.trim();
    const cleanEmail = registerEmail.trim().toLowerCase();

    setIsLoading(true);
    try {
      // Verify code with authoritative server endpoint
      const verifyRes = await safeApiCall('/api/auth/verify-registration-code', 'POST', {
        email: cleanEmail,
        code: cleanCode,
      });

      if (!verifyRes.success) {
        setIsLoading(false);
        setErrorMsg(verifyRes.error || 'Código de activación incorrecto o expirado.');
        return;
      }

      // Code verified! Now register and activate the real user account
      const regRes = await registerVerifiedUser({
        name: cleanName,
        email: cleanEmail,
        password: registerPassword,
        role: selectedRole,
      });

      // Synchronize with server store
      await safeApiCall('/api/auth/register', 'POST', {
        name: cleanName,
        email: cleanEmail,
        password: registerPassword,
        role: selectedRole,
      });

      setIsLoading(false);

      if (regRes.success && regRes.user) {
        setSuccessMsg(`¡Cuenta verificada y activada con éxito! Bienvenido(a) a Reborn Your Style, ${cleanName}.`);
        setTimeout(() => {
          onLoginAccount(regRes.user!);
          onClose();
        }, 700);
      } else {
        setErrorMsg(regRes.error || 'No fue posible completar la activación de la cuenta. Intenta nuevamente.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos completar la activación de tu cuenta. Por favor intenta nuevamente.');
    }
  };

  const handleResendRegisterCode = async () => {
    if (verificationCooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await safeApiCall('/api/auth/send-verification-code', 'POST', {
        email: registerEmail.trim().toLowerCase(),
        name: registerName.trim(),
      });
      setIsLoading(false);

      if (res.success) {
        setVerificationCooldown(60);
        setSuccessMsg('Hemos reenviado un nuevo código de verificación a tu correo.');
      } else {
        setErrorMsg(res.error || 'No fue posible reenviar el código. Intenta nuevamente.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Error al reenviar el código. Por favor intenta de nuevo.');
    }
  };

  // ---------------------------------------------------------------------------
  // 5. RECUPERAR CONTRASEÑA - PASO 1: SOLICITAR CÓDIGO
  // ---------------------------------------------------------------------------
  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Check account in real database first
    if (!isAccountRegistered(cleanEmail)) {
      setErrorMsg('No encontramos una cuenta con este correo. Puedes crear una cuenta nueva.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await safeApiCall<{ exists?: boolean; message?: string; error?: string }>(
        '/api/auth/send-recovery-code',
        'POST',
        { email: cleanEmail }
      );
      setIsLoading(false);

      if (res.success) {
        setRecoveryCodeInput('');
        setRecoveryCooldown(60);
        setRecoveryStep('verify');
      } else {
        setErrorMsg(res.error || 'No encontramos una cuenta con este correo. Puedes crear una cuenta nueva.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No pudimos procesar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // ---------------------------------------------------------------------------
  // 5. RECUPERAR CONTRASEÑA - PASO 2: VERIFICAR CÓDIGO
  // ---------------------------------------------------------------------------
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
    try {
      const res = await safeApiCall<{ resetToken?: string }>('/api/auth/verify-recovery-code', 'POST', {
        email: recoveryEmail.trim().toLowerCase(),
        code: cleanCode,
      });
      setIsLoading(false);

      if (res.success && res.data?.resetToken) {
        setRecoveryResetToken(res.data.resetToken);
        setRecoveryStep('new_password');
      } else {
        setErrorMsg(res.error || 'El código ingresado es incorrecto o ha expirado.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('No fue posible validar el código. Por favor intenta nuevamente.');
    }
  };

  // ---------------------------------------------------------------------------
  // 5. RECUPERAR CONTRASEÑA - PASO 3: CAMBIAR CONTRASEÑA
  // ---------------------------------------------------------------------------
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!recoveryNewPassword || recoveryNewPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmNewPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    try {
      // Invalidate token and update on server
      const serverRes = await safeApiCall('/api/auth/reset-password', 'POST', {
        email: recoveryEmail.trim().toLowerCase(),
        resetToken: recoveryResetToken,
        newPassword: recoveryNewPassword,
      });

      // Update in local persistent database
      const localRes = await updateUserPassword(recoveryEmail.trim().toLowerCase(), recoveryNewPassword);
      setIsLoading(false);

      if (serverRes.success || localRes.success) {
        setRecoveryStep('success');
      } else {
        setErrorMsg(serverRes.error || localRes.error || 'No pudimos actualizar la contraseña. Intenta nuevamente.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Error al actualizar la contraseña. Intenta nuevamente.');
    }
  };

  // ---------------------------------------------------------------------------
  // 6. ACCESO ADMINISTRATIVO
  // ---------------------------------------------------------------------------
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
        setSuccessMsg('Acceso administrativo concedido.');
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
        {/* Top Decorative Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#012d1d] via-[#2b694d] to-[#b0f1cc]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] text-[#414844] hover:text-[#1b1c19] flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          {/* ================================================================= */}
          {/* HEADER: LOGO OFICIAL DE REBORN YOUR STYLE                          */}
          {/* ================================================================= */}
          <div className="flex flex-col items-center text-center mb-5">
            <BrandLogo size="lg" className="mb-2" />
          </div>

          {/* Feedback Messages (Only shown upon user action) */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-start gap-2.5 text-xs text-[#991b1b] animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-[#dc2626] shrink-0 mt-0.5">
                error
              </span>
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-start gap-2.5 text-xs text-[#166534] animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-[#16a34a] shrink-0 mt-0.5">
                check_circle
              </span>
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 1: PANTALLA PRINCIPAL DE INICIO DE SESIÓN                  */}
          {/* ================================================================= */}
          {viewMode === 'login' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                  Bienvenido a Reborn Your Style
                </h2>
                <p className="text-xs text-[#717973] mt-1 font-medium">
                  Inicia sesión para continuar
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* [ Correo electrónico ] */}
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
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nombre@correo.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* [ Contraseña ] */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </span>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* [ Iniciar sesión ] */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <span>Iniciar sesión</span>
                  )}
                </button>

                {/* “¿Olvidaste tu contraseña?” */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setRecoveryEmail(loginEmail);
                      setRecoveryStep('request');
                      setViewMode('forgot_password');
                    }}
                    className="text-xs font-semibold text-[#2b694d] hover:text-[#012d1d] hover:underline transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>

              {/* Separación visual: ──────── o ──────── */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#efeee9]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#8e918f] font-medium tracking-wider">
                    o
                  </span>
                </div>
              </div>

              {/* [ Continuar con Google ] */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#faf9f4] border border-[#d3d0c7] hover:border-[#b0b3af] text-[#1b1c19] font-medium text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

              {/* “¿Aún no tienes una cuenta?” [ Crear una cuenta ] */}
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

              {/* Discreet administrative link */}
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
          {/* SCREEN 2: ACCESO Y SELECCIÓN DE CUENTA DE GOOGLE (DISPOSITIVO)    */}
          {/* ================================================================= */}
          {viewMode === 'google_account_picker' && (
            <div className="py-1 space-y-4 animate-in fade-in duration-200">
              {/* Google Brand Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white border border-[#e2e0d8] shadow-xs flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                <h3 className="text-xl font-semibold text-[#202124] tracking-tight">
                  Elige una cuenta
                </h3>
                <p className="text-xs text-[#5f6368] max-w-sm mx-auto leading-relaxed">
                  para continuar en <strong className="text-[#202124]">Reborn Your Style</strong>
                </p>
              </div>

              {/* Account Selection Box (Google style) */}
              <div className="pt-1">
                {!isUsingOtherGoogleAccount && deviceAccounts.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-[11px] font-medium text-[#5f6368] px-1">
                      Cuentas activas en este dispositivo / navegador:
                    </p>

                    <div className="border border-[#dadce0] rounded-2xl overflow-hidden divide-y divide-[#f1f3f4] bg-white shadow-xs">
                      {deviceAccounts.map((account) => (
                        <div
                          key={account.email}
                          onClick={() => processGoogleEmail(account.email, account.name, account.avatarUrl)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#f8fafd] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {account.avatarUrl ? (
                              <img
                                src={account.avatarUrl}
                                alt={account.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#dadce0] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#012d1d] text-[#b0f1cc] font-semibold text-base flex items-center justify-center shrink-0">
                                {account.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 truncate">
                              <p className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors truncate">
                                {account.name}
                              </p>
                              <p className="text-xs text-[#5f6368] truncate">{account.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Quitar cuenta de este dispositivo"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeDeviceGoogleAccount(account.email);
                                setDeviceAccounts(getDeviceGoogleAccounts());
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#d93025] transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            <span className="material-symbols-outlined text-[#dadce0] group-hover:text-[#1a73e8] transition-colors text-[20px]">
                              chevron_right
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* "+ Usar otra cuenta" tile */}
                      <div
                        onClick={() => {
                          setErrorMsg('');
                          setSuccessMsg('');
                          setIsUsingOtherGoogleAccount(true);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#f8fafd] transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full border border-dashed border-[#dadce0] group-hover:border-[#1a73e8] flex items-center justify-center text-[#5f6368] group-hover:text-[#1a73e8] shrink-0 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">person_add</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#202124] group-hover:text-[#1a73e8] transition-colors">
                            Usar otra cuenta de Google
                          </p>
                          <p className="text-xs text-[#5f6368]">
                            Ingresar con cualquier otra cuenta de Google
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form: Ingresar otra cuenta de Google */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customGoogleEmail.trim()) {
                        processGoogleEmail(customGoogleEmail, customGoogleName);
                      }
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                        Correo de Google (Gmail o Workspace)
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="tu-correo@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-[#dadce0] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 rounded-xl text-sm text-[#202124] outline-none transition-all placeholder:text-[#9aa0a6]"
                      />
                      <p className="text-[11px] text-[#5f6368] mt-1.5 leading-relaxed">
                        Cualquier cuenta de Google activa podrá ingresar inmediatamente o registrarse sin restricciones ni contraseñas.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                        Nombre completo o perfil (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-[#dadce0] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 rounded-xl text-sm text-[#202124] outline-none transition-all placeholder:text-[#9aa0a6]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {deviceAccounts.length > 0 ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setErrorMsg('');
                            setIsUsingOtherGoogleAccount(false);
                          }}
                          className="text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
                        >
                          ← Ver cuentas del dispositivo
                        </button>
                      ) : (
                        <div />
                      )}

                      <button
                        type="submit"
                        disabled={isLoading || !customGoogleEmail.trim()}
                        className="py-2.5 px-5 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ml-auto"
                      >
                        {isLoading ? (
                          <>
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Iniciando sesión...</span>
                          </>
                        ) : (
                          <span>Continuar con esta cuenta</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Google Security & Privacy note */}
              <div className="pt-2 text-center space-y-2 border-t border-[#f1f3f4]">
                <p className="text-[11px] text-[#70757a] leading-relaxed">
                  Para continuar, Google compartirá tu nombre, dirección de correo electrónico y foto de perfil con Reborn Your Style.
                </p>
                <div className="flex items-center justify-center gap-3 text-[11px] text-[#70757a]">
                  <span>Español (Latinoamérica)</span>
                  <span>•</span>
                  <a href="#privacidad" onClick={(e) => { e.preventDefault(); }} className="hover:underline">Privacidad</a>
                  <span>•</span>
                  <a href="#terminos" onClick={(e) => { e.preventDefault(); }} className="hover:underline">Condiciones</a>
                </div>
              </div>

              {/* Back button */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setViewMode('login');
                  }}
                  className="text-xs font-semibold text-[#717973] hover:text-[#012d1d] transition-colors cursor-pointer"
                >
                  ← Volver a inicio de sesión con correo y contraseña
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 3: CREAR UNA CUENTA                                        */}
          {/* ================================================================= */}
          {viewMode === 'register' && (
            <div>
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                  Crea tu cuenta
                </h2>
                <p className="text-xs text-[#717973] mt-1 font-medium leading-relaxed">
                  Únete a Reborn Your Style y empieza a transformar tus prendas.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* 1. Nombre completo */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                    </span>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Ej. Camila Rojas"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. Correo electrónico */}
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
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="nombre@correo.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </span>
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegisterPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4. Confirmar contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                      <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    </span>
                    <input
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      required
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegisterConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* “¿Cómo quieres utilizar Reborn Your Style?” */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    ¿Cómo quieres utilizar Reborn Your Style?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('cliente')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        selectedRole === 'cliente'
                          ? 'border-[#012d1d] bg-[#f2f8f4] text-[#012d1d] ring-1 ring-[#012d1d]'
                          : 'border-[#e2e0d8] bg-[#faf9f4] text-[#717973] hover:border-[#b0b3af]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">person</span>
                      <span className="text-xs font-bold">Usuario</span>
                      <span className="text-[10px] text-[#717973] font-normal leading-tight">
                        Transformar o comprar
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('profesional')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        selectedRole === 'profesional'
                          ? 'border-[#012d1d] bg-[#f2f8f4] text-[#012d1d] ring-1 ring-[#012d1d]'
                          : 'border-[#e2e0d8] bg-[#faf9f4] text-[#717973] hover:border-[#b0b3af]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">content_cut</span>
                      <span className="text-xs font-bold">Diseñador</span>
                      <span className="text-[10px] text-[#717973] font-normal leading-tight">
                        Ofrecer servicios
                      </span>
                    </button>
                  </div>
                </div>

                {/* Botón: [ Crear cuenta ] */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando código de verificación...</span>
                    </>
                  ) : (
                    <span>Crear cuenta</span>
                  )}
                </button>
              </form>

              {/* Separación visual: ──────── o ──────── */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#efeee9]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#8e918f] font-medium tracking-wider">
                    o
                  </span>
                </div>
              </div>

              {/* [ Registrarse con Google ] */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#faf9f4] border border-[#d3d0c7] hover:border-[#b0b3af] text-[#1b1c19] font-medium text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

              {/* “¿Ya tienes una cuenta?” [ Iniciar sesión ] */}
              <div className="mt-5 pt-3.5 border-t border-[#f0efe9] text-center">
                <p className="text-xs text-[#717973]">
                  ¿Ya tienes una cuenta?{' '}
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
          {/* SCREEN 4: VERIFICACIÓN DEL CORREO (CÓDIGO DE 6 DÍGITOS)           */}
          {/* ================================================================= */}
          {viewMode === 'register_verify' && (
            <div>
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-[#f2f8f4] text-[#012d1d] flex items-center justify-center mx-auto mb-2.5">
                  <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                  Verifica tu correo electrónico
                </h2>
                <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                  Enviamos un código de verificación a tu correo:{' '}
                  <strong className="text-[#012d1d]">{registerEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyRegisterCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-2 text-center">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    autoFocus
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-2xl py-3 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-[#012d1d] placeholder-[#a0a5a1] outline-none transition-all shadow-inner"
                  />
                </div>

                {/* [ Verificar correo ] */}
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length < 6}
                  className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <span>Verificar correo</span>
                  )}
                </button>
              </form>

              {/* [ Reenviar código ] & Volver */}
              <div className="mt-4 flex items-center justify-between text-xs text-[#717973] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setViewMode('register');
                  }}
                  className="hover:text-[#012d1d] transition-colors cursor-pointer"
                >
                  Modificar datos
                </button>

                {verificationCooldown > 0 ? (
                  <span className="text-[#a0a5a1]">Reenviar en {verificationCooldown}s</span>
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

          {/* ================================================================= */}
          {/* SCREEN 5: RECUPERAR CONTRASEÑA                                    */}
          {/* ================================================================= */}
          {viewMode === 'forgot_password' && (
            <div>
              {/* PASO 1: Ingresar correo */}
              {recoveryStep === 'request' && (
                <div>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                      Recupera tu contraseña
                    </h2>
                    <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                      Introduce el correo asociado a tu cuenta y te enviaremos un código de verificación.
                    </p>
                  </div>

                  <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
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
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="nombre@correo.com"
                          autoFocus
                          className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* [ Enviar código ] */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verificando cuenta...</span>
                        </>
                      ) : (
                        <span>Enviar código</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* PASO 2: Ingresar código de 6 dígitos */}
              {recoveryStep === 'verify' && (
                <div>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                      Recupera tu contraseña
                    </h2>
                    <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                      Introduce el código que enviamos a tu correo:{' '}
                      <strong className="text-[#012d1d]">{recoveryEmail}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-2 text-center">
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
                        className="w-full text-center tracking-[0.5em] font-mono font-bold text-2xl py-3 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-[#012d1d] placeholder-[#a0a5a1] outline-none transition-all shadow-inner"
                      />
                    </div>

                    {/* [ Verificar código ] */}
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

                  <div className="mt-4 flex items-center justify-between text-xs text-[#717973] pt-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('request')}
                      className="hover:text-[#012d1d] transition-colors cursor-pointer"
                    >
                      Cambiar correo
                    </button>

                    {recoveryCooldown > 0 ? (
                      <span className="text-[#a0a5a1]">Reenviar en {recoveryCooldown}s</span>
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

              {/* PASO 3: Crea una nueva contraseña */}
              {recoveryStep === 'new_password' && (
                <div>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                      Crea una nueva contraseña
                    </h2>
                    <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                      Define una nueva contraseña segura para tu cuenta.
                    </p>
                  </div>

                  <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                    {/* [ Nueva contraseña ] */}
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                        </span>
                        <input
                          type={showRecoveryNewPassword ? 'text' : 'password'}
                          required
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          autoFocus
                          className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecoveryNewPassword(!showRecoveryNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showRecoveryNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* [ Confirmar nueva contraseña ] */}
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        </span>
                        <input
                          type={showRecoveryConfirmNewPassword ? 'text' : 'password'}
                          required
                          value={recoveryConfirmNewPassword}
                          onChange={(e) => setRecoveryConfirmNewPassword(e.target.value)}
                          placeholder="Repite la nueva contraseña"
                          className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecoveryConfirmNewPassword(!showRecoveryConfirmNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717973] hover:text-[#1b1c19] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showRecoveryConfirmNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* [ Cambiar contraseña ] */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-3 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Actualizando contraseña...</span>
                        </>
                      ) : (
                        <span>Cambiar contraseña</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* PASO 4: ÉXITO */}
              {recoveryStep === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[28px]">check_circle</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#012d1d]">
                    Tu contraseña se ha actualizado correctamente.
                  </h3>
                  <p className="text-xs text-[#717973] leading-relaxed">
                    Ya puedes utilizar tu nueva contraseña para iniciar sesión en tu cuenta de Reborn Your Style.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail(recoveryEmail);
                      setLoginPassword('');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('login');
                    }}
                    className="w-full mt-2 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}

              {/* Enlace para volver */}
              {recoveryStep !== 'success' && (
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
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 6: ACCESO ADMINISTRATIVO                                   */}
          {/* ================================================================= */}
          {viewMode === 'admin' && (
            <div>
              <div className="text-center mb-5">
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
