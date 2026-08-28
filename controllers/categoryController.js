const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("name");
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError("Category not found.", 404));
  res.status(200).json({ success: true, data: category });
});

// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new AppError("Category not found.", 404));
  res.status(200).json({ success: true, data: category });
});

// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const productsInCategory = await Product.countDocuments({ category: req.params.id, isActive: true });
  if (productsInCategory > 0) {
    return next(
      new AppError(
        `Cannot delete category: ${productsInCategory} active product(s) still reference it.`,
        400
      )
    );
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError("Category not found.", 404));

  res.status(200).json({ success: true, message: "Category deleted." });
});
