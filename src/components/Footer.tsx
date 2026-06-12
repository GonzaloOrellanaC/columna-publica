import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: 'home' | 'login' | 'dashboard' | 'about', params?: any) => void;
  onFilterCategory: (cat: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onFilterCategory }) => {
  return (
    <footer className="bg-black/40 text-white mt-16 border-t border-white/10 backdrop-blur-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Logo & Crest */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <Logo light={true} className="h-14 w-auto -ml-3" />
            </div>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed">
              Columna Pública es un foro independiente de opinión y análisis estratégico de alto nivel. 
              Dedicado a desentrañar las claves geopolíticas, económicas e institucionales del Cono Sur.
            </p>
          </div>

          {/* Column 2: Sections */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold tracking-wider text-gold-300 uppercase">Secciones</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button 
                  onClick={() => { onFilterCategory('Análisis'); onNavigate('home'); }} 
                  className="hover:text-gold-300 transition-colors cursor-pointer"
                >
                  Análisis Político
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onFilterCategory('Opinión'); onNavigate('home'); }} 
                  className="hover:text-gold-300 transition-colors cursor-pointer"
                >
                  Tribuna de Opinión
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onFilterCategory('Soberanía Global'); onNavigate('home'); }} 
                  className="hover:text-gold-300 transition-colors cursor-pointer"
                >
                  Soberanía Global
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onFilterCategory('Geopolítica Económica'); onNavigate('home'); }} 
                  className="hover:text-gold-300 transition-colors cursor-pointer"
                >
                  Geopolítica Económica
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold tracking-wider text-gold-300 uppercase">Portal</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button onClick={() => onNavigate('home', { showColumnists: true })} className="hover:text-gold-300 transition-colors cursor-pointer">
                  Nuestros Columnistas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-gold-300 transition-colors cursor-pointer">
                  Editorial y Estándares
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-gold-300 transition-colors cursor-pointer">
                  Acceso a Redacción
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-white/40">
          <p>© 2025-2026 - Columna Pública. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-gold-300 transition-colors">Privacidad Legal</a>
            <a href="#" className="hover:text-gold-300 transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
