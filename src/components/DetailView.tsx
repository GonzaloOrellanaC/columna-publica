import React, { useState, useEffect } from 'react';
import { Article, Comment } from '../types';
import { Clock, MessageSquare, ChevronLeft, Calendar, Share2, Twitter, Facebook, Link2, Send, Check } from 'lucide-react';
import { parseSymbolicContent } from '../utils/parser';

interface DetailViewProps {
  articleId: string;
  onBackToHome: () => void;
  onSelectArticle: (articleId: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ articleId, onBackToHome, onSelectArticle }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Leave comment form states
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sibling articles for the Bottom Recommendation carousel
  const [recommendations, setRecommendations] = useState<Article[]>([]);

  // Clipboard share state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchArticleDetails();
  }, [articleId]);

  const fetchArticleDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`);
      const data = await res.json();
      if (data.success) {
        setArticle(data.article);
        
        // Also fetch comments
        const commRes = await fetch(`/api/articles/${articleId}/comments`);
        const commData = await commRes.json();
        if (commData.success) {
          setComments(commData.comments);
        }

        // Fetch recommendations (excluding current)
        const recsRes = await fetch('/api/articles');
        const recsData = await recsRes.json();
        if (recsData.success) {
          const recsList: Article[] = recsData.articles.filter((a: Article) => a.id !== articleId);
          setRecommendations(recsList.slice(0, 3));
        }
      }
    } catch (err) {
      console.error("Error retrieving article details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) {
      setErrorMsg("Nombre y Comentario son obligatorios.");
      return;
    }

    setSubmittingComment(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: commentName,
          authorEmail: commentEmail,
          text: commentText
        })
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setCommentText('');
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 3000);
      } else {
        setErrorMsg(data.message || "Error al enviar comentario.");
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error de red al guardar el comentario.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-gold-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-serif text-white/60">Abriendo columna editorial...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h3 className="font-serif text-xl font-bold text-white">Artículo No Encontrado</h3>
        <p className="text-xs text-white/50 mt-2">La columna solicitada no existe o fue retirada de circulación.</p>
        <button
          onClick={onBackToHome}
          className="mt-6 inline-flex items-center text-xs text-gold-300 font-bold hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Navigation breadcrumb back */}
      <button
        onClick={onBackToHome}
        className="inline-flex items-center text-xs font-serif font-bold text-white/80 hover:text-gold-300 mb-8 transition-colors uppercase tracking-widest cursor-pointer animate-fade-in"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al inicio
      </button>

      {/* Main Grid: Left Column Text & Title, Right Column Sticky Image & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Side: Editorial Headers and Prose Body (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="space-y-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest bg-white/10 text-white border border-white/5 uppercase">
              ARTÍCULO DE {article.category.toUpperCase()}
            </span>
                     <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {article.title}
            </h1>
            
            <p className="text-md sm:text-lg text-white/80 font-sans font-light leading-relaxed italic border-l-2 border-gold-400 pl-4 mt-2">
              {article.subtitle}
            </p>
          </div>

          {/* Author info & date */}
          <div className="flex items-center space-x-4 py-4 border-y border-white/10">
            <img
              src={article.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
              alt={article.authorName}
              className="w-12 h-12 rounded-full object-cover border border-gold-300"
            />
            <div className="flex-grow">
              <span className="text-xs font-mono uppercase tracking-wider text-gold-300 block">Autor Invitado</span>
              <span className="text-sm font-bold text-white block">{article.authorName}</span>
            </div>
            <div className="text-right text-xs text-white/50 font-mono">
              <Calendar className="w-4 h-4 text-white/40 inline mr-1 -mt-0.5" />
              <span>{new Date(article.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Prose Content */}
          <div 
            className="prose-political mt-6"
            dangerouslySetInnerHTML={{ __html: parseSymbolicContent(article.content) }}
          />

          {/* Tags list */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <span className="text-xs font-mono text-white/55 uppercase tracking-widest block mb-2">Descriptores Temáticos:</span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1 bg-white/5 text-white/90 rounded border border-white/10 text-xs font-medium font-sans hover:bg-white/10 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Featured Illustration & Sidebar tools */}
        <div className="space-y-8">
          
          {/* Main Photo with classic political caption */}
          <div className="bg-[#0A192F]/20 border border-white/10 rounded-lg p-4 shadow-xl space-y-3 sticky top-28 backdrop-blur-md">
            <div className="aspect-[4/3] rounded overflow-hidden bg-[#050B14] border border-white/5">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-white/40 leading-normal italic text-center">
              Ilustración editorial representativa para el resguardo de la opinión y debate democrático del portal.
            </p>

            <div className="border-t border-white/5 pt-4 flex items-center justify-around">
              <button 
                onClick={handleShareCopy}
                className="p-2 bg-white/5 hover:bg-gold-500/20 rounded-full text-white hover:text-gold-300 cursor-pointer transition-colors relative border border-white/10"
                title="Copiar Enlace"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] rounded py-1 px-2 border border-white/10 whitespace-nowrap">
                    ¡Copiado!
                  </span>
                )}
              </button>
              
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-sky-300 transition-colors"
                title="Compartir en Twitter/X"
              >
                <Twitter className="w-4 h-4" />
              </a>

              <a 
                href="https://facebook.com"
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-blue-300 transition-colors"
                title="Compartir en Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* 6. Comments Section ("Comentarios" under second screen layout) */}
      <section className="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left comment write zone (col-span-1) */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-serif text-xl font-bold text-white flex items-center">
              <MessageSquare className="w-5 h-5 text-gold-300 mr-2" />
              <span>Opinar en el Foro</span>
            </h3>
            <p className="text-xs text-white/50 mt-1">Los comentarios son moderados para cumplir con altos estándares de probidad.</p>
          </div>

          <form onSubmit={handleCommentSubmit} className="space-y-4 bg-white/5 border border-white/10 rounded-lg p-6 shadow-xl backdrop-blur-md">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Nombre Completo *</label>
              <input
                type="text"
                placeholder="Ej. Dr. Sebastián Figueroa"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full text-xs p-2.5 bg-white/5 rounded border border-white/10 focus:outline-none focus:border-gold-300 focus:bg-white/10 text-white placeholder-white/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Correo Electrónico (Opcional)</label>
              <input
                type="email"
                placeholder="ejemplo@academia.cl (No será público)"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-white/5 rounded border border-white/10 focus:outline-none focus:border-gold-300 focus:bg-white/10 text-white placeholder-white/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Comentario Académico *</label>
              <textarea
                rows={4}
                placeholder="Súmese al debate sustentado en argumentos..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full text-xs p-2.5 bg-white/5 rounded border border-white/10 focus:outline-none focus:border-gold-300 focus:bg-white/10 text-white placeholder-white/30 transition-all"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-300 font-medium bg-red-950/20 p-2 border border-red-500/20 rounded">{errorMsg}</p>
            )}

            {commentSuccess && (
              <p className="text-[11px] text-emerald-300 font-medium bg-emerald-950/20 p-2 border border-emerald-500/20 rounded">Comentario publicado exitosamente.</p>
            )}

            <button
              type="submit"
              disabled={submittingComment}
              className="w-full inline-flex items-center justify-center py-2 px-4 text-xs font-serif font-bold text-white bg-gold-500 hover:bg-gold-400 disabled:bg-white/10 rounded-md hover:shadow-lg cursor-pointer transition-all uppercase tracking-wider border border-transparent"
            >
              <Send className="w-3.5 h-3.5 mr-2" />
              {submittingComment ? "Dando registro..." : "Enviar Comentario"}
            </button>
          </form>
        </div>

        {/* Right comments view timeline (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-white/10 pb-3 flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-white animate-fade-in">Comentarios Disponibles ({comments.length})</h3>
            <span className="text-[10px] font-mono text-gold-300 bg-white/5 border border-white/10 py-1 px-2.5 rounded font-bold uppercase">Lectura Libre</span>
          </div>

          {comments.length === 0 ? (
            <div className="py-12 bg-white/5 rounded-lg border border-white/10 text-center">
              <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/50 italic">No hay comentarios en este momento. Sea el primero en iniciar el debate estratégico.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {comments.map((comm) => (
                <div key={comm.id} className="bg-white/5 border border-white/10 rounded-lg p-5 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 text-gold-300 flex items-center justify-center text-xs font-serif font-bold">
                        {comm.authorName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white">{comm.authorName}</span>
                    </div>
                    <span className="text-[9px] text-white/40 font-mono">
                      {new Date(comm.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed pl-9">
                    {comm.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* BOTTOM RECOMMENDED FOOTER GRID */}
      {recommendations.length > 0 && (
        <section className="mt-16 pt-12 border-t border-white/10">
          <h3 className="font-serif text-xl font-bold text-white mb-6">Otras Lecturas Recomendadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <div 
                key={rec.id}
                onClick={() => onSelectArticle(rec.id)}
                className="bg-white/5 border border-white/10 hover:border-white/20 p-4 rounded-lg shadow-md cursor-pointer group transition-all"
              >
                <div className="aspect-video w-full rounded overflow-hidden bg-[#050B14] mb-3 border border-white/5">
                  <img src={rec.imageUrl} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" referrerPolicy="no-referrer" alt="" />
                </div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-gold-300 uppercase block mb-1">{rec.category}</span>
                <h4 className="font-serif text-sm font-bold text-white group-hover:text-gold-300 transition-colors leading-snug">{rec.title}</h4>
              </div>
            ))}
          </div>
        </section>
      )}

    </article>
  );
};
