import Category from "../models/Category.js";

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
