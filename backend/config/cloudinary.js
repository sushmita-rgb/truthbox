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

    let resourceType = "auto";
    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else if (file.mimetype === "application/pdf" || file.mimetype.includes("pdf")) {
      resourceType = "auto"; 
    }

    const isPdf = file.mimetype === "application/pdf" || file.mimetype.includes("pdf");
    
    // Sanitize filename: remove special characters and spaces
    const sanitizedName = file.originalname
      .split('.')[0]
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
      .substring(0, 50); // Limit length
    
    const publicId = sanitizedName + "_" + Date.now() + (isPdf ? ".pdf" : "");

    return {
      folder: "Verit/feedback",
      resource_type: resourceType,
      public_id: publicId,
      use_filename: true,
      unique_filename: false,
    };
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadFeedback = multer({
  storage: feedbackStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", 
      "image/png", 
      "image/gif", 
      "image/webp", 
      "application/pdf", 
      "application/x-pdf",
      "application/vnd.pdf",
      "video/mp4", 
      "video/webm", 
      "video/quicktime"
    ];
    if (allowedTypes.includes(file.mimetype) || file.mimetype.includes("pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images, PDFs, and videos are allowed."));
    }
  }
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadFeedback,
};
