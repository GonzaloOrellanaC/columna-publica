import 'dotenv/config';
import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { Database } from "./src/db/db";
import { connectMongoDB } from "./src/db/mongodb";
import { DatabaseService } from "./src/services/database.service";
import { BackupService } from "./src/services/backup.service";
import { slugify } from "./src/utils/slugify";
import { logger } from "./src/utils/logger";

// Import Modular routes
import uploadRouter from "./src/routes/upload.routes";
import authRouter from "./src/routes/auth.routes";
import userRouter from "./src/routes/user.routes";
import articleRouter from "./src/routes/article.routes";
import settingsRouter from "./src/routes/settings.routes";
import aiRouter from "./src/routes/ai.routes";
import applicationRouter from "./src/routes/application.routes";
import logsRouter from "./src/routes/logs.routes";


const isProd = process.env.NODE_ENV === "production";
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Trust reverse proxies to resolve correct protcol (https) and client IP addresses
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

// HTTP Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMsg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - IP: ${req.ip}`;
    if (res.statusCode >= 500) {
      logger.error(logMsg);
    } else if (res.statusCode >= 400) {
      logger.warn(logMsg);
    } else {
      logger.info(logMsg);
    }
  });
  next();
});

// Ensure dynamic uploads directory exists inside the public folder
const uploadsDir = path.resolve("./public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Initialize local database on startup
Database.init();
BackupService.initDailyBackupJob();

// Attempt connection to MongoDB if URI is present
connectMongoDB().catch(err => {
  logger.error("[MongoDB Setup Error] Fallback al sistema de archivos local de respaldo por error imprevisto.", err);
});

// Configure modular router mount points
app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/logs", logsRouter);

// Dynamic meta tags injection for social media previews (WhatsApp, Facebook, LinkedIn, Threads, X, Telegram, Instagram Stories)
async function injectDynamicMetadata(req: express.Request, html: string): Promise<string> {
  // Prioritize APP_URL from environment variables to avoid development environment / proxy URL leakages
  let baseUrl = process.env.APP_URL;
  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
  } else {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || req.headers.host || "columna-publica.com";
    baseUrl = `${protocol}://${host}`;
  }
  
  // Make sure the path doesn't result in double slashes if req.originalUrl starts with '/'
  const requestPath = req.originalUrl || req.url || "/";
  const normalizedPath = requestPath.startsWith("/") ? requestPath : `/${requestPath}`;
  const fullUrl = `${baseUrl}${normalizedPath}`;

  // Truncate text helper
  const truncate = (text: string, length: number): string => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (cleanText.length <= length) return cleanText;
    return cleanText.slice(0, length - 3) + "...";
  };

  const ensureAbsoluteUrl = (url: string, base: string): string => {
    if (!url) return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("/")) {
      return `${base}${url}`;
    }
    return `${base}/${url}`;
  };

  // Fetch general site settings
  let siteName = "Columna Pública";
  let siteSubtitle = "Asuntos Políticos, Macroeconomía e Inserción Global";
  let editorialSlogan = "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas.";
  const fallbackImage = "/logo.svg";

  try {
    const settings = await DatabaseService.getSettings();
    if (settings) {
      siteName = settings.siteName || siteName;
      siteSubtitle = settings.siteSubtitle || siteSubtitle;
      editorialSlogan = settings.editorialSlogan || editorialSlogan;
    }
  } catch (err) {
    console.warn("[Metadata Injection] Failed to load settings, using defaults", err);
  }

  let title = `${siteName} | ${siteSubtitle}`;
  let description = `"${editorialSlogan}"`;
  let imageUrl = ensureAbsoluteUrl(fallbackImage, baseUrl);

  const pathname = req.path;

  // Intercept detail route
  if (pathname.includes("/columna/")) {
    const parts = pathname.split("/columna/");
    const slug = parts[parts.length - 1];
    if (slug) {
      try {
        const articles = await DatabaseService.getArticles({ includeDrafts: false });
        const article = articles.find(art => slugify(art.title) === slug);
        if (article) {
          title = `${article.title} | ${siteName}`;
          description = truncate(article.subtitle || article.content, 155);
          imageUrl = ensureAbsoluteUrl(article.imageUrl, baseUrl);
        }
      } catch (err) {
        console.warn("[Metadata Injection] Error matching article slug", err);
      }
    }
  } else if (pathname.includes("/seccion/")) {
    const parts = pathname.split("/seccion/");
    const catSlug = parts[parts.length - 1];
    const categoryMap: Record<string, string> = {
      "analisis": "Análisis",
      "opinion": "Opinión",
      "soberania-global": "Soberanía Global",
      "geopolitica-economica": "Geopolítica Económica",
      "general": "General",
    };
    const catName = categoryMap[catSlug] || "Temas de Geopolítica";
    title = `Sección ${catName} | ${siteName}`;
    description = `Revise las últimas publicaciones, debates y columnas de opinión especializadas en ${catName} en el portal chileno ${siteName}.`;
    imageUrl = fallbackImage;
  } else if (pathname.includes("/columnistas")) {
    title = `Nuestro Consejo Editorial | ${siteName}`;
    description = `Conozca a los destacados columnistas, académicos y analistas que escriben y debaten diariamente en ${siteName}.`;
    imageUrl = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80";
  }

  // Pre-process title & description formatting to keep markup perfectly compliant
  const escapedTitle = title.replace(/"/g, "&quot;");
  const escapedDescription = description.replace(/"/g, "&quot;");

  // Wipe potential duplicates
  let cleanHtml = html.replace(/<title>[^<]*<\/title>/i, "");
  cleanHtml = cleanHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, "");
  cleanHtml = cleanHtml.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/gi, "");
  cleanHtml = cleanHtml.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/gi, "");

  let imageType = "image/jpeg";
  let imageWidth = "1200";
  let imageHeight = "630";

  if (imageUrl.toLowerCase().endsWith(".svg")) {
    imageType = "image/svg+xml";
    imageWidth = "500";
    imageHeight = "120";
  } else if (imageUrl.toLowerCase().endsWith(".png")) {
    imageType = "image/png";
    imageWidth = "1200";
    imageHeight = "630";
  }

  const metaBlock = `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />

    <!-- Open Graph / Facebook / WhatsApp / LinkedIn / Threads / Telegram / Instagram Stories -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:image:width" content="${imageWidth}" />
    <meta property="og:image:height" content="${imageHeight}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:locale" content="es_CL" />

    <!-- Twitter / X / Threads -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:url" content="${fullUrl}" />
  `;

  return cleanHtml.replace("<head>", `<head>${metaBlock}`);
}

// ======================== FRONTEND ASSETS ENGINE ========================
async function bootstrap() {
  if (isProd) {
    // Serve static assets from production dist
    app.use(express.static(path.resolve("./dist")));
    app.get("*", async (req, res, next) => {
      // Avoid intercepting static files like .js, .css, .png, etc.
      if (req.path.includes(".") && !req.path.endsWith(".html")) {
        return next();
      }
      try {
        const htmlPath = path.resolve("./dist/index.html");
        if (fs.existsSync(htmlPath)) {
          const rawHtml = fs.readFileSync(htmlPath, "utf-8");
          const enrichedHtml = await injectDynamicMetadata(req, rawHtml);
          return res.setHeader("Content-Type", "text/html").send(enrichedHtml);
        }
      } catch (err) {
        console.error("[Metadata Injection Error] fallback to static file", err);
      }
      res.sendFile(path.resolve("./dist/index.html"));
    });
  } else {
    // Mounting Vite middleware to serve hot assets on port 3000 during dev
    // Dynamically loading vite package only in development environment to prevent production load issues
    const { createServer: createViteServer } = await import("vite");
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
