const express = require("express");
const {
  createProject,
  getAllProjects,
  searchProjects,
  updateProject,
  deleteProject,
  getProjectById,
  rateProject,
  commentProject,
} = require("../controllers/project.controller");
const auth = require("../middlewares/auth.middleware");
const { uploadProjectFiles } = require("../middlewares/multer.middleware");

const router = express.Router();

// 🔹 Create a project (Authenticated users)
router.post("/upload", auth, uploadProjectFiles, createProject);

// 🔹 Get all projects (Public)
router.get("/all", getAllProjects);

// 🔹 Search projects by name (Public)
router.get("/search", searchProjects);

// 🔹 Get single project by ID (Admin Only)
router.get("/:id", auth, getProjectById);

// 🔹 Update a project (Owner/Admin)
router.put("/:id", auth, uploadProjectFiles, updateProject);

// 🔹 Delete a project (Owner/Admin)
router.delete("/:id", auth, deleteProject);

// 🔹 Rate a project (Authenticated users)
router.post("/:id/rate", auth, rateProject);

// 🔹 Comment on a project (Authenticated users)
router.post("/:id/comment", auth, commentProject);

module.exports = router;
