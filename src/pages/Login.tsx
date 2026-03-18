
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('email', data.user?.email || email);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      // Redirigir según rol: admins y editors van a /admin, otros a /publish
      const roles = data.user?.roles || [];
      const isAdmin = roles.some((r: any) => r.name === 'admin' || r.name === 'superadmin');
      const isEditor = roles.some((r: any) => r.name === 'editor');
      if (isAdmin) {
        navigate('/admin');
      } else if (isEditor) {
        navigate('/editor');
      } else {
        navigate('/publish');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error de autenticación. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="btn-back" style={{ display: 'flex', justifyContent: 'center' }}>Volver a la página principal</Link>
        <div className="form-container">
          <h3 className="form-title">Acceso Editorial</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-submit">Ingresar</button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ color: '#4fd1c5', textDecoration: 'underline', fontSize: 15 }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
