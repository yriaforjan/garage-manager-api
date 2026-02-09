import { Schema, model, Document } from "mongoose";

export interface CompanyDocument extends Document {
  name: string;
  document: string;
  email: string;
  address: string;
  phone: string;
  logo?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    document: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^([A-Z]\d{8}|\d{8}[A-Z])$/,
        "El documento debe ser un NIF o CIF válido",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[6789]\d{8}$/,
        "El teléfono debe ser un número válido de 9 dígitos",
      ],
    },
    logo: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Company = model<CompanyDocument>("Company", CompanySchema);
