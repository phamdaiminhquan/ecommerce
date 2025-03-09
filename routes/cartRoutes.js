const express = require("express");
const {authMiddleware} = require("../middleware/auth");
const router = express.Router();
const cartController = require("../controllers/cartController")

// Thêm sản phẩm vào giỏ hàng**
router.post("/add", authMiddleware, cartController.addToCart);

module.exports = router;
