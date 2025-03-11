const express = require("express");
const router = express.Router();
const {checkAuth} =require("../middleware/auth")
const { 
    searchProducts, 
    topSellingProducts , 
    filterProductsByTag, 
    getProductsByCategory, 
    popularProducts,
    getProductsByCategoryOrderedByTime,
    getProductDetails
} = require("../controllers/productController");

// get product by keyword and id category
router.get("/search", checkAuth, searchProducts);

// get product by category
router.get("/category", checkAuth, getProductsByCategory);

// get product by catogory ordered by time
router.get("/category/latest", checkAuth, getProductsByCategoryOrderedByTime);

// get product by quantity sold
router.get("/top-selling", checkAuth, topSellingProducts);

// get product by popular in 2023
router.get("/popular", checkAuth, popularProducts);

// Lấy toàn bộ thông tin sản phẩm theo productID
router.get("/detail/:productID", checkAuth, getProductDetails);

// get product by tags
router.get("/:tag", checkAuth, filterProductsByTag);

module.exports = router;
