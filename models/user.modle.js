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
    isVerified: { type: Boolean, default: false }, // ✅ email verify hona zaroori
    verificationToken: { type: String }, // ✅ token store
    createdAtIndia: {
      type: String,
      default: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), // ✅ India time
    },
    updatedAtIndia: {
      type: String,
      default: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    },
  },
  { timestamps: true }
);
// ✅ Middleware for update
UserSchema.pre("save", function (next) {
  this.updatedAtIndia = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  next();
});

module.exports = mongoose.model("User", UserSchema);
