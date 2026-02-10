import { Schema, model, Types, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false },
); //para que address no tenga su propio id

const clientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    documentNumber: { type: String, required: true, trim: true },
    address: { type: addressSchema, default: {} },
    telephone: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    vehicles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// índices para garantizar unicidad dentro de la misma empresa:
clientSchema.index(
  { companyId: 1, documentNumber: 1 },
  { unique: true, sparse: true },
);
clientSchema.index({ companyId: 1, email: 1 }, { unique: true, sparse: true });
// índices para búsquedas más raápidas:
clientSchema.index({ name: 1 }, { collation: { locale: "es", strength: 1 } }); // strength: 1 -> ignoramos tildes y mayúsculas
clientSchema.index({ telephone: 1 });

export type ClientDocument = InferSchemaType<typeof clientSchema> & {
  _id: Types.ObjectId;
};

export const Client = model<ClientDocument>("Client", clientSchema, "clients");
