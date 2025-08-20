import axios from 'axios';

const MPESA_API_URL = process.env.REACT_APP_MPESA_API_URL;
const MPESA_CONSUMER_KEY = process.env.REACT_APP_MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.REACT_APP_MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.REACT_APP_MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.REACT_APP_MPESA_SHORTCODE;

// Get M-Pesa access token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Generate password for STK push
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// Initiate STK push payment
export const initiateSTKPush = async (phoneNumber, amount, reference) => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();
    
    const stkPushData = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.REACT_APP_API_URL}/api/mpesa/stk-callback`,
      AccountReference: reference,
      TransactionDesc: 'FundConnect Contribution'
    };

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating STK push:', error);
    throw error;
  }
};

// Verify STK push payment status
export const verifySTKPushStatus = async (checkoutRequestId) => {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();
    
    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying STK push status:', error);
    throw error;
  }
}; 