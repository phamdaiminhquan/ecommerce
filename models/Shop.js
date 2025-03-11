const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Tên shop
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Chủ shop
    logo: { type: String }, // Ảnh logo shop
    description: { type: String }, // Mô tả shop
    rating: { type: Number, default: 0 }, // Đánh giá trung bình
    followers: { type: Number, default: 0 }, // Số lượng người theo dõi
    isActive: { type: Boolean, default: true } // Shop có đang hoạt động không?
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
