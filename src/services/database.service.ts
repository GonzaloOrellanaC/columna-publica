import { Database } from "../db/db";
import { isMongoDbConnected, MongoUser, MongoArticle, MongoComment, MongoSettings, MongoApplication, MongoReaderVerification } from "../db/mongodb";
import { User, Article, Comment, SiteSettings, ColumnistApplication } from "../types";
import { generateObjectId } from "../utils/id";

export class DatabaseService {
  // Users Service Logic
  static async getUsers(): Promise<any[]> {
    if (isMongoDbConnected()) {
      try {
        const users = await MongoUser.find({});
        return users.map(u => ({
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
      } catch (err) {
        console.warn("[DatabaseService] Mongo getUsers error, falling back", err);
      }
    }
    return Database.data.users.map(u => ({
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
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoDbConnected()) {
      try {
        const user = await MongoUser.findOne({ email: cleanEmail });
        return user || null;
      } catch (err) {
        console.warn("[DatabaseService] Mongo getUserByEmail error, falling back", err);
      }
    }
    const user = Database.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    return user || null;
  }

  static async getUserByResetToken(token: string): Promise<any | null> {
    if (isMongoDbConnected()) {
      try {
        const user = await MongoUser.findOne({ resetToken: token });
        return user || null;
      } catch (err) {
        console.warn("[DatabaseService] Mongo getUserByResetToken error, falling back", err);
      }
    }
    const user = Database.data.users.find(u => u.resetToken === token);
    return user || null;
  }

  static async getUserById(id: string): Promise<any | null> {
    if (isMongoDbConnected()) {
      try {
        const user = await MongoUser.findOne({ id });
        return user || null;
      } catch (err) {
        console.warn("[DatabaseService] Mongo getUserById error, falling back", err);
      }
    }
    const user = Database.data.users.find(u => u.id === id);
    return user || null;
  }

  static async createUser(payload: {
    email: string;
    passwordHash: string;
    name: string;
    role: any;
    bio: string;
    avatar: string;
  }): Promise<any> {
    const cleanEmail = payload.email.toLowerCase().trim();
    if (isMongoDbConnected()) {
      const existingUser = await MongoUser.findOne({ email: cleanEmail });
      if (existingUser) {
        throw new Error("El correo electrónico ya se encuentra registrado.");
      }
      const newId = generateObjectId();
      const newUserDoc = new MongoUser({
        id: newId,
        email: cleanEmail,
        passwordHash: payload.passwordHash,
        name: payload.name,
        role: payload.role || "columnist",
        bio: payload.bio || "",
        avatar: payload.avatar || `/default-avatar.svg`,
        createdAt: new Date().toISOString()
      });
      await newUserDoc.save();
      return newUserDoc;
    }

    const exists = Database.data.users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error("El correo electrónico ya se encuentra registrado.");
    }
    const newId = generateObjectId();
    const newUser = {
      id: newId,
      email: cleanEmail,
      passwordHash: payload.passwordHash,
      name: payload.name,
      role: payload.role || "columnist",
      bio: payload.bio || "",
      avatar: payload.avatar || `/default-avatar.svg`,
      isDemo: false,
      createdAt: new Date().toISOString()
    };
    Database.data.users.push(newUser);
    Database.persist();
    return newUser;
  }

  static async updateUser(id: string, updates: any): Promise<any | null> {
    if (isMongoDbConnected()) {
      const user = await MongoUser.findOne({ id });
      if (!user) return null;
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.bio !== undefined) user.bio = updates.bio;
      if (updates.avatar !== undefined) user.avatar = updates.avatar;
      if (updates.role !== undefined) user.role = updates.role;
      if (updates.blocked !== undefined) user.blocked = updates.blocked;
      if (updates.passwordHash !== undefined) user.passwordHash = updates.passwordHash;
      if (updates.resetToken !== undefined) user.resetToken = updates.resetToken;
      if (updates.resetTokenExpires !== undefined) user.resetTokenExpires = updates.resetTokenExpires;
      await user.save();
      return user;
    }

    const user = Database.data.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.blocked !== undefined) user.blocked = updates.blocked;
    if (updates.passwordHash !== undefined) user.passwordHash = updates.passwordHash;
    if (updates.resetToken !== undefined) user.resetToken = updates.resetToken;
    if (updates.resetTokenExpires !== undefined) user.resetTokenExpires = updates.resetTokenExpires;
    Database.persist();
    return user;
  }

  static async deleteUser(id: string): Promise<boolean> {
    if (isMongoDbConnected()) {
      const result = await MongoUser.deleteOne({ id });
      return result.deletedCount !== 0;
    }

    const idx = Database.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    Database.data.users.splice(idx, 1);
    Database.persist();
    return true;
  }


  // Articles Service Logic
  static async getArticles(filters: {
    includeDrafts?: boolean;
    category?: any;
    authorId?: any;
  }): Promise<Article[]> {
    let list: any[] = [];
    if (isMongoDbConnected()) {
      try {
        const query: any = {};
        if (!filters.includeDrafts) {
          query.status = "published";
        }
        if (filters.category) {
          query.category = filters.category;
        }
        if (filters.authorId) {
          query.authorId = filters.authorId;
        }
        const docs = await MongoArticle.find(query).sort({ createdAt: -1 });
        list = docs.map(d => d.toObject());
      } catch (err) {
        console.warn("[DatabaseService] Mongo getArticles error, falling back", err);
        list = [];
      }
    }

    if (list.length === 0) {
      list = [...Database.data.articles];
      if (!filters.includeDrafts) {
        list = list.filter(a => a.status === "published");
      }
      if (filters.category) {
        list = list.filter(a => a.category === filters.category);
      }
      if (filters.authorId) {
        list = list.filter(a => a.authorId === filters.authorId);
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const resultList: Article[] = [];
    for (const art of list) {
      const artObj = { ...art };
      if (artObj.authorId) {
        const author = await this.getUserById(artObj.authorId);
        if (author) {
          artObj.authorName = author.name || artObj.authorName;
          artObj.authorAvatar = author.avatar || "/default-avatar.svg";
        } else {
          artObj.authorAvatar = artObj.authorAvatar || "/default-avatar.svg";
        }
      } else {
        artObj.authorAvatar = artObj.authorAvatar || "/default-avatar.svg";
      }
      resultList.push(artObj);
    }
    return resultList;
  }

  static async getArticleById(id: string, incrementViews = false): Promise<Article | null> {
    let artObj: any = null;
    if (isMongoDbConnected()) {
      try {
        const art = await MongoArticle.findOne({ id });
        if (art) {
          if (incrementViews) {
            art.views += 1;
            await art.save();
          }
          artObj = art.toObject();
        }
      } catch (err) {
        console.warn("[DatabaseService] Mongo getArticleById error, falling back", err);
      }
    }

    if (!artObj) {
      const art = Database.data.articles.find(a => a.id === id);
      if (art) {
        if (incrementViews) {
          art.views += 1;
          Database.persist();
        }
        artObj = { ...art };
      }
    }

    if (!artObj) return null;

    if (artObj.authorId) {
      const author = await this.getUserById(artObj.authorId);
      if (author) {
        artObj.authorName = author.name || artObj.authorName;
        artObj.authorAvatar = author.avatar || "/default-avatar.svg";
      } else {
        artObj.authorAvatar = artObj.authorAvatar || "/default-avatar.svg";
      }
    } else {
      artObj.authorAvatar = artObj.authorAvatar || "/default-avatar.svg";
    }

    return artObj;
  }

  static async createArticle(art: Partial<Article>): Promise<Article> {
    const newId = generateObjectId();
    const articleObj: Article = {
      id: newId,
      title: art.title || "",
      subtitle: art.subtitle || "",
      content: art.content || "",
      category: art.category || "General",
      imageUrl: art.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      status: art.status || "draft",
      tags: Array.isArray(art.tags) ? art.tags : [],
      authorId: art.authorId || "",
      authorName: art.authorName || "",
      authorAvatar: art.authorAvatar || "/default-avatar.svg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };

    if (isMongoDbConnected()) {
      const newDoc = new MongoArticle(articleObj as any);
      await newDoc.save();
      return newDoc;
    }

    Database.data.articles.push(articleObj);
    Database.persist();
    return articleObj;
  }

  static async updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
    if (isMongoDbConnected()) {
      const art = await MongoArticle.findOne({ id });
      if (!art) return null;
      if (updates.title !== undefined) art.title = updates.title;
      if (updates.subtitle !== undefined) art.subtitle = updates.subtitle;
      if (updates.content !== undefined) art.content = updates.content;
      if (updates.category !== undefined) art.category = updates.category;
      if (updates.imageUrl !== undefined) art.imageUrl = updates.imageUrl;
      if (updates.status !== undefined) art.status = updates.status;
      if (updates.tags !== undefined) art.tags = updates.tags;
      art.updatedAt = new Date().toISOString();
      await art.save();
      return art;
    }

    const art = Database.data.articles.find(a => a.id === id);
    if (!art) return null;
    if (updates.title !== undefined) art.title = updates.title;
    if (updates.subtitle !== undefined) art.subtitle = updates.subtitle;
    if (updates.content !== undefined) art.content = updates.content;
    if (updates.category !== undefined) art.category = updates.category;
    if (updates.imageUrl !== undefined) art.imageUrl = updates.imageUrl;
    if (updates.status !== undefined) art.status = updates.status;
    if (updates.tags !== undefined) art.tags = updates.tags;
    art.updatedAt = new Date().toISOString();
    Database.persist();
    return art;
  }

  static async deleteArticle(id: string): Promise<boolean> {
    if (isMongoDbConnected()) {
      const result = await MongoArticle.deleteOne({ id });
      return result.deletedCount !== 0;
    }

    const idx = Database.data.articles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    Database.data.articles.splice(idx, 1);
    Database.persist();
    return true;
  }


  // Comments Service Logic
  static async getComments(articleId: string): Promise<Comment[]> {
    if (isMongoDbConnected()) {
      try {
        const comments = await MongoComment.find({ articleId }).sort({ createdAt: -1 });
        return comments.map(c => ({
          id: c.id,
          articleId: c.articleId,
          authorName: c.authorName,
          authorEmail: c.authorEmail,
          content: c.content,
          createdAt: c.createdAt,
          parentId: c.parentId || undefined
        }));
      } catch (err) {
        console.warn("[DatabaseService] Mongo getComments error, falling back", err);
      }
    }
    const list = Database.data.comments.filter(c => c.articleId === articleId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  static async createComment(comment: Partial<Comment>): Promise<Comment> {
    const newId = generateObjectId();
    const commentObj: Comment = {
      id: newId,
      articleId: comment.articleId || "",
      authorName: comment.authorName || "",
      authorEmail: comment.authorEmail || "",
      content: comment.content || "",
      createdAt: new Date().toISOString(),
      parentId: comment.parentId || ""
    };

    if (isMongoDbConnected()) {
      const doc = new MongoComment(commentObj);
      await doc.save();
      return doc;
    }

    Database.data.comments.push(commentObj);
    Database.persist();
    return commentObj;
  }


  // Site Settings Service Logic
  static async getSettings(): Promise<SiteSettings> {
    if (isMongoDbConnected()) {
      try {
        const settings = await MongoSettings.findOne({ key: "site_settings" });
        if (settings) {
          return {
            siteName: settings.siteName,
            siteSubtitle: settings.siteSubtitle,
            enableComments: settings.enableComments,
            enableAIAdviser: settings.enableAIAdviser,
            enableRegistrations: settings.enableRegistrations,
            enableShareButtons: settings.enableShareButtons,
            heroLayout: settings.heroLayout as any,
            alertBannerText: settings.alertBannerText,
            convictionText: settings.convictionText,
            quienesSomosTitle: settings.quienesSomosTitle,
            quienesSomosDescription: settings.quienesSomosDescription,
            quienesSomosPeople: settings.quienesSomosPeople || [],
            editorialSlogan: settings.editorialSlogan,
            facebookUrl: settings.facebookUrl,
            instagramUrl: settings.instagramUrl,
            whatsappUrl: settings.whatsappUrl,
            mailContactUrl: settings.mailContactUrl
          };
        }
      } catch (err) {
        console.warn("[DatabaseService] Mongo getSettings error, falling back", err);
      }
    }
    return Database.data.settings;
  }

  static async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    if (isMongoDbConnected()) {
      try {
        const settings = await MongoSettings.findOne({ key: "site_settings" });
        if (settings) {
          if (updates.siteName !== undefined) settings.siteName = updates.siteName;
          if (updates.siteSubtitle !== undefined) settings.siteSubtitle = updates.siteSubtitle;
          if (updates.enableComments !== undefined) settings.enableComments = updates.enableComments;
          if (updates.enableAIAdviser !== undefined) settings.enableAIAdviser = updates.enableAIAdviser;
          if (updates.enableRegistrations !== undefined) settings.enableRegistrations = updates.enableRegistrations;
          if (updates.enableShareButtons !== undefined) settings.enableShareButtons = updates.enableShareButtons;
          if (updates.heroLayout !== undefined) settings.heroLayout = updates.heroLayout;
          if (updates.alertBannerText !== undefined) settings.alertBannerText = updates.alertBannerText;
          if (updates.convictionText !== undefined) settings.convictionText = updates.convictionText;
          if (updates.quienesSomosTitle !== undefined) settings.quienesSomosTitle = updates.quienesSomosTitle;
          if (updates.quienesSomosDescription !== undefined) settings.quienesSomosDescription = updates.quienesSomosDescription;
          if (updates.editorialSlogan !== undefined) settings.editorialSlogan = updates.editorialSlogan;
          if (updates.facebookUrl !== undefined) settings.facebookUrl = updates.facebookUrl;
          if (updates.instagramUrl !== undefined) settings.instagramUrl = updates.instagramUrl;
          if (updates.whatsappUrl !== undefined) settings.whatsappUrl = updates.whatsappUrl;
          if (updates.mailContactUrl !== undefined) settings.mailContactUrl = updates.mailContactUrl;
          if (updates.quienesSomosPeople !== undefined) {
            settings.quienesSomosPeople = updates.quienesSomosPeople;
            settings.markModified("quienesSomosPeople");
          }
          await settings.save();
          return {
            siteName: settings.siteName,
            siteSubtitle: settings.siteSubtitle,
            enableComments: settings.enableComments,
            enableAIAdviser: settings.enableAIAdviser,
            enableRegistrations: settings.enableRegistrations,
            enableShareButtons: settings.enableShareButtons,
            heroLayout: settings.heroLayout as any,
            alertBannerText: settings.alertBannerText,
            convictionText: settings.convictionText,
            quienesSomosTitle: settings.quienesSomosTitle,
            quienesSomosDescription: settings.quienesSomosDescription,
            quienesSomosPeople: settings.quienesSomosPeople,
            editorialSlogan: settings.editorialSlogan,
            facebookUrl: settings.facebookUrl,
            instagramUrl: settings.instagramUrl,
            whatsappUrl: settings.whatsappUrl,
            mailContactUrl: settings.mailContactUrl
          };
        }
      } catch (err) {
        console.warn("[DatabaseService] Mongo updateSettings error, falling back", err);
      }
    }

    const s = Database.data.settings;
    if (updates.siteName !== undefined) s.siteName = updates.siteName;
    if (updates.siteSubtitle !== undefined) s.siteSubtitle = updates.siteSubtitle;
    if (updates.enableComments !== undefined) s.enableComments = updates.enableComments;
    if (updates.enableAIAdviser !== undefined) s.enableAIAdviser = updates.enableAIAdviser;
    if (updates.enableRegistrations !== undefined) s.enableRegistrations = updates.enableRegistrations;
    if (updates.enableShareButtons !== undefined) s.enableShareButtons = updates.enableShareButtons;
    if (updates.heroLayout !== undefined) s.heroLayout = updates.heroLayout;
    if (updates.alertBannerText !== undefined) s.alertBannerText = updates.alertBannerText;
    if (updates.convictionText !== undefined) s.convictionText = updates.convictionText;
    if (updates.quienesSomosTitle !== undefined) s.quienesSomosTitle = updates.quienesSomosTitle;
    if (updates.quienesSomosDescription !== undefined) s.quienesSomosDescription = updates.quienesSomosDescription;
    if (updates.editorialSlogan !== undefined) s.editorialSlogan = updates.editorialSlogan;
    if (updates.facebookUrl !== undefined) s.facebookUrl = updates.facebookUrl;
    if (updates.instagramUrl !== undefined) s.instagramUrl = updates.instagramUrl;
    if (updates.whatsappUrl !== undefined) s.whatsappUrl = updates.whatsappUrl;
    if (updates.mailContactUrl !== undefined) s.mailContactUrl = updates.mailContactUrl;
    if (updates.quienesSomosPeople !== undefined) s.quienesSomosPeople = updates.quienesSomosPeople;
    Database.persist();
    return s;
  }


  // Columnist Applications Service Logic
  static async getApplications(): Promise<ColumnistApplication[]> {
    if (isMongoDbConnected()) {
      try {
        return await MongoApplication.find({}).sort({ createdAt: -1 });
      } catch (err) {
        console.warn("[DatabaseService] Mongo getApplications error, falling back", err);
      }
    }
    return [...(Database.data.applications || [])].reverse();
  }

  static async createApplication(app: Partial<ColumnistApplication>): Promise<ColumnistApplication> {
    const appObj: ColumnistApplication = {
      id: generateObjectId(),
      name: app.name || "",
      email: (app.email || "").toLowerCase(),
      degree: app.degree || "",
      motivation: app.motivation || "",
      category: app.category || "General",
      documentUrl: app.documentUrl || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    if (isMongoDbConnected()) {
      const doc = new MongoApplication(appObj);
      await doc.save();
      return doc;
    }

    if (!Database.data.applications) {
      Database.data.applications = [];
    }
    Database.data.applications.push(appObj);
    Database.persist();
    return appObj;
  }

  // Reader Verification Helpers
  static async saveReaderVerification(email: string, name: string, code: string, style: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoDbConnected()) {
      try {
        await MongoReaderVerification.deleteOne({ email: cleanEmail });
        await MongoReaderVerification.create({
          email: cleanEmail,
          name,
          code,
          verified: false,
          style,
          createdAt: new Date().toISOString()
        });
        return;
      } catch (err) {
        console.warn("[DatabaseService] Mongo saveReaderVerification error, falling back", err);
      }
    }

    if (!Database.data.readerVerifications) {
      Database.data.readerVerifications = [];
    }
    // Remove existing verification for same email
    Database.data.readerVerifications = Database.data.readerVerifications.filter(v => v.email !== cleanEmail);
    
    Database.data.readerVerifications.push({
      email: cleanEmail,
      name,
      code,
      verified: false,
      style,
      createdAt: new Date().toISOString()
    });
    Database.persist();
  }

  static async verifyReaderCode(email: string, code: string): Promise<{ success: boolean; name?: string; style?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoDbConnected()) {
      try {
        const found = await MongoReaderVerification.findOne({ email: cleanEmail, code: code.trim() });
        if (found) {
          found.verified = true;
          await found.save();
          return { success: true, name: found.name, style: found.style };
        }
        return { success: false };
      } catch (err) {
        console.warn("[DatabaseService] Mongo verifyReaderCode error, falling back", err);
      }
    }

    if (!Database.data.readerVerifications) {
      return { success: false };
    }
    const found = Database.data.readerVerifications.find(
      v => v.email === cleanEmail && v.code === code.trim()
    );
    if (found) {
      found.verified = true;
      Database.persist();
      return { success: true, name: found.name, style: found.style };
    }
    return { success: false };
  }

  static async isReaderVerified(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoDbConnected()) {
      try {
        const found = await MongoReaderVerification.findOne({ email: cleanEmail, verified: true });
        return !!found;
      } catch (err) {
        console.warn("[DatabaseService] Mongo isReaderVerified error, falling back", err);
      }
    }

    if (!Database.data.readerVerifications) {
      return false;
    }
    return Database.data.readerVerifications.some(v => v.email === cleanEmail && v.verified);
  }
}
