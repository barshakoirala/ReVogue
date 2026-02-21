import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as cartController from "../controllers/cartController.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.USER));

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.put("/items/:productId", cartController.updateItem);
router.delete("/items/:productId", cartController.removeItem);

export default router;
