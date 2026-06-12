/**
 * Symbolic text parser for the non-technical editorial editor of Columna Pública.
 * Replaces complex HTML elements like <h3>, <p>, <img>, or download containers with
 * intuitive Spanish symbols and markers, making editing simple for non-programmers.
 */

export function parseSymbolicContent(content: string | undefined | null): string {
  if (!content) return "";
  
  const lines = content.split('\n');
  const resultLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    
    // Support legacy/fallback HTML articles stored in raw format
    if (
      line.startsWith("<h3") || 
      line.startsWith("<p") || 
      line.startsWith("<div") || 
      line.startsWith("<img") || 
      line.startsWith("<h3>") || 
      line.startsWith("<p>") || 
      line.startsWith("<div>") || 
      line.startsWith("<img>")
    ) {
      resultLines.push(line);
      i++;
      continue;
    }

    // 1. Header (Texto Grande H3)
    // Supports: 【TEXTO GRANDE】 Subtítulo
    const bigTextRegex = /^(?:【TEXTO GRANDE】|\[TEXTO GRANDE\])\s*(?::)?\s*(.*)$/i;
    const bigMatch = line.match(bigTextRegex);
    if (bigMatch) {
      const text = bigMatch[1].trim();
      if (text) {
        resultLines.push(`<h3 class="text-xl sm:text-2xl font-serif font-bold text-gold-300 mt-6 mb-3">${text}</h3>`);
      }
      i++;
      continue;
    }

    // 2. Format Marker (Texto Normal P)
    // Supports: 【TEXTO NORMAL】 Párrafo or 【TEXTO PEQUEÑO】 Párrafo
    const normalTextRegex = /^(?:【TEXTO NORMAL】|\[TEXTO NORMAL\]|【TEXTO PEQUEÑO】|\[TEXTO PEQUEÑO\])\s*(?::)?\s*(.*)$/i;
    const normalMatch = line.match(normalTextRegex);
    if (normalMatch) {
      const text = normalMatch[1].trim();
      if (text) {
        const parsedText = parseInlineLinks(text);
        resultLines.push(`<p class="text-sm sm:text-base text-white/90 font-sans leading-relaxed my-4">${parsedText}</p>`);
      }
      i++;
      continue;
    }

    // 3. Image (📷)
    // Supports: 📷 [IMAGEN: url] or [IMAGEN: url]
    const imageRegex = /^(?:📷)?\s*(?:\[IMAGEN:\s*(.*?)\s*\]|\[FOTO:\s*(.*?)\s*\])/i;
    const imgMatch = line.match(imageRegex);
    if (imgMatch) {
      const url = (imgMatch[1] || imgMatch[2] || "").trim();
      if (url) {
        resultLines.push(`<div class="my-6"><img src="${url}" alt="Imagen de Columna" class="w-full rounded-lg border border-white/10 shadow-lg" referrerPolicy="no-referrer" /></div>`);
      }
      i++;
      continue;
    }

    // 4. File Document / PDF (📄)
    // Supports: 📄 [PDF: nombre | url] or [PDF: nombre | url]
    const docRegex = /^(?:📄)?\s*(?:\[PDF:\s*(.*?)\s*\|\s*(.*?)\s*\]|\[DOCUMENTO:\s*(.*?)\s*\|\s*(.*?)\s*\])/i;
    const docMatch = line.match(docRegex);
    if (docMatch) {
      const name = (docMatch[1] || docMatch[3] || "Documento Adjunto").trim();
      const url = (docMatch[2] || docMatch[4] || "").trim();
      if (url) {
        resultLines.push(`
          <div class="bg-white/5 border border-white/10 p-3.5 rounded-lg flex items-center justify-between my-4 backdrop-blur-md">
            <div class="flex items-center space-x-2">
              <span class="text-xs text-white/90">📄 Documento Adjunto: <strong>${name}</strong></span>
            </div>
            <a href="${url}" download target="_blank" class="text-xs font-bold text-gold-300 hover:text-gold-200 underline">
              Descargar
            </a>
          </div>
        `);
      }
      i++;
      continue;
    }

    // 5. Default Line: Treat as standard paragraph and parse inline links
    const parsedLine = parseInlineLinks(line);
    resultLines.push(`<p class="text-sm sm:text-base text-white/90 font-sans leading-relaxed my-4">${parsedLine}</p>`);
    i++;
  }
  
  return resultLines.join('\n');
}

/**
 * Searches and parses links in format 🔗 [ENLACE: texto -> url] or [ENLACE: texto -> url]
 */
function parseInlineLinks(text: string): string {
  const linkRegex = /(?:🔗)?\s*\[ENLACE:\s*([^\]]*?)\s*->\s*([^\]]*?)\s*\]/gi;
  return text.replace(linkRegex, (_match, linkText, linkUrl) => {
    let url = linkUrl.trim();
    if (url && !url.startsWith("http") && !url.startsWith("/")) {
      url = "https://" + url;
    }
    return `<a href="${url}" target="_blank" class="text-gold-300 underline hover:text-gold-400 font-bold">${linkText.trim()}</a>`;
  });
}
