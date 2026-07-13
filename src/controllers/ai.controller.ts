import { Request, Response } from "express";
import { AIService } from "../services/ai.service";

export class AIController {
  static async suggest(req: Request, res: Response) {
    const { draftTitle, draftContent, action } = req.body;
    if (!draftContent) {
      return res.status(400).json({ success: false, message: "Debe proveer el contenido del borrador para realizar análisis por Inteligencia Artificial." });
    }

    try {
      const advice = await AIService.generateAdvice(draftTitle, draftContent, action);
      return res.json({ success: true, advice });
    } catch (error: any) {
      console.error("[AIController Info/Error]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
