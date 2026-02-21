import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { AppError } from "../utils/AppError.js";

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
    throw new AppError("Name, email, and password are required.", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already registered.", 400);
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
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user._id);

  return {
    user: formatUserResponse(user),
    token,
  };
}
