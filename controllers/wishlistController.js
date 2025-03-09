const wishlist = require("../models/Wishlist")

const favorite = async (req,res) => {
    try{
        
        const { product_id, status } = req.body;
        const user_id = req.user.id;

        if(!product_id || status === undefined) {   
            return res.status(400).json({ message: "Product ID and Status is required" });
        }

        let favorite = await wishlist.findOne({user_id: user_id, product_id: product_id});

        if (!favorite){
            favorite = new wishlist({ user_id, product_id, isActive: status });
        } else {
            favorite.isActive = status;
        }

        await favorite.save();

        res.status(200).json({ message: "Favorite is update", favorite });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = {favorite};