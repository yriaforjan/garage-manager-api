import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuth";
import { UserRole } from "../types/roles";

export const injectCompanyId = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next();

  // todos los usuarios menos superadmin trabajan bajo una empresa
  if (req.user.role !== UserRole.SUPER_ADMIN) {
    req.companyId = req.user.companyId;
  }

  next();
};
