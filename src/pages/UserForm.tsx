import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getUserById, createUser, updateUser } from '../api/auth';
import { getRoles } from '../api/roles';

export default function UserForm() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(userId);
  const [form, setForm] = useState({
    email: '',
    nombres: '',
    apellidos: '',
    descripcion: '',
    resena: '',
    roles: [] as string[]
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles()
        console.log('Roles obtenidos:', res);
        setRoles(res);
      } catch {
        setRoles([]);
      }
    }
    fetchRoles();
    if (isEdit) {
      async function fetchUser() {
        try {
            console.log('Obteniendo usuario con ID:', userId);
          const res = await getUserById(userId!);
          console.log('Usuario obtenido:', res);
          setForm({
            email: res.email,
            nombres: res.nombres,
            apellidos: res.apellidos,
            descripcion: res.descripcion,
            resena: res.resena,
            roles: res.roles.map((r: any) => r._id)
          });
        } catch {
          setError('No se pudo cargar el usuario');
        }
      }
      fetchUser();
    }
  }, [userId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).selectedOptions;
      setForm(f => ({ ...f, [name]: Array.from(options).map(o => o.value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await updateUser(userId!, form);
      } else {
        await createUser(form);
      }
      navigate('/users');
    } catch {
      setError('Error al guardar el usuario');
    }
  };

  return (
    <div className="publish-container" style={{ maxWidth: 700, margin: '0 auto', padding: '2em 1em' }}>
      <div style={{ flex: 1 }}>
        <a href="/users" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Volver a la lista de usuarios</a>
        <div className="form-container">
          <h3 className="form-title">{isEdit ? 'Editar usuario' : 'Crear usuario'}</h3>
          {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="nombres">Nombres</label>
              <input
                id="nombres"
                name="nombres"
                className="form-input"
                value={form.nombres}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                name="apellidos"
                className="form-input"
                value={form.apellidos}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-textarea"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="resena">Reseña</label>
              <textarea
                id="resena"
                name="resena"
                className="form-textarea"
                value={form.resena}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Roles</label>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {roles
                  .filter((r: any) => ['admin', 'editor', 'columnista'].includes(r.name))
                  .map((r: any) => (
                    <label key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        name="roles"
                        value={r._id}
                        checked={form.roles.includes(r._id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setForm(f => ({
                            ...f,
                            roles: checked
                              ? [...f.roles, r._id]
                              : f.roles.filter((roleId: string) => roleId !== r._id)
                          }));
                        }}
                      />
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    </label>
                  ))}
              </div>
            </div>
            <button type="submit" className="btn-submit" style={{ marginTop: 16 }}>
              Guardar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
