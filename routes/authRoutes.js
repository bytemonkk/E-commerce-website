const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Stricter limiter specifically for auth endpoints to blunt brute-force/credential-stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.patch(
  "/reset-password/:token",
  [body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")],
  validate,
  authController.resetPassword
);

// Protected
router.use(protect);
router.get("/me", authController.getMe);
router.patch("/update-me", authController.updateMe);
router.patch(
  "/update-password",
  [body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters")],
  validate,
  authController.updatePassword
);

module.exports = router;
