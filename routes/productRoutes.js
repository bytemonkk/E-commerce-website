const express = require("express");
const { body } = require("express-validator");
const productController = require("../controllers/productController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Public
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id", productController.getProduct);
router.get("/:id/related", productController.getRelatedProducts);

// Private
router.post(
  "/:id/reviews",
  protect,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isLength({ max: 500 }),
  ],
  validate,
  productController.createReview
);

// Private/Admin+Seller (RBAC)
router.post(
  "/",
  protect,
  restrictTo("admin", "seller"),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").isMongoId().withMessage("Valid category ID is required"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  ],
  validate,
  productController.createProduct
);

router.put("/:id", protect, restrictTo("admin", "seller"), productController.updateProduct);
router.delete("/:id", protect, restrictTo("admin", "seller"), productController.deleteProduct);

module.exports = router;
