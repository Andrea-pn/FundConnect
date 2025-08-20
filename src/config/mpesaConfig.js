const axios = require('axios');

const MPESA_API_URL = process.env.MPESA_API_URL;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'MPESA_API_URL',
    'MPESA_CONSUMER_KEY', 
    'MPESA_CONSUMER_SECRET',
    'MPESA_PASSKEY',
    'MPESA_SHORTCODE'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required M-Pesa configuration: ${missing.join(', ')}`);
  }
};

// Get M-Pesa access token
const getAccessToken = async () => {
  try {
    validateConfig();
    
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw error;
  }
};

// Generate password for STK push
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
};

module.exports = {
  MPESA_API_URL,
  MPESA_SHORTCODE,
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY,
  getAccessToken,
  generatePassword,
  validateConfig
}; 