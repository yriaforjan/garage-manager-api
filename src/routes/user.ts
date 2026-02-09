import { Router } from "express";
import { register, login } from "../controllers/user";
import { isAuth } from "../middleware/isAuth";

const userRouter = Router();

userRouter.post("/register", isAuth, register);
userRouter.post("/login", login);

export default userRouter;