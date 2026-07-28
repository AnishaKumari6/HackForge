const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Review = require("../models/Review");
const Submission = require("../models/Submission");
const Hackathon = require("../models/Hackathon");
const recalcSubmissionScore = async (submissionId, io) => {
  const submission = await Submission.findById(submissionId).populate("hackathon", "judges");
  const reviews = await Review.find({ submission: submissionId });

  const avg = reviews.length
    ? Number((reviews.reduce((sum, r) => sum + r.totalScore, 0) / reviews.length).toFixed(2))
    : 0;

  submission.averageScore = avg;
  submission.status =
    reviews.length >= submission.hackathon.judges.length && submission.hackathon.judges.length > 0
      ? "reviewed"
      : "under_review";
  await submission.save({ validateBeforeSave: false });

  if (io) {
    io.to(`leaderboard:${submission.hackathon._id}`).emit("leaderboardUpdated");
  }
};

// @desc    Submit or update a judge's evaluation for a submission
// @route   POST /api/v1/reviews/submission/:submissionId
// @access  Private (judge)
exports.submitReview = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.submissionId).populate("hackathon", "judges endDate");
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }

  const isAssignedJudge = submission.hackathon.judges.some((j) => j.toString() === req.user._id.toString());
  if (!isAssignedJudge) {
    return next(new ErrorResponse("You are not assigned to judge this hackathon.", 403));
  }
  if (!["submitted", "under_review", "reviewed"].includes(submission.status)) {
    return next(new ErrorResponse("This project has not been submitted yet.", 400));
  }

  const { scores, comments } = req.body;

  const review = await Review.findOneAndUpdate(
    { submission: submission._id, judge: req.user._id },
    {
      $set: { scores, comments },
      $setOnInsert: { hackathon: submission.hackathon._id, submission: submission._id, judge: req.user._id },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await recalcSubmissionScore(submission._id, req.app.get("io"));

  res.status(200).json({ success: true, message: "Evaluation submitted.", review });
});

// @desc    Get the logged-in judge's review for a specific submission (to prefill the form)
// @route   GET /api/v1/reviews/submission/:submissionId/mine
// @access  Private (judge)
exports.getMyReviewForSubmission = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ submission: req.params.submissionId, judge: req.user._id });
  res.status(200).json({ success: true, review: review || null });
});

// @desc    Get all projects assigned to the logged-in judge for a hackathon, with review status
// @route   GET /api/v1/reviews/assigned/:hackathonId
// @access  Private (judge)
exports.getAssignedProjects = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }
  const isAssigned = hackathon.judges.some((j) => j.toString() === req.user._id.toString());
  if (!isAssigned) {
    return next(new ErrorResponse("You are not assigned to this hackathon.", 403));
  }

  const submissions = await Submission.find({
    hackathon: hackathon._id,
    status: { $in: ["submitted", "under_review", "reviewed"] },
  })
    .populate("team", "name")
    .select("-problemStatement -solution -description");

  const myReviews = await Review.find({ hackathon: hackathon._id, judge: req.user._id });
  const reviewedIds = new Set(myReviews.map((r) => r.submission.toString()));

  const projects = submissions.map((s) => ({
    ...s.toObject(),
    reviewedByMe: reviewedIds.has(s._id.toString()),
  }));

  res.status(200).json({ success: true, count: projects.length, projects });
});

// @desc    Get the logged-in judge's evaluation history across all hackathons
// @route   GET /api/v1/reviews/history
// @access  Private (judge)
exports.getReviewHistory = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ judge: req.user._id })
    .populate("submission", "projectName")
    .populate("hackathon", "title slug")
    .sort("-createdAt");
  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    Get all reviews for a submission (organizer/admin oversight view)
// @route   GET /api/v1/reviews/submission/:submissionId
// @access  Private (organizer-owner, admin)
exports.getReviewsForSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.submissionId).populate("hackathon", "organizer");
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  const isOwner = submission.hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  const reviews = await Review.find({ submission: req.params.submissionId }).populate("judge", "name avatar");
  res.status(200).json({ success: true, reviews });
});

// @desc    Get the public leaderboard for a hackathon
// @route   GET /api/v1/reviews/leaderboard/:hackathonId
// @access  Public
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    hackathon: req.params.hackathonId,
    status: { $in: ["under_review", "reviewed"] },
  })
    .populate("team", "name")
    .sort({ averageScore: -1 })
    .select("projectName team averageScore rank techStack");

  const leaderboard = submissions.map((s, index) => ({
    rank: s.rank || index + 1,
    project: s.projectName,
    team: s.team?.name,
    score: s.averageScore,
    techStack: s.techStack,
    submissionId: s._id,
  }));

  res.status(200).json({ success: true, leaderboard });
});
