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
    paymentStatus: "pending",
    status: "pending",
  });

  cart.items = [];
  await cart.save();

  return order.toObject();
}

export async function getMyOrderById(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, buyer: userId })
    .populate({
      path: "items.product",
      select: "title images",
      populate: { path: "brand", select: "name" },
    })
    .lean();
  return order;
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

export async function getMyEcoStats(userId) {
  const orders = await Order.find({ buyer: userId, paymentStatus: "paid" })
    .populate({
      path: "items.product",
      select: "title images ecoSustainability ecoScore tier brand",
      populate: { path: "brand", select: "name" },
    })
    .lean();

  const totals = {
    carbonSavedKg: 0,
    waterSavedLiters: 0,
    wasteDivertedKg: 0,
    energySavedKwh: 0,
    microplasticsAvoidedG: 0,
    recycledContentPercent: 0,
    recycledCount: 0,
    itemsBought: 0,
    ordersCount: orders.length,
    avgEcoScore: 0,
    ecoScoreCount: 0,
  };

  const topItems = [];

  for (const order of orders) {
    for (const item of order.items) {
      const p = item.product;
      if (!p) continue;
      const qty = item.quantity || 1;
      totals.itemsBought += qty;

      const eco = p.ecoSustainability;
      if (eco) {
        if (eco.carbonSavedKg != null) totals.carbonSavedKg += eco.carbonSavedKg * qty;
        if (eco.waterSavedLiters != null) totals.waterSavedLiters += eco.waterSavedLiters * qty;
        if (eco.wasteDivertedKg != null) totals.wasteDivertedKg += eco.wasteDivertedKg * qty;
        if (eco.energySavedKwh != null) totals.energySavedKwh += eco.energySavedKwh * qty;
        if (eco.microplasticsAvoidedG != null) totals.microplasticsAvoidedG += eco.microplasticsAvoidedG * qty;
        if (eco.recycledContentPercent != null) {
          totals.recycledContentPercent += eco.recycledContentPercent;
          totals.recycledCount++;
        }
      }
      if (p.ecoScore != null) {
        totals.avgEcoScore += p.ecoScore;
        totals.ecoScoreCount++;
      }
      if (p.ecoScore != null && p.ecoScore > 0) {
        topItems.push({
          title: p.title,
          image: p.images?.[0] || null,
          brand: p.brand?.name || null,
          ecoScore: p.ecoScore,
          carbonSavedKg: p.ecoSustainability?.carbonSavedKg || 0,
        });
      }
    }
  }

  if (totals.ecoScoreCount > 0) {
    totals.avgEcoScore = Math.round((totals.avgEcoScore / totals.ecoScoreCount) * 100) / 100;
  }
  if (totals.recycledCount > 0) {
    totals.recycledContentPercent = Math.round(totals.recycledContentPercent / totals.recycledCount);
  }

  // Round all numbers
  totals.carbonSavedKg = Math.round(totals.carbonSavedKg * 10) / 10;
  totals.waterSavedLiters = Math.round(totals.waterSavedLiters);
  totals.wasteDivertedKg = Math.round(totals.wasteDivertedKg * 10) / 10;
  totals.energySavedKwh = Math.round(totals.energySavedKwh * 10) / 10;
  totals.microplasticsAvoidedG = Math.round(totals.microplasticsAvoidedG * 10) / 10;

  // Top 3 eco items
  topItems.sort((a, b) => b.ecoScore - a.ecoScore);
  const topEcoItems = topItems.slice(0, 3);

  // Eco level based on carbon saved
  let ecoLevel = "Newcomer";
  let ecoLevelNext = 5;
  if (totals.carbonSavedKg >= 100) { ecoLevel = "Eco Champion"; ecoLevelNext = null; }
  else if (totals.carbonSavedKg >= 50) { ecoLevel = "Green Hero"; ecoLevelNext = 100; }
  else if (totals.carbonSavedKg >= 20) { ecoLevel = "Eco Warrior"; ecoLevelNext = 50; }
  else if (totals.carbonSavedKg >= 5) { ecoLevel = "Conscious Buyer"; ecoLevelNext = 20; }

  return { totals, topEcoItems, ecoLevel, ecoLevelNext };
}
