const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    //this links the mesage to a specific user's Id
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: [500, "Feedback cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: ["career", "skills", "resume", "general"], // Only these options allowed
      default: "general",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
