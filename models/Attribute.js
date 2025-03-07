const mongoose = require("mongoose");

const AttributeSchema = new mongoose.Schema({
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  type: { type: String, required: true }, // VD: "Màu sắc", "Kích thước", "Dung lượng"
  value: { type: String, required: true }, // VD: "Đỏ", "XL", "128GB"
}, { timestamps: true });

module.exports = mongoose.model("Attribute", AttributeSchema);
