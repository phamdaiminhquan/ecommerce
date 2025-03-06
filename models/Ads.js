const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discount: { type: Number, required: true },
  image: { type: String, required: true },
  product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ad", AdSchema);
