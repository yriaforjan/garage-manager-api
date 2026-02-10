import { Router } from "express";
import { register, login } from "../controllers/user";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { UserRole } from "../types/roles";
import injectCompanyId from "../middleware/injectCompanyId";

const userRouter = Router();

// rutas publicas:
userRouter.post("/login", login);

// desde aqui auth, companyId disponible y roles de admin o super requeridos
userRouter.use(
  isAuth,
  injectCompanyId,
  isAuthorizedRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
);
// rutas protegidas:
userRouter.post("/register", register);

export default userRouter;
