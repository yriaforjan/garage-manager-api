import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuth";
import { UserRole } from "../types/roles";

export const isAuthorizedRole =
  (allowedRoles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "🔐 Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "⛔ Forbidden" });
    }

    return next();
  };
