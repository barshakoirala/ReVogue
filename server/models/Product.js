import mongoose from "mongoose";
import { PRODUCT_CONDITIONS, PRODUCT_STATUS, PRODUCT_TIER, PRODUCT_VALIDATION } from "../constants/index.js";

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
    tier: {
      type: String,
      enum: PRODUCT_TIER,
      default: "normal",
    },
    trending: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    ecoSustainability: {
      type: {
        carbonSavedKg: { type: Number, min: 0 },
        waterSavedLiters: { type: Number, min: 0 },
        wasteDivertedKg: { type: Number, min: 0 },
        energySavedKwh: { type: Number, min: 0 },
        landUseSavedSqm: { type: Number, min: 0 },
        equivalentItemsAvoided: { type: Number, min: 0 },
        microplasticsAvoidedG: { type: Number, min: 0 },
        recycledContentPercent: { type: Number, min: 0, max: 100 },
        notes: { type: String, trim: true },
      },
      default: undefined,
    },
    /** 0–1 score derived from ecoSustainability metrics (computed on save). */
    ecoScore: { type: Number, min: 0, max: 1 },
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
