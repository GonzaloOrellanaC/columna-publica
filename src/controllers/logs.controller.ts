import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const logsDirectory = path.resolve("./logs");

export class LogsController {
  // GET /api/logs - List all available logs
  static async listLogs(req: Request, res: Response) {
    try {
      if (!fs.existsSync(logsDirectory)) {
        return res.json({ success: true, logs: [] });
      }

      const files = fs.readdirSync(logsDirectory);
      const logFiles = files
        .filter(file => file.endsWith(".log"))
        .map(file => {
          const filePath = path.join(logsDirectory, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size, // in bytes
            modifiedAt: stats.mtime
          };
        })
        // Sort newest first
        .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

      return res.json({ success: true, logs: logFiles });
    } catch (e: any) {
      logger.error("Error listed log files:", e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // GET /api/logs/download/:filename - Download log file
  static async downloadLog(req: Request, res: Response) {
    const { filename } = req.params;

    // Safety: prevent directory traversal or reading files outside logs
    if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      logger.warn(`Intento de descarga de log inseguro: ${filename}`);
      return res.status(400).json({ success: false, message: "Nombre de archivo inválido." });
    }

    const filePath = path.join(logsDirectory, filename);

    if (!fs.existsSync(filePath)) {
      logger.warn(`Intento de descarga de log inexistente: ${filename}`);
      return res.status(404).json({ success: false, message: "Archivo de registro no encontrado." });
    }

    try {
      logger.info(`Descargando archivo de log: ${filename}`);
      res.download(filePath, filename);
    } catch (e: any) {
      logger.error(`Error al descargar el log ${filename}:`, e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // GET /api/logs/view/:filename - Fetch log file contents (e.g. for previewing in terminal)
  static async viewLogContent(req: Request, res: Response) {
    const { filename } = req.params;
    const limitLines = req.query.limit ? parseInt(req.query.limit as string) : 500;

    if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      return res.status(400).json({ success: false, message: "Nombre de archivo inválido." });
    }

    const filePath = path.join(logsDirectory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Archivo de registro no encontrado." });
    }

    try {
      const rawText = fs.readFileSync(filePath, "utf8");
      const lines = rawText.split("\n");
      // Get the last N lines
      const trailingLines = lines.slice(-limitLines).join("\n");

      return res.json({
        success: true,
        filename,
        linesCount: lines.length,
        content: trailingLines
      });
    } catch (e: any) {
      logger.error(`Error leyendo el contenido del log ${filename}:`, e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // DELETE /api/logs/:filename - Delete log file
  static async deleteLog(req: Request, res: Response) {
    const { filename } = req.params;

    if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      return res.status(400).json({ success: false, message: "Nombre de archivo inválido." });
    }

    const filePath = path.join(logsDirectory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Archivo de registro no encontrado." });
    }

    try {
      logger.warn(`Eliminando archivo de log: ${filename} por petición del administrador.`);
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: `Archivo de log '${filename}' eliminado.` });
    } catch (e: any) {
      logger.error(`Error al eliminar el log ${filename}:`, e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}
