import { Router } from "express";
import { SettingsController } from "../controllers/settings.controller";

const settingsRouter = Router();

settingsRouter.get("/", SettingsController.getSettings);
settingsRouter.put("/", SettingsController.updateSettings);

export default settingsRouter;
