const express = require("express");
const {
  createTeam,
  getTeam,
  getMyTeamForHackathon,
  inviteMember,
  acceptInvite,
  declineInvite,
  leaveTeam,
  transferLeadership,
  deleteTeam,
  submitTeamForApproval,
  getTeamsForHackathon,
  approveTeam,
  rejectTeam,
} = require("../controllers/teamController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createTeamValidator, inviteMemberValidator } = require("../validators/teamValidators");

const router = express.Router();

router.post("/", protect, authorize("participant"), createTeamValidator, validate, createTeam);
router.get("/mine/:hackathonId", protect, getMyTeamForHackathon);
router.get("/hackathon/:hackathonId", protect, authorize("organizer", "admin"), getTeamsForHackathon);

router.put("/invite/:token/accept", protect, acceptInvite);
router.put("/invite/:token/decline", protect, declineInvite);

router.get("/:id", protect, getTeam);
router.post("/:id/invite", protect, inviteMemberValidator, validate, inviteMember);
router.put("/:id/leave", protect, leaveTeam);
router.put("/:id/transfer-leadership", protect, transferLeadership);
router.put("/:id/submit", protect, submitTeamForApproval);
router.put("/:id/approve", protect, authorize("organizer", "admin"), approveTeam);
router.put("/:id/reject", protect, authorize("organizer", "admin"), rejectTeam);
router.delete("/:id", protect, deleteTeam);

module.exports = router;
