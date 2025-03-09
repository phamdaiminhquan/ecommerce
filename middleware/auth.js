const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};

const checkAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            req.user = null; // Người dùng chưa đăng nhập
            return next(); // Tiếp tục xử lý API bình thường
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Cho phép tiếp tục API
    } catch (err) {
        req.user = null;
        next();
    }
};



module.exports = {authMiddleware, checkAuth};
