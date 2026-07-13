import { Router } from "express";
import { AIController } from "../controllers/ai.controller";

const aiRouter = Router();

aiRouter.post("/suggest", AIController.suggest);

export default aiRouter;
