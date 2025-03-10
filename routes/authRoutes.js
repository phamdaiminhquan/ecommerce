const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
require("dotenv").config();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra email đã tồn tại chưa
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        // Tạo user mới
        user = new User({ name, email, password });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 📌 1️⃣ Kiểm tra email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Your email or password is wrong" });

        // 📌 2️⃣ So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Your email or password is wrong" });

        // 📌 3️⃣ Tạo JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Token chứa ID + Role
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );

        // 📌 4️⃣ Trả về kết quả đúng yêu cầu
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
