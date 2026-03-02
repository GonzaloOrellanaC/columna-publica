import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import { Facebook, Linkedin, Link as LinkIcon, Menu, X } from 'lucide-react';
import './index.css';

import { get, set } from 'idb-keyval';

interface Publication {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status?: 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';
}

// --- Components ---

function ShareButtons({ url, title }: { url: string, title: string }) {
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

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('auth') === 'true';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" aria-label="Columna Pública" onClick={closeMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" className="navbar-logo">
          {/* Icon scaled down and translated to the left */}
          <g transform="matrix(0.3, 0, 0, 0.3, 10, -17)">
              <g fill="currentColor">
                  <rect x="140" y="125" width="120" height="10"/>
                  <rect x="172" y="135" width="56" height="35"/>
                  <path d="M 172,135 A 18,18 0 0,0 172,170 A 25,25 0 0,1 172,135 Z"/>
                  <path d="M 228,135 A 18,18 0 0,1 228,170 A 25,25 0 0,0 228,135 Z"/>
                  <path d="M162,190 L238,190 L228,170 L172,170 Z"/>
                  <rect x="172" y="190" width="12" height="200"/>
                  <rect x="194" y="190" width="12" height="200"/>
                  <rect x="216" y="190" width="12" height="200"/>
              </g>
          </g>

          {/* Typography next to the icon */}
          <text x="110" y="65" fontFamily="'Cinzel', serif" fontSize="38" fontWeight="700" fill="currentColor">COLUMNA</text>
          <text x="115" y="95" fontFamily="'Cinzel', serif" fontSize="14" letterSpacing="0.5em" fontWeight="400" fill="currentColor">PÚBLICA</text>
        </svg>
      </Link>

      {/* Desktop Menu */}
      <div className="desktop-menu">
        <Link to="/about" className="nav-link">Quiénes somos</Link>
        <Link to="/contact" className="nav-link">Contacto</Link>
        {isAuthenticated ? (
          <>
            <Link to="/publish" className="btn-outline">Escribir</Link>
            <button onClick={handleLogout} className="btn-outline" style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>Salir</button>
          </>
        ) : (
          <Link to="/login" className="btn-outline">Acceder</Link>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Side Menu */}
      <div className={`mobile-side-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <Link to="/about" className="nav-link" onClick={closeMenu}>Quiénes somos</Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>Contacto</Link>
          {isAuthenticated ? (
            <>
              <Link to="/publish" className="btn-outline" onClick={closeMenu}>Escribir</Link>
              <button onClick={handleLogout} className="btn-outline" style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="btn-outline" onClick={closeMenu}>Acceder</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const res = await fetch('/api/publications');
      if (res.ok) {
        const data = await res.json();
        setPublications(data);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  return (
    <div>
      <header className="hero">
        <div className="hero-content">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" className="hero-logo-svg">
            <defs>
              <g id="isotype-paths" fill="currentColor">
                <rect x="140" y="125" width="120" height="10"/>
                <rect x="172" y="135" width="56" height="35"/>
                <path d="M 172,135 A 18,18 0 0,0 172,170 A 25,25 0 0,1 172,135 Z"/>
                <path d="M 228,135 A 18,18 0 0,1 228,170 A 25,25 0 0,0 228,135 Z"/>
                <path d="M162,190 L238,190 L228,170 L172,170 Z"/>
                <rect x="172" y="190" width="12" height="200"/>
                <rect x="194" y="190" width="12" height="200"/>
                <rect x="216" y="190" width="12" height="200"/>
              </g>
            </defs>
            <use href="#isotype-paths"/>
            {/* Typography */}
            <text x="200" y="440" fontFamily="'Cinzel', serif" fontSize="44" textAnchor="middle" fontWeight="700" fill="currentColor">COLUMNA</text>
            <text x="200" y="475" fontFamily="'Cinzel', serif" fontSize="16" textAnchor="middle" letterSpacing="0.6em" fontWeight="400" fill="currentColor">PÚBLICA</text>
          </svg>
        </div>
      </header>

      <main className="container">
        <section className="mosaic-grid">
          {publications.length === 0 ? (
            <div className="empty-state">
              No hay columnas publicadas aún.
            </div>
          ) : (
            publications.map((pub) => (
              <article key={pub.id} className="publication-card">
                <header className="pub-header">
                  <h2 className="pub-title">{pub.title}</h2>
                  <div className="pub-meta">
                    <div className="pub-author-info">
                      <Link to={`/author/${encodeURIComponent(pub.author)}`} className="author-link">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(pub.author)}&background=random&color=fff&size=150`} 
                          alt={pub.author} 
                          className="author-avatar" 
                        />
                      </Link>
                      <div>
                        <Link to={`/author/${encodeURIComponent(pub.author)}`} className="author-link">
                          <span className="pub-author">Por {pub.author}</span>
                        </Link>
                        <span className="pub-date">
                          {new Date(pub.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="pub-content">{pub.content}</div>
                <div className="pub-footer">
                  <Link to={`/publication/${pub.id}`} className="btn-read-more">Leer columna</Link>
                  <ShareButtons 
                    url={`${window.location.origin}/publication/${pub.id}`} 
                    title={pub.title} 
                  />
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function PublicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await fetch(`/api/publications/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPublication(data);
        }
      } catch (error) {
        console.error('Error fetching publication:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Cargando columna...</div>;
  }

  if (!publication) {
    return <div className="error-state">Columna no encontrada.</div>;
  }

  return (
    <div className="publication-detail-container">
      <Link to="/" className="btn-back">Volver a la página principal</Link>
      <article className="publication-detail-card">
        <header className="detail-header">
          <h1 className="detail-title">{publication.title}</h1>
          <div className="detail-meta">
            <Link to={`/author/${encodeURIComponent(publication.author)}`} className="author-link">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(publication.author)}&background=random&color=fff&size=150`} 
                alt={publication.author} 
                className="author-avatar-large" 
              />
            </Link>
            <div className="detail-author-info">
              <Link to={`/author/${encodeURIComponent(publication.author)}`} className="author-link">
                <span className="detail-author">Por {publication.author}</span>
              </Link>
              <span className="detail-date">
                {new Date(publication.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </header>
        <div className="detail-content">
          {publication.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="detail-footer">
          <span className="share-label">Compartir columna:</span>
          <ShareButtons 
            url={`${window.location.origin}/publication/${publication.id}`} 
            title={publication.title} 
          />
        </div>
      </article>
    </div>
  );
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('auth', 'true');
      localStorage.setItem('username', 'Juan Pérez'); // Mock user
      navigate('/publish');
    } else {
      setError('Credenciales incorrectas. Usa admin / admin');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="btn-back" style={{ display: 'flex', justifyContent: 'center' }}>Volver a la página principal</Link>
        <div className="form-container">
          <h3 className="form-title">Acceso Editorial</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-submit">Ingresar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Publish() {
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

function About() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" className="btn-back">
          &larr; Volver a la página principal
        </Link>
      </div>
      <h1 className="section-title">Quiénes Somos</h1>
      <div className="detail-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e0' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong>Columna Pública</strong> es un espacio digital dedicado a la libre expresión, el debate de ideas y la difusión de opiniones fundamentadas. Nacimos con la convicción de que una sociedad informada y crítica se construye a través del diálogo abierto y el intercambio de perspectivas diversas.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Nuestra plataforma reúne a expertos, profesionales y pensadores de diversos campos para ofrecer análisis profundos sobre los temas que marcan la agenda pública. Creemos en el valor de la palabra escrita como herramienta para reflexionar, cuestionar y proponer soluciones a los desafíos contemporáneos.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          En <strong>Columna Pública</strong>, no imponemos una línea editorial única. Por el contrario, celebramos la pluralidad de voces y fomentamos un entorno donde el respeto y la argumentación sólida son los pilares fundamentales. Cada columnista es responsable de sus opiniones, enriqueciendo así el mosaico de ideas que ofrecemos a nuestros lectores.
        </p>
        <p>
          Si eres un experto en tu área y deseas contribuir a este espacio de debate, te invitamos a ponerte en contacto con nosotros a través de nuestra sección de <Link to="/contact" style={{ color: '#5b9bd5', textDecoration: 'underline' }}>Contacto</Link>.
        </p>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="contact-container">
      <Link to="/" className="btn-back">Volver a la página principal</Link>
      <div className="contact-card">
        <h1 className="contact-title">Únete a Columna Pública</h1>
        <p className="contact-text">
          ¿Deseas formar parte de nuestro ecosistema editorial y contribuir al debate público? 
          Actualmente no contamos con un formulario de registro automático para garantizar la calidad y coherencia de nuestro repositorio.
        </p>
        <p className="contact-text">
          Envíanos tu solicitud de acceso directamente a nuestro equipo editorial:
        </p>
        
        <a href="mailto:editorial@ecoglocalmedia.com" className="contact-email">
          editorial@ecoglocalmedia.com
        </a>

        <div className="contact-requirements">
          <h4>Requisitos para la solicitud:</h4>
          <ul>
            <li>Nombre completo</li>
            <li>Currículum Vitae (CV) actualizado</li>
            <li>Especialidad o temáticas de las columnas que deseas publicar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AuthorProfile() {
  const { authorName } = useParams<{ authorName: string }>();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorPublications = async () => {
      try {
        const res = await fetch(`/api/publications/author/${authorName}`);
        if (res.ok) {
          const data = await res.json();
          setPublications(data);
        }
      } catch (error) {
        console.error('Error fetching author publications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authorName) {
      fetchAuthorPublications();
    }
  }, [authorName]);

  if (loading) {
    return <div className="loading-state">Cargando perfil...</div>;
  }

  return (
    <div className="author-profile-container">
      <Link to="/" className="btn-back">Volver a la página principal</Link>
      
      <div className="author-header">
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName || '')}&background=random&color=fff&size=200`} 
          alt={authorName} 
          className="author-avatar-profile" 
        />
        <h1 className="author-name">{authorName}</h1>
        <p className="author-bio">Columnista en Columna Pública</p>
      </div>

      <div className="author-publications">
        <h3 className="section-title">Publicaciones ({publications.length})</h3>
        <section className="mosaic-grid">
          {publications.length === 0 ? (
            <div className="empty-state">
              Este autor no tiene columnas publicadas aún.
            </div>
          ) : (
            publications.map((pub) => (
              <article key={pub.id} className="publication-card">
                <header className="pub-header">
                  <h2 className="pub-title">{pub.title}</h2>
                  <div className="pub-meta">
                    <span className="pub-date">
                      {new Date(pub.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </header>
                <div className="pub-content">{pub.content}</div>
                <div className="pub-footer">
                  <Link to={`/publication/${pub.id}`} className="btn-read-more">Leer columna</Link>
                  <ShareButtons 
                    url={`${window.location.origin}/publication/${pub.id}`} 
                    title={pub.title} 
                  />
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

// --- Main App ---

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container" style={{ padding: '1.5rem 2rem', textAlign: 'center', borderTop: '1px solid #1f364d', marginTop: 'auto' }}>
        <p style={{ color: '#a0aec0', fontSize: '0.9rem', margin: 0 }}>
          Plataforma desarrollada por <a href="https://omtecnologia.cl" target="_blank" rel="noopener noreferrer" style={{ color: '#5b9bd5', textDecoration: 'none', fontWeight: 'bold' }}>OM Tecnología</a>
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/publication/:id" element={<PublicationDetail />} />
            <Route path="/author/:authorName" element={<AuthorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
