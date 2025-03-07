const Ad = require("../models/Ads");

// API lấy danh sách quảng cáo đang hoạt động
const getActiveAds = async (req, res) => {
  try {
    const currentTime = new Date(); // Lấy thời gian hiện tại 
    const activeAds = await Ad.find({
      startTime: { $lte: currentTime },  // startTime <= currentTime
      endTime: { $gte: currentTime }     // endTime >= currentTime
    }).sort({ startTime: 1 });  // Sắp xếp theo thời gian bắt đầu tăng dần

    res.json(activeAds);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

module.exports = { getActiveAds };
