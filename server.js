const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ✅ Add your current frontend here
const allowedOrigins = [
  "https://project-uploader-frontend.vercel.app",
  "https://content-uploader-psi.vercel.app",
  "https://content-uploader-736ti3pdt.vercel.app",
  "http://localhost:5173", // ✅ Add this line
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl, Postman, etc.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin); // log for debugging
        return callback(
          new Error("CORS policy doesn't allow this origin."),
          false
        );
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Routes
app.use("/api/auth", require("./routes/user.route"));
app.use("/api/projects", require("./routes/project.route"));
app.use("/uploads", express.static("uploads")); // for serving avatars or images

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
