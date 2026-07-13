import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { logger } from "../utils/logger";

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await DatabaseService.getSettings();
      return res.json({ success: true, settings });
    } catch (e: any) {
      logger.error("Failed to load settings in portal backend", e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    const { siteName, siteSubtitle, enableComments, enableAIAdviser, enableRegistrations, enableShareButtons, heroLayout, alertBannerText, convictionText, quienesSomosTitle, quienesSomosDescription, quienesSomosPeople, editorialSlogan, facebookUrl, instagramUrl, whatsappUrl, mailContactUrl } = req.body;
    try {
      logger.info(`Administrador actualizó los ajustes del portal: siteName=${siteName}, heroLayout=${heroLayout}`);
      const updated = await DatabaseService.updateSettings({
        siteName,
        siteSubtitle,
        enableComments,
        enableAIAdviser,
        enableRegistrations,
        enableShareButtons,
        heroLayout,
        alertBannerText,
        convictionText,
        quienesSomosTitle,
        quienesSomosDescription,
        quienesSomosPeople,
        editorialSlogan,
        facebookUrl,
        instagramUrl,
        whatsappUrl,
        mailContactUrl
      });
      return res.json({ success: true, settings: updated });
    } catch (e: any) {
      logger.error("Error al actualizar la configuración general desde API settings", e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}
