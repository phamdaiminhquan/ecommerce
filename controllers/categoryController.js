const Category = require("../models/Category");

// Lấy danh sách danh mục, sắp xếp theo số lượng bán ra (total_sales giảm dần)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ total_sales: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

module.exports = { getCategories };
