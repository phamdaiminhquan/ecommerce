const express = require("express");
const router = express.Router();

// Import từng route cụ thể
const categoryRoutes = require("./categoryRoutes");
const adRoutes = require("./adRoutes");
const productRoutes = require("./products")
const searchRoutes = require("./searchRoutes");

// Định nghĩa prefix cho từng route
router.use("/categories", categoryRoutes);
router.use("/ads", adRoutes);
router.use("/products", productRoutes);
router.use("/search", searchRoutes);

module.exports = router;
