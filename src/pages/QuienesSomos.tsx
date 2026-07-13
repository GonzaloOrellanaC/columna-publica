import React from "react";
import { QuienesSomosView } from "../components/QuienesSomosView";
import { SiteSettings, User } from "../types";

interface QuienesSomosProps {
  settings: SiteSettings;
  currentUser: User | null;
  onUpdateSettings: (settings: SiteSettings) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const QuienesSomos: React.FC<QuienesSomosProps> = ({ 
  settings, 
  currentUser, 
  onUpdateSettings, 
  triggerToast 
}) => {
  return (
    <QuienesSomosView 
      settings={settings} 
      currentUser={currentUser} 
      onUpdateSettings={onUpdateSettings} 
      triggerToast={triggerToast} 
    />
  );
};

export default QuienesSomos;
