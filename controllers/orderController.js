const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");

// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @route   GET /api/v1/orders/:id
// @access  Private (owner or admin)
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return next(new AppError("Order not found.", 404));

  if (req.user.role !== "admin" && String(order.user._id) !== req.user.id) {
    return next(new AppError("You do not have access to this order.", 403));
  }

  res.status(200).json({ success: true, data: order });
});

// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const baseQuery = Order.find().populate("user", "name email");
  const features = new APIFeatures(baseQuery, req.query).filter().sort().paginate();

  const [orders, total] = await Promise.all([features.query, Order.countDocuments()]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: orders,
  });
});

// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

  if (!validStatuses.includes(status)) {
    return next(new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));

  order.status = status;
  if (note) order.statusHistory[order.statusHistory.length - 1].note = note;

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  res.status(200).json({ success: true, data: order });
});

// @route   GET /api/v1/orders/analytics/summary
// @access  Private/Admin
// Powers the Chart.js dashboard: revenue over time, order status breakdown,
// top-selling products — computed with MongoDB aggregation, not in app memory.
exports.getSalesAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const [revenueByDay, statusBreakdown, topProducts, totals] = await Promise.all([
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          unitsSold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      revenueByDay,
      statusBreakdown,
      topProducts,
      totals: totals[0] || { totalRevenue: 0, totalOrders: 0 },
    },
  });
});
