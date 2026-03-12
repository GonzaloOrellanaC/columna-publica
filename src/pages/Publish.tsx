import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { get, set } from 'idb-keyval';

interface Publication {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status?: 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';
}

export default function Publish() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [myPublications, setMyPublications] = useState<Publication[]>([]);
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();
  const author = localStorage.getItem('username') || 'Usuario Anónimo';

  // Protected route check
  if (localStorage.getItem('auth') !== 'true') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    // Load draft from IndexedDB
    const loadDraft = async () => {
      const draftTitle = await get(`draft_title_${author}`);
      const draftContent = await get(`draft_content_${author}`);
      if (draftTitle) setTitle(draftTitle);
      if (draftContent) setContent(draftContent);
    };
    loadDraft();

    // Fetch my publications from backend
    const fetchMyPublications = async () => {
      try {
        const res = await fetch(`/api/publications/author/${encodeURIComponent(author)}`);
        if (res.ok) {
          const data = await res.json();
          setMyPublications(data);
        }
      } catch (error) {
        console.error('Error fetching my publications:', error);
      }
    };
    fetchMyPublications();
  }, [author]);

  // Save to IndexedDB on change
  useEffect(() => {
    const saveDraft = async () => {
      await set(`draft_title_${author}`, title);
      await set(`draft_content_${author}`, content);
    };
    // Debounce saving slightly or save directly
    const timeoutId = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeoutId);
  }, [title, content, author]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, content, status: 'EN_REVISION' }),
      });
      if (res.ok) {
        // Clear draft
        await set(`draft_title_${author}`, '');
        await set(`draft_content_${author}`, '');
        setTitle('');
        setContent('');
        // Refresh list
        const resList = await fetch(`/api/publications/author/${encodeURIComponent(author)}`);
        if (resList.ok) {
          const data = await resList.json();
          setMyPublications(data);
        }
      }
    } catch (error) {
      console.error('Error creating publication:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publish-container">
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowRules(false)}>×</button>
            <h2 className="modal-title">Normas de Publicación</h2>
            <div className="modal-body">
              <p>Para mantener un espacio de respeto y calidad, te pedimos seguir las siguientes normas de convivencia:</p>
              <ul>
                <li><strong>Buen Lenguaje:</strong> Mantén un tono respetuoso en todo momento.</li>
                <li><strong>Evitar Escritura Soez:</strong> No se tolerarán insultos, groserías, ni lenguaje ofensivo o discriminatorio.</li>
                <li><strong>Opinión Personal:</strong> Da énfasis a que lo escrito es tu opinión personal. Fomenta el debate constructivo.</li>
              </ul>
              <p>
                <strong>Uso de Inteligencia Artificial:</strong> El editor, mediante herramientas de análisis de inteligencia artificial, evaluará el contenido. Si se determina que el uso de estas herramientas es sobresaliente o excesivo y reemplaza la voz auténtica del autor, <strong>se rechazará la publicación</strong>.
              </p>
              <p>
                En casos de incumplimiento reiterado, se podrá determinar <strong>terminar con tu permiso de publicación</strong>.
              </p>
              <p style={{ fontStyle: 'italic', marginTop: '1.5rem', borderTop: '1px solid #2d4356', paddingTop: '1rem' }}>
                "El tiempo del editor es tan valioso como el de quien publica."
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <Link to="/" className="btn-back">Volver a la página principal</Link>
        <div className="form-container">
          <h3 className="form-title">Nueva Publicación</h3>
          
          <button 
            type="button" 
            className="btn-rules" 
            onClick={() => setShowRules(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Ver Normas de Publicación
          </button>

          <div style={{ marginBottom: '1.5rem', color: '#a0aec0', fontSize: '0.9rem' }}>
            <strong>Autor:</strong> {author}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Título de la Columna</label>
              <input
                id="title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="content">Contenido</label>
              <textarea
                id="content"
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando a revisión...' : 'Enviar a Revisión'}
            </button>
          </form>
        </div>
      </div>
      
      <div style={{ flex: 1, background: 'rgba(20, 34, 48, 0.6)', padding: '2rem', borderRadius: '8px', border: '1px solid #2d4356' }}>
        <h3 className="form-title" style={{ borderBottom: 'none', marginBottom: '1rem' }}>Mis Publicaciones</h3>
        
        {/* Drafts */}
        {(title || content) && (
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '1rem', borderLeft: '4px solid #5b9bd5' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{title || 'Borrador sin título'}</h4>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#5b9bd5', color: '#fff', borderRadius: '12px' }}>EN_CREACION</span>
          </div>
        )}

        {/* Backend Publications */}
        {myPublications.length === 0 ? (
          <p style={{ color: '#a0aec0' }}>No tienes publicaciones enviadas aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myPublications.map(pub => (
              <div key={pub.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', borderLeft: `4px solid ${pub.status === 'PUBLICADA' ? '#48bb78' : '#ecc94b'}` }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{pub.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                    {new Date(pub.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: pub.status === 'PUBLICADA' ? '#48bb78' : '#ecc94b', color: '#1a202c', borderRadius: '12px', fontWeight: 'bold' }}>
                    {pub.status || 'EN_REVISION'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
