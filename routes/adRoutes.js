const express = require("express");
const router = express.Router();

// Import controller
const { getActiveAds } = require("../controllers/adController");

// Endpoint
router.get("/active", getActiveAds);

module.exports = router;
