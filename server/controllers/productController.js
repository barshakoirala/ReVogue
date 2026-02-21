import * as productService from "../services/productService.js";

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
    const { tier, section, limit, page } = req.query;
    const result = await productService.getProducts({
      tier: tier || undefined,
      section: section || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
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
