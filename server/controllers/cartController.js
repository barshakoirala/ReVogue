import * as cartService from "../services/cartService.js";

export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.json(cart || { items: [] });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, { productId, quantity: quantity || 1 });
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user._id, req.params.productId, quantity);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}
