import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import ShareButtons from '../components/ShareButtons';
import { slugifyFullName, slugifyTitle } from '../utils/slug';
import { get } from 'idb-keyval';
import ExportModal from '../components/ExportModal';
import { getPublicationById } from '../api/publications';
import { Author, History, Publication } from '../interfaces';

export default function PublicationDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location && (location.state as any)) || {};
  const [publication, setPublication] = useState<Publication | null>(state.draft || null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [me, setMe] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.draft) {
      console.log('Mostrando vista previa de borrador:', state.draft);
      setPublication(state.draft);
      setLoading(false);
      /* setFullName(state.draft.author || 'Autor desconocido');
      setAvatarUrl(state.draft.authorAvatar || null);
      setAuthorDescription(state.draft.authorDescription || null); */
      return;
    }

    const fetchPublication = async () => {
      try {
        const res = await getPublicationById(id!);
        console.log(res);
        setPublication(res);
      } catch (e) {
        console.error('Error fetching publication:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
    const u = localStorage.getItem('user');
    if (u) {
      try {
        const parsed = JSON.parse(u);
        setMe(parsed);
      } catch {}
    }
  }, [id, state.draft]);

  // log visit when a real publication is loaded (not draft)
  useEffect(() => {
    if (!publication) return;
    if (state.draft) return;
    (async () => {
      try {
        const { logVisit } = await import('../api/visits');
        const user = localStorage.getItem('user');
        let userId: string | undefined = undefined;
        if (user) {
          try { userId = JSON.parse(user)._id; } catch {}
        }
        await logVisit({ path: window.location.pathname, publicationId: (publication as any)._id || undefined, userId, referrer: document.referrer || undefined });
      } catch (e) {
        // ignore logging errors
      }
    })();
  }, [publication, state.draft]);

  useEffect(() => {
    if (publication && publication.author) {
      setAuthor(publication.author as Author);
    }
  }, [publication]);

  useEffect(() => {
    const resolveBanner = async () => {
      try {
        if (state.draft && (state.draft as any).image) {
          setBannerUrl((state.draft as any).image);
          return;
        }
        if ((publication as any) && (publication as any).imageUrl) {
          setBannerUrl((publication as any).imageUrl);
          return;
        }

        const u = localStorage.getItem('user');
        if (u) {
          try {
            const parsed = JSON.parse(u);
            const fullName = `${parsed.nombres || ''} ${parsed.apellidos || ''}`.trim();
            if (fullName) {
              const img = await get(`draft_image_${fullName}`);
              if (img) {
                setBannerUrl(img as string);
                return;
              }
            }
          } catch {}
        }
      } catch (e) {
        // ignore
      }
    };
    resolveBanner();
  }, [publication, state.draft]);

  const hasHistory = Boolean(publication && (publication as any).history && (publication as any).history.length > 0);
  const handleBack = () => {
    if (hasHistory) navigate(-1);
    else navigate('/');
  };
  const backLabel = hasHistory ? 'Volver atrás' : 'Página principal';

  if (loading) return <div className="loading-state">Cargando columna...</div>;
  if (!publication) return <div className="error-state">Columna no encontrada.</div>;

  // author checks
  let isAuthor = false;
  try {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed._id && (publication.author === parsed._id || publication.author === parsed._id.toString())) isAuthor = true;
      const fullName = `${parsed.nombres} ${parsed.apellidos}`;
      if (publication.author && typeof publication.author !== 'string' && `${publication.author.nombres} ${publication.author.apellidos}` === fullName) isAuthor = true;
    }
  } catch {}

  // author avatar resolution
  /* let authorAvatar = '';
  try {
    if (state.draft && (state.draft as any).authorAvatar) authorAvatar = (state.draft as any).authorAvatar;
    else if ((publication as any).avatarUrl) authorAvatar = `${(import.meta.env as any).VITE_ASSETS_URL}${(publication as any).avatarUrl}`;
    else {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed && parsed.avatarUrl) authorAvatar = `${(import.meta.env as any).VITE_ASSETS_URL}${parsed.avatarUrl}`;
      }
    }
  } catch {} */

  const openExportModal = async () => {
    setExportModalOpen(true);
  };

  // editor actions
  const isEditor = (() => {
    try {
      const u = localStorage.getItem('user');
      if (!u) return false;
      const parsed = JSON.parse(u);
      const roles: {
        name: string;
      }[] = parsed.roles || [];
      return roles.some(role => role.name === 'editor' || role.name === 'ROLE_EDITOR') || parsed.role === 'editor';
    } catch { return false; }
  })();

  const handleApprove = async () => {
    if (!publication) return;
    try {
      const status = 'PUBLICADA';
      const history: History[] = [...(publication.history || []), { status, publishDate: new Date(), content: 'Publicación aprobada y publicada.', usr: me._id }];
      const res = await (await import('../api/publications')).approvePublication({ ...publication, status, history });
      setPublication(res);
      alert('Publicación aprobada y publicada.');
    } catch (e) {
      console.error('Approve failed', e);
      alert('No se pudo aprobar la publicación.');
    }
  };

  const handleReject = async () => {
    if (!publication) return;
    const comment = window.prompt('Comentario para el autor (opcional):');
    try {
      const status = 'ITERANDO';
      const history: History[] = [...(publication.history || []), { status, publishDate: new Date(), content: comment || 'Publicación devuelta al autor.', usr: me._id }];
      const res = await (await import('../api/publications')).rejectPublication({ ...publication, status, history, comment });
      setPublication(res);
      alert('Publicación devuelta al autor.');
    } catch (e) {
      console.error('Reject failed', e);
      alert('No se pudo devolver la publicación.');
    }
  };

  return (
    <div className="publication-detail-container" style={{ position: 'relative' }}>
      {bannerUrl && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <img
            src={bannerUrl}
            alt="background"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(30%)', transform: 'scale(1.05)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,16,33,0.45)' }} />
        </div>
      )}

      {publication.status !== 'PUBLICADA' && isAuthor && (
        <div style={{ background: '#ff4d4f', color: '#fff', padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>
          VISTA PREVIA — Solo la verá el autor mientras la publicación no esté publicada
        </div>
      )}

      <button
        onClick={handleBack}
        className="btn-back"
        style={{
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          padding: 0,
          position: 'relative',
          zIndex: 3
        }}
        aria-label={backLabel}
      >
        {backLabel}
      </button>

      <article className="publication-detail-card" style={{ position: 'relative', zIndex: 2 }}>
        <header className="detail-header">
          <h1 className="detail-title">{publication.title}</h1>
          <div className="detail-meta">
            <Link to={`/author/${slugifyFullName(author ? `${author.nombres}-${author.apellidos}` : '')}`} className="author-link">
              <img src={author ? author.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(author ? `${author.nombres} ${author.apellidos}` : '')}&background=random&color=fff&size=150`} alt={author ? `${author.nombres} ${author.apellidos}` : ''} className="author-avatar-large" />
            </Link>
            <div className="detail-author-info">
              <Link to={`/author/${slugifyFullName(author ? `${author.nombres} ${author.apellidos}` : '')}`} className="author-link">
                <span className="detail-author">Por {author ? `${author.nombres} ${author.apellidos}` : ''}</span>
              </Link>
              <span className="detail-date">
                {new Date(publication.publishDate || publication.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {bannerUrl && (
          <div style={{ width: '100%', margin: '1rem 0' }}>
            <div style={{ width: '100%', position: 'relative', paddingTop: '66.666%', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d4356', background: '#071021' }}>
              <img src={bannerUrl} alt="Imagen representativa" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}

        <div className="detail-content">
          {publication.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="detail-footer" style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="share-label">Compartir columna:</span>
          <ShareButtons url={`${window.location.origin}/publication/${slugifyTitle(publication.title || (publication._id || 'preview'))}`} title={publication.title} disabled={!!state.draft} />
          {/* <button className="btn-outline" onClick={openExportModal} style={{ marginLeft: 'auto' }}>Generar PNG</button> */}
          {isEditor && publication.status === 'EN_REVISION' && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={handleApprove} style={{ background: '#48bb78', color: '#062018', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Aprobar</button>
              <button onClick={handleReject} className="btn-outline" style={{ borderColor: '#ff6b6b', color: '#ff6b6b', background: 'transparent', cursor: 'pointer', padding: '8px 12px', borderRadius: 6 }}>Devolver</button>
            </div>
          )}
        </div>

        {/* 
          Si el usuario es editor y esta publicación está en revisión, mostrar un botón para aprobarla o devolverla al autor con comentarios. Esto se puede hacer verificando el rol del usuario (guardado en localStorage) y el estado de la publicación.
        
        */}
      </article>

      {exportModalOpen && (
        <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} authorDescription={author ? author.descripcion : ''} publication={publication} draft={state.draft} bannerUrl={bannerUrl} authorAvatar={author ? author.avatarUrl : ''} />
      )}
    </div>
  );
  // helpers moved to ExportModal
}