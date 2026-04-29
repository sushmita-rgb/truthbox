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

const path = require("path");

// Configure storage for Feedback Attachments
const feedbackStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on mime type
    let resourceType = "image";
    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    // Sanitize filename: Remove spaces or special characters
    const baseName = path.parse(file.originalname).name;
    const sanitizedName = baseName
      .replace(/[^a-z0-9]/gi, '_') 
      .substring(0, 50); 
    
    const publicId = sanitizedName + "_" + Date.now();

    return {
      folder: "verit_uploads",
      resource_type: resourceType,
      public_id: publicId,
    };
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadFeedback = multer({
  storage: feedbackStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Keep 100MB for video
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", 
      "image/png", 
      "image/gif", 
      "image/webp", 
      "video/mp4", 
      "video/webm", 
      "video/quicktime",
      "application/pdf"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images, videos, and PDFs are allowed."));
    }
  }
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadFeedback,
};
