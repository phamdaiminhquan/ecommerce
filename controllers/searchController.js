const SearchKeyword = require("../models/SearchKeyword");

const getKeywordSuggestions = async (req, res) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        const limitParsed = parseInt(limit);
        const pageParsed = parseInt(page);
        const skip = (pageParsed - 1) * limitParsed;

        if (!keyword) {
            return res.status(400).json({ message: "Empty keyword" });
        }

        // Suggestions 
        const suggestions = await SearchKeyword.find({keyword: { $regex: keyword, $options: "i" }})
            .sort({ search_count: -1 })
            .skip(skip)
            .limit(limitParsed)
            .select("_id keyword search_count")
            .lean();
        
        res.status(200).json({ suggestions });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { getKeywordSuggestions };
