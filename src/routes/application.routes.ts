import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";

const applicationRouter = Router();

applicationRouter.get("/", ApplicationController.getApplications);
applicationRouter.post("/", ApplicationController.createApplication);

export default applicationRouter;
