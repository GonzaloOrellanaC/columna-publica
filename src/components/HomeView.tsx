import React, { useState, useEffect } from "react";
import { Article, SiteSettings, ArticleCategory } from "../types";
import { Search, ChevronRight, Eye, ShieldAlert, Tag, Grid, List, Compass, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JoinUsSection } from "./JoinUsSection";

interface HomeViewProps {
  articles: Article[];
  settings: SiteSettings;
  onSelectArticle: (articleId: string) => void;
  isLoading: boolean;
  selectedCategory?: ArticleCategory | "Todo";
  setSelectedCategory?: (category: ArticleCategory | "Todo") => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  settings,
  onSelectArticle,
  isLoading,
  selectedCategory: propCategory,
  setSelectedCategory: propSetCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localCategory, setLocalCategory] = useState<ArticleCategory | "Todo">("Todo");
  const [layoutMode, setLayoutMode] = useState<'bento' | 'newspaper'>('bento');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  const selectedCategory = propCategory !== undefined ? propCategory : localCategory;
  const setSelectedCategory = propSetCategory !== undefined ? propSetCategory : setLocalCategory;

  // Retrieve unique list of tags from published articles
  const allTags = Array.from(
    new Set(articles.flatMap(art => art.tags || []))
  ).slice(0, 10);

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
  const standardArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-12">

      {/* Hero Welcome Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <h2 className="font-cinzel text-3xl md:text-5xl font-extrabold tracking-widest leading-tight text-white">
          {settings.siteName || "COLUMNA PÚBLICA"}
        </h2>
        <div className="h-[2px] w-24 bg-[#dfba53] mx-auto my-2"></div>
        <p className="text-xs md:text-sm font-mono tracking-wider text-[#dfba53] uppercase">
          {settings.siteSubtitle || "Asuntos Políticos, Macroeconomía e Inserción Global"}
        </p>
        <p className="text-xs text-slate-400 font-serif leading-relaxed max-w-xl mx-auto italic">
          "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas."
        </p>
      </div>

      {/* Desktop Interactive Controls & Navigation bar (Escondido en móvil y tablet) */}
      <div className="hidden lg:flex lg:flex-row gap-4 justify-between items-center bg-[#051122] border border-slate-800 p-4 rounded-xl">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(["Todo", "Soberanía Global", "Geopolítica Económica", "Análisis", "Opinión"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedTag(null);
              }}
              className={`text-xs px-3.5 py-1.5 font-mono tracking-wider rounded transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#dfba53] text-[#030a16] font-bold shadow shadow-[#dfba53]/20"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-80">
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
              title="Buscar y filtrar artículos"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile/Tablet Deployable Search & Category Panel with Motion */}
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
                Filtros y Búsqueda
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

            {/* Category Filters */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Categorías:</span>
              <div className="flex flex-wrap gap-1.5">
                {(["Todo", "Soberanía Global", "Geopolítica Económica", "Análisis", "Opinión"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag(null);
                    }}
                    className={`text-[11px] px-3 py-1 font-mono tracking-wider rounded transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#dfba53] text-[#030a16] font-bold shadow shadow-[#dfba53]/20"
                        : "bg-slate-900 border border-slate-855 text-slate-300 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Field */}
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
          {/* Bento Featured Article - The Cover Page */}
          {featuredArticle && !selectedTag && selectedCategory === "Todo" && searchTerm === "" && (
            <div 
              onClick={() => onSelectArticle(featuredArticle.id)}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-br from-[#051122] to-[#040e1b] border border-[#dfba53]/30 rounded-2xl p-6 md:p-8 hover:border-[#dfba53] transition-all duration-300 shadow-xl relative overflow-hidden mb-8"
            >
              {/* Gold light aura */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfba53]/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Cover visual representation */}
              <div className="lg:col-span-7 rounded-xl overflow-hidden relative aspect-video lg:aspect-auto lg:h-[380px]">
                <img
                  src={featuredArticle.imageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800"}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <span className="absolute bottom-4 left-4 inline-flex items-center space-x-1 px-2.5 py-1 bg-[#dfba53] text-[#030a16] text-[9.5px] font-bold tracking-widest rounded uppercase">
                  <Sparkles className="w-3 h-3 text-[#030a16]" />
                  <span>EDITORIAL PRINCIPAL</span>
                </span>
              </div>

              {/* Cover Typography Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-[#dfba53] uppercase">
                    <span>{featuredArticle.category}</span>
                    <span>·</span>
                    <span>{new Date(featuredArticle.createdAt).toLocaleDateString("es-CL", { month: "long", day: "numeric" })}</span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight text-white group-hover:text-[#dfba53] transition-colors">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-slate-300 text-xs md:text-sm italic font-serif leading-relaxed line-clamp-3">
                    {featuredArticle.subtitle}
                  </p>

                  <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-4">
                    {featuredArticle.content}
                  </p>
                </div>

                {/* Author profile and specs */}
                <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={featuredArticle.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                      alt={featuredArticle.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#dfba53]/30"
                    />
                    <div>
                      <h5 className="text-xs font-semibold text-white">{featuredArticle.authorName}</h5>
                      <p className="text-[9px] text-[#dfba53] font-mono tracking-wider uppercase leading-none">Firma del Consorcio</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-slate-500 font-mono text-[10px]">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{featuredArticle.views} Lecturas</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#dfba53]" />
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
              
              {/* Main content feed column */}
              <div className="lg:col-span-8 space-y-8">
                {/* Grid Layout of standard articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {standardArticles.map(art => (
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
                  <div className="p-5 border-t border-slate-900 flex items-center justify-between bg-slate-950/20">
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

      {/* Dynamic Tag cloud helper */}
      {!isLoading && allTags.length > 0 && (
        <div className="border border-slate-850 bg-[#030d1a] p-6 rounded-xl space-y-3">
          <h5 className="font-mono text-xs uppercase tracking-wider text-[#dfba53] font-bold flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Vectores de Debate Comunes (Hashtags)
          </h5>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3 py-1 font-mono rounded-md border transition-all cursor-pointer ${
                  selectedTag === tag
                    ? "bg-[#dfba53] border-[#dfba53] text-[#030a16] font-bold"
                    : "border-slate-800 text-slate-400 hover:border-[#dfba53]/40 hover:text-[#dfba53] bg-slate-950"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Columnist recruitment call to action & Contact application form */}
      <JoinUsSection />

    </div>
  );
};
export default HomeView;
