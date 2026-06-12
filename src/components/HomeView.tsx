import React from 'react';
import { Article, User } from '../types';
import { Clock, Eye, ChevronRight, Newspaper, Bookmark, BookOpen, Users, Globe2, Sparkles, TrendingUp } from 'lucide-react';

interface HomeViewProps {
  articles: Article[];
  searchQuery: string;
  onSelectArticle: (articleId: string) => void;
  onFilterCategory: (category: string) => void;
  selectedCategory: string;
  showColumnistsList?: boolean;
  settings?: any;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  searchQuery,
  onSelectArticle,
  onFilterCategory,
  selectedCategory,
  showColumnistsList = false,
  settings
}) => {
  // Predefined list of columnists from our database setup to display in "Nuestros Columnistas" or filtered views
  const COLUMNISTS = [
    {
      id: "user-marachia",
      name: "Marachia Elolario",
      role: "Catedrática y Abogada",
      bio: "Doctora en Derecho Constitucional, investigadora de gobernanza comparada y políticas de estado.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
    },
    {
      id: "user-cauvia",
      name: "Cauvia Naman",
      role: "Analista Internacional y Ex Consejero",
      bio: "Especialista en relaciones estratégicas del Cono Sur y geopolítica transnacional y minera.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
    },
    {
      id: "user-aaron",
      name: "Aarón Garamo",
      role: "Catedrático de Economía Pública",
      bio: "Doctor en Economía, consultor fiscal estratégico de organismos multilaterales y desarrollo regional.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    }
  ];

  // Filter current articles by visible status
  const publishedArticles = articles.filter(a => a.status === 'published');

  // Filter based on search query or category
  const filteredArticles = publishedArticles.filter(art => {
    const matchesSearch = searchQuery
      ? art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesCategory = selectedCategory
      ? art.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });

  const featuredMain = publishedArticles.find(a => a.id === 'art-1') || publishedArticles[0];
  const sidebarFeatured = publishedArticles.filter(a => a.id !== (featuredMain?.id || ''));

  // Split category specific lists for the double vertical columns at the bottom
  const soberaniaGlobalPosts = publishedArticles.filter(a => a.category === 'Soberanía Global').slice(0, 3);
  const geopoliticaEconomicaPosts = publishedArticles.filter(a => a.category === 'Geopolítica Económica').slice(0, 3);

  // Helper date renderer
  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr || Date.now());
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Neoclassical CMS Masthead Header Banner detailing dynamic site details */}
      {!searchQuery && !selectedCategory && !showColumnistsList && (
        <header className="border-b-2 border-double border-white/20 pb-8 mb-10 text-center relative animate-fadeIn">
          {/* Dynamic Editorial Alert Ticker banner */}
          {settings?.alertBannerText && settings.enableDynamicTicker !== false && (
            <div className="bg-gold-500/10 text-gold-300 border border-gold-500/20 rounded-md py-2 px-4 mb-8 hover:bg-gold-500/15 transition-all text-xs flex items-center justify-center space-x-2.5 max-w-4xl mx-auto">
              <span className="inline-block w-2 h-2 bg-gold-400 rounded-full animate-ping shrink-0"></span>
              <span className="font-semibold uppercase tracking-widest font-mono text-[9px] text-gold-400 shrink-0">BOLETÍN EDITORIAL:</span>
              <span className="italic font-serif text-white/90 leading-snug text-left sm:text-center shrink">{settings.alertBannerText}</span>
            </div>
          )}

          {/* Site Name and Subtitle centered in serif neoclassical type */}
          <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-white tracking-tight uppercase leading-none font-display">
            {settings?.siteName || "Columna Pública"}
          </h1>
          <p className="text-xs sm:text-sm font-sans uppercase tracking-[0.25em] text-gold-300/80 mt-4 max-w-3xl mx-auto font-medium">
            {settings?.siteSubtitle || "Asuntos Políticos, Macroeconomía e Inserción Global"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-5 text-[10px] text-white/40 font-mono uppercase tracking-wider">
            <span>Santiago de Chile</span>
            <span className="hidden sm:inline">•</span>
            <span>Edición Digital Descentralizada</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-gold-300/60 font-semibold">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
      )}

      {/* 1. Header Banner detailing active filters */}
      {(searchQuery || selectedCategory || showColumnistsList) && (
        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-lg shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-300 font-bold">Filtros Activos</p>
              <h2 className="text-xl font-serif font-bold text-white mt-1">
                {showColumnistsList ? "Nuestros Exclusivos Columnistas Políticos" : "Criterio de Búsqueda de Artículos"}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/5">
                    Búsqueda: {searchQuery}
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-400/20 text-gold-300 border border-gold-400/30">
                    Categoría: {selectedCategory}
                  </span>
                )}
                {showColumnistsList && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/5">
                    Cuerpo Editorial
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => {
                onFilterCategory('');
              }}
              className="mt-4 sm:mt-0 px-4 py-2 border border-white/10 text-xs text-white font-medium hover:bg-white/10 rounded-md transition-colors bg-white/5 cursor-pointer"
            >
              Ver Todas las Publicaciones
            </button>
          </div>
        </div>
      )}

      {/* 2. Columnists Profile Cards Section (shown when requested) */}
      {(showColumnistsList) && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COLUMNISTS.map(col => (
              <div 
                key={col.id} 
                className="bg-white/5 rounded-lg border border-white/10 p-6 flex flex-col items-center text-center shadow-xl backdrop-blur-md transition-all hover:border-white/20 hover:scale-[1.01] duration-300"
              >
                <img 
                  src={col.avatar} 
                  alt={col.name} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gold-400 mb-4 shadow-md"
                />
                <h3 className="font-serif text-lg font-bold text-white">{col.name}</h3>
                <p className="text-xs font-bold text-gold-300 tracking-wide uppercase mt-1 mb-3">{col.role}</p>
                <p className="text-xs text-white/70 leading-relaxed italic mb-6">"{col.bio}"</p>
                
                <button
                  onClick={() => {
                    onFilterCategory(''); // Clear categories
                    const searchBox = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (searchBox) searchBox.value = col.name; 
                    // Search by column's name
                    const event = new CustomEvent('filter-columnist', { detail: col.name });
                    window.dispatchEvent(event);
                  }}
                  className="mt-auto inline-flex items-center px-4 py-2 text-xs font-serif text-white hover:bg-white/10 rounded transition-all cursor-pointer border border-white/20 font-medium uppercase tracking-wider bg-transparent"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-2 inline" /> Ver Columnas de {col.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Hero Feature Slate Grid (Matching first screenshot top block) */}
      {!searchQuery && !selectedCategory && !showColumnistsList && (
        <section className="mb-14">
          {(!settings?.heroLayout || settings.heroLayout === 'editorial') ? (
            /* EDITORIAL LAYOUT (Bento/Columnar Grid style) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Big Featured Left Block (art-1) */}
              {featuredMain && (
                <div 
                  id="main-featured"
                  className="lg:col-span-2 bg-[#0a1220]/50 border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between group shadow-lg transition-all hover:border-white/20"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[#050B14]">
                    <img
                      src={featuredMain.imageUrl}
                      alt={featuredMain.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    {/* Category overlay */}
                    <span className="absolute top-4 left-4 bg-red-650/90 text-white font-mono uppercase text-[10px] font-bold py-1 px-2.5 tracking-widest border border-white/10 rounded-xs">
                      #{featuredMain.category.toUpperCase().replace(/\s+/g, '_')}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 
                        onClick={() => onSelectArticle(featuredMain.id)}
                        className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white hover:text-gold-300 cursor-pointer transition-colors leading-tight"
                      >
                        {featuredMain.title}
                      </h2>
                      <p className="text-sm text-white/70 mt-3 line-clamp-3 leading-relaxed">
                        {featuredMain.subtitle}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={featuredMain.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt={featuredMain.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-gold-300"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{featuredMain.authorName}</p>
                          <p className="text-[10px] text-white/50 font-mono uppercase mt-0.5">{formatDate(featuredMain.createdAt)}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => onSelectArticle(featuredMain.id)}
                        className="inline-flex items-center px-4 py-2 text-xs font-serif text-white font-extrabold hover:text-gold-300 uppercase tracking-widest cursor-pointer transition-colors"
                      >
                        Leer Análisis <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar Columns (Right side stack) */}
              <div className="space-y-6">
                
                {/* Serious Strategic Widget Header */}
                <div className="bg-gradient-to-br from-[#0c2340]/90 to-[#061121]/90 text-white p-6 rounded-lg flex flex-col justify-between border border-white/15 h-32 relative overflow-hidden shadow-xl backdrop-blur-md">
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <Globe2 className="w-32 h-32 text-white -mr-4 -mb-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold tracking-tight text-gold-300">Resiliencia Democrática</h3>
                    <p className="text-xs text-white/80 mt-1">El termómetro geopolítico del Cono Sur analizado por los que deciden.</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gold-400 tracking-wider uppercase font-mono mt-2">
                    <span>Edición Limitada</span>
                    <span>● EN VIVO</span>
                  </div>
                </div>

                {/* Sidebar articles */}
                {sidebarFeatured.slice(0, 2).map(art => (
                  <div 
                    key={art.id}
                    className="bg-white/5 rounded-lg border border-white/10 p-5 hover:border-white/20 transition-all flex flex-col justify-between group backdrop-blur-md"
                  >
                    <div>
                      {/* Category */}
                      <div className="flex items-center space-x-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                        <span className="text-[10px] font-bold text-gold-300 uppercase tracking-wide">{art.category}</span>
                      </div>

                      <h3 
                        onClick={() => onSelectArticle(art.id)}
                        className="font-serif text-md font-bold text-white hover:text-gold-300 cursor-pointer transition-colors leading-tight"
                      >
                        {art.title}
                      </h3>
                      <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed">
                        {art.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                      <span className="font-bold text-white/80">{art.authorName}</span>
                      <span className="font-mono text-[9px]">{formatDate(art.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : settings.heroLayout === 'classic' ? (
            /* CLASSIC CHRONOLOGICAL CHANNELS */
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 uppercase font-mono text-[10px] text-white/50 tracking-wider mb-2 flex items-center justify-between">
                <span>📰 Flujo de Opinión Clásico</span>
                <span className="text-gold-400">● {publishedArticles.length} Ediciones</span>
              </div>
              {publishedArticles.slice(0, 3).map((art, idx) => (
                <div 
                  key={art.id}
                  className={`bg-[#0a1220]/30 border border-white/10 rounded-lg overflow-hidden group hover:border-white/20 transition-all flex flex-col md:flex-row shadow-lg ${idx === 0 ? 'border-gold-500/30 ring-1 ring-gold-500/20' : ''}`}
                >
                  <div className="md:w-2/5 aspect-[16/10] md:aspect-auto h-48 md:h-auto overflow-hidden relative">
                    <img src={art.imageUrl} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" alt={art.title} />
                    <span className="absolute top-3 left-3 bg-black/85 text-gold-300 font-mono uppercase text-[9px] font-bold py-0.5 px-2 tracking-widest border border-gold-500/20 rounded-xs">
                      {art.category}
                    </span>
                  </div>
                  <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-between">
                    <div>
                      <h3 onClick={() => onSelectArticle(art.id)} className="font-serif text-xl md:text-2xl font-bold text-white hover:text-gold-300 cursor-pointer line-clamp-2 transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-[11px] text-gold-300 font-bold uppercase tracking-wider mt-1.5 flex items-center">
                        <img src={art.authorAvatar} alt="" className="w-4 h-4 rounded-full mr-1.5 border border-gold-400" />
                        Por {art.authorName}
                      </p>
                      <p className="text-xs text-white/70 mt-3 leading-relaxed line-clamp-3">{art.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[11px] text-white/40">
                      <span>Publicado el {formatDate(art.createdAt)}</span>
                      <button onClick={() => onSelectArticle(art.id)} className="text-xs text-white group-hover:text-gold-300 font-bold uppercase tracking-wider flex items-center">
                        Continuar Lectura <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DENSE COMPACT HEADER STREAM STYLE */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="p-3 bg-white/5 border border-white/10 rounded uppercase font-mono text-[9px] text-white/50 tracking-wider flex items-center justify-between">
                  <span>⚡ Resumen de Cables Rápidos</span>
                  <span>Últimos {publishedArticles.length} artículos</span>
                </div>
                {publishedArticles.map(art => (
                  <div 
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div className="flex-grow pr-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-gold-300 bg-gold-400/10 px-1.5 py-0.5 rounded border border-gold-400/20 mr-2">{art.category}</span>
                      <h4 className="font-serif text-sm font-bold text-white group-hover:text-gold-300 transition-colors inline cursor-pointer leading-tight">{art.title}</h4>
                      <p className="text-[11px] text-white/50 mt-1">Por <strong className="text-white/70">{art.authorName}</strong> — {formatDate(art.createdAt)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-gold-300 transition-transform group-hover:translate-x-1 shrink-0" />
                  </div>
                ))}
              </div>
              
              <div className="bg-[#0a1220]/40 border border-white/10 p-5 rounded-lg space-y-4 self-start">
                <div className="flex items-center space-x-2 text-white border-b border-white/10 pb-3">
                  <TrendingUp className="w-4 h-4 text-gold-300" />
                  <span className="font-serif text-sm font-bold uppercase tracking-wider">Tendencias de Opinión</span>
                </div>
                {publishedArticles.slice(0, 4).map((art, idx) => (
                  <div key={art.id} onClick={() => onSelectArticle(art.id)} className="flex items-start space-x-3 cursor-pointer group py-1.5">
                    <span className="font-serif text-xl font-bold text-gold-500/60 group-hover:text-gold-400 pr-1 shrink-0">0{idx + 1}</span>
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-gold-300 transition-colors leading-snug line-clamp-2">{art.title}</h5>
                      <span className="text-[9px] text-white/40">{art.authorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. RECENTES ARTICLES bento grid (Recente articles seen in first mockup center) */}
      <section className="mb-14">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-gold-300" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              {searchQuery || selectedCategory ? "Artículos Filtrados" : "Columnas de Opinión Recientes"}
            </h2>
          </div>
          <span className="text-xs text-white/50 font-mono">{filteredArticles.length} artículos encontrados</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-[#0A192F]/20 rounded-lg border border-white/10">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-white">No se encontraron artículos</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">Revisa los datos de búsqueda o categoría e intenta nuevamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map(art => (
              <article 
                key={art.id}
                className="bg-[#0A192F]/20 border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all hover:scale-[1.01] hover:shadow-xl"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#050B14]">
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 tracking-wider uppercase border border-white/10 rounded-xs">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 
                      onClick={() => onSelectArticle(art.id)}
                      className="font-serif text-sm font-extrabold leading-snug text-white hover:text-gold-300 cursor-pointer transition-colors line-clamp-2"
                    >
                      {art.title}
                    </h3>
                    <p className="text-xs text-white/70 mt-2 line-clamp-3 leading-relaxed">
                      {art.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="border-t border-white/10 pt-3 mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={art.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                        alt={art.authorName} 
                        className="w-6 h-6 rounded-full object-cover border border-gold-300"
                      />
                      <span className="text-[10px] font-bold text-white leading-tight block truncate max-w-[90px]">
                        {art.authorName}
                      </span>
                    </div>

                    <span className="text-[9px] text-white/40 font-mono uppercase">
                      {formatDate(art.createdAt)}
                    </span>
                  </div>
                  
                  {/* Views indicator */}
                  <div className="flex items-center space-x-1 mt-2 text-[9px] text-white/40">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{art.views} lecturas</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. Specialty Double Columns (Bottom half of first screenshot - Soberanía Global & Geopolítica Económica) */}
      {!searchQuery && !selectedCategory && !showColumnistsList && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/10 pt-10">
          
          {/* Column A: Soberanía Global Posts (Left) - col-span-2 or col-span-3 depending on sidebar configuration */}
          <div className={`${settings?.enableColumnistSidebar !== false ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            <h3 className="font-serif font-bold text-xl text-white border-b border-white/10 pb-3 flex items-center space-x-2">
              <Globe2 className="w-5 h-5 text-gold-400" />
              <span>Soberanía Global</span>
            </h3>

            {soberaniaGlobalPosts.length === 0 ? (
              <p className="text-xs text-white/40 italic">No hay publicaciones disponibles bajo esta categoría.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {soberaniaGlobalPosts.map(art => (
                  <div 
                    key={art.id} 
                    className="bg-white/5 border border-white/10 rounded-lg p-4 shadow-sm hover:border-white/20 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <img 
                        src={art.imageUrl} 
                        className="w-full h-32 object-cover rounded mb-3 border border-white/5" 
                        alt="" 
                      />
                      <h4 
                        onClick={() => onSelectArticle(art.id)}
                        className="font-serif text-sm font-bold text-white hover:text-gold-300 cursor-pointer transition-colors leading-snug"
                      >
                        {art.title}
                      </h4>
                      <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed">{art.subtitle}</p>
                    </div>

                    <div className="flex items-center space-x-2 border-t border-white/5 pt-3 mt-4 text-[10px] text-white/50">
                      <span className="font-bold text-white/80">{art.authorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {settings?.enableColumnistSidebar !== false && (
            /* Column B: Geopolítica Económica Quick Filters (Right) - col-span-1 */
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-xl text-white border-b border-white/10 pb-3 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-gold-300" />
                <span>Geopolítica Económica</span>
              </h3>

              {/* Visual static Quick Filters looking exactly like the buttons on bottom screen 1 */}
              <div className="space-y-3">
                <button
                  onClick={() => onFilterCategory('Soberanía Global')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-[#0c2340] text-gold-300 flex items-center justify-center font-bold text-xs font-serif border border-white/10">
                      SG
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">Soberanía Global</span>
                      <span className="text-[10px] text-white/50">Análisis geopolítico unificado</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onFilterCategory('Geopolítica Económica')}
                  className="w-full flex items-center justify-between p-4 bg-white/15 hover:bg-white/20 border border-white/20 rounded-lg text-left transition-all cursor-pointer group text-white shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-gold-400 text-white flex items-center justify-center font-bold text-xs font-serif border border-white/10">
                      GE
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gold-300 block leading-tight">Geopolítica Económica</span>
                      <span className="text-[10px] text-white/70">Revisión de variables y finanzas</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onFilterCategory('');
                    const searchBox = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (searchBox) searchBox.value = "economía";
                    const event = new CustomEvent('filter-columnist', { detail: 'economía' });
                    window.dispatchEvent(event);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-red-800 text-white flex items-center justify-center font-bold text-xs font-serif border border-white/10">
                      AI
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">Análisis Institucional</span>
                      <span className="text-[10px] text-white/50">Temáticas puramente institucionales</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Quick List under right header */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <span className="text-xs font-bold tracking-wider uppercase text-gold-300 block">Temas Críticos Geopolítica Económica</span>
                {geopoliticaEconomicaPosts.map(art => (
                  <div 
                    key={art.id} 
                    onClick={() => onSelectArticle(art.id)}
                    className="flex space-x-3 cursor-pointer group border-b border-white/5 pb-3"
                  >
                    <img src={art.imageUrl} className="w-14 h-14 object-cover rounded flex-shrink-0 border border-white/5" alt="" />
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-gold-300 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </span>
                      <span className="text-[9px] text-white/50 block font-mono mt-1">{formatDate(art.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </section>
      )}

    </div>
  );
};
