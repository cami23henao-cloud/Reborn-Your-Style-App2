const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('CONFIG_ERROR: Variables de entorno SMTP incompletas en el servidor.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587,
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 6000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendRecoveryCodeEmail = async (toEmail, code) => {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@rebornyourstyle.com';

    const mailOptions = {
      from: `"Reborn Your Style" <${fromEmail}>`,
      to: toEmail,
      subject: 'Código de recuperación de contraseña - Reborn Your Style',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #faf9f4;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #efeee9;">
            <h2 style="color: #012d1d; margin-top: 0;">Recuperación de Contraseña</h2>
            <p style="font-size: 14px; color: #414844;">Has solicitado restablecer tu contraseña en <strong>Reborn Your Style</strong>.</p>
            <p style="font-size: 14px; color: #414844;">Tu código de seguridad de 6 dígitos es:</p>
            <div style="background-color: #f5f4ef; border: 1px dashed #2b694d; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #012d1d; font-family: monospace;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #717973;">Este código expira en 15 minutos y es de un solo uso.</p>
          </div>
        </div>
      `,
      text: `Tu código de recuperación para Reborn Your Style es: ${code}. Expira en 15 minutos.`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer Error]', error.message);
    throw error;
  }
};

module.exports = {
  createTransporter,
  sendRecoveryCodeEmail,
};
