import { Router } from "express";
import { createCompany } from "../controllers/company";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { UserRole } from "../types/roles";

const companyRouter = Router();

// todas las rutas de company requieren rol de superadmin
companyRouter.use(isAuth, isAuthorizedRole([UserRole.SUPER_ADMIN]));

// rutas:
companyRouter.post("/new", createCompany);

export default companyRouter;
