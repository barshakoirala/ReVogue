import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as donationController from "../controllers/donationController.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.USER));

router.get("/", donationController.getMyDonations);
router.get("/:id", donationController.getDonationById);
router.post("/", donationController.createDonation);

export default router;
