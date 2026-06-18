import React from "react";
import { Logo } from "./Logo";
import { User, ArticleCategory } from "../types";
import { Newspaper, HelpCircle, LayoutDashboard, LogIn, LogOut, BookOpen, MessageSquare, PenTool } from "lucide-react";

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
  return (
    <nav className="border-b border-[#dfba53]/20 bg-[#040c18] sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-md py-4 px-6 md:px-12 flex justify-between items-center transition-all">
      <div className="cursor-pointer" onClick={() => {
        setSelectedCategory("Todo");
        setView("home");
      }}>
        <Logo className="h-10 md:h-11 w-auto" />
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Inicio */}
        <button
          onClick={() => {
            setSelectedCategory("Todo");
            setView("home");
          }}
          className={`text-xs uppercase tracking-wider font-mono px-2.5 py-1.5 rounded transition-all cursor-pointer ${
            currentView === "home" && selectedCategory === "Todo"
              ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
              : "text-slate-300 hover:text-[#dfba53] border border-transparent"
          }`}
        >
          Inicio
        </button>

        {/* Análisis */}
        <button
          onClick={() => {
            setSelectedCategory("Análisis");
            setView("home");
          }}
          className={`text-xs uppercase tracking-wider font-mono px-2.5 py-1.5 rounded transition-all cursor-pointer ${
            currentView === "home" && selectedCategory === "Análisis"
              ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
              : "text-slate-300 hover:text-[#dfba53] border border-transparent"
          }`}
        >
          Análisis
        </button>

        {/* Opinión */}
        <button
          onClick={() => {
            setSelectedCategory("Opinión");
            setView("home");
          }}
          className={`text-xs uppercase tracking-wider font-mono px-2.5 py-1.5 rounded transition-all cursor-pointer ${
            currentView === "home" && selectedCategory === "Opinión"
              ? "text-[#dfba53] bg-[#dfba53]/10 font-bold border border-[#dfba53]/25"
              : "text-slate-300 hover:text-[#dfba53] border border-transparent"
          }`}
        >
          Opinión
        </button>

        {/* Columnistas */}
        <button
          onClick={() => setView("about")}
          className={`text-xs uppercase tracking-wider font-mono px-2.5 py-1.5 rounded transition-all cursor-pointer ${
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
              <span className="hidden sm:inline">Gabinete</span>
            </button>

            {/* Logged in User Profile badge */}
            <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-slate-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-[#dfba53]/40"
              />
              <div className="hidden lg:flex flex-col text-left">
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
                className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-red-950/40 hover:border-red-900/40 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
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
            <span className="hidden sm:inline">Portal</span>
          </button>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
