import mongoose from "mongoose";
import { BRAND_VALIDATION } from "../constants/index.js";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, BRAND_VALIDATION.NAME_REQUIRED],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

brandSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

brandSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model("Brand", brandSchema);
