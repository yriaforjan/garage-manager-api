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
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
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
