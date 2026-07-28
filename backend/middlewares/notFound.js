const ErrorResponse = require("../utils/errorResponse");

/**
 * Catches requests to undefined routes and forwards a 404 to the error handler.
 */
const notFound = (req, res, next) => {
  next(new ErrorResponse(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
