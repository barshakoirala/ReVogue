import mongoose from "mongoose";
import "dotenv/config";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import { resolveProductImages } from "./utils/productImageResolver.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

const VENDOR_ID = "6999821464fb7fcfea30c69f";

const PRODUCTS = [
  { title: "Vintage Denim Jacket", description: "Classic blue denim jacket, lightly worn.", price: 25, condition: "Good", size: "M", brand: "Levi's", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal", trending: true },
  { title: "Floral Summer Dress", description: "Light cotton dress, perfect for summer.", price: 18, condition: "Like New", size: "S", brand: "H&M", categoryName: "Clothing", subcategoryName: "Dresses", tier: "normal", trending: true },
  { title: "High Waist Black Trousers", description: "Slim fit trousers, office ready.", price: 22, condition: "New", size: "M", brand: "Zara", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal" },
  { title: "White Cotton T-Shirt", description: "Basic white tee, multiple wears left.", price: 8, condition: "Good", size: "L", brand: "Uniqlo", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal" },
  { title: "Leather Crossbody Bag", description: "Brown leather bag, minimal wear.", price: 35, condition: "Like New", size: null, brand: "Fossil", categoryName: "Accessories", subcategoryName: "Bags", tier: "normal" },
  { title: "Leather Ankle Boots", description: "Black leather boots, low heel.", price: 40, condition: "Good", size: "38", brand: "Clarks", categoryName: "Shoes", subcategoryName: "Boots", tier: "normal" },
  { title: "White Canvas Sneakers", description: "Clean white sneakers, barely worn.", price: 28, condition: "Like New", size: "42", brand: "Converse", categoryName: "Shoes", subcategoryName: "Sneakers", tier: "normal" },
  { title: "Chanel Classic Flap", description: "Black caviar leather medium flap bag.", price: 5800, condition: "Good", size: null, brand: "Chanel", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury", trending: true },
  { title: "Louis Vuitton Neverfull", description: "Monogram canvas tote, MM size.", price: 1200, condition: "Like New", size: null, brand: "Louis Vuitton", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury" },
  { title: "Gucci Horsebit Loafers", description: "Black leather horsebit loafers.", price: 650, condition: "Like New", size: "40", brand: "Gucci", categoryName: "Shoes", subcategoryName: "Formal", tier: "luxury", trending: true },
];

async function seedVendorProducts() {
  try {
    await mongoose.connect(MONGO_URI);

    const vendorObjectId = new mongoose.Types.ObjectId(VENDOR_ID);

    const parents = await Category.find({ parent: null }).lean();
    const subcats = await Category.find({ parent: { $ne: null } }).populate("parent", "name").lean();
    const categoryMap = {};
    for (const p of parents) {
      categoryMap[p.name] = { parent: p, subcategories: {} };
    }
    for (const s of subcats) {
      const parentName = s.parent?.name;
      if (parentName && categoryMap[parentName]) {
        categoryMap[parentName].subcategories[s.name] = s;
      }
    }

    const brands = await Brand.find({}).lean();
    const brandMap = {};
    for (const b of brands) {
      brandMap[b.name] = b;
    }

    let created = 0;
    for (const [idx, p] of PRODUCTS.entries()) {
      const cat = categoryMap[p.categoryName];
      if (!cat?.parent || !cat.subcategories[p.subcategoryName]) continue;
      const brandRef = p.brand ? brandMap[p.brand]?._id : null;
      const images = await resolveProductImages(p, { index: idx });
      await Product.create({
        title: p.title,
        description: p.description,
        price: p.price,
        category: cat.parent._id,
        subcategory: cat.subcategories[p.subcategoryName]._id,
        condition: p.condition,
        size: p.size,
        brand: brandRef,
        tier: p.tier || "normal",
        trending: p.trending || false,
        images,
        seller: vendorObjectId,
        status: "active",
      });
      created++;
    }

    console.log(`Products created for vendor ${VENDOR_ID}: ${created}`);
    console.log("Seed complete");
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedVendorProducts();
