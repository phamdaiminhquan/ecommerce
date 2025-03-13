const express = require("express");
const router = express.Router();

// Import controller
const { getCategories } = require("../controllers/categoryController");

// Định nghĩa Endpoint
router.get("/", getCategories);

module.exports = router;
