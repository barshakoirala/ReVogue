import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { AppError } from "../utils/AppError.js";

export async function getCategoriesTree() {
  const parents = await Category.find({ parent: null }).sort({ name: 1 }).lean();
  const subcats = await Category.find({ parent: { $ne: null } })
    .sort({ name: 1 })
    .lean();
  const byParent = {};
  for (const s of subcats) {
    const pid = s.parent?.toString();
    if (!byParent[pid]) byParent[pid] = [];
    byParent[pid].push(s);
  }
  return parents.map((p) => ({
    ...p,
    subcategories: byParent[p._id.toString()] || [],
  }));
}

export async function createCategory(data) {
  const cat = await Category.create(data);
  return cat.toObject();
}

export async function getCategoryById(id) {
  const cat = await Category.findById(id).lean();
  return cat;
}

export async function updateCategory(id, data) {
  const cat = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  return cat;
}

export async function deleteCategory(id) {
  const cat = await Category.findById(id);
  if (!cat) return false;
  const idStr = id.toString();
  const inUse =
    (await Product.countDocuments({ category: id })) > 0 ||
    (await Product.countDocuments({ subcategory: id })) > 0;
  if (inUse) {
    throw new AppError("Category is in use by products", 400);
  }
  if (cat.parent === null) {
    await Category.deleteMany({ parent: id });
  }
  await Category.findByIdAndDelete(id);
  return true;
}
