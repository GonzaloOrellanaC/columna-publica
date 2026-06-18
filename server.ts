import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Database, hashPassword } from "./src/db/db";
import { connectMongoDB, isMongoDbConnected, MongoUser, MongoArticle, MongoComment, MongoSettings, MongoApplication } from "./src/db/mongodb";
import { sendWelcomeEmail, sendApplicationEmail, sendRecoveryEmail } from "./src/utils/mailer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const app = express();
const port = 3000; // Hardcoded by platform

// Configure local storage and uploads
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("./uploads"));

// Initialize local database on startup
Database.init();

// Attempt connection to MongoDB if URI is present
connectMongoDB().catch(err => {
  console.log("[MongoDB Setup Error] Fallback to JSON Database.", err.message);
});

// Configure GoogleGenAI shared client for editorial AI Advisory
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ======================== API ENDPOINTS ========================

// 1. Image and File upload helpers
app.post("/api/upload/image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

app.post("/api/upload/document", upload.single("document"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

app.post("/api/upload/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// 2. Authentication Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Correo y contraseña son requeridos" });
  }

  const cleanEmail = email.toLowerCase();
  const incomingHash = hashPassword(password);

  if (isMongoDbConnected()) {
    try {
      const user = await MongoUser.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ success: false, message: "Credenciales de acceso inválidas." });
      }
      if (user.passwordHash !== incomingHash) {
        return res.status(401).json({ success: false, message: "Credenciales de acceso inválidas." });
      }
      if (user.blocked) {
        return res.status(403).json({ success: false, message: "Su cuenta se encuentra suspendida temporalmente." });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } catch (err: any) {
      console.error("[MongoDB Login Error] Fallback triggered", err.message);
    }
  }

  // Fallback to local DB
  const user = Database.data.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user || user.passwordHash !== incomingHash) {
    return res.status(401).json({ success: false, message: "Credenciales de acceso inválidas." });
  }
  if (user.blocked) {
    return res.status(403).json({ success: false, message: "Su cuenta se encuentra suspendida temporalmente." });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
});

// 3. User Register (Self registration)
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role, bio, avatar } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "Correo, contraseña y nombre son requeridos." });
  }

  const cleanEmail = email.toLowerCase();

  if (isMongoDbConnected()) {
    try {
      const existingUser = await MongoUser.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "El correo electrónico ya se encuentra registrado." });
      }
      const newId = "user-" + Math.random().toString(36).substring(2, 11);
      const incomingHash = hashPassword(password);
      const newUserDoc = new MongoUser({
        id: newId,
        email: cleanEmail,
        passwordHash: incomingHash,
        name,
        role: role || 'columnist',
        bio: bio || "",
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
        createdAt: new Date().toISOString()
      });
      await newUserDoc.save();

      return res.status(201).json({
        success: true,
        user: {
          id: newUserDoc.id,
          email: newUserDoc.email,
          name: newUserDoc.name,
          role: newUserDoc.role,
          bio: newUserDoc.bio,
          avatar: newUserDoc.avatar,
          createdAt: newUserDoc.createdAt
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Local JSON DB logic
  try {
    const newUser = Database.createUser(email, password, name, role || 'columnist', bio, avatar);
    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        bio: newUser.bio,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// 15. Password Recovery - Step 1: Send Recovery Link with Token
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "El correo electrónico es requerido." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const token = "tok-" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
  const expiration = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour validity

  let targetUser: any = null;

  if (isMongoDbConnected()) {
    try {
      targetUser = await MongoUser.findOne({ email: cleanEmail });
      if (targetUser) {
        targetUser.resetToken = token;
        targetUser.resetTokenExpires = expiration;
        await targetUser.save();
      }
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  } else {
    targetUser = Database.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (targetUser) {
      targetUser.resetToken = token;
      targetUser.resetTokenExpires = expiration;
      Database.persist();
    }
  }

  // To protect user privacy, we act as if the process succeeds regardless of email presence.
  if (targetUser) {
    const origin = req.headers.origin || `http://${req.headers.host}` || "https://columnapublica.cl";
    const resetLink = `${origin}/login?recoveryToken=${token}`;

    sendRecoveryEmail({
      email: targetUser.email,
      name: targetUser.name,
      resetLink
    }).catch(err => {
      console.error("[Email Notification Error] Falló el correo de recuperación:", err);
    });
  }

  return res.json({ 
    success: true, 
    message: "Si el correo electrónico se encuentra registrado en nuestro sistema, recibirá un mensaje con las instrucciones de restablecimiento en breve." 
  });
});

// 16. Password Recovery - Step 2: Set New Password with valid Token
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "El token de recuperación y la nueva contraseña son requeridos." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 6 caracteres." });
  }

  const hashed = hashPassword(newPassword);
  let userUpdated = false;

  if (isMongoDbConnected()) {
    try {
      const user = await MongoUser.findOne({ resetToken: token });
      if (user) {
        const expiresAt = user.resetTokenExpires ? new Date(user.resetTokenExpires).getTime() : 0;
        if (expiresAt > Date.now()) {
          user.passwordHash = hashed;
          user.resetToken = "";
          user.resetTokenExpires = "";
          await user.save();
          userUpdated = true;
        }
      }
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  } else {
    // Local JSON Db
    const user = Database.data.users.find(u => u.resetToken === token);
    if (user) {
      const expiresAt = user.resetTokenExpires ? new Date(user.resetTokenExpires).getTime() : 0;
      if (expiresAt > Date.now()) {
        user.passwordHash = hashed;
        user.resetToken = "";
        user.resetTokenExpires = "";
        Database.persist();
        userUpdated = true;
      }
    }
  }

  if (!userUpdated) {
    return res.status(400).json({ 
      success: false, 
      message: "El enlace de recuperación es inválido o ha expirado. Por favor, solicite uno nuevo." 
    });
  }

  return res.json({ success: true, message: "Su contraseña ha sido reconfigurada exitosamente. Ahora puede iniciar sesión con sus nuevas credenciales." });
});

// 4. Users list (Super Admin panel)
app.get("/api/users", async (req, res) => {
  if (isMongoDbConnected()) {
    try {
      const users = await MongoUser.find({});
      const sanitized = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        bio: u.bio,
        avatar: u.avatar,
        createdAt: u.createdAt,
        blocked: u.blocked,
        isDemo: u.isDemo
      }));
      return res.json({ success: true, users: sanitized });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Local JSON Fallback
  const sanitized = Database.data.users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    bio: u.bio,
    avatar: u.avatar,
    createdAt: u.createdAt,
    blocked: u.blocked,
    isDemo: u.isDemo
  }));
  return res.json({ success: true, users: sanitized });
});

// 5. Create user explicitly by Admin - SENT WELCOME EMAIL (NODEMAILER INTEGRATION)
app.post("/api/users", async (req, res) => {
  const { email, password, name, role, bio, avatar } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "Correo, contraseña y nombre completo son requeridos." });
  }

  const cleanEmail = email.toLowerCase();
  let createdUser: any = null;

  if (isMongoDbConnected()) {
    try {
      const existingUser = await MongoUser.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "El correo electrónico ya se encuentra registrado." });
      }
      const newId = "user-" + Math.random().toString(36).substring(2, 11);
      const incomingHash = hashPassword(password);
      const newUserDoc = new MongoUser({
        id: newId,
        email: cleanEmail,
        passwordHash: incomingHash,
        name,
        role: role || 'columnist',
        bio: bio || "",
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
        createdAt: new Date().toISOString()
      });
      await newUserDoc.save();
      createdUser = {
        id: newUserDoc.id,
        email: newUserDoc.email,
        name: newUserDoc.name,
        role: newUserDoc.role,
        bio: newUserDoc.bio,
        avatar: newUserDoc.avatar,
        createdAt: newUserDoc.createdAt
      };
    } catch (err: any) {
      console.warn("[MongoDB] Error saving admin-created user", err.message);
    }
  }

  if (!createdUser) {
    try {
      const newUser = Database.createUser(email, password, name, role || 'columnist', bio, avatar);
      const { passwordHash, ...userSession } = newUser;
      createdUser = userSession;
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error al crear el usuario." });
    }
  }

  // Trigger non-blocking welcome email sending
  sendWelcomeEmail({
    email: cleanEmail,
    name,
    role: role || 'columnist',
    passwordClearText: password
  }).catch(e => {
    console.error("[SMTP Notification] Error in asynchronous welcome email delivery:", e);
  });

  return res.status(201).json({ success: true, user: createdUser });
});

// 6. Update user metadata / suspend / password change
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, bio, avatar, role, password, blocked } = req.body;

  if (isMongoDbConnected()) {
    try {
      const user = await MongoUser.findOne({ id });
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }

      if (name !== undefined) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (role !== undefined) user.role = role;
      if (blocked !== undefined) user.blocked = blocked;
      if (password) {
        user.passwordHash = hashPassword(password);
      }

      await user.save();
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          blocked: user.blocked
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Local JSON fallback
  const user = Database.data.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado." });
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (role !== undefined) user.role = role;
  if (blocked !== undefined) user.blocked = blocked;
  if (password) {
    user.passwordHash = hashPassword(password);
  }

  Database.persist();

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      blocked: user.blocked
    }
  });
});

// 7. Delete User (Cannot delete super-primary)
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  if (id === "user-super-primary") {
    return res.status(403).json({ success: false, message: "No es posible eliminar el Súper Administrador primario de la plataforma." });
  }

  if (isMongoDbConnected()) {
    try {
      const result = await MongoUser.deleteOne({ id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }
      return res.json({ success: true, message: "Usuario desvinculado con éxito." });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const idx = Database.data.users.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }
  Database.data.users.splice(idx, 1);
  Database.persist();
  return res.json({ success: true, message: "Usuario desvinculado con éxito." });
});


// 8. Editorial Articles Endpoints (List, Read, Create, Edit, Delete)
app.get("/api/articles", async (req, res) => {
  const { includeDrafts, category, authorId } = req.query;

  if (isMongoDbConnected()) {
    try {
      const query: any = {};
      if (includeDrafts !== "true") {
        query.status = "published";
      }
      if (category) {
        query.category = category;
      }
      if (authorId) {
        query.authorId = authorId;
      }
      const articles = await MongoArticle.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, articles });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Local fallback
  let list = [...Database.data.articles];
  if (includeDrafts !== "true") {
    list = list.filter(a => a.status === "published");
  }
  if (category) {
    list = list.filter(a => a.category === category);
  }
  if (authorId) {
    list = list.filter(a => a.authorId === authorId);
  }
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, articles: list });
});

app.get("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  if (isMongoDbConnected()) {
    try {
      const art = await MongoArticle.findOne({ id });
      if (!art) return res.status(404).json({ success: false, message: "Artículo no encontrado" });
      art.views += 1;
      await art.save();
      return res.json({ success: true, article: art });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  const art = Database.data.articles.find(a => a.id === id);
  if (!art) return res.status(404).json({ success: false, message: "Artículo no encontrado" });
  art.views += 1;
  Database.persist();
  return res.json({ success: true, article: art });
});

app.post("/api/articles", async (req, res) => {
  const { title, subtitle, content, category, imageUrl, status, tags, authorId, authorName, authorAvatar } = req.body;
  
  if (!title || !content || !authorId) {
    return res.status(400).json({ success: false, message: "Título, contenido y autor id son obligatorios." });
  }

  const newId = "art-" + Math.random().toString(36).substring(2, 11);
  const articleObj = {
    id: newId,
    title,
    subtitle: subtitle || "",
    content,
    category: category || "General",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    status: status || "draft",
    tags: Array.isArray(tags) ? tags : [],
    authorId,
    authorName,
    authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0
  };

  if (isMongoDbConnected()) {
    try {
      const newDoc = new MongoArticle(articleObj as any);
      await newDoc.save();
      return res.status(201).json({ success: true, article: newDoc });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  Database.data.articles.push(articleObj as any);
  Database.persist();
  return res.status(201).json({ success: true, article: articleObj });
});

app.put("/api/articles/:id", async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, content, category, imageUrl, status, tags } = req.body;

  if (isMongoDbConnected()) {
    try {
      const art = await MongoArticle.findOne({ id });
      if (!art) return res.status(404).json({ success: false, message: "Artículo no encontrado." });
      
      if (title !== undefined) art.title = title;
      if (subtitle !== undefined) art.subtitle = subtitle;
      if (content !== undefined) art.content = content;
      if (category !== undefined) art.category = category;
      if (imageUrl !== undefined) art.imageUrl = imageUrl;
      if (status !== undefined) art.status = status;
      if (tags !== undefined) art.tags = tags;
      art.updatedAt = new Date().toISOString();

      await art.save();
      return res.json({ success: true, article: art });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  const art = Database.data.articles.find(a => a.id === id);
  if (!art) return res.status(404).json({ success: false, message: "Artículo no encontrado." });

  if (title !== undefined) art.title = title;
  if (subtitle !== undefined) art.subtitle = subtitle;
  if (content !== undefined) art.content = content;
  if (category !== undefined) art.category = category;
  if (imageUrl !== undefined) art.imageUrl = imageUrl;
  if (status !== undefined) art.status = status;
  if (tags !== undefined) art.tags = tags;
  art.updatedAt = new Date().toISOString();

  Database.persist();
  return res.json({ success: true, article: art });
});

app.delete("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  if (isMongoDbConnected()) {
    try {
      const result = await MongoArticle.deleteOne({ id });
      if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Artículo no encontrado." });
      return res.json({ success: true, message: "Artículo eliminado con éxito." });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  const idx = Database.data.articles.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Artículo no encontrado." });

  Database.data.articles.splice(idx, 1);
  Database.persist();
  return res.json({ success: true, message: "Artículo eliminado con éxito." });
});

// 9. Comments Endpoints
app.get("/api/articles/:id/comments", async (req, res) => {
  const { id } = req.params;

  if (isMongoDbConnected()) {
    try {
      const comments = await MongoComment.find({ articleId: id }).sort({ createdAt: -1 });
      return res.json({ success: true, comments });
    } catch (e: any) {
      return res.status(205).json({ success: false, message: e.message });
    }
  }

  const list = Database.data.comments.filter(c => c.articleId === id);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, comments: list });
});

app.post("/api/articles/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { authorName, authorEmail, content } = req.body;

  if (!authorName || !authorEmail || !content) {
    return res.status(400).json({ success: false, message: "Todos los campos del comentario son obligatorios." });
  }

  const newId = "comm-" + Math.random().toString(36).substring(2, 11);
  const commentObj = {
    id: newId,
    articleId: id,
    authorName,
    authorEmail,
    content,
    createdAt: new Date().toISOString()
  };

  if (isMongoDbConnected()) {
    try {
      const doc = new MongoComment(commentObj);
      await doc.save();
      return res.status(201).json({ success: true, comment: doc });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  Database.data.comments.push(commentObj);
  Database.persist();
  return res.status(201).json({ success: true, comment: commentObj });
});

// 10. Site Settings Endpoints
app.get("/api/settings", async (req, res) => {
  if (isMongoDbConnected()) {
    try {
      const settings = await MongoSettings.findOne({ key: "site_settings" });
      if (settings) {
        return res.json({
          success: true,
          settings: {
            siteName: settings.siteName,
            siteSubtitle: settings.siteSubtitle,
            enableComments: settings.enableComments,
            enableAIAdviser: settings.enableAIAdviser,
            enableRegistrations: settings.enableRegistrations,
            enableShareButtons: settings.enableShareButtons,
            heroLayout: settings.heroLayout,
            alertBannerText: settings.alertBannerText
          }
        });
      }
    } catch (e: any) {
      console.warn("MongoDB Settings get failed. Fetching memory fallback", e.message);
    }
  }

  return res.json({ success: true, settings: Database.data.settings });
});

app.put("/api/settings", async (req, res) => {
  const { siteName, siteSubtitle, enableComments, enableAIAdviser, enableRegistrations, enableShareButtons, heroLayout, alertBannerText } = req.body;

  if (isMongoDbConnected()) {
    try {
      const settings = await MongoSettings.findOne({ key: "site_settings" });
      if (settings) {
        if (siteName !== undefined) settings.siteName = siteName;
        if (siteSubtitle !== undefined) settings.siteSubtitle = siteSubtitle;
        if (enableComments !== undefined) settings.enableComments = enableComments;
        if (enableAIAdviser !== undefined) settings.enableAIAdviser = enableAIAdviser;
        if (enableRegistrations !== undefined) settings.enableRegistrations = enableRegistrations;
        if (enableShareButtons !== undefined) settings.enableShareButtons = enableShareButtons;
        if (heroLayout !== undefined) settings.heroLayout = heroLayout;
        if (alertBannerText !== undefined) settings.alertBannerText = alertBannerText;
        await settings.save();
        return res.json({ success: true, settings });
      }
    } catch (e: any) {
      console.warn("MongoDB update settings error, using fallback logic", e.message);
    }
  }

  const s = Database.data.settings;
  if (siteName !== undefined) s.siteName = siteName;
  if (siteSubtitle !== undefined) s.siteSubtitle = siteSubtitle;
  if (enableComments !== undefined) s.enableComments = enableComments;
  if (enableAIAdviser !== undefined) s.enableAIAdviser = enableAIAdviser;
  if (enableRegistrations !== undefined) s.enableRegistrations = enableRegistrations;
  if (enableShareButtons !== undefined) s.enableShareButtons = enableShareButtons;
  if (heroLayout !== undefined) s.heroLayout = heroLayout;
  if (alertBannerText !== undefined) s.alertBannerText = alertBannerText;

  Database.persist();
  return res.json({ success: true, settings: s });
});


// 11. AI Editorial Assistant (Gemini 3.5 Flash server-side logic)
app.post("/api/ai/suggest", async (req, res) => {
  const { draftTitle, draftContent, action } = req.body;
  if (!draftContent) {
    return res.status(400).json({ success: false, message: "Debe proveer el contenido del borrador para realizar análisis por Inteligencia Artificial." });
  }

  const client = getAiClient();
  if (!client) {
    return res.status(400).json({
      success: false,
      message: "El Asesor Editorial de IA no se encuentra activo debido a la falta de variables de entorno (GEMINI_API_KEY)."
    });
  }

  try {
    let customPrompt = "";
    if (action === "improve") {
      customPrompt = `Eres el Asesor Editorial de Inteligencia Artificial para el prestigioso periódico "Columna Pública". 
Te proveemos un borrador y debes redactar una versión mejorada, enriqueciendo la sofisticación de vocabulario, claridad macroeconómica o política, y estructurando párrafos fluidos y elegantes. 
Conserva la tesis central y cualquier referencia del autor original. Retorna ÚNICAMENTE la versión corregida y mejorada en texto plano y Markdown sin preámbulos.
Título del borrador: ${draftTitle || "Sin título"}
Contenido: ${draftContent}`;
    } else if (action === "outline") {
      customPrompt = `Eres el Asesor Editorial de "Columna Pública". Analiza el borrador provisto y provee una estructura recomendada (outline), títulos sugeridos, y 3 puntos clave macroeconómicos o de geopolítica regional que elevarían el debate de esta columna. Retorna la propuesta redactada con sofisticación extrema y formato Markdown.
Título: ${draftTitle || "Sin título"}
Contenido: ${draftContent}`;
    } else {
      customPrompt = `Eres el Editor Consultor de "Columna Pública". Haz una revisión crítica de ortografía, estilo, gramática y potencia retórica del siguiente texto. Indica los aciertos y ofrece 3 observaciones de mejora estilística o de rigor académico. Retorna en un tono culto, profesional y formativo utilizando Markdown.
Título: ${draftTitle || "Sin título"}
Contenido: ${draftContent}`;
    }

    // Call GenAI
    const aiResponse = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: customPrompt
    });

    const advice = aiResponse.text || "No se pudo obtener una respuesta adecuada del modelo editorial.";
    return res.json({ success: true, advice });
  } catch (error: any) {
    console.error("[Gemini API Error]", error);
    return res.status(500).json({ success: false, message: `Fallo el análisis inteligente: ${error.message}` });
  }
});


// 12. Columnist Applications Endpoints
app.post("/api/applications", async (req, res) => {
  const { name, email, degree, motivation, category, documentUrl } = req.body;
  if (!name || !email || !degree || !motivation) {
    return res.status(400).json({ success: false, message: "Nombre, Correo, Grado Académico/Profesión y Motivación son requeridos." });
  }

  const appObj = {
    id: "app-" + Math.random().toString(36).substring(2, 11),
    name,
    email: email.toLowerCase(),
    degree,
    motivation,
    category,
    documentUrl: documentUrl || "",
    status: "pending" as const,
    createdAt: new Date().toISOString()
  };

  // Dispatch email notification to admin asynchronously to avoid blocking user response
  sendApplicationEmail({
    name: appObj.name,
    email: appObj.email,
    degree: appObj.degree,
    motivation: appObj.motivation,
    category: appObj.category,
    documentUrl: appObj.documentUrl
  }).catch(err => {
    console.error("[Email Notification Error] Falló el envío de correo de postulación:", err);
  });

  if (isMongoDbConnected()) {
    try {
      const doc = new MongoApplication(appObj);
      await doc.save();
      return res.status(201).json({ success: true, application: doc });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  if (!Database.data.applications) {
    Database.data.applications = [];
  }
  Database.data.applications.push(appObj);
  Database.persist();
  return res.status(201).json({ success: true, application: appObj });
});

app.get("/api/applications", async (req, res) => {
  if (isMongoDbConnected()) {
    try {
      const apps = await MongoApplication.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, applications: apps });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
  
  if (!Database.data.applications) {
    Database.data.applications = [];
  }
  return res.json({ success: true, applications: [...Database.data.applications].reverse() });
});


// ======================== FRONTEND ASSETS ENGINE ========================

async function bootstrap() {
  if (isProd) {
    // Static assets from Vite production build
    app.use(express.static(path.resolve("./dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("./dist/index.html"));
    });
  } else {
    // Vite Dev middleware so that HMR (though disabled) and dev rendering works on port 3000
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`[Server] Columna Pública corriendo exitosamente en el puerto ${port}`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to start server:", err);
});
