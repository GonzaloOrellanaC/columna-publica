import React, { useState, useEffect } from "react";
import { User, Article, SiteSettings, ArticleCategory, ArticleStatus } from "../types";
import { 
  Users, Newspaper, Settings, Sparkles, Plus, Edit3, Trash2, CheckCircle, 
  XCircle, Sliders, AlertTriangle, Eye, Send, FileText, RefreshCw, KeyRound, 
  HelpCircle, Image as ImageIcon, Check, UserCircle, MessageSquare, Terminal, Download
} from "lucide-react";
import { FileUploader } from "./FileUploader";
import { EditorialTextArea } from "./EditorialTextArea";

interface DashboardViewProps {
  currentUser: User;
  settings: SiteSettings;
  updateSettingsInApp: (newSettings: SiteSettings) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
  fetchArticlesExternal: () => void;
  articles: Article[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  currentUser, settings, updateSettingsInApp, triggerToast, fetchArticlesExternal, articles 
}) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'authors' | 'settings' | 'aiAdviser' | 'logs'>('columns');

  // Logs management state
  const [logsList, setLogsList] = useState<{ filename: string; size: number; modifiedAt: string }[]>([]);
  const [selectedLogFile, setSelectedLogFile] = useState<string>("");
  const [selectedLogContent, setSelectedLogContent] = useState<string>("");
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logLinesCount, setLogLinesCount] = useState<number>(0);
  const [refreshingLogs, setRefreshingLogs] = useState<boolean>(false);

  // Articles state
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);

  // Modal: Create/Edit Article state
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState<ArticleCategory>("Soberanía Global");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStatus, setFormStatus] = useState<ArticleStatus>("draft");

  // Admin: Authors state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hideDemoUsers, setHideDemoUsers] = useState(false);

  // Modal: Add user state (Super Admin)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'columnist'>('columnist');
  const [newUserBio, setNewUserBio] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('');

  // Modal: Edit profile / Suspend state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserBio, setEditUserBio] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'editor' | 'columnist'>('columnist');
  const [editUserBlocked, setEditUserBlocked] = useState(false);
  const [editUserPassword, setEditUserPassword] = useState('');

  // Local site settings editing state
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteSubtitle, setSiteSubtitle] = useState(settings.siteSubtitle);
  const [enableComments, setEnableComments] = useState(settings.enableComments);
  const [enableAIAdviser, setEnableAIAdviser] = useState(settings.enableAIAdviser);
  const [enableRegistrations, setEnableRegistrations] = useState(settings.enableRegistrations);
  const [enableShareButtons, setEnableShareButtons] = useState(settings.enableShareButtons);
  const [heroLayout, setHeroLayout] = useState<"editorial" | "cards" | "magazine">(settings.heroLayout);
  const [alertBannerText, setAlertBannerText] = useState(settings.alertBannerText);

  // AI Adviser State
  const [selectedDraftForAI, setSelectedDraftForAI] = useState<Article | null>(null);
  const [aiAction, setAIAction] = useState<'improve' | 'outline' | 'audit'>('improve');
  const [aiLoading, setAILoading] = useState(false);
  const [aiResponseText, setAIResponseText] = useState("");

  const loadLocalArticles = async () => {
    setColumnsLoading(true);
    try {
      const res = await fetch("/api/articles?includeDrafts=true");
      const data = await res.json();
      if (data.success) {
        setLocalArticles(data.articles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setColumnsLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogsList(data.logs);
        if (data.logs.length > 0) {
          const firstFile = data.logs[0].filename;
          setSelectedLogFile(firstFile);
          fetchLogContent(firstFile);
        }
      }
    } catch (err) {
      console.error("Error loading logs list", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchLogContent = async (filename: string) => {
    if (!filename) return;
    setRefreshingLogs(true);
    try {
      const res = await fetch(`/api/logs/view/${filename}?limit=500`);
      const data = await res.json();
      if (data.success) {
        setSelectedLogContent(data.content);
        setLogLinesCount(data.linesCount);
      }
    } catch (err) {
      console.error("Error reading log file content", err);
    } finally {
      setRefreshingLogs(false);
    }
  };

  const deleteLogFile = async (filename: string) => {
    if (!confirm(`¿Confirma que desea eliminar permanentemente el archivo de registro "${filename}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/logs/${filename}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Archivo "${filename}" eliminado con éxito.`, "success");
        
        // Refresh logs list and select next best candidate
        const listRes = await fetch("/api/logs");
        const listData = await listRes.json();
        if (listData.success) {
          setLogsList(listData.logs);
          if (listData.logs.length > 0) {
            const nextFile = listData.logs[0].filename;
            setSelectedLogFile(nextFile);
            fetchLogContent(nextFile);
          } else {
            setSelectedLogFile("");
            setSelectedLogContent("");
            setLogLinesCount(0);
          }
        }
      } else {
        triggerToast("Error al eliminar el archivo de log: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión al eliminar log: " + err.message, "error");
    }
  };

  useEffect(() => {
    loadLocalArticles();
    loadAllUsers();
  }, []);

  // Update Settings submission
  const handleSettingsUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        siteName,
        siteSubtitle,
        enableComments,
        enableAIAdviser,
        enableRegistrations,
        enableShareButtons,
        heroLayout,
        alertBannerText
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        updateSettingsInApp(data.settings);
        triggerToast("Ajustes del portal guardados formalmente.", "success");
      }
    } catch (error) {
      triggerToast("Error de conexión al guardar ajustes.", "error");
    }
  };

  // Article creation/editing submission
  const handleArticleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      triggerToast("Título y cuerpo del artículo son obligatorios.", "error");
      return;
    }

    try {
      const parsedTags = formTags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title: formTitle,
        subtitle: formSubtitle,
        content: formContent,
        category: formCategory,
        imageUrl: formImageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
        status: formStatus,
        tags: parsedTags,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar
      };

      let url = "/api/articles";
      let method = "POST";

      if (editingArticle) {
        url = `/api/articles/${editingArticle.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(
          editingArticle ? "Se actualizó la columna con éxito." : "Se registró nueva columna con éxito.",
          "success"
        );
        setShowArticleModal(false);
        setEditingArticle(null);
        loadLocalArticles();
        fetchArticlesExternal();
      } else {
        triggerToast("Fallo: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error al guardar la columna editorial.", "error");
    }
  };

  // Open Edit Article Modal
  const openEditArticleModal = (art: Article) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormSubtitle(art.subtitle);
    setFormContent(art.content);
    setFormCategory(art.category);
    setFormImageUrl(art.imageUrl);
    setFormTags(art.tags ? art.tags.join(", ") : "");
    setFormStatus(art.status);
    setShowArticleModal(true);
  };

  // Open New Article Modal
  const openNewArticleModal = () => {
    setEditingArticle(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormContent("");
    setFormCategory("Soberanía Global");
    setFormImageUrl("");
    setFormTags("");
    setFormStatus(currentUser.role === 'columnist' ? 'review' : 'draft');
    setShowArticleModal(true);
  };

  // Delete Article Action
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("¿Está seguro(a) que desea eliminar este artículo permanentemente?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        triggerToast("Artículo eliminado del gabinete técnico.", "success");
        loadLocalArticles();
        fetchArticlesExternal();
      }
    } catch (err) {
      triggerToast("Error de conexión al eliminar artículo.", "error");
    }
  };

  // Review & Quick state switch of status (Published/Draft/Review)
  const handleUpdateStatusTrigger = async (artId: string, newStats: ArticleStatus) => {
    try {
      const res = await fetch(`/api/articles/${artId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStats })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Se modificó el estado a: ${newStats.toUpperCase()}`, "success");
        loadLocalArticles();
        fetchArticlesExternal();
      }
    } catch (e) {
      triggerToast("Error al alterar estado del manuscrito.", "error");
    }
  };

  // Trigger registration of new author (ADMIN)
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      triggerToast("Nombre, Correo y Contraseña son requeridos.", "error");
      return;
    }
    try {
      const payload = {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        bio: newUserBio,
        avatar: newUserAvatar || `/default-avatar.svg`
      };
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("¡Miembro registrado con éxito! Correo de bienvenida enviado de manera no bloqueante.", "success");
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('columnist');
        setNewUserBio('');
        setNewUserAvatar('');
        loadAllUsers();
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al registrar columnista", "error");
    }
  };

  // Edit existing user (ADMIN)
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload: any = {
        name: editUserName,
        bio: editUserBio,
        avatar: editUserAvatar,
        role: editUserRole,
        blocked: editUserBlocked
      };
      if (editUserPassword) {
        payload.password = editUserPassword;
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Perfil actualizado de manera exitosa.", "success");
        setEditingUser(null);
        setEditUserPassword('');
        loadAllUsers();
      } else {
        triggerToast("Error actualizando perfil: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al guardar cambios.", "error");
    }
  };

  // Delete User Account
  const handleDeleteUserAccount = async (id: string) => {
    if (!window.confirm("¿Confirma desvincular este autor del ecosistema? Se denegará su acceso.")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerToast("Miembro desvinculado con éxito.", "success");
        loadAllUsers();
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión.", "error");
    }
  };

  // AI Adviser triggers
  const handleAskAIAdviser = async () => {
    if (!selectedDraftForAI) {
      triggerToast("Por favor seleccione un artículo borrador para consultar de la línea.", "info");
      return;
    }
    setAILoading(true);
    setAIResponseText("");
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftTitle: selectedDraftForAI.title,
          draftContent: selectedDraftForAI.content,
          action: aiAction
        })
      });
      const data = await res.json();
      if (data.success) {
        setAIResponseText(data.advice);
        triggerToast("El análisis del asesor se procesó satisfactoriamente.", "success");
      } else {
        setAIResponseText(`⚠️ Error del asesor de IA: ${data.message}`);
      }
    } catch (e: any) {
      setAIResponseText("⚠️ Error de conexión al consultar el modelo Gemini.");
    } finally {
      setAILoading(false);
    }
  };

  // Filter users lists
  const filteredUsersList = allUsers.filter(u => {
    if (hideDemoUsers && u.isDemo) return false;
    return true;
  });

  if (showArticleModal) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 space-y-8 font-sans text-white">
        {/* Editor Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] text-[#dfba53] font-mono tracking-wider font-bold h-4">
              <span>MESA DE REDACCIÓN ACADÉMICA</span>
              <span>•</span>
              <span className="text-slate-400 font-normal">SALA DE PRENSA</span>
            </div>
            <h2 className="font-cinzel text-xl md:text-2xl font-bold tracking-wider text-white">
              {editingArticle ? "EDITAR DELIBERACIÓN REGISTRADA" : "REDACTAR NUEVA COLUMNA DE OPINIÓN"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowArticleModal(false);
              setEditingArticle(null);
            }}
            className="self-start sm:self-center inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 border border-slate-800 rounded text-xs font-mono transition-colors cursor-pointer"
          >
            <span>← Cancelar y Regresar</span>
          </button>
        </div>

        {/* Editor Page Body */}
        <div className="bg-[#051122]/90 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
            <h4 className="font-cinzel text-md font-bold text-[#dfba53] uppercase tracking-wider">
              {editingArticle ? "Manuscrito en Edición" : "Manuscrito de Deliberación Pública"}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900 uppercase">
              {formStatus === 'draft' ? 'Borrador' : formStatus === 'review' ? 'En Revisión' : 'Publicado'}
            </span>
          </div>

          <form onSubmit={handleArticleFormSubmit} className="space-y-6 text-xs">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Título de la Columna *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Análisis de la Soberanía en Atacama..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] font-serif font-bold"
                />
              </div>

              {/* Subtitle */}
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Bajada / Resumen Ejecutivo</label>
                <input
                  type="text"
                  placeholder="Subtítulo elegante sobre la premisa..."
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-205 focus:outline-none focus:border-[#dfba53] font-serif"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Sección Editorial</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-[#dfba53]"
                >
                  <option value="Soberanía Global">Soberanía Global</option>
                  <option value="Geopolítica Económica">Geopolítica Económica</option>
                  <option value="Análisis">Análisis Estratégico</option>
                  <option value="Opinión">Opinión Republicana</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Status Selection (Controlled by permissions) */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Estado del Borrador</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  disabled={currentUser.role === 'columnist'}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-205 focus:outline-none disabled:opacity-65"
                >
                  <option value="draft">Borrador Editorial</option>
                  <option value="review">Solicitar Aprobación Editor</option>
                  {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
                    <option value="published">Publicar en Feed</option>
                  )}
                </select>
              </div>

              {/* Cover Image URL */}
              <div className="md:col-span-2">
                <FileUploader
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  type="image"
                  label="Imagen Ilustrativa de Portada"
                  placeholder="Arrastra la ilustración o haz clic para subir una desde tu equipo"
                  allowLocalGallery={true}
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Etiquetas Temáticas (Separadas por comas)</label>
                <input
                  type="text"
                  placeholder="Ej. Soberanía, Atacama, Macroeconomía"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none font-mono focus:border-[#dfba53]"
                />
              </div>
            </div>

            {/* Markdown Content */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Cuerpo Integro de la Deliberación *</label>
              <EditorialTextArea
                value={formContent}
                onChange={setFormContent}
                placeholder="Redacte la disertación aquí. Se aconseja un estilo culto y profundo..."
                rows={18}
                required={true}
              />
            </div>

            {/* CTA buttons */}
            <div className="border-t border-slate-850 pt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowArticleModal(false);
                  setEditingArticle(null);
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded cursor-pointer font-mono text-[11px]"
              >
                Descartar cambios
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#dfba53] hover:bg-yellow-400 text-[#030a16] font-bold font-mono text-[11px] rounded shadow cursor-pointer uppercase transition-all"
              >
                {editingArticle ? "Consolidar Edición" : "Guardar Manuscrito"}
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-10 font-sans text-white">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-white tracking-widest uppercase flex items-center">
            <Sliders className="w-6 h-6 mr-3 text-[#dfba53]" />
            GABINETE EDITORIAL & CONTROL
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Ambiente técnico para {currentUser.name} ({currentUser.role.toUpperCase()})
          </p>
        </div>

        {/* Tab Controls Navigation */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('columns')}
            className={`flex items-center space-x-1.5 px-4 py-2 font-mono text-xs rounded transition-all cursor-pointer ${
              activeTab === 'columns'
                ? 'bg-[#dfba53] text-[#030a16] font-bold shadow-md shadow-[#dfba53]/10'
                : 'bg-slate-900 border border-slate-800 text-slate-350 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Manuscritos</span>
          </button>

          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('authors')}
                className={`flex items-center space-x-1.5 px-4 py-2 font-mono text-xs rounded transition-all cursor-pointer ${
                  activeTab === 'authors'
                    ? 'bg-[#dfba53] text-[#030a16] font-bold shadow-md shadow-[#dfba53]/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-355 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Autores & Editores</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-1.5 px-4 py-2 font-mono text-xs rounded transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#dfba53] text-[#030a16] font-bold shadow-md shadow-[#dfba53]/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-360 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configuración</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('logs');
                  fetchLogs();
                }}
                className={`flex items-center space-x-1.5 px-4 py-2 font-mono text-xs rounded transition-all cursor-pointer ${
                  activeTab === 'logs'
                    ? 'bg-[#dfba53] text-[#030a16] font-bold shadow-md shadow-[#dfba53]/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bitácora (Logs)</span>
              </button>
            </>
          )}

          {settings.enableAIAdviser && (
            <button
              onClick={() => {
                setActiveTab('aiAdviser');
                if (localArticles.length > 0 && !selectedDraftForAI) {
                  setSelectedDraftForAI(localArticles[0]);
                }
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 font-mono text-xs rounded transition-all cursor-pointer ${
                activeTab === 'aiAdviser'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold shadow-lg'
                  : 'bg-slate-900 border border-slate-800 text-purple-400 hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Asesor de IA</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================= TAB: COLUMNS (MANUSCRIPTS) ======================= */}
      {activeTab === 'columns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#051122] border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="font-serif text-lg font-bold">Listado de Artículos y Columnas</h3>
              <p className="text-xs text-slate-400">Crear, editar o auditar los estados de moderación.</p>
            </div>

            <button
              onClick={openNewArticleModal}
              className="inline-flex items-center space-x-1 px-4 py-2.5 bg-[#dfba53] text-[#030a16] font-bold text-xs uppercase tracking-wider font-mono rounded-lg shadow cursor-pointer hover:bg-yellow-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Manuscrito</span>
            </button>
          </div>

          {columnsLoading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Recuperando registros...</div>
          ) : localArticles.length === 0 ? (
            <div className="p-10 text-center text-slate-500 border border-slate-850 rounded-xl">No hay manuscritos registrados. Presione "Nuevo Manuscrito" para sembrar el primero.</div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#040e1b]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#051225] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Título Columnista</th>
                    <th scope="col" className="px-6 py-3.5">Sección</th>
                    <th scope="col" className="px-6 py-3.5">Fecha</th>
                    <th scope="col" className="px-6 py-3.5">Estado</th>
                    <th scope="col" className="px-6 py-3.5">Autor</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {localArticles.map(art => {
                    const isAuthor = art.authorId === currentUser.id;
                    const canModify = currentUser.role === 'admin' || currentUser.role === 'editor' || isAuthor;

                    return (
                      <tr key={art.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 font-serif font-bold text-white max-w-sm truncate">
                          {art.title}
                          <span className="block text-[10px] font-sans text-slate-400 italic font-normal truncate mt-0.5">{art.subtitle}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300">
                            {art.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {new Date(art.createdAt).toLocaleDateString("es-CL")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider font-semibold ${
                            art.status === "published"
                              ? "bg-green-950/20 text-green-400 border border-green-900/40"
                              : art.status === "review"
                              ? "bg-amber-950/20 text-amber-400 border border-amber-900/40"
                              : "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}>
                            {art.status === "published" ? "Publicada" : art.status === "review" ? "En revisión" : "Borrador"}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center space-x-2">
                          <img src={art.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <span className="truncate max-w-[100px]">{art.authorName}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5 min-w-[200px]">
                          {canModify && (
                            <button
                              onClick={() => openEditArticleModal(art)}
                              title="Editar"
                              className="p-1 px-2 bg-slate-900 hover:bg-slate-850 hover:text-[#dfba53] rounded border border-slate-800 text-slate-400 transition-all cursor-pointer text-[10px] font-mono inline-flex items-center space-x-0.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> <span>Editar</span>
                            </button>
                          )}

                          {/* Quick Moderator switches (Admin or Editor only) */}
                          {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
                            <>
                              {art.status !== "published" ? (
                                <button
                                  onClick={() => handleUpdateStatusTrigger(art.id, "published")}
                                  title="Aprobar para publicar"
                                  className="p-1 px-2 bg-green-950/30 hover:bg-green-900/40 text-green-400 rounded border border-green-900/40 transition-all cursor-pointer text-[10px] font-mono inline-flex items-center space-x-0.5"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> <span>Aprobar</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatusTrigger(art.id, "review")}
                                  title="Mandar a revisión"
                                  className="p-1 px-2 bg-amber-950/30 hover:bg-amber-900/45 text-amber-400 rounded border border-amber-900/45 transition-all cursor-pointer text-[10px] font-mono inline-flex items-center space-x-0.5"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> <span>Revisar</span>
                                </button>
                              )}
                            </>
                          )}

                          {canModify && (
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              title="Eliminar"
                              className="p-1 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded border border-slate-800 hover:border-red-900/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB: AUTHORS (ADMIN PANEL) ======================= */}
      {activeTab === 'authors' && currentUser.role === 'admin' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#051122] border border-slate-800 p-5 rounded-xl gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold">Listado del Personal Académico</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervisar cuentas, modificar privilegios de editores, bloquear redactores, y registrar nuevos miembros en el Cono Editorial.
              </p>
            </div>
            {/* Filter and Trigger */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#dfba53] hover:bg-yellow-400 text-[#030a16] font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer font-mono"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Autor</span>
              </button>
              <div className="flex items-center space-x-2 bg-[#040e1b] px-4 py-2 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  id="hide-demo-checkbox"
                  checked={hideDemoUsers}
                  onChange={(e) => setHideDemoUsers(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-[#dfba53] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="hide-demo-checkbox" className="text-xs text-slate-350 font-medium cursor-pointer select-none">
                  Ocultar Demo-Usuarios
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsersList.map(u => (
              <div 
                key={u.id}
                className={`bg-[#040e1b] border rounded-xl p-5 space-y-4 flex flex-col justify-between ${
                  u.blocked ? 'border-red-900/60 opacity-60' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-[#dfba53]/30" />
                      <div>
                        <h4 className="text-xs font-bold text-white font-serif">{u.name}</h4>
                        <span className="text-[9px] font-mono text-slate-500">{u.email}</span>
                      </div>
                    </div>

                    <span className="inline-block px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[9px] font-mono text-slate-400">
                      {u.role.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-serif leading-relaxed line-clamp-3">
                    "{u.bio || 'Consorciador académico de ciencias políticas o economía soberanas en opinión internacional.'}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-850 flex justify-between items-center text-[11px]">
                  <span className="font-mono text-slate-500">Demo: {u.isDemo ? 'Sí' : 'No'}</span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setEditUserName(u.name);
                        setEditUserBio(u.bio);
                        setEditUserAvatar(u.avatar);
                        setEditUserRole(u.role);
                        setEditUserBlocked(!!u.blocked);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[#dfba53] font-mono text-[10px] rounded cursor-pointer"
                    >
                      Ajustar Perfil
                    </button>
                    {u.id !== "user-super-primary" && (
                      <button
                        onClick={() => handleDeleteUserAccount(u.id)}
                        className="p-1 px-1.5 bg-slate-900 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/40 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB: SETTINGS (ADMIN PANEL) ======================= */}
      {activeTab === 'settings' && currentUser.role === 'admin' && (
        <form onSubmit={handleSettingsUpdateSubmit} className="bg-[#040e1b] border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Parámetros del Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Configure los privilegios globales y la visualización de la carátula pública.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left box column */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Nombre Comercial del Periódico</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Frase Subtítulo Geopolítico</label>
                <input
                  type="text"
                  value={siteSubtitle}
                  onChange={(e) => setSiteSubtitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Despacho de Urgencia (Alert Banner)</label>
                <textarea
                  value={alertBannerText}
                  onChange={(e) => setAlertBannerText(e.target.value)}
                  rows={2}
                  placeholder="Texto oficial para alertas en la cabecera del feed..."
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                />
              </div>
            </div>

            {/* Right box switches column */}
            <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-lg space-y-4 font-mono text-xs">
              <h4 className="text-[#dfba53] font-bold text-[11px] uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center">
                <Sliders className="w-4 h-4 mr-1.5" />
                Vectores de Operabilidad Social
              </h4>

              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <div>
                  <span className="block font-semibold">Habiltar Disertaciones</span>
                  <span className="text-[10px] text-slate-500">Permitir comentarios a visitantes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableComments}
                  onChange={(e) => setEnableComments(e.target.checked)}
                  className="w-4 h-4 rounded text-[#dfba53] border-slate-700 bg-slate-900 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <div>
                  <span className="block font-semibold">Asesor Editorial IA</span>
                  <span className="text-[10px] text-slate-500">Consultoría de optimización basada en Gemini.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAIAdviser}
                  onChange={(e) => setEnableAIAdviser(e.target.checked)}
                  className="w-4 h-4 rounded text-[#dfba53] border-slate-700 bg-slate-900 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <div>
                  <span className="block font-semibold">Registro de Columnistas</span>
                  <span className="text-[10px] text-slate-500">Permitir inscripcion pública voluntaria.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableRegistrations}
                  onChange={(e) => setEnableRegistrations(e.target.checked)}
                  className="w-4 h-4 rounded text-[#dfba53] border-slate-700 bg-slate-900 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="block font-semibold">Botones de Transferencia</span>
                  <span className="text-[10px] text-slate-500">Incluir redes sociales en lectura.</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableShareButtons}
                  onChange={(e) => setEnableShareButtons(e.target.checked)}
                  className="w-4 h-4 rounded text-[#dfba53] border-slate-700 bg-slate-900 focus:ring-0"
                />
              </div>
            </div>

          </div>

          <div className="border-t border-slate-850 pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-[#dfba53] hover:bg-yellow-400 text-[#030a16] font-bold text-xs font-mono tracking-wider uppercase rounded shadow cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración General</span>
            </button>
          </div>

        </form>
      )}

      {/* ======================= TAB: LOGS (SYSTEM REAL-TIME BITACORA) ======================= */}
      {activeTab === 'logs' && currentUser.role === 'admin' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#051122] border border-slate-800 p-5 rounded-xl gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#dfba53]" />
                <span>Bitácora de Sistema & Logs del Servidor</span>
              </h3>
              <p className="text-xs text-slate-400">
                Monitoree eventos en tiempo real, peticiones HTTP, advertencias y errores del gabinete chileno.
              </p>
            </div>

            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono rounded cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar Lista</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar with log files list */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#040e1b] border border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
                  Archivos de Registro ({logsList.length})
                </h4>

                {logsLoading && logsList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    Cargando archivos...
                  </div>
                ) : logsList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    No se encontraron registros.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                    {logsList.map((log) => {
                      const isSelected = selectedLogFile === log.filename;
                      const sizeInKb = (log.size / 1024).toFixed(2);
                      const formattedDate = new Date(log.modifiedAt).toLocaleString("es-CL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      });

                      return (
                        <div
                          key={log.filename}
                          onClick={() => {
                            setSelectedLogFile(log.filename);
                            fetchLogContent(log.filename);
                          }}
                          className={`p-3 rounded border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#dfba53]/10 border-[#dfba53] text-white font-semibold'
                              : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:bg-slate-900/40 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="truncate max-w-[170px]">{log.filename}</span>
                            <span className="text-[10px] opacity-80">{sizeInKb} KB</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1 flex justify-between items-center">
                            <span>Modificado: {formattedDate}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLogFile(log.filename);
                              }}
                              className="text-red-450 hover:text-red-300 p-0.5 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Preview area */}
            <div className="lg:col-span-8 flex flex-col space-y-3">
              <div className="bg-[#030914]/90 border border-slate-800 rounded-xl flex flex-col flex-grow min-h-[500px]">
                {/* Terminal Header */}
                <div className="bg-[#050f21] border-b border-slate-800 px-4 py-3 rounded-t-xl flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
                    <span className="text-xs font-mono text-slate-400 ml-2 truncate max-w-[200px]">
                      {selectedLogFile ? `root@columna-publica:~/${selectedLogFile}` : 'Terminal'}
                    </span>
                  </div>

                  {selectedLogFile && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-slate-500 mr-2">
                        {logLinesCount} líneas leídas
                      </span>

                      <button
                        onClick={() => fetchLogContent(selectedLogFile)}
                        disabled={refreshingLogs}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono rounded cursor-pointer text-slate-300 transition-colors disabled:opacity-50"
                        title="Refrescar contenido"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshingLogs ? 'animate-spin' : ''}`} />
                        <span>Refrescar</span>
                      </button>

                      <a
                        href={`/api/logs/download/${selectedLogFile}`}
                        download
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#dfba53] hover:bg-yellow-400 text-[#030a16] text-[10px] font-mono font-bold rounded cursor-pointer transition-colors"
                        title="Descargar archivo completo"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Terminal Workspace Buffer */}
                <div className="p-4 flex-grow font-mono overflow-auto max-h-[500px] text-xs text-left text-slate-250 select-text flex flex-col bg-black">
                  {!selectedLogFile ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-550 py-20 space-y-3 font-sans">
                      <Terminal className="w-12 h-12 text-slate-700 animate-pulse" />
                      <div>
                        <p className="font-semibold text-sm text-slate-300">Ningún archivo de log seleccionado</p>
                        <p className="text-xs max-w-xs mt-1 text-slate-450">Seleccione un archivo de registro en la barra lateral para inspeccionar e interactuar con su contenido.</p>
                      </div>
                    </div>
                  ) : refreshingLogs && !selectedLogContent ? (
                    <div className="text-green-500 animate-pulse py-12 text-center text-sm">
                      $ tail -n 500 {selectedLogFile} ...
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-slate-500 mb-2 border-b border-slate-950 pb-1.5 flex justify-between items-center text-[10px] font-mono">
                        <span>$ tail -n 500 {selectedLogFile}</span>
                        <span>[Visualización en tiempo real]</span>
                      </div>
                      {selectedLogContent.trim() === "" ? (
                        <div className="text-slate-500 italic py-4">
                          [Archivo de registro vacío o sin registros coincidentes]
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed break-all bg-black p-2 rounded border border-slate-950 select-text outline-none text-green-400">
                          {selectedLogContent}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB: AI ADVISER (GEMINI STYLING OPTIMIZATION) ======================= */}
      {activeTab === 'aiAdviser' && settings.enableAIAdviser && (
        <div className="bg-[#040e1b] border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-serif text-lg font-bold text-white">Asesor Editorial de IA (Gemini 3.5 Flash)</h3>
          </div>
          <p className="text-xs text-slate-400 -mt-3">
            Seleccione uno de sus manuscritos guardados y asigne una acción análisis inteligente de estilo, ortografía o de ampliación macroeconómica.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls panel */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Draft picker */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                  1. Elegir Manuscrito Borrador
                </label>
                <select
                  onChange={(e) => {
                    const match = localArticles.find(a => a.id === e.target.value);
                    if (match) setSelectedDraftForAI(match);
                  }}
                  value={selectedDraftForAI?.id || ""}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-purple-500 font-serif"
                >
                  {localArticles.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action targets picker */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1.5">
                  2. Seleccionar Acción Editorial
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-start space-x-2.5 p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="ai_actions"
                      checked={aiAction === 'improve'}
                      onChange={() => setAIAction('improve')}
                      className="mt-0.5 text-purple-600 focus:ring-0"
                    />
                    <div className="text-xs">
                      <span className="block font-semibold text-white">Refinar y Sofisticar Vocabulario</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Corrige redacción, ortografía y amplía la elocuencia de las tesis.</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="ai_actions"
                      checked={aiAction === 'outline'}
                      onChange={() => setAIAction('outline')}
                      className="mt-0.5 text-purple-600 focus:ring-0"
                    />
                    <div className="text-xs">
                      <span className="block font-semibold text-white">Generar Propuesta de Outline y Títulos</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Estructura sugerida, 3 focos de debate y títulos de impacto estratégico.</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="ai_actions"
                      checked={aiAction === 'audit'}
                      onChange={() => setAIAction('audit')}
                      className="mt-0.5 text-purple-600 focus:ring-0"
                    />
                    <div className="text-xs">
                      <span className="block font-semibold text-white">Auditoría Estilística Critica</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">Analiza el rigor técnico y señala observaciones de mejora retórica.</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAskAIAdviser}
                disabled={aiLoading || !selectedDraftForAI}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{aiLoading ? "Analizando borrador con Gemini..." : "Solicitar Dictamen Inteligente"}</span>
              </button>

            </div>

            {/* Results terminal panel (Right) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 border border-slate-850 rounded-xl p-5 min-h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <span className="text-[10px] font-mono tracking-widest text-[#dfba53] uppercase font-bold">Dictamen del Editor Consultor</span>
                  <span className="text-[10.5px] font-mono text-slate-500">{aiLoading ? 'Generando análisis...' : 'Asesor disponible'}</span>
                </div>

                {aiLoading ? (
                  <div className="py-20 text-center space-y-3 font-mono text-xs text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                    <span>Gemini 3.5 Flash está procesando el análisis estructural del manuscrito...</span>
                  </div>
                ) : aiResponseText ? (
                  <div className="text-xs md:text-sm font-sans leading-relaxed text-slate-200 whitespace-pre-wrap max-h-[450px] overflow-y-auto prose prose-invert bg-[#040c18] border border-slate-900 p-4 rounded-lg">
                    {aiResponseText}
                  </div>
                ) : (
                  <div className="py-20 text-center font-mono text-xs text-slate-500 italic">
                    Sin dictámenes activos. Escoja un borrador en el panel izquierdo y presione "Solicitar Dictamen" para iniciar el análisis asistido.
                  </div>
                )}
              </div>

              {aiResponseText && !aiLoading && selectedDraftForAI && aiAction === 'improve' && (
                <div className="pt-4 border-t border-slate-900 border-dashed flex justify-end">
                  <button
                    onClick={() => {
                      // Apply the improved text from Gemini directly back into the inputs
                      setFormTitle(selectedDraftForAI.title);
                      setFormSubtitle(selectedDraftForAI.subtitle);
                      setFormContent(aiResponseText);
                      setFormCategory(selectedDraftForAI.category);
                      setFormImageUrl(selectedDraftForAI.imageUrl);
                      setFormTags(selectedDraftForAI.tags.join(", "));
                      setFormStatus(selectedDraftForAI.status);
                      setEditingArticle(selectedDraftForAI);
                      setShowArticleModal(true);
                      triggerToast("Texto mejorado cargado en el editor. Guarde para consolidar.", "success");
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 text-[10.5px] font-mono uppercase tracking-wider rounded border border-purple-850 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    <span>Usar Texto Mejorado como Borrador</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================= MODAL: REGISTRAR NUEVO AUTOR ======================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#051122] border border-[#dfba53]/35 w-full max-w-lg rounded-xl shadow-2xl p-6 text-white space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h4 className="font-cinzel text-md font-bold text-[#dfba53] uppercase tracking-wide flex items-center">
                <UserCircle className="w-5 h-5 mr-2 text-[#dfba53]" />
                Registrar Nuevo Autor / Editor
              </h4>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                  Nombre Completo *
                </label>
                <input 
                  type="text" 
                  placeholder="Ej. Dr. Mauricio Valdivia"
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                  Correo Electrónico *
                </label>
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] font-mono"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                  Contraseña Temporal *
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Establezca contraseña de acceso inicial..."
                    value={newUserPassword} 
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] pl-9 font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <FileUploader
                  value={newUserAvatar}
                  onChange={setNewUserAvatar}
                  type="avatar"
                  label="Fotografía del Avatar / Perfil (Opcional)"
                  placeholder="Arrastra un retrato del colaborador o haz clic para buscar en el dispositivo"
                  allowLocalGallery={true}
                />
              </div>

              {/* Bio Trayectoria */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                  Biografía / Trayectoria Pública (Opcional)
                </label>
                <textarea 
                  placeholder="Trayectoria académica o reseña profesional..."
                  value={newUserBio} 
                  onChange={(e) => setNewUserBio(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">
                  Rol Editorial *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-350 focus:outline-none focus:border-[#dfba53]"
                >
                  <option value="columnist">✒️ Columnista</option>
                  <option value="editor">👓 Editor de Sección</option>
                  <option value="admin">👑 Administrador</option>
                </select>
              </div>

              {/* Footer buttons */}
              <div className="border-t border-slate-800 pt-4 flex gap-2 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#dfba53] text-[#030a16] font-bold rounded shadow transition-all cursor-pointer flex items-center"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Registrar y Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDITAR USUARIO / CONTRASEÑA ======================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#051122] border border-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6 text-white space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h4 className="font-cinzel text-md font-bold text-white uppercase tracking-wide flex items-center">
                <Sliders className="w-5 h-5 mr-2 text-[#dfba53]" />
                Modificar Cuenta Editorial
              </h4>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editUserName} 
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Biografía Académica</label>
                <textarea 
                  value={editUserBio} 
                  onChange={(e) => setEditUserBio(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <FileUploader
                  value={editUserAvatar}
                  onChange={setEditUserAvatar}
                  type="avatar"
                  label="Fotografía de la Cuenta Editorial"
                  placeholder="Arrastra la nueva fotografía del miembro o haz clic para subirla"
                  allowLocalGallery={true}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Asignar Rol</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-slate-350 focus:outline-none"
                >
                  <option value="columnist">✒️ Columnista</option>
                  <option value="editor">👓 Editor de Sección</option>
                  <option value="admin">👑 Administrador</option>
                </select>
              </div>

              {/* Reset Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Establecer Nueva Contraseña (Opcional)</label>
                <input 
                  type="password" 
                  placeholder="Escriba nueva contraseña segura..."
                  value={editUserPassword} 
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded font-mono"
                />
              </div>

              {/* Suspended switch */}
              {editingUser.id !== "user-super-primary" && (
                <div className="flex items-center justify-between p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs">
                  <div className="font-mono">
                    <span className="block font-bold text-red-400">Suspender de la Red</span>
                    <span className="text-[10px] text-slate-400">Denegar acceso a este miembro temporalmente.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editUserBlocked}
                    onChange={(e) => setEditUserBlocked(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 border-slate-700 bg-slate-900 focus:ring-0"
                  />
                </div>
              )}

              {/* Footer buttons */}
              <div className="border-t border-slate-800 pt-4 flex gap-2 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#dfba53] text-[#030a16] font-bold rounded shadow transition-all cursor-pointer"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default DashboardView;
