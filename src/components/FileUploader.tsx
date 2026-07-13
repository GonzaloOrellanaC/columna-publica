import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, Image as ImageIcon, FileText, Trash2, FolderSync, 
  Plus, Check, X, RefreshCw, Layers 
} from "lucide-react";
import { 
  getGalleryImages, addImageToGallery, deleteGalleryImage, GalleryItem 
} from "../utils/indexedDb";

interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  type: "image" | "document" | "avatar";
  label: string;
  placeholder?: string;
  allowLocalGallery?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  type,
  label,
  placeholder = "Arrastra un archivo aquí o haz clic para buscar en el dispositivo",
  allowLocalGallery = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  
  // IndexedDB Local Gallery modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load name if value is local file
  useEffect(() => {
    if (value) {
      if (value.startsWith("data:")) {
        setSelectedFileName("Imagen de la Galería Local [IndexedDB]");
      } else if (value === "/default-avatar.svg") {
        setSelectedFileName("Avatar SVG por Defecto");
      } else {
        const parts = value.split("/");
        setSelectedFileName(parts[parts.length - 1]);
      }
    } else {
      setSelectedFileName("");
    }
  }, [value]);

  useEffect(() => {
    if (type === "avatar" && !value) {
      onChange("/default-avatar.svg");
    }
  }, [value, type, onChange]);

  // Load gallery list
  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const imgs = await getGalleryImages();
      setGalleryImages(imgs);
    } catch (err) {
      console.error("No se pudo cargar la galería", err);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (showGalleryModal) {
      loadGallery();
    }
  }, [showGalleryModal]);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processAndUploadFile(file);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processAndUploadFile(file);
    }
  };

  // Upload/Process logic
  const processAndUploadFile = async (file: File) => {
    // Basic validations
    if (type === "document") {
      const allowedExts = [".pdf", ".doc", ".docx", ".txt"];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowedExts.includes(ext) && file.type !== "application/pdf") {
        setErrorMessage("Tipo de archivo no permitido. Solo se aceptan PDFs u otros documentos.");
        return;
      }
    } else {
      // Must be image
      if (!file.type.startsWith("image/")) {
        setErrorMessage("El archivo seleccionado debe ser una imagen válida.");
        return;
      }
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("El archivo supera el tamaño máximo de 10MB.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSelectedFileName(file.name);

    const formData = new FormData();
    // Key mirrors express upload router expectations
    const fieldName = type === "avatar" ? "avatar" : type === "document" ? "document" : "image";
    formData.append(fieldName, file);

    const uploadUrl = `/api/upload/${type === "avatar" ? "avatar" : type === "document" ? "document" : "image"}`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onChange(data.url);
      } else {
        setErrorMessage(data.message || "Error al subir archivo al servidor.");
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión al cargar el archivo.");
    } finally {
      setUploading(false);
    }
  };

  // Handler for saving image directly from Device to local gallery
  const handleAddToGalleryNative = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Solo se admiten archivos de tipo imagen en la galería local.");
        return;
      }
      try {
        await addImageToGallery(file.name, file);
        loadGallery();
      } catch (err: any) {
        alert(err.message || "Error al almacenar la imagen.");
      }
    }
  };

  const handleSelectFromGallery = (dataUrl: string) => {
    onChange(dataUrl);
    setShowGalleryModal(false);
  };

  const handleDeleteFromGallery = async (id: string, name: string) => {
    if (confirm(`¿Quitar la imagen "${name}" de tu galería local del navegador?`)) {
      try {
        await deleteGalleryImage(id);
        loadGallery();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemoveCurrent = () => {
    onChange(type === "avatar" ? "/default-avatar.svg" : "");
    setSelectedFileName(type === "avatar" ? "Avatar SVG por Defecto" : "");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImageValue = value && (value.startsWith("data:image") || value.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || value.includes("images"));

  // Filtering images inside local gallery view
  const filteredGalleryImages = galleryImages.filter(img => 
    img.name.toLowerCase().includes(gallerySearch.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">
          {label}
        </label>
        {value && (type !== "avatar" || value !== "/default-avatar.svg") && (
          <button
            type="button"
            onClick={handleRemoveCurrent}
            className="text-[10px] text-red-400 hover:text-red-300 flex items-center space-x-1 underline font-mono cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Eliminar selección</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {/* DRAG AND DROP ZONE */}
        <div 
          className={`flex-grow relative border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all bg-slate-950/60 ${
            dragActive 
              ? "border-[#dfba53] bg-[#dfba53]/5 scale-[0.99]" 
              : value 
                ? "border-slate-800" 
                : "border-slate-800 hover:border-slate-700"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={type === "document" ? ".pdf,.doc,.docx,.txt" : "image/*"}
            onChange={handleChange}
          />

          {uploading ? (
            <div className="text-center py-2 space-y-2">
              <RefreshCw className="w-8 h-8 text-[#dfba53] animate-spin mx-auto" />
              <p className="text-[11px] font-mono text-slate-400">Transmitiendo archivo al servidor seguro...</p>
            </div>
          ) : value ? (
            <div className="text-center space-y-3 w-full">
              {isImageValue ? (
                <div className="relative group w-24 h-24 mx-auto rounded overflow-hidden border border-slate-800 shadow-md">
                  <img 
                    src={value} 
                    alt="Previsualización" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-mono text-white bg-slate-900 border border-slate-700 px-2 py-1 rounded hover:bg-slate-850"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/40 rounded border border-slate-800 inline-flex items-center space-x-2 text-left">
                  <FileText className="w-8 h-8 text-[#dfba53]" />
                  <div className="max-w-xs leading-normal">
                    <p className="text-xs font-mono font-bold text-slate-205 truncate">{selectedFileName}</p>
                    <p className="text-[9px] text-slate-550">Documento listo de forma segura para envío.</p>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-mono">
                {selectedFileName ? `Archivo: ${selectedFileName}` : "Archivo Listo"}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2.5 py-2">
              <Upload className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs text-slate-315 font-medium">{placeholder}</p>
                <p className="text-[9px] text-slate-550 font-mono">
                  {type === "document" 
                    ? "PDF, WORD o TEXTO (Máx 10MB)" 
                    : "Formato JPG, PNG, WEBP o SVG (Máx 10MB)"
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTION BUTTONS COLUMN */}
        <div className="flex flex-row md:flex-col justify-stretch gap-2 shrink-0 md:w-44">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-grow flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-100 hover:text-white border border-slate-800 rounded text-xs font-mono transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#dfba53]" />
            <span>Subir de Equipo</span>
          </button>

          {allowLocalGallery && type !== "document" && (
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="flex-grow flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-[#dfba53] border border-slate-800 rounded text-xs font-mono transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Galería Local</span>
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-[11px] text-red-400 font-mono mt-1">
          ⚠️ {errorMessage}
        </p>
      )}

      {/* ======================= INDEXEDDB BROWSER GALLERY MODAL ======================= */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#051122] border border-[#dfba53]/20 w-full max-w-2xl rounded-xl shadow-2xl p-6 text-white space-y-4">
            
            {/* Modal Header */}
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#dfba53]" />
                <h4 className="font-cinzel text-md font-bold text-white uppercase tracking-wider">
                  Galería Local del Navegador
                </h4>
              </div>
              <button 
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Estas imágenes están almacenadas localmente en el almacenamiento aislado de su navegador (IndexedDB). No se transfieren a nuestro servidor de almacenamiento a menos que seleccione una para usar en una deliberación académica.
            </p>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
              <input
                type="text"
                placeholder="Filtrar por nombre de archivo..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="text-xs p-2.5 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-[#dfba53] flex-grow"
              />

              <div className="shrink-0">
                <input
                  ref={galleryInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAddToGalleryNative}
                />
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full text-xs font-mono font-bold bg-[#dfba53] text-[#030a16] px-4 py-2.5 rounded cursor-pointer hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir a Galería</span>
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="min-h-[250px] max-h-[350px] overflow-y-auto pr-1">
              {loadingGallery ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#dfba53] mx-auto mb-2" />
                  Cargando almacenamiento local...
                </div>
              ) : filteredGalleryImages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-slate-850 rounded-lg">
                  {gallerySearch 
                    ? "No se encontraron imágenes que coincidan con la búsqueda." 
                    : "No hay imágenes en su galería local. Registre una para comenzar."
                  }
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredGalleryImages.map((img) => {
                    const isSelectedInForm = value === img.dataUrl;
                    const sizeInKb = (img.size / 1024).toFixed(1);

                    return (
                      <div 
                        key={img.id}
                        className={`group bg-slate-950 border rounded-lg overflow-hidden transition-all relative flex flex-col justify-between ${
                          isSelectedInForm 
                            ? "border-[#dfba53] ring-1 ring-[#dfba53]" 
                            : "border-slate-850 hover:border-slate-700"
                        }`}
                      >
                        {/* Image Preview */}
                        <div 
                          onClick={() => handleSelectFromGallery(img.dataUrl)}
                          className="h-28 w-full bg-black cursor-pointer relative overflow-hidden"
                        >
                          <img 
                            src={img.dataUrl} 
                            alt={img.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-mono text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                              Seleccionar
                            </span>
                          </div>

                          {isSelectedInForm && (
                            <div className="absolute top-1.5 left-1.5 bg-[#dfba53] text-[#030a16] p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Image Details Footer */}
                        <div className="p-2 border-t border-slate-900 bg-slate-950 text-left space-y-1">
                          <p className="text-[10px] font-mono text-slate-200 truncate font-semibold" title={img.name}>
                            {img.name}
                          </p>
                          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                            <span>{sizeInKb} KB</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFromGallery(img.id, img.name)}
                              className="text-red-400 hover:text-red-300 transition-colors p-0.5 rounded hover:bg-slate-900"
                              title="Eliminar de galería"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-850 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono rounded cursor-pointer hover:bg-slate-850 transition-colors"
              >
                Cerrar Galería
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
