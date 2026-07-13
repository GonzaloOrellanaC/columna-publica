import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DetailView } from "../components/DetailView";
import { Article, User, SiteSettings } from "../types";
import { slugify } from "../utils/slugify";
import { ArrowLeft } from "lucide-react";

interface DetailProps {
  articles: Article[];
  articlesLoading: boolean;
  settings: SiteSettings;
  currentUser: User | null;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const Detail: React.FC<DetailProps> = ({
  articles,
  articlesLoading,
  settings,
  currentUser,
  triggerToast,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [articleId, setArticleId] = useState<string | null>(null);

  useEffect(() => {
    if (!articlesLoading && slug) {
      // Find the article whose slugified title matches the URL slug
      const found = articles.find((a) => slugify(a.title) === slug);
      if (found) {
        setArticleId(found.id);
      } else {
        // Fallback: in case the URL contains the literal article ID
        const fallback = articles.find((a) => a.id === slug);
        if (fallback) {
          setArticleId(fallback.id);
        } else {
          setArticleId("NOT_FOUND");
        }
      }
    }
  }, [slug, articles, articlesLoading]);

  const handleBack = () => {
    navigate("/");
  };

  if (articlesLoading || (slug && !articleId)) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4 bg-[#030a16] text-[#e2e8f0]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dfba53] mx-auto"></div>
        <p className="text-xs font-mono text-slate-400">Recuperando manuscrito editorial por título...</p>
      </div>
    );
  }

  if (articleId === "NOT_FOUND" || !articleId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4 bg-[#030a16] text-[#e2e8f0]">
        <p className="text-sm font-mono text-red-400">La columna solicitada no se encuentra registrada en nuestros archivos.</p>
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al portal</span>
        </button>
      </div>
    );
  }

  return (
    <DetailView
      articleId={articleId}
      onBack={handleBack}
      settings={settings}
      currentUser={currentUser}
      triggerToast={triggerToast}
    />
  );
};

export default Detail;
