const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user" }, // optional
    isVerified: { type: Boolean, default: false }, // 👈 email verified?
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
