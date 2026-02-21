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
