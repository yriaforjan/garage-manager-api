import { Schema, model, type InferSchemaType, Types } from "mongoose";

const mechanicSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        telephone: { type: String, required: true, trim: true },

        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
    },
    { timestamps: true, versionKey: false }
);

// Índices
mechanicSchema.index(
    { name: 1 },
    { collation: { locale: "es", strength: 1 } }
);
mechanicSchema.index({ telephone: 1 });
mechanicSchema.index({ companyId: 1, name: 1 });

export type MechanicDocument = InferSchemaType<typeof mechanicSchema> & {
    _id: Types.ObjectId;
};

export const Mechanic = model<MechanicDocument>(
    "Mechanic",
    mechanicSchema,
    "mechanics"
);
