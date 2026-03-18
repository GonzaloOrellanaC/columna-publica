export type PublicationStatus = 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';

export interface Publication {
  id?: string;
  title: string;
  content: string;
  author: string;
  resena?: string;
  createdAt: Date;
  status?: PublicationStatus;
}
