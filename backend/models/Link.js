const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    linkId: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Post type: 'text' | 'image' | 'pdf' | 'video' | 'url'
    postType: {
      type: String,
      enum: ["text", "image", "pdf", "video", "url"],
      default: "text",
    },
    // For text and url types
    content: {
      type: String,
      default: "",
    },
    // For image, pdf, video types (stored filename)
    fileUrl: {
      type: String,
      default: "",
    },
    // Original filename for display
    fileName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Link", linkSchema);
