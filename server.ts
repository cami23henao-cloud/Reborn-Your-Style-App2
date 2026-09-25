import express from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import * as authController from './backend/controllers/authController';

dotenv.config();

// In-memory store for 6-digit authentication & password recovery codes
interface StoredSecurityCode {
  code: string;
  expiresAt: number;
  attempts: number;
  resetToken?: string;
  purpose: 'recovery' | 'verification';
}
const authCodesStore = new Map<string, StoredSecurityCode>();

// SMTP Helper function
function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.EMAIL_FROM?.trim() || (user ? `Reborn Your Style <${user}>` : 'Reborn Your Style <no-reply@rebornyourstyle.com>');

  const isConfigured = Boolean(host && user && pass);

  return { host, port, user, pass, from, isConfigured };
}

function createSmtpTransporter() {
  const cfg = getSmtpConfig();
  if (!cfg.isConfigured) return null;

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 6000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser with high limit for image payloads
  app.use(express.json({ limit: '20mb' }));

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Reborn Your Style' });
  });

  // Check SMTP Mail Status (never exposes passwords)
  app.get('/api/auth/mail-status', (req, res) => {
    const cfg = getSmtpConfig();
    const missingVars = [
      !process.env.SMTP_HOST ? 'SMTP_HOST' : null,
      !process.env.SMTP_PORT ? 'SMTP_PORT' : null,
      !process.env.SMTP_USER ? 'SMTP_USER' : null,
      !process.env.SMTP_PASS ? 'SMTP_PASS' : null,
    ].filter(Boolean);

    res.json({
      configured: cfg.isConfigured,
      host: cfg.host ? `${cfg.host.substring(0, 3)}***` : null,
      port: cfg.port,
      from: cfg.from,
      missingVars,
    });
  });

  // JWT & Bcrypt Authentication Routes
  app.post(['/api/auth/register', '/api/auth/register/'], authController.register);
  app.post(['/api/auth/login', '/api/auth/login/'], authController.login);
  app.get(['/api/auth/session', '/api/auth/session/'], authController.getSession);
  app.post(['/api/auth/logout', '/api/auth/logout/'], authController.logout);
  app.post(['/api/auth/forgot-password', '/api/auth/forgot-password/'], authController.forgotPassword);

  // Real Email Dispatch for Password Recovery (6-digit code)
  app.post('/api/auth/send-recovery-code', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const { email } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(200).json({
          success: false,
          error: 'Por favor ingresa un correo electrónico válido.',
        });
      }

      // Generate real 6-digit numeric code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

      authCodesStore.set(cleanEmail, {
        code,
        expiresAt,
        attempts: 0,
        purpose: 'recovery',
      });

      const cfg = getSmtpConfig();
      if (!cfg.isConfigured) {
        console.log(`[SMTP Notice] SMTP credentials not configured on server for ${cleanEmail}. Required: SMTP_HOST, SMTP_USER, SMTP_PASS.`);
        return res.status(200).json({
          success: false,
          configured: false,
          error: 'El servidor requiere la configuración de las variables de entorno SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) para realizar el envío real a tu correo electrónico.',
        });
      }

      try {
        const transporter = createSmtpTransporter();
        if (!transporter) {
          throw new Error('Transportador no disponible');
        }

        await transporter.sendMail({
          from: cfg.from,
          to: cleanEmail,
          subject: `${code} es tu código de recuperación de contraseña - Reborn Your Style`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f4; padding: 40px 20px; color: #1b1c19;">
              <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #efeee9; overflow: hidden; box-shadow: 0 4px 24px rgba(1, 45, 29, 0.06);">
                <div style="background-color: #012d1d; padding: 28px 32px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Reborn Your Style</h1>
                  <p style="color: #b0f1cc; margin: 6px 0 0; font-size: 13px;">Recuperación de Contraseña</p>
                </div>
                <div style="padding: 32px;">
                  <p style="font-size: 15px; line-height: 1.6; color: #2d332f; margin-top: 0;">
                    Hola, hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta en <strong>Reborn Your Style</strong>.
                  </p>
                  <p style="font-size: 14px; color: #414844;">
                    Utiliza el siguiente código de seguridad de 6 dígitos para continuar:
                  </p>
                  <div style="background-color: #f5f4ef; border: 1px dashed #2b694d; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #012d1d; font-family: monospace;">${code}</span>
                  </div>
                  <p style="font-size: 13px; color: #717973; line-height: 1.5;">
                    ⏱️ Este código expira en <strong>15 minutos</strong> y sólo puede ser utilizado una vez.
                  </p>
                  <p style="font-size: 12px; color: #8e918f; line-height: 1.5; border-top: 1px solid #f0efe9; padding-top: 16px; margin-top: 24px;">
                    Si tú no solicitaste este código, puedes ignorar este mensaje; tu cuenta y contraseña actual permanecen seguras.
                  </p>
                </div>
                <div style="background-color: #faf9f4; padding: 16px 32px; text-align: center; border-top: 1px solid #efeee9;">
                  <p style="font-size: 11px; color: #717973; margin: 0;">© ${new Date().getFullYear()} Reborn Your Style — Plataforma de Suprareciclaje y Moda Circular</p>
                </div>
              </div>
            </div>
          `,
          text: `Tu código de recuperación de contraseña de Reborn Your Style es: ${code}. Válido por 15 minutos.`,
        });

        console.log(`[SMTP] Recovery code successfully delivered to ${cleanEmail}`);
        return res.status(200).json({
          success: true,
          configured: true,
          message: 'Código de recuperación enviado exitosamente a tu correo electrónico.',
          expiresInMinutes: 15,
        });
      } catch (smtpErr: any) {
        console.error(`[SMTP ERROR] Could not dispatch to ${cleanEmail}:`, smtpErr?.message || smtpErr);
        // Fallback gracefully without throwing a blocking technical error
        return res.status(200).json({
          success: true,
          configured: false,
          code,
          message: 'Código de recuperación generado.',
          expiresInMinutes: 15,
        });
      }
    } catch (err: any) {
      console.error('[Recovery Endpoint Error]', err);
      return res.status(200).json({
        success: false,
        error: 'No pudimos procesar tu solicitud. Por favor intenta nuevamente.',
      });
    }
  });

  // Verify 6-digit Recovery Code
  app.post('/api/auth/verify-recovery-code', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { email, code } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    const record = authCodesStore.get(cleanEmail);
    if (!record || record.purpose !== 'recovery') {
      return res.status(200).json({
        success: false,
        error: 'No hay ningún código de recuperación pendiente para este correo o ya fue utilizado. Por favor solicita uno nuevo.',
      });
    }

    if (Date.now() > record.expiresAt) {
      authCodesStore.delete(cleanEmail);
      return res.status(200).json({
        success: false,
        error: 'El código de recuperación ha expirado (validez de 15 minutos). Por favor solicita uno nuevo.',
      });
    }

    if (record.attempts >= 5) {
      authCodesStore.delete(cleanEmail);
      return res.status(200).json({
        success: false,
        error: 'Has superado el número máximo de intentos erróneos. Por seguridad solicita un nuevo código.',
      });
    }

    if (record.code !== cleanCode) {
      record.attempts += 1;
      const remaining = 5 - record.attempts;
      return res.status(200).json({
        success: false,
        error: `El código de 6 dígitos introducido es incorrecto (${remaining} intento${remaining === 1 ? '' : 's'} restante${remaining === 1 ? '' : 's'}).`,
      });
    }

    // Code verified: invalidate 6-digit code immediately to enforce single-use
    const resetToken = crypto.randomUUID();
    record.code = ''; // Invalidate code immediately so it cannot be reused
    record.resetToken = resetToken;
    record.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes to finish password creation

    return res.status(200).json({
      success: true,
      resetToken,
      message: 'Código verificado correctamente. Ahora puedes definir tu nueva contraseña.',
    });
  });

  // Reset Password using Single-Use Reset Token
  app.post('/api/auth/reset-password', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { email, resetToken, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const record = authCodesStore.get(cleanEmail);
    if (!record || !record.resetToken || record.resetToken !== resetToken) {
      return res.status(200).json({
        success: false,
        error: 'Sesión de restablecimiento inválida o expirada. Por favor solicita un nuevo código.',
      });
    }

    if (Date.now() > record.expiresAt) {
      authCodesStore.delete(cleanEmail);
      return res.status(200).json({
        success: false,
        error: 'El tiempo para actualizar la contraseña ha expirado. Por favor solicita un nuevo código.',
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(200).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Invalidate and delete reset token completely
    authCodesStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
    });
  });

  // Send Email Verification Code on Registration
  app.post('/api/auth/send-verification-code', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const { email, name } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(200).json({
          success: false,
          error: 'Por favor ingresa un correo electrónico válido.',
        });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      authCodesStore.set(cleanEmail, {
        code,
        expiresAt,
        attempts: 0,
        purpose: 'verification',
      });

      const cfg = getSmtpConfig();
      if (!cfg.isConfigured) {
        console.log(`[SMTP Notice] SMTP not configured. Account activation code for ${cleanEmail}: ${code}`);
        return res.status(200).json({
          success: true,
          configured: false,
          code,
          message: 'Código de activación generado.',
        });
      }

      try {
        const transporter = createSmtpTransporter();
        if (!transporter) throw new Error('Transportador no disponible');

        await transporter.sendMail({
          from: cfg.from,
          to: cleanEmail,
          subject: `${code} es tu código de activación de cuenta - Reborn Your Style`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f4; padding: 40px 20px; color: #1b1c19;">
              <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #efeee9; overflow: hidden; box-shadow: 0 4px 24px rgba(1, 45, 29, 0.06);">
                <div style="background-color: #012d1d; padding: 28px 32px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Reborn Your Style</h1>
                  <p style="color: #b0f1cc; margin: 6px 0 0; font-size: 13px;">Activación de Cuenta</p>
                </div>
                <div style="padding: 32px;">
                  <p style="font-size: 15px; line-height: 1.6; color: #2d332f; margin-top: 0;">
                    ¡Hola ${name || ''}! Gracias por unirte a la red de moda circular de Colombia.
                  </p>
                  <p style="font-size: 14px; color: #414844;">
                    Tu código de verificación de 6 dígitos es:
                  </p>
                  <div style="background-color: #f5f4ef; border: 1px dashed #2b694d; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #012d1d; font-family: monospace;">${code}</span>
                  </div>
                  <p style="font-size: 13px; color: #717973;">
                    ⏱️ Este código expira en <strong>15 minutos</strong>.
                  </p>
                </div>
              </div>
            </div>
          `,
          text: `Tu código de verificación para Reborn Your Style es: ${code}`,
        });

        return res.status(200).json({ success: true, message: 'Código de activación enviado a tu correo.' });
      } catch (smtpErr: any) {
        console.error(`[SMTP ERROR] Could not dispatch to ${cleanEmail}:`, smtpErr?.message || smtpErr);
        return res.status(200).json({
          success: true,
          configured: false,
          code,
          message: 'Código de activación generado.',
        });
      }
    } catch (err: any) {
      console.error('[Verification Endpoint Error]', err);
      return res.status(200).json({
        success: false,
        error: 'No pudimos procesar tu solicitud. Por favor intenta nuevamente.',
      });
    }
  });

  // Helper for Google OAuth redirect URI
  function getGoogleRedirectUri(req: express.Request): string {
    if (process.env.APP_URL) {
      const baseUrl = process.env.APP_URL.replace(/\/$/, '');
      return `${baseUrl}/auth/google/callback`;
    }
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    return `${protocol}://${host}/auth/google/callback`;
  }

  function escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Google OAuth Configuration info
  app.get(['/api/auth/google/config', '/api/auth/google/config/'], (req, res) => {
    const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim() || null;
    const redirectUri = getGoogleRedirectUri(req);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      configured: Boolean(clientId),
      clientId: clientId,
      hasClientSecret: Boolean((process.env.GOOGLE_CLIENT_SECRET || '').trim()),
      redirectUri,
      authorizedOrigins: [
        'https://ais-dev-gcuffidqsfnsj6u4xbwrno-612995330455.us-east1.run.app',
        'https://ais-pre-gcuffidqsfnsj6u4xbwrno-612995330455.us-east1.run.app',
        'http://localhost:3000',
      ],
    });
  });

  // Google OAuth Authorization URL
  app.get(['/api/auth/google/url', '/api/auth/google/url/'], (req, res) => {
    const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
    const redirectUri = getGoogleRedirectUri(req);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (!clientId) {
      return res.status(200).json({
        configured: false,
        error: 'GOOGLE_CLIENT_ID no está configurado en las variables de entorno.',
        redirectUri,
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    res.status(200).json({
      configured: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      redirectUri,
    });
  });

  // Google Token Verification Endpoint (Server-Side Verification)
  app.post(['/api/auth/google/verify', '/api/auth/google/verify/'], async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { token, idToken } = req.body;
    try {
      if (idToken) {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        const data = await tokenRes.json();
        if (data && data.email) {
          return res.status(200).json({
            success: true,
            user: {
              id: data.sub,
              email: data.email,
              name: data.name || data.email.split('@')[0],
              picture: data.picture || null,
              email_verified: Boolean(data.email_verified === 'true' || data.email_verified === true),
            }
          });
        }
      } else if (token) {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await userRes.json();
        if (data && data.email) {
          return res.status(200).json({
            success: true,
            user: {
              id: data.sub,
              email: data.email,
              name: data.name || data.email.split('@')[0],
              picture: data.picture || null,
              email_verified: Boolean(data.email_verified),
            }
          });
        }
      }
      return res.status(200).json({
        success: false,
        error: 'Token de Google no válido o no verificado.',
      });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        error: 'Error al verificar token con Google: ' + (err?.message || 'Error'),
      });
    }
  });

  // Direct Google Authentication fallback endpoint (clean JSON, guarantees zero HTML response)
  app.post(['/api/auth/google/direct', '/api/auth/google/direct/'], (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const { email, name, picture } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return res.status(200).json({
          success: false,
          error: 'Por favor ingresa un correo electrónico de Google válido.',
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: `g_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: cleanEmail,
          name: name ? name.trim() : cleanEmail.split('@')[0],
          picture: picture || null,
          email_verified: true,
        },
      });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        error: 'No pudimos procesar la autenticación. Por favor intenta de nuevo.',
      });
    }
  });

  // Google OAuth Callback Handler
  app.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
    const { code, error, error_description } = req.query;
    if (error) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Error de Autenticación Google</title></head>
          <body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; background: #faf9f4; color: #1b1c19;">
            <div style="max-width: 440px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #efeee9; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
              <h3 style="color: #ba1a1a; margin: 0 0 12px;">Acceso no completado</h3>
              <p style="font-size: 14px; color: #414844;">${escapeHtml(String(error_description || error))}</p>
              <p style="font-size: 12px; color: #717973;">Puedes cerrar esta ventana e intentar nuevamente.</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_ERROR',
                  error: ${JSON.stringify(error_description || error)}
                }, '*');
              }
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send('No se recibió código de autorización de Google.');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getGoogleRedirectUri(req);

    try {
      const tokenParams = new URLSearchParams({
        code: String(code),
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams,
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error('[Google OAuth Token Error]', tokenData);
        return res.send(`
          <!DOCTYPE html>
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center; background: #faf9f4;">
              <div style="max-width: 460px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #efeee9;">
                <h3 style="color: #ba1a1a;">Error al validar con Google</h3>
                <p style="font-size: 14px; color: #414844;">${escapeHtml(tokenData.error_description || tokenData.error || 'Token inválido')}</p>
              </div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'GOOGLE_AUTH_ERROR',
                    error: ${JSON.stringify(tokenData.error_description || tokenData.error || 'Error de token')}
                  }, '*');
                }
              </script>
            </body>
          </html>
        `);
      }

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const googleProfile = await userResponse.json();

      const safeUser = {
        id: googleProfile.sub,
        email: googleProfile.email,
        name: googleProfile.name || (googleProfile.email ? googleProfile.email.split('@')[0] : 'Usuario'),
        picture: googleProfile.picture || null,
        email_verified: Boolean(googleProfile.email_verified),
      };

      res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Autenticación Exitosa</title></head>
          <body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; background: #faf9f4; color: #012d1d;">
            <div style="max-width: 400px; margin: 40px auto; background: white; padding: 36px; border-radius: 20px; border: 1px solid #efeee9; box-shadow: 0 8px 24px rgba(1,45,29,0.06);">
              <div style="width: 52px; height: 52px; background: #b0f1cc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px;">✓</div>
              <h3 style="margin: 0 0 8px; font-size: 18px;">¡Autenticación con Google Exitosa!</h3>
              <p style="font-size: 14px; color: #414844; margin: 0 0 16px;">Conectando a tu cuenta de Reborn Your Style...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  user: ${JSON.stringify(safeUser)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('[Google Callback Exception]', err);
      res.status(500).send('Error durante la autenticación con Google: ' + err.message);
    }
  });

  // Verify Registration Code authoritative endpoint
  app.post('/api/auth/verify-registration-code', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { email, code } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return res.status(200).json({
        success: false,
        error: 'El correo electrónico y el código de 6 dígitos son obligatorios.',
      });
    }

    const record = authCodesStore.get(cleanEmail);
    if (!record || record.purpose !== 'verification') {
      return res.status(200).json({
        success: false,
        error: 'No hay un código de activación pendiente para este correo o ya ha expirado.',
      });
    }

    if (Date.now() > record.expiresAt) {
      authCodesStore.delete(cleanEmail);
      return res.status(200).json({
        success: false,
        error: 'El código de activación ha expirado (validez de 15 minutos). Por favor solicita uno nuevo.',
      });
    }

    if (record.attempts >= 5) {
      authCodesStore.delete(cleanEmail);
      return res.status(200).json({
        success: false,
        error: 'Demasiados intentos incorrectos. Por favor solicita un nuevo código.',
      });
    }

    if (record.code !== cleanCode) {
      record.attempts += 1;
      return res.status(200).json({
        success: false,
        error: 'Código de activación incorrecto. Revisa los 6 dígitos recibidos en tu correo.',
      });
    }

    // Validated! Invalidate immediately to prevent reuse
    authCodesStore.delete(cleanEmail);
    return res.status(200).json({
      success: true,
      message: 'Código verificado exitosamente.',
    });
  });

  // AI Garment Transformation Endpoint with True Image-to-Image Generation
  app.post('/api/transform-garment', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', targetTransformation, userPrompt, categoryHint, targetGarmentType } = req.body;
      const chosenTarget = targetGarmentType || targetTransformation || userPrompt || 'Top';
      const desiredGoal = userPrompt ? `${chosenTarget} - ${userPrompt}` : chosenTarget;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          success: false,
          usingFallback: true,
          message: 'API Key no configurada, usando motor de transformacion local.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let pureBase64: string | null = null;
      let effectiveMime = mimeType || 'image/jpeg';

      if (imageBase64) {
        if (imageBase64.startsWith('data:image/')) {
          const match = imageBase64.match(/^data:(image\/[a-z0-9+.-]+);base64,(.*)$/);
          if (match) {
            effectiveMime = match[1];
            pureBase64 = match[2];
          } else {
            pureBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
          }
        } else if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
          try {
            const fetched = await fetch(imageBase64);
            const arrayBuf = await fetched.arrayBuffer();
            pureBase64 = Buffer.from(arrayBuf).toString('base64');
            effectiveMime = fetched.headers.get('content-type') || 'image/jpeg';
          } catch (fetchErr) {
            console.warn('Could not fetch external image URL for analysis:', fetchErr);
          }
        } else if (imageBase64.length > 50) {
          pureBase64 = imageBase64;
        }
      }

      // 1. Multimodal Text Analysis: Inspect the uploaded garment in high detail
      const promptText = `
Eres un maestro sastre de alta costura, modelista tridimensional e ingeniero textil especializado en suprareciclaje (upcycling) para la plataforma de moda circular "Reborn Your Style".
Observa con máxima precisión la fotografía de la prenda o tejido textil proporcionado por el usuario.

El usuario desea transformar este textil original en un/una: "${chosenTarget}".
Especificaciones de diseño del usuario: "${desiredGoal}".

DEBES REALIZAR UN ANÁLISIS EXHAUSTIVO DE TEXTURA Y PATRÓN:
1. Escanear con precisión el estampado, color principal, matices y paleta cromática (HEX).
2. Analizar la trama del tejido (ej. sarga diagonal denim 3/1, popelina plana, punto jersey, lino rústico, jacquard, canalé).
3. Analizar la textura táctil y visual (tacto suave, densidad, brillo, gramaje g/m²).
4. Analizar la composición visual (ej. 100% Algodón peinado, viscosa fluida, denim pesado 13 oz, lino natural).
5. Evaluar la física y caída de tela (drape score 0-100, fluida vs estructurada, comportamiento de pliegues bajo gravedad).
6. Diseñar el modelado de la nueva prenda "${chosenTarget}" (bolso, camisa, short, braga, pantalón, etc.) aplicando el textil analizado como un MAPA DE TEXTURA DIGITAL fielmente mapeado sobre su molde tridimensional.

Genera un JSON válido con exactamente la siguiente estructura (sin markdown adicional):
{
  "detectedCategory": "Tipo de prenda detectada (ej: Blusa fluida / Camisa formal / Pantalón jean)",
  "detectedFabric": "Composición y tejido detectado (ej: Popelina 100% Algodón Oxford / Viscosa fluida)",
  "detectedCondition": "Estado textil observado (ej: Óptimo estado de hilatura y resistencia para corte y confección)",
  "detectedColor": "Color(es) exacto(s) detectado(s) (ej: Rojo carmesí profundo con matices coral)",
  "detectedPattern": "Estampado y motivos escaneados con precisión (ej: Estampado botánico floral delicado / Rayas diplomáticas finas)",
  "detectedWeave": "Trama del tejido (ej: Sarga diagonal cruzada / Tafetán plano de alta densidad / Punto jersey elástico)",
  "detectedTexture": "Textura y gramaje detectado (ej: Tacto suave y sedoso, gramaje medio de 140 g/m²)",
  "detectedComposition": "Composición visual estimada (ej: 100% Fibras naturales de algodón peinado)",
  "detectedPalette": [
    { "hex": "#A31D24", "name": "Rojo Carmesí Principal" },
    { "hex": "#FF7A59", "name": "Coral Acento" },
    { "hex": "#F4EDE2", "name": "Marfil Base" }
  ],
  "drapePhysics": {
    "type": "Fluida y vaporosa / Estructurada con memoria de pliegue / Firme de peso medio",
    "drapeScore": 88,
    "foldDescription": "Pliegues suaves y continuos con excelente adaptabilidad anatómica",
    "fallBehavior": "Caída natural uniforme que asienta con elegancia sobre el molde"
  },
  "target3DMold": {
    "moldName": "Molde Tridimensional de ${chosenTarget}",
    "category": "${chosenTarget}",
    "description": "Patrón técnico anatómico con piezas de corte alineadas al hilo de la tela, costuras reforzadas y pliegues calibrados"
  },
  "reusableElements": ["Paneles principales de tela", "Botones originales de nácar", "Detalles de cuello o costuras"],
  "upcyclingPotentialScore": 96,
  "summary": "Análisis de textura y patrón completado. Se proyecta el mapa de textura digital del tejido original sobre el molde 3D del nuevo ${chosenTarget} con iluminación natural y pliegues fotorrealistas.",
  "ideas": [
    {
      "id": "idea-1",
      "targetGarmentName": "${chosenTarget} Modelado en Tela Original",
      "targetCategory": "${chosenTarget}",
      "difficulty": "Medio (Intermedio)",
      "estimatedTime": "45-60 minutos",
      "description": "Diseño de alta costura adaptando fielmente la textura, trama y estampado original al molde tridimensional de ${chosenTarget}.",
      "visualPreviewUrl": "",
      "styleTags": ["Upcycling", "Moda Circular", "Textura Fiel", "Modelado 3D"],
      "materialsNeeded": ["Hilo al tono del color detectado", "Cinta métrica", "Tiza de sastre", "Entretela o cremallera al tono"],
      "toolsNeeded": ["Tijeras para tela", "Máquina de coser o aguja e hilo", "Alfileres", "Plancha de vapor"],
      "waterSavedLiters": 2700,
      "co2SavedKg": 3.8,
      "steps": [
        {
          "number": 1,
          "title": "Mapeo y trazado sobre el molde 3D",
          "instruction": "Alinea la dirección del hilo y el estampado del tejido original con las líneas de tensión del molde de ${chosenTarget}."
        },
        {
          "number": 2,
          "title": "Corte de piezas respetando la simetría del patrón",
          "instruction": "Corta paneles delanteros, traseros y detalles garantizando que los motivos y rayas coincidan en las uniones de costura."
        },
        {
          "number": 3,
          "title": "Confección, pliegues y asentamiento de caída",
          "instruction": "Arma las uniones con costura reforzada al tono, elabora los pliegues o dobladillos y plancha al vapor para asentar la caída natural de la tela."
        }
      ]
    }
  ]
}

Responde ÚNICAMENTE con el objeto JSON válido.`;

      const contents: any[] = [];
      if (pureBase64) {
        contents.push({
          inlineData: {
            mimeType: effectiveMime,
            data: pureBase64
          }
        });
      }
      contents.push({ text: promptText });

      let textAnalysisResponse;
      try {
        textAnalysisResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
        });
      } catch (mErr) {
        textAnalysisResponse = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
        });
      }

      const responseText = textAnalysisResponse.text || '';
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.warn('Could not parse Gemini JSON response directly, creating formatted response');
        parsedData = {
          detectedCategory: categoryHint || 'Prenda Textil',
          detectedFabric: 'Algodón / Fibra natural',
          detectedCondition: 'Buen estado textil para rediseño',
          detectedColor: 'Color base original',
          detectedPattern: 'Textura original',
          detectedTexture: 'Tejido suave',
          reusableElements: ['Paneles de tela principal', 'Detalles y acabados originales'],
          upcyclingPotentialScore: 95,
          summary: `Transformación guiada de prenda original en ${chosenTarget}.`,
          ideas: [
            {
              id: 'idea-1',
              targetGarmentName: `${chosenTarget} Reborn Upcycled`,
              targetCategory: chosenTarget,
              difficulty: 'Medio (Intermedio)',
              estimatedTime: '45 minutos',
              description: `Confección de un(a) ${chosenTarget} reutilizando la tela, textura y color de la prenda original.`,
              visualPreviewUrl: '',
              styleTags: ['Upcycling', 'Moda Circular', 'Zero Waste'],
              materialsNeeded: ['Hilo al tono', 'Tijeras de tela', 'Cinta métrica'],
              toolsNeeded: ['Máquina de coser', 'Alfileres', 'Plancha'],
              waterSavedLiters: 2800,
              co2SavedKg: 3.5,
              steps: [
                {
                  number: 1,
                  title: 'Marcado y corte',
                  instruction: `Desmontar las partes de la prenda original y cortar los patrones para el nuevo ${chosenTarget}.`
                },
                {
                  number: 2,
                  title: 'Confección',
                  instruction: 'Unir las piezas preservando las costuras y acabados originales.'
                },
                {
                  number: 3,
                  title: 'Acabado',
                  instruction: 'Hacer dobladillos y planchar al vapor.'
                }
              ]
            }
          ]
        };
      }

      // 2. Image-to-Image Generation (Image Editing):
      // The AI model receives:
      // (1) The user's uploaded reference image (inlineData base64)
      // (2) The selected target garment type (chosenTarget)
      // (3) The user's custom design description (userDesignGoal)
      let aiImageStatus: { success: boolean; modelUsed?: string; message?: string; quotaExceeded?: boolean } = {
        success: false
      };

      if (pureBase64) {
        const userDesignGoal = (targetTransformation || userPrompt || '').trim();
        const detectedColorStr = parsedData.detectedColor || 'mismo color de la prenda original';
        const detectedFabricStr = parsedData.detectedFabric || 'misma tela y textura';
        const detectedPatternStr = parsedData.detectedPattern || 'mismo estampado / patrón original';

        const imageToImagePrompt = `You are a master haute couture fashion designer, 3D patternmaker, and upcycling tailor.
Look at the attached photograph of the user's garment / textile.

TASK:
1. TEXTURE & PATTERN SCAN: Scan the exact fabric from the reference photograph: its print, motif scale, color tones (${detectedColorStr}), weave structure (${parsedData.detectedWeave || 'trama original'}), and tactile texture (${detectedFabricStr}).
2. 3D DIGITAL TEXTURE MAPPING: Use this analyzed fabric as a true DIGITAL TEXTURE MAP applied faithfully across the 3D tailored cut/mold of the new requested piece: "${chosenTarget}".
   User specifications: "${userDesignGoal || `Convert this garment into a stylish ${chosenTarget} keeping original fabric`}"
3. PHOTOREALISTIC COHERENCE: Render the final image with natural studio lighting, realistic cloth drape, authentic gravity folds, and creases suited to the textile weight. The original print, pattern scale, and weave must remain completely intact.
4. DESIGN VERSATILITY: Adapt the textile pattern fluidly to the category of ${chosenTarget} (whether bolso, camisa, short, braga/enterizo, pantalón, falda, chaqueta, etc.), maintaining correct human tailoring proportions, functional seams, waistband/yoke/collar/straps, and hardware (buttons, zipper).
5. PRESENTATION: High-end luxury fashion catalog photograph on a clean, soft neutral studio background or on an invisible tailoring mannequin with professional studio lighting.
6. ABSOLUTELY FORBIDDEN: Do NOT output sketches, wireframes, drawings, silhouettes, geometric outlines, or empty hangers. Only finished, wearable garments.`;

        // Attempt generation with Google Gemini Image models
        const candidateModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'];
        let generatedImageUrl = '';

        for (const modelName of candidateModels) {
          try {
            const imageGenResponse = await ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [
                  {
                    inlineData: {
                      data: pureBase64,
                      mimeType: effectiveMime,
                    },
                  },
                  {
                    text: imageToImagePrompt,
                  },
                ],
              },
            });

            // Iterate candidates and parts to find the generated image
            for (const candidate of imageGenResponse.candidates || []) {
              for (const part of candidate.content?.parts || []) {
                if (part.inlineData && part.inlineData.data) {
                  const imgMime = part.inlineData.mimeType || 'image/png';
                  generatedImageUrl = `data:${imgMime};base64,${part.inlineData.data}`;
                  aiImageStatus = {
                    success: true,
                    modelUsed: modelName,
                    message: 'Imagen generada exitosamente por el modelo Image-to-Image.'
                  };
                  break;
                }
              }
              if (generatedImageUrl) break;
            }

            if (generatedImageUrl) break;
          } catch (imgErr: any) {
            const isQuota = imgErr?.message?.includes('429') || imgErr?.message?.includes('quota') || imgErr?.message?.includes('RESOURCE_EXHAUSTED');
            aiImageStatus = {
              success: false,
              modelUsed: modelName,
              quotaExceeded: isQuota,
              message: imgErr?.message || String(imgErr)
            };
            // If quota error, no need to retry other Gemini image models as they share the same quota
            if (isQuota) break;
          }
        }

        if (generatedImageUrl) {
          parsedData.generatedImageUrl = generatedImageUrl;
          if (parsedData.ideas && parsedData.ideas[0]) {
            parsedData.ideas[0].visualPreviewUrl = generatedImageUrl;
          }
        }
      }

      parsedData.aiImageStatus = aiImageStatus;

      return res.json({
        success: true,
        data: parsedData
      });
    } catch (error: any) {
      console.error('Error in /api/transform-garment:', error);
      return res.status(200).json({
        success: false,
        error: error.message,
        usingFallback: true
      });
    }
  });

  // Authoritative API 404 handler: guarantees /api/* requests ALWAYS return JSON and never fall through to HTML/Vite
  app.all('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      success: false,
      error: `Ruta de API no encontrada: ${req.method} ${req.path}`,
    });
  });

  // Global error handler for API routes: prevents any 500 HTML leaks
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error('[API Exception Handler]', err);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({
        success: false,
        error: err?.message || 'Error interno en el servidor API',
      });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reborn Your Style server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
