import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { QuienesSomos } from "./pages/QuienesSomos";
import { Detail } from "./pages/Detail";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { User, Article, SiteSettings, ArticleCategory } from "./types";
import { Bell } from "lucide-react";

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active view label for Navbar active highlighting
  const currentView = location.pathname.startsWith("/columna")
    ? "detail"
    : location.pathname.startsWith("/columnistas")
    ? "about"
    : location.pathname.startsWith("/quienes-somos")
    ? "quienessomos"
    : location.pathname.startsWith("/portal")
    ? "login"
    : location.pathname.startsWith("/gabinete")
    ? "dashboard"
    : "home";

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
    alertBannerText: "Última Edición: Análisis estratégico de geopolítica regional y soberanía institucional chilenas.",
    convictionText: "Sostenemos la firme convicción de que la deliberación informada, estructurada sobre los principios de soberanía institucional, macroeconomía científica y un riguroso análisis estratégico, conforma la verdadera columna de sostén para la estabilidad republicana en un orden multilateral multipolar.",
    quienesSomosTitle: "¿Quiénes Somos?",
    quienesSomosDescription: "Somos un foro deliberativo técnico-político e independiente dedicado al análisis geopolítico de vanguardia y la inserción de las bases institucionales.",
    quienesSomosPeople: [],
    editorialSlogan: "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas.",
    facebookUrl: "https://www.facebook.com/profile.php?id=61576453450034",
    instagramUrl: "https://www.instagram.com/columnapublica/",
    whatsappUrl: "https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q",
    mailContactUrl: "contacto@columnapublica.cl"
  });

  // Custom Notifications Toast System
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | null }>({
    message: "",
    type: null
  });

  const triggerToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    // Auto-clear after 4.5s
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
    navigate("/gabinete");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("columna_publica_session");
    triggerToast("Sesión finalizada correctamente.", "info");
    navigate("/");
  };

  const setViewWrapper = (view: string) => {
    if (view === "home") {
      setSelectedCategory("Todo");
      navigate("/");
    } else if (view === "about") {
      navigate("/columnistas");
    } else if (view === "quienessomos") {
      navigate("/quienes-somos");
    } else if (view === "login") {
      navigate("/portal");
    } else if (view === "dashboard") {
      navigate("/gabinete");
    }
  };

  return (
    <div className="min-h-screen bg-[#030a16] text-[#e2e8f0] flex flex-col justify-between selection:bg-[#dfba53]/30 selection:text-white">
      
      {/* COHESIVE NAVIGATION ELEMENT */}
      <Navbar
        currentView={currentView}
        setView={(view) => {
          setViewWrapper(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat === "Todo") {
            navigate("/");
          } else {
            const slugs: Record<string, string> = {
              "Soberanía Global": "soberania-global",
              "Geopolítica Económica": "geopolitica-economica",
              "Análisis": "analisis",
              "Opinión": "opinion"
            };
            navigate(`/seccion/${slugs[cat] || "todo"}`);
          }
        }}
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

      {/* REACT ROUTER ROUTING ENTRANCE */}
      <main className="flex-grow transition-all duration-300">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                articles={articles}
                settings={siteSettings}
                isLoading={articlesLoading}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                currentUser={currentUser}
                onUpdateSettings={setSiteSettings}
                triggerToast={triggerToast}
              />
            }
          />
          <Route
            path="/seccion/:categorySlug"
            element={
              <Home
                articles={articles}
                settings={siteSettings}
                isLoading={articlesLoading}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                currentUser={currentUser}
                onUpdateSettings={setSiteSettings}
                triggerToast={triggerToast}
              />
            }
          />
          <Route
            path="/columnistas"
            element={<About articles={articles} />}
          />
          <Route
            path="/quienes-somos"
            element={
              <QuienesSomos
                settings={siteSettings}
                currentUser={currentUser}
                onUpdateSettings={setSiteSettings}
                triggerToast={triggerToast}
              />
            }
          />
          <Route
            path="/columna/:slug"
            element={
              <Detail
                articles={articles}
                articlesLoading={articlesLoading}
                settings={siteSettings}
                currentUser={currentUser}
                triggerToast={triggerToast}
              />
            }
          />
          <Route
            path="/portal"
            element={
              <Login
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
                triggerToast={triggerToast}
                siteSettings={siteSettings}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
                triggerToast={triggerToast}
                siteSettings={siteSettings}
              />
            }
          />
          <Route
            path="/gabinete"
            element={
              <Dashboard
                currentUser={currentUser}
                settings={siteSettings}
                updateSettingsInApp={setSiteSettings}
                fetchArticlesExternal={fetchArticles}
                triggerToast={triggerToast}
                articles={articles}
              />
            }
          />
          <Route
            path="/politica-privacidad"
            element={<PrivacyPolicy />}
          />
          {/* Fallback route back to home */}
          <Route
            path="*"
            element={
              <Home
                articles={articles}
                settings={siteSettings}
                isLoading={articlesLoading}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                currentUser={currentUser}
                onUpdateSettings={setSiteSettings}
                triggerToast={triggerToast}
              />
            }
          />
        </Routes>
      </main>

      {/* SIGNIFICATIVE FOOTER ELEMENT */}
      <Footer 
        settings={siteSettings} 
        currentUser={currentUser} 
        onUpdateSettings={setSiteSettings} 
        triggerToast={triggerToast} 
      />

    </div>
  );
};

export default App;
