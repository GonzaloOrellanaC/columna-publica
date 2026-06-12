import mongoose, { Schema } from 'mongoose';

// Función para encriptar / simular contraseña de forma segura (idéntico a db.ts)
function hashPassword(password: string): string {
  return Buffer.from(password + 'columna_salt_2026').toString('base64');
}

// Definición del esquema de Mongoose para los Usuarios
const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'editor', 'columnist'], 
    default: 'columnist' 
  },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  blocked: { type: Boolean, default: false },
  isDemo: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// Definición del esquema de Mongoose para las publicaciones (artículos)
const ArticleSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Análisis', 'Opinión', 'Soberanía Global', 'Geopolítica Económica', 'General'], 
    default: "General" 
  },
  imageUrl: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['draft', 'review', 'published'], 
    default: "draft" 
  },
  tags: { type: [String], default: [] },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: "" },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  views: { type: Number, default: 0 }
});

// Opción de salida limpia para transformar _id y __v
ArticleSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const MongoArticle = mongoose.model('Article', ArticleSchema);
export const MongoUser = mongoose.model('User', UserSchema);

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) return true;
  
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/columna_publica";
  console.log(`[MongoDB/Mongoose] Intentando conectar a la base de datos en: ${uri}`);
  
  try {
    // Timeout breve de selección de servidor para que se determine rápido si hay servidor Mongo activo
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB/Mongoose] Conectado exitosamente a MongoDB.`);
    
    // Intelligent seeding for Users
    const seedUsers = [
      {
        id: "user-super-primary",
        email: "go.orellana.c@gmail.com",
        passwordHash: hashPassword("admin123"),
        name: "Super Administrador (Go Orellana)",
        role: "admin",
        bio: "Director General y Super Administrator de Columna Pública. Responsable de la línea editorial y aprobación de columnas estratégicas.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        isDemo: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "user-super-secondary",
        email: "admin@columnapublica.cl",
        passwordHash: hashPassword("admin123"),
        name: "Super Administrador",
        role: "admin",
        bio: "Director Editorial y Super Administrador General de Columna Pública.",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
        isDemo: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "user-editor-demo",
        email: "editor@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Editor General (Aprobación)",
        role: "editor",
        bio: "Editor y Moderador de Columna Pública. Responsable de la revisión y visto bueno de columnas.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "user-marachia",
        email: "marachia@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Marachia Elolario",
        role: "columnist",
        bio: "Catedrática de Derecho Constitucional, investigadora en políticas públicas y gobernanza global.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "user-cauvia",
        email: "cauvia@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Cauvia Naman",
        role: "columnist",
        bio: "Analista Geopolítico y ex consejero constitucional. Especialista en geopolítica de América Latina y políticas de estado.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "user-aaron",
        email: "aaron@columnapublica.cl",
        passwordHash: hashPassword("columna123"),
        name: "Aarón Garamo",
        role: "columnist",
        bio: "Doctor en Economía del Comportamiento Público, especialista en macroeconomía regional e institucionalidad.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        isDemo: true,
        createdAt: new Date().toISOString()
      }
    ];

    for (const u of seedUsers) {
      const uExists = await MongoUser.findOne({
        $or: [{ id: u.id }, { email: u.email.toLowerCase() }]
      });
      if (!uExists) {
        await MongoUser.create(u as any);
        console.log(`[MongoDB/Mongoose SEED] Usuario creado: ${u.email}`);
      } else {
        console.log(`[MongoDB/Mongoose SEED] Usuario ya se encuentra en BBDD (sin crear ni editar): ${u.email}`);
      }
    }

    // Intelligent seeding for Articles
    const seedArticles = [
      {
        id: "art-soberania-1",
        title: "Soberanía Energética en el Cono Sur: Desafíos de la Integración Regional",
        subtitle: "La transición ecológica como eje de la autonomía política sudamericana ante presiones externas.",
        content: "La soberanía energética representa el pilar fundamental sobre el cual se erige la autonomía de las naciones del Cono Sur. Ante las oscilaciones de los mercados globales de hidrocarburos y la creciente presión de consorcios internacionales, la articulación de una matriz integrada y sustentable emerge no solo como un imperativo económico, sino como un requisito de supervivencia soberana. \n\nHistóricamente, la dependencia de fuentes externas de energía ha condicionado las decisiones de política exterior de nuestros estados. Hoy, la transición hacia energías renovables ofrece una oportunidad histórica inédita. Al aprovechar la radiación solar del desierto de Atacama, los vientos de la Patagonia y los vastos recursos hídricos comunes, la región no solo puede mitigar el impacto ambiental, sino consolidar un bloque geopolítico autosuficiente. \n\nNo obstante, este proceso enfrenta obstáculos significativos. La falta de infraestructura de interconexión transfronteriza y la asimetría en los marcos regulatorios nacionales dilatan los esfuerzos de integración. Para que la transición sea soberana, debe ser planificada desde y para la región, evitando caer en nuevas formas de extractivismo o subordinación tecnológica ante hegemonías globales que ven en nuestros recursos naturales simples insumos para su propio desarrollo.",
        category: "Soberanía Global",
        imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
        status: "published",
        tags: ["Soberanía", "Energía", "Cono Sur", "Integración"],
        authorId: "user-marachia",
        authorName: "Marachia Elolario",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(),
        views: 142
      },
      {
        id: "art-economia-1",
        title: "Desglobalización y Reglas Multilaterales: El Nuevo Rol de las Divisas de Reserva",
        subtitle: "El reordenamiento financiero global impulsa monedas alternativas frente al dólar hegemónico.",
        content: "El sistema financiero global se encuentra en el umbral de una profunda reconfiguración estructural. Tras décadas de hegemonía indiscutible del dólar estadounidense como divisa de reserva y medio de cambio universal, el fenómeno contemporáneo de la desglobalización y el auge del 'nearshoring' han acelerado la búsqueda de alternativas bilaterales de liquidación de deuda. \n\nEl uso del dinero como instrumento de sanción geopolítica ha alertado a diversas economías emergentes sobre los riesgos de una excesiva centralización. En respuesta, bloques estratégicos como los BRICS han intensificado esfuerzos para diversificar sus reservas, promoviendo el uso de monedas locales y explorando plataformas digitales de compensación soberanas. \n\nEsta fragmentación monetaria no implica una desaparición inmediata del dólar, sino el tránsito hacia un orden financiero multipolar. Para las economías latinoamericanas, expuestas crónicamente a la volatilidad del tipo de cambio, este escenario plantea dilemas cruciales: ¿cómo mantener la estabilidad macroeconómica en un mundo de bloques comerciales fragmentados y qué margen de maniobra conserva la banca central frente a las tasas de interés internacionales?",
        category: "Geopolítica Económica",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
        status: "published",
        tags: ["Economía", "Multipolaridad", "Finanzas", "Desglobalización"],
        authorId: "user-aaron",
        authorName: "Aarón Garamo",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000 * 7).toISOString(),
        views: 289
      },
      {
        id: "art-opinion-1",
        title: "Gobernanza Digital vs. Instituciones Democráticas Tradicionales",
        subtitle: "El dilema de la soberanía de los datos frente a la influencia extraterritorial de las corporaciones tecnológicas.",
        content: "La soberanía clásica, ligada inexorablemente al territorio físico e institucionalizado del Estado-nación, se desvanece de manera sigilosa en los ecosistemas de la gobernanza digital contemporánea. Las dinámicas de procesamiento algorítmico, concentración de datos y flujos de información transfronteriza están redefiniendo quién ostenta el poder real de regular el discurso público y moldear las preferencias sociales.\n\nHoy en día, las grandes corporaciones de tecnología operan con recursos y esferas de influencia que eclipsan a la de múltiples estados soberanos. La extracción de datos personales, convertida en el núcleo del capitalismo de vigilancia, no solo mercantiliza el comportamiento humano, sino que desafía directamente la capacidad reguladora de los congresos nacionales. Si un algoritmo de recomendación extranjero puede alterar el clima de opinión pública sin supervisión de las autoridades locales, la autodeterminación democrática se convierte en una simple ilusión de carácter formal.\n\nRecuperar la soberanía en la era digital no pasa por el proteccionismo ingenuo, sino por la formulación de una infraestructura digital soberana, la creación de nubes de datos públicas y marcos de gobernanza transnacionales capaces de someter a los gigantes tecnológicos a estándares de transparencia democrática. Sin soberanía de datos, no hay soberanía política posible.",
        category: "Soberanía Global",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
        status: "review",
        tags: ["Tecnología", "Gobernanza", "Estado", "Soberanía Digital"],
        authorId: "user-cauvia",
        authorName: "Cauvia Naman",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000 * 1).toISOString(),
        views: 54
      }
    ];

    for (const art of seedArticles) {
      const artExists = await MongoArticle.findOne({
        $or: [{ id: art.id }, { title: art.title }]
      });
      if (!artExists) {
        await MongoArticle.create(art as any);
        console.log(`[MongoDB/Mongoose SEED] Artículo creado: ${art.title}`);
      } else {
        console.log(`[MongoDB/Mongoose SEED] Artículo ya se encuentra en BBDD (sin crear ni editar): ${art.title}`);
      }
    }

    return true;
  } catch (err: any) {
    console.error(`[MongoDB/Mongoose] No se pudo establecer la conexión a MongoDB. Se usará el sistema de persistencia en archivo JSON por defecto. Detalle: ${err.message}`);
    isConnected = false;
    return false;
  }
}

export function isMongoDbConnected() {
  return isConnected;
}
