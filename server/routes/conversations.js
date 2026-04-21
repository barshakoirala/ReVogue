import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as conversationController from "../controllers/conversationController.js";

const router = Router();

router.use(authenticate);

router.get("/", conversationController.listConversations);
router.post("/", conversationController.createConversation);
router.get("/:id/messages", conversationController.getMessages);
router.post("/:id/messages", conversationController.appendMessage);
router.post("/:id/livekit-token", conversationController.getLivekitToken);
router.get("/:id", conversationController.getConversation);

export default router;
