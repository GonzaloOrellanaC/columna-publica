import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: 'https://api.mailgun.net',
});

const DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM = `Columna Pública <no-reply@${DOMAIN}>`;

export async function sendMail(to: string, subject: string, html: string) {
  return mg.messages.create(DOMAIN, {
    from: FROM,
    to,
    subject,
    html,
  });
}
