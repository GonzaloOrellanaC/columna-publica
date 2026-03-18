import { Request, Response } from 'express';
import { findPublicationById, findPublicationBySlug } from '../../services/publicationService';
import { UserModel } from '../../models/UserModel';

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, '');
}

export const renderPublicationPreview = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let pub: any = null;
    try { pub = await findPublicationById(id); } catch (e) { pub = null; }
    if (!pub) {
      try { pub = await findPublicationBySlug(id); } catch (e) { pub = null; }
    }
    if (!pub) {
      return res.status(404).send('Publication not found');
    }

    const title = pub.title || 'Columna Pública';
    const rawContent = pub.content || '';
    const description = stripHtml(rawContent).slice(0, 200);

    // choose image: publication image -> author avatar -> default logo
    let imagePath = pub.imageUrl || '';
    let authorName = '';
    let authorAvatar = '';
    try {
      if (!imagePath) {
        if (pub && pub.author) {
          if (typeof pub.author === 'object') {
            authorName = ((pub.author as any).nombres || '') + ' ' + ((pub.author as any).apellidos || '');
            authorAvatar = (pub.author as any).avatarUrl || '';
            if (authorAvatar) imagePath = authorAvatar;
          } else {
            const user = await UserModel.findById(pub.author).exec();
            if (user) {
              authorName = `${(user as any).nombres || ''} ${(user as any).apellidos || ''}`.trim();
              authorAvatar = (user as any).avatarUrl || '';
              if (authorAvatar) imagePath = authorAvatar;
            }
          }
        }
      } else {
        // if pub.imageUrl exists and author info also populated
        if (pub.author && typeof pub.author === 'object') {
          authorName = ((pub.author as any).nombres || '') + ' ' + ((pub.author as any).apellidos || '');
          authorAvatar = (pub.author as any).avatarUrl || '';
        }
      }
    } catch (e) {
      // ignore
    }
    if (!imagePath) imagePath = '/public/columna-publica-oscuro-fondo.png';

    // ensure absolute URL
    const origin = `${req.protocol}://${req.get('host')}`;
    const imageUrl = imagePath.startsWith('http') ? imagePath : `${origin}${imagePath}`;
    const pageUrl = `${origin}${req.originalUrl}`;

    // determine publish date
    const publishedAt = (pub.publicationDate || pub.publishDate || pub.createdAt || pub.updatedAt) ? new Date(pub.publicationDate || pub.publishDate || pub.createdAt || pub.updatedAt).toISOString() : '';

    // tags
    const tags: string[] = Array.isArray(pub.tags) ? pub.tags : (typeof pub.tags === 'string' && pub.tags.length ? (() => {
      try { return JSON.parse(pub.tags); } catch { return pub.tags.split(',').map((s: string) => s.trim()).filter(Boolean); }
    })() : []);

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />

  <!-- Open Graph -->
  <meta property="og:site_name" content="Columna Pública" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  ${publishedAt ? `<meta property="article:published_time" content="${escapeHtml(publishedAt)}" />` : ''}
  ${authorName ? `<meta property="article:author" content="${escapeHtml(authorName)}" />` : ''}
  ${tags.map(t => `<meta property="article:tag" content="${escapeHtml(t)}" />`).join('\n  ')}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  ${authorName ? `<meta name="twitter:creator" content="${escapeHtml(authorName)}" />` : ''}

  <meta name="author" content="${escapeHtml(authorName || 'Columna Pública')}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <script>window.location.replace('${escapeJs(origin)}');</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(req.originalUrl)}">${escapeHtml(req.originalUrl)}</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err: any) {
    console.error('Error rendering preview:', err);
    res.status(500).send('Server error');
  }
};

function escapeHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(s: string) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export default { renderPublicationPreview };
