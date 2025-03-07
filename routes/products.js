const express = require("express");
const router = express.Router();
const { searchProducts, topSellingProducts , filterProductsByTag } = require("../controllers/productController");

router.get("/search", searchProducts);
router.get("/top-selling", topSellingProducts);
router.get("/:tag", filterProductsByTag);

module.exports = router;
