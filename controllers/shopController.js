const Shop = require("../models/Shop");

const shopDetails = async (req, res) => {
    try {
        const shop_id = req.params.shopId;

        const shop = await Shop.findById(shop_id).populate("owner", "name");
        if (!shop) return res.status(404).json({ success: false, message: "Shop không tồn tại" });

        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy thông tin shop", error });
    }
};

const shopList = async (req, res) => {
    try {
        const shops = await Shop.find().populate("owner products");
        res.status(200).json({ success: true, data: shops });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách shop", error });
    }
};

module.exports = { shopDetails, shopList };