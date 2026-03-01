import mongoose from "mongoose";
import "dotenv/config";
import Product from "../models/Product.js";
import { computeEcoScore } from "../services/vendorProductService.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

/** Random number between min and max (inclusive). */
function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/** True if product has no eco metrics (or only notes). */
function hasNoEcoMetrics(product) {
  const eco = product.ecoSustainability;
  if (!eco || typeof eco !== "object") return true;
  return (
    eco.carbonSavedKg == null &&
    eco.waterSavedLiters == null &&
    eco.wasteDivertedKg == null &&
    eco.energySavedKwh == null &&
    eco.landUseSavedSqm == null &&
    eco.equivalentItemsAvoided == null &&
    eco.microplasticsAvoidedG == null &&
    eco.recycledContentPercent == null
  );
}

/** Generate plausible eco metrics for one second-hand garment. */
function generateEcoMetrics() {
  return {
    carbonSavedKg: rand(3, 12),
    waterSavedLiters: rand(500, 2500),
    wasteDivertedKg: rand(0.2, 1),
    energySavedKwh: rand(5, 20),
    landUseSavedSqm: rand(1, 4),
    equivalentItemsAvoided: 1,
    microplasticsAvoidedG: rand(0.2, 1.5),
    recycledContentPercent: Math.round(rand(50, 100)),
    notes: "Second-hand item — extends product life and reduces demand for new production.",
  };
}

async function seedProductEcoMetrics() {
  try {
    await mongoose.connect(MONGO_URI);

    const products = await Product.find({}).lean();
    let updated = 0;

    for (const product of products) {
      if (!hasNoEcoMetrics(product)) continue;

      const ecoSustainability = generateEcoMetrics();
      const ecoScore = computeEcoScore(ecoSustainability);

      await Product.updateOne(
        { _id: product._id },
        { $set: { ecoSustainability, ecoScore } }
      );
      updated++;
      console.log("Updated:", product.title, "| ecoScore:", ecoScore);
    }

    console.log(`\nDone. Attached eco metrics to ${updated} product(s).`);
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedProductEcoMetrics();
