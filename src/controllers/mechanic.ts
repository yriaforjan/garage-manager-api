import { Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { Mechanic } from "../models/Mechanic";
import unaccent from "../utils/unaccent";
import { AuthRequest } from "../middleware/isAuth";

type GetMechanicsQuery = {
    search?: string;
    page?: string;
    limit?: string;
};

export const getMechanics = async (
    req: AuthRequest & { query: GetMechanicsQuery },
    res: Response,
    _next: NextFunction
) => {
    try {
        // companyId viene del middleware injectCompanyId
        if (!req.companyId) {
            return res.status(401).json({ error: "⚠️ companyId no disponible" });
        }

        const { search } = req.query;

        // page y limit llegan como string en query, por eso los convertimos
        const pageRaw = Number(req.query.page ?? 1);
        const limitRaw = Number(req.query.limit ?? 10);

        const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
        const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

        const skip = (page - 1) * limit;

        const filter: Record<string, any> = { companyId: req.companyId };

        if (search) {
            const searchPattern = unaccent(search);
            const regex = new RegExp(searchPattern, "i");

            filter.$or = [{ name: { $regex: regex } }, { telephone: { $regex: regex } }];
        }

        // Collation SOLO para que el ORDENAMIENTO sea alfabético correcto en español
        const collationOptions = { locale: "es", strength: 1 };

        const [mechanics, total] = await Promise.all([
            Mechanic.find(filter)
                .collation(collationOptions)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),

            Mechanic.countDocuments(filter),
        ]);

        return res.status(200).json({
            mechanics,
            pagination: {
                totalData: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error buscando los mecánicos ❌" });
    }
};

export const getMechanicById = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    try {
        //companyId viene del middleware injectCompanyId
        if (!req.companyId) {
            return res.status(401).json({ error: "⚠️ companyId no disponible" });
        }

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "⚠️ ID de mecánico inválido" })
        }

        const mechanic = await Mechanic.findOne({ _id: id, companyId: req.companyId }).lean();

        if (!mechanic) {
            return res.status(404).json({ error: "⚠️ Mecánico no encontrado" })
        }

        return res.status(200).json(mechanic);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error buscando el mecánico ❌" })
    }
}