import mongoose from "mongoose";
import { CATEGORY_VALIDATION } from "../constants/index.js";

const OUTFIT_SLOT_VALUES = ["top", "bottom", "onepiece", "outerwear", "shoes", "accessory"];

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, CATEGORY_VALIDATION.NAME_REQUIRED],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    /** For AI Stylist "goes with": which outfit slot this category belongs to (subcategories only). */
    outfitSlot: {
      type: String,
      enum: OUTFIT_SLOT_VALUES,
      default: null,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

categorySchema.index({ parent: 1 });
categorySchema.index({ slug: 1, parent: 1 });

export default mongoose.model("Category", categorySchema);
