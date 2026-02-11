import jwt, { SignOptions } from "jsonwebtoken"; // SignOptions → tipo de TypeScript para las opciones de jwt.sign
import { UserRole } from "../types/roles";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  companyId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const signOptions: SignOptions = {
  expiresIn: 60 * 60 * 24 * 7, // 7 días
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, signOptions);
  // Firma un JWT usando: el payload, la clave secreta, las opciones (expiración)
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JwtPayload;
};
