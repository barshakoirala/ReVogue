import * as authService from "../services/authService.js";
import { formatUserResponse } from "../services/authService.js";
import { AUTH_MESSAGES } from "../constants/index.js";

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const result = await authService.register({ firstName, lastName, email, password, role });

    res.status(201).json({
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
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
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({ user: formatUserResponse(req.user) });
  } catch (err) {
    next(err);
  }
}

export async function adminOnly(req, res, next) {
  try {
    res.json({ message: AUTH_MESSAGES.ADMIN_ACCESS_GRANTED, user: formatUserResponse(req.user) });
  } catch (err) {
    next(err);
  }
}
