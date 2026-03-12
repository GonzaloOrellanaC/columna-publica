import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublications } from '../api/publications';

interface Author {
  nombres: string;
  apellidos: string;
}

interface Publication {
  _id: string;
  titulo: string;
  resumen: string;
  fecha: string;
  autor: Author;
}

const PublicationList: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const data = await getPublications();
        setPublications(data);
      } catch (err: any) {
        setError('Error al cargar publicaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  if (loading) return <div>Cargando publicaciones...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', marginBottom: '1.5rem' }}>Listado de Publicaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Título</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Resumen</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Fecha</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Autor</th>
            <th style={{ borderBottom: '2px solid #ccc', padding: '0.5rem' }}>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {publications.map(pub => (
            <tr key={pub._id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{pub.titulo}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{pub.resumen}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{new Date(pub.fecha).toLocaleDateString()}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>{pub.autor ? `${pub.autor.nombres} ${pub.autor.apellidos}` : 'Sin autor'}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}>
                <Link to={`/publication/${pub._id}`}>Ver detalle</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PublicationList;
