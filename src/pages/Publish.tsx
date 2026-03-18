import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { get, set } from 'idb-keyval';
import Cropper from 'react-easy-crop';
import AvatarCropDialog from '../components/AvatarCropDialog';
import { getPublicationByAuthorId, postPublication, updatePublication } from '../api/publications';
import { slugifyTitle } from '../utils/slug';
import { Author, History, Publication } from '../interfaces';

export default function Publish() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);
  const cropOutputWidth = 1200; // final width for 3:2 -> 1200x800
  const cropOutputHeight = 800;
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [myPublications, setMyPublications] = useState<Publication[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  /* const [authorFullName, setAuthorFullName] = useState<string | null>(null);
  const [authorDescription, setAuthorDescription] = useState<string | null>(null); */
  const navigate = useNavigate();
  /* let author = localStorage.getItem('username') || 'Usuario Anónimo'; */
  /* let authorAvatar = '/public/default-profile.svg'; */
  
  const [titleMax] = useState(120);
  const [contentMax] = useState(5000);

  // Protected route check
  if (localStorage.getItem('auth') !== 'true') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.nombres || parsed.apellidos)) {
          setAuthor(prev => prev ? { ...prev, nombres: parsed.nombres, apellidos: parsed.apellidos } : { _id: parsed._id, nombres: parsed.nombres, apellidos: parsed.apellidos });
        }
        if (parsed && parsed.avatarUrl) {
          setAuthor(prev => prev ? { ...prev, avatarUrl: parsed.avatarUrl } : { _id: parsed._id, nombres: parsed.nombres, apellidos: parsed.apellidos, avatarUrl: parsed.avatarUrl });
        }
        if (parsed && parsed.descripcion) {
          setAuthor(prev => prev ? { ...prev, descripcion: parsed.descripcion } : { _id: parsed._id, nombres: parsed.nombres, apellidos: parsed.apellidos, descripcion: parsed.descripcion });
        }
        if (parsed && parsed._id) {
          setAuthorId(parsed._id);
        }
      }
    } catch (e) {
      // keep fallbacks
    }
  }, []);

  useEffect(() => {
    // Load draft from IndexedDB
    const loadDraft = async () => {
      if (!author) return;
      const draftTitle = await get(`draft_title_${author.nombres}_${author.apellidos}`);
      const draftContent = await get(`draft_content_${author.nombres}_${author.apellidos}`);
      const draftImage = await get(`draft_image_${author.nombres}_${author.apellidos}`);
      if (draftTitle) setTitle(draftTitle);
      if (draftContent) setContent(draftContent);
      if (draftImage) setCroppedDataUrl(draftImage as string);
    };
    loadDraft();

    
  }, [author]);

  useEffect(() => {
    fetchMyPublications();
    // fetch tags for selector
    (async () => {
      try {
        const { getTags } = await import('../api/tags');
        const t = await getTags();
        if (Array.isArray(t)) setAvailableTags(t.map((x: any) => x.name));
      } catch (e) {
        console.warn('Could not fetch tags', e);
      }
    })();
  }, [authorId]);

  
  const fetchMyPublications = async () => {
    if (!authorId) return;
    try {
      const res = await getPublicationByAuthorId(authorId);
      if (res && Array.isArray(res)) {
        setMyPublications(res);
      }
    } catch (e) {
      console.error('Error fetching my publications:', e);
    }
  }

  const onCropComplete = (_: any, croppedArea: any) => {
    setCroppedAreaPixels(croppedArea);
  };

  async function createImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  async function getCroppedImg(imageSrc: string, pixelCrop: any, outputW = cropOutputWidth, outputH = cropOutputHeight) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext('2d')!;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      outputW,
      outputH
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setSelectedImageUrl(url);
    setCroppedDataUrl(null);
    setShowCropModal(true);
  };

  const handleApplyCropFromModal = async () => {
    if (!selectedImageUrl || !croppedAreaPixels) return;
    const dataUrl = await getCroppedImg(selectedImageUrl, croppedAreaPixels, cropOutputWidth, cropOutputHeight);
    setCroppedDataUrl(dataUrl);
    try {
      if (!editingId && author) {
        await set(`draft_image_${author.nombres}_${author.apellidos}`, dataUrl);
      }
    } catch (e) {
      console.warn('No se pudo guardar la imagen en IndexedDB', e);
    }
    setShowCropModal(false);
    try { URL.revokeObjectURL(selectedImageUrl); } catch {}
    setSelectedImageUrl(null);
  };

  const handleCancelCrop = () => {
    if (selectedImageUrl) try { URL.revokeObjectURL(selectedImageUrl); } catch {}
    setSelectedImageUrl(null);
    setShowCropModal(false);
  };

  const handleDeleteDraft = async () => {
    const confirmDel = typeof window !== 'undefined' ? window.confirm('¿Eliminar borrador? Esta acción no se puede deshacer.') : true;
    if (!confirmDel) return;
    try {
      if (author) {
        await set(`draft_title_${author.nombres}_${author.apellidos}`, '');
        await set(`draft_content_${author.nombres}_${author.apellidos}`, '');
        await set(`draft_image_${author.nombres}_${author.apellidos}`, '');
      }
    } catch (e) {
      console.warn('No se pudo borrar borrador de IndexedDB', e);
    }
    setTitle('');
    setContent('');
    setCroppedDataUrl(null);
    setShowDraftPreview(false);
  };

  // Save to IndexedDB on change (skip when editing an existing publication)
  useEffect(() => {
    if (!author) return;
    if (editingId) return;
    const saveDraft = async () => {
      await set(`draft_title_${author.nombres}_${author.apellidos}`, title);
      await set(`draft_content_${author.nombres}_${author.apellidos}`, content);
    };
    // Debounce saving slightly or save directly
    const timeoutId = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeoutId);
  }, [title, content, author, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let fileToSend = null;
    if (file) {
      fileToSend = file;
    } else if (croppedDataUrl) {
      const blob = await (await fetch(croppedDataUrl)).blob();
      fileToSend = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
    }
    try {
      if (editingId) {
        const res = await (await import('../api/publications')).updatePublication(editingId, { title, author: authorId, content, status: 'EN_REVISION' }, fileToSend);
        if (res) {
          // reset editing state
          setEditingId(null);
          setSelectedTags([]);
        }
      } else {
        const history: History[] = [{ status: 'EN_REVISION', publishDate: new Date(), content: 'Publicación creada y enviada a revisión.' }];
        const res = await postPublication({ title, author: authorId, content, status: 'EN_REVISION', history, tags: selectedTags }, fileToSend)
        if (res) {
          setSelectedTags([]);
        }
      }
      if (author) {
        await set(`draft_title_${author.nombres}_${author.apellidos}`, '');
        await set(`draft_content_${author.nombres}_${author.apellidos}`, '');
        await set(`draft_image_${author.nombres}_${author.apellidos}`, '');
      }
      setTitle('');
      setContent('');
      setCroppedDataUrl(null);
      setFile(null);
    } catch (error) {
      console.error('Error creating publication:', error);
    } finally {
      fetchMyPublications();
      setLoading(false);
    }
  };

  const filteredTags = availableTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  // editing state

  const handleEdit = (pub: Publication) => {
    console.log('Editing publication:', pub);
    setEditingId(pub._id);
    setTitle(pub.title);
    setContent(pub.content);
    // populate selected tags when editing
    try {
      const existingTags = (pub as any).tags;
      if (Array.isArray(existingTags)) setSelectedTags(existingTags);
      else if (typeof existingTags === 'string' && existingTags.length) {
        try { setSelectedTags(JSON.parse(existingTags)); } catch { setSelectedTags(existingTags.split(',').map(s => s.trim()).filter(Boolean)); }
      } else setSelectedTags([]);
    } catch (e) {
      setSelectedTags([]);
    }
    // set banner image if exists
    if ((pub as any).imageUrl) {
      setCroppedDataUrl((pub as any).imageUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const minScheduleDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const handlePublishNow = async (pub: Publication) => {
    if (!pub._id) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      await updatePublication(pub._id, { status: 'PUBLICADA', publicationDate: today });
      fetchMyPublications();
    } catch (e) {
      console.error('Error publishing now:', e);
    } finally {
      setLoading(false);
    }
  };

  const openSchedulePicker = (pub: Publication) => {
    if (!pub._id) return;
    setSchedulingId(pub._id);
    setScheduleDate('');
  };

  const handleConfirmSchedule = async (pubId: string) => {
    if (!scheduleDate) return;
    // ensure date is >= tomorrow
    const selected = new Date(scheduleDate + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    if (selected < tomorrow) {
      alert('La fecha debe ser desde mañana.');
      return;
    }
    setLoading(true);
    try {
      await updatePublication(pubId, { publicationDate: scheduleDate });
      setSchedulingId(null);
      setScheduleDate('');
      fetchMyPublications();
    } catch (e) {
      console.error('Error scheduling publication:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publish-container">
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowRules(false)}>×</button>
            <h2 className="modal-title">Normas de Publicación</h2>
            <div className="modal-body">
              <p>Para mantener un espacio de respeto y calidad, te pedimos seguir las siguientes normas de convivencia:</p>
              <ul>
                <li><strong>Buen Lenguaje:</strong> Mantén un tono respetuoso en todo momento.</li>
                <li><strong>Evitar Escritura Soez:</strong> No se tolerarán insultos, groserías, ni lenguaje ofensivo o discriminatorio.</li>
                <li><strong>Opinión Personal:</strong> Da énfasis a que lo escrito es tu opinión personal. Fomenta el debate constructivo.</li>
              </ul>
              <p>
                <strong>Uso de Inteligencia Artificial:</strong> El editor, mediante herramientas de análisis de inteligencia artificial, evaluará el contenido. Si se determina que el uso de estas herramientas es sobresaliente o excesivo y reemplaza la voz auténtica del autor, <strong>se rechazará la publicación</strong>.
              </p>
              <p>
                En casos de incumplimiento reiterado, se podrá determinar <strong>terminar con tu permiso de publicación</strong>.
              </p>
              <p style={{ fontStyle: 'italic', marginTop: '1.5rem', borderTop: '1px solid #2d4356', paddingTop: '1rem' }}>
                "El tiempo del editor es tan valioso como el de quien publica."
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <Link to="/" className="btn-back">Volver a la página principal</Link>
        <div className="form-container">
          <h3 className="form-title">Nueva Publicación</h3>
          
          <button 
            type="button" 
            className="btn-rules" 
            onClick={() => setShowRules(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Ver Normas de Publicación
          </button>

          <div style={{ marginBottom: '1.5rem', color: '#a0aec0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={author ? author.avatarUrl : '/public/default-profile.svg'} alt={author ? `${author.nombres} ${author.apellidos}` : ''} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid #2d4356' }} />
            <div><strong>Autor:</strong> {author ? `${author.nombres} ${author.apellidos}` : ''}</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Imagen representativa (3:2)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 240, height: 160, background: '#071021', borderRadius: 6, overflow: 'hidden', border: '1px solid #2d4356' }}>
                <img src={croppedDataUrl || '/public/publication-placeholder.svg'} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <label className="btn-outline" style={{ cursor: 'pointer' }}>
                Seleccionar imagen
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#9fb0c8' }}>Título <span style={{ color: '#9fb0c8', fontSize: 13 }}>( {title.length} / {titleMax} )</span></label>
            <input id="title" type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value.slice(0, titleMax))} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#9fb0c8' }}>Contenido <span style={{ color: '#9fb0c8', fontSize: 13 }}>( {content.length} / {contentMax} )</span></label>
            <textarea id="content" className="form-textarea" value={content} onChange={(e) => setContent(e.target.value.slice(0, contentMax))} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#9fb0c8', display: 'block', marginBottom: 6 }}>Etiquetas</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <button type="button" className="btn-outline" onClick={() => setShowTagsDialog(true)}>Seleccionar etiquetas</button>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedTags.map(t => (
                  <span key={t} style={{ background: '#2d4356', color: '#cbd5e0', padding: '0.25rem 0.5rem', borderRadius: 12, fontSize: 12 }}>{t}</span>
                ))}
                {selectedTags.length === 0 && <span style={{ color: '#9fb0c8', fontSize: 13 }}>Ninguna seleccionada</span>}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <button type="submit" className="btn-submit" disabled={loading || !title || !content}>
              {loading ? 'Enviando a revisión...' : 'Enviar a Revisión'}
            </button>
          </form>
        </div>
      </div>

      <AvatarCropDialog
        open={showCropModal}
        imageSrc={selectedImageUrl}
        aspect={3 / 2}
        outputWidth={cropOutputWidth}
        outputHeight={cropOutputHeight}
        onClose={handleCancelCrop}
        onApply={async (dataUrl: string) => {
          setCroppedDataUrl(dataUrl);
          try {
            if (!editingId && author) {
              await set(`draft_image_${author.nombres}_${author.apellidos}`, dataUrl);
            }
          } catch (e) {
            console.warn('No se pudo guardar la imagen en IndexedDB', e);
          }
          setShowCropModal(false);
          try { URL.revokeObjectURL(selectedImageUrl!); } catch {}
          setSelectedImageUrl(null);
        }}
      />
      
      {showDraftPreview && (
        <div className="modal-overlay" onClick={() => setShowDraftPreview(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <button className="modal-close-btn" onClick={() => setShowDraftPreview(false)}>×</button>
            <h3 className="modal-title">Vista previa - Borrador</h3>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '100%', height: 300, background: '#071021', borderRadius: 6, overflow: 'hidden', border: '1px solid #2d4356' }}>
                  <img src={croppedDataUrl || '/public/publication-placeholder.svg'} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginTop: 0, color: '#fff' }}>{title || 'Borrador sin título'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <img src={author ? author.avatarUrl : '/public/default-profile.svg'} alt={author ? `${author.nombres} ${author.apellidos}` : ''} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #2d4356' }} />
                  <div style={{ color: '#a0aec0' }}><strong>Autor:</strong> {author ? `${author.nombres} ${author.apellidos}` : ''}</div>
                </div>
                <div style={{ color: '#cbd5e0', whiteSpace: 'pre-wrap' }}>{content || 'Sin contenido'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTagsDialog && (
        <div className="modal-overlay" onClick={() => setShowTagsDialog(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <button className="modal-close-btn" onClick={() => setShowTagsDialog(false)}>×</button>
            <h3 className="modal-title">Seleccionar Etiquetas</h3>
            <div style={{ marginTop: 8 }}>
              <input placeholder="Buscar etiquetas..." value={tagSearch} onChange={e => setTagSearch(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 12 }} />
              <div style={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {filteredTags.length === 0 && <div style={{ color: '#9fb0c8' }}>No se encontraron etiquetas.</div>}
                {filteredTags.map((t) => (
                  <button key={t} type="button" onClick={() => toggleTag(t)} style={{ padding: '6px 10px', borderRadius: 12, border: selectedTags.includes(t) ? '1px solid #5b9bd5' : '1px solid #2d4356', background: selectedTags.includes(t) ? '#5b9bd5' : 'transparent', color: selectedTags.includes(t) ? '#0b1220' : '#cbd5e0' }}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button className="btn-outline" onClick={() => setShowTagsDialog(false)}>Cancelar</button>
                <button className="btn-submit" onClick={() => setShowTagsDialog(false)}>Aceptar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, background: 'rgba(20, 34, 48, 0.6)', padding: '2rem', borderRadius: '8px', border: '1px solid #2d4356' }}>
        <h3 className="form-title" style={{ borderBottom: 'none', marginBottom: '1rem' }}>Mis Publicaciones</h3>
        
        {/* Drafts */}
        {(title || content) && (
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '1rem', borderLeft: '4px solid #5b9bd5' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{title || 'Borrador sin título'}</h4>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#5b9bd5', color: '#fff', borderRadius: '12px' }}>EN_CREACION</span>
            <div style={{ marginTop: 8, color: '#a0aec0', fontSize: 13 }}>
              Para publicar lea nuevamente su columna y presione 'Enviar a revisión'
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button
                className="btn-outline"
                onClick={() => navigate('/publication/preview', { state: { draft: { title, content, author: author, image: croppedDataUrl, createdAt: new Date().toISOString(), status: 'EN_CREACION' } } })}
              >
                Vista previa
              </button>
              <button className="btn-outline" style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }} onClick={handleDeleteDraft}>Borrar</button>
            </div>
          </div>
        )}

        {/* Backend Publications */}
        {myPublications.length === 0 ? (
          <p style={{ color: '#a0aec0' }}>No tienes publicaciones enviadas aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myPublications.map(pub => (
              <div key={pub._id} style={{ position: 'relative', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', borderLeft: `4px solid ${pub.status === 'PUBLICADA' ? '#48bb78' : '#ecc94b'}` }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{pub.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                    {new Date(pub.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: pub.status === 'PUBLICADA' ? '#48bb78' : '#ecc94b', color: '#1a202c', borderRadius: '12px', fontWeight: 'bold' }}>
                      {pub.status || 'EN_REVISION'}
                    </span>
                    {pub.status === 'EN_CREACION' && (
                      <Link to={`/publication/${slugifyTitle(pub.title || pub._id)}`} className="btn-outline">Vista previa</Link>
                    )}
                    {pub.status === 'ITERANDO' && (
                      <button className="btn-outline" onClick={() => handleEdit(pub)}>Editar</button>
                    )}
                    {pub.status === 'APROBADO' && (
                      <>
                        <button className="btn-submit" onClick={() => handlePublishNow(pub)}>Publicar ahora</button>
                        {!schedulingId && (
                          <button className="btn-outline" onClick={() => openSchedulePicker(pub)} style={{ marginLeft: 8 }}>Fecha Publicación</button>
                        )}
                        {schedulingId === pub._id && (
                          <div style={{ position: 'absolute', top: 44, right: 8, zIndex: 60 }}>
                            <div style={{ background: '#071021', color: '#cbd5e0', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.4)', minWidth: 220 }}>
                              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Selecciona fecha</div>
                              <input type="date" value={scheduleDate} min={minScheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button className="btn-outline" onClick={() => { setSchedulingId(null); setScheduleDate(''); }}>Cancelar</button>
                                <button className="btn-submit" onClick={() => handleConfirmSchedule(pub._id)} disabled={!scheduleDate}>Confirmar</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
