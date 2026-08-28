const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Run after an array of express-validator check() rules.
 * Collects all validation failures into a single readable AppError.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`);
    return next(new AppError(messages.join(", "), 400));
  }
  next();
};
