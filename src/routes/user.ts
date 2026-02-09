import { Router } from "express";
import { login } from "../controllers/user";

const userRouter = Router();

userRouter.post("/login", login);

export default userRouter;