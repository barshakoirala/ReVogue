import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { SEED_ADMIN } from "../constants/index.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

const CATEGORIES = [
  {
    name: "Clothing",
    subcategories: ["Tops", "Bottoms", "Dresses", "Outerwear"],
  },
  {
    name: "Accessories",
    subcategories: ["Bags", "Jewelry", "Hats", "Scarves"],
  },
  {
    name: "Shoes",
    subcategories: ["Sneakers", "Sandals", "Boots", "Formal"],
  },
];

const PRODUCTS = [
  { title: "Vintage Denim Jacket", description: "Classic blue denim jacket, lightly worn.", price: 25, condition: "Good", size: "M", brand: "Levi's", categoryName: "Clothing", subcategoryName: "Outerwear" },
  { title: "Floral Summer Dress", description: "Light cotton dress, perfect for summer.", price: 18, condition: "Like New", size: "S", brand: "H&M", categoryName: "Clothing", subcategoryName: "Dresses" },
  { title: "High Waist Black Trousers", description: "Slim fit trousers, office ready.", price: 22, condition: "New", size: "M", brand: "Zara", categoryName: "Clothing", subcategoryName: "Bottoms" },
  { title: "White Cotton T-Shirt", description: "Basic white tee, multiple wears left.", price: 8, condition: "Good", size: "L", brand: "Uniqlo", categoryName: "Clothing", subcategoryName: "Tops" },
  { title: "Striped Blouse", description: "Navy and white striped blouse.", price: 15, condition: "Like New", size: "S", brand: "Mango", categoryName: "Clothing", subcategoryName: "Tops" },
  { title: "Wool Blend Coat", description: "Warm winter coat, dark grey.", price: 45, condition: "Good", size: "M", brand: "Massimo Dutti", categoryName: "Clothing", subcategoryName: "Outerwear" },
  { title: "Leather Crossbody Bag", description: "Brown leather bag, minimal wear.", price: 35, condition: "Like New", size: null, brand: "Fossil", categoryName: "Accessories", subcategoryName: "Bags" },
  { title: "Canvas Tote Bag", description: "Eco-friendly canvas tote, roomy.", price: 12, condition: "Good", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Bags" },
  { title: "Silver Pendant Necklace", description: "Simple silver chain with pendant.", price: 10, condition: "New", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Jewelry" },
  { title: "Leather Ankle Boots", description: "Black leather boots, low heel.", price: 40, condition: "Good", size: "38", brand: "Clarks", categoryName: "Shoes", subcategoryName: "Boots" },
  { title: "White Canvas Sneakers", description: "Clean white sneakers, barely worn.", price: 28, condition: "Like New", size: "42", brand: "Converse", categoryName: "Shoes", subcategoryName: "Sneakers" },
  { title: "Plaid Flannel Shirt", description: "Red and black plaid, soft fabric.", price: 20, condition: "Good", size: "L", brand: null, categoryName: "Clothing", subcategoryName: "Tops" },
  { title: "Midi Skirt", description: "Pleated midi skirt, navy blue.", price: 16, condition: "New", size: "M", brand: "& Other Stories", categoryName: "Clothing", subcategoryName: "Bottoms" },
  { title: "Knit Cardigan", description: "Cream colored cardigan, cozy.", price: 24, condition: "Like New", size: "S", brand: "COS", categoryName: "Clothing", subcategoryName: "Outerwear" },
  { title: "Sandal Wedges", description: "Tan leather wedge sandals.", price: 22, condition: "Good", size: "37", brand: null, categoryName: "Shoes", subcategoryName: "Sandals" },
  { title: "Cotton Beanie", description: "Grey knit beanie.", price: 6, condition: "Like New", size: "One Size", brand: null, categoryName: "Accessories", subcategoryName: "Hats" },
  { title: "Silk Scarf", description: "Printed silk scarf, vibrant colors.", price: 14, condition: "New", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Scarves" },
  { title: "Crew Neck Sweater", description: "Olive green wool sweater.", price: 30, condition: "Good", size: "M", brand: "Gap", categoryName: "Clothing", subcategoryName: "Tops" },
  { title: "Black Tuxedo Blazer", description: "Formal blazer for events.", price: 55, condition: "Like New", size: "M", brand: "Ted Baker", categoryName: "Clothing", subcategoryName: "Outerwear" },
  { title: "Running Sneakers", description: "Lightweight running shoes, size 40.", price: 32, condition: "Good", size: "40", brand: "Nike", categoryName: "Shoes", subcategoryName: "Sneakers" },
  { title: "Stud Earrings Set", description: "Gold tone stud earrings, pack of 3.", price: 9, condition: "New", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Jewelry" },
  { title: "Wide Leg Trousers", description: "Beige linen wide leg pants.", price: 26, condition: "Like New", size: "M", brand: "Mango", categoryName: "Clothing", subcategoryName: "Bottoms" },
  { title: "Maxi Dress", description: "Floral maxi dress, flowing fabric.", price: 28, condition: "Good", size: "S", brand: "H&M", categoryName: "Clothing", subcategoryName: "Dresses" },
  { title: "Loafers", description: "Brown leather loafers.", price: 38, condition: "Like New", size: "39", brand: "Clarks", categoryName: "Shoes", subcategoryName: "Formal" },
  { title: "Denim Shorts", description: "High rise denim shorts.", price: 15, condition: "Good", size: "S", brand: "Levi's", categoryName: "Clothing", subcategoryName: "Bottoms" },
  { title: "Corduroy Jacket", description: "Green corduroy jacket.", price: 34, condition: "Good", size: "L", brand: null, categoryName: "Clothing", subcategoryName: "Outerwear" },
];

async function seedDb() {
  try {
    await mongoose.connect(MONGO_URI);

    let admin = await User.findOne({ email: SEED_ADMIN.EMAIL });
    if (!admin) {
      admin = await User.create({
        firstName: SEED_ADMIN.FIRST_NAME,
        lastName: SEED_ADMIN.LAST_NAME,
        email: SEED_ADMIN.EMAIL,
        password: SEED_ADMIN.PASSWORD,
        role: SEED_ADMIN.ROLE,
      });
      console.log("Admin created:", admin.email);
    } else {
      console.log("Admin exists:", admin.email);
    }

    await Category.deleteMany({});
    await Product.deleteMany({});

    const categoryMap = {};

    for (const cat of CATEGORIES) {
      const parent = await Category.create({ name: cat.name, parent: null });
      categoryMap[cat.name] = { parent, subcategories: {} };
      for (const subName of cat.subcategories) {
        const sub = await Category.create({ name: subName, parent: parent._id });
        categoryMap[cat.name].subcategories[subName] = sub;
      }
    }
    console.log("Categories created:", Object.keys(categoryMap).length, "parent, with subcategories");

    for (const p of PRODUCTS) {
      const parentCat = categoryMap[p.categoryName]?.parent;
      const subCat = categoryMap[p.categoryName]?.subcategories[p.subcategoryName];
      if (!parentCat || !subCat) continue;
      await Product.create({
        title: p.title,
        description: p.description,
        price: p.price,
        category: parentCat._id,
        subcategory: subCat._id,
        condition: p.condition,
        size: p.size,
        brand: p.brand,
        images: [`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`],
        seller: admin._id,
        status: "active",
      });
    }
    console.log("Products created:", PRODUCTS.length);
    console.log("Seed complete");
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDb();
