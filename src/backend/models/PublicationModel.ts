// crea modelo de datos de publicación, con campos: título, autor, fecha de publicación, contenido, resumen, etiquetas (array de strings), estado (borrador o publicado)
import mongoose, { Document, Schema } from 'mongoose';

export interface PublicationDocument extends Document {
	title: string;
	author: mongoose.Types.ObjectId | string;
	publishDate: Date;
	content: string;
	summary: string;
	tags: string[];
	status: 'draft' | 'published';
	enabled: boolean;
}


const PublicationSchema = new Schema<PublicationDocument>({
	title: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	publishDate: { type: Date, required: true },
	content: { type: String, required: true },
	summary: { type: String, required: true },
	tags: { type: [String], default: [] },
	status: { type: String, enum: ['draft', 'published'], default: 'draft' },
	enabled: { type: Boolean, default: true }
});

export const PublicationModel = mongoose.model<PublicationDocument>('Publication', PublicationSchema);
