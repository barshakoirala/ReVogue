import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gateway: { type: String, enum: ["esewa", "khalti"], required: true },
    amountNpr: { type: Number, required: true, min: 0 },
    /** Exact total_amount string sent to eSewa (for verification / status check). */
    esewaTotalAmountStr: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["initiated", "completed", "failed"],
      default: "initiated",
    },
    transactionUuid: { type: String, trim: true, default: "" },
    purchaseOrderId: { type: String, trim: true, default: "" },
    pidx: { type: String, trim: true, default: "" },
    gatewayTransactionId: { type: String, trim: true, default: "" },
    failureReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
