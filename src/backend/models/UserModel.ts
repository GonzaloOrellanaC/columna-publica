import mongoose, { Schema, Types } from 'mongoose';
import { User } from '../domain/entities/User';


const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  descripcion: { type: String },
  resena: { type: String },
  avatarUrl: { type: String },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<User>('User', UserSchema);
