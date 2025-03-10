const Product = require("../models/Product");
const Variant = require("../models/Variant");
const SearchKeyword = require("../models/SearchKeyword");
const Wishlist = require("../models/Wishlist");
const Attribute = require("../models/Attribute");


const searchProducts = async (req, res) => {
    try {
        const { keyword, categoryID } = req.query;

        // pagination
        const { page, limit } = req.query;

        let limitParsed = parseInt(limit);
        let pageParsed = parseInt(page)

        if (isNaN(limitParsed) || limitParsed <= 0) {
            limitParsed = 10;
        }
        if (isNaN(pageParsed) || pageParsed <= 0) {
            pageParsed = 1;
        }
        const skip = (pageParsed - 1) * limitParsed;

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

        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice ")
            .lean()
            .select("-view -tags");

        if (products.length === 0) {
            return res.status(200).json([]);
        }

        // add keyword in database
        let search = await SearchKeyword.findOne({ keyword: keyword.toLowerCase() });
        if (!search) {
            search = new SearchKeyword({ keyword: keyword.toLowerCase(), search_count: 1 });
        } else {
            search.search_count++;
        }
        await search.save();

        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault.price,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isActive: product.isActive,
            isFavorite: false
        }));

        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const topSellingProducts = async (req, res) => {
    try {
        // pagination
        const { page, limit } = req.query;

        let limitParsed = parseInt(limit);
        let pageParsed = parseInt(page)

        if (isNaN(limitParsed) || limitParsed <= 0) {
            limitParsed = 10;
        }
        if (isNaN(pageParsed) || pageParsed <= 0) {
            pageParsed = 1;
        }

        const skip = (pageParsed - 1) * limitParsed;

        const filter = { isActive: true };

        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault.price,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isActive: product.isActive,
            isFavorite: false
        }));

        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error in topSellingProducts", error: err.message });
    }
};

const filterProductsByTag = async (req, res) => {
    try {
        const { tag } = req.params;

        // pagination
        const { page, limit } = req.query;

        let limitParsed = parseInt(limit);
        let pageParsed = parseInt(page)

        if (isNaN(limitParsed) || limitParsed <= 0) {
            limitParsed = 10;
        }
        if (isNaN(pageParsed) || pageParsed <= 0) {
            pageParsed = 1;
        }
        const skip = (pageParsed - 1) * limitParsed;


        if (!tag) {
            return res.status(400).json({ message: "Tag is required" });
        }

        let filter = {
            isActive: true,
            tags: { $in: [tag] }
        };

        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault.price,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isFavorite: false
        }));

        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { categoryID } = req.query;

        // pagination
        const { page, limit } = req.query;

        let limitParsed = parseInt(limit);
        let pageParsed = parseInt(page)

        if (isNaN(limitParsed) || limitParsed <= 0) {
            limitParsed = 10;
        }
        if (isNaN(pageParsed) || pageParsed <= 0) {
            pageParsed = 1;
        }
        const skip = (pageParsed - 1) * limitParsed;


        // 
        if (!categoryID) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const products = await Product.find({ category_id: categoryID })
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json([]);
        }


        //formatt api
        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault.price,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isFavorite: false,
            isActive: product.isActive
        }));

        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const popularProducts = async (req, res) => {
    try {
        // pagination
        const { page, limit } = req.query;

        let limitParsed = parseInt(limit);
        let pageParsed = parseInt(page)

        if (isNaN(limitParsed) || limitParsed <= 0) {
            limitParsed = 10;
        }
        if (isNaN(pageParsed) || pageParsed <= 0) {
            pageParsed = 1;
        }
        const skip = (pageParsed - 1) * limitParsed;

        const products = await Product.find()
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        const productList = products.map(product => ({
            _id: product._id,
            name: product.name,
            thumbnail: product.images.length > 0 ? product.images[0] : null,
            brand_name: product.brand_name,
            rating: product.rating,
            quantity_sold: product.quantity_sold,
            original_price: product.variantDefault.price,
            selling_price: product.variantDefault
                ? product.variantDefault.salePrice || product.variantDefault.price
                : null,
            isFavorite: false
        }));

        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getProductsByCategoryOrderedByTime = async (req, res) => {
    try {
        const { categoryID } = req.query;

        // Pagination
        const { page, limit } = req.query;
        let limitParsed = parseInt(limit) || 10;
        let pageParsed = parseInt(page) || 1;
        const skip = (pageParsed - 1) * limitParsed;

        if (!categoryID) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        // Tìm sản phẩm theo category, sắp xếp theo `createdAt` (mới nhất trước)
        const products = await Product.find({ category_id: categoryID, isActive: true })
            .sort({ createdAt: -1 }) // Mới nhất trước
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json([]);
        }

        let wishlists = [];

        // Nếu user đã đăng nhập, lấy danh sách wishlist của họ
        if (req.user) {
            wishlists = await Wishlist.find({ user_id: req.user.id }).select("product_id isActive").lean();
        }

        // Format API response
        const productList = products.map(product => {
            const wishlistItem = wishlists.find(w => w.product_id.toString() === product._id.toString());

            return {
                _id: product._id,
                name: product.name,
                thumbnail: product.images.length > 0 ? product.images[0] : null,
                brand_name: product.brand_name,
                rating: product.rating,
                quantity_sold: product.quantity_sold,
                original_price: product.variantDefault?.price || null,
                selling_price: product.variantDefault
                    ? product.variantDefault.salePrice || product.variantDefault.price
                    : null,
                isActive: product.isActive,
                createdAt: product.createdAt,
                wishlist: wishlistItem ? wishlistItem.isActive : null
            };
        });

        res.status(200).json(productList);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getProductDetails = async (req, res) => {
    try {
        const { productID } = req.params;

        // 📌 1️⃣ Lấy thông tin sản phẩm chính
        const product = await Product.findById(productID)
            .lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 📌 2️⃣ Lấy danh sách tất cả variants của sản phẩm này
        const variants = await Variant.find({ product_id: productID })
            .lean();

        // 📌 3️⃣ Lấy danh sách tất cả attributes của các variants
        const variantIDs = variants.map(variant => variant._id);
        const attributes = await Attribute.find({ variant_id: { $in: variantIDs } })
            .lean();

        // 📌 4️⃣ Ghép attributes vào từng variant
        const variantData = variants.map(variant => ({
            ...variant,
            attributes: attributes.filter(attr => attr.variant_id.toString() === variant._id.toString())
        }));

        // 📌 5️⃣ Trả về dữ liệu
        res.status(200).json({
            product,
            variants: variantData
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { 
    searchProducts, 
    topSellingProducts, 
    filterProductsByTag, 
    getProductsByCategory, 
    popularProducts, 
    getProductsByCategoryOrderedByTime,
    getProductDetails
};
