const express = require("express");
const router = express.Router();

// Import từng route cụ thể
const categoryRoutes = require("./categoryRoutes");

// Định nghĩa prefix cho từng route
router.use("/categories", categoryRoutes);

module.exports = router;
