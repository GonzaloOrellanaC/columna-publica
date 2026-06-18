import React, { useState, useEffect } from "react";
import { Article, Comment, User, SiteSettings } from "../types";
import { ArrowLeft, MessageSquare, Send, Calendar, Eye, Bookmark, Share2, Clipboard, Twitter, Facebook, ExternalLink } from "lucide-react";

interface DetailViewProps {
  articleId: string;
  onBack: () => void;
  settings: SiteSettings;
  currentUser: User | null;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ articleId, onBack, settings, currentUser, triggerToast }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for new comment
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentEmail, setNewCommentEmail] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [submitCommentLoading, setSubmitCommentLoading] = useState(false);

  // Fetch article state and comments list
  const fetchArticleDetails = async () => {
    try {
      const artRes = await fetch(`/api/articles/${articleId}`);
      const artData = await artRes.json();
      if (artData.success) {
        setArticle(artData.article);
      }

      const commRes = await fetch(`/api/articles/${articleId}/comments`);
      const commData = await commRes.json();
      if (commData.success) {
        setComments(commData.comments);
      }
    } catch (e: any) {
      console.error("Error reading article details", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleDetails();
  }, [articleId]);

  // Handle Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName || !newCommentEmail || !newCommentContent) {
      triggerToast("Por favor complete todos los campos requeridos.", "error");
      return;
    }

    setSubmitCommentLoading(true);
    try {
      const payload = {
        authorName: newCommentName,
        authorEmail: newCommentEmail,
        content: newCommentContent
      };
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Su comentario ha sido publicado exitosamente.", "success");
        setNewCommentContent("");
        // Autofill name details for subsequent comments
        fetchArticleDetails();
      } else {
        triggerToast("Fallo la publicación: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión al enviar comentario.", "error");
    } finally {
      setSubmitCommentLoading(false);
    }
  };

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (currentUser) {
      setNewCommentName(currentUser.name);
      setNewCommentEmail(currentUser.email);
    }
  }, [currentUser]);

  // Mock Copy Link helper
  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    triggerToast("Enlace de columna copiado al portapapeles.", "success");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dfba53] mx-auto"></div>
        <p className="text-xs font-mono text-slate-400">Recuperando manuscrito editorial...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <p className="text-sm font-mono text-red-400">El artículo solicitado no existe o se encuentra desvinculado.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al portal</span>
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-6 md:px-12 py-8 space-y-8 font-sans">
      
      {/* Back to feed portal */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-mono text-slate-400 hover:text-[#dfba53] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retornar a Editoriales</span>
      </button>

      {/* Article Category & Title metadata panel */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#dfba53]">
          <span className="px-2.5 py-0.5 bg-[#dfba53]/10 border border-[#dfba53]/25 uppercase tracking-wider text-[10px] rounded">
            {article.category}
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(article.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center space-x-1 text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{article.views} Lecturas oficiales</span>
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-white leading-tight">
          {article.title}
        </h1>

        <p className="font-serif text-slate-300 text-sm md:text-lg italic leading-relaxed border-l-2 border-[#dfba53]/40 pl-4 py-1">
          {article.subtitle}
        </p>
      </div>

      {/* Big cover visual element */}
      <div className="rounded-xl overflow-hidden aspect-video relative max-h-[450px]">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
      </div>

      {/* Author Details Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#051122] border border-slate-800 rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <img
            src={article.authorAvatar}
            alt={article.authorName}
            className="w-12 h-12 rounded-full object-cover border border-[#dfba53]/35"
          />
          <div>
            <h4 className="text-sm font-bold text-white leading-tight font-serif">{article.authorName}</h4>
            <p className="text-[10px] uppercase font-mono tracking-wider text-[#dfba53]">Redactor del Consorcio Técnico</p>
          </div>
        </div>

        {/* Share buttons options (controlled via settings toggle) */}
        {settings.enableShareButtons && (
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-500 mr-1 flex items-center"><Share2 className="w-3.5 h-3.5 mr-1" /> Compartir:</span>
            <button
              onClick={handleCopyLink}
              title="Copiar Enlace"
              className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-[#dfba53] rounded"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`, '_blank');
              }}
              title="En Twitter/X"
              className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-400 rounded"
            >
              <Twitter className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Paragraph Body content  */}
      <div className="font-serif text-slate-100 text-sm md:text-base leading-relaxed md:leading-loose whitespace-pre-wrap space-y-6 max-w-none prose prose-invert">
        {article.content}
      </div>

      {/* Vector tags section */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-mono tracking-wider uppercase mr-2">Ejes Temáticos:</span>
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2.5 py-1 bg-slate-950 border border-slate-850 text-[#dfba53] rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments Board Segment (controlled by settings) */}
      {settings.enableComments && (
        <div className="pt-12 border-t border-slate-900 space-y-8">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-[#dfba53]" />
            <h3 className="font-cinzel text-lg font-bold text-white tracking-wider">
              Discusión Técnica ({comments.length})
            </h3>
          </div>

          {/* New Comment Submission Form */}
          <form onSubmit={handleCommentSubmit} className="bg-[#051122] border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold mb-2">
              Añadir Disertación / Contraargumento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej. Dr. Andrés Bello"
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  placeholder="su-correo@ejemplo.cl"
                  value={newCommentEmail}
                  onChange={(e) => setNewCommentEmail(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Comentario Analítico / Acotación *</label>
              <textarea
                placeholder="Escriba su aporte o análisis riguroso..."
                rows={3}
                value={newCommentContent}
                required
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitCommentLoading}
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#dfba53] text-[#030a16] font-bold text-xs rounded-md shadow hover:bg-yellow-400 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitCommentLoading ? "Enviando..." : "Enviar Comentario"}</span>
              </button>
            </div>
          </form>

          {/* List of active comments */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 italic text-center py-6">
                No hay disertaciones oficiales registradas para esta columna. Sea el primero en aportar.
              </p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-slate-950/40 p-5 rounded-lg border border-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-200">{c.authorName}</span>
                    <span className="text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-serif leading-relaxed italic whitespace-pre-line">
                    "{c.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </article>
  );
};
export default DetailView;
