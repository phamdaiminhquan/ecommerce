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

module.exports = { addToCart };