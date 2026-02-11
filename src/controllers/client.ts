import { Response, NextFunction } from "express";
import { Client } from "../models/Client"; // ajusta la ruta/nombre si cambia
import unaccent from "../utils/unaccent";  // ajusta la ruta
import { AuthRequest } from "../middleware/isAuth";
import { isValidObjectId } from "mongoose";

type GetClientsQuery = {
  search?: string;
  page?: string;
  limit?: string;
};


export const getClients = async (
  req: AuthRequest & { query: GetClientsQuery },
  res: Response,
  _next: NextFunction
) => {
  try {
    const { search } = req.query;

    // companyId viene del middleware injectCompanyId
    if (!req.companyId) {
      return res.status(401).json({ error: "companyId no disponible ⚠️" });
    }

    const pageRaw = Number(req.query.page ?? 1);
    const limitRaw = Number(req.query.limit ?? 10);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { companyId: req.companyId }; // Multi-tenancy filter

    if (search) {
      const searchPattern = unaccent(search);
      const regex = new RegExp(searchPattern, "i");

      filter.$or = [
        { name: { $regex: regex } },
        { documentNumber: { $regex: regex } },
        { telephone: { $regex: regex } },
        { email: { $regex: regex } },
      ];
    }

    // Mantenemos collation SOLO para que el ORDENAMIENTO (sort) sea alfabético correcto en español
    const collationOptions = { locale: "es", strength: 1 };

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .collation(collationOptions)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),

      Client.countDocuments(filter),
    ]);

    return res.status(200).json({
      clients,
      pagination: {
        totalData: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error buscando los clientes ❌" });
  }
};


export const getClientById = async ( req: AuthRequest, res: Response, _next: NextFunction ) => {
  try {
    // companyId viene del middleware injectCompanyId
    if (!req.companyId) {
      return res.status(401).json({ error: "companyId no disponible ⚠️" });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ error: "La solicitud contiene datos inválidos ⚠️" });
    }

    // Multi-tenancy isolation
    const client = await Client.findOne({
      _id: id,
      companyId: req.companyId,
    }).populate("vehicles");

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });
    }

    return res.status(200).json(client);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo el cliente ❌" });
  }
};


export const postClient = async ( req: AuthRequest, res: Response, _next: NextFunction ) => {
  try {
    // companyId viene del middleware injectCompanyId
    if (!req.companyId) {
      return res.status(401).json({ error: "companyId no disponible ⚠️" });
    }

    if (!req.body || Object.keys(req.body as object).length === 0) {
      return res.status(400).json({ error: "Faltan datos del cliente ⚠️" });
    }

    const newClient = new Client({
      ...req.body,
      companyId: req.companyId, // ✅ Assign to company (desde middleware)
    });

    const clientSaved = await newClient.save();

    return res.status(201).json({
      message: "Cliente creado con éxito ✅",
      client: clientSaved,
    });
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({ error: "Datos de cliente inválidos ⚠️" });
    }

    if (error?.code === 11000) {
      // Duplicado por índices únicos (email o documentNumber dentro de la misma empresa)
      return res
        .status(409)
        .json({ error: "El email o número de documento ya existe ⚠️" });
    }

    return res.status(500).json({ error: "Error al crear el cliente ❌" });
  }
};


export const updateClient = async ( req: AuthRequest, res: Response, _next: NextFunction ) => {
  try {
    // companyId viene del middleware injectCompanyId
    if (!req.companyId) {
      return res.status(401).json({ error: "companyId no disponible ⚠️" });
    }

    const { id } = req.params;

    // Prevent updating companyId (y _id)
    const { _id, companyId, ...data } = req.body as Record<string, unknown>;

    const clientUpdated = await Client.findOneAndUpdate(
      { _id: id, companyId: req.companyId },
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!clientUpdated) {
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });
    }

    return res.status(200).json({
      message: "Cliente actualizado ✅",
      client: clientUpdated,
    });
  } catch (error: any) {
    if (error?.name === "CastError" || error?.name === "ValidationError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos ⚠️",
      });
    }

    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ error: "El email o documento ya existe en otro cliente ⚠️" });
    }

    return res.status(500).json({
      error: "Error al actualizar el cliente ❌",
    });
  }
};


export const deleteClient = async ( req: AuthRequest, res: Response, _next: NextFunction
) => {
  try {
    // companyId viene del middleware injectCompanyId
    if (!req.companyId) {
      return res.status(401).json({ error: "companyId no disponible ⚠️" });
    }

    const { id } = req.params;

    const clientDeleted = await Client.findOneAndDelete({
      _id: id,
      companyId: req.companyId,
    });

    if (!clientDeleted) {
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });
    }

    return res.status(200).json({
      message: "Cliente eliminado ✅",
      client: clientDeleted,
    });
  } catch (error: any) {
    if (error?.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos ⚠️",
      });
    }

    return res.status(500).json({
      error: "Error al eliminar el cliente ❌",
    });
  }
};

//como delante de cada funcion ponemos export, luego no hace falta exportarlas aquí.