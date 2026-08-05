const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Bookmark = require("../models/Bookmark");
const Hackathon = require("../models/Hackathon");

exports.toggleBookmark = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const existing = await Bookmark.findOne({ user: req.user._id, hackathon: hackathon._id });

  if (existing) {
    await existing.deleteOne();
    hackathon.bookmarksCount = Math.max(0, hackathon.bookmarksCount - 1);
    await hackathon.save({ validateBeforeSave: false });
    return res.status(200).json({ success: true, bookmarked: false });
  }

  await Bookmark.create({ user: req.user._id, hackathon: hackathon._id });
  hackathon.bookmarksCount += 1;
  await hackathon.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, bookmarked: true });
});

// @desc    Get all of the logged-in user's bookmarked hackathons
// @route   GET /api/v1/bookmarks
// @access  Private
exports.getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id }).populate({
    path: "hackathon",
    select: "title slug banner startDate endDate status prizePool mode",
  });

  res.status(200).json({ success: true, count: bookmarks?.length, bookmarks: bookmarks.map((b) => b.hackathon) });
});
