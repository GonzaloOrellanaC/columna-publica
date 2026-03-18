import React, { useEffect, useState, useRef } from 'react';
import { get, set } from 'idb-keyval';
import { Publication } from '../interfaces';

interface Props {
  open: boolean;
  onClose: () => void;
  publication: Publication;
  draft?: any;
  bannerUrl?: string | null;
  authorAvatar?: string;
  authorDescription?: string;
}

export default function ExportModal({ open, onClose, publication, draft, bannerUrl, authorAvatar, authorDescription }: Props) {
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'bw' | 'color'>('bw');
  const previewRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const u = localStorage.getItem('user');
        let fullName = '';
        if (u) {
          const parsed = JSON.parse(u);
          fullName = `${parsed.nombres || ''} ${parsed.apellidos || ''}`.trim();
        }
        const stored = fullName ? await get(`export_images_${fullName}`) : null;
        const list = Array.isArray(stored) ? (stored as string[]) : [];
        const currentBanner = (draft && draft.image) || (publication && (publication as any).imageUrl) || bannerUrl;
        const merged = currentBanner ? [currentBanner, ...list.filter(i => i !== currentBanner)] : list;
        setGallery(merged);
        setSelectedBg(currentBanner || (merged.length > 0 ? merged[0] : null));
        setPreviewFilter('bw');
      } catch (e) {
        console.warn('No se pudo cargar galería', e);
      }
    })();
  }, [open, draft, publication, bannerUrl]);

  const authorDesc = (() => {
    if (authorDescription) return authorDescription;
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const p = JSON.parse(u);
        return p.descripcion || p.resena || '';
      }
    } catch (e) {}
    return '';
  })();

  // helpers
  async function createImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }
        // Prefer DOM capture via useToPng (react-to-image) when available to get exact rendered result
  async function exportFromModal() {
    if (!previewRef.current) return;

    async function fetchAsDataUrl(url: string) {
      try {
        if (url.startsWith('data:')) return url;
        // ensure absolute
        let abs = url;
        if (url.startsWith('/')) abs = window.location.origin + url;
        const resp = await fetch(abs, { mode: 'cors' });
        if (!resp.ok) throw new Error('fetch failed ' + resp.status);
        const blob = await resp.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Could not inline image', url, e);
        return url;
      }
    }

    // Clone preview DOM and inline image sources
    const cloned = previewRef.current.cloneNode(true) as HTMLElement;
    const imgs = Array.from(cloned.querySelectorAll('img')) as HTMLImageElement[];
    await Promise.all(imgs.map(async (img) => {
      const s = img.getAttribute('src') || '';
      if (!s) return;
      try {
        const dataUrl = await fetchAsDataUrl(s);
        if (dataUrl) img.setAttribute('src', dataUrl);
      } catch (e) {
        // leave original if fails
      }
    }));

    const width = previewRef.current.offsetWidth || 400;
    const height = previewRef.current.offsetHeight || 480;

    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${width}, initial-scale=1"><style>body{margin:0;padding:0}img{max-width:none}</style></head><body><div style="width:${width}px;height:${height}px">${cloned.innerHTML}</div></body></html>`;

    try {
      const res = await fetch('http://localhost:5108/generate-png', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, width, height }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const authorName = typeof publication.author === 'string' ? publication.author : `${publication.author.nombres} ${publication.author.apellidos}`;
      a.download = `${(authorName || 'columna').replace(/\s+/g, '_').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    } catch (err) {
      console.warn('Python PNG service failed, falling back to html2canvas', err);
      try {
        // @ts-ignore
        const mod = await import('html2canvas');
        const html2canvas = (mod as any).default || mod;
        const originalCanvas = await html2canvas(previewRef.current as HTMLElement, { scale: 3, useCORS: true, allowTaint: false });
        const finalDataUrl = originalCanvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = finalDataUrl;
        const authorName = typeof publication.author === 'string' ? publication.author : `${publication.author.nombres} ${publication.author.apellidos}`;
        a.download = `${(authorName || 'columna').replace(/\s+/g, '_').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      } catch (err2) {
        console.warn('html2canvas fallback failed', err2);
      }
    }
  }

  if (!open) return null;

  async function handleAddAt(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const data = reader.result as string;
        // remove duplicates and insert at index
        const filtered = gallery.filter(i => i !== data);
        filtered.splice(index, 0, data);
        setGallery(filtered);
        setSelectedBg(data);
        try {
          const u = localStorage.getItem('user');
          let fullName = '';
          if (u) {
            const parsed = JSON.parse(u);
            fullName = `${parsed.nombres || ''} ${parsed.apellidos || ''}`.trim();
          }
          if (fullName) await set(`export_images_${fullName}`, filtered);
        } catch (err) { console.warn('No se pudo guardar imagen en galería', err); }
      };
      reader.readAsDataURL(f);
    };
    input.click();
  }

  async function handleRemoveAt(index: number) {
    try {
      const next = gallery.slice();
      const removed = next.splice(index, 1)[0];
      setGallery(next);
      if (selectedBg === removed) {
        setSelectedBg(next.length > 0 ? next[0] : null);
      }
      const u = localStorage.getItem('user');
      let fullName = '';
      if (u) {
        const parsed = JSON.parse(u);
        fullName = `${parsed.nombres || ''} ${parsed.apellidos || ''}`.trim();
      }
      if (fullName) await set(`export_images_${fullName}`, next);
    } catch (err) {
      console.warn('No se pudo eliminar imagen de galería', err);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: 1100, display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, background: '#0b1320', padding: 12, borderRadius: 8, color: '#fff' }}>
          

          <div style={{ width: '100%', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            
          {/* Floating vertical icon buttons (export / filter toggle / close) */}
          <div style={{ position: 'absolute', right: 24, top: '20%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 20 }}>
            <button title="Exportar PNG" onClick={async () => { await exportFromModal(); }} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.95)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(2,6,23,0.45)', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10" stroke="#071021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#071021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5 5 5-5" stroke="#071021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <button title="Alternar filtro" onClick={() => setPreviewFilter(p => p === 'bw' ? 'color' : 'bw')} style={{ width: 40, height: 40, borderRadius: 10, background: previewFilter === 'bw' ? 'rgba(255,255,255,0.9)' : 'rgba(91,155,213,0.95)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(2,6,23,0.35)', cursor: 'pointer' }}>
              {previewFilter === 'bw' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#071021" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>

            <button title="Cerrar" onClick={onClose} style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(2,6,23,0.35)', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#071021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6l12 12" stroke="#071021" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
            <div style={{ width: 400, height: 480, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              <div ref={previewRef} style={{ width: 400, height: 480, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                {selectedBg ? (
                  <img width={'100%'} height={'100%'} src={selectedBg} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: previewFilter === 'bw' ? 'grayscale(100%) brightness(40%)' : 'none' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: '#071021' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,16,33,0.35)' }} />

                <img ref={logoRef} src="/horizontal-transparente-blanco.svg" alt="Columna Pública" style={{ position: 'absolute', top: 18, left: 5, zIndex: 6, width: 300, pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 8 }}>
                  <div ref={avatarRef} style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 8px 22px rgba(0,0,0,0.45)' }}>
                    <img src={authorAvatar || ''} alt={typeof publication.author === 'string' ? publication.author : `${publication.author.nombres} ${publication.author.apellidos}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                <div ref={cardRef} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 150, width: '90%', background: 'rgba(255,255,255,0.96)', borderRadius: 10, padding: '16px 16px', boxSizing: 'border-box', zIndex: 7, boxShadow: '0 12px 40px rgba(2,6,23,0.55)' }}>
                  <blockquote style={{ margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, lineHeight: '1.4', color: '#071021', textAlign: 'justify' }}>
                    {publication.content.split('\n').slice(0, 6).join(' ')}
                  </blockquote>

                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#07233a', fontSize: 15 }}>
                      {typeof publication.author === 'string' ? publication.author : `${publication.author.nombres} ${publication.author.apellidos}`}
                    </div>
                    <div style={{ fontSize: 11, color: '#243b53', lineHeight: '1.0', textAlign: 'center' }}>{authorDesc}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside style={{ width: 220, background: '#071021', padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ marginTop: 0, color: '#fff' }}>Imágenes</h4>
            <div>
              <button type="button" onClick={() => handleAddAt(0)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: '#ffffff', color: '#071021', border: '1px solid #233444', cursor: 'pointer' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
                <span style={{ fontSize: 13 }}>Agregar</span>
              </button>
            </div>
          </div>

            <div style={{ marginTop: 8, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gallery.length === 0 && <div style={{ color: '#9fb0c8' }}>Sin imágenes</div>}
              {gallery.map((g, idx) => (
                <div key={idx} style={{ position: 'relative', border: selectedBg === g ? '2px solid #5b9bd5' : '1px solid #233444', borderRadius: 6, overflow: 'hidden' }}>
                  <img src={g} alt={`img-${idx}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block', cursor: 'pointer' }} onClick={() => setSelectedBg(g)} />
                  <button onClick={() => handleRemoveAt(idx)} title="Eliminar" style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
        </aside>
      </div>
    </div>
  );
}
