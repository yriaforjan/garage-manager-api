import { Router } from "express";
import { createCompany } from "../controllers/company";
import { isAuth } from "../middleware/isAuth";
import { isSuperAdmin } from "../middleware/isSuperAdmin";

const companyRouter = Router();

companyRouter.post("/new", isAuth, isSuperAdmin, createCompany);

export default companyRouter;
