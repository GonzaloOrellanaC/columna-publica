export interface Author {
  _id: string;
  nombres: string;
  apellidos: string;
  descripcion?: string;
  avatarUrl?: string;
  resena?: string;
  createdAt?: string;
}

export type PublicationStatus = 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';

export interface History {
  content: string;
  publishDate: Date;
  status: PublicationStatus;
  usr?: Author | string;
}

export interface Publication {
  _id?: string;
  title: string;
  content: string;
  author: Author | string;
  summary?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: PublicationStatus;
  imageUrl?: string;
  publishDate?: Date | string;
  history?: History[];
  enabled: boolean;
}