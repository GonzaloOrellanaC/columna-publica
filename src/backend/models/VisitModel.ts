import mongoose, { Document, Schema } from 'mongoose';

export interface VisitDocument extends Document {
  path: string;
  publicationId?: string;
  userId?: string;
  ip?: string;
  referrer?: string;
  userAgent?: string;
}

const VisitSchema = new Schema<VisitDocument>({
  path: { type: String, required: true },
  publicationId: { type: String, required: false, index: true },
  userId: { type: String, required: false, index: true },
  ip: { type: String, required: false },
  referrer: { type: String, required: false },
  userAgent: { type: String, required: false },
}, { timestamps: true });

export const VisitModel = mongoose.model<VisitDocument>('Visit', VisitSchema);
