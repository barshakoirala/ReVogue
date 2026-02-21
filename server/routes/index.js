import { Router } from "express";
import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import categoryRoutes from "./categories.js";
import brandRoutes from "./brands.js";
import vendorRoutes from "./vendor.js";
import * as healthController from "../controllers/healthController.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/vendor", vendorRoutes);
router.get("/health", healthController.health);

export default router;
