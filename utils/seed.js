/**
 * Run with: npm run seed
 * Creates an admin user and a couple of sample categories/products
 * so the app is testable immediately after setup.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const logger = require("./logger");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Connected for seeding...");

  const adminEmail = "admin@ecommerce.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Store Admin",
      email: adminEmail,
      password: "Admin@12345",
      role: "admin",
    });
    logger.info(`Admin created: ${adminEmail} / Admin@12345`);
  }

  let category = await Category.findOne({ name: "Electronics" });
  if (!category) {
    category = await Category.create({ name: "Electronics", description: "Gadgets and devices" });
  }

  const existingCount = await Product.countDocuments();
  if (existingCount === 0) {
    await Product.insertMany([
      {
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear wireless headphones with 30-hour battery life.",
        price: 89.99,
        discountPrice: 69.99,
        category: category._id,
        brand: "SoundCore",
        stock: 50,
        seller: admin._id,
        isFeatured: true,
        images: [{ url: "https://via.placeholder.com/500x500?text=Headphones" }],
      },
      {
        name: "Smart Fitness Watch",
        description: "Track your workouts, heart rate, and sleep with this smart fitness watch.",
        price: 149.99,
        category: category._id,
        brand: "FitTrack",
        stock: 30,
        seller: admin._id,
        isFeatured: true,
        images: [{ url: "https://via.placeholder.com/500x500?text=Smart+Watch" }],
      },
    ]);
    logger.info("Sample products created.");
  }

  logger.info("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
