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
            .populate("variantDefault", "price salePrice ")
            .lean()
            .select("-view -tags");

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        // 2️⃣ **Cập nhật tìm kiếm trong SearchKeyword**
        let search = await SearchKeyword.findOne({ keyword: keyword.toLowerCase() });
        if (!search) {
            search = new SearchKeyword({ keyword: keyword.toLowerCase(), search_count: 1 });
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

const topSellingProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const limitParsed = parseInt(limit);
        const pageParsed = parseInt(page);
        const skip = (pageParsed - 1) * limitParsed;

        // Lọc sản phẩm đang hoạt động
        const filter = { isActive: true };

        // 1️⃣ **Tìm danh sách sản phẩm top selling**
        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        // 2️⃣ **Xử lý dữ liệu trước khi trả về**
        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault ? product.variantDefault.price : null,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isActive: product.isActive,
            isFavorite: false
        }));

        // 3️⃣ **Trả về danh sách sản phẩm**
        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const filterProductsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const limitParsed = parseInt(limit);
        const pageParsed = parseInt(page)
        const skip = (pageParsed - 1) * limitParsed;

        // Kiểm tra nếu không có tag
        if (!tag) {
            return res.status(400).json({ message: "Tag is required" });
        }

        // 1️⃣ **Lọc sản phẩm theo tag**
        let filter = {
            isActive: true,
            tags: { $in: [tag] } // Kiểm tra nếu tag nằm trong danh sách tags của sản phẩm
        };

        // 2️⃣ **Lấy danh sách sản phẩm đã lọc**
        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 }) // Ưu tiên bán chạy, sau đó rating cao hơn
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice") // Lấy giá mặc định
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        // 3️⃣ **Chuẩn bị dữ liệu trả về**
        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault ? product.variantDefault.price : null,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isFavorite: false
        }));

        // 4️⃣ **Trả về kết quả**
        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { searchProducts, topSellingProducts , filterProductsByTag };
