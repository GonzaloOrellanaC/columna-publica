import React from 'react';
import { Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
  };

  return (
    <div className="share-buttons">
      <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Compartir en X" title="Compartir en X">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Compartir en Facebook" title="Compartir en Facebook">
        <Facebook size={18} />
      </a>
      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="share-btn" aria-label="Compartir en LinkedIn" title="Compartir en LinkedIn">
        <Linkedin size={18} />
      </a>
      <button onClick={copyToClipboard} className="share-btn" aria-label="Copiar enlace" title="Copiar enlace">
        <LinkIcon size={18} />
      </button>
    </div>
  );
}
