import { Router } from "express";
import { register, login } from "../controllers/user";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { UserRole } from "../types/roles";

const userRouter = Router();

userRouter.post("/login", login);
userRouter.post(
  "/register",
  isAuth,
  isAuthorizedRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  register,
);

export default userRouter;
