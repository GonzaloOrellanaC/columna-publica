
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function renderTemplate(templatePath: string, variables: Record<string, string>) {
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return html;
}


export function getWelcomeEmail(name: string, resetLink: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatePath = path.join(__dirname, 'templates', 'welcome.html');
  return renderTemplate(templatePath, { name, resetLink });
}


export function getResetEmail(name: string, resetLink: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatePath = path.join(__dirname, 'templates', 'reset.html');
  return renderTemplate(templatePath, { name, resetLink });
}

export function getEditorNotificationEmail(authorName: string, publishDate: string, title: string, link: string, approveLink: string, rejectLink: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatePath = path.join(__dirname, 'templates', 'editor_review.html');
  return renderTemplate(templatePath, { authorName, publishDate, title, link, approveLink, rejectLink });
}
