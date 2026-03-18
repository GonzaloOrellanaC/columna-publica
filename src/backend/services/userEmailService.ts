import { sendMail } from './mailService';
import { getWelcomeEmail, getResetEmail, getEditorNotificationEmail } from './emailTemplates';
import { RoleModel } from '../models/RoleModel';
import { UserModel } from '../models/UserModel';

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

export async function sendEditorNotificationToEditors(authorName: string, publishDate: string, title: string, publicationId: string) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5107';
    // create a slug from title for public link
    const slug = (title || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    const link = `${frontendUrl}/publication/${encodeURIComponent(slug)}`;
    const approveLink = `${frontendUrl}/admin`; // placeholder; adjust if you have an approve route
    const rejectLink = `${frontendUrl}/admin`;

    // find role id for 'editor'
    const editorRole = await RoleModel.findOne({ name: 'editor' }).exec();
    if (!editorRole) return;
    const editors = await UserModel.find({ roles: editorRole._id as any }).exec();
    const emails = editors.map(e => e.email).filter(Boolean);
    if (emails.length === 0) return;

    const html = getEditorNotificationEmail(authorName, publishDate, title, link, approveLink, rejectLink);
    // send to all editors (comma-separated list)
    await sendMail(emails.join(','), `Nueva publicación para revisar: ${title}`, html);
  } catch (err) {
    console.error('Error sending editor notification:', err);
  }
}
