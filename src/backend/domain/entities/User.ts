import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  descripcion?: string;
  resena?: string;
  roles: string[];
  createdAt: Date;
}
