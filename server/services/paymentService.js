import crypto from "crypto";
import { config } from "../config.js";
import { AppError } from "../utils/AppError.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

const ESEWA_FORM_URL =
  config.esewa.env === "production"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const ESEWA_STATUS_BASE =
  config.esewa.env === "production"
    ? "https://esewa.com.np/api/epay/transaction/status/"
    : "https://rc.esewa.com.np/api/epay/transaction/status/";

const KHALTI_API_BASE =
  config.khalti.env === "production" ? "https://khalti.com/api/v2" : "https://dev.khalti.com/api/v2";

function esewaHmacBase64(secret, signedFieldNames, fieldMap) {
  const names = signedFieldNames.split(",");
  const message = names.map((name) => `${name}=${fieldMap[name]}`).join(",");
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

function formatEsewaAmount(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return "0";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
}

function assertGatewayConfigured(gateway) {
  if (gateway === "esewa") {
    if (!config.esewa.productCode || !config.esewa.secretKey) {
      throw new AppError("eSewa payment is not configured on the server", 503);
    }
  }
  if (gateway === "khalti") {
    if (!config.khalti.secretKey) {
      throw new AppError("Khalti payment is not configured on the server", 503);
    }
  }
}

async function loadPayableOrder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, buyer: userId });
  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentStatus === "paid") throw new AppError("Order is already paid", 400);
  if (order.paymentStatus !== "pending") {
    throw new AppError("Order is not awaiting payment", 400);
  }
  return order;
}

export async function initiateEsewa(userId, orderId) {
  assertGatewayConfigured("esewa");
  const order = await loadPayableOrder(userId, orderId);

  const amount = formatEsewaAmount(order.subtotal);
  const taxAmount = "0";
  const serviceCharge = "0";
  const deliveryCharge = "0";
  const totalAmount = formatEsewaAmount(
    Number(amount) + Number(taxAmount) + Number(serviceCharge) + Number(deliveryCharge)
  );

  const transactionUuid = `${order._id.toString()}-${crypto.randomUUID()}`;
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signPayload = {
    total_amount: String(totalAmount),
    transaction_uuid: String(transactionUuid),
    product_code: String(config.esewa.productCode),
  };
  const signature = esewaHmacBase64(config.esewa.secretKey, signedFieldNames, signPayload);

  const payment = await Payment.create({
    order: order._id,
    user: userId,
    gateway: "esewa",
    amountNpr: order.subtotal,
    esewaTotalAmountStr: totalAmount,
    status: "initiated",
    transactionUuid,
  });

  const successPath = "/payment/esewa/return";
  const failurePath = "/payment/esewa/failure";
  const successUrl = `${config.clientAppUrl}${successPath}`;
  const failureUrl = `${config.clientAppUrl}${failurePath}`;

  return {
    paymentId: payment._id.toString(),
    formUrl: ESEWA_FORM_URL,
    fields: {
      amount: String(amount),
      tax_amount: String(taxAmount),
      total_amount: signPayload.total_amount,
      transaction_uuid: signPayload.transaction_uuid,
      product_code: signPayload.product_code,
      product_service_charge: String(serviceCharge),
      product_delivery_charge: String(deliveryCharge),
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    },
  };
}

async function esewaStatusCheck(transactionUuid, totalAmountStr) {
  const url = new URL(ESEWA_STATUS_BASE);
  url.searchParams.set("product_code", config.esewa.productCode);
  url.searchParams.set("total_amount", totalAmountStr);
  url.searchParams.set("transaction_uuid", transactionUuid);
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data;
}

function verifyEsewaResponseSignature(payload, secret) {
  const signedNames = payload.signed_field_names;
  if (!signedNames || typeof signedNames !== "string") return false;
  const names = signedNames.split(",");
  const map = {};
  for (const name of names) {
    const v = payload[name];
    if (v === undefined || v === null) map[name] = "";
    else if (typeof v === "number") map[name] = Number.isInteger(v) ? String(v) : String(v);
    else map[name] = String(v);
  }
  const expected = esewaHmacBase64(secret, signedNames, map);
  return expected === payload.signature;
}

async function completeOrderPayment(order, gateway, gatewayTransactionId) {
  await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "pending" },
    {
      $set: {
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentGateway: gateway,
        status: "confirmed",
      },
    }
  );
}

export async function verifyEsewaFromBase64(userId, base64Payload) {
  assertGatewayConfigured("esewa");
  if (!base64Payload || typeof base64Payload !== "string") {
    throw new AppError("Missing payment response", 400);
  }
  let json;
  try {
    const decoded = Buffer.from(base64Payload, "base64").toString("utf8");
    json = JSON.parse(decoded);
  } catch {
    throw new AppError("Invalid payment response payload", 400);
  }

  if (!verifyEsewaResponseSignature(json, config.esewa.secretKey)) {
    throw new AppError("Invalid eSewa signature", 400);
  }

  if (json.status !== "COMPLETE") {
    throw new AppError(`Payment not completed (status: ${json.status})`, 400);
  }

  const transactionUuid = json.transaction_uuid;
  const payment = await Payment.findOne({
    user: userId,
    gateway: "esewa",
    transactionUuid,
  }).sort({ createdAt: -1 });

  if (!payment) throw new AppError("Payment session not found", 404);

  const order = await Order.findById(payment.order);
  if (!order || order.buyer.toString() !== userId.toString()) {
    throw new AppError("Order not found", 404);
  }

  if (payment.status === "completed" && order.paymentStatus === "paid") {
    return { orderId: order._id.toString(), status: "paid" };
  }

  const expectedTotal = payment.esewaTotalAmountStr;
  const receivedNum = Number(json.total_amount);
  const expectedNum = Number(expectedTotal);
  const amountOk =
    formatEsewaAmount(json.total_amount) === expectedTotal ||
    String(json.total_amount) === expectedTotal ||
    (Number.isFinite(receivedNum) &&
      Number.isFinite(expectedNum) &&
      Math.abs(receivedNum - expectedNum) < 0.01);

  if (!amountOk) {
    const statusData = await esewaStatusCheck(transactionUuid, expectedTotal);
    if (!statusData || statusData.status !== "COMPLETE") {
      throw new AppError("Amount mismatch; payment could not be verified", 400);
    }
  }

  payment.status = "completed";
  payment.gatewayTransactionId = json.transaction_code || "";
  await payment.save();

  await completeOrderPayment(order, "esewa", payment.gatewayTransactionId);

  return { orderId: order._id.toString(), status: "paid" };
}

export async function initiateKhalti(userId, orderId) {
  assertGatewayConfigured("khalti");
  const order = await loadPayableOrder(userId, orderId);

  const amountPaisa = Math.round(Number(order.subtotal) * 100);
  if (amountPaisa < 1000) {
    throw new AppError("Order total must be at least NPR 10 for Khalti", 400);
  }

  const purchaseOrderId = `${order._id.toString()}-${crypto.randomUUID()}`;
  const returnUrl = `${config.clientAppUrl}/payment/khalti/return`;

  const payment = await Payment.create({
    order: order._id,
    user: userId,
    gateway: "khalti",
    amountNpr: order.subtotal,
    status: "initiated",
    purchaseOrderId,
  });

  const body = {
    return_url: returnUrl,
    website_url: config.clientAppUrl,
    amount: amountPaisa,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: `ReVogue order ${order._id.toString().slice(-6)}`,
  };

  const res = await fetch(`${KHALTI_API_BASE}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${config.khalti.secretKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    payment.status = "failed";
    payment.failureReason = JSON.stringify(data);
    await payment.save();
    throw new AppError(data.detail || data.error_key || "Khalti initiate failed", res.status || 502);
  }

  const pidx = data.pidx;
  const paymentUrl = data.payment_url;
  if (!pidx || !paymentUrl) {
    payment.status = "failed";
    payment.failureReason = "Missing pidx or payment_url";
    await payment.save();
    throw new AppError("Invalid Khalti response", 502);
  }

  payment.pidx = pidx;
  await payment.save();

  return { paymentId: payment._id.toString(), paymentUrl, pidx };
}

export async function verifyKhalti(userId, pidx) {
  assertGatewayConfigured("khalti");
  if (!pidx || typeof pidx !== "string") {
    throw new AppError("Missing pidx", 400);
  }

  const payment = await Payment.findOne({ user: userId, gateway: "khalti", pidx }).sort({
    createdAt: -1,
  });
  if (!payment) throw new AppError("Payment session not found", 404);

  if (payment.status === "completed") {
    const order = await Order.findById(payment.order);
    return { orderId: order?._id?.toString(), status: "already_completed" };
  }

  const res = await fetch(`${KHALTI_API_BASE}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${config.khalti.secretKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    payment.status = "failed";
    payment.failureReason = JSON.stringify(data);
    await payment.save();
    throw new AppError(data.detail || "Khalti lookup failed", res.status || 502);
  }

  if (data.status !== "Completed") {
    payment.status = "failed";
    payment.failureReason = `Status: ${data.status}`;
    await payment.save();
    throw new AppError(`Payment not completed (${data.status})`, 400);
  }

  const order = await Order.findById(payment.order);
  if (!order || order.buyer.toString() !== userId.toString()) {
    throw new AppError("Order not found", 404);
  }

  const expectedPaisa = Math.round(Number(order.subtotal) * 100);
  if (Number(data.total_amount) !== expectedPaisa) {
    throw new AppError("Amount mismatch", 400);
  }

  payment.status = "completed";
  payment.gatewayTransactionId = data.transaction_id || "";
  await payment.save();

  await completeOrderPayment(order, "khalti", payment.gatewayTransactionId);

  return { orderId: order._id.toString(), status: "paid" };
}

export async function listMyPayments(userId) {
  const payments = await Payment.find({ user: userId })
    .populate("order", "subtotal status paymentStatus createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return payments;
}
