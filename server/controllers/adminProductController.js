import * as productService from "../services/productService.js";
import * as vendorProductService from "../services/vendorProductService.js";
import { scheduleEmbeddingUpdate } from "../services/embeddingService.js";
import User from "../models/User.js";

export async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProductsForAdmin();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    // Admin creates products as themselves (seller = admin)
    const product = await vendorProductService.createProduct(req.user._id, req.body);
    scheduleEmbeddingUpdate(product._id.toString());
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    // Admin can update any product — bypass seller check
    const { id } = req.params;
    const product = await vendorProductService.updateProductAdmin(id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    scheduleEmbeddingUpdate(product._id.toString());
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await vendorProductService.deleteProductAdmin(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
