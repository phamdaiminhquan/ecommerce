const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Variant = require("../models/Variant");
const Product = require("../models/Product");
const Attribute = require("../models/Attribute");

const getListItemsCart = async (req, res) => {
    try {
        // Input
        const user_id = req.user.id;

        // pagination
        const { page, limit } = req.query;
        let limitParsed = parseInt(limit);
        let pageParsed = parseInt(page);
        if (isNaN(limitParsed) || limitParsed <= 0) {
            limitParsed = 20;
        }
        if (isNaN(pageParsed) || pageParsed <= 0) {
            pageParsed = 1;
        }
        const skip = (pageParsed - 1) * limitParsed;

        // get id cart
        let cart = await Cart.findOne({ user_id });
        if (!cart) {
            cart = new Cart({ user_id });
            await cart.save();
            return res.status(200).json({ message: "List of items in cart is empty", cart });
        }

        // get list items cart with pagination
        const cartItemList = await CartItem.find({ cart_id: cart.id })
            .skip(skip)
            .limit(limitParsed)
            .select("variant_id quantity")
            .populate("variant_id", "product_id price salePrice stock");

        if (cartItemList.length === 0) {
            return res.status(200).json({ message: "List of items in cart is empty", cart });
        }

        // Get product details
        const productIDList = cartItemList.map(item => item.variant_id.product_id);
        const products = await Product.find({ _id: { $in: productIDList } })
            .select("_id name images shop_id")
            .populate("shop_id", "name");

        // Get attributes from Attribute collection based on variant_id
        const variantIDs = cartItemList.map(item => item.variant_id._id);
        const attributes = await Attribute.find({ variant_id: { $in: variantIDs } })
            .select("variant_id name value");

        // Map cart items with product details and attributes
        const responseItems = cartItemList.map(cartItem => {
            const product = products.find(p => p._id.toString() === cartItem.variant_id.product_id.toString());
            const itemAttributes = attributes.filter(attr => attr.variant_id.toString() === cartItem.variant_id._id.toString());
            return {
                productId: product ? product._id : null,
                item_id: cartItem._id,
                name: product ? product.name : null,
                thumbnail: cartItem.variant_id.images ? cartItem.variant_id.images : null,
                originalPrice: cartItem.variant_id.price,
                sellingPrice: cartItem.variant_id.salePrice,
                quantity: cartItem.quantity,
                shopName: product ? product.shop_id.name : null,
                shopId: product ? product.shop_id._id : null,
                stock: cartItem.variant_id.stock,
                attributes: itemAttributes.map(attr => ({ name: attr.name, value: attr.value }))
            };
        });

        res.status(200).json({
            message: "List items cart of user: " + user_id,
            page: pageParsed,
            limit: limitParsed,
            cart: cart,
            items: responseItems
        });
    } catch (err) {
        // Xử lý lỗi server và trả về thông tin chi tiết
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

const addToCart = async (req, res) => {
    try {
        // Input
        const { variant_id, quantity } = req.body;
        const user_id = req.user.id;

        // Get cart
        let cart = await Cart.findOne({ user_id });
        if (!cart) {
            cart = new Cart({ user_id });
            await cart.save();
        }

        // Get variant
        const variant = await Variant.findById(variant_id);
        if (!variant) {
            return res.status(404).json({ message: "Product variant not found" });
        }
        
        // add item cart
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
};

const removeItemFromCart = async (req, res) => {
    try {
        // Input
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        }
        const user_id = req.user.id;

        const { item_id } = req.params;
        if (!item_id) {
            return res.status(400).json({ message: "Bad Request: Must have item_id" });
        }

        // Kiểm tra giỏ hàng của người dùng
        const cart = await Cart.findOne({ user_id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Tìm và xóa sản phẩm trong giỏ hàng
        const cartItem = await CartItem.findOneAndDelete({ _id: item_id });
        if (!cartItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (err) {
        console.error("Error in removeItemFromCart:", err);
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        // Input
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        }
        const user_id = req.user.id;

        // Lấy item_id và quantity từ request
        const { item_id, quantity } = req.body;
        if (!item_id) {
            return res.status(400).json({ message: "Bad Request: Must have item_id" });
        }

        if (typeof quantity !== "number" || quantity < 0) {
            return res.status(400).json({ message: "Bad Request: Quantity must be a non-negative number" });
        }

        // Tìm sản phẩm trong giỏ hàng
        const cartItem = await CartItem.findOne({ _id: item_id }).populate("variant_id", "stock");
        if (!cartItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        console.log(cartItem);

        // Kiểm tra tồn kho
        if (quantity > cartItem.variant_id.stock) {
            return res.status(400).json({ message: "Not enough quantity" });
        }

        // Nếu quantity = 0, xóa sản phẩm khỏi giỏ hàng
        if (quantity === 0) {
            await CartItem.findByIdAndDelete(item_id);
            return res.status(200).json({ message: "Remove items from cart successfully" });
        }

        // Cập nhật số lượng sản phẩm trong giỏ hàng
        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({
            message: "Update Cart Successfully",
            updatedItem: {
                item_id: cartItem._id,
                quantity: cartItem.quantity
            }
        });
    } catch (err) {
        console.error("Error in updateCartItem:", err);
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

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

module.exports = { addToCart, quantityItemsCart, getListItemsCart, removeItemFromCart, updateCartItem };
