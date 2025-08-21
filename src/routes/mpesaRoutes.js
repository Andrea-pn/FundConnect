const express = require('express');
const mpesaController = require('../controllers/mpesaController');

const router = express.Router();

// STK push payment endpoints
router.post('/stk-push', mpesaController.initiateSTKPush);
router.post('/stk-callback', mpesaController.stkCallback);
router.get('/stk-status/:checkoutRequestId', mpesaController.checkSTKStatus);

module.exports = router; 