const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const APIFeatures = require("../utils/apiFeatures");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const logActivity = require("../middlewares/activityLogger");


exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ["name", "bio", "college", "skills", "github", "linkedin", "portfolio"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user: user.toPublicProfile() });
});

// @desc    Upload/replace own avatar
// @route   PUT /api/v1/users/avatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse("Please upload an image file.", 400));
  }

  const user = await User.findById(req.user._id);

  // Remove the old avatar from Cloudinary to avoid orphaned storage
  if (user.avatar?.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => null);
  }

  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, avatar: user.avatar });
});

// @desc    Get a public user profile by id
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found.", 404));
  }
  res.status(200).json({ success: true, user: user.toPublicProfile() });
});

// @desc    List all judges (for organizer to assign to a hackathon)
// @route   GET /api/v1/users/judges
// @access  Private (organizer, admin)
exports.listJudges = asyncHandler(async (req, res) => {
  const judges = await User.find({ role: "judge", isBlocked: false }).select(
    "name email avatar bio skills"
  );
  res.status(200).json({ success: true, count: judges.length, judges });
});

// ==========================
// ADMIN-ONLY USER MANAGEMENT
// ==========================

// @desc    Get all users with filter/search/pagination (admin)
// @route   GET /api/v1/users
// @access  Private (admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const baseQuery = User.find();
  const features = new APIFeatures(baseQuery, req.query).filter().search(["name", "email"]).sort().limitFields().paginate();

  const users = await features.query;
  const meta = await features.getPaginationMeta(User);

  res.status(200).json({ success: true, count: users.length, meta, users });
});

// @desc    Block a user
// @route   PUT /api/v1/users/:id/block
// @access  Private (admin)
exports.blockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found.", 404));
  }
  if (user.role === "admin") {
    return next(new ErrorResponse("Admin accounts cannot be blocked.", 400));
  }

  user.isBlocked = true;
  user.blockedReason = req.body.reason || "Violation of platform policy";
  await user.save({ validateBeforeSave: false });

  await logActivity({
    actorId: req.user._id,
    action: "USER_BLOCKED",
    targetType: "User",
    targetId: user._id,
    description: `Blocked user ${user.email}`,
    req,
  });

  res.status(200).json({ success: true, message: "User blocked.", user: user.toPublicProfile() });
});

// @desc    Unblock a user
// @route   PUT /api/v1/users/:id/unblock
// @access  Private (admin)
exports.unblockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found.", 404));
  }

  user.isBlocked = false;
  user.blockedReason = "";
  await user.save({ validateBeforeSave: false });

  await logActivity({
    actorId: req.user._id,
    action: "USER_UNBLOCKED",
    targetType: "User",
    targetId: user._id,
    description: `Unblocked user ${user.email}`,
    req,
  });

  res.status(200).json({ success: true, message: "User unblocked.", user: user.toPublicProfile() });
});

// @desc    Change a user's role (e.g. promote to organizer/judge)
// @route   PUT /api/v1/users/:id/role
// @access  Private (admin)
exports.changeUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!["admin", "organizer", "participant", "judge"].includes(role)) {
    return next(new ErrorResponse("Invalid role.", 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) {
    return next(new ErrorResponse("User not found.", 404));
  }

  await logActivity({
    actorId: req.user._id,
    action: "USER_ROLE_CHANGED",
    targetType: "User",
    targetId: user._id,
    description: `Changed role of ${user.email} to ${role}`,
    req,
  });

  res.status(200).json({ success: true, user: user.toPublicProfile() });
});

// @desc    Delete a user permanently
// @route   DELETE /api/v1/users/:id
// @access  Private (admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found.", 404));
  }
  if (user.role === "admin") {
    return next(new ErrorResponse("Admin accounts cannot be deleted.", 400));
  }

  await user.deleteOne();

  await logActivity({
    actorId: req.user._id,
    action: "USER_DELETED",
    targetType: "User",
    targetId: user._id,
    description: `Deleted user ${user.email}`,
    req,
  });

  res.status(200).json({ success: true, message: "User deleted." });
});
