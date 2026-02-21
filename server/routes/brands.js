import { Router } from "express";
import * as brandController from "../controllers/brandController.js";

const router = Router();

router.get("/", brandController.getBrands);

export default router;
