import { Request, Response } from 'express';
import { sendMail } from '../../services/mailService';

export async function testSendMail(req: Request, res: Response) {
  const to = (req.query.to as string) || process.env.TEST_EMAIL || '';
  const subject = `Prueba de correo - Columna Pública`;
  const html = `
    <h2>Prueba de envío de correo</h2>
    <p>Este es un correo de prueba enviado desde el endpoint <strong>/api/test-mail</strong>.</p>
  `;

  if (!to) {
    return res.status(400).json({ ok: false, error: 'Falta el parámetro `to` o la variable de entorno TEST_EMAIL' });
  }

  try {
    await sendMail(to, subject, html);
    return res.json({ ok: true, to });
  } catch (err: any) {
    console.error('Error sending test mail:', err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
