const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");
const logger = require("./utils/logger");

const app = express();

// --- Security middleware ---
app.use(helmet()); // sets secure HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// --- Global rate limiting ---
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

// --- Body & cookie parsing ---
app.use(express.json({ limit: "10kb" })); // limits payload size against DoS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// --- Data sanitization ---
app.use(mongoSanitize()); // strips $ and . from req.body/query/params -> prevents NoSQL injection
app.use(xss()); // strips malicious HTML/JS from input -> prevents stored XSS

app.use(compression()); // gzip responses

// --- Logging ---
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

// --- API routes (20+ endpoints across auth/products/categories/orders/payments) ---
app.use("/api/v1", apiRoutes);

// --- 404 handler ---
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, 404));
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
