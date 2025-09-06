const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ✅ Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://content-uploader-frontend.vercel.app",
];

// ✅ Regex allow for all vercel preview deployments
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname) // allow all *.vercel.app
      ) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Correct way
app.options(/.*/, cors()); // handle all preflight

// Routes
app.use("/api/auth", require("./routes/user.route"));
app.use("/api/projects", require("./routes/project.route"));
app.use("/uploads", express.static("uploads")); // for serving avatars or images

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
