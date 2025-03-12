const SearchKeyword = require("../models/SearchKeyword");
const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Wishlist = require("../models/Wishlist");
const Attribute = require("../models/Attribute");


const searchProducts = async (req, res) => {
    try {
        // check Input
        const { keyword, categoryID } = req.query;
        if (!keyword) {
            console.log("No keyword provided");
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

        // fillter
        let filter = {
            name: { $regex: keyword, $options: "i" },
            isActive: true,
        };

        if (categoryID) {
            filter.category_id = categoryID;
        }

        // search
        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "_id price salePrice ")
            .lean()
            .select("-view -tags");

        // chech products
        if (products.length === 0) {
            return res.status(200).json([]);
        }

        // get wishlist of user
        let wishlists = [];
        if (req.user) {
            wishlists = await Wishlist.find({ user_id: req.user.id }).select("product_id isActive").lean();
        }

        // Output
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

        // filter
        const filter = { isActive: true };

        // find
        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        // Get wishlist of user
        let wishlists = [];
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
        res.status(500).json({ message: "Server error in topSellingProducts", error: err.message });
    }
};

const filterProductsByTag = async (req, res) => {
    try {
        // Input
        const { tag } = req.params;
        if (!tag) {
            return res.status(400).json({ message: "Tag is required" });
        }

        // Pagination
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

        // Filter
        let filter = {
            isActive: true,
            tags: { $in: [tag] }
        };

        // Find
        const products = await Product.find(filter)
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        // get wishlist of user
        let wishlists = [];
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

const getProductsByCategory = async (req, res) => {
    try {
        // Input
        const { categoryID } = req.query;
        if (!categoryID) {
            return res.status(400).json({ message: "Category ID is required" });
        }

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

        // Find
        const products = await Product.find({ category_id: categoryID })
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json([]);
        }


        // get wishlist of user
        let wishlists = [];
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

        // Find 
        const products = await Product.find()
            .sort({ quantity_sold: -1, rating: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json({});
        }

        // get wishlist of user
        let wishlists = [];
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

const getProductsByCategoryOrderedByTime = async (req, res) => {
    try {
        // Input
        const { categoryID } = req.query;

        if (!categoryID) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        // Pagination
        const { page, limit } = req.query;
        let limitParsed = parseInt(limit) || 10;
        let pageParsed = parseInt(page) || 1;
        const skip = (pageParsed - 1) * limitParsed;

        // Tìm sản phẩm theo category, sắp xếp theo `createdAt`
        const products = await Product.find({ category_id: categoryID, isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitParsed)
            .populate("variantDefault", "_id price salePrice")
            .lean();

        if (products.length === 0) {
            return res.status(200).json([]);
        }

        // get wishlist of user
        let wishlists = [];
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
        // Input
        const { productID } = req.params;

        // Nếu user đã đăng nhập, lấy wishlist của họ
        let favorite = false;
        if (req.user) {
            const user_id = req.user.id;
            favorite = await Wishlist.findOne({ user_id: user_id, product_id: productID }).select("isActive").lean();
        }

        // Lấy thông tin sản phẩm
        const product = await Product.findById(productID)
            .populate("shop_id")
            .select("_id name category_id brand_name description images variantDefault")
            .lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Lấy tất cả variants của sản phẩm
        const variants = await Variant.find({ product_id: productID })
            .select("_id sku name price salePrice stock images")
            .lean();

        // Lấy tất cả các ID của variants
        const variantIDs = variants.map(variant => variant._id);

        // Lấy thuộc tính của các variants
        const attributes = await Attribute.find({ variant_id: { $in: variantIDs } })
            .select("variant_id type value")
            .lean();

        // Cập nhật thông tin variantData
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

        // **Cập nhật danh sách hình ảnh trong productData**
        const allVariantImages = variants.flatMap(variant => variant.images); // Lấy tất cả ảnh từ variants
        const uniqueImages = [...new Set([...product.images, ...allVariantImages])]; // Loại bỏ ảnh trùng lặp

        // **Gán vào productData**
        const productData = {
            ...product,
            images: uniqueImages, // Gán danh sách ảnh mới
            wishlist: favorite ? favorite.isActive : null
        };

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
