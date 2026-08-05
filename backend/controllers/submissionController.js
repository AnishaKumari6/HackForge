const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const APIFeatures = require("../utils/apiFeatures");
const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const cloudinary = require("../config/cloudinary");

const assertTeamMembership = async (teamId, userId) => {
  const team = await Team.findById(teamId).populate("hackathon");
  if (!team) throw new ErrorResponse("Team not found.", 404);
  const isMember = team.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) throw new ErrorResponse("You are not a member of this team.", 403);
  if (team.status !== "approved") throw new ErrorResponse("Your team must be approved before submitting.", 400);
  return team;
};

// @desc    Create or update (autosave draft) a project submission
// @route   POST /api/v1/submissions/team/:teamId
// @access  Private (team member)
exports.upsertSubmission = asyncHandler(async (req, res, next) => {
  const team = await assertTeamMembership(req.params.teamId, req.user._id);

  const now = new Date();
  if (now > team.hackathon.endDate) {
    return next(new ErrorResponse("The submission window for this hackathon has closed.", 400));
  }

  const allowedFields = [
    "projectName",
    "problemStatement",
    "solution",
    "description",
    "githubLink",
    "demoLink",
    "techStack",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const submission = await Submission.findOneAndUpdate(
    { team: team._id, hackathon: team.hackathon._id },
    {
      $set: updates,
      $setOnInsert: {
        team: team._id,
        hackathon: team.hackathon._id,
        submittedBy: req.user._id,
        status: "draft",
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, submission });
});

// @desc    Finalize/lock in a submission (status -> submitted)
// @route   PUT /api/v1/submissions/:id/submit
// @access  Private (team member)
exports.finalizeSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id).populate("hackathon", "endDate");
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  await assertTeamMembership(submission.team, req.user._id);

  if (new Date() > submission.hackathon.endDate) {
    return next(new ErrorResponse("The submission window has closed.", 400));
  }
  if (!submission.githubLink || !submission.projectName || !submission.description) {
    return next(new ErrorResponse("Complete all required fields before submitting.", 400));
  }

  submission.status = "submitted";
  submission.submittedAt = new Date();
  await submission.save();

  res.status(200).json({ success: true, message: "Project submitted successfully.", submission });
});

// @desc    Upload project images (up to 6)
// @route   PUT /api/v1/submissions/:id/images
// @access  Private (team member)
exports.uploadImages = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  await assertTeamMembership(submission.team, req.user._id);

  if (!req.files || req.files?.length === 0) {
    return next(new ErrorResponse("Please upload at least one image.", 400));
  }

  const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  submission.images.push(...newImages);
  if (submission.images?.length > 6) {
    return next(new ErrorResponse("A submission can have at most 6 images.", 400));
  }
  await submission.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, images: submission.images });
});

// @desc    Remove a single project image
// @route   DELETE /api/v1/submissions/:id/images/:imageId
// @access  Private (team member)
exports.deleteImage = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  await assertTeamMembership(submission.team, req.user._id);

  const image = submission.images.id(req.params.imageId);
  if (!image) {
    return next(new ErrorResponse("Image not found.", 404));
  }

  await cloudinary.uploader.destroy(image.publicId).catch(() => null);
  submission.images.pull(req.params.imageId);
  await submission.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, images: submission.images });
});

// @desc    Upload presentation PDF
// @route   PUT /api/v1/submissions/:id/pdf
// @access  Private (team member)
exports.uploadPdf = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  await assertTeamMembership(submission.team, req.user._id);

  if (!req.file) {
    return next(new ErrorResponse("Please upload a PDF file.", 400));
  }

  if (submission.presentationPdf?.publicId) {
    await cloudinary.uploader.destroy(submission.presentationPdf.publicId, { resource_type: "raw" }).catch(() => null);
  }

  submission.presentationPdf = { url: req.file.path, publicId: req.file.filename };
  await submission.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, presentationPdf: submission.presentationPdf });
});

// @desc    Upload demo video
// @route   PUT /api/v1/submissions/:id/video
// @access  Private (team member)
exports.uploadVideo = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  await assertTeamMembership(submission.team, req.user._id);

  if (!req.file) {
    return next(new ErrorResponse("Please upload a video file.", 400));
  }

  if (submission.demoVideo?.publicId) {
    await cloudinary.uploader.destroy(submission.demoVideo.publicId, { resource_type: "video" }).catch(() => null);
  }

  submission.demoVideo = { url: req.file.path, publicId: req.file.filename };
  await submission.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, demoVideo: submission.demoVideo });
});

// @desc    Get a single submission by id
// @route   GET /api/v1/submissions/:id
// @access  Private
exports.getSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id)
    .populate("team", "name members")
    .populate("hackathon", "title slug judgingCriteria");
  if (!submission) {
    return next(new ErrorResponse("Submission not found.", 404));
  }
  res.status(200).json({ success: true, submission });
});

// @desc    Get the logged-in user's team's submission for a hackathon
// @route   GET /api/v1/submissions/mine/:hackathonId
// @access  Private
exports.getMySubmission = asyncHandler(async (req, res) => {
  const team = await Team.findOne({ hackathon: req.params.hackathonId, "members.user": req.user._id });
  if (!team) {
    return res.status(200).json({ success: true, submission: null });
  }
  const submission = await Submission.findOne({ team: team._id, hackathon: req.params.hackathonId });
  res.status(200).json({ success: true, submission: submission || null, team });
});

// @desc    Get all submissions for a hackathon (organizer/judge view)
// @route   GET /api/v1/submissions/hackathon/:hackathonId
// @access  Private (organizer-owner, judge assigned, admin)
exports.getSubmissionsForHackathon = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }

  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  const isJudge = hackathon.judges.some((j) => j.toString() === req.user._id.toString());
  if (!isOwner && !isJudge && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  const filter = { hackathon: req.params.hackathonId, status: { $in: ["submitted", "under_review", "reviewed"] } };
  const query = Submission.find(filter).populate("team", "name members").select("-problemStatement -solution");

  const features = new APIFeatures(query, req.query).sort().paginate();
  const submissions = await features.query;
  const meta = await features.getPaginationMeta(Submission, filter);

  res.status(200).json({ success: true, count: submissions?.length, meta, submissions });
});

// @desc    Public project gallery (across all completed/ongoing hackathons)
// @route   GET /api/v1/submissions/gallery
// @access  Public
exports.getPublicGallery = asyncHandler(async (req, res) => {
  const filter = {
    isPubliclyVisible: true,
    status: { $in: ["submitted", "under_review", "reviewed"] },
  };

  const query = Submission.find(filter)
    .populate("team", "name")
    .populate("hackathon", "title slug")
    .select("-problemStatement -solution");

  const features = new APIFeatures(query, req.query).search(["projectName", "description"]).sort().paginate();
  const submissions = await features.query;
  const meta = await features.getPaginationMeta(Submission, filter);

  res.status(200).json({ success: true, count: submissions?.length, meta, submissions });
});
