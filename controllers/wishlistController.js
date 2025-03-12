const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const favorite = async (req, res) => {
    try {

        const { product_id, status } = req.body;
        const user_id = req.user.id;

        if (!product_id || status === undefined) {
            return res.status(400).json({ message: "Product ID and Status is required" });
        }

        let favorite = await Wishlist.findOne({ user_id: user_id, product_id: product_id });

        if (!favorite) {
            favorite = new Wishlist({ user_id, product_id, isActive: status });
        } else {
            favorite.isActive = status;
        }

        await favorite.save();

        res.status(200).json({ message: "Favorite is update", favorite });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

const getWishlist = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Pagination
        const { page, limit } = req.query;
        let limitParsed = parseInt(limit) || 10;
        let pageParsed = parseInt(page) || 1;
        const skip = (pageParsed - 1) * limitParsed;

        // Lấy danh sách wishlist của user và populate thông tin sản phẩm
        const wishlistItems = await Wishlist.find({ user_id, isActive: true })
            .populate({
                path: "product_id",
                select: "_id name images variantDefault",
                populate: {
                    path: "variantDefault",
                    select: "price salePrice _id" 
                }
            })
            .skip(skip)
            .limit(limitParsed)
            .lean();


        if (wishlistItems.length === 0) {
            return res.status(200).json([]);
        }

        // Format API response
        const wishlistData = wishlistItems.map(item => ({
            product_id: item.product_id._id,
            variantDefault: item.product_id.variantDefault._id,
            name: item.product_id.name,
            thumbnail: item.product_id?.images?.[0] || null,
            price: item.product_id.variantDefault.price,
            salePrice: item?.product_id?.variantDefault?.salePrice || null,
            status: item.isActive
        }));

        res.status(200).json(wishlistData);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { favorite, getWishlist };