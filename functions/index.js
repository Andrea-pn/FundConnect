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

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.createChama = functions.https.onRequest(async (req, res) => {
  try {
    const {adminId, groupName, cycle, targetAmount} = req.body;

    const newChama = {
      adminId,
      groupName,
      cycle,
      targetAmount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection("chamas").add(newChama);

    res.status(200).send({success: true, id: ref.id});
  } catch (error) {
    console.error("Error creating chama:", error);
    res.status(500).send({success: false, error: error.message});
  }
});
