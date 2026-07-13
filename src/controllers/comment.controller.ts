import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";

export class CommentController {
  static async getComments(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const comments = await DatabaseService.getComments(id);
      return res.json({ success: true, comments });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async createComment(req: Request, res: Response) {
    const { id } = req.params;
    const { authorName, authorEmail, content, parentId } = req.body;

    if (!authorName || !authorEmail || !content) {
      return res.status(400).json({ success: false, message: "Todos los campos del comentario son obligatorios." });
    }

    try {
      const cleanEmail = authorEmail.toLowerCase().trim();
      
      // 1. Check if it's a CMS User
      const isCMSUser = await DatabaseService.getUserByEmail(cleanEmail);
      
      // 2. Check if it's a vetted verified reader
      const isVerifiedReader = await DatabaseService.isReaderVerified(cleanEmail);

      if (!isCMSUser && !isVerifiedReader) {
        return res.status(403).json({
          success: false,
          needsVerification: true,
          message: "Para comentar o participar del debate, su correo electrónico debe estar verificado. Por favor inscríbase como lector y confirme su código de verificación."
        });
      }

      const comment = await DatabaseService.createComment({
        articleId: id,
        authorName,
        authorEmail: cleanEmail,
        content,
        parentId: parentId || undefined
      });
      return res.status(201).json({ success: true, comment });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}
