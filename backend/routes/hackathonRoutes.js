const express = require("express");
const {
  createHackathon,
  updateHackathon,
  deleteHackathon,
  getHackathons,
  getFeaturedHackathons,
  getTrendingHackathons,
  getPublicStats,
  getHackathonBySlug,
  getMyHackathons,
  updateBanner,
  publishHackathon,
  assignJudges,
  publishResults,
  toggleFeatured,
} = require("../controllers/hackathonController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createHackathonValidator, updateHackathonValidator } = require("../validators/hackathonValidators");
const { hackathonBannerUpload } = require("../config/multer");

const router = express.Router();

// --- Public, specific routes first ---
router.get("/", getHackathons);
router.get("/featured", getFeaturedHackathons);
router.get("/trending", getTrendingHackathons);
router.get("/stats", getPublicStats);
router.get("/mine/list", protect, authorize("organizer", "admin"), getMyHackathons);

// --- Organizer/Admin create ---
router.post("/", protect, authorize("organizer", "admin"), createHackathonValidator, validate, createHackathon);

// --- By id actions ---
router.put("/:id", protect, authorize("organizer", "admin"), updateHackathonValidator, validate, updateHackathon);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteHackathon);
router.put("/:id/banner", protect, authorize("organizer", "admin"), hackathonBannerUpload.single("banner"), updateBanner);
router.put("/:id/publish", protect, authorize("organizer", "admin"), publishHackathon);
router.put("/:id/judges", protect, authorize("organizer", "admin"), assignJudges);
router.put("/:id/publish-results", protect, authorize("organizer", "admin"), publishResults);
router.put("/:id/feature", protect, authorize("admin"), toggleFeatured);

// --- Public slug lookup (kept last: generic catch-all) ---
router.get("/:slug", getHackathonBySlug);

module.exports = router;
