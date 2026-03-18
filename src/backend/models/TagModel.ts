import mongoose, { Document, Schema } from 'mongoose';

export interface TagDocument extends Document {
  name: string;
  slug?: string;
}

const TagSchema = new Schema<TagDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: false, index: true },
}, { timestamps: true });

export const TagModel = mongoose.model<TagDocument>('Tag', TagSchema);
