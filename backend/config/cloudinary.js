const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for Avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Verit/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Configure storage for Feedback Attachments
const feedbackStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = "auto";
    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    return {
      folder: "Verit/feedback",
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "mp4", "webm", "mov"],
    };
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadFeedback = multer({
  storage: feedbackStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadFeedback,
};
