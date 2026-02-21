import mongoose from "mongoose";
import { config } from "./config.js";
import { DB_MESSAGES } from "./constants/index.js";

export async function connectDb() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(DB_MESSAGES.MONGODB_CONNECTED);
  } catch (err) {
    if (config.nodeEnv === "development") {
      console.warn(DB_MESSAGES.MONGODB_UNAVAILABLE, err.message);
    } else {
      console.error(DB_MESSAGES.MONGODB_CONNECTION_ERROR, err.message);
      process.exit(1);
    }
  }
}
