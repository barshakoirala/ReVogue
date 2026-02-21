import * as productService from "../services/productService.js";

export async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProductsForAdmin();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}
