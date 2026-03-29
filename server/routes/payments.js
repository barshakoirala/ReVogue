import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as paymentController from "../controllers/paymentController.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.USER));

router.get("/", paymentController.listMyPayments);
router.post("/esewa/initiate", paymentController.initiateEsewa);
router.post("/esewa/verify", paymentController.verifyEsewa);
router.post("/khalti/initiate", paymentController.initiateKhalti);
router.post("/khalti/verify", paymentController.verifyKhalti);

export default router;
