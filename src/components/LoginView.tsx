import React, { useState, useEffect } from "react";
import { User } from "../types";
import { UserCheck, Shield, KeyRound, Mail, Sparkles, UserPlus, ArrowLeft, Lock } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
  siteSettings: { enableRegistrations: boolean };
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, triggerToast, siteSettings }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration states toggle
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regAvatar, setRegAvatar] = useState("");

  // Password recovery states
  const [recoveryToken, setRecoveryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Extract recovery token from URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get("recoveryToken");
    if (tok) {
      setRecoveryToken(tok);
      setIsForgotMode(false);
      setIsRegistering(false);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("Correo y contraseña son requeridos.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("¡Bienvenido al Gabinete de Prensa de Columna Pública!", "success");
        onLoginSuccess(data.user);
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión con el portal editorial.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      triggerToast("Los campos obligatorios deben ser completados.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: regEmail,
        password: regPassword,
        name: regName,
        bio: regBio,
        avatar: regAvatar || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150`,
        role: "columnist"
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Registro formal completado. Inicie sesión ahora.", "success");
        setEmail(regEmail);
        setPassword(regPassword);
        setIsRegistering(false);
        // Clear reg states
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegBio("");
        setRegAvatar("");
      } else {
        triggerToast("Fallo el registro: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión durante el registro.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Demo user access shortcuts
  const handleFastlogin = async (demoEmail: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Acceso de demostración otorgado.", "success");
        onLoginSuccess(data.user);
      } else {
        triggerToast("Error de Fastlogin: " + data.message, "error");
      }
    } catch (err) {
      triggerToast("Error de conexión en acceso rápido.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      triggerToast("Por favor, ingrese un correo institucional.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(data.message, "success");
        setIsForgotMode(false);
        setEmail(forgotEmail);
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión al intentar recuperar la cuenta.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      triggerToast("Todos los campos son requeridos.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("Las contraseñas no coinciden.", "error");
      return;
    }
    if (newPassword.length < 6) {
      triggerToast("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recoveryToken, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(data.message, "success");
        // Clear token from URL without full reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        setRecoveryToken("");
        setNewPassword("");
        setConfirmPassword("");
        setIsForgotMode(false);
      } else {
        triggerToast("Error: " + data.message, "error");
      }
    } catch (err: any) {
      triggerToast("Error de conexión al reconfigurar acceso.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-8 font-sans">
      
      {/* Visual Header */}
      <div className="text-center space-y-2">
        <h2 className="font-cinzel text-xl md:text-2xl font-bold tracking-widest text-[#dfba53]">
          PORTAL EDITORIAL DE PRENSA
        </h2>
        <p className="text-xs font-mono text-slate-400">Gabinete Técnico de Redactores</p>
        <div className="h-[2px] w-12 bg-[#dfba53]/50 mx-auto mt-2"></div>
      </div>

      <div className="bg-[#051122] border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative gold aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfba53]/5 rounded-full blur-2xl pointer-events-none"></div>

        {recoveryToken ? (
          /* RESET PASSWORD FORM */
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#dfba53] uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#dfba53]" />
              Restablecer Contraseña
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mb-2">
              Ingrese su nueva contraseña de acceso institucional.
            </p>

            <div>
              <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-semibold mb-1">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#dfba53] font-mono pl-9"
                />
                <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-semibold mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Repita la nueva contraseña..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#dfba53] font-mono pl-9"
                />
                <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dfba53] text-[#030a16] py-2.5 font-bold text-xs uppercase tracking-wider font-mono rounded hover:bg-yellow-400 transition-colors cursor-pointer shadow-md shadow-[#dfba53]/10 grayscale-0 hover:scale-[1.01] active:scale-95 duration-200 transition-all"
            >
              {loading ? "Reconfigurando Clave..." : "Establecer Nueva Contraseña"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecoveryToken("");
                  const newUrl = window.location.pathname;
                  window.history.replaceState({}, document.title, newUrl);
                }}
                className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Login</span>
              </button>
            </div>
          </form>
        ) : isForgotMode ? (
          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#dfba53] uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#dfba53]" />
              Recuperar Contraseña
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mb-2">
              Ingrese su correo institucional registrado. Le enviaremos un enlace seguro para restablecer su clave.
            </p>

            <div>
              <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-semibold mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="ejemplo@columnapublica.cl"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#dfba53] font-mono pl-9"
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dfba53] text-[#030a16] py-2.5 font-bold text-xs uppercase tracking-wider font-mono rounded hover:bg-yellow-400 transition-colors cursor-pointer shadow-md shadow-[#dfba53]/10 duration-200"
            >
              {loading ? "Despachando Solicitud..." : "Enviar Enlace Seguro"}
            </button>

            <button
              type="button"
              onClick={() => setIsForgotMode(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 font-mono flex items-center justify-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              Volver al Inicio de Sesión
            </button>
          </form>
        ) : !isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-semibold mb-1">
                Correo Institucional *
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="ejemplo@columnapublica.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#dfba53] font-mono pl-9"
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10.5px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                  Contraseña Segura *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-[10.5px] text-[#dfba53] hover:underline font-mono"
                >
                  ¿Olvidó su clave?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Contraseña del gabinete..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#dfba53] font-mono pl-9"
                />
                <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dfba53] text-[#030a16] py-2.5 font-bold text-xs uppercase tracking-wider font-mono rounded hover:bg-yellow-400 transition-colors cursor-pointer shadow-md shadow-[#dfba53]/10"
            >
              {loading ? "Verificando Credenciales..." : "Iniciar Sesión"}
            </button>


          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#dfba53] uppercase border-b border-slate-850 pb-1 flex items-center">
              <UserPlus className="w-4 h-4 mr-1" /> Registro de Autor Cooperador
            </h3>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">Nombre Completo *</label>
              <input
                type="text"
                placeholder="Dr. César Calderón"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">Correo Electrónico *</label>
              <input
                type="email"
                placeholder="cesar@columnapublica.cl"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">Contraseña Inicial *</label>
              <input
                type="password"
                placeholder="Escriba contraseña segura..."
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">URL del Avatar (Foto de Perfil)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={regAvatar}
                onChange={(e) => setRegAvatar(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">Biografía / Línea Profesional</label>
              <textarea
                placeholder="Ej. Economista especializado en políticas públicas..."
                rows={2}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53]"
              />
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="w-1/2 p-2 bg-slate-900 hover:bg-slate-850 rounded text-slate-300 font-mono"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 p-2 bg-[#dfba53] text-[#030a16] rounded font-mono font-semibold"
              >
                Completar Registro
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default LoginView;
