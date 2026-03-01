import * as productService from "../services/productService.js";
import * as aiStylistService from "../services/aiStylistService.js";

export async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req, res, next) {
  try {
    const { tier, section, limit, page, search, q } = req.query;
    const searchParam = search || q;
    const result = await productService.getProducts({
      tier: tier || undefined,
      section: section || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      search: searchParam || undefined,
    });
    if (typeof result === "object" && result.products) {
      res.json(result);
    } else {
      res.json({ products: result });
    }
  } catch (err) {
    next(err);
  }
}

export async function getGoesWith(req, res, next) {
  try {
    let productIds = req.query.productIds;
    if (typeof productIds === "string") productIds = productIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (!Array.isArray(productIds)) productIds = [];
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const result = await aiStylistService.getGoesWithProducts(productIds, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
