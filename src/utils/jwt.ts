import jwt, { SignOptions } from "jsonwebtoken"; // SignOptions → tipo de TypeScript para las opciones de jwt.sign

interface JwtPayload {
  userId: string;
  role: string;
  companyId?: string; // opcional porque superadmin no tiene empresa asociada
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const signOptions: SignOptions = {
  expiresIn: 60 * 60 * 24 * 7, // 7 días
};

const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, signOptions);
  // Firma un JWT usando: el payload, la clave secreta, las opciones (expiración)
};

const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export { JwtPayload, generateToken, verifyToken };
