const express = require("express");
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every order route requires authentication

router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", orderController.getOrder);

// Admin-only (RBAC)
router.get("/", restrictTo("admin"), orderController.getAllOrders);
router.get("/analytics/summary", restrictTo("admin"), orderController.getSalesAnalytics);
router.patch("/:id/status", restrictTo("admin"), orderController.updateOrderStatus);

module.exports = router;
