/**
 * Custom error class carrying an HTTP status code alongside the message,
 * consumed by the centralized error middleware.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
