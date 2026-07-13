import React, { useState, useEffect } from "react";
import { Article, SiteSettings, ArticleCategory, User } from "../types";
import { Search, ChevronRight, Eye, ShieldAlert, Tag, Grid, List, Compass, Sparkles, X, Clock, MessageSquare, Facebook, Instagram, MessageCircle, Mail, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JoinUsSection } from "./JoinUsSection";

interface HomeViewProps {
  articles: Article[];
  settings: SiteSettings;
  onSelectArticle: (articleId: string) => void;
  isLoading: boolean;
  selectedCategory?: ArticleCategory | "Todo";
  setSelectedCategory?: (category: ArticleCategory | "Todo") => void;
  currentUser?: User | null;
  onUpdateSettings?: (settings: SiteSettings) => void;
  triggerToast?: (msg: string, type: "success" | "error" | "info") => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  settings,
  onSelectArticle,
  isLoading,
  selectedCategory: propCategory,
  setSelectedCategory: propSetCategory,
  currentUser,
  onUpdateSettings,
  triggerToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localCategory, setLocalCategory] = useState<ArticleCategory | "Todo">("Todo");
  const [layoutMode, setLayoutMode] = useState<'bento' | 'newspaper'>('bento');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Direct administrative settings text editing state
  const [editingField, setEditingField] = useState<'siteName' | 'siteSubtitle' | 'alertBannerText' | 'editorialSlogan' | 'facebookUrl' | 'instagramUrl' | 'whatsappUrl' | 'mailContactUrl' | null>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const startEditingField = (field: 'siteName' | 'siteSubtitle' | 'alertBannerText' | 'editorialSlogan' | 'facebookUrl' | 'instagramUrl' | 'whatsappUrl' | 'mailContactUrl', currentValue: string) => {
    setEditingField(field);
    setFieldValue(currentValue);
  };

  const saveSettingField = async () => {
    if (!editingField || !onUpdateSettings || !triggerToast) return;
    setSaveLoading(true);
    try {
      const payload = {
        ...settings,
        [editingField]: fieldValue
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onUpdateSettings(data.settings);
        triggerToast(`¡Texto de la plataforma actualizado!`, "success");
        setEditingField(null);
      } else {
        triggerToast("No se pudo actualizar el texto de la plataforma.", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al guardar los cambios.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Dynamic loader for article comments to match engagement numbers
  useEffect(() => {
    if (!articles || articles.length === 0) return;

    let isMounted = true;
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      try {
        await Promise.all(
          articles.map(async (art) => {
            try {
              const res = await fetch(`/api/articles/${art.id}/comments`);
              const data = await res.json();
              if (data.success && Array.isArray(data.comments)) {
                counts[art.id] = data.comments.length;
              } else {
                counts[art.id] = 0;
              }
            } catch (err) {
              counts[art.id] = 0;
            }
          })
        );
        if (isMounted) {
          setCommentCounts(counts);
        }
      } catch (err) {
        console.warn("Could not load comment counts dynamically:", err);
      }
    };

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [articles]);

  const selectedCategory = propCategory !== undefined ? propCategory : localCategory;
  const setSelectedCategory = propSetCategory !== undefined ? propSetCategory : setLocalCategory;

  // Scroll to selected category when it changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "Todo") {
      const timer = setTimeout(() => {
        const element = document.getElementById(`categoria-${selectedCategory}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory]);

  // Retrieve unique list of tags from published articles
  const allTags = Array.from(
    new Set(articles.flatMap(art => art.tags || []))
  ).slice(0, 10);

  // Retrieve all unique tags from published articles for the sidebar scroller
  const sidebarTags = Array.from(
    new Set(articles.flatMap(art => art.tags || []))
  );

  // Filter tags in the sidebar based on the search query
  const filteredSidebarTags = sidebarTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Compute counts for each tag
  const tagCounts = articles.reduce((acc, art) => {
    (art.tags || []).forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Retrieve the 3 latest absolute publications from the database
  const latestThree = [...articles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Retrieve the latest article for each category
  const latestByCategory = (["Soberanía Global", "Geopolítica Económica", "Análisis", "Opinión"] as const).map(cat => {
    const catArticles = articles.filter(art => art.category === cat);
    const latest = catArticles.length > 0 
      ? [...catArticles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;
    return { category: cat, article: latest };
  });

  // Filter articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "Todo" || art.category === selectedCategory;
    const matchesTag = !selectedTag || art.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Front featured cover article
  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  
  // If we are showing the premium Cover hero layout (Todo, no search filter, no active tag),
  // then we display 1 main article + 3 following ones in the cover section.
  // The standard feed list below should slice from 4 onwards to prevent duplicates!
  const isShowingFrontpageCover = selectedCategory === "Todo" && !selectedTag && searchTerm === "";
  const standardArticles = isShowingFrontpageCover
    ? (featuredArticle ? filteredArticles.slice(4) : filteredArticles)
    : (featuredArticle ? filteredArticles.slice(1) : filteredArticles);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-12">

      {/* Alert Banner / Marquee Boletín */}
      {(settings.alertBannerText || (currentUser && currentUser.role === 'admin')) && (
        <div className="bg-gradient-to-r from-[#041226] to-[#010915] border border-[#dfba53]/20 hover:border-[#dfba53]/45 rounded-xl p-4 flex items-center justify-between text-xs font-mono text-slate-300 gap-4 group/banner transition-all">
          <div className="flex items-center space-x-3 truncate">
            <span className="flex-shrink-0 bg-[#dfba53] text-[#030a16] text-[10px] font-extrabold px-2 py-0.5 rounded tracking-widest animate-pulse">
              BOLETÍN OFICIAL
            </span>
            <span className="font-serif italic text-slate-200 truncate">
              {settings.alertBannerText || "Añadir boletín informativo de debate editorial o última edición de Columna Pública..."}
            </span>
          </div>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => startEditingField('alertBannerText', settings.alertBannerText || '')}
              className="p-1 px-2.5 rounded border border-slate-800 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] hover:border-[#dfba53] text-[#dfba53] flex items-center space-x-1.5 transition-all text-[10px] cursor-pointer font-bold"
              title="Editar Boletín Informativo"
            >
              <Pencil className="w-3 h-3" />
              <span>Editar</span>
            </button>
          )}
        </div>
      )}

      {/* Hero Welcome Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <h2 className="font-cinzel text-3xl md:text-5xl font-extrabold tracking-widest leading-tight text-white flex flex-wrap items-center justify-center gap-3 group/title">
          <span>{settings.siteName || "COLUMNA PÚBLICA"}</span>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => startEditingField('siteName', settings.siteName || '')}
              className="opacity-70 hover:opacity-100 p-1.5 rounded-full border border-slate-800 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] text-[#dfba53] transition-all cursor-pointer inline-flex items-center"
              title="Editar Nombre del Portal"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </h2>
        <div className="h-[2px] w-24 bg-[#dfba53] mx-auto my-2"></div>
        <p className="text-xs md:text-sm font-mono tracking-wider text-[#dfba53] uppercase flex items-center justify-center gap-2 group/subtitle">
          <span>{settings.siteSubtitle || "Asuntos Políticos, Macroeconomía e Inserción Global"}</span>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => startEditingField('siteSubtitle', settings.siteSubtitle || '')}
              className="opacity-70 hover:opacity-100 p-1 rounded-full border border-slate-800 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] text-[#dfba53] transition-all cursor-pointer inline-flex items-center"
              title="Editar Subtítulo del Portal"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </p>
        <p className="text-xs text-slate-400 font-serif leading-relaxed max-w-xl mx-auto italic flex items-center justify-center gap-2 group/slogan">
          <span>"{settings.editorialSlogan || "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas."}"</span>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => startEditingField('editorialSlogan', settings.editorialSlogan || 'Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas.')}
              className="opacity-70 hover:opacity-100 p-1 rounded-full border border-slate-800 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] text-[#dfba53] transition-all cursor-pointer inline-flex items-center"
              title="Editar Slogan de Foro"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </p>
        <div className="flex items-center justify-center space-x-3.5 pt-3">
          <div className="flex items-center space-x-2">
            <a
              href={settings.facebookUrl || "https://www.facebook.com/profile.php?id=61576453450034"}
              target="_blank"
              rel="noopener noreferrer"
              title="Siga en Facebook"
              className="p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-550/40 hover:bg-slate-900 transition-all shadow-md cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
            </a>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => startEditingField('facebookUrl', settings.facebookUrl || "https://www.facebook.com/profile.php?id=61576453450034")}
                className="p-1 rounded bg-slate-950 border border-slate-800 hover:bg-[#dfba53] hover:text-slate-950 text-[#dfba53] text-[9px] font-mono cursor-pointer"
                title="Editar Facebook"
              >
                FB
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={settings.instagramUrl || "https://www.instagram.com/columnapublica/"}
              target="_blank"
              rel="noopener noreferrer"
              title="Siga en Instagram"
              className="p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-pink-500 hover:border-pink-550/40 hover:bg-slate-900 transition-all shadow-md cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
            </a>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => startEditingField('instagramUrl', settings.instagramUrl || "https://www.instagram.com/columnapublica/")}
                className="p-1 rounded bg-slate-950 border border-slate-800 hover:bg-[#dfba53] hover:text-slate-950 text-[#dfba53] text-[9px] font-mono cursor-pointer"
                title="Editar Instagram"
              >
                IG
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={settings.whatsappUrl || "https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q"}
              target="_blank"
              rel="noopener noreferrer"
              title="Canal de WhatsApp de Columna Pública"
              className="p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-550/40 hover:bg-slate-900 transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => startEditingField('whatsappUrl', settings.whatsappUrl || "https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q")}
                className="p-1 rounded bg-slate-950 border border-slate-800 hover:bg-[#dfba53] hover:text-slate-950 text-[#dfba53] text-[9px] font-mono cursor-pointer"
                title="Editar WhatsApp"
              >
                WA
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={settings.mailContactUrl ? (settings.mailContactUrl.includes('@') && !settings.mailContactUrl.startsWith('mailto:') ? `mailto:${settings.mailContactUrl}` : settings.mailContactUrl) : "mailto:contacto@columnapublica.cl"}
              title="Contacto Directo"
              className="p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-[#dfba53] hover:border-[#dfba53]/50 hover:bg-slate-900 transition-all shadow-md cursor-pointer"
            >
              <Mail className="w-4 h-4" />
            </a>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => startEditingField('mailContactUrl', settings.mailContactUrl || "contacto@columnapublica.cl")}
                className="p-1 rounded bg-slate-950 border border-slate-800 hover:bg-[#dfba53] hover:text-slate-950 text-[#dfba53] text-[9px] font-mono cursor-pointer"
                title="Editar Email"
              >
                @
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Interactive Controls & Navigation bar (Escondido en móvil y tablet) */}
      <div className="hidden lg:flex lg:flex-row justify-center items-center bg-[#051122] border border-slate-800 p-4 rounded-xl">
        {/* Search Field spanning beautifully */}
        <div className="relative w-full max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Buscar columna estratégica, autor, opinión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs p-3 pl-10 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-550 focus:outline-none focus:border-[#dfba53] transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Button with a magnifying glass for Smartphone/Tablet (lg:hidden) */}
      <div className="lg:hidden flex justify-center">
        <AnimatePresence mode="wait">
          {!isSearchOpenMobile && (
            <motion.button
              key="search-trigger"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setIsSearchOpenMobile(true)}
              className="flex items-center justify-center space-x-2 w-12 h-12 bg-gradient-to-r from-[#dfba53] to-[#cfa543] text-[#030a16] rounded-full shadow-lg shadow-[#dfba53]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Buscar artículos"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile/Tablet Deployable Search Panel with Motion */}
      <AnimatePresence>
        {isSearchOpenMobile && (
          <motion.div
            key="mobile-search-panel"
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden bg-[#051122] border border-slate-800 p-5 rounded-xl space-y-4 overflow-hidden relative shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="font-mono text-[10px] uppercase text-[#dfba53] font-bold tracking-wider">
                Búsqueda Editorial
              </span>
              {/* Close Button */}
              <button
                onClick={() => setIsSearchOpenMobile(false)}
                className="p-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-[#dfba53] transition-colors cursor-pointer flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">Cerrar</span>
              </button>
            </div>

            {/* Search Field only */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Término de búsqueda:</span>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar columna estratégica o autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs p-2.5 pl-9 bg-slate-950 border border-slate-855 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba53]"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filters display */}
      {selectedTag && (
        <div className="flex items-center space-x-2 bg-[#dfba53]/10 text-[#dfba53] text-xs px-3 py-1.5 border border-[#dfba53]/25 rounded-md inline-block">
          <span className="font-mono">Filtro de Etiqueta: #{selectedTag}</span>
          <button onClick={() => setSelectedTag(null)} className="font-bold hover:text-white ml-2 text-md">×</button>
        </div>
      )}

      {/* Loading Indication */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dfba53] mx-auto"></div>
          <p className="text-xs font-mono text-slate-400">Analizando archivos de debate editorial...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#051122]/50 border border-slate-800 rounded-xl">
          <p className="text-sm font-mono text-[#dfba53]">No se encontraron artículos publicados en esta sección</p>
          <p className="text-xs text-slate-400">Pruebe ajustando los términos de búsqueda o deseleccionando la etiqueta activa.</p>
        </div>
      ) : (
        <>
          {/* HIGH-FREQUENCY FRONTPAGE COVER HERO (Sección de Portada Estilo Prensa Escrita) */}
          {featuredArticle && !selectedTag && selectedCategory === "Todo" && searchTerm === "" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10">
              
              {/* LEFT COLUMN: Featured Article (Portada Principal) */}
              <div 
                onClick={() => onSelectArticle(featuredArticle.id)}
                className="lg:col-span-7 group cursor-pointer bg-gradient-to-br from-[#051122] to-[#040e1b] border border-[#dfba53]/25 hover:border-[#dfba53] rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Aspect Ratio block matching photo's main content photo style */}
                  <div className="relative aspect-video lg:h-[290px] w-full overflow-hidden bg-slate-950 border-b border-[#dfba53]/15">
                    <img
                      src={featuredArticle.imageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800"}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040c18] via-transparent to-transparent opacity-60"></div>
                    <span className="absolute top-4 left-4 inline-flex items-center space-x-1 px-2.5 py-1 bg-[#dfba53] text-[#030a16] text-[9.5px] font-bold tracking-widest rounded uppercase">
                      <Sparkles className="w-3 h-3 text-[#030a16]" />
                      <span>EDITORIAL DESTACADA</span>
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Category & Writer Header */}
                    <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-[#dfba53] uppercase pb-1">
                      <span>{featuredArticle.category}</span>
                      <span>·</span>
                      <span className="text-slate-300">{featuredArticle.authorName}</span>
                    </div>

                    {/* Headline Title Link */}
                    <h3 className="font-serif text-2xl md:text-3xl font-extrabold leading-tight text-white group-hover:text-[#dfba53] transition-colors">
                      {featuredArticle.title}
                    </h3>

                    {/* Hour and Comments Stats Meta Line */}
                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 border-y border-slate-900 py-2">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-[#dfba53]/85" />
                        <span>
                          {new Date(featuredArticle.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} hrs
                        </span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <MessageSquare className="w-4 h-4 text-[#dfba53]/85" />
                        <span>{commentCounts[featuredArticle.id] !== undefined ? commentCounts[featuredArticle.id] : 22} comentarios</span>
                      </span>
                    </div>

                    {/* Highly polished Subtitle description snippet block */}
                    <p className="text-slate-300 text-xs md:text-sm font-serif leading-relaxed line-clamp-3">
                      {featuredArticle.subtitle}
                    </p>
                  </div>
                </div>

                {/* Writer Signature bottom frame */}
                <div className="px-6 pb-6 pt-2 mt-auto border-t border-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={featuredArticle.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                      alt={featuredArticle.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-[#dfba53]/35"
                    />
                    <div className="leading-none text-left">
                      <h5 className="text-[11px] font-semibold text-slate-200">{featuredArticle.authorName}</h5>
                      <span className="text-[8.5px] text-[#dfba53] font-mono">Consejo de Redacción</span>
                    </div>
                  </div>
                  
                  <span className="text-[#dfba53] text-[10px] font-mono font-bold flex items-center space-x-1 bg-[#dfba53]/5 px-2.5 py-1 rounded border border-[#dfba53]/10">
                    <span>Leer Manuscrito</span>
                    <span>→</span>
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: Divided into top half (Siguientes en esta Edición) and bottom half (Scrollable Hashtags) */}
              <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
                
                {/* TOP HALF: Siguientes en Esta Edición */}
                <div className="flex-1 bg-gradient-to-b from-[#051122] to-[#040e1b] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  {/* Background soft light pattern */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[#dfba53]/2 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    {/* Header Title */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-3.5 bg-[#dfba53] rounded-full"></span>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#dfba53] font-bold">
                          Siguientes en Esta Edición
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        Opinión & Debate
                      </span>
                    </div>

                    {/* Siguientes List */}
                    <div className="flex-1 flex flex-col justify-center divide-y divide-dashed divide-slate-800/60">
                      {filteredArticles.slice(1, 4).length > 0 ? (
                        filteredArticles.slice(1, 4).map((art) => (
                          <div
                            key={art.id}
                            onClick={() => onSelectArticle(art.id)}
                            className="group cursor-pointer py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 border border-[#dfba53]/25 group-hover:border-[#dfba53] rounded bg-slate-950 text-[#dfba53] group-hover:bg-[#dfba53]/10 transition-all duration-300 text-xs font-mono">
                              <ChevronRight className="w-3.5 h-3.5 text-[#dfba53]" />
                            </div>

                            <div className="flex-1 text-left min-w-0">
                              <span className="text-[8px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                                {art.authorName} · {art.category}
                              </span>
                              <h5 className="font-serif text-xs md:text-[13px] font-bold text-slate-200 group-hover:text-[#dfba53] transition-colors leading-snug line-clamp-1">
                                {art.title}
                              </h5>
                            </div>

                            <div className="flex items-center space-x-1 text-slate-500 group-hover:text-[#dfba53] transition-all font-mono whitespace-nowrap flex-shrink-0 bg-slate-950/40 px-1.5 py-0.5 rounded border border-transparent group-hover:border-slate-800">
                              <MessageSquare className="w-3 h-3 text-slate-500 group-hover:text-[#dfba53]" />
                              <span className="text-[10px]">{commentCounts[art.id] !== undefined ? commentCounts[art.id] : 14}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <p className="text-xs italic font-serif text-slate-500">
                            No hay publicaciones de debate secuenciales.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Board Note bottom segment spacer */}
                    <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[8px] font-mono text-slate-500">
                      <span>Edición Diaria Actualizada</span>
                      <span className="text-[#dfba53] tracking-widest uppercase">Columna Pública</span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM HALF: Scrollable Hashtags */}
                <div className="flex-1 bg-gradient-to-b from-[#051122] to-[#040e1b] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  {/* Background soft light pattern */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[#dfba53]/2 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    {/* Header Title */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-[#dfba53]" />
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#dfba53] font-bold">
                          Vectores de Debate (Hashtags)
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        Tendencias
                      </span>
                    </div>

                    {/* Tag Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        placeholder="Buscar vector (ej: Chile, Kast...)"
                        className="w-full text-[11px] bg-slate-950/90 border border-slate-800 text-slate-300 placeholder-slate-500 rounded px-2.5 py-1.5 pl-7 focus:outline-none focus:border-[#dfba53]/50 focus:ring-1 focus:ring-[#dfba53]/20 font-mono transition-all"
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      {tagSearchQuery && (
                        <button
                          onClick={() => setTagSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 font-bold text-xs"
                          title="Limpiar búsqueda"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Scrollable Hashtags List */}
                    <div className="flex-1 overflow-y-auto max-h-[140px] pr-1 pt-1 text-left scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                      {filteredSidebarTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredSidebarTags.map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedTag(tag);
                              }}
                              className={`text-[10px] md:text-xs px-2.5 py-1 font-mono rounded border transition-all cursor-pointer flex items-center space-x-1.5 ${
                                selectedTag === tag
                                  ? "bg-[#dfba53] border-[#dfba53] text-[#030a16] font-bold shadow shadow-[#dfba53]/20"
                                  : "border-slate-800 text-slate-400 hover:border-[#dfba53]/40 hover:text-[#dfba53] bg-slate-950/80"
                              }`}
                            >
                              <span>#{tag}</span>
                              <span className={`text-[8.5px] px-1 rounded-full ${
                                selectedTag === tag 
                                  ? "bg-[#030a16]/10 text-[#030a16] font-extrabold"
                                  : "bg-slate-900 border border-slate-800/40 text-slate-500"
                              }`}>
                                {tagCounts[tag] || 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs italic font-serif text-slate-500 mb-2">
                            No se encontraron vectores coincidentes.
                          </p>
                          {tagSearchQuery && (
                            <button
                              onClick={() => setTagSearchQuery("")}
                              className="text-[10px] font-mono text-[#dfba53] hover:underline"
                            >
                              Limpiar Filtro de Búsqueda
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer helper note */}
                    <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[8px] font-mono text-slate-500">
                      <span>Seleccione para Filtrar Portada</span>
                      <span className="text-[#dfba53] tracking-widest uppercase">Vectores</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Category Spotlight Section (Permite destacar la última publicación de cada categoría) */}
          {selectedCategory === "Todo" && !selectedTag && searchTerm === "" && (
            <div className="space-y-4 mb-10">
              <div className="flex items-center space-x-2.5">
                <Compass className="w-5 h-5 text-[#dfba53]" />
                <h3 className="font-cinzel text-lg md:text-xl font-bold text-white tracking-widest uppercase">
                  Último de la Editorial por Categoría
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestByCategory.map(({ category, article }) => (
                  <div
                    key={category}
                    onClick={() => article && onSelectArticle(article.id)}
                    className={`p-5 rounded-xl border flex flex-col justify-between group transition-all duration-300 relative overflow-hidden ${
                      article
                        ? "cursor-pointer bg-gradient-to-b from-[#051122] to-[#040e1b] border-[#dfba53]/20 hover:border-[#dfba53]"
                        : "bg-[#040c17]/40 border-slate-900 select-none"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[9px] tracking-wider text-[#dfba53] bg-[#dfba53]/10 px-2 py-0.5 rounded border border-[#dfba53]/15 uppercase font-bold">
                          {category}
                        </span>
                        {article && (
                          <span className="inline-flex items-center bg-red-950/40 text-red-400 border border-red-900/40 rounded text-[8px] font-bold tracking-widest px-1.5 py-0.5 animate-pulse">
                            SOHO
                          </span>
                        )}
                      </div>

                      {article ? (
                        <div className="space-y-2">
                          <h4 className="font-serif text-[13px] font-bold text-slate-100 group-hover:text-[#dfba53] transition-colors leading-snug line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-slate-400 text-[11px] font-serif italic line-clamp-2 leading-relaxed">
                            {article.subtitle}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px] italic font-serif">
                          Sin publicaciones recientes en esta sección técnica.
                        </p>
                      )}
                    </div>

                    {article && (
                      <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-2">
                          <img
                            src={article.authorAvatar}
                            alt={article.authorName}
                            className="w-5 h-5 rounded-full object-cover border border-[#dfba53]/20"
                          />
                          <span className="text-slate-400 text-[9px] font-sans truncate max-w-[90px]">
                            {article.authorName}
                          </span>
                        </div>
                        <span className="text-[#dfba53] font-mono text-[9px] font-bold group-hover:translate-x-1 transition-transform">Leer →</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid Layout containing articles and sidebar columns */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main content feed column with dynamic category-based separations */}
              <div className="lg:col-span-8 space-y-12">
                {(() => {
                  const categoriesToRender: (ArticleCategory | "Todo")[] = selectedCategory === "Todo"
                    ? ["Soberanía Global", "Geopolítica Económica", "Análisis", "Opinión"]
                    : [selectedCategory];

                  const renderedSections = categoriesToRender.map(cat => {
                    const categoryArticles = standardArticles.filter(art => art.category === cat);
                    if (categoryArticles.length === 0) return null;

                    return (
                      <div key={cat} id={`categoria-${cat}`} className="space-y-6 scroll-mt-28">
                        {/* Section Header with Premium Newspaper Style (Chilean portals look) */}
                        <div className="flex items-center justify-between border-b border-dashed border-slate-800 pb-2.5">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-1.5 h-4 bg-[#dfba53] rounded-full"></span>
                            <h3 className="font-mono text-xs uppercase tracking-widest text-[#dfba53] font-extrabold">
                              {cat}
                            </h3>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                              {categoryArticles.length} {categoryArticles.length === 1 ? "publicación" : "publicaciones"}
                            </span>
                          </div>
                          {selectedCategory === "Todo" && (
                            <button
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedTag(null);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-[10px] font-mono text-slate-400 hover:text-[#dfba53] transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Sección completa</span>
                              <ChevronRight className="w-3 h-3 text-[#dfba53]" />
                            </button>
                          )}
                        </div>

                        {/* Grid of articles for this category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {categoryArticles.map(art => (
                            <div
                              key={art.id}
                              onClick={() => onSelectArticle(art.id)}
                              className="group cursor-pointer bg-[#051122]/90 border border-slate-800 rounded-xl overflow-hidden hover:border-[#dfba53]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-lg"
                            >
                              <div>
                                {/* Article Card image */}
                                <div className="aspect-video relative overflow-hidden bg-slate-950">
                                  <img
                                    src={art.imageUrl}
                                    alt={art.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#051122] via-transparent to-transparent"></div>
                                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-slate-950/80 text-[#dfba53] font-mono text-[9px] uppercase tracking-wider rounded border border-[#dfba53]/20 font-bold">
                                    {art.category}
                                  </span>
                                </div>

                                {/* Card Content details */}
                                <div className="p-5 space-y-3">
                                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                                    <span>{new Date(art.createdAt).toLocaleDateString("es-CL", { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
                                    <span className="flex items-center space-x-1">
                                      <Eye className="w-3 h-3" />
                                      <span>{art.views}</span>
                                    </span>
                                  </div>

                                  <h4 className="font-serif text-base font-bold text-slate-100 group-hover:text-[#dfba53] transition-colors leading-snug line-clamp-2">
                                    {art.title}
                                  </h4>

                                  <p className="text-slate-400 text-[11px] font-serif italic line-clamp-2 leading-relaxed">
                                    {art.subtitle}
                                  </p>

                                  {/* Content preview */}
                                  <p className="text-slate-500 text-[11px] font-sans line-clamp-3 leading-relaxed">
                                    {art.content}
                                  </p>
                                </div>
                              </div>

                              {/* Footer specs of card */}
                              <div className="p-5 border-t border-slate-900/60 flex items-center justify-between bg-slate-950/25">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={art.authorAvatar}
                                    alt={art.authorName}
                                    className="w-6 h-6 rounded-full object-cover border border-[#dfba53]/25"
                                  />
                                  <span className="text-[10px] font-medium text-slate-300 truncate max-w-[110px]">{art.authorName}</span>
                                </div>

                                {/* Badges tags */}
                                <div className="flex items-center space-x-1">
                                  {art.tags.slice(0, 1).map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTag(tag);
                                      }}
                                      className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-850 text-slate-400 hover:text-[#dfba53] rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }).filter(Boolean);

                  if (renderedSections.length === 0) {
                    return (
                      <div className="text-center py-16 bg-[#051122]/40 rounded-xl border border-slate-900 space-y-3">
                        <p className="text-slate-400 italic font-serif">
                          No se encontraron artículos que coincidan con la búsqueda o filtros actuales.
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedTag(null);
                            setSelectedCategory("Todo");
                          }}
                          className="text-xs font-mono text-[#dfba53] hover:underline cursor-pointer"
                        >
                          Restablecer todos los filtros
                        </button>
                      </div>
                    );
                  }

                  return <div className="space-y-12">{renderedSections}</div>;
                })()}
              </div>

          {/* Right sticky sidebar column: Only visible in PC view (lg:block) */}
          <div className="hidden lg:block lg:col-span-4 bg-gradient-to-b from-[#051122] to-[#040e1b] border border-[#dfba53]/15 rounded-xl p-5 space-y-4 self-start sticky top-24 shadow-xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <span className="w-1 h-5 bg-[#dfba53] rounded-full"></span>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-[#dfba53] font-bold">
                Últimas 3 Publicaciones
              </h3>
            </div>
            
            <div className="space-y-4 block">
              {latestThree.map((art) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art.id)}
                  className="group cursor-pointer flex items-start space-x-3 pb-3 border-b border-slate-900 last:border-0 last:pb-0 transition-all hover:opacity-95"
                >
                  <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-800">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <span className="text-[8px] font-mono uppercase text-[#dfba53] bg-[#dfba53]/5 px-1.5 py-0.2 rounded tracking-wider inline-block">
                      {art.category}
                    </span>
                    <h4 className="font-serif text-xs font-bold text-slate-100 group-hover:text-[#dfba53] transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h4>
                    <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono pt-0.5">
                      <span className="truncate max-w-[80px]">{art.authorName}</span>
                      <span>{new Date(art.createdAt).toLocaleDateString("es-CL", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
        </>
      )}

      {/* Columnist recruitment call to action & Contact application form */}
      <JoinUsSection />

      {/* Dynamic Settings Text Editor Modal for Admins */}
      <AnimatePresence>
        {editingField && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#051122] border border-[#dfba53]/55 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setEditingField(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-mono text-xs uppercase text-[#dfba53] tracking-widest font-bold mb-4 flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-[#dfba53]" />
                <span>
                  Editar Texto de Portal ({
                    editingField === 'siteName' ? 'Nombre Principal' : 
                    editingField === 'siteSubtitle' ? 'Subtítulo' : 
                    editingField === 'alertBannerText' ? 'Boletín Oficial' :
                    editingField === 'editorialSlogan' ? 'Slogan de Foro' :
                    editingField === 'facebookUrl' ? 'Enlace de Facebook' :
                    editingField === 'instagramUrl' ? 'Enlace de Instagram' :
                    editingField === 'whatsappUrl' ? 'Enlace de Canal WhatsApp' :
                    'Email de Contacto'
                  })
                </span>
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1.5">Contenido del Texto:</label>
                  {editingField === 'alertBannerText' || editingField === 'editorialSlogan' ? (
                    <textarea
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-100 p-3 text-xs focus:outline-none focus:border-[#dfba53] font-serif leading-relaxed"
                      placeholder="Escriba el contenido correspondiente..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-100 p-3 text-xs focus:outline-none focus:border-[#dfba53] font-serif"
                      placeholder="Escriba el nuevo texto..."
                    />
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    disabled={saveLoading}
                    onClick={() => setEditingField(null)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-mono text-slate-400 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={saveLoading}
                    onClick={saveSettingField}
                    className="px-4 py-2 bg-[#dfba53] hover:bg-[#cfa543] text-xs font-mono text-[#030a16] font-bold rounded-lg cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#030a16]" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Cambios</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default HomeView;
