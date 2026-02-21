import Product from "../models/Product.js";
import "../models/Category.js";
import "../models/Brand.js";
import {
  STATUS_ACTIVE,
  TIER_LUXURY,
  TIER_NORMAL,
  PRODUCT_SORT,
  PRODUCT_SECTION,
  NEW_PRODUCT_DAYS,
} from "../constants/product.js";

export async function getProductById(id) {
  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .lean();
  return product;
}

export async function getProducts({ tier, section, limit = 50 }) {
  const filter = { status: STATUS_ACTIVE };
  if (tier === TIER_LUXURY || tier === TIER_NORMAL) {
    filter.tier = tier;
  }

  if (section === PRODUCT_SECTION.TRENDING) {
    filter.trending = true;
  } else if (section === PRODUCT_SECTION.NEW) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - NEW_PRODUCT_DAYS);
    filter.createdAt = { $gte: cutoff };
  } else if (section === PRODUCT_SECTION.OTHERS) {
    filter.trending = { $ne: true };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - NEW_PRODUCT_DAYS);
    filter.createdAt = { $lt: cutoff };
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products;
}
