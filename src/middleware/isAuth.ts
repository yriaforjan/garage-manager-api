import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserRole } from "../types/roles";

export type JwtUser = {
  userId: string;
  role: UserRole;
  companyId?: string;
};

export interface AuthRequest extends Request {
  user?: JwtUser;
  companyId?: string;
}

export const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "⚠️ No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Ideal: que verifyToken esté tipado y devuelva JwtUser
    const decoded = verifyToken(token) as JwtUser;

    // Extra safety: comprobar mínimos
    if (!decoded?.userId || !decoded?.role) {
      return res.status(401).json({ message: "⛔️ Invalid token payload" });
    }

    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "⛔️ Invalid token" });
  }
};
