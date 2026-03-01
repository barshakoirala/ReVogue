/**
 * Seed embeddings for all products (OpenAI text-embedding-3-small).
 * Run after OPENAI_API_KEY is set and you have products in DB.
 *
 * Usage: npm run seed:embeddings  (from server folder)
 *    or: node scripts/seedEmbeddings.js
 */
import mongoose from "mongoose";
import "dotenv/config";
import Product from "../models/Product.js";
import "../models/Category.js";
import "../models/Brand.js";
import { buildTextForProduct, getEmbedding } from "../services/embeddingService.js";
import { config } from "../config.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

async function seedEmbeddings() {
  if (!config.openaiApiKey) {
    console.log("OPENAI_API_KEY not set. Add it to .env and try again.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const products = await Product.find({})
    .select("+embedding")
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .lean();

  if (products.length === 0) {
    console.log("No products in DB. Run seed:db first.");
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  console.log("Seeding embeddings for", products.length, "products...");
  let updated = 0;
  let failed = 0;

  let firstFailureText = null;
  for (const product of products) {
    const text = buildTextForProduct(product);
    const embedding = await getEmbedding(text);
    if (embedding) {
      await Product.updateOne({ _id: product._id }, { $set: { embedding } });
      updated++;
    } else {
      failed++;
      if (firstFailureText === null) firstFailureText = text;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("Done. Updated:", updated, "Failed:", failed);
  if (failed > 0) {
    console.error("Check errors above. If all failed: verify OPENAI_API_KEY in .env and that the key is valid.");
    if (firstFailureText) console.error("Example text sent for first product:", firstFailureText.slice(0, 120) + "...");
  }
  await mongoose.disconnect();
  process.exit(0);
}

seedEmbeddings().catch((err) => {
  console.error(err);
  process.exit(1);
});
