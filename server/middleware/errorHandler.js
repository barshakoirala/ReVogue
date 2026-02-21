import { AppError } from "../utils/AppError.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message: message || "Validation failed." });
  }

  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error." });
}
