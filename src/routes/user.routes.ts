import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", UserController.getUsers);
userRouter.post("/", UserController.createUser);
userRouter.put("/:id", UserController.updateUser);
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;
