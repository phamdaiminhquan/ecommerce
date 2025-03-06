const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true },            // Tiêu đề quảng cáo
  discountInfo: { type: String, required: true },     // Thông tin giảm giá
  description: { type: String },                      // Mô tả chi tiết
  image: { type: String, required: true },            // URL hình ảnh quảng cáo
  startTime: { type: Date, required: true },          // Thời gian bắt đầu quảng cáo
  endTime: { type: Date, required: true }             // Thời gian kết thúc quảng cáo
}, { timestamps: true });  // Tự động tạo `createdAt` & `updatedAt`

module.exports = mongoose.model("Ad", AdSchema);
