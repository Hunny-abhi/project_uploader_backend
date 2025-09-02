require("dotenv").config();
const User = require("../models/user.modle"); // ⚠️ spelling fix (modle -> model)
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/SendEmail");

// ==================== Register ====================
// Register with Email Verification
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Verification token create
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const user = new User({
      email,
      password: hashedPassword,
      avatar: req.file ? req.file.path : "",
      verificationToken,
    });

    await user.save();

    // ✅ Verification email bhejna
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      "Verify Your Email",
      `Please verify your email by clicking this link: ${verifyLink}`
    );

    res.status(201).json({
      message:
        "Registration successful! Please check your email for verification link.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Email Verify
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      email: decoded.email,
      verificationToken: token,
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Invalid or expired token" });
  }
};

// ==================== Login ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Check verification
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: { email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== Forgot Password ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "35m",
    });

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // ✅ frontend link with query token
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Password Reset",
      `<p>Click below to reset your password:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>This link will expire in 15 minutes.</p>`
    );

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== Reset Password ====================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required." });
    }

    // ✅ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error during password reset." });
  }
};

// ==================== Get Profile (Protected) ====================
exports.getProfile = async (req, res) => {
  try {
    // `req.user` aayega middleware se (authMiddleware)
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
