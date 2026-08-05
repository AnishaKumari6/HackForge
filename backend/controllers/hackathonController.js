const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const APIFeatures = require("../utils/apiFeatures");
const Hackathon = require("../models/Hackathon");
const Registration = require("../models/Registration");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const logActivity = require("../middlewares/activityLogger");
const sendEmail = require("../utils/sendEmail");
const { resultsAnnouncedTemplate } = require("../utils/emailTemplates");

exports.createHackathon = asyncHandler(async (req, res, next) => {
  const payload = { ...req.body, organizer: req.user._id };

  if (new Date(payload.registrationEnd) < new Date(payload.registrationStart)) {
    return next(new ErrorResponse("registrationEnd must be after registrationStart.", 400));
  }
  if (new Date(payload.endDate) < new Date(payload.startDate)) {
    return next(new ErrorResponse("endDate must be after startDate.", 400));
  }

  const hackathon = await Hackathon.create(payload);

  res.status(201).json({ success: true, hackathon });
});

// @desc    Update a hackathon (only the owning organizer or admin)
// @route   PUT /api/v1/hackathons/:id
// @access  Private (organizer-owner, admin)
exports.updateHackathon = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to update this hackathon.", 403));
  }

  const restrictedFields = ["organizer", "registeredCount", "resultsPublished", "views", "bookmarksCount"];
  restrictedFields.forEach((f) => delete req.body[f]);

  Object.assign(hackathon, req.body);
  await hackathon.save();

  res.status(200).json({ success: true, hackathon });
});

// @desc    Delete own hackathon (organizer) or any hackathon (admin)
// @route   DELETE /api/v1/hackathons/:id
// @access  Private (organizer-owner, admin)
exports.deleteHackathon = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to delete this hackathon.", 403));
  }

  if (hackathon.banner?.publicId) {
    await cloudinary.uploader.destroy(hackathon.banner.publicId).catch(() => null);
  }

  // Cascade delete dependent data to avoid orphaned records
  await Promise.all([
    Registration.deleteMany({ hackathon: hackathon._id }),
    Team.deleteMany({ hackathon: hackathon._id }),
    Submission.deleteMany({ hackathon: hackathon._id }),
  ]);

  await hackathon.deleteOne();

  await logActivity({
    actorId: req.user._id,
    action: "HACKATHON_DELETED",
    targetType: "Hackathon",
    targetId: hackathon._id,
    description: `Deleted hackathon "${hackathon.title}"`,
    req,
  });

  res.status(200).json({ success: true, message: "Hackathon deleted." });
});

// @desc    Get all hackathons — public listing with filter/search/sort/pagination
// @route   GET /api/v1/hackathons
// @access  Public
exports.getHackathons = asyncHandler(async (req, res) => {
  const now = new Date();
  const baseFilter = { status: { $in: ["published", "ongoing", "completed"] } };

  // Convenience filters translated into Mongo queries
  const extra = {};
  if (req.query.registrationOpen === "true") {
    extra.registrationStart = { $lte: now };
    extra.registrationEnd = { $gte: now };
  } else if (req.query.registrationOpen === "false") {
    extra.registrationEnd = { $lt: now };
  }
  if (req.query.upcoming === "true") {
    extra.startDate = { $gt: now };
  }
  if (req.query.completed === "true") {
    extra.status = "completed";
  }

  const cleanQuery = { ...req.query };
  delete cleanQuery.registrationOpen;
  delete cleanQuery.upcoming;
  delete cleanQuery.completed;

  const query = Hackathon.find({ ...baseFilter, ...extra })
    .populate("organizer", "name avatar")
    .select("-rules -judgingCriteria");

  const features = new APIFeatures(query, cleanQuery)
    .filter()
    .search(["title", "tagline", "description"])
    .sort()
    .paginate();

  const hackathons = await features.query;
  const meta = await features.getPaginationMeta(Hackathon, { ...baseFilter, ...extra });

  res.status(200).json({ success: true, count: hackathons?.length, meta, hackathons });
});

// @desc    Get featured hackathons for homepage
// @route   GET /api/v1/hackathons/featured
// @access  Public
exports.getFeaturedHackathons = asyncHandler(async (req, res) => {
  const hackathons = await Hackathon.find({ isFeatured: true, status: { $in: ["published", "ongoing"] } })
    .populate("organizer", "name avatar")
    .limit(6);
  res.status(200).json({ success: true, hackathons });
});

// @desc    Get trending hackathons (by views + registrations)
// @route   GET /api/v1/hackathons/trending
// @access  Public
exports.getTrendingHackathons = asyncHandler(async (req, res) => {
  const hackathons = await Hackathon.find({ status: { $in: ["published", "ongoing"] } })
    .sort({ isTrending: -1, registeredCount: -1, views: -1 })
    .limit(6)
    .populate("organizer", "name avatar");
  res.status(200).json({ success: true, hackathons });
});

// @desc    Get platform statistics for the homepage stats section
// @route   GET /api/v1/hackathons/stats
// @access  Public
exports.getPublicStats = asyncHandler(async (req, res) => {
  const [totalHackathons, totalRegistrations, totalPrizePoolAgg] = await Promise.all([
    Hackathon.countDocuments({ status: { $in: ["published", "ongoing", "completed"] } }),
    Registration.countDocuments({ status: "approved" }),
    Hackathon.aggregate([{ $group: { _id: null, total: { $sum: "$prizePool" } } }]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalHackathons,
      totalRegistrations,
      totalPrizePool: totalPrizePoolAgg[0]?.total || 0,
    },
  });
});

// @desc    Get single hackathon by slug (increments view count)
// @route   GET /api/v1/hackathons/:slug
// @access  Public
exports.getHackathonBySlug = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug })
    .populate("organizer", "name avatar email")
    .populate("judges", "name avatar bio");

  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  hackathon.views += 1;
  await hackathon.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, hackathon });
});

// @desc    Get hackathons created by the logged-in organizer
// @route   GET /api/v1/hackathons/mine/list
// @access  Private (organizer)
exports.getMyHackathons = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Hackathon.find({ organizer: req.user._id }), req.query).filter().sort().paginate();
  const hackathons = await features.query;
  const meta = await features.getPaginationMeta(Hackathon, { organizer: req.user._id });
  res.status(200).json({ success: true, count: hackathons?.length, meta, hackathons });
});

// @desc    Upload/replace hackathon banner
// @route   PUT /api/v1/hackathons/:id/banner
// @access  Private (organizer-owner, admin)
exports.updateBanner = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse("Please upload a banner image.", 400));
  }

  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  if (hackathon.banner?.publicId) {
    await cloudinary.uploader.destroy(hackathon.banner.publicId).catch(() => null);
  }

  hackathon.banner = { url: req.file.path, publicId: req.file.filename };
  await hackathon.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, banner: hackathon.banner });
});

// @desc    Publish a draft hackathon (makes it publicly visible)
// @route   PUT /api/v1/hackathons/:id/publish
// @access  Private (organizer-owner, admin)
exports.publishHackathon = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  hackathon.status = "published";
  await hackathon.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Hackathon published.", hackathon });
});

// @desc    Assign judges to a hackathon
// @route   PUT /api/v1/hackathons/:id/judges
// @access  Private (organizer-owner, admin)
exports.assignJudges = asyncHandler(async (req, res, next) => {
  const { judgeIds } = req.body; // array of user ids
  if (!Array.isArray(judgeIds)) {
    return next(new ErrorResponse("judgeIds must be an array of user ids.", 400));
  }

  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  hackathon.judges = judgeIds;
  await hackathon.save({ validateBeforeSave: false });

  // Notify each newly assigned judge
  const notifications = judgeIds.map((judgeId) => ({
    recipient: judgeId,
    type: "judge_assigned",
    title: "You've been assigned as a judge",
    message: `You have been assigned to judge "${hackathon.title}".`,
    link: `/hackathons/${hackathon.slug}`,
    relatedHackathon: hackathon._id,
  }));
  const created = await Notification.insertMany(notifications);

  const io = req.app.get("io");
  created.forEach((n) => io.to(n.recipient.toString()).emit("notification", n));

  res.status(200).json({ success: true, hackathon });
});

// @desc    Publish results / announce winners (locks in submission ranks, emails participants)
// @route   PUT /api/v1/hackathons/:id/publish-results
// @access  Private (organizer-owner, admin)
exports.publishResults = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  const submissions = await Submission.find({ hackathon: hackathon._id, status: "reviewed" })
    .sort({ averageScore: -1 })
    .populate({ path: "team", populate: { path: "members.user", select: "name email" } });

  await Promise.all(
    submissions.map((sub, index) => Submission.findByIdAndUpdate(sub._id, { rank: index + 1 }))
  );

  hackathon.resultsPublished = true;
  hackathon.status = "completed";
  await hackathon.save({ validateBeforeSave: false });

  await logActivity({
    actorId: req.user._id,
    action: "RESULTS_PUBLISHED",
    targetType: "Hackathon",
    targetId: hackathon._id,
    description: `Published results for "${hackathon.title}"`,
    req,
  });

  // Notify + email every participant across every team
  const io = req.app.get("io");
  const notifyPromises = [];

  for (const sub of submissions) {
    for (const member of sub.team.members) {
      notifyPromises.push(
        Notification.create({
          recipient: member.user._id,
          type: "results_announced",
          title: "Results are out!",
          message: `Results for "${hackathon.title}" have been published.`,
          link: `/hackathons/${hackathon.slug}/leaderboard`,
          relatedHackathon: hackathon._id,
        }).then((n) => io.to(member.user._id.toString()).emit("notification", n))
      );
      notifyPromises.push(
        sendEmail({
          to: member.user.email,
          subject: `Results announced: ${hackathon.title}`,
          html: resultsAnnouncedTemplate(
            member.user.name,
            hackathon.title,
            `${process.env.CLIENT_URL}/hackathons/${hackathon.slug}/leaderboard`
          ),
        }).catch((err) => console.error("[Email] Failed to send results email:", err.message))
      );
    }
  }
  await Promise.all(notifyPromises);

  io.to(`leaderboard:${hackathon._id}`).emit("leaderboardUpdated");

  res.status(200).json({ success: true, message: "Results published and participants notified." });
});

// @desc    Toggle featured flag on a hackathon
// @route   PUT /api/v1/hackathons/:id/feature
// @access  Private (admin)
exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }
  hackathon.isFeatured = !hackathon.isFeatured;
  await hackathon.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, isFeatured: hackathon.isFeatured });
});
