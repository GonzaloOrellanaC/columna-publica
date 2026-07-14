import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, UserCheck, AlertCircle } from "lucide-react";
import { goHomeOrBack } from "../utils/navigation";

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    goHomeOrBack(navigate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 font-sans text-slate-100">
      
      {/* Back Button with Lucide icon */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-[#dfba53] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#dfba53]" />
          <span>Volver a la vista previa</span>
        </button>
      </div>

      {/* Visual Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-mono text-[#dfba53]/90 bg-[#dfba53]/5 border border-[#dfba53]/20 py-1.5 px-4 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#dfba53]" />
          <span>Soberanía Digital • Protección y Privacidad</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-white tracking-wide">
          Política de Protección de Datos
        </h1>
        
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 font-mono tracking-wide uppercase">
          En observancia y consonancia con los altos estándares de deliberación pública y secreto profesional editorial.
        </p>
      </div>

      {/* Content Layout - Editorial Grid (Bento or clean list) */}
      <div className="space-y-12 font-serif text-slate-300 leading-relaxed text-sm sm:text-base">
        
        <section className="bg-slate-950/40 border border-slate-905 p-6 sm:p-8 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-900 pb-3">
            <Lock className="w-5 h-5 text-[#dfba53]" />
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-white tracking-wider uppercase">
              1. Principio de Minimización de Datos
            </h2>
          </div>
          <p>
            En <strong>Columna Pública</strong>, la recopilación de antecedentes personales es estrictamente limitada. Recabamos únicamente la información indispensable para garantizar la participación legítima, la prevención de mecanismos automatizados de manipulación de opinión (spam) y el correcto flujo del proceso editorial.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <section className="bg-[#040e1f] border border-slate-900/60 p-6 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <Database className="w-4 h-4 text-[#dfba53]" />
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
                Datos Recopilados
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-400">
              <li><strong>Información de Validación:</strong> Nombres, apellidos y dirección de correo electrónico institucional o personal.</li>
              <li><strong>Credenciales del Gabinete:</strong> Claves encriptadas mediante algoritmos irreversibles (hashes criptográficos).</li>
              <li><strong>Postulaciones de Columnistas:</strong> Currículo, antecedentes académicos y propuestas de redacción bajo secreto editorial.</li>
            </ul>
          </section>

          <section className="bg-[#040e1f] border border-slate-900/60 p-6 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <EyeOff className="w-4 h-4 text-[#dfba53]" />
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
                Uso Exclusivo
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Los datos recolectados no serán jamás vendidos, arrendados o transferidos a entidades analíticas de mercadeo externo, gobiernos o corporaciones transnacionales. La información se almacena con el único propósito de validar las lecturas, sostener los hilos de debate e inscribir postulantes.
            </p>
          </section>

        </div>

        <section className="bg-slate-950/40 border border-[#dfba53]/10 p-6 sm:p-8 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-900 pb-3 border-dashed">
            <UserCheck className="w-5 h-5 text-[#dfba53]" />
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-white tracking-wider uppercase">
              2. Derechos del Lector (Derecho de Supresión)
            </h2>
          </div>
          <p>
            Cualquier ciudadano o lector debidamente validado posee la potestad irrestricta de solicitar la supresión perpetua de su historial analítico, direcciones de correo, perfiles en el gabinete de control o contribución a debates públicos. Su identidad digital y correspondencias de validación se eliminarán de nuestros repositorios de manera inmediata de acuerdo a nuestras normas internas.
          </p>
          <div className="bg-[#dfba53]/5 border border-[#dfba53]/20 p-4 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#dfba53] shrink-0 mt-0.5" />
            <div className="text-xs text-[#dfba53]/90 font-mono tracking-wide uppercase space-y-1">
              <span className="font-bold block">Contacto Institucional para Asuntos de Privacidad:</span>
              <span className="block italic select-all">privacidad@columnapublica.cl</span>
            </div>
          </div>
        </section>

        {/* Footer info statement page */}
        <section className="text-center pt-8 border-t border-slate-900">
          <p className="text-xs font-mono text-slate-500 max-w-xl mx-auto">
            La presente política se rige bajo la doctrina de neutralidad de datos en la red, resguardando la soberanía republicana chilena y el secreto profesional periodístico.
          </p>
          
          <button
            onClick={handleBack}
            className="mt-6 px-6 py-2 border border-[#dfba53]/30 text-[#dfba53] hover:bg-[#dfba53] hover:text-[#030a16] transition-all font-mono text-xs font-bold uppercase rounded cursor-pointer duration-300"
          >
            Aceptar y Regresar
          </button>
        </section>

      </div>

    </div>
  );
};

export default PrivacyPolicy;
