import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { AppError } from "../utils/AppError.js";
import { AUTH_MESSAGES } from "../constants/index.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
};

export const formatUserResponse = (user) => {
  const firstName = user.firstName ?? user.name?.split(" ")[0] ?? "";
  const lastName = user.lastName ?? user.name?.split(" ").slice(1).join(" ") ?? "";
  return {
    id: user._id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || user.name || "",
    email: user.email,
    gender: user.gender,
    dob: user.dob,
    role: user.role,
  };
};

export async function register({ firstName, lastName, email, password }) {
  if (!firstName || !lastName || !email || !password) {
    throw new AppError(AUTH_MESSAGES.REGISTER_FIELDS_REQUIRED, 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED, 400);
  }

  const user = await User.create({ firstName, lastName, email, password });
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
