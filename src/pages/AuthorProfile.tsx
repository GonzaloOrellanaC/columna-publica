import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { unslugifyFullName, slugifyTitle } from '../utils/slug';
import ShareButtons from '../components/ShareButtons';
import { getPublicationByFullName } from '../api/publications';
import { getUserByFullName } from '../api/user';
import { Author, Publication } from '../interfaces';

export default function AuthorProfile() {
  const { authorFullName } = useParams<{ authorFullName: string }>();
  const displayName = authorFullName ? unslugifyFullName(authorFullName) : '';
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    console.log('Author:', author);
  }, [author]);

  useEffect(() => {
    const fetchAuthorPublications = async () => {
        try {
          const res = await getPublicationByFullName(displayName || '');
          setPublications(res);
        } catch (error) {
          console.error('Error fetching author publications:', error);
        } finally {
          setLoading(false);
        }
    };

    if (authorFullName) {
        fetchAuthorPublications();
        // fetch user profile details (descripcion, resena)
        (async () => {
          try {
            const res = getUserByFullName(displayName || '');
            const data = await res;
            setAuthor(data);
          } catch (e) {
            // ignore
          }
        })();
    }
  }, [authorFullName]);

  if (loading) {
    return <div className="loading-state">Cargando perfil...</div>;
  }

  return (
    <div className="author-profile-container">
      <Link to="/" className="btn-back">Volver a la página principal</Link>
      
      <div className="author-header">
        <img 
          src={author?.avatarUrl ? `${(import.meta.env as any).VITE_ASSETS_URL}${author.avatarUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || '')}&background=random&color=fff&size=200`} 
            alt={displayName} 
          className="author-avatar-profile" 
        />
          <h1 className="author-name">{displayName}</h1>
        <div style={{ width: '100%', marginTop: 12 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#cfe8ff' }}>Descripción</h4>
              <div style={{ color: '#e6eef6', textAlign: 'justify' }}>{author?.descripcion || 'Sin descripción.'}</div>
              <br />
              <h4 style={{ margin: '0 0 8px 0', color: '#cfe8ff' }}>Reseña</h4>
              <div style={{ color: '#e6eef6', textAlign: 'justify' }}>{author?.resena || 'Sin reseña.'}</div>
        </div>
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
              <article key={pub._id} className="publication-card">
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
                <Link to={`/publication/${slugifyTitle(pub.title || pub._id)}`} className="btn-read-more">Leer columna</Link>
                  <ShareButtons 
                    url={`${window.location.origin}/publication/${slugifyTitle(pub.title || pub._id)}`} 
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
