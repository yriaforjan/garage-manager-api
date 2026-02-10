import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuth";
import { UserRole } from "../types/roles";

export const injectCompanyId = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // si no hay user, seguimos (será cosa de isAuth si esto es ruta protegida)
  if (!req.user) return next();

  // todos los usuarios menos SUPER_ADMIN trabajan bajo una empresa
  if (req.user.role !== UserRole.SUPER_ADMIN) {
    if (!req.user.companyId) {
      return res.status(401).json({ error: "companyId faltante en el usuario" });
    }
    req.companyId = String(req.user.companyId);
  }

  return next();
};
