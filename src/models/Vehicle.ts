// src/models/vehicle.model.ts
import { Schema, model, Types, type InferSchemaType } from "mongoose";

/**
 * VEHICLE SCHEMA (Mongoose)
 * - Define cómo se guarda un vehículo en MongoDB.
 * - TypeScript usará este schema para inferir el tipo del documento.
 */
const vehicleSchema = new Schema(
    {
        /**
         * Relación: cada vehículo pertenece a un cliente.
         * Guardamos el ObjectId del cliente y (opcionalmente) podemos hacer populate().
         */
        client: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        /**
         * Matrícula:
         * - required, unique, uppercase, trim
         * - set(): normaliza el valor antes de guardarlo (quita espacios/guiones/etc.)
         * - match: valida formato de matrícula española (actual y antigua)
         */
        plate: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true,

            // "unknown" para que TS no se queje si llega algo raro;
            // lo convertimos a string de forma segura.
            set: (val: unknown) => String(val ?? "").replace(/[^a-zA-Z0-9]/g, ""),

            match: [
                /^(\d{4}[B-DF-HJ-NP-TV-Z]{3}|[A-Z]{1,2}\d{4}[A-Z]{0,2})$/,
                "La matrícula no tiene un formato español válido (Ej: 1234BCD o M1234AB)",
            ],
        },

        brand: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },

        /**
         * Año:
         * - min 1900
         * - validación dinámica: como el año actual cambia con el tiempo,
         *   lo validamos con una función (no con un valor calculado al arrancar el servidor).
         */
        year: {
            type: Number,
            min: [1900, "El año no puede ser anterior a 1900"],
            validate: {
                validator: (y: number) => y <= new Date().getFullYear() + 1,
                message: "El año no puede ser superior al actual",
            },
        },

        kms: { type: Number, min: [0, "Los kilómetros no pueden ser negativos"] },
    },
    {
        timestamps: true, // crea createdAt y updatedAt automáticamente
        versionKey: false, // quita __v
    }
);

/**
 * ÍNDICES
 * - Este índice acelera queries del tipo:
 *   Vehicle.find({ client: clientId })
 */
vehicleSchema.index({ client: 1 });

/**
 * TIPO TS DEL DOCUMENTO
 * InferSchemaType saca el tipo a partir del schema (name: string, kms: number, etc.)
 * y nosotros añadimos _id porque Mongoose lo tiene siempre.
 */
export type VehicleDocument = InferSchemaType<typeof vehicleSchema> & {
    _id: Types.ObjectId;
};

/**
 * MODELO MONGOOSE
 * - "Vehicle" es el nombre del modelo
 * - vehicleSchema es el schema
 * - "vehicles" es el nombre de la colección en MongoDB
 *
 * El <VehicleDocument> hace que TypeScript sepa qué devuelve este modelo
 * (autocompletado y errores si te equivocas con tipos/campos).
 */
export const Vehicle = model<VehicleDocument>("Vehicle", vehicleSchema, "vehicles");
