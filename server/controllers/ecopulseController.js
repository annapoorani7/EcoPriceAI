const { getOwnerOverview } = require('../services/ecopulseService');

const getOverview = async (req, res) => {
  try {
    const overview = await getOwnerOverview(req.user._id);
    return res.status(200).json({ success: true, ...overview });
  } catch (error) {
    console.error('EcoPulse overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load EcoPulse insights right now.',
    });
  }
};

module.exports = { getOverview };