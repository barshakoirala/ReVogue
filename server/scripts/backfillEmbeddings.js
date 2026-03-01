/**
 * Backfill embedding for all products (text-only, OpenAI).
 * Run once after adding OPENAI_API_KEY, or to refresh embeddings.
 * Usage: node server/scripts/backfillEmbeddings.js
 *
 * Requires: OPENAI_API_KEY in env (or .env)
 */
import mongoose from "mongoose";
import "dotenv/config";
import Product from "../models/Product.js";
import "../models/Category.js";
import "../models/Brand.js";
import { buildTextForProduct, getEmbedding } from "../services/embeddingService.js";
import { config } from "../config.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

async function backfillEmbeddings() {
  if (!config.openaiApiKey) {
    console.log("OPENAI_API_KEY not set. Skip backfill.");
    process.exit(0);
    return;
  }

  await mongoose.connect(MONGO_URI);

  const products = await Product.find({})
    .select("+embedding")
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .lean();

  let updated = 0;
  let failed = 0;

  for (const product of products) {
    const text = buildTextForProduct(product);
    const embedding = await getEmbedding(text);
    if (embedding) {
      await Product.updateOne({ _id: product._id }, { $set: { embedding } });
      updated++;
    } else {
      failed++;
    }
    // Avoid rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("Backfill done. Updated:", updated, "Failed:", failed);
  await mongoose.disconnect();
  process.exit(0);
}

backfillEmbeddings().catch((err) => {
  console.error(err);
  process.exit(1);
});
