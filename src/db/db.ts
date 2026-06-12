import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Stored securely
  name: string;
  role: 'admin' | 'editor' | 'columnist';
  bio: string;
  avatar: string;
  createdAt: string;
  blocked?: boolean;
  isDemo?: boolean;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: 'Análisis' | 'Opinión' | 'Soberanía Global' | 'Geopolítica Económica' | 'General';
  imageUrl: string;
  status: 'draft' | 'review' | 'published';
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  enableComments: boolean;
  enableAIAdviser: boolean;
  enableRegistrations: boolean;
  enableShareButtons: boolean;
  heroLayout: 'classic' | 'dense' | 'editorial';
  alertBannerText: string;
}

interface DatabaseSchema {
  users: User[];
  articles: Article[];
  comments: Comment[];
  settings: SiteSettings;
}


const DB_FILE = path.join(process.cwd(), 'database.json');

// Initial raw articles representing the premium content of Columna Pública
const DEFAULT_ARTICLES: Article[] = [];

const DEFAULT_COMMENTS: Comment[] = [];

// Encrypt / Simulates password checking safely
function hashPassword(password: string): string {
  // A simple deterministic base64 signature simulation for strict consistency in our lightweight DB.
  return Buffer.from(password + 'columna_salt_2026').toString('base64');
}

export class Database {
  private static data: DatabaseSchema = {
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

  public static initialize() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        Database.data = JSON.parse(raw);
        console.log(`[Database] Loaded existing database from ${DB_FILE}`);
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
        console.log(`[Database] DB File not found. Creating a fresh default database...`);
        Database.data = {
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
        Database.persist();
      }

      // Execute intelligent seed instead of blind force-resets
      Database.runSeed();

    } catch (e) {
      console.error("[Database] Error reading database, writing defaults:", e);
      Database.data = {
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
      Database.runSeed();
    }
  }

  public static runSeed() {
    let modified = false;

    // Lista de usuarios semilla
    const seedUsers = [
      {
        id: "user-super-primary",
        email: "go.orellana.c@gmail.com",
        passwordHash: hashPassword("admin123"),
        name: "Super Administrador (Go Orellana)",
        role: "admin" as const,
        bio: "Director General y Super Administrator de Columna Pública. Responsable de la línea editorial y aprobación de columnas estratégicas.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        isDemo: false,
        createdAt: "2026-06-01T10:00:00Z"
      },
      {
        id: "user-super-secondary",
        email: "admin@columnapublica.cl",
        passwordHash: hashPassword("admin123"),
        name: "Super Administrador",
        role: "admin" as const,
        bio: "Director Editorial y Super Administrador General de Columna Pública.",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
        isDemo: false,
        createdAt: "2026-06-01T10:00:00Z"
      },
      {
        id: "user-editor-demo",
        email: "editor@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Editor General (Aprobación)",
        role: "editor" as const,
        bio: "Editor y Moderador de Columna Pública. Responsable de la revisión y visto bueno de columnas.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: "2026-06-01T10:00:00Z"
      },
      {
        id: "user-marachia",
        email: "marachia@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Marachia Elolario",
        role: "columnist" as const,
        bio: "Catedrática de Derecho Constitucional, investigadora en políticas públicas y gobernanza global.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: "2026-05-01T10:00:00Z"
      },
      {
        id: "user-cauvia",
        email: "cauvia@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Cauvia Naman",
        role: "columnist" as const,
        bio: "Analista Geopolítico y ex consejero constitucional. Especialista en geopolítica de América Latina y políticas de estado.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: "2026-05-02T10:00:00Z"
      },
      {
        id: "user-aaron",
        email: "aaron@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Aarón Garamo",
        role: "columnist" as const,
        bio: "Doctor en Economía del Comportamiento Público, especialista en macroeconomía regional e institucionalidad.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: "2026-05-03T10:00:00Z"
      }
    ];

    // Lista de artículos semilla
    const seedArticles = [
      {
        id: "art-soberania-1",
        title: "Soberanía Energética en el Cono Sur: Desafíos de la Integración Regional",
        subtitle: "La transición ecológica como eje de la autonomía política sudamericana ante presiones externas.",
        content: "La soberanía energética representa el pilar fundamental sobre el cual se erige la autonomía de las naciones del Cono Sur. Ante las oscilaciones de los mercados globales de hidrocarburos y la creciente presión de consorcios internacionales, la articulación de una matriz integrada y sustentable emerge no solo como un imperativo económico, sino como un requisito de supervivencia soberana. \n\nHistóricamente, la dependencia de fuentes externas de energía ha condicionado las decisiones de política exterior de nuestros estados. Hoy, la transición hacia energías renovables ofrece una oportunidad histórica inédita. Al aprovechar la radiación solar del desierto de Atacama, los vientos de la Patagonia y los vastos recursos hídricos comunes, la región no solo puede mitigar el impacto ambiental, sino consolidar un bloque geopolítico autosuficiente. \n\nNo obstante, este proceso enfrenta obstáculos significativos. La falta de infraestructura de interconexión transfronteriza y la asimetría en los marcos regulatorios nacionales dilatan los esfuerzos de integración. Para que la transición sea soberana, debe ser planificada desde y para la región, evitando caer en nuevas formas de extractivismo o subordinación tecnológica ante hegemonías globales que ven en nuestros recursos naturales simples insumos para su propio desarrollo.",
        category: "Soberanía Global" as const,
        imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
        status: "published" as const,
        tags: ["Soberanía", "Energía", "Cono Sur", "Integración"],
        authorId: "user-marachia",
        authorName: "Marachia Elolario",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        createdAt: "2026-06-09T10:00:00Z",
        updatedAt: "2026-06-09T10:00:00Z",
        views: 142
      },
      {
        id: "art-economia-1",
        title: "Desglobalización y Reglas Multilaterales: El Nuevo Rol de las Divisas de Reserva",
        subtitle: "El reordenamiento financiero global impulsa monedas alternativas frente al dólar hegemónico.",
        content: "El sistema financiero global se encuentra en el umbral de una profunda reconfiguración estructural. Tras décadas de hegemonía indiscutible del dólar estadounidense como divisa de reserva y medio de cambio universal, el fenómeno contemporáneo de la desglobalización y el auge del 'nearshoring' han acelerado la búsqueda de alternativas bilaterales de liquidación de deuda. \n\nEl uso del dinero como instrumento de sanción geopolítica ha alertado a diversas economías emergentes sobre los riesgos de una excesiva centralización. En respuesta, bloques estratégicos como los BRICS han intensificado esfuerzos para diversificar sus reservas, proviniendo el uso de monedas locales y explorando plataformas digitales de compensación soberanas. \n\nEsta fragmentación monetaria no implica una desaparición inmediata del dólar, sino el tránsito hacia un orden financiero multipolar. Para las economías latinoamericanas, expuestas crónicamente a la volatilidad del tipo de cambio, este escenario plantea dilemas cruciales: ¿cómo mantener la estabilidad macroeconómica en un mundo de bloques comerciales fragmentados y qué margen de maniobra conserva la banca central frente a las tasas de interés internacionales?",
        category: "Geopolítica Económica" as const,
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
        status: "published" as const,
        tags: ["Economía", "Multipolaridad", "Finanzas", "Desglobalización"],
        authorId: "user-aaron",
        authorName: "Aarón Garamo",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        createdAt: "2026-06-05T10:00:00Z",
        updatedAt: "2026-06-05T10:00:00Z",
        views: 289
      },
      {
        id: "art-opinion-1",
        title: "Gobernanza Digital vs. Instituciones Democráticas Tradicionales",
        subtitle: "El dilema de la soberanía de los datos frente a la influencia extraterritorial de las corporaciones tecnológicas.",
        content: "La soberanía clásica, ligada inexorablemente al territorio físico e institucionalizado del Estado-nación, se desvanece de manera sigilosa en los ecosistemas de la gobernanza digital contemporánea. Las dinámicas de procesamiento algorítmico, concentración de datos y flujos de información transfronteriza están redefiniendo quién ostenta el poder real de regular el discurso público y moldear las preferencias sociales.\n\nHoy en día, las grandes corporaciones de tecnología operan con recursos y esferas de influencia que eclipsan a la de múltiples estados soberanos. La extracción de datos personales, convertida en el núcleo del capitalismo de vigilancia, no solo mercantiliza el comportamiento humano, sino que desafía directamente la capacidad reguladora de los congresos nacionales. Si un algoritmo de recomendación extranjero puede alterar el clima de opinión pública sin supervisión de las autoridades locales, la autodeterminación democrática se convierte en una simple ilusión de carácter formal.\n\nRecuperar la soberanía en la era digital no pasa por el proteccionismo ingenuo, sino por la formulación de una infraestructura digital soberana, la creación de nubes de datos públicas y marcos de gobernanza transnacionales capaces de someter a los gigantes tecnológicos a estándares de transparencia democrática. Sin soberanía de datos, no hay soberanía política posible.",
        category: "Soberanía Global" as const,
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
        status: "review" as const,
        tags: ["Tecnología", "Gobernanza", "Estado", "Soberanía Digital"],
        authorId: "user-cauvia",
        authorName: "Cauvia Naman",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        createdAt: "2026-06-11T10:00:00Z",
        updatedAt: "2026-06-11T10:00:00Z",
        views: 54
      }
    ];

    // Seed de usuarios: si ya existe el id o el email, se conserva sin editar se ni crearse de nuevo
    for (const u of seedUsers) {
      if (!Database.data.users) {
        Database.data.users = [];
      }
      const uExists = Database.data.users.some(
        existing => existing.id === u.id || existing.email.toLowerCase() === u.email.toLowerCase()
      );
      if (!uExists) {
        Database.data.users.push(u);
        modified = true;
        console.log(`[Database SEED] Se ha sembrado un nuevo usuario: ${u.email}`);
      }
    }

    // Seed de artículos: si ya existe el id o el title, se conserva sin editar se ni crearse de nuevo
    for (const art of seedArticles) {
      if (!Database.data.articles) {
        Database.data.articles = [];
      }
      const artExists = Database.data.articles.some(
        existing => existing.id === art.id || existing.title.toLowerCase() === art.title.toLowerCase()
      );
      if (!artExists) {
        Database.data.articles.push(art);
        modified = true;
        console.log(`[Database SEED] Se ha sembrado un nuevo artículo: ${art.title}`);
      }
    }

    if (modified) {
      Database.persist();
    }
  }

  // Site Settings operations
  public static getSettings(): SiteSettings {
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
    return Database.data.settings;
  }

  public static updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    const current = Database.getSettings();
    const updated = { ...current, ...updates };
    Database.data.settings = updated;
    Database.persist();
    return updated;
  }

  private static persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(Database.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("[Database] Error persisting state to file:", e);
    }
  }

  // --- API Methods ---
  
  // Users
  public static getUsers(): User[] {
    return Database.data.users;
  }

  public static getUserById(id: string): User | undefined {
    return Database.data.users.find(u => u.id === id);
  }

  public static getUserByEmail(email: string): User | undefined {
    return Database.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public static verifyCredentials(email: string, password: string): User | null {
    const user = Database.getUserByEmail(email);
    if (!user) return null;
    const incomingHash = hashPassword(password);
    return user.passwordHash === incomingHash ? user : null;
  }

  public static createUser(email: string, passwordPlain: string, name: string, role: 'admin' | 'editor' | 'columnist', bio = '', avatar = ''): User {
    const existingUser = Database.getUserByEmail(email);
    if (existingUser) {
      throw new Error("El correo electrónico ya se encuentra registrado.");
    }

    const newUser: User = {
      id: "user-" + Math.random().toString(36).substring(2, 11),
      email,
      passwordHash: hashPassword(passwordPlain),
      name,
      role,
      bio,
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
      createdAt: new Date().toISOString()
    };

    Database.data.users.push(newUser);
    Database.persist();
    return newUser;
  }

  public static updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'role'>>): User {
    const user = Database.getUserById(userId);
    if (!user) throw new Error("Usuario no encontrado.");
    
    Object.assign(user, updates);
    Database.persist();
    return user;
  }

  public static updateUser(userId: string, updates: Partial<User>): User {
    const user = Database.getUserById(userId);
    if (!user) throw new Error("Usuario no encontrado.");
    
    Object.assign(user, updates);
    Database.persist();
    return user;
  }

  public static deleteUser(userId: string): boolean {
    const lengthBefore = Database.data.users.length;
    Database.data.users = Database.data.users.filter(u => u.id !== userId);
    Database.persist();
    return Database.data.users.length < lengthBefore;
  }

  // Articles
  public static getArticles(includeDrafts = false, authorId?: string): Article[] {
    let filtered = Database.data.articles;
    if (!includeDrafts) {
      filtered = filtered.filter(a => a.status === 'published');
    }
    if (authorId) {
      filtered = filtered.filter(a => a.authorId === authorId);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getArticleById(id: string): Article | undefined {
    const art = Database.data.articles.find(a => a.id === id);
    if (art) {
      art.views += 1;
      Database.persist();
    }
    return art;
  }

  public static createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Article {
    const newArt: Article = {
      ...articleData,
      id: "art-" + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };

    Database.data.articles.push(newArt);
    Database.persist();
    return newArt;
  }

  public static updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'createdAt' | 'views'>>): Article {
    const index = Database.data.articles.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error("Artículo no encontrado.");
    }

    const matched = Database.data.articles[index];
    const updated = {
      ...matched,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    Database.data.articles[index] = updated;
    Database.persist();
    return updated;
  }

  public static deleteArticle(id: string): boolean {
    const lengthBefore = Database.data.articles.length;
    Database.data.articles = Database.data.articles.filter(a => a.id !== id);
    // Also delete associated comments
    Database.data.comments = Database.data.comments.filter(c => c.articleId !== id);
    
    Database.persist();
    return Database.data.articles.length < lengthBefore;
  }

  // Comments
  public static getCommentsForArticle(articleId: string): Comment[] {
    return Database.data.comments
      .filter(c => c.articleId === articleId)
      .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public static deleteCommentsForArticle(articleId: string): void {
    Database.data.comments = Database.data.comments.filter(c => c.articleId !== articleId);
    Database.persist();
  }

  public static addComment(articleId: string, authorName: string, text: string, authorEmail?: string): Comment {
    const newComm: Comment = {
      id: "comm-" + Math.random().toString(36).substring(2, 11),
      articleId,
      authorName,
      authorEmail,
      text,
      createdAt: new Date().toISOString()
    };
    Database.data.comments.push(newComm);
    Database.persist();
    return newComm;
  }
}
