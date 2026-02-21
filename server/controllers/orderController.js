import * as orderService from "../services/orderService.js";

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
