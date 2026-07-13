import dns from "dns";
import mongoose from "mongoose";
import { SEED_USERS, SEED_ARTICLES } from "./seed_data";
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

export async function runMongoSeed() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const localDbPath = path.resolve("./database.json");

    if (fs.existsSync(localDbPath)) {
      console.log("[MongoDB/Mongoose MIGRATION] Archivo database.json local encontrado. Iniciando migración de datos hacia MongoDB...");
      const fileContent = fs.readFileSync(localDbPath, "utf-8");
      const localData = JSON.parse(fileContent);

      // 1. Migrar Usuarios
      if (Array.isArray(localData.users)) {
        for (const u of localData.users) {
          const uExists = await MongoUser.findOne({
            $or: [{ id: u.id }, { email: u.email.toLowerCase().trim() }]
          });
          if (!uExists) {
            await MongoUser.create({
              id: u.id,
              email: u.email.toLowerCase().trim(),
              passwordHash: u.passwordHash,
              name: u.name,
              role: u.role || "columnist",
              bio: u.bio || "",
              avatar: u.avatar || "/default-avatar.svg",
              isDemo: !!u.isDemo,
              createdAt: u.createdAt || new Date().toISOString(),
              blocked: !!u.blocked,
              resetToken: u.resetToken || "",
              resetTokenExpires: u.resetTokenExpires || ""
            });
            console.log(`[MongoDB MIGRATION] Usuario migrado de database.json: ${u.email}`);
          } else {
            // Sincronizar datos
            uExists.name = u.name;
            uExists.role = u.role || uExists.role;
            uExists.bio = u.bio !== undefined ? u.bio : uExists.bio;
            uExists.avatar = u.avatar || uExists.avatar;
            uExists.passwordHash = u.passwordHash || uExists.passwordHash;
            uExists.blocked = u.blocked !== undefined ? u.blocked : uExists.blocked;
            if (u.resetToken !== undefined) uExists.resetToken = u.resetToken;
            if (u.resetTokenExpires !== undefined) uExists.resetTokenExpires = u.resetTokenExpires;
            await uExists.save();
          }
        }
      }

      // 2. Migrar Artículos
      if (Array.isArray(localData.articles)) {
        for (const art of localData.articles) {
          const artExists = await MongoArticle.findOne({ id: art.id });
          if (!artExists) {
            await MongoArticle.create({
              id: art.id,
              title: art.title,
              subtitle: art.subtitle || "",
              content: art.content,
              category: art.category || "General",
              imageUrl: art.imageUrl || "",
              status: art.status || "draft",
              tags: Array.isArray(art.tags) ? art.tags : [],
              authorId: art.authorId,
              authorName: art.authorName,
              authorAvatar: art.authorAvatar || "/default-avatar.svg",
              createdAt: art.createdAt || new Date().toISOString(),
              updatedAt: art.updatedAt || new Date().toISOString(),
              views: typeof art.views === "number" ? art.views : 0
            });
            console.log(`[MongoDB MIGRATION] Artículo migrado de database.json: "${art.title}"`);
          } else {
            // Sincronizar por si hubo cambios locales
            artExists.title = art.title;
            artExists.subtitle = art.subtitle || "";
            artExists.content = art.content;
            artExists.category = art.category || "General";
            artExists.imageUrl = art.imageUrl || artExists.imageUrl;
            artExists.status = art.status || artExists.status;
            artExists.tags = Array.isArray(art.tags) ? art.tags : artExists.tags;
            artExists.authorId = art.authorId;
            artExists.authorName = art.authorName;
            artExists.authorAvatar = art.authorAvatar || artExists.authorAvatar;
            artExists.updatedAt = art.updatedAt || new Date().toISOString();
            await artExists.save();
          }
        }
      }

      // 3. Migrar Comentarios
      if (Array.isArray(localData.comments)) {
        for (const c of localData.comments) {
          const cExists = await MongoComment.findOne({ id: c.id });
          if (!cExists) {
            await MongoComment.create({
              id: c.id,
              articleId: c.articleId,
              authorName: c.authorName,
              authorEmail: c.authorEmail,
              content: c.content,
              createdAt: c.createdAt || new Date().toISOString(),
              parentId: c.parentId || ""
            });
            console.log(`[MongoDB MIGRATION] Comentario migrado de database.json: de ${c.authorName}`);
          }
        }
      }

      // 4. Migrar Settings
      if (localData.settings) {
        const s = localData.settings;
        let settingsExists = await MongoSettings.findOne({ key: "site_settings" });
        if (!settingsExists) {
          await MongoSettings.create({
            key: "site_settings",
            siteName: s.siteName || "Columna Pública",
            siteSubtitle: s.siteSubtitle || "Asuntos Políticos, Macroeconomía e Inserción Global",
            enableComments: s.enableComments !== undefined ? s.enableComments : true,
            enableAIAdviser: s.enableAIAdviser !== undefined ? s.enableAIAdviser : true,
            enableRegistrations: s.enableRegistrations !== undefined ? s.enableRegistrations : true,
            enableShareButtons: s.enableShareButtons !== undefined ? s.enableShareButtons : true,
            heroLayout: s.heroLayout || 'editorial',
            alertBannerText: s.alertBannerText || "",
            convictionText: s.convictionText || "",
            quienesSomosTitle: s.quienesSomosTitle || "¿Quiénes Somos?",
            quienesSomosDescription: s.quienesSomosDescription || "",
            quienesSomosPeople: Array.isArray(s.quienesSomosPeople) ? s.quienesSomosPeople : [],
            editorialSlogan: s.editorialSlogan || "",
            facebookUrl: s.facebookUrl || "",
            instagramUrl: s.instagramUrl || "",
            whatsappUrl: s.whatsappUrl || "",
            mailContactUrl: s.mailContactUrl || ""
          });
          console.log(`[MongoDB MIGRATION] Configuración de sitio migrada.`);
        } else {
          // Sincronizar configuraciones locales a MongoDB
          if (s.siteName !== undefined) settingsExists.siteName = s.siteName;
          if (s.siteSubtitle !== undefined) settingsExists.siteSubtitle = s.siteSubtitle;
          if (s.enableComments !== undefined) settingsExists.enableComments = s.enableComments;
          if (s.enableAIAdviser !== undefined) settingsExists.enableAIAdviser = s.enableAIAdviser;
          if (s.enableRegistrations !== undefined) settingsExists.enableRegistrations = s.enableRegistrations;
          if (s.enableShareButtons !== undefined) settingsExists.enableShareButtons = s.enableShareButtons;
          if (s.heroLayout !== undefined) settingsExists.heroLayout = s.heroLayout;
          if (s.alertBannerText !== undefined) settingsExists.alertBannerText = s.alertBannerText;
          if (s.convictionText !== undefined) settingsExists.convictionText = s.convictionText;
          if (s.quienesSomosTitle !== undefined) settingsExists.quienesSomosTitle = s.quienesSomosTitle;
          if (s.quienesSomosDescription !== undefined) settingsExists.quienesSomosDescription = s.quienesSomosDescription;
          if (s.quienesSomosPeople !== undefined) settingsExists.quienesSomosPeople = s.quienesSomosPeople;
          if (s.editorialSlogan !== undefined) settingsExists.editorialSlogan = s.editorialSlogan;
          if (s.facebookUrl !== undefined) settingsExists.facebookUrl = s.facebookUrl;
          if (s.instagramUrl !== undefined) settingsExists.instagramUrl = s.instagramUrl;
          if (s.whatsappUrl !== undefined) settingsExists.whatsappUrl = s.whatsappUrl;
          if (s.mailContactUrl !== undefined) settingsExists.mailContactUrl = s.mailContactUrl;
          
          settingsExists.markModified("quienesSomosPeople");
          await settingsExists.save();
        }
      }

      // 5. Migrar Applications
      if (Array.isArray(localData.applications)) {
        for (const app of localData.applications) {
          const appExists = await MongoApplication.findOne({ id: app.id });
          if (!appExists) {
            await MongoApplication.create({
              id: app.id,
              name: app.name,
              email: app.email,
              degree: app.degree,
              motivation: app.motivation,
              category: app.category,
              documentUrl: app.documentUrl || "",
              createdAt: app.createdAt || new Date().toISOString(),
              status: app.status || "pending"
            });
            console.log(`[MongoDB MIGRATION] Postulación migrada de: ${app.name}`);
          }
        }
      }

      // 6. Migrar ReaderVerifications
      if (Array.isArray(localData.readerVerifications)) {
        for (const rv of localData.readerVerifications) {
          const rvExists = await MongoReaderVerification.findOne({ email: rv.email.toLowerCase().trim() });
          if (!rvExists) {
            await MongoReaderVerification.create({
              email: rv.email.toLowerCase().trim(),
              name: rv.name,
              code: rv.code,
              verified: !!rv.verified,
              style: rv.style || "",
              createdAt: rv.createdAt || new Date().toISOString()
            });
            console.log(`[MongoDB MIGRATION] Verificación de lector migrada para: ${rv.email}`);
          }
        }
      }

      console.log("[MongoDB/Mongoose MIGRATION] Migración de database.json completada exitosamente.");
    } else {
      console.log("[MongoDB/Mongoose SEED] No se encontró database.json local. Cargando semilla predeterminada...");
      // Migration: Update existing user avatars from blank or Unsplash to /default-avatar.svg
      await MongoUser.updateMany(
        { $or: [{ avatar: "" }, { avatar: null }, { avatar: /unsplash\.com/ }] },
        { $set: { avatar: "/default-avatar.svg" } }
      );

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

      // Default settings
      let settingsExists = await MongoSettings.findOne({ key: "site_settings" });
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
          alertBannerText: "Última Edición: Análisis estratégico de geopolítica regional y soberanía institucional chilenas.",
          convictionText: "Sostenemos la firme convicción de que la deliberación informada, estructurada sobre los principios de soberanía institucional, macroeconomía científica y un riguroso análisis estratégico, conforma la verdadera columna de sostén para la estabilidad republicana en un orden multilateral multipolar.",
          quienesSomosTitle: "¿Quiénes Somos?",
          quienesSomosDescription: "Somos un foro deliberativo técnico-político y estratégico de alto estándar, dedicado al análisis independiente de las estructuras de poder global, la soberanía económica y la inserción internacional.",
          editorialSlogan: "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas.",
          facebookUrl: "https://www.facebook.com/profile.php?id=61576453450034",
          instagramUrl: "https://www.instagram.com/columnapublica/",
          whatsappUrl: "https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q",
          mailContactUrl: "contacto@columnapublica.cl",
          quienesSomosPeople: [
            {
              id: "p1",
              firstName: "Gonzalo",
              lastName: "Orellana",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              title: "Director General & Tecnológico",
              description: "Ingeniero en Computación e Informática. Especialista en arquitecturas web soberanas, encriptamiento estratégico y descentralización."
            },
            {
              id: "p2",
              firstName: "Ricardo",
              lastName: "Fábrega",
              avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              title: "Editor Técnico de Salud & Consejero",
              description: "Doctor por la Universidad de Chile. Presidente de Corporación Alma Ata, pensador de debates estructurales y gestión pública."
            }
          ]
        });
        console.log(`[MongoDB/Mongoose SEED] Ajustes iniciales creados.`);
      }
    }
  } catch (error: any) {
    console.error("[MongoDB SEED] Error durante la inicialización o migración:", error.message);
  }
}
