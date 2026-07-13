import fs from "fs";
import path from "path";

// Check if we are running in a Node environment (server-side) to prevent browser bundler crashes
const isServer = typeof window === "undefined";

const logsDirectory = isServer ? path.resolve("./logs") : "";

// Ensure logging directory exists on the server side
if (isServer && !fs.existsSync(logsDirectory)) {
  try {
    fs.mkdirSync(logsDirectory, { recursive: true });
  } catch (err) {
    console.error("Failed to create logs directory:", err);
  }
}

function getFormattedDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFormattedTimestamp(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function writeLogToFile(level: string, message: string, context?: any) {
  if (!isServer) return;

  const timestamp = getFormattedTimestamp();
  const dailyFile = path.join(logsDirectory, `${getFormattedDate()}.log`);
  const combinedFile = path.join(logsDirectory, "combined.log");

  let logLine = `[${timestamp}] [${level}] ${message}`;
  if (context) {
    if (context instanceof Error) {
      logLine += ` - Error: ${context.message}\nStack: ${context.stack}`;
    } else {
      try {
        logLine += ` - Context: ${JSON.stringify(context)}`;
      } catch (e) {
        logLine += ` - Context: [Unserializable Object]`;
      }
    }
  }
  logLine += "\n";

  try {
    // Append to daily file
    fs.appendFileSync(dailyFile, logLine, "utf8");
    // Append to combined file
    fs.appendFileSync(combinedFile, logLine, "utf8");
  } catch (err) {
    console.error("Failed to write to log files:", err);
  }
}

export const logger = {
  info(message: string, context?: any) {
    const timestamp = getFormattedTimestamp();
    console.log(`\x1b[32m[${timestamp}] [INFO]\x1b[0m ${message}`, context !== undefined ? context : "");
    writeLogToFile("INFO", message, context);
  },

  warn(message: string, context?: any) {
    const timestamp = getFormattedTimestamp();
    console.warn(`\x1b[33m[${timestamp}] [WARN]\x1b[0m ${message}`, context !== undefined ? context : "");
    writeLogToFile("WARN", message, context);
  },

  error(message: string, context?: any) {
    const timestamp = getFormattedTimestamp();
    console.error(`\x1b[31m[${timestamp}] [ERROR]\x1b[0m ${message}`, context !== undefined ? context : "");
    writeLogToFile("ERROR", message, context);
  },

  debug(message: string, context?: any) {
    const timestamp = getFormattedTimestamp();
    console.debug(`\x1b[34m[${timestamp}] [DEBUG]\x1b[0m ${message}`, context !== undefined ? context : "");
    writeLogToFile("DEBUG", message, context);
  }
};
