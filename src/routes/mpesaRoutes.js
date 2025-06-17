const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesaController');

// Register M-Pesa URLs
router.post('/register', mpesaController.registerUrls);

// Initiate C2B payment
router.post('/initiate', mpesaController.initiatePayment);

// M-Pesa callbacks
router.post('/confirmation', mpesaController.confirmation);
router.post('/validation', mpesaController.validation);

// Check payment status
router.get('/status/:checkoutRequestId', mpesaController.checkStatus);

module.exports = router; 