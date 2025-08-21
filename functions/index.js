/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const db = admin.firestore();

// Verify STK push payment
exports.verifySTKPushPayment = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to verify payments'
    );
  }

  try {
    const { checkoutRequestId, referenceNumber } = data;

    if (!checkoutRequestId || !referenceNumber) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Checkout request ID and reference number are required'
      );
    }

    // Get M-Pesa access token
    const authToken = await getMpesaAuthToken();

    // Query STK push status
    const response = await axios.post(
      getMpesaUrl('/mpesa/stkpushquery/v1/query'),
      {
        BusinessShortCode: functions.config().mpesa.business_shortcode,
        Password: generatePassword(),
        Timestamp: getTimestamp(),
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Store verification result
    await db.collection('stkPushVerifications').doc(referenceNumber).set({
      checkoutRequestId,
      referenceNumber,
      verificationResult: response.data,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: context.auth.uid,
      status: response.data.ResultCode === '0' ? 'success' : 'failed'
    });

    return {
      success: true,
      data: response.data,
      message: 'Payment verification completed'
    };
  } catch (error) {
    console.error('Error verifying STK push payment:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Payment verification failed'
    );
  }
});

// Handle STK push callback
exports.stkPushCallback = functions.https.onRequest(async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { Amount, MpesaReceiptNumber, TransactionDate, PhoneNumber } = stkCallback.CallbackMetadata.Item;
      
      // Update contribution status in database
      // You would implement your logic here to update the contribution status
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
    console.error('Error handling STK push callback:', error);
    res.status(500).json({ success: false, message: 'Error processing callback' });
  }
});

// Helper functions
async function getMpesaAuthToken() {
  try {
    const auth = Buffer.from(
      `${functions.config().mpesa.consumer_key}:${functions.config().mpesa.consumer_secret}`
    ).toString('base64');
    
    const response = await axios.get(
      getMpesaUrl('/oauth/v1/generate?grant_type=client_credentials'),
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa auth token:', error);
    throw error;
  }
}

function generatePassword() {
  const timestamp = getTimestamp();
  const password = Buffer.from(
    functions.config().mpesa.business_shortcode +
    functions.config().mpesa.passkey +
    timestamp
  ).toString('base64');
  return password;
}

function getTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}

function getMpesaUrl(path) {
  const baseUrl = functions.config().mpesa.env === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
  return `${baseUrl}${path}`;
}