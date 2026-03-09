const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { authenticateToken, generateToken } = require('../middleware/auth');
const { errorResponse } = require('../utils/helpers');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return errorResponse(res, 400, 'Email, username, and password are required', 'MISSING_FIELDS');
  }
  if (password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters', 'WEAK_PASSWORD');
  }

  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return errorResponse(res, 409, 'Email or username already exists', 'USER_EXISTS');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)').run(email, username, passwordHash);

  const token = generateToken(result.lastInsertRowid);
  const user = db.prepare('SELECT id, email, username, cash_balance, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required', 'MISSING_FIELDS');
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user.id);
  const { password_hash, ...safeUser } = user;

  res.json({ token, user: safeUser });
});

router.get('/me', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, username, cash_balance, created_at FROM users WHERE id = ?').get(req.userId);

  if (!user) {
    return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
  }

  res.json({ user });
});

module.exports = router;
