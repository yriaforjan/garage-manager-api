import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { UserRole } from "../types/roles";
import { AuthRequest } from "../middleware/isAuth";

const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, companyId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Missing required fields ⚠️",
      });
    }

    let finalCompanyId: string | undefined;

    if (req.user!.role === UserRole.SUPER_ADMIN) {
      // SuperAdmin puede crear cualquier rol
      if (!companyId) {
        return res.status(400).json({
          message: "companyId is required for SuperAdmin ⚠️",
        });
      }
      finalCompanyId = companyId;
    } else {
      // Admin solo puede crear roles internos
      const allowedRoles = [UserRole.MECHANIC, UserRole.ADMINISTRATIVE];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Admin cannot create this role ⛔️",
        });
      }

      finalCompanyId = req.companyId;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists ⚠️",
      });
    }

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
      message: "User created ✅",
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
      message: "Internal server error ❌",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required ⚠️",
      });
    }

    const user = await User.findOne({ email, active: true });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials ⛔️",
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials ⛔️",
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId?.toString(),
    });

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error ❌",
    });
  }
};

const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    if (req.user!.role === UserRole.SUPER_ADMIN) {
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
    } else {
      query.companyId = req.companyId;
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .populate({
        path: "companyId",
        select: "name document active",
      })
      .sort({ createdAt: -1 });

    return res.json({
      total: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error ❌",
    });
  }
};

// DELETE no elimina, solo desactiva!
const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // admin solo su empresa y no otros admins
    if (req.user!.role === UserRole.ADMIN) {
      if (user.companyId?.toString() !== req.companyId) {
        return res.status(403).json({ message: "Forbidden ⛔️" });
      }

      if (user.role === UserRole.ADMIN) {
        return res.status(400).json({
          message: "Admin cannot delete another admin ⛔️",
        });
      }
    }

    user.active = false;
    await user.save();

    return res.json({
      message: "🗑 User deactivated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error ❌",
    });
  }
};

export { login, register, getAllUsers, deleteUser };
