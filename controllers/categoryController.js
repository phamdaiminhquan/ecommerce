const Category = require("../models/Category");

// GET api/categories 
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ total_sales: -1 })
      .select("-description");

    if (!categories.length) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json(categories);
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err); // Ghi log để debug
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

module.exports = { getCategories };
