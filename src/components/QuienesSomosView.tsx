import React, { useState } from "react";
import { 
  Users, 
  Pencil, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  Globe, 
  ShieldAlert, 
  UserSquare, 
  ArrowLeftRight 
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Person, SiteSettings, User } from "../types";

interface QuienesSomosViewProps {
  settings: SiteSettings;
  currentUser: User | null;
  onUpdateSettings: (settings: SiteSettings) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const QuienesSomosView: React.FC<QuienesSomosViewProps> = ({
  settings,
  currentUser,
  onUpdateSettings,
  triggerToast
}) => {
  const isAdmin = currentUser?.role === "admin";

  // General texts editing state
  const [isEditingTexts, setIsEditingTexts] = useState(false);
  const [editTitle, setEditTitle] = useState(settings.quienesSomosTitle || "¿Quiénes Somos?");
  const [editDesc, setEditDesc] = useState(settings.quienesSomosDescription || "");
  const [editConviction, setEditConviction] = useState(settings.convictionText || "");

  // People modifications state
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Form Fields for Person modal
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Default Avatar
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormAvatar(reader.result as string);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Save general page texts
  const handleSaveTexts = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          quienesSomosTitle: editTitle,
          quienesSomosDescription: editDesc,
          convictionText: editConviction
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateSettings(data.settings);
        triggerToast("Información institucional actualizada correctamente.", "success");
        setIsEditingTexts(false);
      } else {
        triggerToast("Error al guardar cambios.", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión con el gabinete de control.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Open modal in edit mode or create mode
  const openPersonModal = (person?: Person) => {
    if (person) {
      setEditingPerson(person);
      setFormFirstName(person.firstName);
      setFormLastName(person.lastName);
      setFormAvatar(person.avatar);
      setSelectedFile(null); // Reset
      setFormTitle(person.title);
      setFormDescription(person.description);
    } else {
      setEditingPerson(null);
      setFormFirstName("");
      setFormLastName("");
      setFormAvatar(DEFAULT_AVATAR); // select female writer as initial placeholder
      setSelectedFile(null); // Reset
      setFormTitle("");
      setFormDescription("");
    }
    setIsPersonModalOpen(true);
  };

  // Save Person (Create or Update)
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) {
      triggerToast("Debe ingresar nombre y apellido.", "error");
      return;
    }

    setSaving(true);
    
    let avatarUrl = formAvatar;
    if (selectedFile) {
      // Upload the file
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      try {
        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          avatarUrl = data.url;
        } else {
          triggerToast(data.message || "Error al subir la imagen.", "error");
          setSaving(false);
          setUploading(false);
          return;
        }
      } catch (err) {
        triggerToast("Error de conexión durante la subida.", "error");
        setSaving(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }
    
    const updatedPeopleList = [...(settings.quienesSomosPeople || [])];

    if (editingPerson) {
      // Update existing person
      const idx = updatedPeopleList.findIndex(p => p.id === editingPerson.id);
      if (idx !== -1) {
        updatedPeopleList[idx] = {
          ...editingPerson,
          firstName: formFirstName,
          lastName: formLastName,
          avatar: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          title: formTitle,
          description: formDescription
        };
      }
    } else {
      // Create new person
      const newPerson: Person = {
        id: "p_" + Date.now(),
        firstName: formFirstName,
        lastName: formLastName,
        avatar: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        title: formTitle,
        description: formDescription
      };
      updatedPeopleList.push(newPerson);
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          quienesSomosPeople: updatedPeopleList
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateSettings(data.settings);
        triggerToast(
          editingPerson 
            ? "Miembro del consejo técnico actualizado." 
            : "Nuevo integrante registrado exitosamente.", 
          "success"
        );
        setIsPersonModalOpen(false);
      } else {
        triggerToast("No se pudo persistir el cambio en la plantilla.", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión durante el guardado.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete matching person
  const handleDeletePerson = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro que desea desvincular a ${name} de Quiénes Somos?`)) {
      return;
    }

    setSaving(true);
    const filteredList = (settings.quienesSomosPeople || []).filter(p => p.id !== id);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          quienesSomosPeople: filteredList
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateSettings(data.settings);
        triggerToast("Integrante removido de la estructura institucional.", "success");
      } else {
        triggerToast("Error al remover el integrante.", "error");
      }
    } catch (err) {
      triggerToast("Error de comunicación con el directorio.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-sans text-slate-100">
      
      {/* Visual Header / Breadcrumbs */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-mono text-[#dfba53]/90 bg-[#dfba53]/5 border border-[#dfba53]/20 py-1 px-3.5 rounded-full">
          <Globe className="w-3.5 h-3.5 animate-pulse text-[#dfba53]" />
          <span>ESTADO MULTIPOLAR • SOBERANÍA INFORMADA</span>
        </div>
        
        {/* EDITABLE INSTITUTIONAL DESCRIPTION SECTION */}
        <div className="relative group/quienestitle py-2 max-w-3xl mx-auto rounded-xl">
          {isEditingTexts ? (
            <div className="space-y-4 bg-slate-950/90 border border-[#dfba53]/35 p-6 rounded-xl relative shadow-2xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#dfba53] block">
                Editor Institucional (Admin de la República)
              </span>
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block text-left">Título General</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#030a16] border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#dfba53]"
                  placeholder="Ej: ¿Quiénes Somos?"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block text-left">Descripción / Declaración de Principios</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#030a16] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba53] font-serif"
                  placeholder="Breve descripción introductoria sobre el consorcio o think tank"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block text-left">Firma de Convicción Editorial (Sincronizado con Footer)</label>
                <textarea
                  value={editConviction}
                  onChange={(e) => setEditConviction(e.target.value)}
                  rows={4}
                  className="w-full bg-[#030a16] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#dfba53] font-serif italic"
                  placeholder="Sostenemos la firme convicción de que..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={handleSaveTexts}
                  disabled={saving}
                  id="btn-save-institucional-texts"
                  className="px-4 py-1.5 bg-[#dfba53] hover:bg-[#cfa543] text-slate-900 rounded font-mono font-bold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar Cambios</span>
                </button>
                <button
                  onClick={() => {
                    setEditTitle(settings.quienesSomosTitle || "¿Quiénes Somos?");
                    setEditDesc(settings.quienesSomosDescription || "");
                    setEditConviction(settings.convictionText || "");
                    setIsEditingTexts(false);
                  }}
                  id="btn-cancel-institucional-texts"
                  className="px-4 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-white font-mono text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white tracking-wide">
                  {settings.quienesSomosTitle || "¿Quiénes Somos?"}
                </h1>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditTitle(settings.quienesSomosTitle || "¿Quiénes Somos?");
                      setEditDesc(settings.quienesSomosDescription || "");
                      setEditConviction(settings.convictionText || "");
                      setIsEditingTexts(true);
                    }}
                    id="pencil-edit-general-texts"
                    className="p-1 px-2 rounded-full border border-slate-800 bg-slate-950 text-[#dfba53] hover:bg-[#dfba53] hover:text-[#030a16] hover:border-[#dfba53] transition-all cursor-pointer inline-flex items-center space-x-1"
                    title="Editar Quiénes Somos e Ideología"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold pr-1">Editar</span>
                  </button>
                )}
              </div>
              
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-serif leading-relaxed text-center">
                {settings.quienesSomosDescription || "Somos un foro deliberativo técnico-político e independiente dedicado al análisis geopolítico de vanguardia y la inserción de las bases institucionales."}
              </p>

              {/* Conviction Mirror Card (Shows edited conviction live) */}
              <div className="max-w-3xl mx-auto relative mt-8 p-6 rounded-xl bg-slate-950/40 border border-[#dfba53]/15 backdrop-blur-md">
                <div className="absolute top-2 left-6 text-[#dfba53]/30 font-serif text-5xl">“</div>
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-slate-400 italic text-center px-6 relative z-10">
                  {settings.convictionText}
                </p>
                <div className="absolute bottom-1 right-6 text-[#dfba53]/30 font-serif text-5xl rotate-180">“</div>
                
                <div className="text-[9px] font-mono tracking-wider text-[#dfba53] text-center mt-3 uppercase">
                  Declaración Doctrinaria Unificada (Reflejado en el Pie de Página)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directory Section */}
      <div className="mt-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center space-x-3.5">
            <Users className="w-5 h-5 text-[#dfba53]" />
            <h2 className="text-xl sm:text-2xl font-cinzel text-white tracking-widest font-bold uppercase">
              Estructura de Personas y Consejo Deliberativo
            </h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => openPersonModal()}
              id="btn-add-team-member"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Integrante</span>
            </button>
          )}
        </div>

        {/* Directory Grid */}
        {(!settings.quienesSomosPeople || settings.quienesSomosPeople.length === 0) ? (
          <div className="text-center py-16 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
            <UserSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-serif text-slate-400 italic">No hay integrantes institucionales guardados en la base.</p>
            {isAdmin && (
              <button
                onClick={() => openPersonModal()}
                className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#dfba53] hover:bg-[#cfa543] text-[#030a16] font-mono font-bold text-xs rounded cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Primer Miembro</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {settings.quienesSomosPeople.map((person) => (
              <div 
                key={person.id}
                id={`person-card-${person.id}`}
                className="relative flex items-start space-x-4 sm:space-x-5 p-5 sm:p-6 bg-[#040e1f] border border-slate-900 rounded-xl hover:border-[#dfba53]/30 transition-all duration-300 group shadow-md"
              >
                {/* Photo */}
                <div className="relative shrink-0">
                  <img
                    src={person.avatar}
                    alt={`${person.firstName} ${person.lastName}`}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#dfba53]/25 group-hover:border-[#dfba53] transition-all shadow-md"
                  />
                  
                  {/* Small decorative indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#dfba53] text-[#030a16] rounded-full p-1 border border-[#040e1f] w-4.5 h-4.5 flex items-center justify-center">
                    <span className="text-[7px] font-mono font-bold">CP</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-cinzel font-bold text-white tracking-wider leading-tight truncate">
                      {person.firstName} {person.lastName}
                    </h3>
                    
                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center space-x-1 relative shrink-0">
                        <button
                          onClick={() => openPersonModal(person)}
                          id={`edit-person-btn-${person.id}`}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-[#dfba53] hover:bg-[#dfba53] hover:text-[#030a16] transition-all cursor-pointer"
                          title="Editar información de la persona"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePerson(person.id, `${person.firstName} ${person.lastName}`)}
                          id={`delete-person-btn-${person.id}`}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all cursor-pointer"
                          title="Desvincular integrante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-[#dfba53] font-semibold leading-relaxed">
                    {person.title || "Miembro del Consejo Técnico"}
                  </div>

                  <p className="text-xs text-slate-300 font-serif leading-relaxed line-clamp-4">
                    {person.description || "N/A - Biografía pendiente de registro por la dirección del consejo de deliberación estatorial."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Person Modals */}
      <AnimatePresence>
        {isPersonModalOpen && (
          <div className="fixed inset-0 min-h-screen bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-[#040e1f] border border-[#dfba53]/35 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-left">
                  <span className="text-[9px] font-mono text-[#dfba53] uppercase tracking-widest block">Consorcio Editorial</span>
                  <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white tracking-widest">
                    {editingPerson ? "EDITAR PERFIL" : "NUEVA PERSONA"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPersonModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePerson} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-slate-400 block">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#dfba53]"
                      placeholder="Ej: Gonzalo"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-slate-400 block">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#dfba53]"
                      placeholder="Ej: Orellana"
                    />
                  </div>
                </div>

                {/* Job Title / Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 block">Cargo o Título *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#dfba53]"
                    placeholder="Ej: Director Tecnológico, Columna Pública"
                  />
                </div>

                {/* Avatar URL Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 block">Foto de Perfil</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-mono transition-all cursor-pointer"
                    >
                      {uploading ? "Subiendo..." : "Subir desde PC"}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="mt-2">
                    <img
                      src={formAvatar || DEFAULT_AVATAR}
                      alt="Perfil"
                      className="w-20 h-20 rounded-full object-cover border-2 border-slate-800"
                    />
                  </div>
                </div>

                {/* Professional Biography / Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 block">Descripción y Trayectoria</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#dfba53] font-serif leading-relaxed"
                    placeholder="Reseña curricular o biográfica sobre el integrante, sus áreas de competencia..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsPersonModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs font-mono transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#dfba53] hover:bg-[#cfa543] text-slate-950 font-bold rounded text-xs font-mono transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    {saving ? (
                      <span>Regrabando...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
