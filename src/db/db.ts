import fs from "fs";
import path from "path";
import { DatabaseSchema, User, Article, Comment, SiteSettings } from "../types";
import { SEED_USERS, SEED_ARTICLES } from "./seed_data";
import { generateObjectId } from "../utils/id";

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
          };
        } else {
          if (!Database.data.settings.convictionText) {
            Database.data.settings.convictionText = "Sostenemos la firme convicción de que la deliberación informada, estructurada sobre los principios de soberanía institucional, macroeconomía científica y un riguroso análisis estratégico, conforma la verdadera columna de sostén para la estabilidad republicana en un orden multilateral multipolar.";
          }
          if (!Database.data.settings.quienesSomosTitle) {
            Database.data.settings.quienesSomosTitle = "¿Quiénes Somos?";
          }
          if (!Database.data.settings.quienesSomosDescription) {
            Database.data.settings.quienesSomosDescription = "Somos un foro deliberativo técnico-político y estratégico de alto estándar, dedicado al análisis independiente de las estructuras de poder global, la soberanía económica y la inserción internacional.";
          }
          if (!Database.data.settings.editorialSlogan) {
            Database.data.settings.editorialSlogan = "Un foro deliberativo técnico-político de alto estándar académico redactado por académicos, consejeros constitucionales y economistas.";
          }
          if (!Database.data.settings.facebookUrl) {
            Database.data.settings.facebookUrl = "https://www.facebook.com/profile.php?id=61576453450034";
          }
          if (!Database.data.settings.instagramUrl) {
            Database.data.settings.instagramUrl = "https://www.instagram.com/columnapublica/";
          }
          if (!Database.data.settings.whatsappUrl) {
            Database.data.settings.whatsappUrl = "https://whatsapp.com/channel/0029Vb5knn3KAwEg6aREeX1q";
          }
          if (!Database.data.settings.mailContactUrl) {
            Database.data.settings.mailContactUrl = "contacto@columnapublica.cl";
          }
          if (!Database.data.settings.quienesSomosPeople) {
            Database.data.settings.quienesSomosPeople = [
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
            ];
          }
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

    // Migrate any existing users with empty or unsplash avatars to /default-avatar.svg
    for (const u of Database.data.users) {
      if (!u.avatar || u.avatar.includes("unsplash.com")) {
        u.avatar = "/default-avatar.svg";
        modified = true;
      }
    }

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
      const existingArtIndex = Database.data.articles.findIndex(
        existing => existing.id === art.id || existing.title.toLowerCase() === art.title.toLowerCase()
      );
      if (existingArtIndex === -1) {
        Database.data.articles.push(art);
        modified = true;
        console.log(`[Database SEED] Se ha sembrado artículo: ${art.title}`);
      } else {
        // Enforce that tags of existing seed articles are updated/synced to reflect changes
        const existing = Database.data.articles[existingArtIndex];
        if (JSON.stringify(existing.tags) !== JSON.stringify(art.tags)) {
          existing.tags = art.tags;
          modified = true;
          console.log(`[Database SEED] Se han sincronizado etiquetas de artículo: ${art.title}`);
        }
      }
    }

    // Asegurar que todos los artículos de las publicaciones partan en cero lecturas de forma inicial
    for (const art of Database.data.articles) {
      if (art.views !== 0) {
        art.views = 0;
        modified = true;
      }
    }

    if (modified) {
      Database.persist();
    }
  }

  private static writeQueue: Promise<void> = Promise.resolve();
  private static hasScheduledWrite = false;

  public static persist() {
    if (Database.hasScheduledWrite) {
      return;
    }
    Database.hasScheduledWrite = true;

    // Debounce window to coalesce separate synchronous data changes into a single asynchronous lock-free filesystem write
    setTimeout(() => {
      Database.hasScheduledWrite = false;
      Database.writeQueue = Database.writeQueue
        .then(() => Database.writeAtomicAsync())
        .catch(err => {
          console.error("[Database] Error in asynchronous atomic database persistence:", err);
        });
    }, 20);
  }

  private static async writeAtomicAsync(): Promise<void> {
    const tempFile = DB_FILE + ".tmp";
    try {
      const jsonStr = JSON.stringify(Database.data, null, 2);
      await fs.promises.writeFile(tempFile, jsonStr, "utf-8");
      await fs.promises.rename(tempFile, DB_FILE);
    } catch (err) {
      console.error("[Database] Atomic async write failed, attempting standard async recovery write:", err);
      try {
        const jsonStr = JSON.stringify(Database.data, null, 2);
        await fs.promises.writeFile(DB_FILE, jsonStr, "utf-8");
      } catch (fallbackErr) {
        console.error("[Database] Critical: Both atomic and standard async database writes failed:", fallbackErr);
      }
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
      id: generateObjectId(),
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
