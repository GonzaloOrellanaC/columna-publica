export type UserRole = "admin" | "editor" | "columnist";
export type ArticleStatus = "published" | "review" | "draft";
export type ArticleCategory = "Soberanía Global" | "Geopolítica Económica" | "Análisis" | "Opinión" | "General";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  bio: string;
  avatar: string;
  isDemo: boolean;
  createdAt: string;
  blocked?: boolean;
  resetToken?: string;
  resetTokenExpires?: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: ArticleCategory;
  imageUrl: string;
  status: ArticleStatus;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  title: string;
  description: string;
}

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  enableComments: boolean;
  enableAIAdviser: boolean;
  enableRegistrations: boolean;
  enableShareButtons: boolean;
  heroLayout: 'editorial' | 'cards' | 'magazine';
  alertBannerText: string;
  convictionText: string;
  quienesSomosTitle: string;
  quienesSomosDescription: string;
  quienesSomosPeople: Person[];
  editorialSlogan?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  mailContactUrl?: string;
}

export interface ColumnistApplication {
  id: string;
  name: string;
  email: string;
  degree: string;
  motivation: string;
  category: ArticleCategory;
  documentUrl?: string;
  createdAt: string;
  status: "pending" | "reviewed";
}

export interface DatabaseSchema {
  users: User[];
  articles: Article[];
  comments: Comment[];
  settings: SiteSettings;
  applications?: ColumnistApplication[];
  readerVerifications?: { email: string; name: string; code: string; verified: boolean; style: string; createdAt: string }[];
}
