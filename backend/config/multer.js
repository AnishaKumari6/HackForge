const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const ErrorResponse = require("../utils/errorResponse");
const buildStorage = (folder, allowedFormats, resourceType = "image") =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: allowedFormats,
      resource_type: resourceType,
      transformation: resourceType === "image" ? [{ quality: "auto" }] : undefined,
    },
  });

const fileFilter = (allowedMimes) => (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse(`Unsupported file type: ${file.mimetype}`, 400), false);
  }
};

const avatarUpload = multer({
  storage: buildStorage("hackforge/avatars", ["jpg", "jpeg", "png", "webp"]),
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp"]),
  limits: { fileSize: 3 * 1024 * 1024 },
});

const hackathonBannerUpload = multer({
  storage: buildStorage("hackforge/hackathons", ["jpg", "jpeg", "png", "webp"]),
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp"]),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const submissionImagesUpload = multer({
  storage: buildStorage("hackforge/submissions/images", ["jpg", "jpeg", "png", "webp"]),
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp"]),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

const submissionPdfUpload = multer({
  storage: buildStorage("hackforge/submissions/pdfs", ["pdf"], "raw"),
  fileFilter: fileFilter(["application/pdf"]),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const submissionVideoUpload = multer({
  storage: buildStorage("hackforge/submissions/videos", ["mp4", "mov", "webm"], "video"),
  fileFilter: fileFilter(["video/mp4", "video/quicktime", "video/webm"]),
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = {
  avatarUpload,
  hackathonBannerUpload,
  submissionImagesUpload,
  submissionPdfUpload,
  submissionVideoUpload,
};
