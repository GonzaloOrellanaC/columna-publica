import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Llama a la API para solicitar recuperación
      const res = await forgotPassword(email);
      console.log('forgotPassword response', res);
      if (res) {
        setSent(true);
      } else {
        setError('No se pudo enviar el correo.');
      }
      /* const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError('No se pudo enviar el correo.');
      } */
    } catch {
      setError('No se pudo enviar el correo.');
    }
  };

  return (
    <div className="publish-container" style={{ maxWidth: 400, margin: '0 auto', padding: '2em 1em' }}>
      <div className="login-container">
      <Link to="/login" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Volver a login</Link>
      <div className="form-container">
        <h3 className="form-title">Recuperar contraseña</h3>
        {sent ? (
          <div style={{ color: '#4fd1c5', marginBottom: 16 }}>
            Si el correo existe, recibirás un enlace para restaurar tu contraseña.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <button type="submit" className="btn-submit">Enviar enlace</button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
