import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardView } from "../components/DashboardView";
import { User, Article, SiteSettings } from "../types";

interface DashboardProps {
  currentUser: User | null;
  settings: SiteSettings;
  updateSettingsInApp: (newSettings: SiteSettings) => void;
  fetchArticlesExternal: () => Promise<void>;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
  articles: Article[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  settings,
  updateSettingsInApp,
  fetchArticlesExternal,
  triggerToast,
  articles,
}) => {
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!currentUser) {
      navigate("/portal");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardView
      currentUser={currentUser}
      settings={settings}
      updateSettingsInApp={updateSettingsInApp}
      fetchArticlesExternal={fetchArticlesExternal}
      triggerToast={triggerToast}
      articles={articles}
    />
  );
};

export default Dashboard;
