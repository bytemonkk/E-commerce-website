const express = require("express");
const { body } = require("express-validator");
const categoryController = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);

router.post(
  "/",
  protect,
  restrictTo("admin"),
  [body("name").trim().notEmpty().withMessage("Category name is required")],
  validate,
  categoryController.createCategory
);
router.put("/:id", protect, restrictTo("admin"), categoryController.updateCategory);
router.delete("/:id", protect, restrictTo("admin"), categoryController.deleteCategory);

module.exports = router;
