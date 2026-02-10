import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuth";
import { UserRole } from "../types/roles";

export const isAuthorizedRole =
  (allowedRoles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        message: "⛔️ Forbidden",
      });
    }

    next();
  };
