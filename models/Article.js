const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tiêu đề bài viết
    logo: { type: String, required: true }, // Logo của nguồn bài viết
    link: { type: String, required: true }, // Link đến bài viết
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
