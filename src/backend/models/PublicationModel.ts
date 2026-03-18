// crea modelo de datos de publicación, con campos: título, autor, fecha de publicación, contenido, resumen, etiquetas (array de strings), estado (borrador o publicado)

import mongoose, { Document, Schema } from 'mongoose';

export type PublicationStatus = 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';

export interface PublicationDocument extends Document {
    title: string;
    author: mongoose.Types.ObjectId | string;
    publishDate: Date;
    content: string;
	slug?: string;
	resena?: string;
	summary?: string;
    tags: string[];
    status: PublicationStatus;
	imageUrl?: string;
    enabled: boolean;
	history: {
		content: string;
		publishDate: Date;
		status: PublicationStatus;
		usr?: mongoose.Types.ObjectId | string;
	}[];
}


const PublicationSchema = new Schema<PublicationDocument>(
	{
		title: { type: String, required: true },
		author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		publishDate: { type: Date, required: true },
		content: { type: String, required: true },
		resena: { type: String },
		summary: { type: String, required: false },
		tags: { type: [String], default: [] },
		slug: { type: String, index: true },
		status: { type: String, enum: ['EN_CREACION', 'EN_REVISION', 'ITERANDO', 'APROBADO', 'PUBLICADA'], default: 'EN_CREACION' },
		imageUrl: { type: String },
		enabled: { type: Boolean, default: true },
		history: [{
			content: String,
			publishDate: Date,
			status: { type: String, enum: ['EN_CREACION', 'EN_REVISION', 'ITERANDO', 'APROBADO', 'PUBLICADA'] },
			usr: { type: Schema.Types.ObjectId, ref: 'User', required: false }
		}],
	},
    {
        timestamps: true,
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
);

export const PublicationModel = mongoose.model<PublicationDocument>('Publication', PublicationSchema);
