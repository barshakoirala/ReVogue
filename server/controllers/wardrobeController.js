import * as wardrobeService from "../services/wardrobeService.js";

export async function getMyWardrobe(req, res, next) {
  try {
    const items = await wardrobeService.getMyWardrobeItems(req.user._id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getStyleSuggestions(req, res, next) {
  try {
    const wardrobeItemIds =
      typeof req.query.wardrobeItemIds === "string"
        ? req.query.wardrobeItemIds.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(req.query.wardrobeItemIds)
          ? req.query.wardrobeItemIds.filter((id) => id)
          : [];
    const targetSubcategoryId = req.query.targetSubcategoryId || null;
    const suggestions = await wardrobeService.getStyleSuggestions(req.user._id, {
      wardrobeItemIds,
      targetSubcategoryId,
    });
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
}

export async function getMyWardrobeItem(req, res, next) {
  try {
    const item = await wardrobeService.getMyWardrobeItemById(
      req.params.id,
      req.user._id
    );
    if (!item) {
      return res.status(404).json({ message: "Wardrobe item not found" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createWardrobeItem(req, res, next) {
  try {
    const item = await wardrobeService.createWardrobeItem(req.user._id, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateWardrobeItem(req, res, next) {
  try {
    const item = await wardrobeService.updateWardrobeItem(
      req.params.id,
      req.user._id,
      req.body
    );
    if (!item) {
      return res.status(404).json({ message: "Wardrobe item not found" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteWardrobeItem(req, res, next) {
  try {
    const deleted = await wardrobeService.deleteWardrobeItem(
      req.params.id,
      req.user._id
    );
    if (!deleted) {
      return res.status(404).json({ message: "Wardrobe item not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

