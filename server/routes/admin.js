import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as adminProductController from "../controllers/adminProductController.js";
import * as adminCategoryController from "../controllers/adminCategoryController.js";
import * as adminBrandController from "../controllers/adminBrandController.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get("/products", adminProductController.getAllProducts);
router.get("/categories", adminCategoryController.getCategories);
router.post("/categories", adminCategoryController.createCategory);
router.get("/categories/:id", adminCategoryController.getCategory);
router.put("/categories/:id", adminCategoryController.updateCategory);
router.delete("/categories/:id", adminCategoryController.deleteCategory);
router.get("/brands", adminBrandController.getBrands);
router.post("/brands", adminBrandController.createBrand);
router.get("/brands/:id", adminBrandController.getBrand);
router.put("/brands/:id", adminBrandController.updateBrand);
router.delete("/brands/:id", adminBrandController.deleteBrand);

export default router;
