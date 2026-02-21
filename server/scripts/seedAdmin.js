import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email: "admin@revogue.com" });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      process.exit(0);
      return;
    }
    const admin = await User.create({
      name: "Admin",
      email: "admin@revogue.com",
      password: "admin123",
      role: "admin",
    });
    console.log("Admin created:", admin.email, "| Password: admin123");
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
