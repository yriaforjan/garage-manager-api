import { Router } from "express";
import { createCompany } from "../controllers/company";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { UserRole } from "../types/roles";

const companyRouter = Router();

companyRouter.post(
  "/new",
  isAuth,
  isAuthorizedRole([UserRole.SUPER_ADMIN]),
  createCompany,
);

export default companyRouter;
