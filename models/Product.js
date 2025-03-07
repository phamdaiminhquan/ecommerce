const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  images: { type: [String] }, // Mảng chứa URL ảnh sản phẩm
  variantDefault: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", default: null }, // Biến thể mặc định khi chưa chọn
  rating: { type: Number, default: 0 },
  view: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  tags: { type: [String] },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
