import * as brandService from "../services/brandService.js";

export async function getBrands(req, res, next) {
  try {
    const brands = await brandService.getAllBrands();
    res.json({ brands });
  } catch (err) {
    next(err);
  }
}
