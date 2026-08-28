/**
 * Operational error class. Anything thrown as AppError is a known,
 * expected failure (bad input, not found, unauthorized) as opposed to
 * a programming bug — this distinction drives how the global error
 * handler formats the response and whether it logs a stack trace.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
