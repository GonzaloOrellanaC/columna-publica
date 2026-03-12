import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShareButtons from '../components/ShareButtons';

interface Publication {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status?: 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';
}

export default function Home() {
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
