import Product from "../models/Product.js";
import "../models/Category.js";
import "../models/Brand.js";
import { computeEcoScore } from "./vendorProductService.js";
import {
  STATUS_ACTIVE,
  TIER_LUXURY,
  TIER_NORMAL,
  PRODUCT_SECTION,
  NEW_PRODUCT_DAYS,
  HOME_SECTION_LIMIT,
  BROWSE_PAGE_SIZE,
} from "../constants/product.js";

export async function getProductById(id) {
  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .lean();
  if (product && product.ecoScore == null && product.ecoSustainability)
    product.ecoScore = computeEcoScore(product.ecoSustainability);
  return product;
}

export async function getProducts({ tier, section, limit = HOME_SECTION_LIMIT, page }) {
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

  const usePagination = page != null && page >= 1;
  const limitVal = usePagination ? (limit || BROWSE_PAGE_SIZE) : (limit || HOME_SECTION_LIMIT);
  const skip = usePagination ? (page - 1) * limitVal : 0;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitVal)
      .lean(),
    usePagination ? Product.countDocuments(filter) : null,
  ]);

  if (usePagination) {
    return {
      products,
      total,
      page: page,
      limit: limitVal,
      totalPages: Math.ceil(total / limitVal),
    };
  }

  return products;
}

export async function getAllProductsForAdmin(limit = 200) {
  return Product.find({})
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .populate("seller", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
