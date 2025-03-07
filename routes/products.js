const express = require("express");
const router = express.Router();
const { searchProducts, topSellingProducts } = require("../controllers/productController");

router.get("/search", searchProducts);
router.get("/top-selling", topSellingProducts);

module.exports = router;
