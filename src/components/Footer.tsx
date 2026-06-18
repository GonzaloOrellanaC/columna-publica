import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020710] border-t border-[#dfba53]/15 text-slate-400 py-12 px-6 md:px-12 mt-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Editorial Manifest */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-cinzel text-md text-[#dfba53] font-bold tracking-widest">
            COLUMNA PÚBLICA
          </h4>
          <p className="text-xs text-slate-400 font-serif leading-relaxed italic pr-6">
            "Sostenemos la firme convicción de que la deliberación informada, estructurada sobre los principios de soberanía institucional, macroeconomía científica y un riguroso análisis estratégico, conforma la verdadera columna de sostén para la estabilidad republicana en un orden multilateral multipolar."
          </p>
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
            <a href="mailto:proyectos@omtecnologia.cl" className="hover:text-slate-400 transition-colors underline">
              proyectos@omtecnologia.cl
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
