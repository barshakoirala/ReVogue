// Auth
export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  ADMIN_ACCESS_GRANTED: "Admin access granted",
  NAME_EMAIL_PASSWORD_REQUIRED: "Name, email, and password are required.",
  EMAIL_PASSWORD_REQUIRED: "Email and password are required.",
  EMAIL_ALREADY_REGISTERED: "Email already registered.",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
};

// Auth middleware
export const AUTH_MIDDLEWARE_MESSAGES = {
  ACCESS_DENIED_NO_TOKEN: "Access denied. No token provided.",
  USER_NOT_FOUND: "User not found.",
  INVALID_TOKEN: "Invalid token.",
  TOKEN_EXPIRED: "Token expired.",
  ACCESS_DENIED: "Access denied.",
  INSUFFICIENT_PERMISSIONS: "Access denied. Insufficient permissions.",
};

// Error handler
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: "Validation failed.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
};

// API / General
export const API_MESSAGES = {
  REVOGUE_API: "ReVogue API",
  STATUS_OK: "ok",
};

// DB
export const DB_MESSAGES = {
  MONGODB_CONNECTED: "MongoDB connected",
  MONGODB_UNAVAILABLE: "MongoDB not available, running without DB:",
  MONGODB_CONNECTION_ERROR: "MongoDB connection error:",
};

// Server
export const SERVER_MESSAGES = {
  API_RUNNING: "ReVogue API running on",
};

// Seed script
export const SEED_MESSAGES = {
  ADMIN_ALREADY_EXISTS: "Admin already exists:",
  ADMIN_CREATED: "Admin created:",
  ADMIN_PASSWORD_LABEL: "| Password:",
  SEED_FAILED: "Seed failed:",
};
