const express = require("express");
const {
  upsertSubmission,
  finalizeSubmission,
  uploadImages,
  deleteImage,
  uploadPdf,
  uploadVideo,
  getSubmission,
  getMySubmission,
  getSubmissionsForHackathon,
  getPublicGallery,
} = require("../controllers/submissionController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { submissionValidator } = require("../validators/submissionValidators");
const {
  submissionImagesUpload,
  submissionPdfUpload,
  submissionVideoUpload,
} = require("../config/multer");

const router = express.Router();

router.get("/gallery", getPublicGallery);
router.get("/mine/:hackathonId", protect, getMySubmission);
router.get("/hackathon/:hackathonId", protect, authorize("organizer", "judge", "admin"), getSubmissionsForHackathon);

router.post("/team/:teamId", protect, authorize("participant"), submissionValidator, validate, upsertSubmission);
router.put("/:id/submit", protect, authorize("participant"), finalizeSubmission);
router.put("/:id/images", protect, authorize("participant"), submissionImagesUpload.array("images", 6), uploadImages);
router.delete("/:id/images/:imageId", protect, authorize("participant"), deleteImage);
router.put("/:id/pdf", protect, authorize("participant"), submissionPdfUpload.single("pdf"), uploadPdf);
router.put("/:id/video", protect, authorize("participant"), submissionVideoUpload.single("video"), uploadVideo);

router.get("/:id", protect, getSubmission);

module.exports = router;
