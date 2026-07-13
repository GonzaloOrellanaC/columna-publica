import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HomeView } from "../components/HomeView";
import { Article, SiteSettings, ArticleCategory, User } from "../types";
import { slugify } from "../utils/slugify";

interface HomeProps {
  articles: Article[];
  settings: SiteSettings;
  isLoading: boolean;
  selectedCategory: ArticleCategory | "Todo";
  setSelectedCategory: (category: ArticleCategory | "Todo") => void;
  currentUser: User | null;
  onUpdateSettings: (settings: SiteSettings) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const Home: React.FC<HomeProps> = ({
  articles,
  settings,
  isLoading,
  selectedCategory,
  setSelectedCategory,
  currentUser,
  onUpdateSettings,
  triggerToast,
}) => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  // Keep path segment in sync with the category state
  useEffect(() => {
    if (categorySlug) {
      const decodedMap: Record<string, ArticleCategory | "Todo"> = {
        "analisis": "Análisis",
        "opinion": "Opinión",
        "soberania-global": "Soberanía Global",
        "geopolitica-economica": "Geopolítica Económica",
        "general": "General",
        "todo": "Todo"
      };
      const category = decodedMap[categorySlug];
      if (category && category !== selectedCategory) {
        setSelectedCategory(category);
      }
    }
  }, [categorySlug, selectedCategory, setSelectedCategory]);

  const handleSelectArticle = (id: string) => {
    const art = articles.find((a) => a.id === id);
    if (art) {
      navigate(`/columna/${slugify(art.title)}`);
    } else {
      navigate(`/columna/articulo-${id}`);
    }
  };

  const handleCategoryChange = (cat: ArticleCategory | "Todo") => {
    setSelectedCategory(cat);
    if (cat === "Todo") {
      navigate("/");
    } else {
      const slugMap: Record<ArticleCategory, string> = {
        "Análisis": "analisis",
        "Opinión": "opinion",
        "Soberanía Global": "soberania-global",
        "Geopolítica Económica": "geopolitica-economica",
        "General": "general"
      };
      navigate(`/seccion/${slugMap[cat]}`);
    }
  };

  return (
    <HomeView
      articles={articles}
      settings={settings}
      onSelectArticle={handleSelectArticle}
      isLoading={isLoading}
      selectedCategory={selectedCategory}
      setSelectedCategory={handleCategoryChange}
      currentUser={currentUser}
      onUpdateSettings={onUpdateSettings}
      triggerToast={triggerToast}
    />
  );
};

export default Home;
