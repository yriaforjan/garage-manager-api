import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../../config/db";
import { User } from "../../models/User";
import { UserRole } from "../../types/roles";

const runSeed = async (): Promise<void> => {
  try {
    // 1. Conectar a la base de datos
    await connectDB();

    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.warn("⚠️ SuperAdmin env variables not defined");
      return;
    }

    // 2. Comprobar si ya existe
    const existingSuperAdmin = await User.findOne({
      email: superAdminEmail,
      role: UserRole.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log("⚠️ SuperAdmin already exists");
      return;
    }

    // 3. Hash de la contraseña
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);

    // 4. Crear SuperAdmin
    await User.create({
      name: "Super Admin",
      email: superAdminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      active: true,
    });

    console.log("✅ SuperAdmin created successfully");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error during seed:", error.message);
    } else {
      console.error("❌ Unknown error during seed");
    }
  } finally {
    // 5. Cerrar conexión
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("🔌 MongoDB connection closed");
    }
    process.exit(0);
  }
};

runSeed();
