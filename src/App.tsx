import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomeView } from "./components/HomeView";
import { AboutView } from "./components/AboutView";
import { DetailView } from "./components/DetailView";
import { LoginView } from "./components/LoginView";
import { DashboardView } from "./components/DashboardView";
import { User, Article, SiteSettings, ArticleCategory } from "./types";
import { Newspaper, Bell } from "lucide-react";

export const App: React.FC = () => {
  const [currentView, setView] = useState<string>("home");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | "Todo">("Todo");

  // Global Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Articles & Settings Lists State
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Columna Pública",
    siteSubtitle: "Asuntos Políticos, Macroeconomía e Inserción Global",
    enableComments: true,
    enableAIAdviser: true,
    enableRegistrations: true,
    enableShareButtons: true,
    heroLayout: "editorial",
    alertBannerText: "Última Edición: Análisis estratégico de geopolítica regional y soberanía institucional chilenas."
  });

  // Custom Notifications Toast System
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | null }>({
    message: "",
    type: null
  });

  const triggerToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    // Auto-clear after 3.5s
    setTimeout(() => {
      setToast({ message: "", type: null });
    }, 4500);
  };

  // Fetch all articles
  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error("[App] Failed to fetch articles data", e);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Fetch Site Settings from Backend
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.settings);
      }
    } catch (e) {
      console.error("[App] Failed to fetch settings data", e);
    }
  };

  // Try parsing session on load
  useEffect(() => {
    const saved = localStorage.getItem("columna_publica_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
          setCurrentUser(parsed);
          triggerToast(`Sesión restablecida para ${parsed.name}`, "info");
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchArticles();
    fetchSettings();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("columna_publica_session", JSON.stringify(user));
    // Redirect to cabinet dashboard
    setView("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("columna_publica_session");
    triggerToast("Sesión finalizada correctamente.", "info");
    setView("home");
  };

  const handleSelectArticleDetail = (id: string) => {
    setSelectedArticleId(id);
    setView("detail");
  };

  return (
    <div className="min-h-screen bg-[#030a16] text-[#e2e8f0] flex flex-col justify-between selection:bg-[#dfba53]/30 selection:text-white">
      
      {/* COHESIVE NAVIGATION ELEMENT */}
      <Navbar
        currentView={currentView}
        setView={(view) => {
          setView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* CUSTOM TOAST NOTIFICATION FLOATING PORTAL */}
      {toast.type && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className={`p-4 rounded-xl border shadow-xl flex items-center space-x-3 text-xs font-mono select-none ${
            toast.type === "success"
              ? "bg-[#052115] border-emerald-800 text-emerald-400"
              : toast.type === "error"
              ? "bg-[#25090f] border-rose-900 text-rose-400"
              : "bg-[#04172c] border-sky-900 text-sky-400"
          }`}>
            <Bell className="w-4 h-4 animate-swing text-[#dfba53]" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* SCENARIO RENDERING FLOWS */}
      <main className="flex-grow transition-all duration-300">
        {currentView === "home" && (
          <HomeView
            articles={articles}
            settings={siteSettings}
            onSelectArticle={handleSelectArticleDetail}
            isLoading={articlesLoading}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentView === "about" && (
          <AboutView 
            users={[]} // Handled with default seed data
            articles={articles} 
          />
        )}

        {currentView === "detail" && (
          <DetailView
            articleId={selectedArticleId}
            onBack={() => setView("home")}
            settings={siteSettings}
            currentUser={currentUser}
            triggerToast={triggerToast}
          />
        )}

        {currentView === "login" && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            triggerToast={triggerToast}
            siteSettings={siteSettings}
          />
        )}

        {currentView === "dashboard" && currentUser && (
          <DashboardView
            currentUser={currentUser}
            settings={siteSettings}
            updateSettingsInApp={(newSettings) => setSiteSettings(newSettings)}
            fetchArticlesExternal={fetchArticles}
            triggerToast={triggerToast}
            articles={articles}
          />
        )}
      </main>

      {/* SOGNIFICATIVE FOOTER ELEMENT */}
      <Footer />

    </div>
  );
};
export default App;
