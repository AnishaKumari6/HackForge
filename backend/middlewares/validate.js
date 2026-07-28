const { validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Runs after an array of express-validator checks in a route definition.
 * Collects all validation errors into one readable message instead of
 * failing on just the first one.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    return next(new ErrorResponse(message, 400));
  }
  next();
};

module.exports = validate;
