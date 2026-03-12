import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await resetPassword(token!, password);
      if (res) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('No se pudo cambiar la contraseña.');
      }
    } catch {
      setError('No se pudo cambiar la contraseña.');
    }
  };

  return (
    <div className="publish-container" style={{ maxWidth: 400, margin: '0 auto', padding: '2em 1em' }}>
      <div className="login-container">
        <div className="form-container">
            <h3 className="form-title">Cambiar contraseña</h3>
            {success ? (
            <div style={{ color: '#4fd1c5', marginBottom: 16 }}>
                Contraseña cambiada correctamente. Redirigiendo...
            </div>
            ) : (
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                <label className="form-label" htmlFor="password">Nueva contraseña</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                </div>
                <div className="form-group">
                <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
                <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    className="form-input"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                />
                </div>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                <button type="submit" className="btn-submit">Cambiar contraseña</button>
            </form>
            )}
        </div>
      </div>
    </div>
  );
}
