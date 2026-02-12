import { Router } from "express";
import { getMechanics, getMechanicById, postMechanic, updateMechanic, deleteMechanic } from "../controllers/mechanic";
import { injectCompanyId } from "../middleware/injectCompanyId";
import { isAuth } from "../middleware/isAuth";
import { isAuthorizedRole } from "../middleware/isAuthorizedRole";
import { UserRole } from "../types/roles";


const mechanicRouter = Router();

mechanicRouter.use(
  isAuth,
  injectCompanyId,
  isAuthorizedRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
);

mechanicRouter.get("/", getMechanics);
mechanicRouter.get("/:id", getMechanicById);
mechanicRouter.post("/", postMechanic);
mechanicRouter.put("/:id", updateMechanic);
mechanicRouter.delete("/:id", deleteMechanic);

export default mechanicRouter;