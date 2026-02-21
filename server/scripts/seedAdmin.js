import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import { SEED_ADMIN, SEED_MESSAGES } from "../constants/index.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email: SEED_ADMIN.EMAIL });
    if (existing) {
      console.log(SEED_MESSAGES.ADMIN_ALREADY_EXISTS, existing.email);
      process.exit(0);
      return;
    }
    const admin = await User.create({
      name: SEED_ADMIN.NAME,
      email: SEED_ADMIN.EMAIL,
      password: SEED_ADMIN.PASSWORD,
      role: SEED_ADMIN.ROLE,
    });
    console.log(SEED_MESSAGES.ADMIN_CREATED, admin.email, SEED_MESSAGES.ADMIN_PASSWORD_LABEL, SEED_ADMIN.PASSWORD);
  } catch (err) {
    console.error(SEED_MESSAGES.SEED_FAILED, err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
