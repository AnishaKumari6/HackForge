const express = require("express");
const { toggleBookmark, getMyBookmarks } = require("../controllers/bookmarkController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.get("/", protect, getMyBookmarks);
router.put("/:hackathonId/toggle", protect, toggleBookmark);

module.exports = router;
