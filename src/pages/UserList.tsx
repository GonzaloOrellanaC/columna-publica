import React, { useEffect, useState } from 'react';

import { getUsers } from '../api/auth';
import { getRoleLabel } from '../utils/roleLabels';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetchUsers() {
      try {
        const data = await getUsers();
        if (mounted) {
          setUsers(data.users || []);
        }
      } catch (err: any) {
        if (mounted) setError('No se pudieron cargar los usuarios');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchUsers();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2em 1em' }}>
      <a href="/admin" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Volver al panel de administración</a>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Usuarios</h2>
      <div style={{ overflowX: 'auto', background: '#0d1926', borderRadius: 8, boxShadow: '0 2px 8px #0002', marginBottom: 24 }}>
        <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#142136' }}>
              <th style={{ padding: '12px 8px', fontFamily: "'Cinzel', serif", fontWeight: 600 }}>Email</th>
              <th style={{ padding: '12px 8px', fontFamily: "'Cinzel', serif", fontWeight: 600 }}>Nombres</th>
              <th style={{ padding: '12px 8px', fontFamily: "'Cinzel', serif", fontWeight: 600 }}>Apellidos</th>
              <th style={{ padding: '12px 8px', fontFamily: "'Cinzel', serif", fontWeight: 600 }}>Roles</th>
              <th style={{ padding: '12px 8px', fontFamily: "'Cinzel', serif", fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #22304a' }}>
                <td style={{ padding: '10px 8px' }}>{user.email}</td>
                <td style={{ padding: '10px 8px' }}>{user.nombres}</td>
                <td style={{ padding: '10px 8px' }}>{user.apellidos}</td>
                <td style={{ padding: '10px 8px' }}>{user.roles.map((r: any) => getRoleLabel(r.name)).join(', ')}</td>
                <td style={{ padding: '10px 8px' }}>
                  <a href={`/user/${user._id}/edit`} style={{ color: '#4fd1c5', textDecoration: 'underline' }}>Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="/user/new" className="btn-outline" style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 18 }}>Crear usuario</a>
    </div>
  );
}
