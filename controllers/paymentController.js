const asyncHandler = require("express-async-handler");
const gateway = require("../config/braintree");
const Product = require("../models/Product");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

// @route   GET /api/v1/payments/client-token
// @access  Private
// Frontend calls this first to initialize Braintree Drop-in UI.
exports.getClientToken = asyncHandler(async (req, res, next) => {
  gateway.clientToken.generate({ customerId: req.user.id }, (err, response) => {
    if (err) {
      logger.error(`Braintree client token error: ${err.message}`);
      return next(new AppError("Could not initialize payment gateway.", 500));
    }
    res.status(200).json({ success: true, clientToken: response.clientToken });
  });
});

// @route   POST /api/v1/payments/checkout
// @access  Private
// Body: { paymentMethodNonce, orderItems, shippingAddress }
// SECURITY: prices are recalculated server-side from the DB — the client-sent
// totals are never trusted, preventing price-tampering attacks.
exports.checkout = asyncHandler(async (req, res, next) => {
  const { paymentMethodNonce, orderItems, shippingAddress } = req.body;

  if (!paymentMethodNonce) return next(new AppError("Payment method is required.", 400));
  if (!orderItems || orderItems.length === 0) return next(new AppError("Cart is empty.", 400));

  // Re-fetch each product server-side to get authoritative price & stock
  let itemsPrice = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return next(new AppError(`Product ${item.product} is no longer available.`, 400));
    }
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for "${product.name}".`, 400));
    }

    const unitPrice = product.discountPrice ?? product.price;
    itemsPrice += unitPrice * item.quantity;

    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: unitPrice,
      quantity: item.quantity,
    });
  }

  const taxPrice = Number((itemsPrice * 0.08).toFixed(2)); // example flat tax rate
  const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  // Process the transaction through Braintree
  const result = await new Promise((resolve, reject) => {
    gateway.transaction.sale(
      {
        amount: totalPrice.toFixed(2),
        paymentMethodNonce,
        options: { submitForSettlement: true },
      },
      (err, saleResult) => (err ? reject(err) : resolve(saleResult))
    );
  }).catch((err) => {
    logger.error(`Braintree transaction error: ${err.message}`);
    return null;
  });

  if (!result || !result.success) {
    const message = result?.message || "Payment declined. Please try another payment method.";
    return next(new AppError(message, 402));
  }

  // Persist order and decrement stock atomically-ish (sequential, product-by-product)
  const order = await Order.create({
    user: req.user.id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod: "braintree",
    paymentResult: {
      transactionId: result.transaction.id,
      status: result.transaction.status,
      updateTime: new Date().toISOString(),
      payerEmail: req.user.email,
    },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: true,
    paidAt: new Date(),
    status: "processing",
  });

  await Promise.all(
    verifiedItems.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      })
    )
  );

  res.status(201).json({ success: true, data: order });
});
