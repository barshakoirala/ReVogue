import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { AppError } from "../utils/AppError.js";
import { AUTH_MESSAGES } from "../constants/index.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
};

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError(AUTH_MESSAGES.NAME_EMAIL_PASSWORD_REQUIRED, 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED, 400);
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    user: formatUserResponse(user),
    token,
  };
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new AppError(AUTH_MESSAGES.EMAIL_PASSWORD_REQUIRED, 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD, 401);
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD, 401);
  }

  const token = generateToken(user._id);

  return {
    user: formatUserResponse(user),
    token,
  };
}
