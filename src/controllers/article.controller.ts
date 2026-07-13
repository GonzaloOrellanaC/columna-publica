import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";

export class ArticleController {
  static async getArticles(req: Request, res: Response) {
    const { includeDrafts, category, authorId } = req.query;
    try {
      const articles = await DatabaseService.getArticles({
        includeDrafts: includeDrafts === "true",
        category,
        authorId
      });
      return res.json({ success: true, articles });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getArticleById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const article = await DatabaseService.getArticleById(id, true);
      if (!article) {
        return res.status(404).json({ success: false, message: "Artículo no encontrado" });
      }
      return res.json({ success: true, article });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async createArticle(req: Request, res: Response) {
    const { title, subtitle, content, category, imageUrl, status, tags, authorId, authorName, authorAvatar } = req.body;
    
    if (!title || !content || !authorId) {
      return res.status(400).json({ success: false, message: "Título, contenido y autor id son obligatorios." });
    }

    try {
      const article = await DatabaseService.createArticle({
        title,
        subtitle,
        content,
        category,
        imageUrl,
        status,
        tags,
        authorId,
        authorName,
        authorAvatar
      });
      return res.status(201).json({ success: true, article });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async updateArticle(req: Request, res: Response) {
    const { id } = req.params;
    const { title, subtitle, content, category, imageUrl, status, tags } = req.body;

    try {
      const updated = await DatabaseService.updateArticle(id, {
        title,
        subtitle,
        content,
        category,
        imageUrl,
        status,
        tags
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: "Artículo no encontrado." });
      }
      return res.json({ success: true, article: updated });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async deleteArticle(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await DatabaseService.deleteArticle(id);
      if (!result) {
        return res.status(404).json({ success: false, message: "Artículo no encontrado." });
      }
      return res.json({ success: true, message: "Artículo eliminado con éxito." });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}
