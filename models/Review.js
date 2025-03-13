const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false, maxlength: 500 },
  images: { type: [String] }, // Mảng chứa URL ảnh sản phẩm
  isDeleted: { type: Boolean, default: false }
}, {   timestamps: true });

// Đảm bảo một người dùng chỉ có thể đánh giá một sản phẩm một lần
reviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
