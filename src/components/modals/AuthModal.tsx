import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from '../BrandLogo';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import {
  registerVerifiedUser,
  loginUser,
  loginAdministrator,
  loginOrRegisterWithGoogle,
  loginWithGoogleExistingOnly,
  updateUserPassword,
  isAccountRegistered,
  findAccountByIdentifier,
  StoredUserAccount
} from '../../services/userStore';
import {
  validateEmailFormat,
  EXCLUSIVE_ADMIN_EMAIL
} from '../../services/securityService';
import { signInWithGooglePopup } from '../../services/firebaseAuth';

// Helper to mask email partially (e.g., j***@gmail.com or a***o@rebornyourstyle.co)
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

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

function maskEmailAddress(emailStr: string): string {
  if (!emailStr || !emailStr.includes('@')) return emailStr;
  const [userPart, domain] = emailStr.split('@');
  if (userPart.length <= 2) return `${userPart[0]}*@${domain}`;
  return `${userPart[0]}*****${userPart.slice(-1)}@${domain}`;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAccount: (account: StoredUserAccount) => void;
  initialMode?: 'login' | 'register';
}

type AuthViewMode =
  | 'login'
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
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  // Navigation View State
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode === 'register' ? 'register' : 'login');
  const [selectedRole, setSelectedRole] = useState<'cliente' | 'profesional'>('cliente');

  // Input states for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  // Password Recovery Flow (Search -> Verify Code -> New Password -> Success)
  const [recoveryStep, setRecoveryStep] = useState<
    'search' | 'verify' | 'new_password' | 'success'
  >('search');
  const [recoveryQuery, setRecoveryQuery] = useState('');
  const [foundUserAccount, setFoundUserAccount] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    role?: string;
  } | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryResetToken, setRecoveryResetToken] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmNewPassword, setRecoveryConfirmNewPassword] = useState('');
  const [showRecoveryNewPassword, setShowRecoveryNewPassword] = useState(false);
  const [showRecoveryConfirmNewPassword, setShowRecoveryConfirmNewPassword] = useState(false);
  const [recoveryCooldown, setRecoveryCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

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

      setRecoveryStep('search');
      setRecoveryQuery('');
      setFoundUserAccount(null);
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

  // Listen for Google OAuth callback message from popup window
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.user?.email) {
        processGoogleEmail(event.data.user.email, event.data.user.name, event.data.user.picture);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsLoading(false);
        setErrorMsg(
          isEn
            ? 'Could not complete Google sign-in. Please try again or use your email and password.'
            : 'No se pudo completar el acceso con Google. Por favor intenta nuevamente o usa tu correo y contraseña.'
        );
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [isEn]);

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
  // 2. CONTINUAR CON GOOGLE (OFICIAL GOOGLE IDENTITY SERVICES)
  // ---------------------------------------------------------------------------
  const processGoogleEmail = async (rawEmail: string, rawName?: string, rawPicture?: string) => {
    const cleanEmail = (rawEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(isEn ? 'Invalid email address.' : 'El correo electrónico no es válido.');
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

      // Requirement 2:
      // "4. Después de autenticarse, Reborn Your Style debe comprobar si ese correo ya tiene una cuenta registrada en nuestra base de datos.
      //  5. Si la cuenta existe, iniciar sesión normalmente.
      //  6. Si el correo de Google NO está registrado en Reborn Your Style, NO crear automáticamente una cuenta ni permitir el acceso. Mostrar un mensaje indicando que primero debe registrarse."
      const verifyRes = await loginWithGoogleExistingOnly(cleanEmail, displayName, avatarUrl);
      if (verifyRes.notRegistered) {
        setIsLoading(false);
        setErrorMsg(
          isEn
            ? `This Google account (${cleanEmail}) is not registered in Reborn Your Style. Please create an account first to access.`
            : `Esta cuenta de Google (${cleanEmail}) no está registrada en Reborn Your Style. Por favor, crea una cuenta primero para poder acceder.`
        );
        return;
      }

      if (verifyRes.success && verifyRes.user) {
        setIsLoading(false);
        setSuccessMsg(isEn ? `Welcome back, ${verifyRes.user.name}!` : `¡Bienvenido(a) de nuevo, ${verifyRes.user.name}!`);
        setTimeout(() => {
          onLoginAccount(verifyRes.user!);
          onClose();
        }, 400);
        return;
      }

      setIsLoading(false);
      setErrorMsg(verifyRes.error || (isEn ? 'Could not sign in with Google.' : 'No fue posible iniciar sesión con Google.'));
    } catch {
      setIsLoading(false);
      setErrorMsg(
        isEn
          ? 'Could not process Google authentication. Please try again.'
          : 'No pudimos procesar la autenticación con Google. Por favor intenta nuevamente.'
      );
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    // 1. Primary: Official Google Account Chooser via Firebase / Google OAuth Popup
    try {
      const credential = await signInWithGooglePopup();
      if (credential?.user?.email) {
        await processGoogleEmail(
          credential.user.email,
          credential.user.displayName || undefined,
          credential.user.photoURL || undefined
        );
        return;
      }
    } catch (popupErr: any) {
      // User closed the popup window without selecting an account
      if (
        popupErr?.code === 'auth/popup-closed-by-user' ||
        popupErr?.code === 'auth/cancelled-popup-request' ||
        popupErr?.message?.includes('closed-by-user')
      ) {
        setIsLoading(false);
        return;
      }
      console.warn('Firebase Google popup fallback:', popupErr);
    }

    // 2. Secondary: Google Identity Services (GIS) Token Client Flow
    try {
      const googleClientId =
        (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
        '1058802324996-kpvh92i36sj8q70f011sie09p22bolp9.apps.googleusercontent.com';

      const googleObj = typeof window !== 'undefined' ? (window as any).google : null;

      if (googleClientId && googleObj?.accounts?.oauth2) {
        const tokenClient = googleObj.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenRes: any) => {
            if (tokenRes?.error) {
              setIsLoading(false);
              if (tokenRes.error === 'access_denied') return;
              setErrorMsg(
                isEn
                  ? 'Could not complete Google authentication. Please try again or sign in with your email.'
                  : 'No fue posible completar la autenticación con Google. Por favor intenta de nuevo o ingresa con tu correo.'
              );
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
                console.warn('Error fetching Google user profile:', err);
              }
            }
            setIsLoading(false);
            setErrorMsg(
              isEn
                ? 'Could not verify your Google account. Please try again.'
                : 'No fue posible verificar tu cuenta de Google. Por favor intenta de nuevo.'
            );
          },
          error_callback: () => {
            setIsLoading(false);
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }
    } catch (gisErr) {
      console.warn('GIS token client fallback:', gisErr);
    }

    // 3. Fallback: Server OAuth 2.0 Popup Flow
    try {
      const urlRes = await safeApiCall<{ configured?: boolean; url?: string }>('/api/auth/google/url', 'GET');
      if (urlRes.success && urlRes.data?.configured && urlRes.data?.url) {
        const width = 500;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          urlRes.data.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
        );
        if (popup) {
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Server OAuth popup fallback:', err);
    }

    setIsLoading(false);
    setErrorMsg(
      isEn
        ? 'Please sign in with your email and password or create an account to continue.'
        : 'Por favor ingresa con tu correo y contraseña o crea una cuenta para continuar.'
    );
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
  // 5. RECUPERAR CONTRASEÑA - BÚSQUEDA Y ENVÍO EXCLUSIVO VÍA CORREO (GMAIL)
  // ---------------------------------------------------------------------------
  const handleSearchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clean = recoveryQuery.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();
    if (!clean) {
      setErrorMsg(
        isEn
          ? 'Please enter your registered email address.'
          : 'Por favor ingresa la dirección de correo electrónico asociada a tu cuenta.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // 1. Search in authoritative server database
      const res = await safeApiCall<{
        exists?: boolean;
        user?: {
          id: string;
          name: string;
          email: string;
          avatarUrl?: string | null;
          role?: string;
        };
        error?: string;
      }>('/api/auth/search-account', 'POST', { query: clean, email: clean });

      let targetUser = res.success && res.data?.exists && res.data?.user ? res.data.user : null;

      // 2. Search in local persistent database if not found on server
      if (!targetUser) {
        const localAcc = findAccountByIdentifier(clean);
        if (localAcc) {
          targetUser = {
            id: localAcc.id,
            name: localAcc.name || localAcc.profile?.name || localAcc.email.split('@')[0],
            email: localAcc.email,
            avatarUrl: localAcc.profile?.avatarUrl || '',
            role: localAcc.role || 'cliente',
          };
        }
      }

      // Si no existe: mensaje limpio exacto según requerimiento
      if (!targetUser) {
        setIsLoading(false);
        setErrorMsg(
          isEn
            ? 'No account found associated with this email address.'
            : 'No existe una cuenta asociada a este correo electrónico.'
        );
        return;
      }

      // 2. Solicitar al backend la generación y envío del código real al correo
      const sendRes = await safeApiCall<{
        success: boolean;
        error?: string;
        message?: string;
      }>('/api/auth/send-recovery-code', 'POST', {
        email: targetUser.email,
      });

      setIsLoading(false);

      if (!sendRes?.success) {
        setErrorMsg(
          sendRes?.error ||
            (isEn
              ? 'Could not send the code. Please try again.'
              : 'No pudimos enviar el código. Inténtalo nuevamente.')
        );
        return;
      }

      // 3. Envío exitoso: avanzar al paso de verificación
      setFoundUserAccount(targetUser);
      setRecoveryEmail(targetUser.email);
      setRecoveryCodeInput('');
      setRecoveryCooldown(60);
      setErrorMsg('');
      setSuccessMsg(
        isEn
          ? 'We sent a verification code to your email.'
          : 'Enviamos un código de verificación a tu correo electrónico.'
      );
      setRecoveryStep('verify');
    } catch {
      setIsLoading(false);
      setErrorMsg(
        isEn
          ? 'Could not send the code. Please try again.'
          : 'No pudimos enviar el código. Inténtalo nuevamente.'
      );
    }
  };

  // Reenviar código OTP de 6 dígitos exclusivamente por correo
  const handleResendRecoveryCode = async () => {
    if (recoveryCooldown > 0) return;
    setErrorMsg('');
    setIsLoading(true);

    try {
      const targetEmail = (foundUserAccount?.email || recoveryEmail).trim().toLowerCase();
      const sendRes = await safeApiCall<{
        success: boolean;
        error?: string;
        message?: string;
      }>('/api/auth/send-recovery-code', 'POST', {
        email: targetEmail,
      });

      setIsLoading(false);

      if (!sendRes?.success) {
        setErrorMsg(
          sendRes?.error ||
            (isEn
              ? 'Could not send the code. Please try again.'
              : 'No pudimos enviar el código. Inténtalo nuevamente.')
        );
        return;
      }

      setRecoveryCooldown(60);
      setRecoveryCodeInput('');
      setErrorMsg('');
      setSuccessMsg(
        isEn
          ? 'We sent a verification code to your email.'
          : 'Enviamos un código de verificación a tu correo electrónico.'
      );
    } catch {
      setIsLoading(false);
      setErrorMsg(
        isEn
          ? 'Could not send the code. Please try again.'
          : 'No pudimos enviar el código. Inténtalo nuevamente.'
      );
    }
  };

  // ---------------------------------------------------------------------------
  // 5. RECUPERAR CONTRASEÑA - PASO 3: VALIDAR CÓDIGO DE 6 DÍGITOS
  // ---------------------------------------------------------------------------
  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCode = recoveryCodeInput.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg(isEn ? 'Please enter the complete 6-digit code.' : 'Por favor ingresa el código completo de 6 dígitos.');
      return;
    }

    const targetEmail = (foundUserAccount?.email || recoveryEmail).trim().toLowerCase();

    setIsLoading(true);
    try {
      const res = await safeApiCall<{ resetToken?: string }>('/api/auth/verify-recovery-code', 'POST', {
        email: targetEmail,
        code: cleanCode,
      });
      setIsLoading(false);

      if (res.success && res.data?.resetToken) {
        setRecoveryResetToken(res.data.resetToken);
        setRecoveryStep('new_password');
        setErrorMsg('');
        setSuccessMsg('');
      } else {
        setErrorMsg(res.error || (isEn ? 'Incorrect or expired code.' : 'El código ingresado es incorrecto o ha expirado.'));
      }
    } catch {
      setIsLoading(false);
      setErrorMsg(
        isEn
          ? 'Could not validate the code. Please try again.'
          : 'No fue posible validar el código. Por favor intenta nuevamente.'
      );
    }
  };

  // ---------------------------------------------------------------------------
  // 5. RECUPERAR CONTRASEÑA - PASO 4: RESTABLECER NUEVA CONTRASEÑA
  // ---------------------------------------------------------------------------
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!recoveryNewPassword || recoveryNewPassword.length < 6) {
      setErrorMsg(isEn ? 'Password must be at least 6 characters.' : 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmNewPassword) {
      setErrorMsg(isEn ? 'Passwords do not match.' : 'Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    const targetEmail = (foundUserAccount?.email || recoveryEmail).trim().toLowerCase();

    setIsLoading(true);
    try {
      // Invalidate token and update on server database
      const serverRes = await safeApiCall('/api/auth/reset-password', 'POST', {
        email: targetEmail,
        resetToken: recoveryResetToken,
        newPassword: recoveryNewPassword,
      });

      // Update in local persistent database
      const localRes = await updateUserPassword(targetEmail, recoveryNewPassword);
      setIsLoading(false);

      if (serverRes.success || localRes.success) {
        setErrorMsg('');
        setSuccessMsg(
          isEn
            ? 'Password updated successfully. You can now sign in.'
            : 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
        );
        setRecoveryStep('success');

        // Redirige al usuario de vuelta al formulario de Inicio de Sesión
        setTimeout(() => {
          setLoginEmail(targetEmail);
          setLoginPassword('');
          setRecoveryStep('search');
          setRecoveryQuery('');
          setFoundUserAccount(null);
          setRecoveryEmail('');
          setRecoveryCodeInput('');
          setRecoveryResetToken('');
          setRecoveryNewPassword('');
          setRecoveryConfirmNewPassword('');
          setViewMode('login');
        }, 2200);
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

  // Helper to render feedback messages at the BOTTOM of forms (Requirement 8)
  const renderStatusMessages = () => {
    if (!errorMsg && !successMsg) return null;
    return (
      <div className="mt-4 space-y-2">
        {errorMsg && (
          <div className="p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-start gap-2.5 text-xs text-[#991b1b] animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] text-[#dc2626] shrink-0 mt-0.5">
              error
            </span>
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-start gap-2.5 text-xs text-[#166534] animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] text-[#16a34a] shrink-0 mt-0.5">
              check_circle
            </span>
            <span className="leading-relaxed font-medium">{successMsg}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div
        className="relative w-full max-w-[440px] my-auto bg-white rounded-3xl shadow-2xl border border-[#efeee9] overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#012d1d] via-[#2b694d] to-[#b0f1cc]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar ventana"
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] text-[#414844] hover:text-[#1b1c19] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Scrollable Container with balanced padding */}
        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 overscroll-contain">
          {/* ================================================================= */}
          {/* HEADER: LOGO OFICIAL DE REBORN YOUR STYLE                          */}
          {/* ================================================================= */}
          <div className="flex flex-col items-center text-center mb-5">
            <BrandLogo size="lg" className="mb-2" />
          </div>

          {/* ================================================================= */}
          {/* SCREEN 1: PANTALLA PRINCIPAL DE INICIO DE SESIÓN                  */}
          {/* ================================================================= */}
          {viewMode === 'login' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                  {isEn ? 'Welcome to Reborn Your Style' : 'Bienvenido a Reborn Your Style'}
                </h2>
                <p className="text-xs text-[#717973] mt-1 font-medium">
                  {isEn ? 'Transform your garments. Reimagine your style.' : 'Transforma tus prendas. Reimagina tu estilo.'}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* [ Correo electrónico ] */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    {isEn ? 'Email address' : 'Correo electrónico'}
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
                      placeholder={isEn ? 'name@example.com' : 'nombre@correo.com'}
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* [ Contraseña ] */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    {isEn ? 'Password' : 'Contraseña'}
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
                      <span>{isEn ? 'Signing in...' : 'Iniciando sesión...'}</span>
                    </>
                  ) : (
                    <span>{isEn ? 'Sign in' : 'Iniciar sesión'}</span>
                  )}
                </button>

                {/* “¿Olvidaste tu contraseña?” */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setRecoveryQuery(loginEmail);
                      setRecoveryStep('search');
                      setViewMode('forgot_password');
                    }}
                    className="text-xs font-semibold text-[#2b694d] hover:text-[#012d1d] hover:underline transition-colors cursor-pointer"
                  >
                    {isEn ? 'Forgot your password?' : '¿Olvidaste tu contraseña?'}
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
                    {isEn ? 'or' : 'o'}
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
                <span>{isEn ? 'Continue with Google' : 'Continuar con Google'}</span>
              </button>

              {/* Contenedor de mensajes de estado en la parte INFERIOR del formulario */}
              {renderStatusMessages()}

              {/* “¿No tienes una cuenta?” [ Crear una cuenta ] */}
              <div className="mt-6 pt-4 border-t border-[#f0efe9] text-center">
                <p className="text-xs text-[#717973]">
                  {isEn ? "Don't have an account?" : '¿No tienes una cuenta?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('register');
                    }}
                    className="font-semibold text-[#012d1d] hover:text-[#2b694d] hover:underline transition-colors cursor-pointer"
                  >
                    {isEn ? 'Create an account' : 'Crear una cuenta'}
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
                  {isEn ? 'Administrative Access' : 'Acceso Administrativo'}
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
                  {isEn ? 'Create your account' : 'Crea tu cuenta'}
                </h2>
                <p className="text-xs text-[#717973] mt-1 font-medium leading-relaxed">
                  {isEn ? 'Join Reborn Your Style and start transforming your clothes.' : 'Únete a Reborn Your Style y empieza a transformar tus prendas.'}
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* 1. Nombre completo */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    {isEn ? 'Full name' : 'Nombre completo'}
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
                      placeholder={isEn ? 'E.g. Camila Rojas' : 'Ej. Camila Rojas'}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 2. Correo electrónico */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    {isEn ? 'Email address' : 'Correo electrónico'}
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
                      placeholder={isEn ? 'name@example.com' : 'nombre@correo.com'}
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-1">
                    {isEn ? 'Password' : 'Contraseña'}
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
                      placeholder={isEn ? 'Minimum 6 characters' : 'Mínimo 6 caracteres'}
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
                    {isEn ? 'Confirm password' : 'Confirmar contraseña'}
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
                      placeholder={isEn ? 'Repeat password' : 'Repite tu contraseña'}
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

                {/* “Selecciona tu tipo de cuenta” */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#414844] mb-1.5">
                    {isEn ? 'Select your account type' : 'Selecciona tu tipo de cuenta'}
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
                      <span className="text-xs font-bold">{isEn ? 'Client' : 'Usuario'}</span>
                      <span className="text-[10px] text-[#717973] font-normal leading-tight">
                        {isEn ? 'Transform or buy' : 'Transformar o comprar'}
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
                      <span className="text-xs font-bold">{isEn ? 'Tailor' : 'Diseñador'}</span>
                      <span className="text-[10px] text-[#717973] font-normal leading-tight">
                        {isEn ? 'Offer services' : 'Ofrecer servicios'}
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
                      <span>{isEn ? 'Sending verification code...' : 'Enviando código de verificación...'}</span>
                    </>
                  ) : (
                    <span>{isEn ? 'Create account' : 'Crear cuenta'}</span>
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
                    {isEn ? 'or' : 'o'}
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
                <span>{isEn ? 'Sign up with Google' : 'Registrarse con Google'}</span>
              </button>

              {/* Contenedor de mensajes de estado en la parte INFERIOR del formulario */}
              {renderStatusMessages()}

              {/* “¿Ya tienes una cuenta?” [ Iniciar sesión ] */}
              <div className="mt-5 pt-3.5 border-t border-[#f0efe9] text-center">
                <p className="text-xs text-[#717973]">
                  {isEn ? 'Already have an account?' : '¿Ya tienes una cuenta?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('login');
                    }}
                    className="font-semibold text-[#012d1d] hover:text-[#2b694d] hover:underline transition-colors cursor-pointer"
                  >
                    {isEn ? 'Sign in' : 'Iniciar sesión'}
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
                  {isEn ? 'Verify your email address' : 'Verifica tu correo electrónico'}
                </h2>
                <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                  {isEn ? 'We sent a verification code to your email: ' : 'Enviamos un código de verificación a tu correo: '}
                  <strong className="text-[#012d1d]">{registerEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyRegisterCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#414844] mb-2 text-center">
                    {isEn ? '6-digit code' : 'Código de 6 dígitos'}
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
                      <span>{isEn ? 'Verifying code...' : 'Verificando código...'}</span>
                    </>
                  ) : (
                    <span>{isEn ? 'Verify email' : 'Verificar correo'}</span>
                  )}
                </button>
              </form>

              {/* Mensajes de estado en la parte inferior */}
              {renderStatusMessages()}

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
                  {isEn ? 'Edit info' : 'Modificar datos'}
                </button>

                {verificationCooldown > 0 ? (
                  <span className="text-[#a0a5a1]">
                    {isEn ? `Resend in ${verificationCooldown}s` : `Reenviar en ${verificationCooldown}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendRegisterCode}
                    className="font-semibold text-[#2b694d] hover:underline cursor-pointer"
                  >
                    {isEn ? 'Resend code' : 'Reenviar código'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 5: RECUPERAR CONTRASEÑA (FLUJO TIPO FACEBOOK)              */}
          {/* ================================================================= */}
          {viewMode === 'forgot_password' && (
            <div>
              {/* PASO 1: CORREO ELECTRÓNICO */}
              {/* ============================================================= */}
              {/* 1. INTERFAZ DE BÚSQUEDA EXCLUSIVA POR CORREO (ESTILO MINIMALISTA) */}
              {/* ============================================================= */}
              {recoveryStep === 'search' && (
                <div>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                      {isEn ? 'Find your account' : 'Encuentra tu cuenta'}
                    </h2>
                    <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                      {isEn
                        ? 'Enter the email address associated with your account.'
                        : 'Ingresa la dirección de correo electrónico asociada a tu cuenta.'}
                    </p>
                  </div>

                  <form onSubmit={handleSearchAccount} className="space-y-4">
                    <div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                        </span>
                        <input
                          type="email"
                          required
                          value={recoveryQuery}
                          onChange={(e) => setRecoveryQuery(e.target.value)}
                          placeholder={
                            isEn
                              ? 'Email address (e.g. user@gmail.com)'
                              : 'Correo electrónico (ej. usuario@gmail.com)'
                          }
                          autoFocus
                          className="w-full pl-10 pr-4 py-3 bg-[#faf9f4] border border-[#e2e0d8] focus:border-[#012d1d] focus:bg-white rounded-xl text-sm text-[#1b1c19] placeholder-[#a0a5a1] outline-none transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* [ Continuar ] Botón de acción */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isEn ? 'Searching...' : 'Buscando cuenta...'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Continue' : 'Continuar'}</span>
                      )}
                    </button>

                    {/* [ Regresar al inicio de sesión ] */}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                        setViewMode('login');
                      }}
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-[#f0efe9] text-[#717973] hover:text-[#1b1c19] font-medium text-xs rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    >
                      <span>{isEn ? 'Back to sign in' : 'Regresar al inicio de sesión'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* ============================================================= */}
              {/* PASO 2: INGRESO DE CÓDIGO OTP (6 DÍGITOS)                     */}
              {/* ============================================================= */}
              {recoveryStep === 'verify' && (
                <div>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                      {isEn ? 'Verification code' : 'Código de verificación'}
                    </h2>
                    <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                      {isEn
                        ? 'We have sent a 6-digit code to your email address.'
                        : 'Hemos enviado un código de 6 dígitos a tu correo electrónico.'}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#012d1d] text-xs font-semibold rounded-full mt-2 border border-emerald-200/80">
                      <span className="material-symbols-outlined text-[15px] text-[#2b694d]">mail</span>
                      <span>
                        {isEn
                          ? `Sent code to ${maskEmailAddress(foundUserAccount?.email || recoveryEmail)}`
                          : `Enviamos un código a ${maskEmailAddress(foundUserAccount?.email || recoveryEmail)}`}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">

                    {/* Casilla estilizada para 6 dígitos numéricos */}
                    <div className="space-y-1.5">
                      <div
                        className="relative cursor-text"
                        onClick={() => otpInputRef.current?.focus()}
                      >
                        <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                          {[0, 1, 2, 3, 4, 5].map((idx) => {
                            const val = recoveryCodeInput[idx] || '';
                            const isCurrent = recoveryCodeInput.length === idx;
                            const isFilled = Boolean(val);
                            return (
                              <div
                                key={idx}
                                className={`h-13 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold font-mono rounded-xl border-2 transition-all ${
                                  isCurrent
                                    ? 'border-[#012d1d] bg-white ring-2 ring-[#012d1d]/15 shadow-sm text-[#012d1d]'
                                    : isFilled
                                    ? 'border-[#012d1d]/40 bg-[#faf9f4] text-[#012d1d]'
                                    : 'border-[#e2e0d8] bg-[#faf9f4] text-[#a0a5a1]'
                                }`}
                              >
                                {val ? (
                                  <span>{val}</span>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#c0c5c1]" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Hidden input taking full area so user clicks anywhere to type/paste */}
                        <input
                          ref={otpInputRef}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          value={recoveryCodeInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setRecoveryCodeInput(val);
                          }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer text-transparent"
                          aria-label={isEn ? '6-digit verification code' : 'Código de verificación de 6 dígitos'}
                        />
                      </div>
                    </div>

                    {/* [ Validar código ] Botón */}
                    <button
                      type="submit"
                      disabled={isLoading || recoveryCodeInput.length < 6}
                      className="w-full py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isEn ? 'Validating...' : 'Validando código...'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Validate code' : 'Validar código'}</span>
                      )}
                    </button>
                  </form>

                  {/* Enlaces y botones: [ Reenviar código ] (con temporizador activo de 60s) */}
                  <div className="mt-4 flex items-center justify-between text-xs text-[#717973] pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setSuccessMsg('');
                        setRecoveryStep('search');
                      }}
                      className="hover:text-[#012d1d] transition-colors cursor-pointer"
                    >
                      {isEn ? 'Search another account' : 'Buscar otra cuenta'}
                    </button>

                    {recoveryCooldown > 0 ? (
                      <span className="text-[#717973] font-medium bg-[#f0efe9] px-2.5 py-1 rounded-md">
                        {isEn ? `Resend code (${recoveryCooldown}s)` : `Reenviar código (${recoveryCooldown}s)`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendRecoveryCode}
                        className="font-semibold text-[#2b694d] hover:underline cursor-pointer"
                      >
                        {isEn ? 'Resend code' : 'Reenviar código'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* PASO 3: RESTABLECIMIENTO DE CONTRASEÑA                        */}
              {/* ============================================================= */}
              {recoveryStep === 'new_password' && (
                <div>
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#012d1d]">
                      {isEn ? 'Create your new password' : 'Crea tu nueva contraseña'}
                    </h2>
                    <p className="text-xs text-[#717973] mt-1.5 leading-relaxed">
                      {isEn
                        ? 'Enter and confirm your new password (minimum 6 characters).'
                        : 'Ingresa y confirma tu nueva contraseña (mínimo 6 caracteres).'}
                    </p>
                  </div>

                  <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                    {/* [ Nueva contraseña ] */}
                    <div>
                      <label className="block text-xs font-semibold text-[#414844] mb-1">
                        {isEn ? 'New password' : 'Nueva contraseña'}
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
                          placeholder={isEn ? 'New password (min. 6 characters)' : 'Nueva contraseña (mínimo 6 caracteres)'}
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
                        {isEn ? 'Confirm new password' : 'Confirmar nueva contraseña'}
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
                          placeholder={isEn ? 'Confirm new password' : 'Confirmar nueva contraseña'}
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

                    {/* [ Actualizar contraseña ] Botón */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-3 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] disabled:bg-[#a0a5a1] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isEn ? 'Updating...' : 'Actualizando...'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Update password' : 'Actualizar contraseña'}</span>
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
                    {isEn
                      ? 'Password updated successfully'
                      : 'Contraseña actualizada correctamente'}
                  </h3>
                  <p className="text-xs text-[#717973] leading-relaxed">
                    {isEn
                      ? 'You can now return to sign in to your Reborn Your Style account.'
                      : 'Ya puedes regresar al inicio de sesión con tu nueva contraseña.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail(foundUserAccount?.email || recoveryEmail);
                      setLoginPassword('');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('login');
                    }}
                    className="w-full mt-2 py-3 px-4 bg-[#012d1d] hover:bg-[#0c3927] text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isEn ? 'Back to sign in' : 'Regresar al inicio de sesión'}
                  </button>
                </div>
              )}

              {/* Mensajes de estado en la parte inferior */}
              {renderStatusMessages()}

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
                    <span>{isEn ? 'Back to sign in' : 'Volver al inicio de sesión'}</span>
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

              {/* Mensajes de estado en la parte inferior */}
              {renderStatusMessages()}

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
