import { Router } from "express";
import { LogsController } from "../controllers/logs.controller";

const logsRouter = Router();

logsRouter.get("/", LogsController.listLogs);
logsRouter.get("/download/:filename", LogsController.downloadLog);
logsRouter.get("/view/:filename", LogsController.viewLogContent);
logsRouter.delete("/:filename", LogsController.deleteLog);

export default logsRouter;
