import React, { useState, useEffect } from "react";
import { Facebook, MessageCircle, Mail, Instagram, Pencil, X, Check } from "lucide-react";
import { SiteSettings, User } from "../types";

interface FooterProps {
  settings?: SiteSettings;
  currentUser?: User | null;
  onUpdateSettings?: (settings: SiteSettings) => void;
  triggerToast?: (msg: string, type: "success" | "error" | "info") => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, currentUser, onUpdateSettings, triggerToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultConviction = "Sostenemos la firme convicción de que la deliberación informada, estructurada sobre los principios de soberanía institucional, macroeconomía científica y un riguroso análisis estratégico, conforma la verdadera columna de sostén para la estabilidad republicana en un orden multilateral multipolar.";
  const displayConviction = settings?.convictionText || defaultConviction;

  useEffect(() => {
    setTextValue(displayConviction);
  }, [displayConviction]);

  const saveConviction = async () => {
    if (!onUpdateSettings || !triggerToast) return;
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          convictionText: textValue
        })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateSettings(data.settings);
        triggerToast("¡Convicción editorial actualizada!", "success");
        setIsEditing(false);
      } else {
        triggerToast("No se pudo actualizar la convicción editorial.", "error");
      }
    } catch (err) {
      triggerToast("Error de conexión al actualizar.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#020710] border-t border-[#dfba53]/15 text-slate-400 py-12 px-6 md:px-12 mt-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Editorial Manifest */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-cinzel text-md text-[#dfba53] font-bold tracking-widest">
            COLUMNA PÚBLICA
          </h4>
          
          <div className="relative group/footerconv">
            {isEditing ? (
              <div className="space-y-2 max-w-lg">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-[#dfba53]/30 rounded-lg text-slate-100 p-2.5 text-xs focus:outline-none focus:border-[#dfba53] font-serif leading-relaxed"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveConviction}
                    disabled={loading}
                    className="p-1 px-2.5 rounded bg-[#dfba53] text-[#030a16] text-[10px] font-bold font-mono flex items-center space-x-1 hover:bg-[#cfa543] cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => {
                      setTextValue(displayConviction);
                      setIsEditing(false);
                    }}
                    className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2 group">
                <p className="text-xs text-slate-400 font-serif leading-relaxed italic pr-6 transition-all">
                  "{displayConviction}"
                </p>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded border border-slate-800 bg-slate-950 hover:bg-[#dfba53] hover:text-[#030a16] text-[#dfba53] hover:border-[#dfba53] transition-all text-[10px] flex items-center space-x-1 cursor-pointer"
                    title="Editar convicción editorial"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3.5 pt-1">
            <a
              href="https://www.facebook.com/profile.php?id=61576453450034"
              target="_blank"
              rel="noopener noreferrer"
              title="Siga en Facebook"
              className="p-1.5 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-blue-500 hover:border-blue-550/40 transition-all cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/columnapublica/"
              target="_blank"
              rel="noopener noreferrer"
              title="Siga en Instagram"
              className="p-1.5 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-pink-500 hover:border-pink-550/40 transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q"
              target="_blank"
              rel="noopener noreferrer"
              title="Siga en WhatsApp"
              className="p-1.5 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-emerald-500 hover:border-emerald-550/40 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="mailto:contacto@columnapublica.cl"
              title="Contacto Directo"
              className="p-1.5 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-[#dfba53] hover:border-[#dfba53]/50 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            Dirección General: Santiago de Chile. Año de Fundación 2026.
          </div>
        </div>

        {/* Categories Quick link mockup */}
        <div>
          <h5 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold mb-3 border-b border-slate-850 pb-1">
            Secciones
          </h5>
          <ul className="space-y-1 text-xs font-mono">
            <li><span className="hover:text-gold cursor-pointer transition-colors">Soberanía Global</span></li>
            <li><span className="hover:text-gold cursor-pointer transition-colors">Geopolítica Económica</span></li>
            <li><span className="hover:text-gold cursor-pointer transition-colors">Análisis Estratégico</span></li>
            <li><span className="hover:text-gold cursor-pointer transition-colors">Opinión Republicana</span></li>
          </ul>
        </div>

        {/* Corporate specifications */}
        <div>
          <h5 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold mb-3 border-b border-slate-850 pb-1">
            Transparencia
          </h5>
          <ul className="space-y-1 text-xs text-slate-500">
            <li>Suscripción Premium Libre</li>
            <li>Consorcio de Investigadores Libres</li>
            <li>Consejo Técnico de Redacción</li>
            <li>Ecosistema Político - Técnico</li>
          </ul>
        </div>

      </div>

      {/* Under banner */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-slate-600 font-mono gap-4">
        <div className="space-y-1">
          <div>
            © 2026 Columna Pública. Todos los derechos estratégicos del debate reservados.
          </div>
          <div className="text-[9.5px] text-slate-500">
            Desarrollado con rigor técnico por{" "}
            <a 
              href="https://omtecnologia.cl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#dfba53] hover:underline font-bold"
            >
              Gonzalo Orellana
            </a>{" "}
            — Ingeniero en Computación e Informática (
            <a href="mailto:contacto@columnapublica.cl" className="hover:text-slate-400 transition-colors underline">
              contacto@columnapublica.cl
            </a>
            )
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Términos del Ecosistema</span>
          <span>·</span>
          <span>Protocolo de Protección de Fuentes</span>
          <span>·</span>
          <span>Estándar Editorial</span>
          <span>·</span>
          <a 
            href="https://omtecnologia.cl" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-500 hover:text-[#dfba53] transition-colors font-bold"
          >
            OM Tecnología
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
