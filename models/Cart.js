const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cart", CartSchema);
