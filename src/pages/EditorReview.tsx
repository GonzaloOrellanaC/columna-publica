import React, { useEffect, useState } from 'react';
import { slugifyTitle } from '../utils/slug';
import { Link } from 'react-router-dom';

export default function EditorReview() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevisions();
  }, []);

  async function fetchRevisions() {
    try {
      const res = await fetch('/api/publications/status/EN_REVISION');
      if (!res.ok) throw new Error('Error fetching');
      const data = await res.json();
      setPublications(data);
    } catch (err: any) {
      setError('No se pudieron cargar las publicaciones en revisión.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>Publicaciones en revisión</h2>
      {publications.length === 0 ? (
        <div style={{ marginTop: 24, color: '#a0aec0' }}>No hay publicaciones esperando revisión.</div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {publications.map(pub => (
            <div key={pub._id} style={{ padding: 12, background: '#0d1b26', borderRadius: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{pub.title}</div>
                <div style={{ fontSize: 13, color: '#9aa6b3' }}>Por {pub.author}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/publication/${slugifyTitle(pub.title || pub._id)}`} className="btn-outline">Ver</Link>
                <Link to={`/user/${pub.author}`} className="btn-outline">Autor</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
