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

export default function PublicationDetail() {
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
