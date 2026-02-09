import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    companyId?: string;
  };
}

const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "⚠️ No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "⛔️ Invalid token" });
  }
};

export { AuthRequest, isAuth };
