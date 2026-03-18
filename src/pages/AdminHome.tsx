import { useLocation, useNavigate } from 'react-router-dom';

export default function AdminHome() {
  const navigate = useNavigate();
  const location = useLocation();

  let isEditor = false;
  if (location && location.pathname === '/editor') {
    isEditor = true;
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      <h2>{isEditor ? 'Panel de editor' : 'Panel de administración'}</h2>
      <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
        {!isEditor && <button
          className="btn-outline"
          style={{ minWidth: 180, fontSize: 20, padding: '1.5em 2em' }}
          onClick={() => navigate('/users')}
        >
          Usuarios
        </button>}
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
