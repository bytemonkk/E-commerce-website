const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * `protect` verifies the JWT (from Authorization header or httpOnly cookie),
 * loads the current user, and attaches it to req.user.
 * Every protected route depends on this running first.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to access this resource.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token. Please log in again.", 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError("This account has been deactivated.", 403));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("Password was recently changed. Please log in again.", 401));
  }

  req.user = currentUser;
  next();
});

/**
 * `restrictTo` implements RBAC — pass allowed roles, e.g. restrictTo('admin', 'seller').
 * Must run after `protect`.
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required before authorization check.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};

/**
 * `optionalAuth` attaches req.user if a valid token is present, but does not
 * block the request otherwise. Useful for endpoints that behave differently
 * for logged-in vs anonymous users (e.g. product listing with wishlist flags).
 */
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) req.user = currentUser;
  } catch (err) {
    // silently ignore invalid tokens on optional routes
  }
  next();
});
