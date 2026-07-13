import nodemailer from "nodemailer";

export interface WelcomeEmailData {
  email: string;
  name: string;
  role: string;
  passwordClearText: string;
}

export async function sendWelcomeEmail({ email, name, role, passwordClearText }: WelcomeEmailData): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Columna Pública" <noreply@columnapublica.cl>`;

  console.log(`[Email Service] Intento de envío de correo de bienvenida a: ${email}`);

  if (!host || !user || !pass) {
    console.warn(
      `[Email Service] ⚠️ Las credenciales SMTP no están completamente configuradas (SMTP_HOST, SMTP_USER, SMTP_PASS). ` +
      `Se simulará el correo de bienvenida en consola con alto estándar.`
    );
    console.log(`
================================================================================
SIMULACIÓN DE CORREO DE BIENVENIDA (SMTP NO CONFIGURADO)
================================================================================
Para: ${name} <${email}>
De: ${from}
Asunto: Bienvenido a Columna Pública | Ecosistema Editorial de Alta Gama
--------------------------------------------------------------------------------
Hola, ${name}.

Te damos la bienvenida formal a Columna Pública, la plataforma líder de análisis, 
geopolítica y macroeconomía regional de alta gama.

Tu perfil ha sido creado con éxito por un Súper Administrador de la plataforma:
- Correo Electrónico: ${email}
- Rol Editorial: ${role.toUpperCase()}
- Contraseña Temporal: ${passwordClearText}

Por favor, inicia sesión y actualiza tu biografía y avatar en tu panel de control.
================================================================================
    `);
    return true; // Return true as a successful simulation to avoid breaking the core flow
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Use SSL/TLS for port 465
      auth: {
        user,
        pass,
      },
    });

    // Elegant high-end HTML design with dark-mode aesthetic (Columna Publica Theme: Navy & Gold)
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a Columna Pública</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040d1a;
      color: #ffffff;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #040d1a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: rgba(10, 25, 47, 0.9);
      border: 1px solid #d4af3770;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .header {
      background-color: #0c2340;
      padding: 40px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
    }
    .logo-container {
      margin-bottom: 20px;
    }
    .logo-graphic {
      width: 50px;
      height: auto;
      color: #d4af37;
      display: inline-block;
    }
    .title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #ffffff;
      margin: 0;
      font-family: 'Georgia', Times, serif;
    }
    .subtitle {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #d4af37;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
      color: #e2e8f0;
      font-size: 14px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .intro-text {
      color: #cbd5e1;
      margin-bottom: 30px;
    }
    .panel-credentials {
      background-color: rgba(255, 255, 255, 0.04);
      border-left: 3px solid #d4af37;
      border-radius: 4px;
      padding: 24px;
      margin-bottom: 35px;
    }
    .credential-row {
      margin-bottom: 12px;
      font-size: 13px;
    }
    .credential-row:last-child {
      margin-bottom: 0;
    }
    .credential-label {
      font-weight: 600;
      color: #d4af37;
      font-family: monospace;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 1px;
      display: inline-block;
      width: 130px;
    }
    .credential-value {
      color: #ffffff;
      font-weight: 500;
    }
    .credential-value.password {
      font-family: monospace;
      background-color: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .cta-container {
      text-align: center;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .cta-button {
      background-color: #d4af37;
      color: #040d1a !important;
      text-decoration: none;
      font-weight: bold;
      padding: 14px 35px;
      border-radius: 6px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: inline-block;
      transition: background-color 0.3s ease;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
    .footer {
      background-color: #040d1a;
      padding: 30px 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      line-height: 1.8;
    }
    .footer-quote {
      font-family: 'Georgia', Times, serif;
      font-style: italic;
      color: #d4af37;
      margin-bottom: 15px;
      font-size: 12px;
    }
    .footer-divider {
      height: 1px;
      background-color: rgba(255, 255, 255, 0.05);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Top banner & architectural motif -->
      <div class="header">
        <div class="logo-container">
          <svg class="logo-graphic" viewBox="0 0 100 120" fill="currentColor">
            <rect x="20" y="20" width="60" height="5" />
            <rect x="28" y="25" width="44" height="15" />
            <rect x="30" y="50" width="8" height="60" />
            <rect x="46" y="50" width="8" height="60" />
            <rect x="62" y="50" width="8" height="60" />
            <rect x="20" y="110" width="60" height="5" />
          </svg>
        </div>
        <h1 class="title">COLUMNA PÚBLICA</h1>
        <p class="subtitle">Ecosistema Editorial de Alta Gama</p>
      </div>

      <!-- Core Message -->
      <div class="content">
        <h2 class="greeting">Estimado(a) ${name},</h2>
        <p class="intro-text">
          Es un honor extenderle una cordial bienvenida formal a nuestro ecosistema de opinión pública, macroeconomía e inserción global de vanguardia tecnológica. Un Súper Administrador le ha otorgado credenciales oficiales para incorporarse a nuestra red selecta de intelectuales y líderes de opinión.
        </p>

        <p class="intro-text" style="font-size: 13px; color: #94a3b8;">
          A continuación, le proporcionamos sus credenciales seguras de acceso para iniciar su trayectoria analítica en la plataforma:
        </p>

        <!-- Dynamic Credentials Box -->
        <div class="panel-credentials">
          <div class="credential-row">
            <span class="credential-label">Correo:</span>
            <span class="credential-value font-mono">${email}</span>
          </div>
          <div class="credential-row">
            <span class="credential-label">Rol Asignado:</span>
            <span class="credential-value font-mono" style="color: #38bdf8; font-weight: bold;">
              ${role === 'admin' ? '👑 SÚPER ADMINISTRADOR' : role === 'editor' ? '👓 EDITOR DE SECCIÓN' : '✒️ COLUMNISTA COOPERADOR'}
            </span>
          </div>
          <div class="credential-row">
            <span class="credential-label">Contraseña:</span>
            <span class="credential-value password">${passwordClearText}</span>
          </div>
        </div>

        <p class="intro-text" style="font-size: 13px;">
          Por favor, recuerde actualizar su biografía, su fotografía de perfil y establecer una contraseña personalizada de alta complejidad en su primer ingreso a través de la sección de Configuración de Perfil.
        </p>

        <!-- CTA Login Link -->
        <div class="cta-container">
          <a href="${process.env.APP_URL || 'https://columnapublica.cl'}" style="color: #040d1a; text-decoration: none;" target="_blank" class="cta-button">Acceder al Panel de Control</a>
        </div>
      </div>

      <!-- Sophisticated Footer -->
      <div class="footer">
        <p class="footer-quote">"La pluma es la verdadera columna de la república"</p>
        <div class="footer-divider"></div>
        <p>Este correo electrónico fue generado de manera automática por los protocolos de seguridad del CMS de Columna Pública.</p>
        <p style="margin-top: 8px; color: rgba(255, 255, 255, 0.25);">© 2026 Columna Pública. Todos los derechos reservados.</p>
      </div>

    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: `Bienvenida a Columna Pública | Ecosistema Editorial de Alta Gama`,
      html: htmlContent,
      text: `Estimado(a) ${name},\n\nLe damos la bienvenida formal a Columna Pública.\n\nSus credenciales de acceso son:\n- Correo: ${email}\n- Rol: ${role}\n- Contraseña: ${passwordClearText}\n\nAcceda en: ${process.env.APP_URL || 'https://columnapublica.cl'}`,
    });

    console.log(`[Email Service] Correo de bienvenida enviado con éxito a: ${email}`);
    return true;
  } catch (error: any) {
    console.error(`[Email Service] ❌ Error enviando correo de bienvenida a ${email}:`, error);
    return false;
  }
}

export interface ApplicationEmailData {
  name: string;
  email: string;
  degree: string;
  motivation: string;
  category: string;
  documentUrl?: string;
}

export async function sendApplicationEmail({ name, email, degree, motivation, category, documentUrl }: ApplicationEmailData): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Columna Pública" <noreply@columnapublica.cl>`;
  const adminEmail = "admin@columnapublica.cl";

  console.log(`[Email Service] Enviando notificación de nueva postulación de: ${name} <${email}>`);

  if (!host || !user || !pass) {
    console.warn(
      `[Email Service] ⚠️ Las credenciales SMTP no están completamente configuradas para postulación (SMTP_HOST, SMTP_USER, SMTP_PASS). ` +
      `Se simulará el correo de postulación en consola.`
    );
    console.log(`
================================================================================
SIMULACIÓN DE CORREO DE POSTULACIÓN DE COLUMNISTA (SMTP NO CONFIGURADO)
================================================================================
Para: Súper Administrador <${adminEmail}>
De: ${from}
Asunto: Nueva Postulación de Miembro Columnista: ${name}
--------------------------------------------------------------------------------
Se ha recibido un nuevo registro de un académico / especialista interesado en escribir:

- Nombre Completo: ${name}
- Correo de Contacto: ${email}
- Grado Académico o Profesión: ${degree}
- Línea Temática de Interés: ${category}
- Documento Adjunto: ${documentUrl || "[No se adjuntó archivo]"}

Motivación y Áreas de Investigación:
${motivation}
================================================================================
    `);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Postulación de Columnista</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040d1a;
      color: #ffffff;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #040d1a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: rgba(10, 25, 47, 0.9);
      border: 1px solid #d4af3770;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background-color: #0c2340;
      padding: 30px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      font-family: 'Georgia', Times, serif;
    }
    .subtitle {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #d4af37;
      margin-top: 5px;
    }
    .content {
      padding: 35px;
      line-height: 1.6;
      color: #e2e8f0;
      font-size: 14px;
    }
    .info-box {
      background-color: rgba(255, 255, 255, 0.03);
      border-left: 3px solid #d4af37;
      border-radius: 4px;
      padding: 20px;
      margin: 25px 0;
    }
    .info-row {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: 600;
      color: #d4af37;
      font-family: monospace;
      font-size: 11px;
      text-transform: uppercase;
      display: inline-block;
      width: 150px;
    }
    .info-value {
      color: #ffffff;
    }
    .motivation-text {
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 15px;
      font-style: italic;
      color: #cbd5e1;
      margin-top: 10px;
    }
    .footer {
      background-color: #040d1a;
      padding: 20px 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="title">COLUMNA PÚBLICA</h1>
        <p class="subtitle">Notificación de Gabinete Editorial</p>
      </div>
      <div class="content">
        <h2 style="font-size: 16px; color: #ffffff; margin-top: 0;">Nueva Postulación de Miembro Columnista</h2>
        <p>Se ha recibido una nueva solicitud de registro de especialista en el portal doctrinal:</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Nombre:</span>
            <span class="info-value">${name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Correo:</span>
            <span class="info-value">${email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Grado Académico:</span>
            <span class="info-value">${degree}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Línea de Interés:</span>
            <span class="info-value" style="color: #38bdf8; font-weight: bold;">${category}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Documento Adjunto:</span>
            <span class="info-value">
              ${documentUrl ? `<a href="${documentUrl}" target="_blank" style="color: #dfba53; text-decoration: underline;">Ver Documento Adjunto</a>` : "No provisto"}
            </span>
          </div>
        </div>

        <h3 style="font-size: 13px; color: #d4af37; margin-bottom: 5px; text-transform: uppercase; font-family: monospace;">Motivación de Postulación:</h3>
        <div class="motivation-text">
          "${motivation.replace(/\n/g, "<br/>")}"
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 25px;">
          Por favor, póngase en contacto con el postulante o acceda al panel de administración para evaluar esta postulación doctrinal.
        </p>
      </div>
      <div class="footer">
        <p>© 2026 Columna Pública. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `Nueva Postulación de Miembro Columnista: ${name}`,
      html: htmlContent,
      text: `Nueva postulación recibida:\n\nNombre: ${name}\nCorreo: ${email}\nGrado académico: ${degree}\nLínea temática: ${category}\n\nMotivación:\n${motivation}\n\nDocumento: ${documentUrl || 'Ninguno'}`,
    });

    console.log(`[Email Service] Correo de notificación de postulación enviado con éxito a: ${adminEmail}`);
    return true;
  } catch (error: any) {
    console.error(`[Email Service] ❌ Error enviando correo de postulación de columnista:`, error);
    return false;
  }
}

export interface RecoveryEmailData {
  email: string;
  name: string;
  resetLink: string;
}

export async function sendRecoveryEmail({ email, name, resetLink }: RecoveryEmailData): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Columna Pública" <noreply@columnapublica.cl>`;

  console.log(`[Email Service] Enviando solicitud de recuperación de contraseña a: ${email}`);

  if (!host || !user || !pass) {
    console.warn(
      `[Email Service] ⚠️ Las credenciales SMTP no están completamente configuradas para recuperación de contraseña. ` +
      `Se simulará el correo de recuperación en la consola.`
    );
    console.log(`
================================================================================
SIMULACIÓN DE CORREO DE RECUPERACIÓN DE CONTRASEÑA (SMTP NO CONFIGURADO)
================================================================================
Para: ${name} <${email}>
De: ${from}
Asunto: Recuperación de Credenciales de Acceso - Columna Pública
--------------------------------------------------------------------------------
Estimado(a) ${name},

Hemos recibido una solicitud para restablecer la contraseña de su cuenta editorial.

Para proceder con la reconfiguración de su acceso, utilice el siguiente enlace seguro 
(válido por 1 hora):

Enlace de Restablecimiento: ${resetLink}

Si usted no solicitó este cambio, puede ignorar este mensaje de manera segura.
================================================================================
    `);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecimiento de Acceso Doctrinal</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040d1a;
      color: #ffffff;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #040d1a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: rgba(10, 25, 47, 0.9);
      border: 1px solid #d4af3770;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background-color: #0c2340;
      padding: 30px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      font-family: 'Georgia', Times, serif;
    }
    .subtitle {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #d4af37;
      margin-top: 5px;
    }
    .content {
      padding: 35px;
      line-height: 1.6;
      color: #e2e8f0;
      font-size: 14px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn-restore {
      background-color: #dfba53;
      color: #040d1a !important;
      padding: 12px 28px;
      text-decoration: none;
      font-weight: bold;
      font-family: monospace;
      font-size: 12px;
      text-transform: uppercase;
      border-radius: 6px;
      display: inline-block;
      letter-spacing: 1px;
    }
    .footer {
      background-color: #040d1a;
      padding: 20px 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="title">COLUMNA PÚBLICA</h1>
        <p class="subtitle">Gabinete de Seguridad de Cuentas</p>
      </div>
      <div class="content">
        <h2 style="font-size: 16px; color: #ffffff; margin-top: 0;">Solicitud de Restablecimiento de Credenciales</h2>
        <p>Estimado(a) <strong>${name}</strong>,</p>
        <p>
          Se ha registrado un requerimiento para restablecer las claves de su cuenta en Columna Pública. 
          Para completar este proceso de forma segura, presione el siguiente botón de acceso (activo durante una hora):
        </p>
        
        <div class="button-container">
          <a href="${resetLink}" class="btn-restore">Restablecer Mi Contraseña</a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
          Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:<br/>
          <span style="word-break: break-all; color: #38bdf8; font-family: monospace; font-size: 11px;">${resetLink}</span>
        </p>

        <p style="font-size: 11px; color: #64748b; margin-top: 25px; border-t: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
          Si usted no ha iniciado esta solicitud, puede desestimar este aviso con absoluta seguridad. Sus datos se mantendrán debidamente resguardados.
        </p>
      </div>
      <div class="footer">
        <p>© 2026 Columna Pública. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: `Recuperar Contraseña - Columna Pública`,
      html: htmlContent,
      text: `Estimado(a) ${name},\n\nHemos recibido una solicitud para cambiar tu contraseña en Columna Pública.\n\nAccede a este link para reestablecer la clave:\n${resetLink}\n\nSi no fuiste tú, ignora este mensaje.`,
    });

    console.log(`[Email Service] Correo de recuperación de contraseña enviado con éxito a: ${email}`);
    return true;
  } catch (error: any) {
    console.error(`[Email Service] ❌ Error enviando correo de recuperación de contraseña:`, error);
    return false;
  }
}

export interface VerificationEmailData {
  email: string;
  name: string;
  code: string;
}

export async function sendVerificationEmail({ email, name, code }: VerificationEmailData): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Columna Pública" <noreply@columnapublica.cl>`;

  console.log(`[Email Service] Enviando solicitud de verificación de lector a: ${email}`);

  if (!host || !user || !pass) {
    console.warn(
      `[Email Service] ⚠️ Las credenciales SMTP no están completamente configuradas para verificación de lector. ` +
      `Se simulará la verificación en la consola.`
    );
    console.log(`
================================================================================
SIMULACIÓN DE VERIFICACIÓN DE LECTOR (SMTP NO CONFIGURADO)
================================================================================
Para: ${name} <${email}>
De: ${from}
Asunto: Código de Verificación Doctrinal - Columna Pública
--------------------------------------------------------------------------------
Estimado(a) ${name},

Gracias por iniciar su inscripción oficial como lector en Columna Pública. Su voz activa
ayuda a sostener el balance y rigor editorial de nuestro repositorio analítico.

Para activar sus atribuciones completas de debate y evaluación, por favor ingrese
el siguiente código de seguridad de un solo uso en la plataforma:

CÓDIGO DE VERIFICACIÓN: ${code}

Este código expira en 30 minutos y es privado de su cuenta.
================================================================================
    `);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Lector - Columna Pública</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040d1a;
      color: #ffffff;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #040d1a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: rgba(10, 25, 47, 0.9);
      border: 1px solid #d4af3770;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background-color: #0c2340;
      padding: 30px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      font-family: 'Georgia', Times, serif;
    }
    .subtitle {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #d4af37;
      margin-top: 5px;
    }
    .content {
      padding: 35px;
      line-height: 1.6;
      color: #e2e8f0;
      font-size: 14px;
    }
    .code-box {
      background-color: rgba(255, 255, 255, 0.04);
      border: 1px dashed #dfba53;
      border-radius: 6px;
      padding: 24px;
      margin: 30px 0;
      text-align: center;
    }
    .verification-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #dfba53;
      font-family: monospace;
      margin: 0;
    }
    .footer {
      background-color: #040d1a;
      padding: 20px 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="title">COLUMNA PÚBLICA</h1>
        <p class="subtitle">Validación de Lector Oficial</p>
      </div>
      <div class="content">
        <h2 style="font-size: 16px; color: #ffffff; margin-top: 0;">Activación de Identidad de Discusión</h2>
        <p>Estimado(a) <strong>${name}</strong>,</p>
        <p>
          Agradecemos su interés en inscribirse como Lector Oficial de nuestro portal de análisis y macroeconomía regional.
          Su credencial de lectura le habilita para emitir su acuerdo/desacuerdo frente a publicaciones y abrir debates razonados.
        </p>
        <p>
          Para completar su validación de correo electrónico e iniciar su participación doctrinal, ingrese el siguiente código seguro de validación de un solo uso en la pantalla de inscripción:
        </p>
        
        <div class="code-box">
          <div class="verification-code">${code}</div>
          <p style="font-size: 11px; color: #cbd5e1; margin-top: 8px; margin-bottom: 0;">Vencimiento estimado en 30 minutos</p>
        </div>

        <p style="font-size: 11px; color: #64748b; margin-top: 25px;">
          Si usted no solicitó inscribirse en nuestra plataforma, puede ignorar este mensaje de manera segura. Sus datos de contacto no serán guardados.
        </p>
      </div>
      <div class="footer">
        <p>© 2026 Columna Pública. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: `${code} es su código de verificación como Lector Oficial - Columna Pública`,
      html: htmlContent,
      text: `Estimado(a) ${name},\n\nSu código de validación es: ${code}\n\nIngrese este código para validar su cuenta de Lector Oficial en Columna Pública.\n\nAtentamente,\nConsejo Editorial de Columna Pública`,
    });

    console.log(`[Email Service] Correo de verificación enviado con éxito a: ${email}`);
    return true;
  } catch (error: any) {
    console.error(`[Email Service] ❌ Error enviando correo de verificación de lector:`, error);
    return false;
  }
}


