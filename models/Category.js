const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
  total_sales: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);
