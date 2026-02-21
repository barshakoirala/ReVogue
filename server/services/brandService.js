import Brand from "../models/Brand.js";

export async function getAllBrands() {
  return Brand.find({}).sort({ name: 1 }).select("_id name").lean();
}
