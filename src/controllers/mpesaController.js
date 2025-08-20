const axios = require('axios');
const {
  MPESA_API_URL,
  MPESA_SHORTCODE,
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY
} = require('../config/mpesaConfig');

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
exports.initiateSTKPush = async (req, res) => {
  try {
    const { phoneNumber, amount, reference } = req.body;
    
    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, amount, and reference are required'
      });
    }

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
      CallBackURL: `${process.env.BASE_URL}/api/mpesa/stk-callback`,
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

    res.json({
      success: true,
      data: response.data,
      message: 'STK push initiated successfully'
    });
  } catch (error) {
    console.error('Error initiating STK push:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate STK push'
    });
  }
};

// Handle STK push callback
exports.stkCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { Amount, MpesaReceiptNumber, TransactionDate, PhoneNumber } = stkCallback.CallbackMetadata.Item;
      
      // Here you would update your database with the successful payment
      console.log('STK push successful:', {
        amount: Amount,
        receiptNumber: MpesaReceiptNumber,
        transactionDate: TransactionDate,
        phoneNumber: PhoneNumber
      });
      
      res.json({ success: true, message: 'Payment processed successfully' });
    } else {
      // Payment failed
      console.log('STK push failed:', stkCallback.ResultDesc);
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error handling STK callback:', error);
    res.status(500).json({ success: false, message: 'Error processing callback' });
  }
};

// Check STK push payment status
exports.checkSTKStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Checkout request ID is required'
      });
    }

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

    res.json({
      success: true,
      data: response.data,
      message: 'Status checked successfully'
    });
  } catch (error) {
    console.error('Error checking STK push status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
}; 