const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Notification = require("../models/Notification");

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    Notification.countDocuments({ recipient: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

// @desc    Mark a single notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) {
    return next(new ErrorResponse("Notification not found.", 404));
  }
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All notifications marked as read." });
});

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!notification) {
    return next(new ErrorResponse("Notification not found.", 404));
  }
  res.status(200).json({ success: true, message: "Notification deleted." });
});
