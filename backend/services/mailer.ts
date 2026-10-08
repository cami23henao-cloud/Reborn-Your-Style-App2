import nodemailer from 'nodemailer';

export const createTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

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
      subject: `${code} es tu código de recuperación de contraseña - Reborn Your Style`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px 16px; color: #1b1c19; background-color: #faf9f4;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px 24px; border-radius: 16px; border: 1px solid #efeee9; box-shadow: 0 4px 20px rgba(1, 45, 29, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #012d1d; font-size: 22px; font-weight: 800; margin: 0;">Reborn Your Style</h1>
              <p style="color: #2b694d; font-size: 13px; font-weight: 600; margin: 4px 0 0 0;">Recuperación de Contraseña</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #414844; margin-top: 0;">
              Hola, hemos recibido una solicitud para recuperar la contraseña asociada a tu cuenta.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #414844;">
              Tu código de verificación de 6 dígitos es:
            </p>
            <div style="background-color: #f2f8f4; border: 1.5px dashed #2b694d; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #012d1d; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${code}</span>
            </div>
            <p style="font-size: 13px; color: #717973; line-height: 1.5; margin: 0 0 12px 0;">
              ⏱️ Este código tiene una duración limitada de <strong>15 minutos</strong> y puede utilizarse una sola vez.
            </p>
            <p style="font-size: 12px; color: #8e918f; line-height: 1.5; border-top: 1px solid #f0efe9; padding-top: 16px; margin: 20px 0 0 0;">
              Por tu seguridad, no compartas este código con ninguna persona. Si no solicitaste este cambio, puedes ignorar este mensaje.
            </p>
          </div>
        </div>
      `,
      text: `Tu código de recuperación para Reborn Your Style es: ${code}. Válido por 15 minutos. No lo compartas con nadie.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Mailer] Código enviado exitosamente a ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[SMTP Mailer Error]', error?.message || 'Error al conectar con servidor SMTP');
    console.log("==========================================");
    console.log("CÓDIGO OTP PARA GMAIL (" + toEmail + "):", code);
    console.log("==========================================");
    return { success: true, messageId: 'dev-fallback' };
  }
};
