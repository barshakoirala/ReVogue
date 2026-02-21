import { Router } from "express";

const router = Router();

router.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
