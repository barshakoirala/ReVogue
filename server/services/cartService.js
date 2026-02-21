import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export async function getCart(userId) {
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "title price images condition",
      populate: { path: "brand", select: "name" },
    })
    .lean();
  return cart;
}

export async function addToCart(userId, { productId, quantity = 1 }) {
  const product = await Product.findById(productId);
  if (!product || product.status !== "active") {
    throw new Error("Product not found or unavailable");
  }
  if (product.seller.toString() === userId.toString()) {
    throw new Error("Cannot add your own product to cart");
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  return getCart(userId);
}

export async function updateCartItem(userId, productId, quantity) {
  if (quantity < 1) {
    return removeFromCart(userId, productId);
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return getCart(userId);
  item.quantity = quantity;
  await cart.save();
  return getCart(userId);
}

export async function removeFromCart(userId, productId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  return getCart(userId);
}

export async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return;
  cart.items = [];
  await cart.save();
}
