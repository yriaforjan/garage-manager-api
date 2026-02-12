import { Response } from "express";
import bcrypt from "bcryptjs";
import { Company } from "../models/Company";
import { User } from "../models/User";
import { UserRole } from "../types/roles";
import { AuthRequest } from "../middleware/isAuth";

const createCompany = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      document,
      address,
      phone,
      logo,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    // Validación
    if (
      !name ||
      !document ||
      !address ||
      !phone ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      return res.status(400).json({
        message: "Missing required fields ⚠️",
      });
    }

    // Empresa duplicada
    const companyExists = await Company.findOne({
      document,
    });
    if (companyExists) {
      return res.status(400).json({
        message: "Company already exists ⚠️",
      });
    }

    // Admin duplicado
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      return res.status(400).json({
        message: "Admin user already exists ⚠️",
      });
    }

    // Crear empresa
    const company = await Company.create({
      name,
      document,
      address,
      phone,
      logo,
      active: true,
    });

    // Crear admin
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company._id,
      active: true,
    });

    return res.status(201).json({
      message: "Company and admin created ✅",
      company: {
        id: company.id,
        name: company.name,
        document: company.document,
        address: company.address,
        phone: company.phone
      },
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error ❌",
    });
  }
};

export { createCompany };
