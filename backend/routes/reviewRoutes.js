const express = require("express");
const {
  submitReview,
  getMyReviewForSubmission,
  getAssignedProjects,
  getReviewHistory,
  getReviewsForSubmission,
  getLeaderboard,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { reviewValidator } = require("../validators/reviewValidators");

const router = express.Router();

router.get("/leaderboard/:hackathonId", getLeaderboard);
router.get("/history", protect, authorize("judge"), getReviewHistory);
router.get("/assigned/:hackathonId", protect, authorize("judge"), getAssignedProjects);
router.get("/submission/:submissionId/mine", protect, authorize("judge"), getMyReviewForSubmission);
router.get("/submission/:submissionId", protect, authorize("organizer", "admin"), getReviewsForSubmission);
router.post("/submission/:submissionId", protect, authorize("judge"), reviewValidator, validate, submitReview);

module.exports = router;
