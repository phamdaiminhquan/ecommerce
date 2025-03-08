const express = require("express");
const { getKeywordSuggestions } = require("../controllers/searchController");

const router = express.Router();

// Route lấy gợi ý từ khóa
router.get("/suggestions", getKeywordSuggestions);

module.exports = router;
