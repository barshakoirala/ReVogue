/**
 * One-off: set outfitSlot on existing Category documents (by name).
 * Run on existing DB so AI Stylist "goes with" uses DB-driven slots without re-seeding.
 * Usage: node server/scripts/assignOutfitSlots.js
 */
import mongoose from "mongoose";
import "dotenv/config";
import Category from "../models/Category.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

const NAME_TO_SLOT = {
  Tops: "top",
  Bottoms: "bottom",
  Dresses: "onepiece",
  Outerwear: "outerwear",
  Bags: "accessory",
  Jewelry: "accessory",
  Hats: "accessory",
  Scarves: "accessory",
  Sneakers: "shoes",
  Sandals: "shoes",
  Boots: "shoes",
  Formal: "shoes",
};

async function assignOutfitSlots() {
  await mongoose.connect(MONGO_URI);
  let updated = 0;
  for (const [name, slot] of Object.entries(NAME_TO_SLOT)) {
    const result = await Category.updateMany(
      { name, parent: { $ne: null } },
      { $set: { outfitSlot: slot } }
    );
    updated += result.modifiedCount;
  }
  console.log("Updated outfitSlot on", updated, "categories");
  await mongoose.disconnect();
  process.exit(0);
}

assignOutfitSlots().catch((err) => {
  console.error(err);
  process.exit(1);
});
