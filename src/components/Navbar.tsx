import React, { useState } from "react";
import { Logo } from "./Logo";
import { User, ArticleCategory } from "../types";
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  selectedCategory: ArticleCategory | "Todo";
  setSelectedCategory: (category: ArticleCategory | "Todo") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setView,
  currentUser,
  onLogout,
  selectedCategory,
  setSelectedCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Helper inside click handlers
  const handleLogoClick = () => {
    setSelectedCategory("Todo");
    setView("home");
    setIsOpen(false);
    navigate("/");
  };

  const handleCategoryNav = (cat: ArticleCategory | "Todo") => {
    setSelectedCategory(cat);
    setView("home");
    setIsOpen(false);
    
    // We give a short delay to survive page transitions and layout changes
    setTimeout(() => {
      if (cat === "Todo") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(`categoria-${cat}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 150);
  };

  const handleMenuClick = (view: string, category?: ArticleCategory | "Todo") => {
    if (category !== undefined) {
      setSelectedCategory(category);
    }
    setView(view);
    setIsOpen(false);
  };

  return (
    <nav className="border-b border-[#dfba53]/20 bg-[#040c18] sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-md transition-all">
      <div className="max-w-7xl mx-auto py-4 px-6 md:px-12 flex justify-between items-center">
        {/* LOGO */}
        <div className="cursor-pointer" onClick={() => {navigate("/");}}>
          <Logo className="h-10 md:h-11 w-auto" />
        </div>

        {/* DESKTOP NAVIGATION MENU (lg and up) */}
        <div className="hidden lg:flex items-center space-x-2.5">
          {/* Inicio */}
          <button
            onClick={() => {
              navigate("/");
            }}
            className={`text-[11px] uppercase tracking-wider font-mono px-2 py-1.5 rounded transition-all cursor-pointer ${
              currentView === "home" && selectedCategory === "Todo"
                ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                : "text-slate-300 hover:text-[#dfba53] border border-transparent"
            }`}
          >
            Inicio
          </button>

          {/* Quiénes Somos */}
          <button
            onClick={() => setView("quienessomos")}
            className={`text-[11px] uppercase tracking-wider font-mono px-2 py-1.5 rounded transition-all cursor-pointer ${
              currentView === "quienessomos"
                ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                : "text-slate-300 hover:text-[#dfba53] border border-transparent"
            }`}
          >
            Quiénes Somos
          </button>

          {/* Columnistas */}
          <button
            onClick={() => setView("about")}
            className={`text-[11px] uppercase tracking-wider font-mono px-2 py-1.5 rounded transition-all cursor-pointer ${
              currentView === "about"
                ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                : "text-slate-300 hover:text-[#dfba53] border border-transparent"
            }`}
          >
            Columnistas
          </button>

          {currentUser ? (
            <>
              <button
                onClick={() => setView("dashboard")}
                className={`flex items-center space-x-1 text-xs uppercase tracking-wider font-mono px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                  currentView === "dashboard"
                    ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                    : "text-slate-300 hover:text-[#dfba53] hover:bg-[#dfba53]/5 border border-transparent"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#dfba53]" />
                <span>Gabinete</span>
              </button>

              {/* Logged in User Profile badge */}
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#dfba53]/40"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight font-sans">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-[#dfba53]">
                    {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'editor' ? 'Editor' : 'Columnista'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:border-red-900/40 rounded text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setView("login")}
              className="flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold font-mono bg-[#dfba53] text-[#030a16] px-3 py-1.5 rounded hover:bg-yellow-400 transition-all shadow-md shadow-[#dfba53]/10 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal</span>
            </button>
          )}
        </div>

        {/* MOBILE / TABLET MENU TOGGLE BUTTON (lg:hidden) */}
        <div className="flex lg:hidden items-center space-x-3">
          {currentUser && (
            <div className="flex items-center space-x-2 mr-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#dfba53]/40 cursor-pointer"
                onClick={() => handleMenuClick("dashboard")}
              />
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-[#dfba53] focus:outline-none focus:ring-1 focus:ring-[#dfba53]/30 rounded transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET ANIMATED DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-[#dfba53]/10 bg-[#040c18] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col space-y-2.5">
              {/* Menu items */}
              <button
                onClick={() => {
                  handleCategoryNav("Todo");
                  navigate("/");
                }}
                className={`w-full text-left text-xs uppercase tracking-wider font-mono px-3 py-2.5 rounded transition-all flex items-center space-x-2 cursor-pointer ${
                  currentView === "home" && selectedCategory === "Todo"
                    ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                    : "text-slate-300 hover:text-[#dfba53] hover:bg-slate-900 border border-transparent"
                }`}
              >
                <span>Inicio</span>
              </button>

              <button
                onClick={() => handleMenuClick("quienessomos")}
                className={`w-full text-left text-xs uppercase tracking-wider font-mono px-3 py-2.5 rounded transition-all flex items-center space-x-2 cursor-pointer ${
                  currentView === "quienessomos"
                    ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                    : "text-slate-300 hover:text-[#dfba53] hover:bg-slate-900 border border-transparent"
                }`}
              >
                <span>Quiénes Somos</span>
              </button>

              <button
                onClick={() => handleMenuClick("about")}
                className={`w-full text-left text-xs uppercase tracking-wider font-mono px-3 py-2.5 rounded transition-all flex items-center space-x-2 cursor-pointer ${
                  currentView === "about"
                    ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                    : "text-slate-300 hover:text-[#dfba53] hover:bg-slate-900 border border-transparent"
                }`}
              >
                <span>Columnistas</span>
              </button>

              {currentUser ? (
                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  {/* Gabinete Button */}
                  <button
                    onClick={() => handleMenuClick("dashboard")}
                    className={`w-full text-left flex items-center space-x-2 text-xs uppercase tracking-wider font-mono px-3 py-2.5 rounded transition-all cursor-pointer ${
                      currentView === "dashboard"
                        ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
                        : "text-slate-300 hover:text-[#dfba53] hover:bg-slate-900 border border-transparent"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#dfba53]" />
                    <span>Gabinete</span>
                  </button>

                  {/* Profile info & logout */}
                  <div className="p-3 bg-slate-900/50 border border-slate-800/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#dfba53]/40"
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-white font-sans">
                          {currentUser.name}
                        </span>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#dfba53]">
                          {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'editor' ? 'Editor' : 'Columnista'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      className="p-2 bg-red-950/25 border border-red-900/40 rounded hover:bg-red-950/60 transition-all text-red-400 cursor-pointer"
                      title="Cerrar Sesión"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleMenuClick("login")}
                    className="w-full flex items-center justify-center space-x-2 text-xs uppercase tracking-wider font-bold font-mono bg-[#dfba53] text-[#030a16] py-2.5 rounded hover:bg-yellow-400 transition-all shadow-md cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Portal</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
