require("dotenv").config();

const logger = require("./utils/logger");

// Catch programming errors that occur outside express's request/response cycle
process.on("uncaughtException", (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.name} - ${err.message}`);
  process.exit(1);
});

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 8080;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  // Catch unhandled promise rejections (e.g. failed DB queries not caught anywhere)
  process.on("unhandledRejection", (err) => {
    logger.error(`UNHANDLED REJECTION: ${err.name} - ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on deploy/restart signals
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    server.close(() => logger.info("Process terminated."));
  });
};

start();
