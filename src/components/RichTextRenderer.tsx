import React from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

interface RichTextRendererProps {
  content: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split content by newline to parse block-by-block safely
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];

  let currentParagraphLines: string[] = [];

  const flushParagraph = (key: number) => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join("\n");
      // Render inline styles inside paragraph
      blocks.push(
        <p key={`p-${key}`} className="font-serif text-slate-100 text-[14px] md:text-[16px] leading-relaxed md:leading-loose whitespace-pre-line text-justify mb-5 last:mb-0">
          {parseInlineElements(text)}
        </p>
      );
      currentParagraphLines = [];
    }
  };

  // Helper to parse bold, italics, links
  const parseInlineElements = (text: string): React.ReactNode[] => {
    if (!text) return [];

    let parts: { type: "text" | "bold" | "italic" | "link"; value: string; href?: string }[] = [
      { type: "text", value: text }
    ];

    // 1. Parse bold: **text**
    let nextParts: typeof parts = [];
    for (const part of parts) {
      if (part.type === "text") {
        const regex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        const s = part.value;
        while ((match = regex.exec(s)) !== null) {
          if (match.index > lastIndex) {
            nextParts.push({ type: "text", value: s.slice(lastIndex, match.index) });
          }
          nextParts.push({ type: "bold", value: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < s.length) {
          nextParts.push({ type: "text", value: s.slice(lastIndex) });
        }
      } else {
        nextParts.push(part);
      }
    }
    parts = nextParts;

    // 2. Parse italic: *text*
    nextParts = [];
    for (const part of parts) {
      if (part.type === "text") {
        const regex = /\*([^*]+)\*/g;
        let lastIndex = 0;
        let match;
        const s = part.value;
        while ((match = regex.exec(s)) !== null) {
          if (match.index > lastIndex) {
            nextParts.push({ type: "text", value: s.slice(lastIndex, match.index) });
          }
          nextParts.push({ type: "italic", value: match[1] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < s.length) {
          nextParts.push({ type: "text", value: s.slice(lastIndex) });
        }
      } else {
        nextParts.push(part);
      }
    }
    parts = nextParts;

    // 3. Parse standard link: [text](href)
    nextParts = [];
    for (const part of parts) {
      if (part.type === "text") {
        const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let lastIndex = 0;
        let match;
        const s = part.value;
        while ((match = regex.exec(s)) !== null) {
          if (match.index > lastIndex) {
            nextParts.push({ type: "text", value: s.slice(lastIndex, match.index) });
          }
          nextParts.push({ type: "link", value: match[1], href: match[2] });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < s.length) {
          nextParts.push({ type: "text", value: s.slice(lastIndex) });
        }
      } else {
        nextParts.push(part);
      }
    }
    parts = nextParts;

    // Convert parts to JSX
    return parts.map((part, idx) => {
      if (part.type === "bold") {
        return <strong key={idx} className="font-bold text-white font-sans">{part.value}</strong>;
      }
      if (part.type === "italic") {
        return <em key={idx} className="italic text-slate-300 font-serif">{part.value}</em>;
      }
      if (part.type === "link") {
        return (
          <a 
            key={idx} 
            href={part.href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#dfba53] hover:underline hover:text-yellow-400 inline-flex items-center gap-0.5"
          >
            {part.value}
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      }
      return part.value;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const origLine = lines[i];
    const trimmed = origLine.trim();

    // 1. Check for Headings
    if (trimmed.startsWith("# ")) {
      flushParagraph(i);
      const val = trimmed.substring(2);
      blocks.push(
        <h2 key={`h1-${i}`} className="font-cinzel text-xl md:text-2xl font-bold text-[#dfba53] tracking-wide mt-8 mb-4 border-b border-[#dfba53]/10 pb-2">
          {val}
        </h2>
      );
    } else if (trimmed.startsWith("## ")) {
      flushParagraph(i);
      const val = trimmed.substring(3);
      blocks.push(
        <h3 key={`h2-${i}`} className="font-serif text-lg md:text-xl font-semibold text-white tracking-wide mt-6 mb-3">
          {val}
        </h3>
      );
    } else if (trimmed.startsWith("### ")) {
      flushParagraph(i);
      const val = trimmed.substring(4);
      blocks.push(
        <h4 key={`h3-${i}`} className="font-mono text-xs md:text-sm uppercase font-bold text-[#dfba53]/80 tracking-widest mt-5 mb-2.5">
          {val}
        </h4>
      );
    } 
    // 2. Check for Embedded Images
    // Standard Markdown Image format: ![AltText](ImageUrl)
    else if (trimmed.startsWith("![") && trimmed.includes("](") && trimmed.endsWith(")")) {
      flushParagraph(i);
      const altEnd = trimmed.indexOf("](");
      const alt = trimmed.slice(2, altEnd);
      const url = trimmed.slice(altEnd + 2, trimmed.length - 1);

      blocks.push(
        <div key={`img-md-${i}`} className="my-6 space-y-2">
          <div className="overflow-hidden rounded-xl border border-slate-800 shadow-xl bg-slate-950/40 p-1.5">
            <img 
              src={url} 
              alt={alt} 
              className="w-full max-h-[480px] object-cover rounded-lg transition-transform duration-500 hover:scale-[1.005]" 
              referrerPolicy="no-referrer"
            />
          </div>
          {alt && (
            <p className="text-[10px] font-mono text-center text-slate-400 italic">
              — {alt}
            </p>
          )}
        </div>
      );
    } 
    // Simplified tag: [pdf|fileUrl|FileName]
    else if (trimmed.startsWith("[pdf|") && trimmed.endsWith("]")) {
      flushParagraph(i);
      const contents = trimmed.substring(5, trimmed.length - 1);
      const parts = contents.split("|");
      const url = parts[0];
      const name = parts[1] || "Documento Adjunto (PDF)";

      blocks.push(
        <div 
          key={`pdf-block-${i}`} 
          className="my-5 p-4 bg-[#051122]/90 border border-[#dfba53]/20 rounded-xl hover:bg-[#07172e] hover:border-[#dfba53]/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-red-950/45 border border-red-900/30 flex items-center justify-center text-red-400 shrink-0">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0 leading-normal">
              <span className="text-[9px] uppercase font-mono text-[#dfba53] tracking-widest font-bold">Documento Público de Deliberación</span>
              <p className="text-xs font-mono text-slate-100 font-bold truncate block mt-0.5" title={name}>
                {name}
              </p>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 shrink-0 px-3.5 py-1.8 bg-[#dfba53] text-[#030a16] hover:bg-yellow-400 hover:scale-[1.02] text-[11px] font-mono font-bold rounded-md flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </a>
        </div>
      );
    }
    // Gather lines into consecutive paragraph buffers
    else {
      if (trimmed === "" && currentParagraphLines.length > 0) {
        flushParagraph(i);
      } else if (trimmed !== "") {
        currentParagraphLines.push(origLine);
      }
    }
  }

  // Flush any final text
  flushParagraph(lines.length);

  return <div className="space-y-4">{blocks}</div>;
};
