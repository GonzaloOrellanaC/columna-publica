import dns from "dns";
import mongoose from "mongoose";
import { logger } from "../utils/logger";

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
  avatar: { type: String, default: "/default-avatar.svg" },
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
  createdAt: { type: String, required: true },
  parentId: { type: String, default: "" }
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
  alertBannerText: { type: String, default: "" },
  convictionText: { type: String, default: "Sostenemos la firme convicción de que la deliberación informada, estructurada sobre los principios de soberanía institucional, macroeconomía científica y un riguroso análisis estratégico, conforma la verdadera columna de sostén para la estabilidad republicana en un orden multilateral multipolar." },
  quienesSomosTitle: { type: String, default: "¿Quiénes Somos?" },
  quienesSomosDescription: { type: String, default: "Somos un foro deliberativo técnico-político y estratégico de alto estándar, dedicado al análisis independiente de las estructuras de poder global, la soberanía económica y la inserción internacional." },
  quienesSomosPeople: { type: Array, default: [] },
  editorialSlogan: { type: String, default: "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas." },
  facebookUrl: { type: String, default: "https://www.facebook.com/profile.php?id=61576453450034" },
  instagramUrl: { type: String, default: "https://www.instagram.com/columnapublica/" },
  whatsappUrl: { type: String, default: "https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q" },
  mailContactUrl: { type: String, default: "contacto@columnapublica.cl" }
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

// Reader Verification Schema
const ReaderVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  verified: { type: Boolean, default: false },
  style: { type: String, default: "" },
  createdAt: { type: String, required: true }
});

export const MongoUser = mongoose.models.User || mongoose.model("User", UserSchema);
export const MongoArticle = mongoose.models.Article || mongoose.model("Article", ArticleSchema);
export const MongoComment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export const MongoSettings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
export const MongoApplication = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
export const MongoReaderVerification = mongoose.models.ReaderVerification || mongoose.model("ReaderVerification", ReaderVerificationSchema);

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn("[MongoDB/Mongoose] No se pudo conectar a MongoDB porque la variable de entorno MONGODB_URI no está configurada. Operando con el sistema de base de datos local en archivo JSON.");
    return false;
  }

  try {
    if (isConnected) {
      logger.info("[MongoDB/Mongoose] Conexión a MongoDB ya establecida previamente.");
      return true;
    }
    // Set custom DNS servers prior to connection to resolve atlas hosts robustly
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      logger.info("[MongoDB/Mongoose] DNS configurado exitosamente a Google (8.8.8.8) y Cloudflare (1.1.1.1).");
    } catch (dnsErr: any) {
      logger.warn("[MongoDB/Mongoose] No se pudieron configurar servidores DNS explícitos: " + dnsErr.message);
    }
    await mongoose.connect(uri);
    isConnected = true;
    logger.info("[MongoDB/Mongoose] Conectado exitosamente a la base de datos de MongoDB.");

    return true;
  } catch (err: any) {
    logger.error(`[MongoDB/Mongoose] Falló la conexión a MongoDB. Se usará el sistema de archivos local de respaldo. Causa técnica del error: ${err.message}`, err);
    return false;
  }
}

export function isMongoDbConnected(): boolean {
  return isConnected;
}

