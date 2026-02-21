import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { AppError } from "../utils/AppError.js";

export async function createOrderFromCart(userId, shippingAddress) {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || !cart.items?.length) {
    throw new AppError("Cart is empty", 400);
  }

  const items = [];
  let subtotal = 0;

  for (const ci of cart.items) {
    const product = ci.product;
    if (!product || product.status !== "active") {
      throw new AppError(`Product ${product?._id || "unknown"} is no longer available`, 400);
    }
    if (product.seller.toString() === userId.toString()) {
      throw new AppError("Cannot order your own product", 400);
    }
    const price = product.price;
    const lineTotal = price * ci.quantity;
    subtotal += lineTotal;
    items.push({ product: product._id, quantity: ci.quantity, price });
  }

  const order = await Order.create({
    buyer: userId,
    items,
    shippingAddress,
    subtotal,
    status: "pending",
  });

  cart.items = [];
  await cart.save();

  return order.toObject();
}

export async function getMyOrders(userId) {
  const orders = await Order.find({ buyer: userId })
    .populate({
      path: "items.product",
      select: "title images",
      populate: { path: "brand", select: "name" },
    })
    .sort({ createdAt: -1 })
    .lean();
  return orders;
}
