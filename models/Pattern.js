const mongoose = require("mongoose");

const PatternSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image_pattern: { type: String },
  image_product: { type: String }
});

module.exports = mongoose.model("Pattern", PatternSchema);
