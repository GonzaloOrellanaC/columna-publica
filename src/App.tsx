import React, { useState, useEffect } from 'react';
import { Article, User } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { DetailView } from './components/DetailView';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { AboutView } from './components/AboutView';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'login' | 'dashboard' | 'about'>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  
  // Filtering & search states managed globally
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showColumnistsList, setShowColumnistsList] = useState(false);

  // Authenticated columnist / admin session
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Articles array on the feed
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // CMS settings managed globally
  const [settings, setSettings] = useState<{
    siteName: string;
    siteSubtitle: string;
    alertBannerText: string;
    heroLayout: 'editorial' | 'classic' | 'dense';
    enableAboutPage: boolean;
    enableColumnistSidebar: boolean;
    enableAiAssistant: boolean;
    enableDynamicTicker: boolean;
  } | null>(null);

  useEffect(() => {
    // Restore user session if preserved
    const cached = localStorage.getItem('columna_publica_session');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem('columna_publica_session');
      }
    }

    // Load initial articles from DB
    loadArticlesOverview();

    // Load initial CMS configurations
    loadCmsSettings();

    // Setup listener for search callback custom triggers (for quick columnists filtration)
    const handleFilterColumnist = (e: Event) => {
      const authorName = (e as CustomEvent).detail;
      setSearchQuery(authorName);
      setSelectedCategory('');
      setShowColumnistsList(false);
      setCurrentView('home');
    };

    window.addEventListener('filter-columnist', handleFilterColumnist);
    window.addEventListener('cms-settings-updated', loadCmsSettings);
    return () => {
      window.removeEventListener('filter-columnist', handleFilterColumnist);
      window.removeEventListener('cms-settings-updated', loadCmsSettings);
    };
  }, []);

  const loadCmsSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("[App] Dynamic loader settings error:", err);
    }
  };

  const loadArticlesOverview = async () => {
    setLoadingArticles(true);
    try {
      const isDemoPath = window.location.pathname === '/demo';
      const res = await fetch(`/api/articles?includeDrafts=true${isDemoPath ? '&isDemoPath=true' : ''}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error("[App] Network error retrieving public articles:", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleLoginSuccess = (userSession: User) => {
    setCurrentUser(userSession);
    localStorage.setItem('columna_publica_session', JSON.stringify(userSession));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('columna_publica_session');
    setCurrentView('home');
  };

  const handleNavbarNavigate = (view: 'home' | 'login' | 'dashboard' | 'about', params?: any) => {
    if (params?.showColumnists) {
      setShowColumnistsList(true);
      setSelectedCategory('');
      setSearchQuery('');
    } else {
      setShowColumnistsList(false);
    }
    
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setShowColumnistsList(false);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Separate Full-page screen renderers to match the exact mockup specs
  if (currentView === 'login') {
    return (
      <div className="bg-[#050B14] min-h-screen flex flex-col justify-between">
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentView('home')}
        />
        <div className="text-center py-6 text-xs text-white/40 bg-black/40 border-t border-white/10">
          Columna Pública — Todos los derechos reservados. go.orellana.c@gmail.com
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    if (!currentUser) {
      setCurrentView('login');
      return null;
    }
    return (
      <DashboardView
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateHome={() => {
          loadArticlesOverview(); // Refresh any potential changes made inside backoffice
          setCurrentView('home');
        }}
      />
    );
  }

  // Common Layout (Header, Scrollable main view, Footer)
  return (
    <div className="flex flex-col min-h-screen bg-[#050B14]">
      
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleNavbarNavigate}
        onSearch={(query) => {
          setSearchQuery(query);
          setSelectedCategory('');
          setShowColumnistsList(false);
        }}
        onLogout={handleLogout}
        settings={settings}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomeView
            articles={articles}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSelectArticle={handleSelectArticle}
            onFilterCategory={handleSelectCategory}
            showColumnistsList={showColumnistsList}
            settings={settings}
          />
        )}

        {currentView === 'detail' && selectedArticleId && (
          <DetailView
            articleId={selectedArticleId}
            onBackToHome={() => {
              loadArticlesOverview(); // Refresh reads views
              setCurrentView('home');
            }}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentView === 'about' && (
          <AboutView 
            onNavigateHome={() => setCurrentView('home')} 
          />
        )}
      </main>

      {/* Corporate Navy Footer */}
      <Footer 
        onNavigate={handleNavbarNavigate} 
        onFilterCategory={handleSelectCategory} 
      />

    </div>
  );
}
