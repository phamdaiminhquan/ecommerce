const express = require("express");
const router = express.Router();

// Controllers
const {getReviewsByProduct} = require("../controllers/reviewController");

router.get("/:productId", getReviewsByProduct);

module.exports = router;