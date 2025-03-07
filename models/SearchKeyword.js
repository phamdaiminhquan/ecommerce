const mongoose = require("mongoose");

const SearchKeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  search_count: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("SearchKeyword", SearchKeywordSchema);
