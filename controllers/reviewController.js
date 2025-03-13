// const Review = require("../models/Review");
// const Product = require("../models/Product");

// // GET api/reviews/:productId
// const getReviewsByProduct = async (req, res) => {
//     try {
//         // Input
//         const { productId } = req.params;
//         if (!productId) {
//             return res.status(404).json({ message: "No productId provided" });
//         };

//         // Pagination
//         const { page, limit } = req.query;
//         let limitParsed = parseInt(limit);
//         let pageParsed = parseInt(page);

//         if (isNaN(limitParsed) || limitParsed <= 0) {
//             limitParsed = null; // Không giới hạn số lượng dữ liệu
//         }
//         if (isNaN(pageParsed) || pageParsed <= 0) {
//             pageParsed = 1;
//         }

//         const skip = limitParsed ? (pageParsed - 1) * limitParsed : 0;

//         // Get reviews
//         const reviews = await Review.find({ product_id: productId, isDeleted: false }) // Lọc đánh giá chưa bị xóa
//             .populate("user_id variant_id", "name")
//             .sort({ createdAt: -1 })
//             .limit(limitParsed)
//             .skip(skip);

//         const totalReviews = await Review.countDocuments({ product_id: productId, isDeleted: false });

//         res.status(200).json({
//             total: totalReviews,
//             page: pageParsed,
//             limit: limitParsed,
//             reviews
//         });

//     } catch (error) {
//         console.error("Lỗi khi lấy danh sách đánh giá:", error);
//         res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
//     }
// };

// // POST api/reviews/add/:productId
// const addReview = async (req, res) => {
//     try {
//         // check user
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ message: "Unauthorized: User ID is missing" });
//         }
//         const user_id = req.user.id;

//         // Input
//         const { productId } = req.params;
//         const { rating, comment } = req.body;

//         // Kiểm tra sản phẩm có tồn tại không
//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: "Product does not exist" });

//         // Kiểm tra xem khách hàng đã mua sản phẩm này chưa
//         const hasPurchased = true; // Giả lập kiểm tra, thực tế cần kiểm tra từ bảng đơn hàng
//         if (!hasPurchased) return res.status(403).json({ message: "Bạn phải mua sản phẩm mới có thể đánh giá" });

//         // Tạo đánh giá mới
//         const newReview = new Review({
//             user_id: user_id,
//             product_id: productId,
//             rating,
//             comment
//         });

//         await newReview.save();
//         res.status(201).json({ message: "Đánh giá đã được thêm thành công", review: newReview });
//     } catch (error) {
//         console.error("Lỗi khi thêm đánh giá:", error);
//         res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
//     }
// };

// const updateReview = async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { rating, comment } = req.body;
//         const userId = req.user.id;

//         const review = await Review.findOne({ user: userId, product: productId });
//         if (!review) {
//             return res.status(404).json({ message: "Không tìm thấy đánh giá của bạn" });
//         }

//         review.rating = rating || review.rating;
//         review.comment = comment || review.comment;
//         review.updatedAt = new Date();

//         await review.save();
//         res.status(200).json({ message: "Cập nhật đánh giá thành công", review });

//     } catch (error) {
//         console.error("Lỗi khi cập nhật đánh giá:", error);
//         res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
//     }
// };

// const deleteReview = async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const userId = req.user.id;

//         const review = await Review.findOne({ user: userId, product: productId });
//         if (!review) {
//             return res.status(404).json({ message: "Không tìm thấy đánh giá của bạn" });
//         }

//         review.isDeleted = true;
//         await review.save();

//         res.status(200).json({ message: "Xóa đánh giá thành công" });
//     } catch (error) {
//         console.error("Lỗi khi xóa đánh giá:", error);
//         res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
//     }
// };

// module.exports = { getReviewsByProduct, addReview }