import { Publication } from '../../domain/entities/Publication';
import { PublicationRepository } from '../../domain/repositories/PublicationRepository';

/*
// --- Descomentar para usar Mongoose ---
import mongoose, { Schema, Document } from 'mongoose';

export interface PublicationDocument extends Document {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  status: string;
}

const PublicationSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'EN_REVISION' }
});

const PublicationModel = mongoose.model<PublicationDocument>('Publication', PublicationSchema);
*/

export class MongoPublicationRepository implements PublicationRepository {
  
  async save(publication: Publication): Promise<Publication> {
    /*
    // --- Descomentar para usar Mongoose ---
    const newPublication = new PublicationModel(publication);
    const saved = await newPublication.save();
    return {
      id: saved._id.toString(),
      title: saved.title,
      content: saved.content,
      author: saved.author,
      createdAt: saved.createdAt,
      status: saved.status as any
    };
    */
    throw new Error("MongoDB not connected in this environment. Please configure the connection.");
  }

  async findAll(): Promise<Publication[]> {
    /*
    // --- Descomentar para usar Mongoose ---
    const docs = await PublicationModel.find().sort({ createdAt: -1 }).exec();
    return docs.map(doc => ({
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content,
      author: doc.author,
      createdAt: doc.createdAt,
      status: doc.status as any
    }));
    */
    throw new Error("MongoDB not connected in this environment. Please configure the connection.");
  }
}
