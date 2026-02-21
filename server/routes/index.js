import { Router } from "express";
import authRoutes from "./auth.js";

const router = Router();

router.use("/auth", authRoutes);

router.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
