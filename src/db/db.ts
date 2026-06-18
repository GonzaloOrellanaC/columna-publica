import fs from "fs";
import path from "path";
import { DatabaseSchema, User, Article, Comment, SiteSettings } from "../types";
import { SEED_USERS, SEED_ARTICLES } from "./seed_data";

const DB_FILE = path.resolve("./database.json");

export function hashPassword(password: string): string {
  return Buffer.from(password + 'columna_salt_2026').toString('base64');
}

export class Database {
  public static data: DatabaseSchema = {
    users: [],
    articles: [],
    comments: [],
    settings: {
      siteName: "Columna Pública",
      siteSubtitle: "Asuntos Políticos, Macroeconomía e Inserción Global",
      enableComments: true,
      enableAIAdviser: true,
      enableRegistrations: true,
      enableShareButtons: true,
      heroLayout: 'editorial',
      alertBannerText: "Última Edición: Análisis estratégico de geopolítica regional y soberanía institucional chilenas."
    }
  };

  public static init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        Database.data = JSON.parse(fileContent);
        // Guarantee settings exist
        if (!Database.data.settings) {
          Database.data.settings = {
            siteName: "Columna Pública",
            siteSubtitle: "Asuntos Políticos, Macroeconomía e Inserción Global",
            enableComments: true,
            enableAIAdviser: true,
            enableRegistrations: true,
            enableShareButtons: true,
            heroLayout: 'editorial',
            alertBannerText: "Última Edición: Análisis estratégico de geopolítica regional y soberanía institucional chilenas."
          };
        }
      } else {
        console.log(`[Database] DB File not found. Creating default database...`);
        Database.persist();
      }

      Database.runSeed();

    } catch (e) {
      console.error("[Database] Error reading database, writing defaults:", e);
      Database.persist();
      Database.runSeed();
    }
  }

  public static runSeed() {
    let modified = false;

    if (!Database.data.users) Database.data.users = [];
    if (!Database.data.articles) Database.data.articles = [];
    if (!Database.data.comments) Database.data.comments = [];

    // Seed de usuarios
    for (const u of SEED_USERS) {
      const uExists = Database.data.users.some(
        existing => existing.id === u.id || existing.email.toLowerCase() === u.email.toLowerCase()
      );
      if (!uExists) {
        Database.data.users.push(u);
        modified = true;
        console.log(`[Database SEED] Se ha sembrado usuario: ${u.email}`);
      }
    }

    // Seed de artículos
    for (const art of SEED_ARTICLES) {
      const artExists = Database.data.articles.some(
        existing => existing.id === art.id || existing.title.toLowerCase() === art.title.toLowerCase()
      );
      if (!artExists) {
        Database.data.articles.push(art);
        modified = true;
        console.log(`[Database SEED] Se ha sembrado artículo: ${art.title}`);
      }
    }

    if (modified) {
      Database.persist();
    }
  }

  public static persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(Database.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[Database] Error writing database file:", e);
    }
  }

  // Operations
  public static createUser(email: string, passwordClear: string, name: string, role: string, bio: string = "", avatar: string = ""): User {
    const cleanEmail = email.toLowerCase();
    const existing = Database.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("El correo electrónico ya existe.");
    }
    const newUser: User = {
      id: "user-" + Math.random().toString(36).substring(2, 11),
      email: cleanEmail,
      passwordHash: hashPassword(passwordClear),
      name,
      role: role as any || "columnist",
      bio: bio || "",
      avatar: avatar || "/default-avatar.svg",
      isDemo: false,
      createdAt: new Date().toISOString()
    };
    Database.data.users.push(newUser);
    Database.persist();
    return newUser;
  }
}
