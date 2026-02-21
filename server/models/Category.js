import mongoose from "mongoose";
import { CATEGORY_VALIDATION } from "../constants/index.js";

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
