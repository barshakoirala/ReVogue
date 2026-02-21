import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { AUTH_MIDDLEWARE_MESSAGES, BEARER_PREFIX } from "../constants/index.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith(BEARER_PREFIX) ? authHeader.slice(BEARER_PREFIX.length) : null;

    if (!token) {
      return res.status(401).json({ message: AUTH_MIDDLEWARE_MESSAGES.ACCESS_DENIED_NO_TOKEN });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: AUTH_MIDDLEWARE_MESSAGES.USER_NOT_FOUND });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: AUTH_MIDDLEWARE_MESSAGES.INVALID_TOKEN });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: AUTH_MIDDLEWARE_MESSAGES.TOKEN_EXPIRED });
    }
    next(err);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: AUTH_MIDDLEWARE_MESSAGES.ACCESS_DENIED });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: AUTH_MIDDLEWARE_MESSAGES.INSUFFICIENT_PERMISSIONS });
    }
    next();
  };
};
