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
const crypto = require('crypto');

admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

exports.verifyMpesaPayment = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'You must be logged in to verify payments'
    );
  }

  const { referenceNumber } = data;
  
  if (!referenceNumber) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Reference number is required'
    );
  }

  try {
    // 1. Get M-Pesa access token
    const authToken = await getMpesaAuthToken();
    
    // 2. Prepare transaction query
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
    const password = generatePassword(timestamp);
    
    const payload = {
      BusinessShortCode: functions.config().mpesa.business_shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionID: referenceNumber,
      PartyA: functions.config().mpesa.business_shortcode,
      IdentifierType: '4',
      ResultURL: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/mpesaCallback`,
      QueueTimeOutURL: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/mpesaTimeout`,
      Remarks: 'FundConnect payment verification',
      Occasion: 'Payment'
    };

    // 3. Make the API request
    const response = await axios.post(
      getMpesaUrl('/mpesa/transactionstatus/v1/query'),
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. Save verification request to Firestore
    await db.collection('mpesaVerifications').doc(referenceNumber).set({
      userId: context.auth.uid,
      referenceNumber,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      responseData: response.data
    });

    return {
      success: true,
      message: 'Verification initiated',
      data: response.data
    };

  } catch (error) {
    console.error('Verification error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Payment verification failed'
    );
  }
});

// Helper functions
async function getMpesaAuthToken() {
  const auth = Buffer.from(
    `${functions.config().mpesa.consumer_key}:${functions.config().mpesa.consumer_secret}`
  ).toString('base64');

  const response = await axios.get(
    getMpesaUrl('/oauth/v1/generate?grant_type=client_credentials'),
    {
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  );

  return response.data.access_token;
}

function generatePassword(timestamp) {
  const str = 
    functions.config().mpesa.business_shortcode + 
    functions.config().mpesa.passkey + 
    timestamp;
  return Buffer.from(str).toString('base64');
}

function getMpesaUrl(path) {
  const baseUrl = functions.config().mpesa.env === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
  return baseUrl + path;
}

exports.mpesaCallback = functions.https.onRequest(async (req, res) => {
  try {
    const result = req.body;
    const referenceNumber = result.TransactionID;

    // Update verification status in Firestore
    await db.collection('mpesaVerifications').doc(referenceNumber).update({
      status: 'completed',
      resultData: result,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // You might also update the user's payment records here
    // ...

    res.status(200).send();
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send();
  }
});

exports.mpesaTimeout = functions.https.onRequest((req, res) => {
  console.log('Timeout callback:', req.body);
  res.status(200).send();
});