const express = require("express");
const router = express.Router();
const { getActiveAds } = require("../controllers/adController");

router.get("/active", getActiveAds); // Route API lấy quảng cáo đang hoạt động

module.exports = router;
