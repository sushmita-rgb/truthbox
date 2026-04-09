const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // No two users can have the same username
      trim: true, // Removes extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAcceptingMessages: {
      type: Boolean,
      default: true, // Users can toggle this on or off in their dashboard
    },
  },
  { timestamps: true },
); // Automatically adds "createdAt" and "updatedAt"

module.exports = mongoose.model("User", userSchema);
