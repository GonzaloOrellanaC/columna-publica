import fs from "fs";
import path from "path";
import cron from "node-cron";
import { logger } from "../utils/logger";
import { Database } from "../db/db";

const DB_FILE = path.resolve("./database.json");
const BACKUPS_DIR = path.resolve("./backups");

export class BackupService {
  /**
   * Inicializa el job programado para respaldar la base de datos a las 00:00 hrs diariamente.
   */
  public static initDailyBackupJob() {
    logger.info("[BackupService] Inicializando job programado para respaldo diario (Frecuencia: 00:00 hrs diariamente).");
    
    // Programar tarea para las 00:00 hrs todos los días (Cron: '0 0 * * *')
    cron.schedule("0 0 * * *", async () => {
      logger.info("[BackupService] Cron Trigger: Iniciando proceso automático de respaldo diario de la base de datos.");
      await BackupService.performBackup();
    });
  }

  /**
   * Realiza un respaldo atómico de la base de datos local en el directorio de backups.
   */
  public static async performBackup(): Promise<string | null> {
    try {
      // Asegurar que el directorio de respaldos exista
      if (!fs.existsSync(BACKUPS_DIR)) {
        await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });
        logger.info(`[BackupService] Creando directorio de respaldos en: ${BACKUPS_DIR}`);
      }

      // Obtener estampa de tiempo formateada (AÑO-MES-DIA_HORA-MINUTO)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const backupFilename = `database_backup_${dateStr}.json`;
      const backupPath = path.join(BACKUPS_DIR, backupFilename);

      if (fs.existsSync(DB_FILE)) {
        await fs.promises.copyFile(DB_FILE, backupPath);
        logger.info(`[BackupService] Respaldo de base de datos generado con éxito en: ${backupPath}`);
        return backupPath;
      } else {
        // Operación de respaldo de respaldo (fallback) escribiendo el estado en memoria
        const dbData = Database.data;
        await fs.promises.writeFile(backupPath, JSON.stringify(dbData, null, 2), "utf-8");
        logger.warn(`[BackupService] Archivo físico no encontrado en disco, se generó respaldo de respaldo utilizando el estado en memoria en: ${backupPath}`);
        return backupPath;
      }
    } catch (error: any) {
      logger.error("[BackupService] Error crítico durante la ejecución del respaldo de la base de datos:", error);
      return null;
    }
  }
}
