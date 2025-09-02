const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  video: { type: String },
  file: { type: String },
  status: { type: String, enum: ["Complete", "Pending"], required: true },
  partners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  category: { type: String },
  tags: [{ type: String }],
  description: { type: String },
  readme: { type: String },
  content: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ratings: [{ user: mongoose.Schema.Types.ObjectId, rating: Number }],
  comments: [{ user: mongoose.Schema.Types.ObjectId, comment: String }],
  createdAtIndia: { type: String },
  updatedAtIndia: { type: String },
});

module.exports = mongoose.model("Project", ProjectSchema);
