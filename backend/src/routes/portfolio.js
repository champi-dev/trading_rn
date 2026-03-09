const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const portfolioService = require('../services/portfolioService');

const router = express.Router();

router.use(authenticateToken);

router.get('/holdings', async (req, res, next) => {
  try {
    const result = await portfolioService.getHoldings(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/summary', async (req, res, next) => {
  try {
    const result = await portfolioService.getSummary(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
