const Ad = require("../models/Ads");

// GET api/ads
const getActiveAds = async (req, res) => {
  try {
    const currentTime = new Date();
    const activeAds = await Ad.find({
      startTime: { $lte: currentTime },  // startTime <= currentTime
      endTime: { $gte: currentTime }     // endTime >= currentTime
    }).sort({ startTime: 1 });

    res.json(activeAds);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

module.exports = { getActiveAds };
