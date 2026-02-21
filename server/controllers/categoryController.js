import * as categoryService from "../services/categoryService.js";

export async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategoriesTree();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}
