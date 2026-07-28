const express = require("express");
const {
  getMyRegistrations,
  getRegistrationQR,
  checkIn,
  cancelRegistration,
  getRegistrationsForHackathon,
  exportRegistrationsCSV,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/mine", protect, authorize("participant"), getMyRegistrations);
router.get("/hackathon/:hackathonId", protect, authorize("organizer", "admin"), getRegistrationsForHackathon);
router.get("/hackathon/:hackathonId/export", protect, authorize("organizer", "admin"), exportRegistrationsCSV);
router.get("/:id/qr", protect, getRegistrationQR);
router.put("/:id/check-in", protect, authorize("organizer", "admin"), checkIn);
router.put("/:id/cancel", protect, authorize("participant"), cancelRegistration);

module.exports = router;
