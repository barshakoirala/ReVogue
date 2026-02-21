import { Router } from "express";
import authRoutes from "./auth.js";
import * as healthController from "../controllers/healthController.js";

const router = Router();

router.use("/auth", authRoutes);
router.get("/health", healthController.health);

export default router;
