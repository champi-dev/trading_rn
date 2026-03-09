const express = require('express');
const marketService = require('../services/marketService');
const { errorResponse } = require('../utils/helpers');

const router = express.Router();

router.get('/quote/:symbol', async (req, res, next) => {
  try {
    const quote = await marketService.getQuote(req.params.symbol.toUpperCase());
    res.json(quote);
  } catch (err) {
    next(err);
  }
});

router.get('/history/:symbol', async (req, res, next) => {
  try {
    const range = req.query.range || '1mo';
    const history = await marketService.getHistory(req.params.symbol.toUpperCase(), range);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q) return errorResponse(res, 400, 'Search query required', 'MISSING_QUERY');
    const results = await marketService.search(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const trending = await marketService.getTrending();
    res.json(trending);
  } catch (err) {
    next(err);
  }
});

router.get('/batch', async (req, res, next) => {
  try {
    const symbols = req.query.symbols;
    if (!symbols) return errorResponse(res, 400, 'Symbols parameter required', 'MISSING_SYMBOLS');
    const symbolList = symbols.split(',').map((s) => s.trim().toUpperCase());
    const quotes = await marketService.getBatchQuotes(symbolList);
    res.json(quotes);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
