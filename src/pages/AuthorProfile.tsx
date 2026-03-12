import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ShareButtons from '../components/ShareButtons';

interface Publication {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status?: 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';
}

export default function AuthorProfile() {
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
