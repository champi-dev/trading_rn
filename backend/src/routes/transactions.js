const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDb } = require('../config/database');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const db = getDb();
  const { symbol, type, limit = 50, offset = 0 } = req.query;

  let sql = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [req.userId];

  if (symbol) {
    sql += ' AND symbol = ?';
    params.push(symbol.toUpperCase());
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type.toUpperCase());
  }

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const total = db.prepare(countSql).get(...params).total;

  sql += ' ORDER BY executed_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const transactions = db.prepare(sql).all(...params);
  res.json({ transactions, total });
});

module.exports = router;
