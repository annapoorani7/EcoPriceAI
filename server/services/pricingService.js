const axios = require('axios');

const getRecommendedPrice = async (payload) => {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001/predict-price';

  try {
    const response = await axios.post(mlServiceUrl, payload, {
      timeout: 15000,
    });

    const pricingFields = ['basePrice', 'recommendedPrice', 'priceChange', 'priceChangePercentage'];
    if (!response.data || pricingFields.some((field) => !Number.isFinite(Number(response.data[field])))) {
      throw new Error('ML service returned an invalid pricing response');
    }

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to get pricing recommendation from ML service';
    const normalizedMessage = message.toLowerCase();

    console.error('Pricing ML request failed:', {
      mlServiceUrl,
      message,
      code: error.code,
      status: error.response?.status,
    });

    if (normalizedMessage.includes('timeout') || normalizedMessage.includes('timed out') || error.code === 'ECONNABORTED') {
      throw new Error('Pricing service is taking too long to respond. Please try again.');
    }

    if (normalizedMessage.includes('network') || normalizedMessage.includes('econnrefused') || normalizedMessage.includes('connect')) {
      throw new Error('The pricing service is unavailable right now. Please try again.');
    }

    throw new Error(message);
  }
};

module.exports = {
  getRecommendedPrice,
};
