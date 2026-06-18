import mongoose from "mongoose";
import { hashPassword } from "./db";
import { SEED_USERS, SEED_ARTICLES } from "./seed_data";

// Flag to track MongoDB connection status
let isConnected = false;

// 1. User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "editor", "columnist"], default: "columnist" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  isDemo: { type: Boolean, default: false },
  createdAt: { type: String, required: true },
  blocked: { type: Boolean, default: false },
  resetToken: { type: String, default: "" },
  resetTokenExpires: { type: String, default: "" }
});

// 2. Article Schema
const ArticleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  content: { type: String, required: true },
  category: { type: String, enum: ["Soberanía Global", "Geopolítica Económica", "Análisis", "Opinión", "General"], default: "General" },
  imageUrl: { type: String, default: "" },
  status: { type: String, enum: ["published", "review", "draft"], default: "draft" },
  tags: [{ type: String }],
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: "" },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  views: { type: Number, default: 0 }
});

// 3. Comment Schema
const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  articleId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: String, required: true }
});

// Settings Schema
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  siteName: { type: String, required: true },
  siteSubtitle: { type: String, default: "" },
  enableComments: { type: Boolean, default: true },
  enableAIAdviser: { type: Boolean, default: true },
  enableRegistrations: { type: Boolean, default: true },
  enableShareButtons: { type: Boolean, default: true },
  heroLayout: { type: String, default: 'editorial' },
  alertBannerText: { type: String, default: "" }
});

// Columnist Application Schema
const ApplicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  degree: { type: String, required: true },
  motivation: { type: String, required: true },
  category: { type: String, required: true },
  documentUrl: { type: String, default: "" },
  createdAt: { type: String, required: true },
  status: { type: String, enum: ["pending", "reviewed"], default: "pending" }
});

export const MongoUser = mongoose.models.User || mongoose.model("User", UserSchema);
export const MongoArticle = mongoose.models.Article || mongoose.model("Article", ArticleSchema);
export const MongoComment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export const MongoSettings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
export const MongoApplication = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("[MongoDB/Mongoose] No se ha provisto MONGODB_URI. Usando persistencia local en archivo JSON.");
    return false;
  }

  try {
    if (isConnected) return true;
    await mongoose.connect(uri);
    isConnected = true;
    console.log(`[MongoDB/Mongoose] Conectado exitosamente a MongoDB.`);

    await runMongoSeed();
    return true;
  } catch (err: any) {
    console.error(`[MongoDB/Mongoose] No se pudo establecer la conexión a MongoDB. Se usará el sistema local: ${err.message}`);
    return false;
  }
}

export function isMongoDbConnected(): boolean {
  return isConnected;
}

async function runMongoSeed() {
  try {
    // Intelligent seeding for Users
    for (const u of SEED_USERS) {
      const uExists = await MongoUser.findOne({
        $or: [{ id: u.id }, { email: u.email.toLowerCase() }]
      });
      if (!uExists) {
        await MongoUser.create(u as any);
        console.log(`[MongoDB/Mongoose SEED] Usuario creado: ${u.email}`);
      }
    }

    // Intelligent seeding for Articles
    for (const art of SEED_ARTICLES) {
      const artExists = await MongoArticle.findOne({
        $or: [{ id: art.id }, { title: art.title }]
      });
      if (!artExists) {
        await MongoArticle.create(art as any);
        console.log(`[MongoDB/Mongoose SEED] Artículo creado: ${art.title}`);
      }
    }

    // Default settings
    const settingsExists = await MongoSettings.findOne({ key: "site_settings" });
    if (!settingsExists) {
      await MongoSettings.create({
        key: "site_settings",
        siteName: "Columna Pública",
        siteSubtitle: "Asuntos Políticos, Macroeconomía e Inserción Global",
        enableComments: true,
        enableAIAdviser: true,
        enableRegistrations: true,
        enableShareButtons: true,
        heroLayout: 'editorial',
        alertBannerText: "Última Edición: Análisis estratégico de geopolítica regional y soberanía institucional chilenas."
      });
      console.log(`[MongoDB/Mongoose SEED] Ajustes iniciales creados.`);
    }

  } catch (error: any) {
    console.error("[MongoDB SEED] Error seeding:", error.message);
  }
}
