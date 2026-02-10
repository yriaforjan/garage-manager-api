import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { UserRole } from "../types/roles";
import { AuthRequest } from "../middleware/isAuth";

const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, companyId } = req.body;

    // 1️⃣ Validación base
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "⚠️ Missing required fields",
      });
    }

    // 2️⃣ Reglas de negocio según rol creador
    let finalCompanyId: string | undefined;

    if (req.user!.role === UserRole.SUPER_ADMIN) {
      // SuperAdmin → puede crear cualquier rol
      if (!companyId) {
        return res.status(400).json({
          message: "⚠️ companyId is required for SuperAdmin",
        });
      }
      finalCompanyId = companyId;
    } else {
      // Admin → solo roles internos
      const allowedRoles = [UserRole.MECHANIC, UserRole.ADMINISTRATIVE];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "⛔️ Admin cannot create this role",
        });
      }

      finalCompanyId = req.user!.companyId;
    }

    // 3️⃣ Evitar duplicados
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "⚠️ User already exists",
      });
    }

    // 4️⃣ Crear usuario
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      companyId: finalCompanyId,
      active: true,
    });

    return res.status(201).json({
      message: "✅ User created",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "❌ Internal server error",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validación básica
    if (!email || !password) {
      return res.status(400).json({
        message: "⚠️ Email and password are required",
      });
    }

    // 2. Buscar usuario activo
    const user = await User.findOne({ email, active: true });
    if (!user) {
      return res.status(401).json({
        message: "⛔️ Invalid credentials",
      });
    }

    // 3. Comparar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "⛔️ Invalid credentials",
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
      message: "❌ Internal server error",
    });
  }
};

export { login, register };
