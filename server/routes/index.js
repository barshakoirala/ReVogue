import { Router } from "express";
import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import * as healthController from "../controllers/healthController.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.get("/health", healthController.health);

export default router;
