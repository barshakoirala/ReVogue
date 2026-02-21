import * as vendorProductService from "../services/vendorProductService.js";

export async function getMyProducts(req, res, next) {
  try {
    const products = await vendorProductService.getVendorProducts(req.user._id);
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getMyProduct(req, res, next) {
  try {
    const product = await vendorProductService.getVendorProductById(
      req.params.id,
      req.user._id
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await vendorProductService.createProduct(req.user._id, req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await vendorProductService.updateProduct(
      req.params.id,
      req.user._id,
      req.body
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const deleted = await vendorProductService.deleteProduct(
      req.params.id,
      req.user._id
    );
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
