const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDb } = require('../config/database');
const marketService = require('../services/marketService');
const { errorResponse } = require('../utils/helpers');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT symbol FROM watchlist WHERE user_id = ? ORDER BY added_at DESC').all(req.userId);

    if (rows.length === 0) return res.json({ items: [] });

    const symbols = rows.map((r) => r.symbol);
    const { quotes } = await marketService.getBatchQuotes(symbols);

    const items = rows.map((r) => {
      const q = quotes[r.symbol] || {};
      return {
        symbol: r.symbol,
        name: q.name || r.symbol,
        price: q.price || 0,
        change: q.change || 0,
        changePercent: q.changePercent || 0,
      };
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  const { symbol } = req.body;
  if (!symbol) return errorResponse(res, 400, 'Symbol required', 'MISSING_SYMBOL');

  const db = getDb();
  try {
    db.prepare('INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)').run(req.userId, symbol.toUpperCase());
    res.status(201).json({ item: { symbol: symbol.toUpperCase() } });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return errorResponse(res, 409, 'Already in watchlist', 'DUPLICATE');
    }
    next(err);
  }
});

router.delete('/:symbol', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?').run(req.userId, req.params.symbol.toUpperCase());
  res.json({ success: true });
});

module.exports = router;
