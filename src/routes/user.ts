import { Router } from "express";
import { register, login, getAllUsers, deleteUser } from "../controllers/user";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { injectCompanyId } from "../middleware/injectCompanyId";
import { UserRole } from "../types/roles";

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
userRouter.get("/", getAllUsers);
userRouter.post("/register", register);
userRouter.delete("/:id", deleteUser);

export default userRouter;
