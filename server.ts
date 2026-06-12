import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Database } from "./src/db/db";
import { connectMongoDB, isMongoDbConnected, MongoArticle, MongoUser } from "./src/db/mongodb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

// Create public upload folders symmetrically
const DIR_IMAGES = path.join(process.cwd(), "public", "uploads", "images");
const DIR_DOCUMENTS = path.join(process.cwd(), "public", "uploads", "documents");
const DIR_AVATARS = path.join(process.cwd(), "public", "uploads", "avatars");

fs.mkdirSync(DIR_IMAGES, { recursive: true });
fs.mkdirSync(DIR_DOCUMENTS, { recursive: true });
fs.mkdirSync(DIR_AVATARS, { recursive: true });

// Initialize Database (Seeds Super Admins and default articles)
Database.initialize();

// Initialize MongoDB via Mongoose connection
connectMongoDB();


// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Configure Multer engine
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") {
      cb(null, DIR_IMAGES);
    } else if (file.fieldname === "document") {
      cb(null, DIR_DOCUMENTS);
    } else if (file.fieldname === "avatar") {
      cb(null, DIR_AVATARS);
    } else {
      cb(new Error("Campo de archivo no válido"), "");
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${basename}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: uploadStorage });

// --- API Endpoint definitions ---

// Upload API Endpoints
app.post("/api/upload/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se proporcionó ninguna imagen." });
  }
  const fileUrl = `/public/uploads/images/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

app.post("/api/upload/document", upload.single("document"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se proporcionó ningún documento." });
  }
  const fileUrl = `/public/uploads/documents/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, name: req.file.originalname });
});

app.post("/api/upload/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se proporcionó ningún avatar." });
  }
  const fileUrl = `/public/uploads/avatars/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Auth endpoints
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Correo y contraseña son requeridos." });
  }

  if (isMongoDbConnected()) {
    try {
      const user = await MongoUser.findOne({ email: email.toLowerCase() });
      if (user) {
        const incomingHash = Buffer.from(password + 'columna_salt_2026').toString('base64');
        if (user.passwordHash === incomingHash) {
          if (user.blocked) {
            return res.status(403).json({ success: false, message: "Su cuenta ha sido bloqueada temporalmente por el Súper Administrador." });
          }
          const userSession = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            bio: user.bio,
            avatar: user.avatar,
            blocked: user.blocked || false,
            isDemo: user.isDemo || false,
            createdAt: user.createdAt
          };
          return res.json({ success: true, user: userSession });
        }
      }
      return res.status(401).json({ success: false, message: "Credenciales de acceso inválidas." });
    } catch (err: any) {
      console.warn("[MongoDB] Error de autenticación en Mongo, usando respaldo JSON:", err.message);
    }
  }

  const authenticatedUser = Database.verifyCredentials(email, password);
  if (!authenticatedUser) {
    return res.status(401).json({ success: false, message: "Credenciales de acceso inválidas." });
  }

  if (authenticatedUser.blocked) {
    return res.status(403).json({ success: false, message: "Su cuenta ha sido bloqueada temporalmente por el Súper Administrador." });
  }

  // Exclude passwordHash in output
  const { passwordHash, ...userSession } = authenticatedUser;
  res.json({ success: true, user: userSession });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role, bio, avatar } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "Correo, contraseña y nombre completo son requeridos." });
  }

  if (isMongoDbConnected()) {
    try {
      const existingUser = await MongoUser.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "El correo electrónico ya se encuentra registrado." });
      }
      const newId = "user-" + Math.random().toString(36).substring(2, 11);
      const incomingHash = Buffer.from(password + 'columna_salt_2026').toString('base64');
      const newUserDoc = new MongoUser({
        id: newId,
        email: email.toLowerCase(),
        passwordHash: incomingHash,
        name,
        role: role || 'columnist',
        bio: bio || "",
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
        createdAt: new Date().toISOString()
      });
      await newUserDoc.save();
      
      const userSession = {
        id: newUserDoc.id,
        email: newUserDoc.email,
        name: newUserDoc.name,
        role: newUserDoc.role,
        bio: newUserDoc.bio,
        avatar: newUserDoc.avatar,
        createdAt: newUserDoc.createdAt
      };
      return res.status(201).json({ success: true, user: userSession });
    } catch (err: any) {
      console.warn("[MongoDB] Error al registrar usuario, usando respaldo JSON:", err.message);
    }
  }

  try {
    const newUser = Database.createUser(email, password, name, role || 'columnist', bio, avatar);
    const { passwordHash, ...userSession } = newUser;
    res.status(201).json({ success: true, user: userSession });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Error al registrar el usuario." });
  }
});

// Users endpoints
app.get("/api/users", async (req, res) => {
  if (isMongoDbConnected()) {
    try {
      const list = await MongoUser.find({}, { passwordHash: 0 });
      return res.json({ success: true, users: list });
    } catch (err: any) {
      console.warn("[MongoDB] Error listando usuarios, usando respaldo JSON:", err.message);
    }
  }

  try {
    const list = Database.getUsers().map(({ passwordHash, ...safeUser }) => safeUser);
    res.json({ success: true, users: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, bio, avatar, role, password, blocked } = req.body;

  if (isMongoDbConnected()) {
    try {
      const user = await MongoUser.findOne({ id });
      if (user) {
        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;
        if (role !== undefined) user.role = role;
        if (blocked !== undefined) {
          user.blocked = blocked;
        }
        if (password !== undefined && password !== "") {
          const incomingHash = Buffer.from(password + 'columna_salt_2026').toString('base64');
          user.passwordHash = incomingHash;
        }
        await user.save();
        const safeUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          blocked: user.blocked || false,
          createdAt: user.createdAt
        };
        return res.json({ success: true, user: safeUser });
      }
    } catch (err: any) {
      console.warn("[MongoDB] Error actualizando usuario, usando respaldo JSON:", err.message);
    }
  }

  try {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (role !== undefined) updates.role = role;
    if (blocked !== undefined) updates.blocked = blocked;
    if (password !== undefined && password !== "") {
      const incomingHash = Buffer.from(password + 'columna_salt_2026').toString('base64');
      updates.passwordHash = incomingHash;
    }

    const updated = Database.updateUser(id, updates);
    const { passwordHash, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  // Check if target user is a super admin ('admin' role)
  let targetRole = "";
  if (isMongoDbConnected()) {
    try {
      const u = await MongoUser.findOne({ id });
      if (u) {
        targetRole = u.role;
      }
    } catch (_) {}
  }
  if (!targetRole) {
    const u = Database.getUserById(id);
    if (u) {
      targetRole = u.role;
    }
  }

  if (targetRole === "admin") {
    return res.status(430).json({ success: false, message: "No está permitido eliminar a cuentas de Súper Administrador por motivos de seguridad." });
  }

  if (isMongoDbConnected()) {
    try {
      const result = await MongoUser.deleteOne({ id });
      if (result.deletedCount && result.deletedCount > 0) {
        return res.json({ success: true, message: "Usuario eliminado exitosamente de MongoDB." });
      } else {
        return res.status(404).json({ success: false, message: "Usuario no encontrado en base de datos." });
      }
    } catch (err: any) {
      console.warn("[MongoDB] Error eliminando usuario en Mongo, usando respaldo JSON:", err.message);
    }
  }

  try {
    const deleted = Database.deleteUser(id);
    if (deleted) {
      res.json({ success: true, message: "Usuario eliminado exitosamente del archivo JSON." });
    } else {
      res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Articles endpoints
app.get("/api/articles", async (req, res) => {
  const authorId = req.query.authorId as string | undefined;
  const includeDrafts = req.query.includeDrafts === "true";
  const isDemoPath = req.query.isDemoPath === "true";
  
  if (isMongoDbConnected()) {
    try {
      const query: any = {};
      if (!includeDrafts) {
        query.status = "published";
      }
      if (authorId) {
        query.authorId = authorId;
      }

      if (!isDemoPath) {
        // Exclude publications of all demo users
        const demoUsers = await MongoUser.find({ isDemo: true }, { id: 1 });
        const demoUserIds = demoUsers.map(u => u.id);
        const hardcodedDemoIds = ["user-marachia", "user-cauvia", "user-aaron", "user-editor-demo"];
        const allExcludeIds = Array.from(new Set([...demoUserIds, ...hardcodedDemoIds]));
        
        if (authorId) {
          // If a specific author is targeted, but isDemoPath is false, check if they are demo
          if (allExcludeIds.includes(authorId)) {
            return res.json({ success: true, articles: [] });
          }
        } else {
          query.authorId = { $nin: allExcludeIds };
        }
      }

      const mongoArticles = await MongoArticle.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, articles: mongoArticles });
    } catch (err: any) {
      console.warn("[MongoDB] Error al consultar artículos de Mongo, usando respaldo JSON:", err.message);
    }
  }

  // Administrators can see draft/review articles of all users.
  // Columnists can see their own drafts and all published articles.
  let articles = Database.getArticles(includeDrafts, authorId);
  if (!isDemoPath) {
    const demoUserIds = ["user-marachia", "user-cauvia", "user-aaron", "user-editor-demo"];
    if (authorId) {
      if (demoUserIds.includes(authorId)) {
        articles = [];
      }
    } else {
      articles = articles.filter(a => !demoUserIds.includes(a.authorId));
    }
  }
  res.json({ success: true, articles });
});

app.get("/api/articles/:id", async (req, res) => {
  if (isMongoDbConnected()) {
    try {
      const art = await MongoArticle.findOne({ id: req.params.id });
      if (art) {
        art.views = (art.views || 0) + 1;
        await art.save();
        return res.json({ success: true, article: art });
      } else {
        return res.status(404).json({ success: false, message: "Artículo no encontrado en base de datos." });
      }
    } catch (err: any) {
      console.warn("[MongoDB] Error buscando artículo, usando respaldo JSON:", err.message);
    }
  }

  const article = Database.getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: "Artículo no encontrado." });
  }
  res.json({ success: true, article });
});

app.post("/api/articles", async (req, res) => {
  const { title, subtitle, content, category, imageUrl, status, tags, authorId, authorName, authorAvatar } = req.body;
  if (!title || !content || !authorId || !authorName) {
    return res.status(400).json({ success: false, message: "Título, contenido y autor son obligatorios." });
  }

  if (isMongoDbConnected()) {
    try {
      const newId = "art-" + Math.random().toString(36).substring(2, 11);
      const articleDoc = new MongoArticle({
        id: newId,
        title,
        subtitle: subtitle || "",
        content,
        category: category || "General",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
        status: status || "draft",
        tags: tags || [],
        authorId,
        authorName,
        authorAvatar: authorAvatar || ""
      });
      await articleDoc.save();
      return res.status(201).json({ success: true, article: articleDoc });
    } catch (err: any) {
      console.warn("[MongoDB] Falló creación en Mongo, usando respaldo JSON:", err.message);
    }
  }

  try {
    const newArticle = Database.createArticle({
      title,
      subtitle: subtitle || "",
      content,
      category: category || "General",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
      status: status || "draft",
      tags: tags || [],
      authorId,
      authorName,
      authorAvatar
    });
    res.status(201).json({ success: true, article: newArticle });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/articles/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (isMongoDbConnected()) {
    try {
      const art = await MongoArticle.findOne({ id });
      if (art) {
        Object.assign(art, updates);
        art.updatedAt = new Date().toISOString();
        await art.save();
        return res.json({ success: true, article: art });
      } else {
        return res.status(404).json({ success: false, message: "Artículo no encontrado en la base de datos." });
      }
    } catch (err: any) {
      console.warn("[MongoDB] Falló actualización en Mongo, usando respaldo JSON:", err.message);
    }
  }

  try {
    const updatedArticle = Database.updateArticle(id, updates);
    res.json({ success: true, article: updatedArticle });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  if (isMongoDbConnected()) {
    try {
      const result = await MongoArticle.deleteOne({ id });
      if (result.deletedCount && result.deletedCount > 0) {
        // También limpiar comentarios localmente si existen
        Database.deleteCommentsForArticle(id);
        return res.json({ success: true, message: "Artículo eliminado exitosamente de MongoDB." });
      } else {
        return res.status(404).json({ success: false, message: "Artículo no encontrado en la base de datos." });
      }
    } catch (err: any) {
      console.warn("[MongoDB] Falló eliminación en Mongo, usando respaldo JSON:", err.message);
    }
  }

  const deleted = Database.deleteArticle(id);
  if (deleted) {
    res.json({ success: true, message: "Artículo eliminado exitosamente." });
  } else {
    res.status(404).json({ success: false, message: "Artículo no encontrado." });
  }
});


// Comments Endpoints
app.get("/api/articles/:id/comments", (req, res) => {
  const comments = Database.getCommentsForArticle(req.params.id);
  res.json({ success: true, comments });
});

app.post("/api/articles/:id/comments", (req, res) => {
  const { authorName, text, authorEmail } = req.body;
  if (!authorName || !text) {
    return res.status(400).json({ success: false, message: "Nombre de autor y comentario son requeridos." });
  }

  try {
    const newComment = Database.addComment(req.params.id, authorName, text, authorEmail);
    res.status(201).json({ success: true, comment: newComment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Site Settings Endpoints
app.get("/api/settings", (req, res) => {
  try {
    const settings = Database.getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/settings", (req, res) => {
  try {
    const updated = Database.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Feedback Endpoint (Lazy initialization of @google/genai)
app.post("/api/ai/suggest", async (req, res) => {
  const { title, subtitle, content } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Safeguard: mock professional advice if GEMINI_API_KEY is not set or has placeholder values
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("API_KEY")) {
    return res.json({
      success: true,
      outline: "Nota editorial (Consultor IA): El escrito posee una prosa de gran factura que evoca los cánones del periodismo de opinión pública tradicional. Los conceptos sobre soberanía nacional e inserción global se entrelazan de forma congruente. Se aconseja robustecer la argumentación agregando una comparación explícita sobre macrozonas e incluir estadísticas vigentes del Cono Sur.",
      suggestions: [
        "El resurgimiento institucional: Hacia un nuevo contrato social chileno",
        "Soberanía fragmentada y los retos soberanos del Chile moderno",
        "Poder descentralizado: Reestructuración de la gobernanza territorial"
      ]
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como un editor político sénior y estratega de asuntos públicos del diario premium "Columna Pública".
    Analiza el texto brindado a continuación y responde en formato JSON con dos propiedades obligatorias en español:
    1. "outline": Un comentario editorial sumamente elocuente, constructivo y sofisticado (de 2 a 3 párrafos cortos) aconsejando mejoras de tono, cohesión conceptual, sustento de datos y madurez institucional para pulir el texto.
    2. "suggestions": Un arreglo con 3 propuestas de títulos sugeridos alternativos de alto impacto periodístico y tono académico.

    Datos de la columna:
    - Título propuesto: "${title}"
    - Subtítulo propuesto: "${subtitle}"
    - Contenido de borrador: "${content.substring(0, 3000)}"

    Responde únicamente con un objeto JSON válido, sin delimitadores de código extra o marcas secundarias. Ejemplo de respuesta:
    {
      "outline": "Tu análisis aquí...",
      "suggestions": ["Título 1", "Título 2", "Título 3"]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanText);
      res.json({
        success: true,
        outline: parsed.outline,
        suggestions: parsed.suggestions
      });
    } catch {
      // Fallback
      res.json({
        success: true,
        outline: text || "Feedback generado exitosamente. Revisa el balance formal y geopolítico de tu redacción.",
        suggestions: [
          title + " (Edición Académica)",
          "El dilema estatutario: " + title,
          "Gobernanza y territorio en el cono sur"
        ]
      });
    }
  } catch (error) {
    console.error("[Gemini AI Request Error]", error);
    res.status(500).json({ success: false, message: "Error procesando el análisis inteligente." });
  }
});

// --- Vite Dev Server & Static Assets configuration ---

async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite] Middleware mounted in local development mode.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("[Vite] Production static server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`  COLUMNA PÚBLICA SERVER RUNNING AT http://localhost:${PORT}`);
    console.log(`  Super Admin Registered: admin@columnapublica.cl / admin123`);
    console.log(`  Authorizing Admin Registered: go.orellana.c@gmail.com / admin123`);
    console.log(`======================================================\n`);
  });
}

start();
