const QRCode = require("qrcode");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const APIFeatures = require("../utils/apiFeatures");
const Registration = require("../models/Registration");
const Hackathon = require("../models/Hackathon");
const toCSV = require("../utils/toCSV");

exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ participant: req.user._id })
    .populate("hackathon", "title slug banner startDate endDate status")
    .populate("team", "name");
  res.status(200).json({ success: true, count: registrations?.length, registrations });
});

// @desc    Get a single registration's QR code (generates on first request)
// @route   GET /api/v1/registrations/:id/qr
// @access  Private (owner participant, organizer, admin)
exports.getRegistrationQR = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id).populate("hackathon", "organizer title");
  if (!registration) {
    return next(new ErrorResponse("Registration not found.", 404));
  }

  const isSelf = registration.participant.toString() === req.user._id.toString();
  const isOrganizer = registration.hackathon.organizer.toString() === req.user._id.toString();
  if (!isSelf && !isOrganizer && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  if (!registration.qrCode) {
    const payload = JSON.stringify({ registrationId: registration._id.toString() });
    registration.qrCode = await QRCode.toDataURL(payload);
    await registration.save({ validateBeforeSave: false });
  }

  res.status(200).json({ success: true, qrCode: registration.qrCode });
});

// @desc    Check a participant in at the venue by scanning their QR code
// @route   PUT /api/v1/registrations/:id/check-in
// @access  Private (organizer-owner, admin)
exports.checkIn = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id).populate("hackathon", "organizer");
  if (!registration) {
    return next(new ErrorResponse("Registration not found.", 404));
  }

  const isOwner = registration.hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }
  if (registration.status !== "approved") {
    return next(new ErrorResponse("Only approved registrations can be checked in.", 400));
  }

  registration.checkedIn = true;
  registration.checkedInAt = new Date();
  await registration.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Checked in successfully.", registration });
});

// @desc    Cancel own registration
// @route   PUT /api/v1/registrations/:id/cancel
// @access  Private (owner participant)
exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    return next(new ErrorResponse("Registration not found.", 404));
  }
  if (registration.participant.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  registration.status = "cancelled";
  await registration.save({ validateBeforeSave: false });

  await Hackathon.findByIdAndUpdate(registration.hackathon, { $inc: { registeredCount: -1 } });

  res.status(200).json({ success: true, message: "Registration cancelled." });
});

// =========================================
// ORGANIZER: view + export registrations
// =========================================

// @desc    Get all registrations for a hackathon (organizer view)
// @route   GET /api/v1/registrations/hackathon/:hackathonId
// @access  Private (organizer-owner, admin)
exports.getRegistrationsForHackathon = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }
  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  const query = Registration.find({ hackathon: req.params.hackathonId })
    .populate("participant", "name email college")
    .populate("team", "name");

  const features = new APIFeatures(query, req.query).filter().sort().paginate();
  const registrations = await features.query;
  const meta = await features.getPaginationMeta(Registration, { hackathon: req.params.hackathonId });

  res.status(200).json({ success: true, count: registrations?.length, meta, registrations });
});

// @desc    Export all registrations for a hackathon as CSV
// @route   GET /api/v1/registrations/hackathon/:hackathonId/export
// @access  Private (organizer-owner, admin)
exports.exportRegistrationsCSV = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId);
  if (!hackathon) {
    return next(new ErrorResponse("Hackathon not found.", 404));
  }
  const isOwner = hackathon.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized.", 403));
  }

  const registrations = await Registration.find({ hackathon: req.params.hackathonId })
    .populate("participant", "name email college")
    .populate("team", "name");

  const csv = toCSV(registrations, [
    { label: "Participant Name", value: (r) => r.participant?.name },
    { label: "Email", value: (r) => r.participant?.email },
    { label: "College", value: (r) => r.participant?.college },
    { label: "Team", value: (r) => r.team?.name },
    { label: "Status", value: (r) => r.status },
    { label: "Checked In", value: (r) => (r.checkedIn ? "Yes" : "No") },
    { label: "Registered At", value: (r) => r.createdAt?.toISOString() },
  ]);

  res.header("Content-Type", "text/csv");
  res.attachment(`${hackathon.slug}-registrations.csv`);
  res.send(csv);
});
