const axios = require('axios');
const { 
  MPESA_API_URL, 
  MPESA_SHORTCODE, 
  getAccessToken, 
  getTimestamp, 
  generatePassword 
} = require('../config/mpesaConfig');

// Register M-Pesa URLs
exports.registerUrls = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/c2b/v1/registerurl`,
      {
        ShortCode: MPESA_SHORTCODE,
        ResponseType: 'Completed',
        ConfirmationURL: `${process.env.BASE_URL}/api/mpesa/confirmation`,
        ValidationURL: `${process.env.BASE_URL}/api/mpesa/validation`
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error registering URLs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register M-Pesa URLs',
      error: error.message
    });
  }
};

// Initiate C2B payment
exports.initiatePayment = async (req, res) => {
  try {
    const { phoneNumber, amount, reference } = req.body;
    
    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number, amount, and reference are required'
      });
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/c2b/v1/simulate`,
      {
        ShortCode: MPESA_SHORTCODE,
        CommandID: 'CustomerPayBillOnline',
        Amount: amount,
        Msisdn: phoneNumber,
        BillRefNumber: reference
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

// Handle M-Pesa confirmation
exports.confirmation = async (req, res) => {
  try {
    const data = req.body;
    console.log('M-Pesa confirmation:', data);

    // Here you would typically:
    // 1. Verify the transaction
    // 2. Update your database
    // 3. Send notifications
    // 4. Update contribution status

    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('Error processing confirmation:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Failed to process confirmation'
    });
  }
};

// Handle M-Pesa validation
exports.validation = async (req, res) => {
  try {
    const data = req.body;
    console.log('M-Pesa validation:', data);

    // Here you would typically:
    // 1. Validate the transaction details
    // 2. Check if the amount matches
    // 3. Verify the account

    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('Error processing validation:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Failed to process validation'
    });
  }
};

// Check payment status
exports.checkStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

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
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check payment status',
      error: error.message
    });
  }
}; 