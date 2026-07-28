const ErrorResponse = require("../utils/errorResponse");

/**
 * Centralized error middleware. Normalizes Mongoose/JWT/Multer errors
 * into a consistent { success, message } shape with correct status codes.
 * Must be registered last, after all routes.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = new ErrorResponse(`Resource not found with id of ${err.value}`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ErrorResponse(`Duplicate value for field '${field}'. Please use another value.`, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ErrorResponse("Invalid token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new ErrorResponse("Token expired. Please log in again.", 401);
  }

  // Multer errors
  if (err.name === "MulterError") {
    error = new ErrorResponse(`File upload error: ${err.message}`, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
