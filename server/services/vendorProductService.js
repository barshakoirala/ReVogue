import Product from "../models/Product.js";
import {
  STATUS_ACTIVE,
  TIER_LUXURY,
  TIER_NORMAL,
} from "../constants/product.js";

export async function getVendorProducts(sellerId) {
  return Product.find({ seller: sellerId })
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getVendorProductById(productId, sellerId) {
  const product = await Product.findOne({
    _id: productId,
    seller: sellerId,
  })
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .lean();
  return product;
}

const ECO_NUMERIC_FIELDS = [
  "carbonSavedKg",
  "waterSavedLiters",
  "wasteDivertedKg",
  "energySavedKwh",
  "landUseSavedSqm",
  "equivalentItemsAvoided",
  "microplasticsAvoidedG",
];

/** Reference "high impact" values per metric (one garment, second-hand). Used to normalize each to 0–1. */
const ECO_REFERENCE = {
  carbonSavedKg: 12,
  waterSavedLiters: 2500,
  wasteDivertedKg: 1,
  energySavedKwh: 20,
  landUseSavedSqm: 4,
  equivalentItemsAvoided: 1,
  microplasticsAvoidedG: 1.5,
};

/**
 * Compute eco score 0–1 from ecoSustainability.
 * Each present metric is normalized to 0–1 (value / reference, capped at 1); recycledContentPercent is value/100.
 * Score = average of those sub-scores. If no metrics, returns undefined.
 */
export function computeEcoScore(ecoSustainability) {
  if (!ecoSustainability || typeof ecoSustainability !== "object") return undefined;
  const scores = [];
  for (const [key, ref] of Object.entries(ECO_REFERENCE)) {
    const v = ecoSustainability[key];
    if (v != null && !Number.isNaN(Number(v)))
      scores.push(Math.min(1, Math.max(0, Number(v)) / ref));
  }
  if (
    ecoSustainability.recycledContentPercent != null &&
    !Number.isNaN(Number(ecoSustainability.recycledContentPercent))
  ) {
    const v = Math.min(100, Math.max(0, Number(ecoSustainability.recycledContentPercent)));
    scores.push(v / 100);
  }
  if (scores.length === 0) return undefined;
  const raw = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(raw * 100) / 100;
}

function buildEcoPayload(eco) {
  if (!eco || typeof eco !== "object") return undefined;
  const out = {};
  for (const field of ECO_NUMERIC_FIELDS) {
    if (eco[field] != null && !Number.isNaN(Number(eco[field])))
      out[field] = Math.max(0, Number(eco[field]));
  }
  if (eco.recycledContentPercent != null && !Number.isNaN(Number(eco.recycledContentPercent))) {
    const v = Number(eco.recycledContentPercent);
    out.recycledContentPercent = Math.min(100, Math.max(0, v));
  }
  if (eco.notes != null && typeof eco.notes === "string" && eco.notes.trim())
    out.notes = eco.notes.trim();
  return Object.keys(out).length === 0 ? undefined : out;
}

const CREATABLE_FIELDS = [
  "title",
  "description",
  "price",
  "category",
  "subcategory",
  "condition",
  "size",
  "brand",
  "tier",
  "trending",
  "images",
  "ecoSustainability",
];

export async function createProduct(sellerId, data) {
  const payload = { seller: sellerId, status: STATUS_ACTIVE };
  for (const key of CREATABLE_FIELDS) {
    if (data[key] !== undefined) {
      if (key === "tier") {
        payload[key] = data[key] === TIER_LUXURY ? TIER_LUXURY : TIER_NORMAL;
      } else if (key === "trending") {
        payload[key] = !!data[key];
      } else if (key === "images") {
        payload[key] = Array.isArray(data[key]) ? data[key] : [];
      } else if (key === "ecoSustainability") {
        payload[key] = buildEcoPayload(data[key]);
        payload.ecoScore = computeEcoScore(payload[key]);
      } else {
        payload[key] = data[key];
      }
    }
  }
  const product = await Product.create(payload);
  return product.toObject();
}

const UPDATABLE_FIELDS = [
  "title",
  "description",
  "price",
  "category",
  "subcategory",
  "condition",
  "size",
  "brand",
  "tier",
  "trending",
  "images",
  "ecoSustainability",
  "status",
];

export async function updateProduct(productId, sellerId, data) {
  const payload = {};
  for (const key of UPDATABLE_FIELDS) {
    if (data[key] !== undefined) {
      if (key === "tier") {
        payload[key] = data[key] === TIER_LUXURY ? TIER_LUXURY : TIER_NORMAL;
      } else if (key === "trending") {
        payload[key] = data[key] === true || data[key] === "true";
      } else if (key === "ecoSustainability") {
        payload[key] = buildEcoPayload(data[key]) ?? undefined;
        payload.ecoScore = payload[key] ? computeEcoScore(payload[key]) : undefined;
      } else {
        payload[key] = data[key];
      }
    }
  }
  const product = await Product.findOneAndUpdate(
    { _id: productId, seller: sellerId },
    payload,
    { new: true, runValidators: true }
  );
  return product?.toObject() || null;
}

export async function deleteProduct(productId, sellerId) {
  const result = await Product.deleteOne({
    _id: productId,
    seller: sellerId,
  });
  return result.deletedCount === 1;
}

// Admin versions — no seller restriction
export async function updateProductAdmin(productId, data) {
  const payload = {};
  for (const key of UPDATABLE_FIELDS) {
    if (data[key] !== undefined) {
      if (key === "tier") {
        payload[key] = data[key] === TIER_LUXURY ? TIER_LUXURY : TIER_NORMAL;
      } else if (key === "trending") {
        payload[key] = data[key] === true || data[key] === "true";
      } else if (key === "ecoSustainability") {
        payload[key] = buildEcoPayload(data[key]) ?? undefined;
        payload.ecoScore = payload[key] ? computeEcoScore(payload[key]) : undefined;
      } else {
        payload[key] = data[key];
      }
    }
  }
  const product = await Product.findByIdAndUpdate(productId, payload, { new: true, runValidators: true });
  return product?.toObject() || null;
}

export async function deleteProductAdmin(productId) {
  const result = await Product.deleteOne({ _id: productId });
  return result.deletedCount === 1;
}
