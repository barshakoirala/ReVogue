import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.get("/admin-only", authenticate, authorize(ROLES.ADMIN), authController.adminOnly);

export default router;
