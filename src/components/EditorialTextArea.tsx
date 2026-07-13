import React, { useState, useRef } from "react";
import { 
  Heading1, Heading2, Heading3, Bold, Italic, 
  Image as ImageIcon, FileText, Plus, RefreshCw, Layers, X, HelpCircle 
} from "lucide-react";
import { FileUploader } from "./FileUploader";

interface EditorialTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}

export const EditorialTextArea: React.FC<EditorialTextAreaProps> = ({
  value,
  onChange,
  placeholder = "Redacte la deliberación aquí...",
  rows = 12,
  className = "",
  required = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  // States for image panel
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  // States for PDF panel
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  const insertTextAtCursor = (insertionText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      // Fallback
      onChange(value + insertionText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const before = currentText.substring(0, start);
    const after = currentText.substring(end, currentText.length);

    const newValue = before + insertionText + after;
    onChange(newValue);

    // Dynamic focus restoring & caret positioning
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertionText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleInsertHeading = (level: 1 | 2 | 3) => {
    const headerPrefix = level === 1 ? "# " : level === 2 ? "## " : "### ";
    insertTextAtCursor(`\n${headerPrefix}Título correspondiente\n`);
  };

  const handleInsertBold = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = textarea.value.substring(start, end);
      if (selection) {
        insertTextAtCursor(`**${selection}**`);
        return;
      }
    }
    insertTextAtCursor("**Texto en negrita**");
  };

  const handleInsertItalic = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = textarea.value.substring(start, end);
      if (selection) {
        insertTextAtCursor(`*${selection}*`);
        return;
      }
    }
    insertTextAtCursor("*Texto en cursiva*");
  };

  const executeInsertImage = () => {
    if (!imageUrl) return;
    const markdownImg = imageCaption 
      ? `\n![${imageCaption}](${imageUrl})\n` 
      : `\n![Ilustración de la columna](${imageUrl})\n`;
    
    insertTextAtCursor(markdownImg);
    // Reset state & close
    setImageUrl("");
    setImageCaption("");
    setShowImagePanel(false);
  };

  const executeInsertPdf = () => {
    if (!pdfUrl) return;
    const filename = pdfTitle || "Documento Adjunto Corporativo";
    const markdownPdf = `\n[pdf|${pdfUrl}|${filename}]\n`;
    
    insertTextAtCursor(markdownPdf);
    // Reset state & close
    setPdfUrl("");
    setPdfTitle("");
    setShowPdfPanel(false);
  };

  return (
    <div className={`space-y-1 block ${className}`}>
      {/* THE SPECIALIZED EDITORIAL TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#091629] border border-slate-800 rounded-t-lg">
        
        {/* Text styling & Title nodes */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleInsertHeading(1)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Añadir Título Grande (H1)"
          >
            <Heading1 className="w-4 h-4 text-[#dfba53]" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertHeading(2)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Añadir Título Mediano (H2)"
          >
            <Heading2 className="w-4 h-4 text-slate-200" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertHeading(3)}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Añadir Título Chico / Mono (H3)"
          >
            <Heading3 className="w-4 h-4 text-[#dfba53]/80" />
          </button>

          <span className="w-[1px] h-4 bg-slate-800 mx-1"></span>

          <button
            type="button"
            onClick={handleInsertBold}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Texto en Negrita"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertItalic}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Texto en Cursiva"
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>

        {/* Media additions / Help guidelines */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setShowImagePanel(!showImagePanel);
              setShowPdfPanel(false);
              setShowHelpPanel(false);
            }}
            className={`px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center space-x-1 border transition-all cursor-pointer ${
              showImagePanel 
                ? "bg-[#dfba53] text-[#030a16] border-[#dfba53]" 
                : "bg-slate-950 border-slate-800 text-slate-200 hover:text-[#dfba53] hover:border-[#dfba53]/50"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>+ Imagen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPdfPanel(!showPdfPanel);
              setShowImagePanel(false);
              setShowHelpPanel(false);
            }}
            className={`px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center space-x-1 border transition-all cursor-pointer ${
              showPdfPanel 
                ? "bg-[#dfba53] text-[#030a16] border-[#dfba53]" 
                : "bg-slate-950 border-slate-800 text-slate-200 hover:text-red-400 hover:border-red-900/40"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Documento PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowHelpPanel(!showHelpPanel);
              setShowImagePanel(false);
              setShowPdfPanel(false);
            }}
            className={`p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer ${
              showHelpPanel ? "bg-slate-800" : ""
            }`}
            title="Formato y ayuda de redacción"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC TOOLBAR SUB-PANELS */}
      
      {/* 1. IMAGE INSERT SUB-PANEL */}
      {showImagePanel && (
        <div className="p-3 bg-slate-900 border-x border-b border-slate-800 space-y-3 block text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-[10px] font-mono text-[#dfba53] uppercase tracking-wider font-bold">Asistente de Inserción de Imagen</span>
            <button 
              type="button" 
              onClick={() => setShowImagePanel(false)} 
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <FileUploader
            value={imageUrl}
            onChange={setImageUrl}
            type="image"
            label="1. Subir Imagen o Elegir de Galería"
            placeholder="Cargar nueva o haz clic en Galería Local"
            allowLocalGallery={true}
          />

          <div className="space-y-1 mt-2">
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono">
              2. Pie de Imagen (Opcional - se muestra debajo)
            </label>
            <input
              type="text"
              placeholder="Ej: Retrato del autor durante el congreso o pie descriptivo..."
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded font-mono text-white focus:outline-none focus:border-[#dfba53]"
            />
          </div>

          <button
            type="button"
            disabled={!imageUrl}
            onClick={executeInsertImage}
            className="w-full mt-2 bg-[#dfba53] hover:bg-yellow-400 disabled:opacity-40 text-[#030a16] text-xs font-mono font-bold py-2 rounded flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insertar Imagen en Deliberación</span>
          </button>
        </div>
      )}

      {/* 2. PDF INSERT SUB-PANEL */}
      {showPdfPanel && (
        <div className="p-3 bg-slate-900 border-x border-b border-slate-800 space-y-3 block text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-bold">Asistente de Inserción de Documento PDF</span>
            <button 
              type="button" 
              onClick={() => setShowPdfPanel(false)} 
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <FileUploader
            value={pdfUrl}
            onChange={setPdfUrl}
            type="document"
            label="1. Subir Documento de Referencia (PDF)"
            placeholder="Arrastra el documento PDF aquí o búscalo en tu equipo"
          />

          <div className="space-y-1 mt-2">
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono">
              2. Etiqueta / Nombre Visible del Documento
            </label>
            <input
              type="text"
              placeholder="Ej: Decreto Constitucional de Reforma o Sentencia Tribunal de Alzada..."
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded font-mono text-white focus:outline-none focus:border-[#dfba53]"
            />
          </div>

          <button
            type="button"
            disabled={!pdfUrl}
            onClick={executeInsertPdf}
            className="w-full mt-2 bg-[#dfba53] hover:bg-yellow-400 disabled:opacity-40 text-[#030a16] text-xs font-mono font-bold py-2 rounded flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insertar Descarga de PDF</span>
          </button>
        </div>
      )}

      {/* 3. HELP PANEL */}
      {showHelpPanel && (
        <div className="p-3 bg-slate-950 border-x border-b border-slate-800 rounded-b-lg block text-left font-mono text-[10px] text-slate-400 space-y-2">
          <p className="text-white font-bold uppercase tracking-wider border-b border-slate-900 pb-1 text-[11px] mb-2 text-[#dfba53]">
            Sintaxis de Edición Editorial
          </p>
          <p>Le ofrecemos un conjunto de directivas sencillas y elegantes para enriquecer sus deliberaciones:</p>
          <ul className="list-disc pl-4 space-y-1 leading-normal">
            <li><strong className="text-white"># Título H1:</strong> Crea un título formal con tipografía cinzel en color dorado.</li>
            <li><strong className="text-white">## Título H2:</strong> Crea un subtítulo intermedio elegante.</li>
            <li><strong className="text-white">### Título H3:</strong> Genera un encabezado estilo mono.</li>
            <li><strong className="text-white">**Texto**:</strong> Aplica estilo de negrita al texto demarcado.</li>
            <li><strong className="text-white">*Texto*:</strong> Aplica cursiva o énfasis al texto.</li>
            <li><strong className="text-white">[Texto del enlace](url_asociada):</strong> Enlace funcional a recursos externos.</li>
            <li><strong className="text-white">![Descripción](url_imagen):</strong> Gráficos o ilustraciones insertados entre párrafos.</li>
            <li><strong className="text-white">[pdf|url|Nombre]:</strong> Recuadro formal de descarga para documentos de análisis.</li>
          </ul>
        </div>
      )}

      {/* THE ACTUAL TEXTAREA */}
      <textarea
        ref={textareaRef}
        required={required}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-b-lg text-slate-100 focus:outline-none focus:border-[#dfba53] leading-relaxed font-serif"
      />
    </div>
  );
};
