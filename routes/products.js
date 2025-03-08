const express = require("express");
const router = express.Router();
const { searchProducts, topSellingProducts , filterProductsByTag, getProductsByCategory } = require("../controllers/productController");

// get product by keyword and id category
router.get("/search", searchProducts);

// get product by category
router.get("/category", getProductsByCategory);

// get product by quantity sold
router.get("/top-selling", topSellingProducts);

// get product by tags
router.get("/:tag", filterProductsByTag);

module.exports = router;
