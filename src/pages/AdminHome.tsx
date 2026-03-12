import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHome() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      <h2>Panel de administración</h2>
      <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
        <button
          className="btn-outline"
          style={{ minWidth: 180, fontSize: 20, padding: '1.5em 2em' }}
          onClick={() => navigate('/users')}
        >
          Usuarios
        </button>
        <button
          className="btn-outline"
          style={{ minWidth: 180, fontSize: 20, padding: '1.5em 2em' }}
          onClick={() => navigate('/publications')}
        >
          Publicaciones
        </button>
      </div>
    </div>
  );
}
