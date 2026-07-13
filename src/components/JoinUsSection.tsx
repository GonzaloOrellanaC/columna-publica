import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenTool, CheckCircle, AlertCircle, Upload, Sparkles, User, Mail, Award, Compass, MessageSquare, FileText, ArrowRight, ShieldAlert, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ArticleCategory } from "../types";
import { FileUploader } from "./FileUploader";

export const JoinUsSection: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState("");
  const [motivation, setMotivation] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("Soberanía Global");
  const [documentUrl, setDocumentUrl] = useState("");
  
  // Status states
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setDocumentUrl(data.url);
      } else {
        setError(data.message || "No se pudo subir el archivo de postulación.");
      }
    } catch (err) {
      setError("Error de red al intentar subir el documento.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !degree || !motivation) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          degree,
          motivation,
          category,
          documentUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Clear fields
        setName("");
        setEmail("");
        setDegree("");
        setMotivation("");
        setDocumentUrl("");
        setFileName("");
      } else {
        setError(data.message || "Ocurrió un error al enviar tu postulación.");
      }
    } catch (err) {
      setError("Fallo la comunicación con el servidor. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-gradient-to-br from-[#040f1d] to-[#010610] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Elegant Writer Invitation Block */}
      <div className="p-8 md:p-10 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#dfba53]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-6 top-6 opacity-10 pointer-events-none">
          <PenTool className="w-48 h-48 text-[#dfba53]" />
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#dfba53]/10 border border-[#dfba53]/20 rounded-full text-xs font-mono font-bold text-[#dfba53]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONVOCATORIA EDITORIAL ABIERTA</span>
          </div>

          <h3 className="font-serif text-2xl md:text-3xl font-extrabold text-white tracking-wide leading-tight">
            ¿Es usted Académico, Analista o Investigador? <span className="text-[#dfba53]">Escriba con nosotros</span>
          </h3>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
            Columna Pública es un consorcio doctrinario libre y soberano. Buscamos plumas de alto nivel 
            técnico en ciencias políticas, soberanía de datos, derecho constiticional, macroeconomía del 
            Cono Sur e integración regional. Si desea incidir con rigor en debates estratégicos estructurados, 
            le invitamos a postularse como Miembro Columnista Permanente.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#dfba53] to-[#cfa543] text-[#030a16] font-bold text-xs font-mono px-5 py-3 rounded-lg shadow-lg shadow-[#dfba53]/15 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <span>Postular como Columnista</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center text-[10px] text-slate-400 font-mono space-x-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Recepción permanente bajo encriptación</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sleek Deployable Contact Form with Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="border-t border-slate-800/80 bg-slate-950/40"
          >
            <div className="p-8 md:p-10 border-t border-slate-900 bg-gradient-to-b from-slate-950/80 to-[#020814]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h4 className="font-mono text-xs uppercase text-[#dfba53] font-bold tracking-widest flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Formulario Oficial de Inscripción Editorial
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">La postulación ingresará al Gabinete de Dirección</p>
                </div>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSuccess(false);
                    setError("");
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  Ocultar Formulario
                </button>
              </div>

              {success ? (
                <div className="bg-[#052115] border border-emerald-800/60 rounded-xl p-8 text-center space-y-4">
                  <div className="inline-flex p-3 bg-emerald-950/50 text-emerald-400 rounded-full border border-emerald-900">
                    <CheckCircle className="w-8 h-8 animate-bounce" />
                  </div>
                  <h5 className="font-serif text-lg font-bold text-emerald-300">¡Postulación Enviada con Éxito!</h5>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                    Hemos recibido correctamente su perfil académico e inquietudes. Nuestro Gabinete Editorial 
                    revisará sus credenciales estratégicas y le responderá a la brevedad a través de 
                    <strong className="text-emerald-400 font-mono"> contacto@columnapublica.cl</strong> coordinando la entrevista técnica.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setIsOpen(false);
                    }}
                    className="mt-2 text-xs font-mono text-[#dfba53] hover:underline"
                  >
                    Volver a la bitácora
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-[#240a10] border border-rose-900 text-rose-300 rounded-lg p-4 flex items-start space-x-3 text-xs leading-relaxed">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name input */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="p. ej. Gonzalo Orellana"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-xs p-3 pl-10 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba53] transition-colors"
                        />
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="correo@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs p-3 pl-10 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba53] transition-colors"
                        />
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Academic Degree / Profession */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Grado Académico o Profesión <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="p. ej. Ingeniero en Computación e Informática"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full text-xs p-3 pl-10 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba53] transition-colors"
                        />
                        <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    {/* Category Column Choice */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Línea Temática de Interés
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                          className="w-full text-xs p-3 pl-10 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#dfba53] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="Soberanía Global">Soberanía Global</option>
                          <option value="Geopolítica Económica">Geopolítica Económica</option>
                          <option value="Análisis">Análisis Técnico</option>
                          <option value="Opinión">Opinión Doctrinal</option>
                        </select>
                        <Compass className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Motivation Textarea */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Motivación y Áreas de Investigación Propuestas <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={4}
                        placeholder="Describa brevemente su foco de investigación, líneas generales del debate que desea impulsar, o su experiencia técnica relevante..."
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        className="w-full text-xs p-3 pl-10 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba53] transition-colors font-sans leading-relaxed"
                      />
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  {/* File Upload (Optional Curriculum / Draft Layout) */}
                  <div className="space-y-2">
                    <FileUploader
                      value={documentUrl}
                      onChange={setDocumentUrl}
                      type="document"
                      label="Adjuntar Borrador de Columna o Currículum Académico (Opcional)"
                      placeholder="Arrastre su archivo PDF, Word o TXT aquí o haga clic para buscarlo en su dispositivo"
                    />
                  </div>

                  {/* Submit Button & Privacy Info */}
                  <div className="pt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-slate-900 pt-4">
                    <div className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-400">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#dfba53] shrink-0" />
                      <span>Sus datos personales están resguardados bajo secreto editorial.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/politica-privacidad");
                        }}
                        className="text-[#dfba53] hover:text-[#cfa543] font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer py-1 px-2.5 bg-slate-950 border border-slate-800 rounded flex items-center space-x-1.5 hover:bg-slate-900 transition-all"
                      >
                        <Info className="w-3.5 h-3.5 text-[#dfba53]" />
                        <span>Ver Info / Privacidad</span>
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="w-full md:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-mono font-bold text-xs px-6 py-3 rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Enviando Postulación...</span>
                        </>
                      ) : (
                        <>
                          <PenTool className="w-4 h-4" />
                          <span>Enviar Registro Oficial</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default JoinUsSection;
