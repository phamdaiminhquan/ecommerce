const express = require("express");
const router = express.Router();
const { shopDetails, shopList } = require("../controllers/shopController");

// Lấy danh sách tất cả các shop
router.get("/", shopList);

// Lấy thông tin chi tiết của một shop theo shopId
router.get("/:shopId", shopDetails);

module.exports = router;
