const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  pattern_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pattern", required: true },
  options: { type: Map, of: String }, // Lưu các tùy chọn như { size: "M", color: "Red" }
  stock: { type: Number, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model("Variant", VariantSchema);
