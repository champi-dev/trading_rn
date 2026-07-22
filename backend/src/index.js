require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { getDb } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const tradingRoutes = require('./routes/trading');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
// App-store requirement: privacy policy reachable in a browser
app.get('/privacy', (_req, res) =>
  res.sendFile(require('path').resolve(process.cwd(), 'public', 'privacy.html'))
);

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/trade', tradingRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Seed demo user
function seedDemoUser() {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@test.com');
  if (existing) return;

  const seedHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgCost: 178.50 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 5, avgCost: 141.25 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 8, avgCost: 378.90 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', shares: 3, avgCost: 248.00 },
  ];

  // $100k starting balance minus cost of seeded holdings
  const seedCost = seedHoldings.reduce((sum, h) => sum + h.shares * h.avgCost, 0);
  const startingCash = Math.round((100000 - seedCost) * 100) / 100; // $93,733.55

  const hash = bcrypt.hashSync('password123', 10);
  const result = db.prepare('INSERT INTO users (email, username, password_hash, cash_balance) VALUES (?, ?, ?, ?)').run(
    'demo@test.com', 'DemoTrader', hash, startingCash
  );
  const userId = result.lastInsertRowid;

  const insertHolding = db.prepare(
    'INSERT INTO holdings (user_id, symbol, company_name, shares, avg_cost_basis) VALUES (?, ?, ?, ?, ?)'
  );
  const insertTx = db.prepare(
    'INSERT INTO transactions (user_id, symbol, type, shares, price_per_share, total_amount) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const h of seedHoldings) {
    insertHolding.run(userId, h.symbol, h.name, h.shares, h.avgCost);
    insertTx.run(userId, h.symbol, 'BUY', h.shares, h.avgCost, h.shares * h.avgCost);
  }

  // Seed watchlist
  const watchSymbols = ['AMZN', 'NVDA', 'META', 'NFLX'];
  const insertWatch = db.prepare('INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)');
  for (const sym of watchSymbols) {
    insertWatch.run(userId, sym);
  }

  console.log('Demo user seeded: demo@test.com / password123');
}

// Start
seedDemoUser();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
