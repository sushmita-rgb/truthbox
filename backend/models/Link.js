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
    // User-facing title for the feedback page
    title: {
      type: String,
      default: "",
      trim: true,
    },
    // Short description shown on the feedback page
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // Brand accent used across the feedback page
    accentColor: {
      type: String,
      default: "#97ce23",
    },
    // Which template was used to create the link
    templateKey: {
      type: String,
      default: "custom",
      trim: true,
    },
    // Original filename for display
    fileName: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Link", linkSchema);
