const axios = require('axios');

const MPESA_API_URL = process.env.MPESA_API_URL;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;

// Generate access token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Generate timestamp
const getTimestamp = () => {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
};

// Generate password
const generatePassword = (timestamp) => {
  return Buffer.from(
    `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
  ).toString('base64');
};

module.exports = {
  MPESA_API_URL,
  MPESA_SHORTCODE,
  getAccessToken,
  getTimestamp,
  generatePassword
}; 