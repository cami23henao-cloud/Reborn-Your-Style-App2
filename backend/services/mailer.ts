import nodemailer from 'nodemailer';

export const createTransporter = () => {
  const user = process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim() || process.env.GMAIL_PASS?.trim();
  const host = process.env.SMTP_HOST?.trim() || (user?.toLowerCase().includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const port = parseInt(process.env.SMTP_PORT || '587', 10) || 587;

  if (!host || !user || !pass) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  const isGmail = host.toLowerCase().includes('gmail') || user.toLowerCase().includes('@gmail.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendRecoveryCodeEmail = async (toEmail: string, code: string) => {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || 'Reborn Your Style <no-reply@rebornyourstyle.com>';

    const mailOptions = {
      from: fromEmail.includes('<') ? fromEmail : `"Reborn Your Style" <${fromEmail}>`,
      to: toEmail,
      subject: 'Código de recuperación de contraseña',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e0d8; border-radius: 16px; background-color: #faf9f4;">
          <h2 style="color: #012d1d; margin-top: 0; font-size: 20px;">Código de recuperación de contraseña</h2>
          <p style="color: #414844; font-size: 14px; line-height: 1.5;">Ingresa el siguiente código de 6 dígitos numéricos para restablecer el acceso a tu cuenta en <strong>Reborn Your Style</strong>:</p>
          <div style="background-color: #ffffff; border: 2px dashed #012d1d; border-radius: 12px; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #012d1d; font-family: monospace; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #717973; font-size: 12px; line-height: 1.4;">Este código tiene una vigencia de 15 minutos. Si no realizaste esta solicitud, por favor ignora este mensaje.</p>
        </div>
      `,
      text: `Tu código de recuperación de contraseña en Reborn Your Style es: ${code} (Válido por 15 minutos).`,
      headers: {
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'All',
        'X-Mailer': 'Reborn Your Style Mailer',
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Mailer] Código enviado exitosamente a ${toEmail}`);
  } catch (error: any) {
    console.error('[SMTP Mailer Error]', error?.message || 'Error al conectar con servidor SMTP');
    throw error;
  }
};
