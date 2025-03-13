const Review = require("../models/Review");
const Product = require("../models/Product");

// GET api/reviews/
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageParsed = Math.max(parseInt(page, 10), 1);
        const limitParsed = Math.max(parseInt(limit, 10), 1);

        const reviews = await Review.find({ product: productId, isDeleted: false }) // Lọc đánh giá chưa bị xóa
            .populate("user_id", "name")
            .sort({ createdAt: -1 })
            .limit(limitParsed)
            .skip((pageParsed - 1) * limitParsed);

        const totalReviews = await Review.countDocuments({ product: productId, isDeleted: false });

        res.status(200).json({
            total: totalReviews,
            page: pageParsed,
            limit: limitParsed,
            reviews
        });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

const updateReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findOne({ user: userId, product: productId });
        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá của bạn" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.updatedAt = new Date();

        await review.save();
        res.status(200).json({ message: "Cập nhật đánh giá thành công", review });

    } catch (error) {
        console.error("Lỗi khi cập nhật đánh giá:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const review = await Review.findOne({ user: userId, product: productId });
        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá của bạn" });
        }

        review.isDeleted = true;
        await review.save();

        res.status(200).json({ message: "Xóa đánh giá thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa đánh giá:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // Lấy ID khách hàng từ middleware auth

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // Kiểm tra xem khách hàng đã mua sản phẩm này chưa
    const hasPurchased = true; // Giả lập kiểm tra, thực tế cần kiểm tra từ bảng đơn hàng
    if (!hasPurchased) return res.status(403).json({ message: "Bạn phải mua sản phẩm mới có thể đánh giá" });

    // Tạo đánh giá mới
    const newReview = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json({ message: "Đánh giá đã được thêm thành công", review: newReview });

  } catch (error) {
    console.error("Lỗi khi thêm đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = { getReviewsByProduct }