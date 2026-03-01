import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import "../models/Brand.js";
import { STATUS_ACTIVE } from "../constants/product.js";
import {
  OUTFIT_SLOTS,
  ALL_SLOTS,
  DEFAULT_OUTFIT_COUNT,
  MAX_OUTFIT_ITEMS,
} from "../constants/aiStylist.js";
import { computeEcoScore } from "./vendorProductService.js";
import {
  cosineSimilarity,
  averageVectors,
} from "./embeddingService.js";

/** Slot -> list of category (subcategory) IDs that have this outfitSlot in DB. */
async function getSlotToSubcategoryIds() {
  const cats = await Category.find({ outfitSlot: { $in: ALL_SLOTS } }).select("_id outfitSlot").lean();
  const slotToIds = {};
  for (const c of cats) {
    if (!slotToIds[c.outfitSlot]) slotToIds[c.outfitSlot] = [];
    slotToIds[c.outfitSlot].push(c._id);
  }
  return slotToIds;
}

/** Pick one random product for a slot (optional tier filter). */
async function pickOneForSlot(slot, subcategoryIds, tier) {
  if (!subcategoryIds?.length) return null;
  const filter = {
    status: STATUS_ACTIVE,
    subcategory: { $in: subcategoryIds },
  };
  if (tier === "luxury" || tier === "normal") filter.tier = tier;

  const products = await Product.aggregate([
    { $match: filter },
    { $sample: { size: 1 } },
    {
      $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" },
    },
    { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    {
      $lookup: { from: "categories", localField: "subcategory", foreignField: "_id", as: "subcat" },
    },
    { $unwind: { path: "$subcat", preserveNullAndEmptyArrays: true } },
    {
      $lookup: { from: "brands", localField: "brand", foreignField: "_id", as: "brandDoc" },
    },
    { $unwind: { path: "$brandDoc", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        price: 1,
        condition: 1,
        size: 1,
        tier: 1,
        images: 1,
        ecoSustainability: 1,
        ecoScore: 1,
        "category.name": "$cat.name",
        "subcategory.name": "$subcat.name",
        "brand.name": "$brandDoc.name",
      },
    },
  ]);

  let product = products[0] ? products[0] : null;
  if (product && product.ecoScore == null && product.ecoSustainability)
    product.ecoScore = computeEcoScore(product.ecoSustainability);
  return product;
}

/**
 * Generate outfit suggestions (rule-based): combines one item per slot from the catalog.
 * @param {Object} options
 * @param {string} [options.tier] - 'luxury' | 'normal' to filter by tier
 * @param {number} [options.count] - number of outfits to return (default 3)
 * @returns {Promise<{ outfits: Array<{ items: Array, slotOrder: Array, label: string }> }>}
 */
export async function getOutfitSuggestions({ tier, count = DEFAULT_OUTFIT_COUNT } = {}) {
  const slotToIds = await getSlotToSubcategoryIds();
  const outfits = [];
  const slotOrder = [
    OUTFIT_SLOTS.TOP,
    OUTFIT_SLOTS.BOTTOM,
    OUTFIT_SLOTS.OUTERWEAR,
    OUTFIT_SLOTS.SHOES,
    OUTFIT_SLOTS.ACCESSORY,
  ];

  for (let i = 0; i < count; i++) {
    const items = [];
    const slotsUsed = [];

    for (const slot of slotOrder) {
      const ids = slotToIds[slot];
      if (!ids?.length) continue;
      const product = await pickOneForSlot(slot, ids, tier);
      if (product) {
        items.push({ ...product, slot });
        slotsUsed.push(slot);
      }
    }

    if (items.length < 2) continue; // at least top + bottom or similar
    outfits.push({
      items: items.slice(0, MAX_OUTFIT_ITEMS),
      slotOrder: slotsUsed,
      label: getOutfitLabel(slotsUsed),
    });
  }

  return { outfits };
}

function getOutfitLabel(slotsUsed) {
  const hasDress = slotsUsed.includes(OUTFIT_SLOTS.ONEPIECE);
  const hasOuterwear = slotsUsed.includes(OUTFIT_SLOTS.OUTERWEAR);
  const hasAccessory = slotsUsed.includes(OUTFIT_SLOTS.ACCESSORY);
  if (hasDress && hasAccessory) return "Dress & accessories";
  if (hasOuterwear && hasAccessory) return "Layered look";
  if (hasOuterwear) return "Cozy layered outfit";
  if (hasAccessory) return "Complete look";
  return "Curated outfit";
}

const COMPLEMENTARY_SLOTS = ALL_SLOTS;

/**
 * Get products that "go with" the given product IDs (complementary slots).
 * @param {string[]} productIds - IDs of products from search/results
 * @param {number} limit - max products to return (default 8)
 * @returns {Promise<{ products: Array }>}
 */
export async function getGoesWithProducts(productIds, limit = 8) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { products: [] };
  }
  const ids = productIds.slice(0, 10).filter((id) => id && typeof id === "string");
  if (ids.length === 0) return { products: [] };

  const anchorProducts = await Product.find({
    _id: { $in: ids },
    status: STATUS_ACTIVE,
  })
    .select("+embedding")
    .populate("subcategory", "name outfitSlot")
    .lean();

  const slotsPresent = new Set();
  const anchorEmbeddings = [];
  for (const p of anchorProducts) {
    const slot = p.subcategory?.outfitSlot;
    if (slot) slotsPresent.add(slot);
    if (Array.isArray(p.embedding) && p.embedding.length > 0) anchorEmbeddings.push(p.embedding);
  }

  let complementarySlots = COMPLEMENTARY_SLOTS.filter((s) => !slotsPresent.has(s));
  if (complementarySlots.length === 0) {
    complementarySlots = [
      OUTFIT_SLOTS.ACCESSORY,
      OUTFIT_SLOTS.SHOES,
      OUTFIT_SLOTS.OUTERWEAR,
    ];
  }

  const slotToIds = await getSlotToSubcategoryIds();
  const allComplementarySubIds = complementarySlots.flatMap((slot) => slotToIds[slot] || []);
  const excludeIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));

  // Embedding path: rank by text similarity when we have embeddings
  if (anchorEmbeddings.length > 0 && allComplementarySubIds.length > 0) {
    const candidates = await Product.find({
      status: STATUS_ACTIVE,
      subcategory: { $in: allComplementarySubIds },
      _id: { $nin: excludeIds },
      embedding: { $exists: true, $type: "array" },
    })
      .select("+embedding")
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .limit(100)
      .lean();

    const candidatesWithEmbedding = candidates.filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0);
    if (candidatesWithEmbedding.length > 0) {
      const avgAnchor = averageVectors(anchorEmbeddings);
      if (avgAnchor) {
        const scored = candidatesWithEmbedding.map((c) => ({
          product: c,
          score: cosineSimilarity(avgAnchor, c.embedding),
        }));
        scored.sort((a, b) => b.score - a.score);
        const result = scored.slice(0, limit).map(({ product }) => {
          const p = { ...product };
          delete p.embedding;
          if (p.ecoScore == null && p.ecoSustainability)
            p.ecoScore = computeEcoScore(p.ecoSustainability);
          return p;
        });
        return { products: result };
      }
    }
  }

  // Fallback: random sample per slot (original behavior)
  const seen = new Set(ids);
  const result = [];
  const perSlot = Math.max(2, Math.ceil(limit / complementarySlots.length));

  for (const slot of complementarySlots) {
    const subIds = slotToIds[slot];
    if (!subIds?.length) continue;
    const filter = {
      status: STATUS_ACTIVE,
      subcategory: { $in: subIds },
      _id: { $nin: excludeIds },
    };
    const sampled = await Product.aggregate([
      { $match: filter },
      { $sample: { size: perSlot } },
      {
        $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" },
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: "categories", localField: "subcategory", foreignField: "_id", as: "subcat" },
      },
      { $unwind: { path: "$subcat", preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: "brands", localField: "brand", foreignField: "_id", as: "brandDoc" },
      },
      { $unwind: { path: "$brandDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          condition: 1,
          size: 1,
          tier: 1,
          images: 1,
          ecoSustainability: 1,
          ecoScore: 1,
          "category.name": "$cat.name",
          "subcategory.name": "$subcat.name",
          "brand.name": "$brandDoc.name",
        },
      },
    ]);
    for (const p of sampled) {
      if (result.length >= limit) break;
      const idStr = p._id.toString();
      if (seen.has(idStr)) continue;
      seen.add(idStr);
      if (p.ecoScore == null && p.ecoSustainability)
        p.ecoScore = computeEcoScore(p.ecoSustainability);
      result.push(p);
    }
  }

  return { products: result };
}
