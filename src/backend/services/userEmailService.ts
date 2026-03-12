import { sendMail } from './mailService';
import { getWelcomeEmail, getResetEmail } from './emailTemplates';

export async function sendWelcomeEmail(to: string, name: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5107';
  const resetLink = `${frontendUrl}/reset-password/${token}`;
  const html = getWelcomeEmail(name, resetLink);
  await sendMail(to, 'Bienvenido a Columna Pública', html);
}

export async function sendResetPasswordEmail(to: string, name: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5107';
  const resetLink = `${frontendUrl}/reset-password/${token}`;
  const html = getResetEmail(name, resetLink);
  await sendMail(to, 'Recupera tu contraseña - Columna Pública', html);
}
