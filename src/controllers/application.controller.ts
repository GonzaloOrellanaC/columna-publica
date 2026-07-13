import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { sendApplicationEmail } from "../utils/mailer";

export class ApplicationController {
  static async getApplications(req: Request, res: Response) {
    try {
      const cvs = await DatabaseService.getApplications();
      return res.json({ success: true, applications: cvs });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  static async createApplication(req: Request, res: Response) {
    const { name, email, degree, motivation, category, documentUrl } = req.body;
    if (!name || !email || !degree || !motivation) {
      return res.status(400).json({ success: false, message: "Nombre, Correo, Grado Académico/Profesión y Motivación son requeridos." });
    }

    try {
      const appRecord = await DatabaseService.createApplication({
        name,
        email: email.toLowerCase(),
        degree,
        motivation,
        category,
        documentUrl: documentUrl || ""
      });

      sendApplicationEmail({
        name: appRecord.name,
        email: appRecord.email,
        degree: appRecord.degree,
        motivation: appRecord.motivation,
        category: appRecord.category,
        documentUrl: appRecord.documentUrl
      }).catch(err => {
        console.error("[Email Notification Error] Falló el envío de correo de postulación:", err);
      });

      return res.status(201).json({ success: true, application: appRecord });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}
