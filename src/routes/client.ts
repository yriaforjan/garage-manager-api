import { Router } from "express";
import { getClients, getClientById, postClient, updateClient, deleteClient } from "../controllers/client";
import { injectCompanyId } from "../middleware/injectCompanyId";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { UserRole } from "../types/roles";

const clientRouter = Router();

clientRouter.use(
  isAuth,
  injectCompanyId,
  isAuthorizedRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
);

clientRouter.get("/", getClients);
clientRouter.get("/:id", getClientById);
clientRouter.post("/", postClient);
clientRouter.put("/:id", updateClient);
clientRouter.delete("/:id", deleteClient);

export default clientRouter;
