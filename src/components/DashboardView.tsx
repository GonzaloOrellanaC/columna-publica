import React, { useState, useEffect } from 'react';
import { Article, User, Category } from '../types';
import { Logo } from './Logo';
import { parseSymbolicContent } from '../utils/parser';
import { 
  Building2, Newspaper, FileEdit, Plus, Trash2, Edit3, 
  Sparkles, Check, AlertCircle, FileText, Send, ShieldAlert, 
  Grid, UserCircle, Upload, ArrowLeft, Eye, MessageSquare, CheckCircle2,
  Users, Sliders, Lock, Unlock, KeyRound, Pencil, Ban
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onLogout: () => void;
  onNavigateHome: () => void;
}

type MenuSection = 'overview' | 'articles' | 'editor' | 'profile' | 'settings' | 'users';

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, onLogout, onNavigateHome }) => {
  const [sessionUser, setSessionUser] = useState<User>(currentUser);
  const [activeSegment, setActiveSegment] = useState<MenuSection>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // WordPress-like dynamic site states
  const [siteSettings, setSiteSettings] = useState<{
    siteName: string;
    siteSubtitle: string;
    alertBannerText: string;
    heroLayout: 'editorial' | 'classic' | 'dense';
    enableAboutPage: boolean;
    enableColumnistSidebar: boolean;
    enableAiAssistant: boolean;
    enableDynamicTicker: boolean;
  } | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hideDemoUsers, setHideDemoUsers] = useState(false);

  // States for user profile management (Super Admin)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserBio, setEditUserBio] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'editor' | 'columnist'>('columnist');
  const [editUserBlocked, setEditUserBlocked] = useState(false);
  const [editUserPassword, setEditUserPassword] = useState('');

  // Quick uploader & link helpers states
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const [insertLinkUrl, setInsertLinkUrl] = useState('');
  const [insertLinkText, setInsertLinkText] = useState('');
  const [showLinkPanel, setShowLinkPanel] = useState(false);

  // Editor states
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('General');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'review' | 'published'>('draft');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editTagsText, setEditTagsText] = useState('');
  
  // AI assistant feedback state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ outline: string; suggestions: string[] } | null>(null);

  // Operation notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDashboardArticles();
    if (currentUser.role === 'admin') {
      fetchAdminSettings();
      fetchAdminUsers();
    }
  }, [currentUser]);

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    if (!siteSettings) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.settings);
        triggerToast("Configuración general del CMS guardada con éxito", "success");
        window.dispatchEvent(new Event('cms-settings-updated'));
      } else {
        triggerToast("No se pudo guardar la configuración", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al guardar configuración", "error");
    }
  };

  const handleSaveUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'columnist') => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Rol del usuario actualizado correctamente", "success");
        fetchAdminUsers();
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al guardar rol del usuario", "error");
    }
  };

  const startEditingUser = (u: User) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserBio(u.bio || '');
    setEditUserAvatar(u.avatar || '');
    setEditUserRole(u.role);
    setEditUserBlocked(u.blocked || false);
    setEditUserPassword('');
  };

  const handleUpdateUserSubmit = async () => {
    if (!editingUser) return;
    try {
      const payload: any = {
        name: editUserName,
        bio: editUserBio,
        avatar: editUserAvatar,
        role: editUserRole,
        blocked: editUserBlocked
      };
      if (editUserPassword !== '') {
        payload.password = editUserPassword;
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Información del columnista actualizada con éxito", "success");
        setEditingUser(null);
        fetchAdminUsers();
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error al actualizar la información del usuario", "error");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      triggerToast("No puede eliminarse a sí mismo", "error");
      return;
    }
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser && targetUser.role === 'admin') {
      triggerToast("Ningún Súper Administrador puede borrar a otro Súper Administrador", "error");
      return;
    }
    if (!window.confirm(`¿Está completamente seguro de que desea eliminar permanentemente al columnista "${userName}" de la base de datos? Esta acción es irreversible.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Usuario eliminado permanentemente con éxito", "success");
        fetchAdminUsers();
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al eliminar usuario", "error");
    }
  };

  const handleToggleBlockUser = async (userId: string, userName: string, currentBlocked: boolean) => {
    if (userId === currentUser.id) {
      triggerToast("No puede bloquear su propia cuenta de súper administrador", "error");
      return;
    }
    try {
      const newBlocked = !currentBlocked;
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: newBlocked })
      });
      const data = await res.json();
      if (data.success) {
        const msg = newBlocked 
          ? `Acceso de "${userName}" bloqueado correctamente` 
          : `Acceso de "${userName}" restaurado correctamente`;
        triggerToast(msg, "success");
        fetchAdminUsers();
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al cambiar estado de bloqueo", "error");
    }
  };

  const fetchDashboardArticles = async () => {
    setLoading(true);
    try {
      // In development mode we retrieve all articles including drafts
      const res = await fetch('/api/articles?includeDrafts=true');
      const data = await res.json();
      if (data.success) {
        // Admins can see and moderate all articles.
        // Columnists can see and edit only their own articles.
        if (currentUser.role === 'admin' || currentUser.role === 'editor') {
          setArticles(data.articles);
        } else {
          setArticles(data.articles.filter((a: Article) => a.authorId === currentUser.id));
        }
      }
    } catch (err) {
      triggerToast("Error de conexión al recuperar artículos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Create or update article handler
  const handleSaveArticle = async (forcedStatus?: 'draft' | 'review' | 'published') => {
    if (!editTitle.trim() || !editContent.trim()) {
      triggerToast("Título y Contenido de la columna son requeridos.", "error");
      return;
    }

    const payloadStatus = forcedStatus || editStatus;
    const payloadTags = editTagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const isEditing = !!editingArticleId;
    const apiUrl = isEditing ? `/api/articles/${editingArticleId}` : "/api/articles";
    const method = isEditing ? "PUT" : "POST";

    const payloadBody = isEditing ? {
      title: editTitle,
      subtitle: editSubtitle,
      content: editContent,
      category: editCategory,
      status: payloadStatus,
      imageUrl: editImageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
      tags: payloadTags
    } : {
      title: editTitle,
      subtitle: editSubtitle,
      content: editContent,
      category: editCategory,
      status: payloadStatus,
      imageUrl: editImageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
      tags: payloadTags,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar
    };

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(
          isEditing ? "Columna actualizada correctamente" : "Columna publicada correctamente",
          "success"
        );
        setActiveSegment('articles');
        // Reset buffers
        resetEditorForm();
        fetchDashboardArticles();
      } else {
        triggerToast(data.message || "Error al guardar la columna", "error");
      }
    } catch (err) {
      triggerToast("Error en la conexión con el servidor.", "error");
    }
  };

  const handleDeleteArticle = async (id: string, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar la columna: "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        triggerToast("Columna eliminada de manera satisfactoria.");
        fetchDashboardArticles();
      } else {
        triggerToast(data.message || "No se pudo eliminar el artículo.", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al eliminar artículo.", "error");
    }
  };

  // Moderate columns (exclusive for admin)
  const handleModerateStatus = async (id: string, status: 'published' | 'draft') => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(status === 'published' ? "Articulo aprobado y publicado exitosamente" : "Artículo enviado a borradores");
        fetchDashboardArticles();
      } else {
        triggerToast(data.message || "No se pudo moderar este artículo.", "error");
      }
    } catch (err) {
      triggerToast("Error de red durante la moderación.", "error");
    }
  };

  const handleOpenEditor = (article?: Article) => {
    if (article) {
      setEditingArticleId(article.id);
      setEditTitle(article.title);
      setEditSubtitle(article.subtitle);
      setEditCategory(article.category);
      setEditContent(article.content);
      setEditStatus(article.status);
      setEditImageUrl(article.imageUrl);
      setEditTagsText(article.tags.join(', '));
    } else {
      resetEditorForm();
    }
    setAiResponse(null);
    setActiveSegment('editor');
  };

  const resetEditorForm = () => {
    setEditingArticleId(null);
    setEditTitle('');
    setEditSubtitle('');
    setEditCategory('General');
    setEditContent('');
    setEditStatus('draft');
    setEditImageUrl('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800');
    setEditTagsText('');
  };

  // Call Gemini AI on the server to analyze political density of the draft!
  const handleAiConsulting = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      triggerToast("Debes escribir al menos el título y contenido para analizar.", "error");
      return;
    }

    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          subtitle: editSubtitle,
          content: editContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse({
          outline: data.outline,
          suggestions: data.suggestions
        });
      } else {
        triggerToast(data.message || "Error al conectar con la IA de Gemini.", "error");
      }
    } catch (err) {
      triggerToast("Error de red con el consultor IA.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // Quick select dynamic suggestion of titles
  const applySuggedTitle = (title: string) => {
    setEditTitle(title);
    triggerToast("Título sugerido por IA aplicado.");
  };

  // Stats calculate
  const statPublished = articles.filter(a => a.status === 'published').length;
  const statReview = articles.filter(a => a.status === 'review').length;
  const statDraft = articles.filter(a => a.status === 'draft').length;

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row bg-[#050B14] font-sans text-white">
      
      {/* 1. Dashboard Left Sidebar */}
      <aside className="w-full md:w-64 bg-white/5 text-white flex flex-col justify-between py-6 flex-shrink-0 border-r border-white/10 backdrop-blur-md md:h-screen md:overflow-y-auto">
        <div className="space-y-6">
          
          {/* Logo brand */}
          <div className="px-6 flex items-center justify-between">
            <Logo light={true} className="h-10 w-auto -ml-3" />
          </div>

          <div className="px-6 pb-2 border-b border-white/10 text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold flex items-center">
            {currentUser.role === 'admin' ? (
              <span className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900 flex items-center">
                <ShieldAlert className="w-3 h-3 mr-1" /> Super Admin
              </span>
            ) : currentUser.role === 'editor' ? (
              <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Editor Editorial
              </span>
            ) : (
              <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Columnista Invitado
              </span>
            )}
          </div>

          {/* Nav links */}
          <nav className="px-3 space-y-1">
            
            {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
              <button
                onClick={() => setActiveSegment('overview')}
                className={`w-full flex items-center py-2.5 px-4 rounded text-xs transition-all cursor-pointer text-left ${
                  activeSegment === 'overview' ? 'bg-gold-500 font-bold text-white shadow-lg border border-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4 mr-3" />
                Escritorio (Aprobación)
              </button>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => { setActiveSegment('settings'); fetchAdminSettings(); }}
                  className={`w-full flex items-center py-2.5 px-4 rounded text-xs transition-all cursor-pointer text-left ${
                    activeSegment === 'settings' ? 'bg-gold-500 font-bold text-white shadow-lg border border-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 mr-3 text-gold-400" />
                  Ajustes del Portal (CMS)
                </button>

                <button
                  onClick={() => { setActiveSegment('users'); fetchAdminUsers(); }}
                  className={`w-full flex items-center py-2.5 px-4 rounded text-xs transition-all cursor-pointer text-left ${
                    activeSegment === 'users' ? 'bg-gold-500 font-bold text-white shadow-lg border border-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 mr-3 text-gold-400" />
                  Gestión de Columnistas
                </button>
              </>
            )}

            <button
              onClick={() => { setActiveSegment('articles'); fetchDashboardArticles(); }}
              className={`w-full flex items-center py-2.5 px-4 rounded text-xs transition-all cursor-pointer text-left ${
                activeSegment === 'articles' ? 'bg-gold-500 font-bold text-white shadow-lg border border-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mr-3" />
              Mis Publicaciones
            </button>

            <button
              onClick={() => handleOpenEditor()}
              className={`w-full flex items-center py-2.5 px-4 rounded text-xs transition-all cursor-pointer text-left ${
                activeSegment === 'editor' && !editingArticleId ? 'bg-gold-500 font-bold text-white shadow-lg border border-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4 mr-3" />
              Nueva Publicación
            </button>

            <button
              onClick={() => setActiveSegment('profile')}
              className={`w-full flex items-center py-2.5 px-4 rounded text-xs transition-all cursor-pointer text-left ${
                activeSegment === 'profile' ? 'bg-gold-500 font-bold text-white shadow-lg border border-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <UserCircle className="w-4 h-4 mr-3" />
              Mi Perfil
            </button>

          </nav>
        </div>

        {/* Footer actions of left bar */}
        <div className="px-4 pt-6 mt-6 border-t border-white/10 space-y-2">
          <p className="text-[10px] text-white/40 pl-2">Sesión: {currentUser.name}</p>
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center py-2 px-3 rounded text-xs text-white/60 hover:bg-white/5 hover:text-white text-left transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Portal
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center py-2 px-3 rounded text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 text-left transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. Main Content Right Side */}
      <main className="flex-grow p-6 sm:p-10 max-w-7xl md:h-screen md:overflow-y-auto">
        
        {/* Toast operation notifier */}
        {toast && (
          <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl border flex items-center space-x-3 text-xs font-bold animate-bounce ${
            toast.type === 'success' ? 'bg-[#0f172a] border-white/20 text-emerald-400' : 'bg-[#0f172a] border-white/20 text-red-400'
          }`}>
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-white/10 pb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeSegment === 'overview' && "Escritorio Editorial"}
              {activeSegment === 'articles' && "Mis Columnas Reguladas"}
              {activeSegment === 'editor' && (editingArticleId ? `EDITAR PUBLICACIÓN: ${editTitle || '[Borrador]'}` : "Redactar Nueva Columna")}
              {activeSegment === 'profile' && "Mi Perfil Profesional"}
              {activeSegment === 'settings' && "Configuración General del Portal (CMS)"}
              {activeSegment === 'users' && "Roster Editorial de Columnistas"}
            </h1>
            <p className="text-xs text-white/50 mt-1">
              {activeSegment === 'overview' && "Revisión de columnas ingresadas para dar visto bueno de publicación."}
              {activeSegment === 'articles' && `Gestionas tus publicaciones editoriales del portal.`}
              {activeSegment === 'editor' && "Las publicaciones enviadas a revisión deben ser visadas por un Director."}
              {activeSegment === 'profile' && "Configure su biografía de autor y suba su fotografía de perfil a los directorios del servidor."}
              {activeSegment === 'settings' && "Ajuste el título del sitio, el lema destacado, y active o desactive componentes y layouts de forma dinámica."}
              {activeSegment === 'users' && "Gestione y actualice los privilegios o roles de autoría y administración de los columnistas registrados."}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex gap-2">
            {activeSegment !== 'editor' && (
              <button
                onClick={() => handleOpenEditor()}
                className="bg-gold-500 hover:bg-gold-400 text-white font-serif font-bold text-xs py-2.5 px-4 rounded-md transition-all cursor-pointer inline-flex items-center shadow-md uppercase tracking-wider border border-transparent"
              >
                <Plus className="w-4 h-4 mr-2" /> Nueva Publicación
              </button>
            )}
          </div>
        </div>

        {/* ======================= VIEW A: OVERVIEW / ADMIN APPROVAL QUEUE ======================= */}
        {activeSegment === 'overview' && (currentUser.role === 'admin' || currentUser.role === 'editor') && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0A192F]/20 text-white p-6 rounded-lg border border-white/10 backdrop-blur-md">
              <div>
                <h3 className="font-serif text-lg font-bold text-gold-300 uppercase tracking-wide">Directrices De Estándar</h3>
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  Como Miembro del Equipo Editorial, eres el guardián de la línea editorial de <strong>Columna Pública</strong>. 
                  Verifica que los escritos utilicen una prosa de alta complejidad, de carácter reflexivo y no partidaria. 
                  Puedes utilizar el <strong>Editor Político IA</strong> para recibir comentarios y sugerencias.
                </p>
              </div>
              <div className="flex items-center justify-around bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-center">
                  <span className="block text-3xl font-bold text-gold-300">{statPublished}</span>
                  <span className="text-[10px] text-white/40 uppercase font-mono mt-1">Publicados</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-amber-400 animate-pulse">{statReview}</span>
                  <span className="text-[10px] text-white/40 uppercase font-mono mt-1">Por Aprobar</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-white/50">{statDraft}</span>
                  <span className="text-[10px] text-white/40 uppercase font-mono mt-1">Borradores</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-400 mr-2" />
                <span>Bandeja de Aprobación Editorial ("En Revisión")</span>
              </h3>

              {articles.filter(a => a.status === 'review').length === 0 ? (
                <div className="bg-white/5 rounded-lg border border-white/10 p-12 text-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-serif font-bold text-white">¡Bandeja al día!</p>
                  <p className="text-xs text-white/50 mt-1">No hay columnas con solicitud de visto bueno pendientes en este momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {articles.filter(a => a.status === 'review').map(art => (
                    <div 
                      key={art.id}
                      className="bg-white/5 border-l-4 border-amber-400 rounded-lg border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-white/20 transition-all text-white"
                    >
                      <div className="flex items-start space-x-4">
                        <img src={art.imageUrl} className="w-20 h-16 object-cover rounded bg-[#050B14] flex-shrink-0 border border-white/5" alt="" />
                        <div>
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/20 border border-amber-500/30 px-2.5 py-0.5 rounded font-bold uppercase">
                            #{art.category.toUpperCase()}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-white mt-1">{art.title}</h4>
                          <p className="text-[11px] text-white/70 font-medium">Por: {art.authorName}</p>
                          <p className="text-[10px] text-white/40 mt-1 italic line-clamp-1">"{art.subtitle}"</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleOpenEditor(art)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-colors text-xs inline-flex items-center font-bold cursor-pointer"
                          title="Revisar Escrito"
                        >
                          <Edit3 className="w-4 h-4 mr-1" /> Revisar
                        </button>
                        <button
                          onClick={() => handleModerateStatus(art.id, 'published')}
                          className="p-1.5 bg-emerald-950/30 hover:bg-emerald-900 border border-emerald-500/35 rounded-lg text-emerald-300 transition-colors text-xs inline-flex items-center font-bold cursor-pointer"
                        >
                          <Check className="w-4 h-4 mr-1" /> Aprobar
                        </button>
                        <button
                          onClick={() => handleModerateStatus(art.id, 'draft')}
                          className="p-1.5 bg-red-950/30 hover:bg-red-900 border border-red-500/30 rounded-lg text-red-300 transition-colors text-xs inline-flex items-center font-bold cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= VIEW B: MIS PUBLICACIONES / LIST (Matching layout 3) ======================= */}
        {activeSegment === 'articles' && (
          <div className="space-y-6 text-white">
            
            {/* Stat Counters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-md">
                <span className="text-xs uppercase font-bold text-white/50 font-mono tracking-wider">Publicados</span>
                <p className="text-3xl font-serif font-black text-gold-300 mt-1">{statPublished}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-md">
                <span className="text-xs uppercase font-bold text-white/50 font-mono tracking-wider">En Revisión</span>
                <p className="text-3xl font-serif font-black text-amber-400 mt-1">{statReview}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-md">
                <span className="text-xs uppercase font-bold text-white/50 font-mono tracking-wider">Borradores</span>
                <p className="text-3xl font-serif font-black text-white/40 mt-1">{statDraft}</p>
              </div>
            </div>

            {/* Articles list area */}
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-lg backdrop-blur-md">
              
              {/* Header row */}
              <div className="bg-[#0c2340] text-gold-300 p-4 font-serif text-xs font-bold tracking-wider uppercase grid grid-cols-12 gap-2 border-b border-white/10">
                <span className="col-span-8">Artículos</span>
                <span className="col-span-2 text-center">Status</span>
                <span className="col-span-2 text-right">Acciones</span>
              </div>

              {loading ? (
                <div className="p-10 text-center text-xs text-white/50">Cargando del registro...</div>
              ) : articles.length === 0 ? (
                <div className="p-12 text-center text-white/70">
                  <Newspaper className="w-10 h-10 text-white/30 mx-auto mb-2" />
                  <p className="text-xs text-white/60 italic">No registras ninguna columna publicada.</p>
                  <button
                    onClick={() => handleOpenEditor()}
                    className="mt-4 inline-flex items-center text-xs text-gold-300 hover:text-white font-serif font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                  >
                    Redactar Primera Columna →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {articles.map(art => (
                    <div 
                      key={art.id} 
                      className="p-4 grid grid-cols-12 gap-2 items-center text-xs text-white/90 hover:bg-white/5 transition-colors"
                    >
                      {/* Left: thumb image + text */}
                      <div className="col-span-8 flex items-center space-x-3.5 min-w-0">
                        <img 
                          src={art.imageUrl} 
                          className="w-16 h-12 object-cover rounded bg-[#050B14] flex-shrink-0 border border-white/5" 
                          alt="" 
                        />
                        <div className="min-w-0">
                          <h4 
                            onClick={() => handleOpenEditor(art)}
                            className="font-serif font-bold text-white hover:text-gold-300 transition-colors truncate cursor-pointer leading-tight h-4"
                          >
                            {art.title}
                          </h4>
                          <p className="text-[10px] text-white/50 mt-0.5 truncate leading-none">
                            Por: {art.authorName} ● {art.category}
                          </p>
                        </div>
                      </div>

                      {/* Center: status badge */}
                      <div className="col-span-2 text-center">
                        {art.status === 'published' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                            Publicado
                          </span>
                        )}
                        {art.status === 'review' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 animate-pulse border border-amber-500/30">
                            En Revisión
                          </span>
                        )}
                        {art.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white/60 border border-white/10">
                            Borrador
                          </span>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="col-span-2 text-right flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEditor(art)}
                          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                          title="Editar Columna"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id, art.title)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                          title="Eliminar Columna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nueva Publicación Bottom buttons */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleOpenEditor()}
                className="bg-gold-500 hover:bg-gold-400 text-white font-serif font-bold text-xs py-3 px-6 rounded-md transition-all cursor-pointer shadow-md uppercase tracking-wider border border-transparent"
              >
                NUEVA PUBLICACIÓN
              </button>
            </div>

          </div>
        )}

        {/* ======================= VIEW C: NUEVA/EDITAR PUBLICACIÓN / EDITOR (Matching layout 5) ======================= */}
        {activeSegment === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-white">
            
            {/* Left side Form (col-span-3) */}
            <form onSubmit={(e) => e.preventDefault()} className="lg:col-span-3 space-y-6">
              
              {/* Title Input */}
              <div className="bg-[#0A192F]/20 border border-white/10 rounded-lg p-6 shadow-xl backdrop-blur-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Título de la Columna *</label>
                  <input
                    type="text"
                    required
                    placeholder="Escriba un título elocuente e institucional..."
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-sm p-3 bg-white/5 rounded border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Subtítulo o Resumen Editorial</label>
                  <input
                    type="text"
                    placeholder="Breve sumario descriptivo de la tesis abordada..."
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full text-xs p-3 bg-white/5 rounded border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Rich-like Content editor layout strictly modeled after screen 5 */}
              <div className="bg-[#0A192F]/20 border border-white/10 rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-md">
                
                {/* Formatting controls block */}
                <div className="bg-white/5 border-b border-white/10 p-3 flex flex-col space-y-3">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <button 
                        type="button" 
                        onClick={() => setEditContent(editContent + "【TEXTO GRANDE】 Subtítulo de Sección\n")}
                        className="p-1.5 bg-white/5 hover:bg-gold-500 hover:text-white transition-colors text-[10px] uppercase font-bold text-[#E2E8F0] rounded px-2 border border-white/10"
                        title="Añadir un encabezado con letra más grande"
                      >
                        ➕ Texto más Grande
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditContent(editContent + "【TEXTO NORMAL】 Escriba su párrafo aquí...\n")}
                        className="p-1.5 bg-white/5 hover:bg-gold-500 hover:text-white transition-colors text-[10px] uppercase font-bold text-[#E2E8F0] rounded px-2 border border-white/10"
                        title="Añadir un párrafo con letra convencional"
                      >
                        ➖ Texto más Pequeño
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowLinkPanel(!showLinkPanel)}
                        className={`p-1.5 text-[10px] uppercase font-bold rounded px-2 border border-white/10 transition-colors ${showLinkPanel ? 'bg-gold-500 text-white' : 'bg-white/5 text-[#E2E8F0] hover:bg-gold-500 hover:text-white'}`}
                      >
                        🔗 Generar Enlace
                      </button>

                      <span className="w-px h-5 bg-white/10 mx-1"></span>

                      {/* Image Upload helper inside editor */}
                      <label className="p-1.5 bg-white/5 hover:bg-gold-500 hover:text-white transition-colors text-[10px] uppercase font-bold text-[#E2E8F0] rounded px-2 border border-white/10 cursor-pointer flex items-center">
                        <Upload className="w-3 h-3 mr-1" />
                        📷 Insertar Imagen
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("image", file);
                            try {
                              setUploadProgress('uploading');
                              triggerToast("Subiendo imagen...", "success");
                              const res = await fetch("/api/upload/image", { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.success) {
                                setEditContent(editContent + `\n📷 [IMAGEN: ${data.url}]\n`);
                                triggerToast("Imagen subida e insertada con éxito.", "success");
                                setUploadProgress('completed');
                              } else {
                                triggerToast("No se pudo subir la imagen.", "error");
                                setUploadProgress('error');
                              }
                            } catch (err) {
                              triggerToast("Error de conexión al subir imagen.", "error");
                              setUploadProgress('error');
                            }
                          }}
                        />
                      </label>

                      {/* Document/PDF Upload helper inside editor */}
                      <label className="p-1.5 bg-white/5 hover:bg-gold-500 hover:text-white transition-colors text-[10px] uppercase font-bold text-[#E2E8F0] rounded px-2 border border-white/10 cursor-pointer flex items-center">
                        <Upload className="w-3 h-3 mr-1" />
                        📄 Adjuntar PDF
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("document", file);
                            try {
                              setUploadProgress('uploading');
                              triggerToast("Subiendo documento...", "success");
                              const res = await fetch("/api/upload/document", { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.success) {
                                setEditContent(editContent + `\n📄 [PDF: ${data.name} | ${data.url}]\n`);
                                triggerToast("Documento subido e insertado con éxito.", "success");
                                setUploadProgress('completed');
                              } else {
                                triggerToast("No se pudo subir el documento.", "error");
                                setUploadProgress('error');
                              }
                            } catch (err) {
                              triggerToast("Error de conexión al subir documento.", "error");
                              setUploadProgress('error');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Inline link generator sub-panel */}
                  {showLinkPanel && (
                    <div className="bg-white/5 p-3 rounded border border-white/10 flex flex-col sm:flex-row items-end gap-3 actions-section">
                      <div className="flex-grow justify-start">
                        <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">Texto del Enlace</label>
                        <input 
                          type="text" 
                          placeholder="Ir a referencia..." 
                          value={insertLinkText}
                          onChange={(e) => setInsertLinkText(e.target.value)}
                          className="w-full text-xs p-1.5 bg-black/30 rounded border border-white/10 text-white" 
                        />
                      </div>
                      <div className="flex-grow justify-start">
                        <label className="block text-[9px] uppercase font-mono text-white/50 mb-1">URL (Dirección Web)</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com" 
                          value={insertLinkUrl}
                          onChange={(e) => setInsertLinkUrl(e.target.value)}
                          className="w-full text-xs p-1.5 bg-black/30 rounded border border-white/10 text-white" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!insertLinkUrl.trim() || !insertLinkText.trim()) {
                            triggerToast("Indique texto y dirección del enlace.", "error");
                            return;
                          }
                          const formattedLinkUrl = insertLinkUrl.startsWith("http") ? insertLinkUrl : `https://${insertLinkUrl}`;
                          setEditContent(editContent + `🔗 [ENLACE: ${insertLinkText} -> ${formattedLinkUrl}]`);
                          setInsertLinkText('');
                          setInsertLinkUrl('');
                          setShowLinkPanel(false);
                          triggerToast("Enlace simbólico insertado con éxito.");
                        }}
                        className="p-2 bg-gold-500 hover:bg-gold-400 text-white text-[10px] uppercase font-bold rounded"
                      >
                        Confirmar e Insertar
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtext area content */}
                <textarea
                  rows={15}
                  required
                  placeholder="Redacte su columna utilizando herramientas sencillas... Use 'Texto más Grande' para subtítulos y 'Texto más Pequeño' para los párrafos convencionales sin escribir etiquetas HTML. Cualquier línea escrita de forma directa se considerará por defecto texto normal."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 text-sm bg-white/5 text-white placeholder-white/25 focus:outline-none min-h-[300px] leading-relaxed font-sans focus:bg-[#050B14]/40"
                />

                {/* Live Preview Area - Incredibly useful for non-programmers! */}
                <div className="bg-[#050B14]/60 border-t border-white/10 p-4 sm:p-6">
                  <span className="text-[10px] text-gold-300 font-mono tracking-widest uppercase block mb-3">👁️ Vista Previa en Vivo (Estilo de Lectura):</span>
                  {editContent.trim() ? (
                    <div 
                      className="prose-political bg-white/5 p-4 rounded-lg border border-white/5 max-h-[350px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: parseSymbolicContent(editContent) }}
                    />
                  ) : (
                    <p className="text-xs text-white/40 italic">Comience a redactar para visualizar la propuesta con la tipografía final aquí...</p>
                  )}
                </div>
              </div>

              {/* Gemini AI Editorial adviser workspace - incredibly professional widget */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-xl space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-gold-300 animate-pulse" />
                    <h3 className="font-serif text-md font-bold text-white">Consultor Político Inteligente (Gemini AI)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiConsulting}
                    disabled={aiLoading}
                    className="bg-gold-500 hover:bg-gold-400 disabled:bg-white/5 disabled:text-white/20 text-white text-xs font-serif font-bold py-1.5 px-4 rounded transition-all cursor-pointer uppercase tracking-wider inline-flex items-center border border-transparent"
                  >
                    {aiLoading ? "Analizando prosa..." : "Pedir Asesoramiento IA"}
                  </button>
                </div>

                <p className="text-xs text-white/70 leading-relaxed">
                  ¿Quieres asegurar un estándar doctoral en tu columna? Nuestro editor inteligente analiza la sofisticación del vocabulario, 
                  la madurez argumentativa y te sugiere alternativas de título con peso político institucional.
                </p>

                {aiResponse && (
                  <div className="bg-[#050B14]/40 border border-white/10 rounded-lg p-5 space-y-4 text-xs">
                    <div>
                      <span className="block font-bold text-white border-b border-white/10 pb-1 mb-2">Nota Editorial Consultor:</span>
                      <p className="text-white/80 leading-relaxed bg-[#050B14]/60 p-2.5 rounded border border-white/5 whitespace-pre-wrap italic">
                        "{aiResponse.outline}"
                      </p>
                    </div>

                    <div>
                      <span className="block font-bold text-white mb-2">Títulos Sugeridos (Haz clic para aplicar):</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {aiResponse.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => applySuggedTitle(sug)}
                            className="bg-white/5 border border-white/10 hover:border-gold-300 hover:bg-white/10 rounded-lg p-2.5 text-left text-white font-serif font-semibold text-[11px] leading-tight transition-all cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </form>

            {/* Right Side Control Sidebar Panel (col-span-1) Option matching layout 5 */}
            <aside className="space-y-6">
              
              {/* Card 1: PUBLICACIÓN / ESTADO */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-xl space-y-4 text-white">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block border-b border-white/10 pb-2">Configuración</span>
                
                <div>
                  <label className="block text-xs font-bold text-white/85 mb-1">Sección Editorial</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                    className="w-full text-xs p-2.5 rounded-lg bg-neutral-900 border border-white/10 focus:outline-none text-white font-serif focus:bg-[#0c2340]"
                  >
                    <option value="Análisis">Análisis Político</option>
                    <option value="Opinión">Tribuna de Opinión</option>
                    <option value="Soberanía Global">Soberanía Global</option>
                    <option value="Geopolítica Económica">Geopolítica Económica</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* State selector (Admins can toggle draft, review, published. Columnists cannot publish direct, only draft or review!) */}
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">Estado</label>
                  {currentUser.role === 'admin' || currentUser.role === 'editor' ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-lg bg-neutral-900 border border-white/10 focus:outline-none text-white focus:bg-[#0c2340]"
                    >
                      <option value="draft">Borrador</option>
                      <option value="review">En Revisión (Director)</option>
                      <option value="published">Aprobado y Publicado</option>
                    </select>
                  ) : (
                    <div className="bg-[#050B14]/40 p-2.5 rounded border border-white/10 text-xs">
                      <p className="font-semibold text-gold-300 uppercase text-[9px] font-mono leading-none">Limitación de Perfil</p>
                      <p className="text-white/60 mt-1 leading-snug">
                        Solo puedes enviar el artículo a <strong>Revisión</strong> para recibir visto bueno. Estado actual: <strong>{editStatus === 'draft' ? "Borrador" : editStatus === 'review' ? "En Revisión" : "Publicado"}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Imagen Destacada with preview & direct preset select */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block border-b border-white/10 pb-2">Imagen Destacada</span>
                
                <div className="aspect-video w-full rounded bg-neutral-950 border border-dashed border-white/20 overflow-hidden flex items-center justify-center relative">
                  {editImageUrl ? (
                    <img src={editImageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-4 h-4 text-white/40 mx-auto mb-1" />
                      <span className="text-[10px] text-white/50 block">Sube imagen estratégica</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">URL de la Imagen</label>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-2.5 bg-white/5 rounded border border-white/10 text-white placeholder-white/20 focus:outline-none focus:bg-white/10"
                  />
                </div>

                {/* Highly intuitive fast images selector */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Galería Rápida</span>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditImageUrl("https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800")}
                      className="aspect-square rounded border border-white/10 overflow-hidden cursor-pointer hover:border-gold-400"
                    >
                      <img src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=80" className="w-full h-full object-cover" alt="" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageUrl("https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800")}
                      className="aspect-square rounded border border-white/10 overflow-hidden cursor-pointer hover:border-gold-400"
                    >
                      <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=80" className="w-full h-full object-cover" alt="" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800")}
                      className="aspect-square rounded border border-white/10 overflow-hidden cursor-pointer hover:border-gold-400"
                    >
                      <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=80" className="w-full h-full object-cover" alt="" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageUrl("https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800")}
                      className="aspect-square rounded border border-white/10 overflow-hidden cursor-pointer hover:border-gold-400"
                    >
                      <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=80" className="w-full h-full object-cover" alt="" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: ETIQUETAS */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block border-b border-white/10 pb-2">Etiquetas</span>
                
                <div>
                  <label className="block text-xs text-white/60 mb-1">Listado (Separadas por comas)</label>
                  <input
                    type="text"
                    value={editTagsText}
                    onChange={(e) => setEditTagsText(e.target.value)}
                    placeholder="Soberanía, Geopolítica, Cono Sur"
                    className="w-full text-xs p-2.5 bg-white/5 rounded border border-white/10 text-white placeholder-white/20 focus:outline-none focus:bg-white/10"
                  />
                </div>
              </div>

              {/* Card 4: ACTION ACCORDIONS based on screen layout */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 shadow-xl space-y-2">
                <button
                  type="button"
                  onClick={() => handleSaveArticle('draft')}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-serif font-bold rounded-md cursor-pointer transition-colors uppercase tracking-wider block text-center"
                >
                  Guardar Borrador
                </button>
                
                {currentUser.role === 'admin' || currentUser.role === 'editor' ? (
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('published')}
                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-white text-xs font-serif font-bold rounded-md cursor-pointer transition-colors uppercase tracking-wider block text-center shadow-md border border-transparent"
                  >
                    Publicar Ahora
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveArticle('review')}
                    className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-white text-xs font-serif font-bold rounded-md cursor-pointer transition-colors uppercase tracking-wider block text-center border border-transparent"
                  >
                    Enviar a Revisión
                  </button>
                )}
              </div>

            </aside>

          </div>
        )}

        {/* ======================= VIEW D: MI PERFIL / PROFILE SETTINGS ======================= */}
        {activeSegment === 'profile' && (
          <div className="space-y-8 max-w-4xl">
            <div className="bg-[#0A192F]/20 text-white p-6 sm:p-8 rounded-lg border border-white/10 backdrop-blur-md">
              <h3 className="font-serif text-xl font-bold text-gold-300 uppercase tracking-wide border-b border-white/10 pb-4 mb-6">
                Configuración del Perfil Profesional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Column 1: Profile picture card */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-36 h-36 rounded-full border-2 border-gold-400 overflow-hidden bg-black/40">
                    <img 
                      src={sessionUser.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300"} 
                      className="w-full h-full object-cover" 
                      alt="Avatar de Usuario" 
                    />
                  </div>
                  
                  <div className="w-full text-center">
                    <label className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md">
                      <Upload className="w-4 h-4 mr-2 text-gold-300" />
                      SUBIR FOTO DE PERFIL
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append("avatar", file);
                          
                          try {
                            triggerToast("Subiendo foto de perfil...", "success");
                            const res = await fetch("/api/upload/avatar", {
                              method: "POST",
                              body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                              // Perform intermediate profile update
                              const updatedUserResponse = await fetch(`/api/users/${sessionUser.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: sessionUser.name,
                                  bio: sessionUser.bio,
                                  avatar: data.url
                                })
                              });
                              const updatedData = await updatedUserResponse.json();
                              if (updatedData.success) {
                                setSessionUser(updatedData.user);
                                localStorage.setItem('columna_publica_session', JSON.stringify(updatedData.user));
                                triggerToast("Foto de perfil actualizada con éxito.", "success");
                              } else {
                                triggerToast("No se pudo persistir la foto de perfil en el servidor.", "error");
                              }
                            } else {
                              triggerToast(data.message || "Error al procesar la foto de perfil.", "error");
                            }
                          } catch (err) {
                            triggerToast("Error de conexión al cargar avatar.", "error");
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-white/40 mt-2">Formatos: JPG, PNG o WebP. Se guardará en la carpeta de avatares.</p>
                  </div>
                </div>

                {/* Column 2: Personal details form */}
                <div className="md:col-span-2 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Nombre Profesional</label>
                    <input
                      type="text"
                      value={sessionUser.name}
                      onChange={(e) => setSessionUser({ ...sessionUser, name: e.target.value })}
                      className="w-full text-xs p-3 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Biografía o Reseña de Autor</label>
                    <textarea
                      rows={4}
                      value={sessionUser.bio}
                      onChange={(e) => setSessionUser({ ...sessionUser, bio: e.target.value })}
                      className="w-full text-xs p-3 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans leading-relaxed"
                      placeholder="Redacte su trayectoria profesional..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!sessionUser.name.trim()) {
                          triggerToast("El nombre del profesional es obligatorio.", "error");
                          return;
                        }
                        try {
                          triggerToast("Guardando cambios en perfil...", "success");
                          const res = await fetch(`/api/users/${sessionUser.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: sessionUser.name,
                              bio: sessionUser.bio,
                              avatar: sessionUser.avatar
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setSessionUser(data.user);
                            localStorage.setItem('columna_publica_session', JSON.stringify(data.user));
                            triggerToast("Perfil actualizado correctamente.", "success");
                          } else {
                            triggerToast(data.message || "Error al actualizar perfil.", "error");
                          }
                        } catch (err) {
                          triggerToast("Error de red al actualizar perfil.", "error");
                        }
                      }}
                      className="bg-gold-500 hover:bg-gold-400 text-white font-serif font-bold text-xs py-2.5 px-6 rounded-md transition-all cursor-pointer uppercase tracking-wider inline-flex items-center"
                    >
                      <Check className="w-4 h-4 mr-2" /> Guardar Cambios en Perfil
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================= VIEW E: GESTIÓN DE CONFIGURACIÓN / CMS SETTINGS ======================= */}
        {activeSegment === 'settings' && currentUser.role === 'admin' && siteSettings && (
          <div className="space-y-8 max-w-4xl animate-fadeIn text-white">
            <div className="bg-[#0A192F]/20 text-white p-6 sm:p-8 rounded-lg border border-white/10 backdrop-blur-md space-y-6">
              
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-serif text-xl font-bold text-gold-300 uppercase tracking-wide">
                  ⚙️ Sistema de Autogestión CMS (Estilo WordPress)
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Administre los metadatos de identidad del portal, configure la maquetación inicial por defecto, active o desactive complementos estéticos en tiempo real.
                </p>
              </div>

              {/* Grid 1: Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Nombre Principal del Portal (Site Title)</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="w-full text-xs p-3 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans"
                    placeholder="Columna Pública"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Subtítulo o Lema Publicitario (Slogan)</label>
                  <input
                    type="text"
                    value={siteSettings.siteSubtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteSubtitle: e.target.value })}
                    className="w-full text-xs p-3 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans"
                    placeholder="Asuntos Políticos, Macroeconomía e Inserción Global"
                  />
                </div>
              </div>

              {/* Grid 2: Alert ticker */}
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Cables del Ticker de Alerta Editorial (Boletín)</label>
                <input
                  type="text"
                  value={siteSettings.alertBannerText}
                  onChange={(e) => setSiteSettings({ ...siteSettings, alertBannerText: e.target.value })}
                  className="w-full text-xs p-3 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans italic"
                  placeholder="Escriba un boletín o alerta urgente..."
                />
                <p className="text-[10px] text-white/40 mt-1.5 font-sans">Aparecerá como una franja destacada brillante en la parte superior del portal principal.</p>
              </div>

              {/* Grid 3: Layout configuration */}
              <div className="bg-white/5 p-5 rounded-lg border border-white/5">
                <span className="block text-xs font-bold text-gold-300 uppercase tracking-wide mb-3">Estilo de Plantilla de Inicio (Grid Layout)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${siteSettings.heroLayout === 'editorial' ? 'bg-gold-500/10 border-gold-300 text-gold-200' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <input
                      type="radio"
                      name="siteLayout"
                      value="editorial"
                      checked={siteSettings.heroLayout === 'editorial'}
                      onChange={() => setSiteSettings({ ...siteSettings, heroLayout: 'editorial' })}
                      className="sr-only"
                    />
                    <span className="block font-serif font-bold text-sm">📰 Bento Editorial</span>
                    <span className="block text-[10px] text-white/50 mt-1 leading-normal font-sans">Layout asimétrico premium con gran bloque destacado a la izquierda y barra con widgets a la derecha.</span>
                  </label>

                  <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${siteSettings.heroLayout === 'classic' ? 'bg-gold-500/10 border-gold-300 text-gold-200' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <input
                      type="radio"
                      name="siteLayout"
                      value="classic"
                      checked={siteSettings.heroLayout === 'classic'}
                      onChange={() => setSiteSettings({ ...siteSettings, heroLayout: 'classic' })}
                      className="sr-only"
                    />
                    <span className="block font-serif font-bold text-sm">📜 Índices Clásicos</span>
                    <span className="block text-[10px] text-white/50 mt-1 leading-normal font-sans">Filas amplias y horizontales ordenadas cronológicamente con avatares de autor y descripciones extendidas.</span>
                  </label>

                  <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${siteSettings.heroLayout === 'dense' ? 'bg-gold-500/10 border-gold-300 text-gold-200' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                    <input
                      type="radio"
                      name="siteLayout"
                      value="dense"
                      checked={siteSettings.heroLayout === 'dense'}
                      onChange={() => setSiteSettings({ ...siteSettings, heroLayout: 'dense' })}
                      className="sr-only"
                    />
                    <span className="block font-serif font-bold text-sm">⚡ Compacto de Cables</span>
                    <span className="block text-[10px] text-white/50 mt-1 leading-normal font-sans">Listado rápido de cables, horas de asimilación y widgets de opinión optimizado para lectura instantánea móvil.</span>
                  </label>
                </div>
              </div>

              {/* Grid 4: Component / Modules switches */}
              <div className="bg-white/5 p-5 rounded-lg border border-white/5 space-y-4">
                <span className="block text-xs font-bold text-gold-300 uppercase tracking-wide border-b border-white/5 pb-2">Habilitación de Componentes del Portal (Wordpress-like Switcher)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  {/* Switch 1 */}
                  <div className="flex items-center justify-between p-3 bg-[#050B14]/40 rounded border border-white/10">
                    <div>
                      <span className="block font-bold">Página Informativa "Sobre Nosotros"</span>
                      <span className="block text-[10px] text-white/40">Mostrar biografía corporativa en el navbar y pie de página.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteSettings({ ...siteSettings, enableAboutPage: !siteSettings.enableAboutPage })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings.enableAboutPage ? 'bg-gold-500' : 'bg-white/20'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings.enableAboutPage ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Switch 2 */}
                  <div className="flex items-center justify-between p-3 bg-[#050B14]/40 rounded border border-white/10">
                    <div>
                      <span className="block font-bold">Bloque de Ticker Superior Dinámico</span>
                      <span className="block text-[10px] text-white/40">Activar carrusel o ticker del boletín editorial en la portada.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteSettings({ ...siteSettings, enableDynamicTicker: !siteSettings.enableDynamicTicker })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings.enableDynamicTicker ? 'bg-gold-500' : 'bg-white/20'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings.enableDynamicTicker ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Switch 3 */}
                  <div className="flex items-center justify-between p-3 bg-[#050B14]/40 rounded border border-white/10">
                    <div>
                      <span className="block font-bold">Asistente Editorial Copiloto (Gemini AI)</span>
                      <span className="block text-[10px] text-white/40 font-sans">Permitir a los columnistas utilizar inteligencia artificial al redactar.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteSettings({ ...siteSettings, enableAiAssistant: !siteSettings.enableAiAssistant })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings.enableAiAssistant ? 'bg-gold-500' : 'bg-white/20'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings.enableAiAssistant ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Switch 4 */}
                  <div className="flex items-center justify-between p-3 bg-[#050B14]/40 rounded border border-white/10">
                    <div>
                      <span className="block font-bold">Habilitar Sidebar Lateral Derecha</span>
                      <span className="block text-[10px] text-white/40 font-sans">Habilitar widgets de tendencias y opinión en portada.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteSettings({ ...siteSettings, enableColumnistSidebar: !siteSettings.enableColumnistSidebar })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings.enableColumnistSidebar ? 'bg-gold-500' : 'bg-white/20'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings.enableColumnistSidebar ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save layout buttons */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="bg-gold-500 hover:bg-gold-400 text-white font-serif font-bold text-xs py-3 px-8 rounded-md transition-all cursor-pointer shadow-lg uppercase tracking-wider inline-flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" /> Guardar Ajustes del CMS
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================= VIEW F: GESTIÓN DE COLUMNISTAS / USER ROLES ======================= */}
        {activeSegment === 'users' && currentUser.role === 'admin' && (
          <div className="space-y-6 max-w-5xl animate-fadeIn text-white">
            <div className="bg-[#0A192F]/20 text-white p-6 rounded-lg border border-white/10 backdrop-blur-md">
              <div className="border-b border-white/10 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gold-300 uppercase tracking-wide">
                    👥 Gestión de Columnistas y Seguridad de Acceso
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Controles de administración general. Modifique perfiles de columnistas, administre privilegios, suspenda temporalmente accesos o elimine registros de forma definitiva de la base de datos.
                  </p>
                </div>
                {/* Demo Filter checkbox */}
                <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 self-start md:self-auto">
                  <input
                    type="checkbox"
                    id="hide-demo-checkbox"
                    checked={hideDemoUsers}
                    onChange={(e) => setHideDemoUsers(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-gold-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="hide-demo-checkbox" className="text-xs text-gold-400 font-medium cursor-pointer select-none">
                    Ocultar Usuarios "DEMO"
                  </label>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-lg">
                <div className="bg-[#0c2340] text-gold-300 p-4 font-serif text-xs font-bold tracking-wider uppercase grid grid-cols-12 gap-2 border-b border-white/10">
                  <span className="col-span-4 md:col-span-4">Columnista / Autor</span>
                  <span className="col-span-4 md:col-span-4">Trayectoria</span>
                  <span className="col-span-2 text-center">Estado</span>
                  <span className="col-span-2 text-right">Acciones de Control</span>
                </div>

                <div className="divide-y divide-white/10">
                  {allUsers.filter(u => !hideDemoUsers || !u.isDemo).length === 0 ? (
                    <div className="p-10 text-center text-xs text-white/50">
                      {allUsers.length === 0 ? "Cargando la nómina de columnistas..." : "Ningún columnista coincide con los filtros aplicados."}
                    </div>
                  ) : (
                    allUsers
                      .filter(u => !hideDemoUsers || !u.isDemo)
                      .map((u) => {
                      const isSelf = u.id === currentUser.id;
                      return (
                        <div key={u.id} className={`p-4 grid grid-cols-12 gap-2 items-center text-xs text-white/90 hover:bg-white/5 transition-all ${u.blocked ? 'bg-red-950/10 opacity-75' : ''}`}>
                          {/* Member card details */}
                          <div className="col-span-4 md:col-span-4 flex items-center space-x-3">
                            <div className="relative">
                              <img 
                                src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                                className={`w-10 h-10 rounded-full object-cover border-2 ${u.blocked ? 'border-red-500' : 'border-gold-400'}`} 
                                alt="" 
                              />
                              {u.blocked && (
                                <span className="absolute -bottom-1 -right-1 bg-red-600 text-white p-0.5 rounded-full" title="Cuenta Bloqueada">
                                  <Lock className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-white truncate block">{u.name}</span>
                                {isSelf && (
                                  <span className="bg-gold-500/20 text-gold-300 text-[9px] px-1.5 py-0.2 rounded border border-gold-500/30 font-bold font-mono">YO</span>
                                )}
                              </div>
                              <span className="text-[10px] text-white/50 block font-mono truncate">{u.email}</span>
                              <div className="mt-1">
                                {u.role === 'admin' ? (
                                  <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded">👑 Admin</span>
                                ) : u.role === 'editor' ? (
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded">👓 Editor</span>
                                ) : (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded">✒️ Columnista</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bio review */}
                          <div className="col-span-4 md:col-span-4 text-white/70 italic pr-4">
                            <p className="line-clamp-2 leading-relaxed text-[11px] font-serif">
                              "{u.bio || "Este autor no ha especificado su trayectoria pública aún."}"
                            </p>
                          </div>

                          {/* Estado column with toggle */}
                          <div className="col-span-2 text-center">
                            {u.blocked ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/60 text-red-400 border border-red-900/60">
                                🚫 Bloqueado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
                                ✅ Activo
                              </span>
                            )}
                          </div>

                          {/* Actions selector */}
                          <div className="col-span-2 flex items-center justify-end space-x-2">
                            {/* Toggle block action */}
                            {!isSelf && (
                              <button
                                onClick={() => handleToggleBlockUser(u.id, u.name, u.blocked || false)}
                                className={`p-1.5 rounded border transition-all cursor-pointer ${
                                  u.blocked 
                                    ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-400' 
                                    : 'bg-red-950 hover:bg-red-900 border-red-900 text-red-400'
                                }`}
                                title={u.blocked ? "Habilitar Acceso" : "Bloquear Acceso"}
                              >
                                {u.blocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Edit details */}
                            <button
                              onClick={() => startEditingUser(u)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded transition-colors cursor-pointer"
                              title="Editar Perfil y Contraseña"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gold-300" />
                            </button>

                            {/* Delete button */}
                            {!isSelf && u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 bg-red-950/40 hover:bg-red-600 border border-red-900 hover:border-red-500 text-red-400 hover:text-white rounded transition-all cursor-pointer"
                                title="Eliminar definitivamente de la BD"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= MODAL: EDITAR USUARIO / CONTRASEÑA ======================= */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0b172a] border border-white/20 w-full max-w-lg rounded-xl shadow-2xl p-6 text-white space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <h4 className="font-serif text-lg font-bold text-gold-300 uppercase tracking-wide flex items-center">
                  <UserCircle className="w-5 h-5 mr-2 text-gold-400" />
                  Editar Perfil de Columnista
                </h4>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="text-white/40 hover:text-white transition-colors text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Email (Read Only) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                    Correo Electrónico (No modificable)
                  </label>
                  <input 
                    type="text" 
                    value={editingUser.email} 
                    disabled 
                    className="w-full text-xs p-2.5 bg-black/40 border border-white/10 rounded text-white/50 cursor-not-allowed font-mono"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                    Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    value={editUserName} 
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black/50 border border-white/15 rounded text-white focus:outline-none focus:border-gold-300"
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                    URL del Avatar
                  </label>
                  <input 
                    type="text" 
                    value={editUserAvatar} 
                    onChange={(e) => setEditUserAvatar(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black/50 border border-white/15 rounded text-white focus:outline-none focus:border-gold-300 font-mono"
                  />
                </div>

                {/* Bio Trayectoria */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                    Biografía / Trayectoria Pública
                  </label>
                  <textarea 
                    value={editUserBio} 
                    onChange={(e) => setEditUserBio(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 bg-black/50 border border-white/15 rounded text-white focus:outline-none focus:border-gold-300 leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                      Rol Editorial
                    </label>
                    <select
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-black/50 border border-white/15 rounded text-white focus:outline-none focus:border-gold-300 font-mono"
                    >
                      <option value="columnist">✒️ Columnista</option>
                      <option value="editor">👓 Editor</option>
                      <option value="admin">👑 Administrador</option>
                    </select>
                  </div>

                  {/* Acceso Estado */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                      Estado de Acceso
                    </label>
                    <select
                      value={editUserBlocked ? "true" : "false"}
                      onChange={(e) => setEditUserBlocked(e.target.value === "true")}
                      disabled={editingUser.id === currentUser.id}
                      className="w-full text-xs p-2.5 bg-black/50 border border-white/15 rounded text-white focus:outline-none focus:border-gold-300 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="false">✅ Activo</option>
                      <option value="true">🚫 Bloqueado</option>
                    </select>
                  </div>
                </div>

                {/* New Password Option */}
                <div className="pt-2">
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold mb-1">
                    Cambiar Contraseña (Dejar vacío para conservar actual)
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Nueva contraseña de acceso..."
                      value={editUserPassword} 
                      onChange={(e) => setEditUserPassword(e.target.value)}
                      className="w-full text-xs p-2.5 bg-black/50 border border-white/15 rounded text-white focus:outline-none focus:border-gold-300 pl-9 font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Modal footer actions */}
              <div className="border-t border-white/10 pt-4 flex gap-2 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUserSubmit}
                  className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-white font-bold rounded shadow transition-all cursor-pointer flex items-center"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
