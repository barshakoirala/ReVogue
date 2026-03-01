import { Router } from "express";
import * as productController from "../controllers/productController.js";

const router = Router();

router.get("/", productController.getProducts);
router.get("/goes-with", productController.getGoesWith);
router.get("/:id", productController.getProduct);

export default router;
