import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validación básica
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Buscar usuario activo
    const user = await User.findOne({ email, active: true });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 3. Comparar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 4. Generar JWT
    const token = generateToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId?.toString(),
    });

    // 5. Respuesta
    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { login };
