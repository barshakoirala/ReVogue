import * as brandService from "../services/brandService.js";

export async function getBrands(req, res, next) {
  try {
    const brands = await brandService.getAllBrands();
    res.json({ brands });
  } catch (err) {
    next(err);
  }
}

export async function createBrand(req, res, next) {
  try {
    const brand = await brandService.createBrand(req.body);
    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
}

export async function getBrand(req, res, next) {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json(brand);
  } catch (err) {
    next(err);
  }
}

export async function updateBrand(req, res, next) {
  try {
    const brand = await brandService.updateBrand(req.params.id, req.body);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json(brand);
  } catch (err) {
    next(err);
  }
}

export async function deleteBrand(req, res, next) {
  try {
    const deleted = await brandService.deleteBrand(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
