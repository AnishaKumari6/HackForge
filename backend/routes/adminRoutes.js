const express = require("express");
const {
  getDashboardStats,
  getMonthlyGrowth,
  getActivityLogs,
  getPlatformReport,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/analytics/monthly-growth", getMonthlyGrowth);
router.get("/activity-logs", getActivityLogs);
router.get("/reports", getPlatformReport);

module.exports = router;
