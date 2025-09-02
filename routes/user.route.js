const express = require("express");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/user.controller");
const { uploadAvatar } = require("../middlewares/multer.middleware");

const auth = require("../middlewares/auth.middleware"); // ✅ middleware for token

const User = require("../models/user.modle");

const router = express.Router();

router.post("/register", uploadAvatar, register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
