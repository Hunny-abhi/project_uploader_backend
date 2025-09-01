const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// 🔹 Storage for Profile Avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ProjectUploader/avatars",
    resource_type: "image",
    public_id: `avatar-${Date.now()}`,
  }),
});

// 🔹 Storage for Project Files (Images, Videos, Documents, etc.)
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ProjectUploader/projects",
    resource_type: "auto", // auto-detect type
    public_id: `project-${Date.now()}`,
  }),
});

// Single File Upload (For Avatars)
const uploadAvatar = multer({ storage: avatarStorage }).single("avatar");

// Multiple Files Upload (For Projects: Image, Video, File)
const uploadProjectFiles = multer({ storage: projectStorage }).fields([
  { name: "image", maxCount: 5 },
  { name: "video", maxCount: 5 },
  { name: "file", maxCount: 5 },
]);

module.exports = { uploadAvatar, uploadProjectFiles };
