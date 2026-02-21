import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.get("/admin-only", authenticate, authorize("admin"), authController.adminOnly);

export default router;
