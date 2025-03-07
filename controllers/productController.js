const Product = require("../models/Product");
const Variant = require("../models/Variant");
const SearchKeyword = require("../models/SearchKeyword");

const searchProducts = async (req, res) => {
    try {
        const { keyword, categoryID, page = 1, limit = 10 } = req.query;
        const limitParsed = parseInt(limit); // Chuyển limit thành số nguyên một lần duy nhất

        if (!keyword) {
            console.log("No keyword provided");
            return res.status(200).json({ products: [] });
        }

        let filter = {
            name: { $regex: keyword, $options: "i" },
            isActive: true,
        };

        if (categoryID) {
            filter.category_id = categoryID;
        }

        // 1️⃣ **Tìm danh sách sản phẩm và populate variantDefault**
        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip((page - 1) * limitParsed)
            .limit(limitParsed)
            .populate("variantDefault") // ✅ Populate đến variantDefault
            .lean(); // ✅ Tăng hiệu suất nếu chỉ đọc dữ liệu

        if (products.length === 0) {
            console.log("No products found");
            return res.status(200).json({ products: [] });
        }

        console.log("Final Product Data:", products);

        // 2️⃣ **Cập nhật tìm kiếm trong SearchKeyword**
        let search = await SearchKeyword.findOne({ keyword: keyword.toLowerCase() });
        if (!search) {
            search = new SearchKeyword({ keyword: keyword.toLowerCase(), search_count: 1 });
            console.log("New keyword added:", search);
        } else {
            search.search_count++;
        }
        await search.save();

        // 3️⃣ **Trả về dữ liệu sản phẩm kèm variantDefault**
        res.status(200).json({ products });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { searchProducts };
