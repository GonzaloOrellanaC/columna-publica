import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import { Search, LogOut, LayoutDashboard, UserCheck, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (view: 'home' | 'login' | 'dashboard' | 'about', params?: any) => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
  settings?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onNavigate, onSearch, onLogout, settings }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    onNavigate('home');
  };

  const clearSearch = () => {
    setSearchVal('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050B14]/80 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => { clearSearch(); onNavigate('home'); }}>
            <Logo light={true} className="h-12 w-auto" siteName={settings?.siteName} />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => { clearSearch(); onNavigate('home'); }}
              className="text-white/80 hover:text-gold-300 font-medium text-sm transition-colors cursor-pointer border-b-2 border-transparent hover:border-gold-300 py-1"
            >
              Inicio
            </button>
            <button
              onClick={() => { onSearch('Análisis'); onNavigate('home'); }}
              className="text-white/80 hover:text-gold-300 font-medium text-sm transition-colors cursor-pointer border-b-2 border-transparent hover:border-gold-300 py-1"
            >
              Análisis
            </button>
            <button
              onClick={() => { onSearch('Opinión'); onNavigate('home'); }}
              className="text-white/80 hover:text-gold-300 font-medium text-sm transition-colors cursor-pointer border-b-2 border-transparent hover:border-gold-300 py-1"
            >
              Opinión
            </button>
            <button
              onClick={() => { onNavigate('home', { showColumnists: true }); }}
              className="text-white/80 hover:text-gold-300 font-medium text-sm transition-colors cursor-pointer border-b-2 border-transparent hover:border-gold-300 py-1"
            >
              Columnistas
            </button>
            {(!settings || settings.enableAboutPage !== false) && (
              <button
                onClick={() => onNavigate('about')}
                className="text-white/80 hover:text-gold-300 font-medium text-sm transition-colors cursor-pointer border-b-2 border-transparent hover:border-gold-300 py-1"
              >
                Acerca
              </button>
            )}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className={`relative flex items-center transition-all duration-300 ${searchOpen ? 'w-48 sm:w-64' : 'w-8'}`}>
              <input
                type="text"
                placeholder="Buscar columnas..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className={`w-full py-1.5 pl-3 pr-8 text-xs bg-white/5 text-white placeholder-white/40 rounded-md border border-white/15 outline-none focus:border-gold-300 focus:ring-1 focus:ring-gold-300 transition-all ${
                  searchOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="absolute right-1 text-white/60 hover:text-gold-300 p-1 rounded-full cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Auth section */}
            {currentUser ? (
              <div className="flex items-center space-x-3 border-l border-white/10 pl-4">
                <div 
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center cursor-pointer group"
                >
                  <img
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-gold-300 group-hover:border-gold-400 transition-all"
                  />
                  <div className="hidden lg:flex flex-col ml-2 text-left">
                    <span className="text-xs font-semibold text-white group-hover:text-gold-300 transition-all leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-white/60 flex items-center leading-none mt-0.5">
                      {currentUser.role === 'admin' ? (
                        <>
                          <ShieldAlert className="w-3 h-3 text-red-400 mr-0.5 inline" />
                          Super Admin
                        </>
                      ) : currentUser.role === 'editor' ? (
                        <>
                          <UserCheck className="w-3 h-3 text-amber-400 mr-0.5 inline" />
                          Editor
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-400 mr-0.5 inline" />
                          Columnista
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-all cursor-pointer"
                  title="Panel de Control"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center px-4 py-2 text-xs font-medium tracking-wider text-white bg-transparent hover:bg-white/5 focus:outline-none rounded border border-white/10 cursor-pointer shadow-sm transition-all font-serif"
              >
                ACCESO COLUMNISTAS
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
