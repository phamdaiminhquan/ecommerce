const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  sku: { type: String, unique: true, required: true }, // SKU duy nhất cho biến thể này
  name: { type: String, required: true }, // Tên biến thể (VD: "Đỏ - 128GB")
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null }, // Giá khuyến mãi (nếu có)
  stock: { type: Number, required: true },
  images: { type: String }, // Hình ảnh riêng của biến thể (nếu có)
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Variant", VariantSchema);
