import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import { SEED_ADMIN, ROLES } from "../constants/index.js";

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

const BRANDS = [
  "Levi's",
  "H&M",
  "Zara",
  "Uniqlo",
  "Mango",
  "Massimo Dutti",
  "Fossil",
  "Clarks",
  "Converse",
  "& Other Stories",
  "COS",
  "Gap",
  "Ted Baker",
  "Nike",
  "Dior",
  "Cartier",
  "Louis Vuitton",
  "Chanel",
  "Gucci",
  "Prada",
  "Hermès",
  "Burberry",
  "Saint Laurent",
  "Balenciaga",
  "Jimmy Choo",
  "Christian Louboutin",
  "Salvatore Ferragamo",
  "Manolo Blahnik",
  "Tod's",
  "Rolex",
  "Omega",
  "Tag Heuer",
  "Breitling",
  "Longines",
];

const PRODUCTS = [
  { title: "Vintage Denim Jacket", description: "Classic blue denim jacket, lightly worn.", price: 25, condition: "Good", size: "M", brand: "Levi's", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal", trending: true },
  { title: "Floral Summer Dress", description: "Light cotton dress, perfect for summer.", price: 18, condition: "Like New", size: "S", brand: "H&M", categoryName: "Clothing", subcategoryName: "Dresses", tier: "normal", trending: true },
  { title: "High Waist Black Trousers", description: "Slim fit trousers, office ready.", price: 22, condition: "New", size: "M", brand: "Zara", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal" },
  { title: "White Cotton T-Shirt", description: "Basic white tee, multiple wears left.", price: 8, condition: "Good", size: "L", brand: "Uniqlo", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal" },
  { title: "Striped Blouse", description: "Navy and white striped blouse.", price: 15, condition: "Like New", size: "S", brand: "Mango", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal" },
  { title: "Wool Blend Coat", description: "Warm winter coat, dark grey.", price: 45, condition: "Good", size: "M", brand: "Massimo Dutti", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal" },
  { title: "Leather Crossbody Bag", description: "Brown leather bag, minimal wear.", price: 35, condition: "Like New", size: null, brand: "Fossil", categoryName: "Accessories", subcategoryName: "Bags", tier: "normal" },
  { title: "Canvas Tote Bag", description: "Eco-friendly canvas tote, roomy.", price: 12, condition: "Good", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Bags", tier: "normal" },
  { title: "Silver Pendant Necklace", description: "Simple silver chain with pendant.", price: 10, condition: "New", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Jewelry", tier: "normal" },
  { title: "Leather Ankle Boots", description: "Black leather boots, low heel.", price: 40, condition: "Good", size: "38", brand: "Clarks", categoryName: "Shoes", subcategoryName: "Boots", tier: "normal" },
  { title: "White Canvas Sneakers", description: "Clean white sneakers, barely worn.", price: 28, condition: "Like New", size: "42", brand: "Converse", categoryName: "Shoes", subcategoryName: "Sneakers", tier: "normal" },
  { title: "Plaid Flannel Shirt", description: "Red and black plaid, soft fabric.", price: 20, condition: "Good", size: "L", brand: null, categoryName: "Clothing", subcategoryName: "Tops", tier: "normal" },
  { title: "Midi Skirt", description: "Pleated midi skirt, navy blue.", price: 16, condition: "New", size: "M", brand: "& Other Stories", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal" },
  { title: "Knit Cardigan", description: "Cream colored cardigan, cozy.", price: 24, condition: "Like New", size: "S", brand: "COS", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal" },
  { title: "Sandal Wedges", description: "Tan leather wedge sandals.", price: 22, condition: "Good", size: "37", brand: null, categoryName: "Shoes", subcategoryName: "Sandals", tier: "normal" },
  { title: "Cotton Beanie", description: "Grey knit beanie.", price: 6, condition: "Like New", size: "One Size", brand: null, categoryName: "Accessories", subcategoryName: "Hats", tier: "normal" },
  { title: "Silk Scarf", description: "Printed silk scarf, vibrant colors.", price: 14, condition: "New", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Scarves", tier: "normal" },
  { title: "Crew Neck Sweater", description: "Olive green wool sweater.", price: 30, condition: "Good", size: "M", brand: "Gap", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal" },
  { title: "Black Tuxedo Blazer", description: "Formal blazer for events.", price: 55, condition: "Like New", size: "M", brand: "Ted Baker", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal" },
  { title: "Running Sneakers", description: "Lightweight running shoes, size 40.", price: 32, condition: "Good", size: "40", brand: "Nike", categoryName: "Shoes", subcategoryName: "Sneakers", tier: "normal" },
  { title: "Stud Earrings Set", description: "Gold tone stud earrings, pack of 3.", price: 9, condition: "New", size: null, brand: null, categoryName: "Accessories", subcategoryName: "Jewelry", tier: "normal" },
  { title: "Wide Leg Trousers", description: "Beige linen wide leg pants.", price: 26, condition: "Like New", size: "M", brand: "Mango", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal" },
  { title: "Maxi Dress", description: "Floral maxi dress, flowing fabric.", price: 28, condition: "Good", size: "S", brand: "H&M", categoryName: "Clothing", subcategoryName: "Dresses", tier: "normal" },
  { title: "Loafers", description: "Brown leather loafers.", price: 38, condition: "Like New", size: "39", brand: "Clarks", categoryName: "Shoes", subcategoryName: "Formal", tier: "normal" },
  { title: "Denim Shorts", description: "High rise denim shorts.", price: 15, condition: "Good", size: "S", brand: "Levi's", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal" },
  { title: "Corduroy Jacket", description: "Green corduroy jacket.", price: 34, condition: "Good", size: "L", brand: null, categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal" },
  { title: "Lady Dior Bag", description: "Iconic cannage quilted handbag, pristine.", price: 4200, condition: "Like New", size: null, brand: "Dior", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury" },
  { title: "Cartier Love Bracelet", description: "18k yellow gold iconic screw bracelet.", price: 6500, condition: "New", size: null, brand: "Cartier", categoryName: "Accessories", subcategoryName: "Jewelry", tier: "luxury" },
  { title: "Chanel Classic Flap", description: "Black caviar leather medium flap bag.", price: 5800, condition: "Good", size: null, brand: "Chanel", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury", trending: true },
  { title: "Gucci Horsebit Loafers", description: "Black leather horsebit loafers.", price: 650, condition: "Like New", size: "40", brand: "Gucci", categoryName: "Shoes", subcategoryName: "Formal", tier: "luxury", trending: true },
  { title: "Rolex Submariner", description: "Stainless steel submariner, circa 2015.", price: 11500, condition: "Good", size: null, brand: "Rolex", categoryName: "Accessories", subcategoryName: "Jewelry", tier: "luxury" },
  { title: "Louis Vuitton Neverfull", description: "Monogram canvas tote, MM size.", price: 1200, condition: "Like New", size: null, brand: "Louis Vuitton", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury" },
  { title: "Christian Louboutin Pigalle", description: "Black patent leather pumps.", price: 450, condition: "Like New", size: "38", brand: "Christian Louboutin", categoryName: "Shoes", subcategoryName: "Formal", tier: "luxury" },
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

    let vendor = await User.findOne({ email: "vendor@revogue.com" });
    if (!vendor) {
      vendor = await User.create({
        firstName: "Test",
        lastName: "Vendor",
        email: "vendor@revogue.com",
        password: "vendor123",
        role: ROLES.VENDOR,
      });
      console.log("Vendor created: vendor@revogue.com / vendor123");
    } else {
      console.log("Vendor exists: vendor@revogue.com");
    }

    let vendor2 = await User.findOne({ email: "vendor@vendor.com" });
    if (!vendor2) {
      vendor2 = await User.create({
        firstName: "Vendor",
        lastName: "Two",
        email: "vendor@vendor.com",
        password: "Pythonjs20$",
        role: ROLES.VENDOR,
      });
      console.log("Vendor created: vendor@vendor.com / Pythonjs20$");
    } else {
      console.log("Vendor exists: vendor@vendor.com");
    }

    await Category.deleteMany({});
    await Brand.deleteMany({});
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

    const brandMap = {};
    for (const name of BRANDS) {
      const brand = await Brand.create({ name });
      brandMap[name] = brand;
    }
    console.log("Brands created:", BRANDS.length);

    for (const p of PRODUCTS) {
      const parentCat = categoryMap[p.categoryName]?.parent;
      const subCat = categoryMap[p.categoryName]?.subcategories[p.subcategoryName];
      if (!parentCat || !subCat) continue;
      const brandRef = p.brand ? brandMap[p.brand]?._id : null;
      await Product.create({
        title: p.title,
        description: p.description,
        price: p.price,
        category: parentCat._id,
        subcategory: subCat._id,
        condition: p.condition,
        size: p.size,
        brand: brandRef,
        tier: p.tier || "normal",
        trending: p.trending || false,
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
