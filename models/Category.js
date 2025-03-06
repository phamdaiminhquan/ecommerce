const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
  total_sales: { type: Number, default: 0 }
});

module.exports = mongoose.model("Categories", CategorySchema);
