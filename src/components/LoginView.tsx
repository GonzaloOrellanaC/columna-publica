import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ChevronRight, UserCheck, ShieldCheck, CheckSquare, Square } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onBackToHome: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Debe rellenar todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || "Credenciales incorrectas.");
      }
    } catch (err) {
      setErrorMsg("Error de conexión al servidor editorial.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to prefill login for quick testing
  const handleQuickLogin = (role: 'admin' | 'editor' | 'columnist') => {
    if (role === 'admin') {
      setEmail('admin@columnapublica.cl');
      setPassword('admin123');
    } else if (role === 'editor') {
      setEmail('editor@columnapublica.cl');
      setPassword('columna123');
    } else {
      setEmail('cauvia@columnapublica.cl');
      setPassword('columna123');
    }
    setErrorMsg('');
  };

  return (
    <div className="min-h-[750px] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-[#0A192F]/25 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Left column: Welcome editorial note and visual quote */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-white/5 border-r border-white/10">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase text-gold-300 tracking-widest block">Gobernanza Literaria</span>
            <h2 className="font-serif text-3xl font-extrabold text-white leading-tight">
              La pluma es la verdadera columna de la república.
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Bienvenido al acceso estratégico para redactores, investigadores de opinión pública y directores de columna.
              Ingrese para gestionar sus borradores de análisis o dar visto bueno editorial.
            </p>
          </div>

          <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-bold">Credenciales de Comprobación Rápida:</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="inline-flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Acceso Super Admin</span>
                    <span className="text-[10px] text-white/50">Aprobar, editar, denegar o borrar columnas</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('editor')}
                className="inline-flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-amber-300" />
                  <div>
                    <span className="text-xs font-bold text-white block">Acceso Editor (Aprobaciones)</span>
                    <span className="text-[10px] text-white/50 font-sans">Aprobar y publicar columnas, sin gestión general</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('columnist')}
                className="inline-flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Acceso Columnista (Cauvia)</span>
                    <span className="text-[10px] text-white/50">Escribir borradores y enviar a revisión</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button
              onClick={onBackToHome}
              className="text-xs text-white hover:text-gold-300 underline font-medium cursor-pointer block pt-2 transition-colors"
            >
              ← Volver a Lectura de Columnas
            </button>
          </div>
        </div>

        {/* Right column: Solid Navy Login Card */}
        <div className="bg-[#0c2340]/40 text-white p-8 sm:p-12 flex flex-col justify-center backdrop-blur-md">
          
          {/* Classic Architectural Column symbol */}
          <div className="flex justify-center mb-6">
            <svg className="w-14 h-14 text-gold-400" viewBox="0 0 100 120" fill="currentColor">
              <rect x="20" y="20" width="60" height="5" />
              <rect x="28" y="25" width="44" height="15" />
              <path d="M 28,25 A 9,9 0 0,0 28,40 A 13,13 0 0,1 28,25 Z" />
              <path d="M 72,25 A 9,9 0 0,1 72,40 A 13,13 0 0,0 72,25 Z" />
              <path d="M 23,50 L 77,50 L 72,40 L 28,40 Z" />
              <rect x="30" y="50" width="8" height="60" />
              <rect x="46" y="50" width="8" height="60" />
              <rect x="62" y="50" width="8" height="60" />
              <rect x="20" y="110" width="60" height="5" />
            </svg>
          </div>

          <h3 className="text-center font-serif text-xl font-bold tracking-wider uppercase mb-8 text-white">
            ACCESO A COLUMNISTAS
          </h3>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="redactores@columnapublica.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-white/5 text-white border border-white/10 rounded p-3 pl-10 focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans placeholder-white/20"
                  required
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-white/5 text-white border border-white/10 rounded p-3 pl-10 focus:outline-none focus:border-gold-300 focus:bg-white/10 transition-all font-sans placeholder-white/20"
                  required
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Checkbox "Recordarme" and "Olvidó" link */}
            <div className="flex items-center justify-between text-xs py-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-gold-300" />
                ) : (
                  <Square className="w-4 h-4 text-white/20" />
                )}
                <span>Recordarme</span>
              </button>

              <a href="#" className="text-white/60 hover:text-gold-300 transition-colors">
                ¿Olvidó su contraseña?
              </a>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-300 bg-red-950/40 p-2.5 rounded border border-red-500/20 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-white/5 text-white font-serif font-bold text-xs py-3.5 rounded transition-all cursor-pointer uppercase tracking-widest shadow-md mt-4 border border-transparent"
            >
              {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
