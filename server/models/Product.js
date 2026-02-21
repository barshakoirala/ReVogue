import mongoose from "mongoose";
import { PRODUCT_CONDITIONS, PRODUCT_STATUS, PRODUCT_VALIDATION } from "../constants/index.js";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, PRODUCT_VALIDATION.TITLE_REQUIRED],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, PRODUCT_VALIDATION.PRICE_REQUIRED],
      min: [0.01, PRODUCT_VALIDATION.PRICE_MIN],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, PRODUCT_VALIDATION.CATEGORY_REQUIRED],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    condition: {
      type: String,
      required: [true, PRODUCT_VALIDATION.CONDITION_REQUIRED],
      enum: PRODUCT_CONDITIONS,
    },
    size: {
      type: String,
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    images: {
      type: [String],
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, PRODUCT_VALIDATION.SELLER_REQUIRED],
    },
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
