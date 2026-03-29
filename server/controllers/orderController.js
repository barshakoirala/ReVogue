import mongoose from "mongoose";
import * as orderService from "../services/orderService.js";
import { AppError } from "../utils/AppError.js";

export async function getMyOrderById(req, res, next) {
  try {
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid order id", 400);
    }
    const order = await orderService.getMyOrderById(req.user._id, orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function checkout(req, res, next) {
  try {
    const order = await orderService.createOrderFromCart(req.user._id, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getMyOrders(req.user._id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}
