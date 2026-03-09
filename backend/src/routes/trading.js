const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const tradingService = require('../services/tradingService');
const { errorResponse } = require('../utils/helpers');

const router = express.Router();

router.use(authenticateToken);

router.post('/buy', async (req, res, next) => {
  try {
    const { symbol, shares } = req.body;
    if (!symbol || !shares || shares <= 0) {
      return errorResponse(res, 400, 'Valid symbol and shares required', 'INVALID_INPUT');
    }
    const result = await tradingService.executeBuy(req.userId, symbol.toUpperCase(), shares);
    res.json(result);
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.statusCode, err.message, err.code);
    next(err);
  }
});

router.post('/sell', async (req, res, next) => {
  try {
    const { symbol, shares } = req.body;
    if (!symbol || !shares || shares <= 0) {
      return errorResponse(res, 400, 'Valid symbol and shares required', 'INVALID_INPUT');
    }
    const result = await tradingService.executeSell(req.userId, symbol.toUpperCase(), shares);
    res.json(result);
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.statusCode, err.message, err.code);
    next(err);
  }
});

router.post('/preview', async (req, res, next) => {
  try {
    const { symbol, shares, type } = req.body;
    if (!symbol || !shares || shares <= 0 || !type) {
      return errorResponse(res, 400, 'Valid symbol, shares, and type required', 'INVALID_INPUT');
    }
    const result = await tradingService.previewTrade(req.userId, symbol.toUpperCase(), shares, type.toUpperCase());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
