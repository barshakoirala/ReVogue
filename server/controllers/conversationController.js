import mongoose from "mongoose";
import * as conversationService from "../services/conversationService.js";
import { CONVERSATION_MESSAGES } from "../constants/conversation.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function listConversations(req, res, next) {
  try {
    const conversations = await conversationService.listConversations(req.user._id);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const conversation = await conversationService.createConversation(req.user._id);
    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    const conversation = await conversationService.getConversationById(req.user._id, id);
    if (!conversation) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    res.json(conversation);
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    const messages = await conversationService.getMessages(req.user._id, id);
    if (messages === null) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

export async function appendMessage(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    const { role, content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: CONVERSATION_MESSAGES.CONTENT_REQUIRED });
    }
    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({ message: "Invalid role." });
    }
    const message = await conversationService.appendMessage(req.user._id, id, {
      role,
      content: content.trim(),
    });
    if (!message) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

export async function getLivekitToken(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    const conversation = await conversationService.getConversationById(req.user._id, id);
    if (!conversation) {
      return res.status(404).json({ message: CONVERSATION_MESSAGES.NOT_FOUND });
    }
    const { url, token } = await conversationService.createLiveKitToken(req.user, conversation);
    res.json({ url, token });
  } catch (err) {
    next(err);
  }
}
