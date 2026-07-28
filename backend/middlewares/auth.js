const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { verifyAccessToken } = require("../utils/generateToken");
const User = require("../models/User");

/**
 * Verifies the Bearer access token, loads the user, and attaches it to req.user.
 * Rejects blocked users so a ban takes effect immediately, mid-session.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized. Please log in.", 401));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new ErrorResponse("Session expired or invalid token. Please log in again.", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new ErrorResponse("User belonging to this token no longer exists.", 401));
  }

  if (user.isBlocked) {
    return next(new ErrorResponse("Your account has been blocked. Contact support.", 403));
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to the given roles. Must be used after `protect`.
 * Usage: authorize("admin", "organizer")
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse("Not authorized.", 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ErrorResponse(`Role '${req.user.role}' is not permitted to access this resource.`, 403));
  }
  next();
};

module.exports = { protect, authorize };
