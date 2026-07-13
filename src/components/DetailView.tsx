import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Article, Comment, User, SiteSettings } from "../types";
import { 
  ArrowLeft, MessageSquare, Send, Calendar, Eye, Bookmark, Share2, 
  Clipboard, Facebook, ExternalLink, ThumbsUp, ThumbsDown, 
  UserCheck, UserPlus, CornerDownRight, MessageCircle, LogOut, Pencil, X,
  ShieldAlert, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RichTextRenderer } from "./RichTextRenderer";
import { EditorialTextArea } from "./EditorialTextArea";

interface DetailViewProps {
  articleId: string;
  onBack: () => void;
  settings: SiteSettings;
  currentUser: User | null;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

interface Lector {
  name: string;
  email: string;
  avatarStyle: "diplomatic" | "academic" | "editorial" | "republic";
  verified?: boolean;
}

export const DetailView: React.FC<DetailViewProps> = ({ articleId, onBack, settings, currentUser, triggerToast }) => {
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Administrative article fields inline editor state
  const [editingArticleField, setEditingArticleField] = useState<'title' | 'subtitle' | 'content' | null>(null);
  const [articleFieldValue, setArticleFieldValue] = useState("");
  const [saveArticleLoading, setSaveArticleLoading] = useState(false);

  const startEditingArticleField = (field: 'title' | 'subtitle' | 'content', currentValue: string) => {
    setEditingArticleField(field);
    setArticleFieldValue(currentValue);
  };

  const saveArticleField = async () => {
    if (!editingArticleField || !article || !triggerToast) return;
    setSaveArticleLoading(true);
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [editingArticleField]: articleFieldValue
        })
      });
      const data = await res.json();
      if (data.success) {
        setArticle(data.article);
        triggerToast(`Artículo actualizado correctamente.`, "success");
        setEditingArticleField(null);
      } else {
        triggerToast("No se pudo actualizar el artículo.", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al actualizar el artículo.", "error");
    } finally {
      setSaveArticleLoading(false);
    }
  };

  // Reader Inscription State
  const [registeredReader, setRegisteredReader] = useState<Lector | null>(null);
  
  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regStyle, setRegStyle] = useState<Lector["avatarStyle"]>("diplomatic");
  const [showRegForm, setShowRegForm] = useState(false);

  // Email Validation States for Readers
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [sandboxCode, setSandboxCode] = useState("");
  const [tempLector, setTempLector] = useState<Lector | null>(null);

  // Column Assessment (Likes/Dislikes) State
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);

  // Threaded Discussion reply manager
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitReplyLoading, setSubmitReplyLoading] = useState(false);

  // Form State for new top-level comment
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentEmail, setNewCommentEmail] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [submitCommentLoading, setSubmitCommentLoading] = useState(false);

  // Load registered reader & evaluation score from localStorage
  useEffect(() => {
    // 1. Reader registration check
    const savedLector = localStorage.getItem("columna_publica_lector");
    if (savedLector) {
      try {
        const parsed = JSON.parse(savedLector);
        setRegisteredReader(parsed);
      } catch (e) {
        console.warn("Error parsing reader profile", e);
      }
    }

    // 2. Las reacciones iniciales parten en cero, incrementándose con el voto real del usuario
    const seedLikes = 0;
    const seedDislikes = 0;

    // Check if user already loaded ratings or customized vote for this article
    const localVoteKey = `vote_${articleId}`;
    const savedVote = localStorage.getItem(localVoteKey) as "like" | "dislike" | null;
    setUserVote(savedVote);

    // Apply incremental offsets to counts
    let activeLikes = seedLikes;
    let activeDislikes = seedDislikes;
    if (savedVote === "like") activeLikes += 1;
    if (savedVote === "dislike") activeDislikes += 1;

    setLikesCount(activeLikes);
    setDislikesCount(activeDislikes);
  }, [articleId]);

  // Sync comment names with identity
  useEffect(() => {
    if (currentUser) {
      setNewCommentName(currentUser.name);
      setNewCommentEmail(currentUser.email);
    } else if (registeredReader) {
      setNewCommentName(registeredReader.name);
      setNewCommentEmail(registeredReader.email);
    } else {
      setNewCommentName("");
      setNewCommentEmail("");
    }
  }, [currentUser, registeredReader]);

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

    if (!currentUser && (!registeredReader || !registeredReader.verified)) {
      triggerToast("Para comentar, debe estar inscrito y verificado como Lector Oficial por correo.", "error");
      setShowRegForm(true);
      if (registeredReader && !registeredReader.verified) {
        setIsVerifying(true);
        setTempLector(registeredReader);
      }
      setTimeout(() => {
        const regEl = document.getElementById("lector-inscription-card");
        if (regEl) {
          regEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return;
    }

    setSubmitCommentLoading(true);
    try {
      const payload = {
        authorName: newCommentName,
        authorEmail: newCommentEmail.toLowerCase().trim(),
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

  // Evaluation Actions: Like / Dislike
  const handleEvaluationVote = (voteType: "like" | "dislike") => {
    if (!currentUser && (!registeredReader || !registeredReader.verified)) {
      if (registeredReader && !registeredReader.verified) {
        triggerToast("Su cuenta de lector aún no se ha verificado. Ingrese el código enviado a su correo.", "info");
        setShowRegForm(true);
        setIsVerifying(true);
        setTempLector(registeredReader);
      } else {
        triggerToast("Debe inscribirse y verificar su correo como Lector Oficial para registrar su voto.", "info");
        setShowRegForm(true);
      }
      setTimeout(() => {
        const regEl = document.getElementById("lector-inscription-card");
        if (regEl) {
          regEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return;
    }

    const localVoteKey = `vote_${articleId}`;
    if (userVote === voteType) {
      // Toggle off
      localStorage.removeItem(localVoteKey);
      setUserVote(null);
      if (voteType === "like") {
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        setDislikesCount(prev => Math.max(0, prev - 1));
      }
      triggerToast("Ha retirado su voto de evaluación.", "info");
    } else {
      // Toggle on or switch
      localStorage.setItem(localVoteKey, voteType);
      if (userVote === null) {
        if (voteType === "like") {
          setLikesCount(prev => prev + 1);
        } else {
          setDislikesCount(prev => prev + 1);
        }
      } else {
        // Switched vote
        if (voteType === "like") {
          setLikesCount(prev => prev + 1);
          setDislikesCount(prev => Math.max(0, prev - 1));
        } else {
          setDislikesCount(prev => prev + 1);
          setLikesCount(prev => Math.max(0, prev - 1));
        }
      }
      setUserVote(voteType);
      triggerToast(
        voteType === "like" 
          ? "¡Concuerda con la columna! Voto de aprobación guardado." 
          : "¡Disiente de la columna! Voto de discrepancia de opinión guardado.", 
        "success"
      );
    }
  };

  // Lector Registration Actions (Submit registration form to dispatch email)
  const handleLectorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      triggerToast("Por favor, ingrese un nombre y correo electrónico válidos.", "error");
      return;
    }

    setVerificationLoading(true);
    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        style: regStyle
      };

      const res = await fetch("/api/auth/reader/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTempLector({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          avatarStyle: regStyle
        });
        setIsVerifying(true);
        if (data.sandboxCode) {
          setSandboxCode(data.sandboxCode);
        }
        triggerToast("Código secreto de validación despachado a su bandeja.", "success");
      } else {
        triggerToast("Error de registro: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión al iniciar inscripción.", "error");
    } finally {
      setVerificationLoading(false);
    }
  };

  // Submit Code to activate reader profile
  const handleLectorVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      triggerToast("Ingrese el código de validación.", "error");
      return;
    }
    if (!tempLector) return;

    setVerificationLoading(true);
    try {
      const res = await fetch("/api/auth/reader/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempLector.email,
          code: verificationCode.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        const validatedLector: Lector = {
          ...tempLector,
          verified: true
        };
        localStorage.setItem("columna_publica_lector", JSON.stringify(validatedLector));
        setRegisteredReader(validatedLector);
        setNewCommentName(validatedLector.name);
        setNewCommentEmail(validatedLector.email);
        triggerToast(`¡Validación exitosa! Bienvenido al foro como Lector Oficial, ${validatedLector.name}.`, "success");
        
        // Reset flows
        setIsVerifying(false);
        setShowRegForm(false);
        setTempLector(null);
        setVerificationCode("");
        setSandboxCode("");
      } else {
        triggerToast(data.message || "Código incorrecto.", "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión al validar código.", "error");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleLectorLogOut = () => {
    localStorage.removeItem("columna_publica_lector");
    setRegisteredReader(null);
    setRegName("");
    setRegEmail("");
    setNewCommentName("");
    setNewCommentEmail("");
    setTempLector(null);
    setIsVerifying(false);
    setVerificationCode("");
    setSandboxCode("");
    triggerToast("Se ha cerrado la sesión del lector.", "info");
  };

  // Inline comment replying
  const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      triggerToast("El comentario no puede estar vacío.", "error");
      return;
    }

    if (!currentUser && (!registeredReader || !registeredReader.verified)) {
      triggerToast("Para responder, debe estar inscrito y verificado como Lector Oficial por correo.", "error");
      setShowRegForm(true);
      if (registeredReader && !registeredReader.verified) {
        setIsVerifying(true);
        setTempLector(registeredReader);
      }
      setTimeout(() => {
        const regEl = document.getElementById("lector-inscription-card");
        if (regEl) {
          regEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return;
    }

    setSubmitReplyLoading(true);
    try {
      const payload = {
        authorName: newCommentName,
        authorEmail: newCommentEmail,
        content: replyContent.trim(),
        parentId
      };
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Su réplica se ha añadido al hilo de discusión.", "success");
        setReplyContent("");
        setReplyToCommentId(null);
        fetchArticleDetails();
      } else {
        triggerToast("Fallo al registrar réplica: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de red al registrar réplica.", "error");
    } finally {
      setSubmitReplyLoading(false);
    }
  };

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

        <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-white leading-tight flex flex-wrap items-center gap-3 group/arttitle">
          <span>{article.title}</span>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => startEditingArticleField('title', article.title || '')}
              className="opacity-70 hover:opacity-100 p-1.5 rounded-full border border-slate-850 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] text-[#dfba53] transition-all cursor-pointer inline-flex items-center"
              title="Editar título del manuscrito"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </h1>

        <div className="font-serif text-slate-300 text-sm md:text-lg italic leading-relaxed border-l-2 border-[#dfba53]/40 pl-4 py-1 flex flex-wrap items-center gap-3 group/artsub">
          <span>{article.subtitle}</span>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => startEditingArticleField('subtitle', article.subtitle || '')}
              className="opacity-70 hover:opacity-100 p-1 rounded-full border border-slate-850 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] text-[#dfba53] transition-all cursor-pointer inline-flex items-center text-xs"
              title="Editar bajada del manuscrito"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 mr-1 flex items-center"><Share2 className="w-3.5 h-3.5 mr-1" /> Compartir:</span>
            <button
              onClick={handleCopyLink}
              title="Copiar Enlace"
              className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-[#dfba53] hover:border-[#dfba53]/50 rounded transition-all cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
              }}
              title="Compartir en Facebook"
              className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-550/50 rounded transition-all cursor-pointer"
            >
              <Facebook className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`, '_blank');
              }}
              title="Compartir en WhatsApp"
              className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-550/50 rounded transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank');
              }}
              title="Compartir en Telegram"
              className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-500 hover:border-sky-550/50 rounded transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Paragraph Body content  */}
      <div className="relative font-serif text-slate-100 text-sm md:text-base leading-relaxed md:leading-loose space-y-6 max-w-none prose prose-invert group/artcontent border border-transparent hover:border-slate-800/40 p-4 rounded-xl transition-all">
        {currentUser?.role === 'admin' && (
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => startEditingArticleField('content', article.content || '')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-[#dfba53] hover:text-[#030a16] hover:border-[#dfba53] text-[#dfba53] transition-all text-[11px] cursor-pointer font-bold font-mono"
              title="Editar cuerpo del manuscrito"
            >
              <Pencil className="w-3 h-3" />
              <span>Editar Contenido</span>
            </button>
          </div>
        )}
        <RichTextRenderer content={article.content} />
      </div>

      {/* Interactive Column Evaluation Deck */}
      <div className="py-6 my-4 border-t border-b border-dashed border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfba53] block">Evaluación de Lectores</span>
          <h3 className="font-serif text-base font-bold text-white leading-tight">¿Qué posición adopta frente a este análisis?</h3>
          <p className="text-xs text-slate-400">Registre su postura para alimentar la métrica de balance editorial.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEvaluationVote("like")}
            className={`inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              userVote === "like"
                ? "bg-[#dfba53]/15 text-[#dfba53] border-[#dfba53]/45 shadow-[0_0_12px_rgba(223,186,83,0.15)] font-bold scale-[1.02]"
                : "bg-slate-950 border-slate-850 text-slate-300 hover:text-[#dfba53]"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === "like" ? "fill-current" : ""}`} />
            <span>En Acuerdo</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${userVote === "like" ? "bg-[#dfba53]/25" : "bg-slate-900 border border-slate-800"}`}>
              {likesCount}
            </span>
          </button>

          <button
            onClick={() => handleEvaluationVote("dislike")}
            className={`inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              userVote === "dislike"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/45 shadow-[0_0_12px_rgba(244,63,94,0.15)] font-bold scale-[1.02]"
                : "bg-slate-950 border-slate-850 text-slate-300 hover:text-rose-400"
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === "dislike" ? "fill-current" : ""}`} />
            <span>En Desacuerdo</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${userVote === "dislike" ? "bg-rose-500/25" : "bg-slate-900 border border-slate-800"}`}>
              {dislikesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Vector tags section */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2">
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

      {/* Reader Inscription Banner / Portal Card */}
      <div id="lector-inscription-card" className="p-5 rounded-xl border transition-all duration-300 bg-[#051122]/60 border-slate-800">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#dfba53]/15 border border-[#dfba53]/35 flex items-center justify-center text-[#dfba53] font-serif font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono bg-[#dfba53]/15 border border-[#dfba53]/25 px-2 py-0.5 text-[#dfba53] rounded">
                  {currentUser.role === "admin" ? "Administrador" : currentUser.role === "editor" ? "Editor" : "Columnista Autorizado"}
                </span>
                <h4 className="text-xs font-bold font-serif text-white mt-1">{currentUser.name}</h4>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 italic">Identidad de Escritura Activa</p>
          </div>
        ) : (registeredReader && registeredReader.verified) ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-slate-950 text-sm ${
                registeredReader.avatarStyle === "diplomatic" ? "bg-[#dfba53]" :
                registeredReader.avatarStyle === "academic" ? "bg-blue-400" :
                registeredReader.avatarStyle === "editorial" ? "bg-slate-350" : "bg-rose-400"
              }`}>
                {registeredReader.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] uppercase font-mono bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-emerald-400 rounded flex items-center">
                    <UserCheck className="w-2.5 h-2.5 mr-0.5" /> Lector Oficial Verificado
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{registeredReader.email}</span>
                </div>
                <h4 className="text-xs font-bold font-serif text-white mt-1">{registeredReader.name}</h4>
              </div>
            </div>
            <button
              onClick={handleLectorLogOut}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 font-mono text-xs rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : isVerifying ? (
          <div className="space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <span className="text-[9px] uppercase font-mono bg-yellow-500/15 border border-yellow-500/25 px-2 py-0.5 text-yellow-400 rounded">
                Validación por Correo Electrónico Requerida
              </span>
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white mt-2">Ingrese su Código de Activación</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Hemos despachado un código secreto a <strong className="text-slate-100">{tempLector?.email || registeredReader?.email}</strong>. Para activar su perfil de lector y poder calificar o comentar, por favor ingréselo abajo.
              </p>
            </div>

            <form onSubmit={handleLectorVerifySubmit} className="space-y-3">
              <div className="max-w-xs">
                <label className="block text-[10px] uppercase font-mono text-slate-450 font-bold mb-1">Código de Validación</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ej. 123456"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  required
                  className="w-full text-center tracking-widest text-lg font-mono p-2.5 bg-slate-950 border border-slate-800 rounded text-[#dfba53] focus:outline-none focus:border-[#dfba53]"
                />
              </div>

              {sandboxCode && (
                <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 mt-2">
                  <span className="font-bold block mb-0.5">🔒 Sandbox de Integración:</span>
                  Su servidor simuló el despacho de correo. Ingrese el siguiente código temporal para validar su cuenta: 
                  <strong className="text-amber-400 select-all font-mono text-sm ml-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{sandboxCode}</strong>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setTempLector(null);
                    setSandboxCode("");
                  }}
                  className="px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400 text-xs rounded font-mono cursor-pointer"
                >
                  Cambiar Correo/Cancelar
                </button>
                <button
                  type="submit"
                  disabled={verificationLoading}
                  className="px-5 py-2 bg-[#dfba53] text-[#030a16] hover:bg-yellow-400 disabled:opacity-50 text-xs font-bold rounded shadow transition-colors font-mono cursor-pointer"
                >
                  {verificationLoading ? "Verificando..." : "Verificar y Activar"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#dfba53]" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white">Inscripción de Lectores con Validación</h4>
              </div>
              <p className="text-[10px] text-slate-400">Suscríbase para opinar, calificar y abrir hilos de debate</p>
            </div>

            {!showRegForm ? (
              <div className="flex flex-col items-center justify-center py-2 text-center space-y-3">
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Para emitir evaluaciones (Likes/Dislikes) o abrir hilos de debate, la ley editorial exige la validación por correo electrónico del usuario lector. Inscríbase en segundos y convalide su código de seguridad.
                </p>
                <button
                  onClick={() => setShowRegForm(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#dfba53]/15 border border-[#dfba53]/35 text-[#dfba53] hover:bg-[#dfba53] hover:text-[#030a16] font-bold text-xs rounded transition-all cursor-pointer font-mono"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Inscribirse como Lector</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleLectorRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      placeholder="Ej. Dr. Sebastián Marín"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      placeholder="marin@ejemplo.cl"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Estilo de Avatar Editorial</label>
                    <select
                      value={regStyle}
                      onChange={e => setRegStyle(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                    >
                      <option value="diplomatic">Corporativo (Oro)</option>
                      <option value="academic">Academia (Azul)</option>
                      <option value="editorial">Prensa (Platino)</option>
                      <option value="republic">Gubernamental (Carmesí)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#dfba53] shrink-0" />
                    <span>Resguardamos sus datos.</span>
                    <button
                      type="button"
                      onClick={() => navigate("/politica-privacidad")}
                      className="text-[#dfba53] hover:text-[#cfa543] underline font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer ml-1 inline-flex items-center space-x-0.5"
                    >
                      <Info className="w-3.5 h-3.5 text-[#dfba53] shrink-0 mr-0.5" />
                      Privacidad
                    </button>
                  </span>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowRegForm(false)}
                      className="px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400 text-xs rounded font-mono cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={verificationLoading}
                      className="px-5 py-2 bg-[#dfba53] text-[#030a16] hover:bg-yellow-400 disabled:opacity-50 text-xs font-bold rounded shadow transition-colors font-mono cursor-pointer"
                    >
                      {verificationLoading ? "Enviando Código..." : "Confirmar Inscripción"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Comments Board Segment (controlled by settings) */}
      {settings.enableComments && (
        <div className="pt-12 border-t border-slate-900 space-y-8">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-[#dfba53]" />
            <h3 className="font-cinzel text-lg font-bold text-white tracking-wider">
              Discusión Crítica ({comments.length})
            </h3>
          </div>

          {/* New Comment Submission Form */}
          <form onSubmit={handleCommentSubmit} className="bg-[#051122] border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#dfba53] font-semibold mb-2 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Añadir Disertación / Contraargumento Inicial
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej. Dr. Andrés Bello"
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  disabled={!!currentUser || !!registeredReader}
                  required
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  placeholder="su-correo@ejemplo.cl"
                  value={newCommentEmail}
                  onChange={(e) => setNewCommentEmail(e.target.value)}
                  disabled={!!currentUser || !!registeredReader}
                  required
                  className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] font-mono disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold mb-1">Comentario Analítico / Acotación *</label>
              <textarea
                placeholder={(!currentUser && !registeredReader) ? "Inscríbase como lector arriba para responder de forma identificada o rellene su nombre..." : "Escriba su aporte o análisis riguroso..."}
                rows={3}
                value={newCommentContent}
                required
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-900/60">
              <div className="flex flex-col space-y-1.5 text-left">
                <p className="text-[10px] text-slate-500 italic max-w-sm">
                  * Para resguardar el tono riguroso, solo se aceptan comentarios fundamentados académicamente.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/politica-privacidad")}
                  className="inline-flex items-center space-x-1 text-[#dfba53] hover:text-[#cfa543] font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer py-1 px-2.5 bg-slate-950 border border-slate-800 rounded hover:bg-slate-900 transition-colors self-start mt-0.5"
                >
                  <Info className="w-3.5 h-3.5 text-[#dfba53]" />
                  <span>Protección de Datos • Info</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={submitCommentLoading}
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#dfba53] text-[#030a16] font-bold text-xs rounded-md shadow hover:bg-yellow-400 cursor-pointer disabled:opacity-50 self-end sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitCommentLoading ? "Enviando..." : "Enviar Comentario"}</span>
              </button>
            </div>
          </form>

          {/* List of active comments mapped inside Discussion Threads (Hilos) */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 italic text-center py-6">
                No hay disertaciones oficiales registradas para esta columna. Sea el primero en aportar.
              </p>
            ) : (
              (() => {
                // Organize comments into parent & replies map
                const parentComments = comments.filter(c => !c.parentId);
                const repliesMap = comments.filter(c => !!c.parentId).reduce((acc, c) => {
                  const pId = c.parentId!;
                  if (!acc[pId]) acc[pId] = [];
                  acc[pId].push(c);
                  return acc;
                }, {} as Record<string, Comment[]>);

                return parentComments.map((comment) => {
                  const replies = repliesMap[comment.id] || [];
                  const isUserAuthor = comment.authorEmail === (currentUser?.email || registeredReader?.email);

                  return (
                    <div key={comment.id} className="border border-slate-900 rounded-xl p-5 bg-slate-950/20 space-y-3">
                      {/* Parent message row header */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#dfba53]">{comment.authorName}</span>
                          {/* Dedicated Badges */}
                          {article.authorName === comment.authorName && (
                            <span className="text-[9px] bg-[#dfba53]/15 text-[#dfba53] border border-[#dfba53]/25 px-1.5 py-0.2 rounded uppercase">
                              Autor de Columna
                            </span>
                          )}
                          {!comment.parentId && isUserAuthor && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                              Usted
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-serif leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      {/* Reply action button */}
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            if (replyToCommentId === comment.id) {
                              setReplyToCommentId(null);
                            } else {
                              setReplyToCommentId(comment.id);
                              setReplyContent("");
                            }
                          }}
                          className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-400 hover:text-[#dfba53] transition-colors cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-[#dfba53]/70" />
                          <span>{replyToCommentId === comment.id ? "Cancelar réplica" : "Formular réplica en hilo"}</span>
                        </button>
                      </div>

                      {/* Reply form integrated dynamically inside the Active Thread */}
                      {replyToCommentId === comment.id && (
                        <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-4 p-4 rounded-lg bg-slate-950 border border-[#dfba53]/20 space-y-3">
                          <div className="flex items-center space-x-1.5 text-[10px] uppercase font-mono text-slate-400">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#dfba53]" />
                            <span>Redactando contraargumento a {comment.authorName}</span>
                          </div>

                          <textarea
                            placeholder="Formule su réplica razonada, asumiendo espíritu analítico..."
                            rows={3}
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            required
                            className="w-full text-xs p-2.5 bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
                          />

                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setReplyToCommentId(null)}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 text-[10px] font-mono rounded cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={submitReplyLoading}
                              className="inline-flex items-center space-x-1 px-4 py-1.5 bg-[#dfba53] text-[#030a16] font-bold text-[10px] font-mono rounded-md shadow hover:bg-yellow-400 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>{submitReplyLoading ? "Enviando..." : "Responder"}</span>
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Cascade Indented Nested Replies timeline */}
                      {replies.length > 0 && (
                        <div className="mt-4 pl-4 md:pl-6 border-l border-dashed border-[#dfba53]/25 space-y-4">
                          {replies.map((reply) => {
                            const isReplyUser = reply.authorEmail === (currentUser?.email || registeredReader?.email);
                            return (
                              <div key={reply.id} className="p-3.5 rounded-lg bg-[#040e1b] border border-slate-900/60 space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-slate-200">{reply.authorName}</span>
                                    {isReplyUser && (
                                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.1 rounded uppercase">
                                        Usted
                                      </span>
                                    )}
                                    {article.authorName === reply.authorName && (
                                      <span className="text-[8px] bg-[#dfba53]/15 text-[#dfba53] border border-[#dfba53]/20 px-1 py-0.1 rounded uppercase">
                                        Autor
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-500">
                                    {new Date(reply.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 font-serif leading-relaxed italic whitespace-pre-wrap">
                                  "{reply.content}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      )}

      {/* Dynamic Article Text Editor Modal for Admins */}
      <AnimatePresence>
        {editingArticleField && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#051122] border border-[#dfba53]/55 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative"
            >
              <button
                onClick={() => setEditingArticleField(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-mono text-xs uppercase text-[#dfba53] tracking-widest font-bold mb-4 flex items-center space-x-2 border-b border-slate-900 pb-2">
                <Pencil className="w-4 h-4 text-[#dfba53]" />
                <span>Editar Manuscrito de Columna ({editingArticleField === 'title' ? 'Título Principal' : editingArticleField === 'subtitle' ? 'Subtítulo / Bajada' : 'Cuerpo Completo'})</span>
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1.5">Contenido Editorial:</label>
                  {editingArticleField === 'content' ? (
                    <EditorialTextArea
                      value={articleFieldValue}
                      onChange={setArticleFieldValue}
                      rows={14}
                      placeholder="Escriba el cuerpo completo del artículo..."
                    />
                  ) : editingArticleField === 'subtitle' ? (
                    <textarea
                      value={articleFieldValue}
                      onChange={(e) => setArticleFieldValue(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-100 p-3 text-xs focus:outline-none focus:border-[#dfba53] font-serif leading-relaxed"
                      placeholder="Escriba el subtítulo o bajada de la columna..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={articleFieldValue}
                      onChange={(e) => setArticleFieldValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-100 p-3 text-xs focus:outline-none focus:border-[#dfba53] font-serif font-bold"
                      placeholder="Escriba el título del manuscrito..."
                    />
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    disabled={saveArticleLoading}
                    onClick={() => setEditingArticleField(null)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-mono text-slate-400 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={saveArticleLoading}
                    onClick={saveArticleField}
                    className="px-4 py-2 bg-[#dfba53] hover:bg-[#cfa543] text-xs font-mono text-[#030a16] font-bold rounded-lg cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {saveArticleLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#030a16]" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Manuscrito</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </article>
  );
};
export default DetailView;
