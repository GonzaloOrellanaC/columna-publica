export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'columnist';
  bio: string;
  avatar: string;
  createdAt: string;
  blocked?: boolean;
  isDemo?: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: 'Análisis' | 'Opinión' | 'Soberanía Global' | 'Geopolítica Económica' | 'General';
  imageUrl: string;
  status: 'draft' | 'review' | 'published';
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export type Category = 'Análisis' | 'Opinión' | 'Soberanía Global' | 'Geopolítica Económica' | 'General';

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  enableComments: boolean;
  enableAIAdviser: boolean;
  enableRegistrations: boolean;
  enableShareButtons: boolean;
  heroLayout: 'classic' | 'dense' | 'editorial';
  alertBannerText: string;
}

