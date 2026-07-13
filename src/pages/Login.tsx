import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginView } from "../components/LoginView";
import { User, SiteSettings } from "../types";

interface LoginProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
  siteSettings: SiteSettings;
}

export const Login: React.FC<LoginProps> = ({
  currentUser,
  onLoginSuccess,
  triggerToast,
  siteSettings,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/gabinete");
    }
  }, [currentUser, navigate]);

  return (
    <LoginView
      onLoginSuccess={onLoginSuccess}
      triggerToast={triggerToast}
      siteSettings={siteSettings}
    />
  );
};

export default Login;
