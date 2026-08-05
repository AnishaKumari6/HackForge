const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const {
  sendTokenResponse,
  generateAccessToken,
  generateEmailToken,
  verifyEmailToken,
  verifyRefreshToken,
} = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { verifyEmailTemplate, resetPasswordTemplate } = require("../utils/emailTemplates");

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ErrorResponse("An account with this email already exists.", 400));
  }

  // Prevent self-registration as admin; admins are provisioned manually / seeded
  const safeRole = role === "admin" ? "participant" : role || "participant";

  const user = await User.create({ name, email, password, role: safeRole });

  // Fire off verification email — failure here shouldn't block registration
  try {
    const emailToken = generateEmailToken(user._id, "verify");
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${emailToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your HackForge account",
      html: verifyEmailTemplate(user.name, verifyLink),
    });
  } catch (err) {
    console.error("[Auth] Failed to send verification email:", err.message);
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse("Invalid email or password.", 401));
  }

  if (user.isBlocked) {
    return next(new ErrorResponse("Your account has been blocked. Contact support.", 403));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Log the user out (clear refresh token cookie)
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    path: "/api/v1/auth/refresh-token",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// @desc    Issue a new access token using the refresh token cookie
// @route   POST /api/v1/auth/refresh-token
// @access  Public (requires valid httpOnly cookie)
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(new ErrorResponse("No refresh token provided. Please log in.", 401));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    return next(new ErrorResponse("Invalid or expired refresh token. Please log in again.", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || user.isBlocked) {
    return next(new ErrorResponse("User not found or blocked.", 401));
  }

  const accessToken = generateAccessToken(user._id, user.role);
  res.status(200).json({ success: true, accessToken });
});

// @desc    Get currently authenticated user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toPublicProfile() });
});

// @desc    Verify email using token sent to inbox
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  let decoded;
  try {
    decoded = verifyEmailToken(req.params.token);
  } catch (err) {
    return next(new ErrorResponse("Verification link is invalid or has expired.", 400));
  }

  if (decoded.purpose !== "verify") {
    return next(new ErrorResponse("Invalid verification token.", 400));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ErrorResponse("User not found.", 404));
  }

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully." });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
exports.resendVerification = asyncHandler(async (req, res, next) => {
  if (req.user.isEmailVerified) {
    return next(new ErrorResponse("Email is already verified.", 400));
  }

  const emailToken = generateEmailToken(req.user._id, "verify");
  const verifyLink = `${process.env.CLIENT_URL}/verify-email/${emailToken}`;

  await sendEmail({
    to: req.user.email,
    subject: "Verify your HackForge account",
    html: verifyEmailTemplate(req.user.name, verifyLink),
  });

  res.status(200).json({ success: true, message: "Verification email resent." });
});

// @desc    Request a password reset link
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Respond with the same message whether or not the user exists, to avoid leaking account existence
  const genericMessage = "If an account with that email exists, a reset link has been sent.";

  if (!user) {
    return res.status(200).json({ success: true, message: genericMessage });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your HackForge password",
      html: resetPasswordTemplate(user.name, resetLink),
    });
    res.status(200).json({ success: true, message: genericMessage });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Failed to send reset email. Please try again later.", 500));
  }
});

// @desc    Reset password using token from email
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Reset link is invalid or has expired.", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update password while logged in
// @route   PUT /api/v1/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Current password is incorrect.", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
