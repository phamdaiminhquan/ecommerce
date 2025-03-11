const express = require("express");
const router = express.Router();

// Import từng route cụ thể
const categoryRoutes = require("./categoryRoutes");
const adRoutes = require("./adRoutes");
const productRoutes = require("./products");
const searchRoutes = require("./searchRoutes");
const authRoutes = require("./authRoutes");
const cartRoutes = require("./cartRoutes");
const wishlistRoutes = require("./wishlistRoutes")
const shopRoutes = require("./shopRoutes");
const Article = require("../models/Article");

const {authMiddleware} = require("../middleware/auth");

// Định nghĩa prefix cho từng route
router.use("/categories", categoryRoutes);
router.use("/ads", adRoutes);
router.use("/products", productRoutes);
router.use("/search", searchRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/shops", shopRoutes);


// api check token
router.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Token is valid", userId: req.user.id });
});

// Lấy danh sách tất cả bài viết
router.get("/article", async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishedDate: -1 });
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy bài viết", error });
  }
});

module.exports = router;
