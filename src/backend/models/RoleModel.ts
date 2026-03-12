import mongoose, { Schema, Document } from 'mongoose';

export interface Role extends Document {
  name: string;
  description?: string;
}

const RoleSchema = new Schema<Role>({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

export const RoleModel = mongoose.model<Role>('Role', RoleSchema);
