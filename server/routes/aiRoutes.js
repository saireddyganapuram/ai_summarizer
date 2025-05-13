const express = require('express');
const router = express.Router();
const { getResponse } = require('../controllers/aiController');

router.post('/response', getResponse);

module.exports = router; 