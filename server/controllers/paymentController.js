import mongoose from "mongoose";
import * as paymentService from "../services/paymentService.js";
import { AppError } from "../utils/AppError.js";

function assertObjectId(id, label = "id") {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

export async function initiateEsewa(req, res, next) {
  try {
    const { orderId } = req.body || {};
    assertObjectId(orderId, "orderId");
    const result = await paymentService.initiateEsewa(req.user._id, orderId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyEsewa(req, res, next) {
  try {
    const data = req.body?.data ?? req.body?.payload;
    const result = await paymentService.verifyEsewaFromBase64(req.user._id, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function initiateKhalti(req, res, next) {
  try {
    const { orderId } = req.body || {};
    assertObjectId(orderId, "orderId");
    const result = await paymentService.initiateKhalti(req.user._id, orderId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyKhalti(req, res, next) {
  try {
    const { pidx } = req.body || {};
    const result = await paymentService.verifyKhalti(req.user._id, pidx);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMyPayments(req, res, next) {
  try {
    const payments = await paymentService.listMyPayments(req.user._id);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}
