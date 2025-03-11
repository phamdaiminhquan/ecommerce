const express = require("express");
const { authMiddleware, checkAuth } = require("../middleware/auth");
const router = express.Router();
const cartController = require("../controllers/cartController")

// lấy số lượng sản phẩm trong giỏ hàng
router.get("/quantity" , authMiddleware, cartController.quantityItemsCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authMiddleware, cartController.addToCart);

module.exports = router;
