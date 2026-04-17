const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    fileUrl: {
      type: String, // Path to image/video or actual valid URL
      default: null, 
    },
    fileType: {
      type: String, 
      enum: ["image", "video", "link", "none"],
      default: "none"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
