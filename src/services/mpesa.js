import axios from 'axios';

const MPESA_API_URL = process.env.REACT_APP_MPESA_API_URL;
const MPESA_CONSUMER_KEY = process.env.REACT_APP_MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.REACT_APP_MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.REACT_APP_MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.REACT_APP_MPESA_SHORTCODE;

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

// Initiate C2B payment
export const initiateC2BPayment = async (phoneNumber, amount, reference) => {
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/c2b/v1/registerurl`,
      {
        ShortCode: MPESA_SHORTCODE,
        ResponseType: 'Completed',
        ConfirmationURL: `${process.env.REACT_APP_API_URL}/api/mpesa/confirmation`,
        ValidationURL: `${process.env.REACT_APP_API_URL}/api/mpesa/validation`
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (response.data.ResponseCode === '0') {
      // Initiate payment
      const paymentResponse = await axios.post(
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

      return paymentResponse.data;
    } else {
      throw new Error('Failed to register URLs');
    }
  } catch (error) {
    console.error('Error initiating C2B payment:', error);
    throw error;
  }
};

// Verify payment status
export const verifyPayment = async (checkoutRequestId) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: Buffer.from(
          `${MPESA_SHORTCODE}${MPESA_PASSKEY}${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)}`
        ).toString('base64'),
        Timestamp: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3),
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 