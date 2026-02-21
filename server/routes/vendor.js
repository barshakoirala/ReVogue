import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as vendorProductController from "../controllers/vendorProductController.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.VENDOR));

router.get("/products", vendorProductController.getMyProducts);
router.post("/products", vendorProductController.createProduct);
router.get("/products/:id", vendorProductController.getMyProduct);
router.put("/products/:id", vendorProductController.updateProduct);
router.delete("/products/:id", vendorProductController.deleteProduct);

export default router;
