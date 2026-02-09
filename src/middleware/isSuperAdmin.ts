import { Response, NextFunction } from "express";
import { AuthRequest } from "./isAuth";
import { UserRole } from "../types/roles";

export const isSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      message: "⛔️ Forbidden: Super Admin only",
    });
  }

  next();
};
