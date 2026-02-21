import { AppError } from "../utils/AppError.js";
import { ERROR_MESSAGES } from "../constants/index.js";

const MONGOOSE_VALIDATION_ERROR = "ValidationError";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === MONGOOSE_VALIDATION_ERROR) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message: message || ERROR_MESSAGES.VALIDATION_FAILED });
  }

  console.error(err);
  res.status(500).json({ message: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}
