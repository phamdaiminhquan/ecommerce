const mongoose = require("mongoose");

const AdsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discount: { type: String }, // VD: "Giảm 20%"
  image: { type: String, required: true },
  product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Danh sách sản phẩm trong quảng cáo
}, { timestamps: true });

module.exports = mongoose.model("Ads", AdsSchema);
