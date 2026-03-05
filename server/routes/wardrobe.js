import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as wardrobeController from "../controllers/wardrobeController.js";

const router = Router();

router.use(authenticate);

router.get("/", wardrobeController.getMyWardrobe);
router.get("/style-suggestions", wardrobeController.getStyleSuggestions);
router.post("/", wardrobeController.createWardrobeItem);
router.get("/:id", wardrobeController.getMyWardrobeItem);
router.put("/:id", wardrobeController.updateWardrobeItem);
router.delete("/:id", wardrobeController.deleteWardrobeItem);

export default router;

