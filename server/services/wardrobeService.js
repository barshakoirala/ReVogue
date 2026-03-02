import WardrobeItem from "../models/WardrobeItem.js";
import "../models/Category.js";
import "../models/Brand.js";
import "../models/Product.js";

export async function getMyWardrobeItems(ownerId) {
  return WardrobeItem.find({ owner: ownerId })
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .populate("linkedProduct", "title")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getMyWardrobeItemById(itemId, ownerId) {
  const item = await WardrobeItem.findOne({
    _id: itemId,
    owner: ownerId,
  })
    .populate("category", "name")
    .populate("subcategory", "name")
    .populate("brand", "name")
    .populate("linkedProduct", "title")
    .lean();
  return item;
}

const CREATABLE_FIELDS = [
  "title",
  "notes",
  "category",
  "subcategory",
  "brand",
  "size",
  "condition",
  "color",
  "images",
  "linkedProduct",
];

export async function createWardrobeItem(ownerId, data) {
  const payload = { owner: ownerId };
  for (const key of CREATABLE_FIELDS) {
    if (data[key] !== undefined) {
      if (key === "images") {
        payload[key] = Array.isArray(data[key]) ? data[key] : [];
      } else {
        payload[key] = data[key];
      }
    }
  }
  const item = await WardrobeItem.create(payload);
  return item.toObject();
}

const UPDATABLE_FIELDS = [
  "title",
  "notes",
  "category",
  "subcategory",
  "brand",
  "size",
  "condition",
  "color",
  "images",
  "linkedProduct",
];

export async function updateWardrobeItem(itemId, ownerId, data) {
  const payload = {};
  for (const key of UPDATABLE_FIELDS) {
    if (data[key] !== undefined) {
      if (key === "images") {
        payload[key] = Array.isArray(data[key]) ? data[key] : [];
      } else {
        payload[key] = data[key];
      }
    }
  }
  const item = await WardrobeItem.findOneAndUpdate(
    { _id: itemId, owner: ownerId },
    payload,
    { new: true, runValidators: true }
  );
  return item?.toObject() || null;
}

export async function deleteWardrobeItem(itemId, ownerId) {
  const result = await WardrobeItem.deleteOne({
    _id: itemId,
    owner: ownerId,
  });
  return result.deletedCount === 1;
}

