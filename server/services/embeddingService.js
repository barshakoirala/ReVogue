import { config } from "../config.js";
import Product from "../models/Product.js";
import "../models/Category.js";
import "../models/Brand.js";

const OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";

/**
 * Build a single text string from a product for embedding (populated or with category/subcategory/brand names).
 * @param {{ title?: string, description?: string, category?: { name?: string }, subcategory?: { name?: string }, brand?: { name?: string }, condition?: string, tier?: string }} product
 * @returns {string}
 */
export function buildTextForProduct(product) {
  const parts = [];
  if (product.title) parts.push(product.title);
  if (product.description) parts.push(product.description);
  if (product.category?.name) parts.push(product.category.name);
  if (product.subcategory?.name) parts.push(product.subcategory.name);
  if (product.brand?.name) parts.push(product.brand.name);
  if (product.condition) parts.push(product.condition);
  if (product.tier) parts.push(product.tier);
  return parts.filter(Boolean).join(". ");
}

/**
 * Call OpenAI embeddings API. Returns vector or null if no key / error.
 * @param {string} text
 * @returns {Promise<number[] | null>}
 */
export async function getEmbedding(text) {
  if (!config.openaiApiKey || !text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const res = await fetch(OPENAI_EMBEDDING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({ input: trimmed.slice(0, 8000), model: MODEL }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[embedding] OpenAI API error:", res.status, body);
      return null;
    }
    const data = await res.json();
    const vec = data?.data?.[0]?.embedding;
    return Array.isArray(vec) ? vec : null;
  } catch (err) {
    console.error("[embedding] Request failed:", err.message);
    return null;
  }
}

/**
 * Fetch product (with category, subcategory, brand), build text, get embedding, save. No-op if no key.
 * @param {string} productId
 * @returns {Promise<boolean>} true if embedding was saved
 */
export async function updateProductEmbedding(productId) {
  if (!config.openaiApiKey) return false;
  const product = await Product.findById(productId)
    .select("+embedding")
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .lean();
  if (!product) return false;
  const text = buildTextForProduct(product);
  const embedding = await getEmbedding(text);
  if (!embedding) return false;
  await Product.updateOne(
    { _id: productId },
    { $set: { embedding } }
  );
  return true;
}

/**
 * Schedule embedding update in background (e.g. after product create/update). No-op if no key.
 * @param {string} productId
 */
export function scheduleEmbeddingUpdate(productId) {
  if (!config.openaiApiKey) return;
  setImmediate(() => {
    updateProductEmbedding(productId).catch(() => {});
  });
}

/**
 * Cosine similarity between two vectors (same length). Returns -1 to 1.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0)
    return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Average of multiple vectors (same length). Returns null if empty or length mismatch.
 * @param {number[][]} vectors
 * @returns {number[] | null}
 */
export function averageVectors(vectors) {
  if (!Array.isArray(vectors) || vectors.length === 0) return null;
  const len = vectors[0].length;
  const out = new Array(len).fill(0);
  for (const v of vectors) {
    if (!Array.isArray(v) || v.length !== len) return null;
    for (let i = 0; i < len; i++) out[i] += v[i];
  }
  for (let i = 0; i < len; i++) out[i] /= vectors.length;
  return out;
}
