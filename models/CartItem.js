const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { timestamps: true });

module.exports = mongoose.model("CartItem", CartItemSchema);
