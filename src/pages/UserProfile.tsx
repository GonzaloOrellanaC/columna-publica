import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { slugifyFullName } from '../utils/slug';
import { getUserById } from '../api/auth';
import { getRoleLabel } from '../utils/roleLabels';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      if (!userId) return;
      try {
        const res = await getUserById(userId);
        if (mounted) setUser(res);
      } catch (err) {
        console.error('Error cargando usuario:', err);
        if (mounted) setError('No se pudo cargar el perfil');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchUser();
    return () => { mounted = false; };
  }, [userId]);

  if (loading) return <div className="loading-state">Cargando perfil...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>Usuario no encontrado</div>;

  const avatarUrl = user.avatarUrl || '/public/default-profile.svg';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2em 1em' }}>
      <a onClick={() => navigate(-1)} className="btn-back" style={{ marginBottom: 24, display: 'inline-block', cursor: 'pointer' }}>Volver</a>

      <Grid container spacing={3} sx={{ background: '#071021', padding: 3, borderRadius: 2 }}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
          <div style={{ width: '100%', maxWidth: 220, margin: '0 auto' }}>
            <img src={avatarUrl} alt={user.email} style={{ width: 160, height: 160, borderRadius: '50%' }} />
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontFamily: "'Cinzel', serif", fontSize: 18 }}>{user.nombres} {user.apellidos}</strong>
              <div style={{ color: '#9fb0c8', marginTop: 6 }}>{user.email}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link to={`/user/${user._id}/edit`} className="btn-primary">Editar perfil</Link>
            </div>
          </div>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginTop: 0 }}>{user.nombres} {user.apellidos}</h2>
          <p style={{ color: '#c7d3df' }}>{user.descripcion || user.resena || 'El usuario no ha agregado una biografía.'}</p>

          <section style={{ marginTop: 18 }}>
            <h4 style={{ marginBottom: 8 }}>Roles</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Array.isArray(user.roles) && user.roles.length > 0 ? (
                user.roles.map((r: any) => (
                  <span key={r._id || r} style={{ background: '#14283a', padding: '6px 10px', borderRadius: 6 }}>{getRoleLabel(r.name || r)}</span>
                ))
              ) : (
                <div style={{ color: '#9fb0c8' }}>Sin roles asignados</div>
              )}
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 8 }}>Publicaciones</h4>
            <div style={{ color: '#9fb0c8' }}>Lista de publicaciones del autor (en la vista de perfil solo se muestra un enlace a su página de autor).</div>
            <div style={{ marginTop: 8 }}>
              <Link to={`/author/${slugifyFullName(`${user.nombres} ${user.apellidos}`)}`} className="btn-secondary">Ver página del autor</Link>
            </div>
          </section>
        </Grid>
      </Grid>
    </div>
  );
}
