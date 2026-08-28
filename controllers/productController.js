const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");

// @route   GET /api/v1/products
// @access  Public
// Supports: ?keyword=shoes&category=<id>&price[gte]=10&price[lte]=100&sort=-price&page=1&limit=20
exports.getProducts = asyncHandler(async (req, res) => {
  const baseQuery = Product.find({ isActive: true }).populate("category", "name slug");

  const features = new APIFeatures(baseQuery, req.query).search().filter().sort().limitFields().paginate();

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments({ isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: products,
  });
});

// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .limit(8)
    .populate("category", "name slug");
  res.status(200).json({ success: true, count: products.length, data: products });
});

// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("reviews.user", "name avatar");

  if (!product || !product.isActive) {
    return next(new AppError("Product not found.", 404));
  }
  res.status(200).json({ success: true, data: product });
});

// @route   GET /api/v1/products/slug/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    "category",
    "name slug"
  );
  if (!product) return next(new AppError("Product not found.", 404));
  res.status(200).json({ success: true, data: product });
});

// @route   POST /api/v1/products
// @access  Private/Admin,Seller
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user.id });
  res.status(201).json({ success: true, data: product });
});

// @route   PUT /api/v1/products/:id
// @access  Private/Admin,Seller(owner)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  if (req.user.role === "seller" && String(product.seller) !== req.user.id) {
    return next(new AppError("You can only modify your own products.", 403));
  }

  Object.assign(product, req.body);
  await product.save();

  res.status(200).json({ success: true, data: product });
});

// @route   DELETE /api/v1/products/:id
// @access  Private/Admin,Seller(owner)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  if (req.user.role === "seller" && String(product.seller) !== req.user.id) {
    return next(new AppError("You can only delete your own products.", 403));
  }

  // Soft delete keeps historical order data intact
  product.isActive = false;
  await product.save();

  res.status(200).json({ success: true, message: "Product removed." });
});

// @route   POST /api/v1/products/:id/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  const alreadyReviewed = product.reviews.find((r) => String(r.user) === req.user.id);
  if (alreadyReviewed) {
    return next(new AppError("You have already reviewed this product.", 400));
  }

  product.reviews.push({
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.recalculateRatings();
  await product.save();

  res.status(201).json({ success: true, message: "Review added.", data: product });
});

// @route   GET /api/v1/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(6);

  res.status(200).json({ success: true, data: related });
});
