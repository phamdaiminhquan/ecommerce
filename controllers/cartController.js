const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Variant = require("../models/Variant");

const addToCart = async (req, res) => {
    try {
        const { variant_id, quantity } = req.body;
        const user_id = req.user.id;

        let cart = await Cart.findOne({ user_id });

        if (!cart) {
            cart = new Cart({ user_id });
            await cart.save();
        }

        const variant = await Variant.findById(variant_id);
        if (!variant) {
            return res.status(404).json({ message: "Product variant not found" });
        }

        let cartItem = await CartItem.findOne({ cart_id: cart._id, variant_id });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new CartItem({
                cart_id: cart._id,
                variant_id,
                quantity,
                price: variant.price
            });
        }

        await cartItem.save();
        res.status(200).json({ message: "Product added to cart", cartItem });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

const quantityItemsCart = async (req, res) => {
    try {
        const user_id = req.user.id;
        let quantityItemsCart = 0;

        const cart = await Cart.findOne({ user_id: user_id });

        if (!cart) {
            return res.status(200).json({
                message: "User chưa có cart",
                quantityItemsCart
            });
        }

        const CartItems = await CartItem.find({ cart_id: cart._id });

        if (CartItems.length === 0) {
            return res.status(200).json({
                message: "User chưa có sản phẩm nào trong giỏ hàng",
                quantityItemsCart
            });
        }

        // Đếm số lượng sản phẩm
        quantityItemsCart = CartItems.length;

        // Trả về kết quả thành công
        res.status(200).json({
            message: "Quantity cart",
            quantityItemsCart
        });

    } catch (err) {
        // Xử lý lỗi server và trả về thông tin chi tiết
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

module.exports = { addToCart, quantityItemsCart };