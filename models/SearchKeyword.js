const mongoose = require("mongoose");

const SearchKeywordSchema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true },
  search_count: { type: Number, default: 1 }
});

module.exports = mongoose.model("SearchKeyword", SearchKeywordSchema);
