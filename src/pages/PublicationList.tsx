import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { slugifyTitle } from '../utils/slug';
import { getPublicationsToEditor } from '../api/publications';
import { Author, Publication } from '../interfaces';

const PublicationList: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const data = await getPublicationsToEditor();
        console.log('Fetched publications:', data);
        setPublications(data);
      } catch (err: any) {
        setError('Error al cargar publicaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
    // detect if current logged user is admin
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        const isAdmin = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.some((r: any) => r.name === 'admin' || r.name === 'superadmin');
        setCurrentUserIsAdmin(isAdmin);
      }
    } catch {}
  }, []);

  if (loading) return <div>Cargando publicaciones...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      {currentUserIsAdmin ? <a href="/admin" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Volver al panel de administración</a> : 
    
      <a href="/editor" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Volver a la página editor</a>}
      <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', marginBottom: '1.5rem' }}>Listado de Publicaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Título</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Estado</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Fecha</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Autor</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {publications.map(pub => (
            <tr key={pub._id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{pub.title}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{pub.status}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{new Date(pub.createdAt).toLocaleDateString()}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{pub.author ? `${(pub.author as Author).nombres} ${(pub.author as Author).apellidos}` : 'Sin autor'}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>
                <Link to={`/publication/${slugifyTitle((pub as any).title || pub._id)}`} className="btn-outline" style={{ padding: '6px 10px', borderRadius: 6, display: 'inline-block' }}>
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PublicationList;
