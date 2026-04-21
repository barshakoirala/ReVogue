import mongoose from "mongoose";
import { AccessToken } from "livekit-server-sdk";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { config } from "../config.js";
import { AppError } from "../utils/AppError.js";
import { CONVERSATION_MESSAGES } from "../constants/conversation.js";

export async function listConversations(userId) {
  return Conversation.find({ user: userId }).sort({ updatedAt: -1 }).lean();
}

export async function createConversation(userId) {
  const id = new mongoose.Types.ObjectId();
  const conv = await Conversation.create({
    _id: id,
    user: userId,
    title: "New chat",
    livekitRoomName: `revogue-${userId}-${id}`,
  });
  return conv.toObject();
}

export async function getConversationById(userId, conversationId) {
  return Conversation.findOne({ _id: conversationId, user: userId }).lean();
}

export async function getMessages(userId, conversationId) {
  const conv = await Conversation.findOne({ _id: conversationId, user: userId });
  if (!conv) return null;
  return Message.find({ conversation: conversationId }).sort({ createdAt: 1 }).lean();
}

export async function appendMessage(userId, conversationId, { role, content }) {
  const conv = await Conversation.findOne({ _id: conversationId, user: userId });
  if (!conv) return null;

  const msg = await Message.create({
    conversation: conversationId,
    role,
    content,
  });

  if (role === "user") {
    const userCount = await Message.countDocuments({
      conversation: conversationId,
      role: "user",
    });
    if (userCount === 1) {
      conv.title = content.trim().slice(0, 60) || "Chat";
    }
  }

  conv.updatedAt = new Date();
  await conv.save();

  return msg.toObject();
}

export async function createLiveKitToken(user, conversation) {
  const { livekitUrl, livekitApiKey, livekitApiSecret } = config;
  if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
    throw new AppError(CONVERSATION_MESSAGES.LIVEKIT_NOT_CONFIGURED, 503);
  }

  const at = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: user._id.toString(),
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
  });
  at.addGrant({ roomJoin: true, room: conversation.livekitRoomName });
  const token = await at.toJwt();
  return { url: livekitUrl, token };
}
