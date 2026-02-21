import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import { AppError } from "../utils/AppError.js";

export async function getAllBrands() {
  return Brand.find({}).sort({ name: 1 }).select("_id name").lean();
}

export async function createBrand(data) {
  const brand = await Brand.create(data);
  return brand.toObject();
}

export async function getBrandById(id) {
  const brand = await Brand.findById(id).lean();
  return brand;
}

export async function updateBrand(id, data) {
  const brand = await Brand.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  return brand;
}

export async function deleteBrand(id) {
  const inUse = (await Product.countDocuments({ brand: id })) > 0;
  if (inUse) {
    throw new AppError("Brand is in use by products", 400);
  }
  const result = await Brand.findByIdAndDelete(id);
  return !!result;
}
