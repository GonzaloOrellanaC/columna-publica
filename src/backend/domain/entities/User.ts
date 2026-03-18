import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  descripcion?: string;
  resena?: string;
  avatarUrl?: string;
  roles: string[];
  createdAt: Date;
}
