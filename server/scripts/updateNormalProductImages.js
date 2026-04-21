import mongoose from "mongoose";
import "dotenv/config";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import { buildProductKeywords, detectProductImageType, resolveProductImages } from "./utils/productImageResolver.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";
void Category;
void Brand;

function parseArgs(argv) {
  const args = { dryRun: false, force: false, limit: null };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    if (arg === "--force") args.force = true;
    if (arg.startsWith("--limit=")) {
      const n = Number(arg.split("=")[1]);
      if (Number.isFinite(n) && n > 0) args.limit = Math.floor(n);
    }
  }
  return args;
}

function hasLikelyMatchingImage(product) {
  if (!Array.isArray(product.images) || product.images.length === 0) return false;
  const type = detectProductImageType(product);
  const joined = product.images.join(" ").toLowerCase();
  if (type === "bag") return /(bag|handbag|purse|tote|satchel|wallet)/.test(joined);
  if (type === "shoes") return /(shoe|sneaker|boot|loafer|heel|sandal)/.test(joined);
  if (type === "watch") return /(watch|timepiece|clock)/.test(joined);
  if (type === "jewelry") return /(jewel|ring|bracelet|earring|necklace|pendant)/.test(joined);
  return /(fashion|outfit|dress|jacket|coat|top|trouser|skirt)/.test(joined);
}

async function updateNormalProductImages() {
  const args = parseArgs(process.argv.slice(2));
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  console.log(`Mode: ${args.dryRun ? "DRY RUN" : "LIVE"}${args.force ? " (force enabled)" : ""}`);

  const query = Product.find({ tier: "normal" })
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .sort({ createdAt: 1 });

  if (args.limit) query.limit(args.limit);

  const products = await query;
  console.log(`Loaded ${products.length} normal products`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const samples = [];

  for (const [idx, product] of products.entries()) {
    console.log(`Processing ${idx + 1}/${products.length}: ${product.title}`);
    const payload = {
      title: product.title,
      brand: product.brand?.name || "",
      categoryName: product.category?.name || "",
      subcategoryName: product.subcategory?.name || "",
    };

    if (!args.force && hasLikelyMatchingImage(product)) {
      skipped += 1;
      continue;
    }

    try {
      const nextImages = await resolveProductImages(payload, {
        index: idx,
        timeoutMs: 2500,
        retries: 0,
        delayMs: 40,
      });
      if (!Array.isArray(nextImages) || nextImages.length === 0) {
        failed += 1;
        continue;
      }

      if (samples.length < 5) {
        samples.push({
          title: product.title,
          type: detectProductImageType(payload),
          keywords: buildProductKeywords(payload).join(", "),
          before: product.images?.[0] || "<none>",
          after: nextImages[0],
        });
      }

      if (!args.dryRun) {
        product.images = nextImages;
        await product.save();
      }
      updated += 1;
    } catch (err) {
      failed += 1;
      console.warn(`Failed image update for "${product.title}": ${err.message}`);
    }
  }

  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (samples.length) {
    console.log("Sample changes:");
    for (const s of samples) {
      console.log(`- ${s.title}`);
      console.log(`  type: ${s.type}`);
      console.log(`  keywords: ${s.keywords}`);
      console.log(`  before: ${s.before}`);
      console.log(`  after:  ${s.after}`);
    }
  }
}

updateNormalProductImages()
  .catch((err) => {
    console.error("Image update failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
