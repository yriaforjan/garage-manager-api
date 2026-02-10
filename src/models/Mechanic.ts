import { Schema, model, type InferSchemaType, Types } from "mongoose";

const mechanicSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        telephone: { type: String, required: true, trim: true },
    },
    { timestamps: true, versionKey: false }
);

mechanicSchema.index({ name: 1 }, { collation: { locale: "es", strength: 1 } }); // aquí ignoramos las tildes
mechanicSchema.index({ telephone: 1 });

export type MechanicDocument = InferSchemaType<typeof mechanicSchema> & {
    _id: Types.ObjectId;
};

export const Mechanic = model<MechanicDocument>(
    "Mechanic",
    mechanicSchema,
    "mechanics"
);