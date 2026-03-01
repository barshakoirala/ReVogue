/**
 * AI Stylist: outfit slot values (must match Category.outfitSlot in DB).
 * Slot assignment is stored on Category; this is the allowed set.
 */
export const OUTFIT_SLOTS = {
  TOP: "top",
  BOTTOM: "bottom",
  ONEPIECE: "onepiece",
  OUTERWEAR: "outerwear",
  SHOES: "shoes",
  ACCESSORY: "accessory",
};

export const ALL_SLOTS = [
  OUTFIT_SLOTS.TOP,
  OUTFIT_SLOTS.BOTTOM,
  OUTFIT_SLOTS.ONEPIECE,
  OUTFIT_SLOTS.OUTERWEAR,
  OUTFIT_SLOTS.SHOES,
  OUTFIT_SLOTS.ACCESSORY,
];

export const DEFAULT_OUTFIT_COUNT = 3;
export const MAX_OUTFIT_ITEMS = 6;
