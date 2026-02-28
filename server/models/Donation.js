import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    images: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["pending", "received", "disposed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
