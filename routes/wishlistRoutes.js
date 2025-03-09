const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/auth")

const { favorite, getWishlist } =require("../controllers/wishlistController");

router.get("/", authMiddleware, getWishlist);
router.post("/favorite", authMiddleware, favorite);

module.exports = router;