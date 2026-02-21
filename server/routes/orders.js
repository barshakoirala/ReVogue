import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as orderController from "../controllers/orderController.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.USER));

router.post("/checkout", orderController.checkout);
router.get("/", orderController.getMyOrders);

export default router;
