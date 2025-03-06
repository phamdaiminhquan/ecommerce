const express = require("express");
const router = express.Router();

// Import từng route cụ thể
const categoryRoutes = require("./categoryRoutes");
const adRoutes = require("./adRoutes");

// Định nghĩa prefix cho từng route
router.use("/categories", categoryRoutes);
router.use("/ads", adRoutes);

module.exports = router;
