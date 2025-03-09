const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/auth")

const { favorite } =require("../controllers/wishlistController")

router.post("/favorite", authMiddleware, favorite);

module.exports = router;