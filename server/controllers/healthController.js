import { API_MESSAGES } from "../constants/index.js";

export function health(_, res) {
  res.json({ status: API_MESSAGES.STATUS_OK, timestamp: new Date().toISOString() });
}
