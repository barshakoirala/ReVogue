import mongoose from "mongoose";
import "dotenv/config";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/revogue";

// High-quality Unsplash images mapped by product type
const LUXURY_PRODUCTS = [
  {
    title: "Chanel Classic Flap Bag",
    description: "Timeless black caviar leather medium flap with gold hardware. Comes with authenticity card and dust bag.",
    price: 5800, condition: "Like New", size: null,
    brand: "Chanel", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury", trending: true,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    ],
  },
  {
    title: "Louis Vuitton Neverfull MM",
    description: "Iconic monogram canvas tote in MM size. Interior pochette included. Light patina on handles.",
    price: 1250, condition: "Good", size: null,
    brand: "Louis Vuitton", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury", trending: true,
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    ],
  },
  {
    title: "Gucci GG Marmont Shoulder Bag",
    description: "Matelassé chevron leather with double G hardware. Dusty rose pink, barely used.",
    price: 980, condition: "Like New", size: null,
    brand: "Gucci", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    ],
  },
  {
    title: "Hermès Silk Twill Scarf",
    description: "90cm silk twill scarf in the iconic Hermès print. Vibrant colors, no flaws.",
    price: 420, condition: "New", size: "90cm",
    brand: "Hermès", categoryName: "Accessories", subcategoryName: "Scarves", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
    ],
  },
  {
    title: "Cartier Love Bracelet",
    description: "18k yellow gold Love bracelet with screwdriver. Full set with box and papers.",
    price: 6800, condition: "New", size: null,
    brand: "Cartier", categoryName: "Accessories", subcategoryName: "Jewelry", tier: "luxury", trending: true,
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    ],
  },
  {
    title: "Rolex Submariner Date",
    description: "Stainless steel Submariner ref. 116610LN, circa 2018. Full set, serviced.",
    price: 12500, condition: "Good", size: null,
    brand: "Rolex", categoryName: "Accessories", subcategoryName: "Jewelry", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    ],
  },
  {
    title: "Prada Re-Edition 2005 Bag",
    description: "Re-nylon and Saffiano leather mini bag in black. Iconic triangle logo.",
    price: 750, condition: "Like New", size: null,
    brand: "Prada", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
  },
  {
    title: "Burberry Classic Trench Coat",
    description: "Iconic honey-colored trench coat in size M. Nova check lining, belt included.",
    price: 1100, condition: "Good", size: "M",
    brand: "Burberry", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "luxury", trending: true,
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    ],
  },
  {
    title: "Saint Laurent Loulou Bag",
    description: "Small YSL Loulou in black matelassé leather with gold chain.",
    price: 1350, condition: "Like New", size: null,
    brand: "Saint Laurent", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    ],
  },
  {
    title: "Christian Louboutin So Kate Pumps",
    description: "Classic 120mm So Kate in black patent leather. Size 38. Signature red sole.",
    price: 520, condition: "Good", size: "38",
    brand: "Christian Louboutin", categoryName: "Shoes", subcategoryName: "Formal", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    ],
  },
  {
    title: "Gucci Horsebit 1953 Loafers",
    description: "Black leather horsebit loafers, size 41. Minimal wear on sole.",
    price: 680, condition: "Like New", size: "41",
    brand: "Gucci", categoryName: "Shoes", subcategoryName: "Formal", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    ],
  },
  {
    title: "Balenciaga Triple S Sneakers",
    description: "Chunky Triple S in white/grey/red colorway. Size 42. Lightly worn.",
    price: 480, condition: "Good", size: "42",
    brand: "Balenciaga", categoryName: "Shoes", subcategoryName: "Sneakers", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
  },
  {
    title: "Dior Saddle Bag",
    description: "Oblique canvas saddle bag in blue. Adjustable strap, excellent condition.",
    price: 2200, condition: "Like New", size: null,
    brand: "Dior", categoryName: "Accessories", subcategoryName: "Bags", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    ],
  },
  {
    title: "Jimmy Choo Romy Heels",
    description: "Nude patent leather pointed-toe pumps. Size 37. Worn twice.",
    price: 340, condition: "Like New", size: "37",
    brand: "Jimmy Choo", categoryName: "Shoes", subcategoryName: "Formal", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    ],
  },
  {
    title: "Omega Seamaster Aqua Terra",
    description: "38.5mm stainless steel, blue dial. Box and papers from 2020.",
    price: 4200, condition: "Good", size: null,
    brand: "Omega", categoryName: "Accessories", subcategoryName: "Jewelry", tier: "luxury",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    ],
  },
];

const NORMAL_PRODUCTS = [
  {
    title: "Levi's 501 Original Jeans",
    description: "Classic straight-leg jeans in medium wash. Size 30x32. Barely worn.",
    price: 45, condition: "Like New", size: "30x32",
    brand: "Levi's", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal", trending: true,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    ],
  },
  {
    title: "Zara Oversized Blazer",
    description: "Camel double-breasted blazer, size M. Perfect for office or casual wear.",
    price: 38, condition: "Good", size: "M",
    brand: "Zara", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal", trending: true,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    ],
  },
  {
    title: "H&M Floral Midi Dress",
    description: "Flowy floral print midi dress in size S. Light and breathable fabric.",
    price: 22, condition: "Like New", size: "S",
    brand: "H&M", categoryName: "Clothing", subcategoryName: "Dresses", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
  },
  {
    title: "Uniqlo Merino Wool Sweater",
    description: "Navy crew-neck merino wool sweater, size M. Pilling-free, excellent condition.",
    price: 28, condition: "Good", size: "M",
    brand: "Uniqlo", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    ],
  },
  {
    title: "Nike Air Force 1 Low",
    description: "Classic white leather AF1. Size 42. Clean, minimal creasing.",
    price: 65, condition: "Good", size: "42",
    brand: "Nike", categoryName: "Shoes", subcategoryName: "Sneakers", tier: "normal", trending: true,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
  },
  {
    title: "Converse Chuck Taylor High Top",
    description: "Black canvas high tops, size 40. Classic look, lightly worn.",
    price: 30, condition: "Good", size: "40",
    brand: "Converse", categoryName: "Shoes", subcategoryName: "Sneakers", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80",
    ],
  },
  {
    title: "Mango Linen Trousers",
    description: "Wide-leg linen trousers in ecru. Size M. Perfect for summer.",
    price: 32, condition: "Like New", size: "M",
    brand: "Mango", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
  },
  {
    title: "COS Structured Tote Bag",
    description: "Minimalist structured tote in black leather. Fits a laptop, barely used.",
    price: 55, condition: "Like New", size: null,
    brand: "COS", categoryName: "Accessories", subcategoryName: "Bags", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    ],
  },
  {
    title: "Massimo Dutti Wool Coat",
    description: "Dark grey wool blend coat, size M. Warm and elegant.",
    price: 85, condition: "Good", size: "M",
    brand: "Massimo Dutti", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    ],
  },
  {
    title: "Clarks Desert Boots",
    description: "Tan suede desert boots, size 42. Classic silhouette, well maintained.",
    price: 55, condition: "Good", size: "42",
    brand: "Clarks", categoryName: "Shoes", subcategoryName: "Boots", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
    ],
  },
  {
    title: "& Other Stories Silk Blouse",
    description: "Ivory silk blouse with tie neck, size S. Dry cleaned, excellent condition.",
    price: 42, condition: "Like New", size: "S",
    brand: "& Other Stories", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
    ],
  },
  {
    title: "Ted Baker Wrap Dress",
    description: "Floral wrap dress in size 2 (UK 10). Elegant and flattering cut.",
    price: 48, condition: "Good", size: "UK 10",
    brand: "Ted Baker", categoryName: "Clothing", subcategoryName: "Dresses", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
  },
  {
    title: "Fossil Leather Crossbody",
    description: "Brown pebbled leather crossbody bag. Adjustable strap, multiple pockets.",
    price: 40, condition: "Good", size: null,
    brand: "Fossil", categoryName: "Accessories", subcategoryName: "Bags", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
  },
  {
    title: "Gap Classic Denim Jacket",
    description: "Light wash denim jacket, size L. Timeless style, great condition.",
    price: 35, condition: "Good", size: "L",
    brand: "Gap", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80",
    ],
  },
  {
    title: "Zara Leather Ankle Boots",
    description: "Black leather ankle boots with block heel, size 38. Worn a few times.",
    price: 50, condition: "Like New", size: "38",
    brand: "Zara", categoryName: "Shoes", subcategoryName: "Boots", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
    ],
  },
  {
    title: "Uniqlo Ultra Light Down Jacket",
    description: "Packable down jacket in olive, size M. Warm and lightweight.",
    price: 40, condition: "Like New", size: "M",
    brand: "Uniqlo", categoryName: "Clothing", subcategoryName: "Outerwear", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    ],
  },
  {
    title: "Mango Knit Cardigan",
    description: "Cream ribbed knit cardigan, size S. Cozy and versatile.",
    price: 26, condition: "New", size: "S",
    brand: "Mango", categoryName: "Clothing", subcategoryName: "Tops", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    ],
  },
  {
    title: "H&M Pleated Midi Skirt",
    description: "Dusty pink pleated satin skirt, size M. Elegant and easy to style.",
    price: 18, condition: "Like New", size: "M",
    brand: "H&M", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
  },
  {
    title: "Nike Running Shorts",
    description: "Black Dri-FIT running shorts, size M. Lightweight and comfortable.",
    price: 20, condition: "Good", size: "M",
    brand: "Nike", categoryName: "Clothing", subcategoryName: "Bottoms", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
  },
  {
    title: "Clarks Leather Sandals",
    description: "Tan leather strappy sandals, size 37. Comfortable and stylish.",
    price: 35, condition: "Good", size: "37",
    brand: "Clarks", categoryName: "Shoes", subcategoryName: "Sandals", tier: "normal",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    ],
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ email: "admin@revogue.com" });
    if (!admin) {
      console.error("Admin user not found. Run seedAdmin.js first.");
      process.exit(1);
    }

    // Clear existing products only
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Get existing categories and brands
    const allCategories = await Category.find({});
    const allBrands = await Brand.find({});

    if (allCategories.length === 0) {
      console.error("No categories found. Run seedDb.js first.");
      process.exit(1);
    }

    // Build lookup maps
    const categoryMap = {};
    const parentCategories = allCategories.filter((c) => !c.parent);
    const subCategories = allCategories.filter((c) => c.parent);

    for (const parent of parentCategories) {
      categoryMap[parent.name] = { parent, subcategories: {} };
    }
    for (const sub of subCategories) {
      const parent = parentCategories.find((p) => p._id.equals(sub.parent));
      if (parent && categoryMap[parent.name]) {
        categoryMap[parent.name].subcategories[sub.name] = sub;
      }
    }

    const brandMap = {};
    for (const b of allBrands) {
      brandMap[b.name] = b;
    }

    const allProducts = [...LUXURY_PRODUCTS, ...NORMAL_PRODUCTS];
    let created = 0;

    for (const p of allProducts) {
      const parentCat = categoryMap[p.categoryName]?.parent;
      const subCat = categoryMap[p.categoryName]?.subcategories[p.subcategoryName];
      if (!parentCat || !subCat) {
        console.warn(`Skipping "${p.title}" — category not found: ${p.categoryName}/${p.subcategoryName}`);
        continue;
      }
      const brandRef = p.brand ? brandMap[p.brand]?._id : null;
      if (p.brand && !brandRef) {
        console.warn(`Brand not found for "${p.title}": ${p.brand}`);
      }
      await Product.create({
        title: p.title,
        description: p.description,
        price: p.price,
        category: parentCat._id,
        subcategory: subCat._id,
        condition: p.condition,
        size: p.size || undefined,
        brand: brandRef || undefined,
        tier: p.tier,
        trending: p.trending || false,
        images: p.images,
        seller: admin._id,
        status: "active",
      });
      created++;
    }

    console.log(`✓ Created ${created} products (${LUXURY_PRODUCTS.length} luxury, ${NORMAL_PRODUCTS.length} normal)`);
    console.log("Done.");
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedProducts();
