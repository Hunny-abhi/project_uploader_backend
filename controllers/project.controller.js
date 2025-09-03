const Project = require("../models/project.model");

// 🔹 Create Project
exports.createProject = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, status, category, tags, description, content } = req.body;
    const { image, video, file } = req.files || {};

    const project = new Project({
      name,
      image: image?.[0]?.path || null,
      video: video?.[0]?.path || null,
      file: file?.[0]?.path || null,
      status,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
      description,
      content,
      createdBy: req.user.userId,

      // ✅ Indian Date-Time
      createdAtIndia: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      updatedAtIndia: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    });

    await project.save();

    res
      .status(201)
      .json({ message: "✅ Project uploaded successfully", project });
  } catch (error) {
    res.status(500).json({ message: "❌ Error: " + error.message });
  }
};

// 🔹 Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("createdBy", "email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "❌ Error: " + error.message });
  }
};

// 🔹 Search Projects by Name
exports.searchProjects = async (req, res) => {
  try {
    const { name } = req.query;
    const projects = await Project.find({
      name: { $regex: name, $options: "i" },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "❌ Error: " + error.message });
  }
};

// 🔹 Get Single Project (Owner or Admin)
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "email"
    );

    if (!project)
      return res.status(404).json({ message: "❌ Project not found" });

    // Admin or project owner only
    if (
      req.user.role !== "admin" &&
      req.user.userId !== project.createdBy._id.toString()
    ) {
      return res.status(403).json({ message: "⛔ Access Denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "❌ Error: " + error.message });
  }
};

// 🔹 Update Project (Owner or Admin)
// 🔹 Update Project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: "❌ Project not found" });

    // ✅ Role based access check
    if (
      req.user.role !== "admin" &&
      req.user.userId !== project.createdBy.toString()
    ) {
      return res.status(403).json({ message: "⛔ Access Denied" });
    }

    const { name, status, category, tags, description, content } = req.body;
    const { image, video, file } = req.files || {};

    // ✅ Update fields
    project.name = name || project.name;
    project.status = status || project.status;
    project.category = category || project.category;
    project.tags = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(",")
      : project.tags;
    project.description = description || project.description;
    project.content = content || project.content;

    if (image) project.image = image[0].path;
    if (video) project.video = video[0].path;
    if (file) project.file = file[0].path;

    // ✅ Update Indian Time
    project.updatedAtIndia = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    await project.save();

    res.json({ message: "✅ Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "❌ Error: " + error.message });
  }
};

// 🔹 Delete Project (Owner or Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: "❌ Project not found" });

    if (
      req.user.role !== "admin" &&
      req.user.userId !== project.createdBy.toString()
    ) {
      return res.status(403).json({ message: "⛔ Access Denied" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error: " + error.message });
  }
};

// 🔹 Rate a project
exports.rateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const existing = project.ratings.find(
      (r) => r.user.toString() === req.user.userId
    );
    if (existing) {
      existing.rating = req.body.rating;
    } else {
      project.ratings.push({ user: req.user.userId, rating: req.body.rating });
    }
    await project.save();
    res.json({ message: "✅ Rating submitted", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Comment on a project
exports.commentProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.comments.push({ user: req.user.userId, comment: req.body.comment });
    await project.save();
    res.json({ message: "✅ Comment added", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get only logged-in user's projects
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.userId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "❌ Error: " + err.message });
  }
};
