const asyncHandler = require("../utils/asyncHandler");
const APIFeatures = require("../utils/apiFeatures");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Registration = require("../models/Registration");
const Submission = require("../models/Submission");
const ActivityLog = require("../models/ActivityLog");

// @desc    Get high-level dashboard counters + breakdowns for the admin dashboard
// @route   GET /api/v1/admin/dashboard
// @access  Private (admin)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    usersByRole,
    totalHackathons,
    hackathonsByStatus,
    totalRegistrations,
    totalSubmissions,
    blockedUsers,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Hackathon.countDocuments(),
    Hackathon.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Registration.countDocuments({ status: "approved" }),
    Submission.countDocuments({ status: { $in: ["submitted", "under_review", "reviewed"] } }),
    User.countDocuments({ isBlocked: true }),
    ActivityLog.find().sort("-createdAt").limit(10).populate("actor", "name role"),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      usersByRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      totalHackathons,
      hackathonsByStatus: hackathonsByStatus.reduce((acc, h) => ({ ...acc, [h._id]: h.count }), {}),
      totalRegistrations,
      totalSubmissions,
      blockedUsers,
    },
    recentActivity,
  });
});
exports.getMonthlyGrowth = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAgg = (Model, dateField = "createdAt") =>
    Model.aggregate([
      { $match: { [dateField]: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: `$${dateField}` }, month: { $month: `$${dateField}` } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

  const [userGrowth, hackathonGrowth, registrationGrowth] = await Promise.all([
    monthlyAgg(User),
    monthlyAgg(Hackathon),
    monthlyAgg(Registration),
  ]);

  // Normalize into a 12-slot array so the frontend chart always has a full timeline
  const buildSeries = (agg) => {
    const map = new Map(agg.map((a) => [`${a._id.year}-${a._id.month}`, a.count]));
    const series = [];
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(twelveMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      series.push({
        label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
        count: map.get(key) || 0,
      });
    }
    return series;
  };

  res.status(200).json({
    success: true,
    growth: {
      users: buildSeries(userGrowth),
      hackathons: buildSeries(hackathonGrowth),
      registrations: buildSeries(registrationGrowth),
    },
  });
});

// @desc    Get paginated, filterable activity logs
// @route   GET /api/v1/admin/activity-logs
// @access  Private (admin)
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const query = ActivityLog.find().populate("actor", "name email role");
  const features = new APIFeatures(query, req.query).filter().sort().paginate();

  const logs = await features.query;
  const meta = await features.getPaginationMeta(ActivityLog);

  res.status(200).json({ success: true, count: logs.length, meta, logs });
});

// @desc    Generate a simple platform report (users, hackathons, registrations, submissions summary)
// @route   GET /api/v1/admin/reports
// @access  Private (admin)
exports.getPlatformReport = asyncHandler(async (req, res) => {
  const [topHackathonsByRegistrations, topOrganizers] = await Promise.all([
    Hackathon.find().sort({ registeredCount: -1 }).limit(5).select("title registeredCount prizePool status"),
    Hackathon.aggregate([
      { $group: { _id: "$organizer", hackathonsCreated: { $sum: 1 }, totalRegistrations: { $sum: "$registeredCount" } } },
      { $sort: { hackathonsCreated: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "organizer" } },
      { $unwind: "$organizer" },
      { $project: { "organizer.name": 1, "organizer.email": 1, hackathonsCreated: 1, totalRegistrations: 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    report: { topHackathonsByRegistrations, topOrganizers },
  });
});
