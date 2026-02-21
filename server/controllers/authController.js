import * as authService from "../services/authService.js";
import { AppError } from "../utils/AppError.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });

    res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

export async function adminOnly(req, res, next) {
  try {
    res.json({ message: "Admin access granted", user: req.user });
  } catch (err) {
    next(err);
  }
}
