import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const dbUrl = process.env.DB_URL;

    if (!dbUrl) {
      throw new Error("La variable de entorno DB_URL no está definida");
    }

    await mongoose.connect(dbUrl);
    console.log("Conectado con éxito a MongoDB ✅");
  } catch (error) {
    console.error("Error en la conexión a MongoDB ❌:", error);
    process.exit(1);
  }
};

export default connectDB;
