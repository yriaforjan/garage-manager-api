import { Schema, model, Types, type InferSchemaType } from "mongoose";

const addressSchema = new Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
},
    { _id: false }) //para que address no tenga su propio id

const clientSchema = new Schema({
    name: { type: String, required: true, trim: true },
    documentNumber: { type: String, required: true, trim: true, unique: true },
    address: { type: addressSchema, default: {} },
    telephone: { type: String, required: true, trim: true },
    email: {
        type: String, required: true, trim: true, lowercase: true, unique: true, match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
            "Por favor, introduce un correo electrónico válido"],
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
    }
);

//para hacer busquedas rápidas mas tarde por nombre o por telefono
clientSchema.index({ name: 1 }, { collation: { locale: "es", strength: 1 } });// strength: 1 -> ignoramos tildes y mayúsculas
clientSchema.index({ telephone: 1 });

/**
 * Tipos TypeScript derivados del schema (recomendado)
 */
export type ClientDocument = InferSchemaType<typeof clientSchema> & {
    _id: Types.ObjectId;
};

export const Client = model<ClientDocument>("Client", clientSchema, "clients");