const express = require("express");
const { authMiddleware, checkAuth } = require("../middleware/auth");
const router = express.Router();
const cartController = require("../controllers/cartController")

// lấy danh sách sản phẩm trong giỏ hàng
router.get("/", authMiddleware, cartController.getListItemsCart);

// lấy số lượng sản phẩm trong giỏ hàng
router.get("/quantity" , authMiddleware, cartController.quantityItemsCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authMiddleware, cartController.addToCart);

// xóa sản phẩm trong giỏ hàng
router.delete("/:item_id", authMiddleware, cartController.removeItemFromCart);

module.exports = router;
