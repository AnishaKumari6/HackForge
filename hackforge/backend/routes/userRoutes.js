const express = require("express");
const {
  updateProfile,
  updateAvatar,
  getUserProfile,
  listJudges,
  getAllUsers,
  blockUser,
  unblockUser,
  changeUserRole,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { updateProfileValidator, blockUserValidator } = require("../validators/userValidators");
const { avatarUpload } = require("../config/multer");

const router = express.Router();

// Specific routes before "/:id" to avoid shadowing
router.get("/judges", protect, authorize("organizer", "admin"), listJudges);
router.put("/profile", protect, updateProfileValidator, validate, updateProfile);
router.put("/avatar", protect, avatarUpload.single("avatar"), updateAvatar);

// Admin management
router.get("/", protect, authorize("admin"), getAllUsers);
router.put("/:id/block", protect, authorize("admin"), blockUserValidator, validate, blockUser);
router.put("/:id/unblock", protect, authorize("admin"), unblockUser);
router.put("/:id/role", protect, authorize("admin"), changeUserRole);
router.delete("/:id", protect, authorize("admin"), deleteUser);

// Public profile (kept last since it's a generic :id catch-all)
router.get("/:id", getUserProfile);

module.exports = router;
