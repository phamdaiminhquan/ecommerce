const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);


//owner ai là người tạo sản phẩm này
//shop của shop nào
//branding nào