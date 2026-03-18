import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AvatarCropDialog from '../components/AvatarCropDialog';
import { getUserById, createUser, updateUser } from '../api/auth';
import axios from '../api/axios';
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
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);
  const [viewerSize] = useState(200); // crop box size in px
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await getRoles()
        setRoles(res);
      } catch {
        setRoles([]);
      }
    }
    fetchRoles();

    if (isEdit) {
      async function fetchUser() {
        try {
          const res = await getUserById(userId!);
          setForm({
            email: res.email,
            nombres: res.nombres,
            apellidos: res.apellidos,
            descripcion: res.descripcion,
            resena: res.resena,
            roles: res.roles.map((r: any) => r._id)
          });
          setCurrentAvatar(res.avatarUrl || null);
        } catch {
          setError('No se pudo cargar el usuario');
        }
      }
      fetchUser();
    }

    // detect if current logged user is admin
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        const isAdmin = parsed.roles && Array.isArray(parsed.roles) && parsed.roles.some((r: any) => r.name === 'admin' || r.name === 'superadmin');
        setCurrentUserIsAdmin(isAdmin);
      }
    } catch {}
  }, [userId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).selectedOptions;
      setForm(f => ({ ...f, [name]: Array.from(options).map(o => o.value) }));
    } else {
      let newValue: any = value;
      if (name === 'descripcion') newValue = String(value).slice(0, 150);
      if (name === 'resena') newValue = String(value).slice(0, 1200);
      setForm(f => ({ ...f, [name]: newValue }));
    }
  };

  // helpers for cropping
  const onCropComplete = (_: any, croppedArea: any) => {
    setCroppedAreaPixels(croppedArea);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setSelectedImageUrl(url);
    setCroppedDataUrl(null);
    setShowCropModal(true);
  };
  const handleCancelCrop = () => {
    if (selectedImageUrl) {
      try { URL.revokeObjectURL(selectedImageUrl); } catch {}
    }
    setSelectedImageUrl(null);
    setShowCropModal(false);
  };

  const handleApplyFromDialog = (dataUrl: string) => {
    setCroppedDataUrl(dataUrl);
    setCurrentAvatar(dataUrl);
    setShowCropModal(false);
    try { URL.revokeObjectURL(selectedImageUrl!); } catch {}
    setSelectedImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let savedUser: any = null;
      if (isEdit) {
        if (croppedDataUrl) {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const fd = new FormData();
          fd.append('avatar', blob, `avatar-${userId}.png`);
          const token = localStorage.getItem('token');
          try {
            const resp = await axios.post(`/users/${userId}/avatar`, fd, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            savedUser = resp.data;
          } catch (err: any) {
            const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            throw new Error(`Error subiendo avatar: ${msg}`);
          }
        }
        const body = { ...form } as any;
        if (savedUser && savedUser.avatarUrl) body.avatarUrl = savedUser.avatarUrl;
        await updateUser(userId!, body);
      } else {
        const created = await createUser(form);
        if (croppedDataUrl && created && created._id) {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const fd = new FormData();
          fd.append('avatar', blob, `avatar-${created._id}.png`);
          const token = localStorage.getItem('token');
          try {
            await axios.post(`/users/${created._id}/avatar`, fd, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
          } catch (err: any) {
            const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            throw new Error(`Error subiendo avatar: ${msg}`);
          }
        }
      }
      navigate('/users');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el usuario');
    }
  };

  return (
    <div className="publish-container" style={{ maxWidth: 700, margin: '0 auto', padding: '2em 1em' }}>
      <div style={{ flex: 1 }}>
        {currentUserIsAdmin ? (
          <a href="/users" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Volver a la lista de usuarios</a>
        ) : <a onClick={() => {navigate(-1)}} className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>Atrás</a>}
        <div className="form-container">
          <h3 className="form-title">{isEdit ? 'Editar usuario' : 'Crear usuario'}</h3>
          {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Foto de perfil</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ width: viewerSize, height: viewerSize, overflow: 'hidden', background: '#071021', borderRadius: 8, border: '1px solid #2d4356', position: 'relative' }}>
                    <img src={croppedDataUrl || currentAvatar || '/public/default-profile.svg'} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, border: '2px dashed rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <label className="btn-outline" style={{ cursor: 'pointer' }}>
                      Seleccionar
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
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
                maxLength={150}
              />
              <div style={{ color: '#9fb0c8', fontSize: 12, marginTop: 6 }}>{form.descripcion.length} / 150</div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="resena">Reseña</label>
              <textarea
                id="resena"
                name="resena"
                className="form-textarea"
                value={form.resena}
                onChange={handleChange}
                maxLength={1200}
              />
              <div style={{ color: '#9fb0c8', fontSize: 12, marginTop: 6 }}>{form.resena.length} / 1200</div>
            </div>
            {currentUserIsAdmin ? (
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
            ) : null}
            <button type="submit" className="btn-submit" style={{ marginTop: 16 }}>
              Guardar
            </button>
          </form>

          <AvatarCropDialog
            open={showCropModal}
            imageSrc={selectedImageUrl}
            onClose={handleCancelCrop}
            onApply={handleApplyFromDialog}
          />
        </div>
      </div>
    </div>
  );
}
