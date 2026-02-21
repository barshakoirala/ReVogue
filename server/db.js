import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDb() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    if (config.nodeEnv === "development") {
      console.warn("MongoDB not available, running without DB:", err.message);
    } else {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    }
  }
}
