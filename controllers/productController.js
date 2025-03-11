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
            return res.status(200).json([]);
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
            .populate("variantDefault", "_id price salePrice ")
            .lean()
            .select("-view -tags");

        // add keyword in database
        let search = await SearchKeyword.findOne({ keyword: keyword.toLowerCase() });
        if (!search) {
            search = new SearchKeyword({ keyword: keyword.toLowerCase(), search_count: 1 });
        } else {
            search.search_count++;
        }
        await search.save();
        
        // chech products
        if (products.length === 0) {
            return res.status(200).json([]);
        }

        const productList = products.map(product => ({
            _id: product._id,
            variant_id: product.variantDefault._id,
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
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        const productList = products.map(product => ({
            _id: product._id,
            variant_id: product.variantDefault._id,
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
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        const productList = products.map(product => ({
            _id: product._id,
            variant_id: product.variantDefault._id,
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
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json([]);
        }


        //formatt api
        const productList = products.map(product => ({
            _id: product._id,
            variant_id: product.variantDefault._id,
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
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        const productList = products.map(product => ({
            _id: product._id,
            variant_id: product.variantDefault._id,
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
            .populate("variantDefault", "_id price salePrice")
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
                variant_id: product.variantDefault._id,
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

        // Nếu user đã đăng nhập, lấy danh sách wishlist của họ
        let favorite = false;
        if (req.user) {
            const user_id = req.user.id;
            favorite = await Wishlist.findOne({user_id: user_id, product_id: productID}).select("isActive").lean();
        }
        
        const product = await Product.findById(productID)
            .select("_id name category_id brand_name description images variantDefault")
            .lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = {
            ...product,
            wishlist: favorite ? favorite.isActive : null
        }

        const variants = await Variant.find({ product_id: productID })
            .select("_id sku name price salePrice stock images")
            .lean();

        const variantIDs = variants.map(variant => variant._id);
        const attributes = await Attribute.find({ variant_id: { $in: variantIDs } })
            .select("variant_id type value")
            .lean();

        const variantData = variants.map(variant => ({
            _id: variant._id,
            sku: variant.sku,
            name: variant.name,
            price: variant.price,
            salePrice: variant.salePrice,
            stock: variant.stock,
            images: variant.images,
            attributes: attributes
                .filter(attr => attr.variant_id.toString() === variant._id.toString())
                .map(({ type, value }) => ({ type, value }))
        }));

        // Extract unique attribute types and values
        // const extractAttributes = (variants) => {
        //     const attributeMap = {};
        //     variants.forEach((variant) => {
        //         variant.attributes.forEach(({ type, value }) => {
        //             if (!attributeMap[type]) {
        //                 attributeMap[type] = new Set();
        //             }
        //             attributeMap[type].add(value);
        //         });
        //     });
        //     return Object.entries(attributeMap).map(([type, values]) => ({
        //         type,
        //         values: Array.from(values),
        //     }));
        // };

        // const attributesList = extractAttributes(variantData);

        res.status(200).json({ productData, variants: variantData });
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
