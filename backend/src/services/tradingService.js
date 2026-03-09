const { getDb } = require('../config/database');
const marketService = require('./marketService');
const { round2 } = require('../utils/helpers');

async function previewTrade(userId, symbol, shares, type) {
  const quote = await marketService.getQuote(symbol);
  const estimatedCost = round2(quote.price * shares);

  const db = getDb();
  const user = db.prepare('SELECT cash_balance FROM users WHERE id = ?').get(userId);
  const holding = db.prepare('SELECT shares FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, symbol);

  return {
    estimatedCost,
    currentPrice: quote.price,
    fees: 0,
    canExecute: type === 'BUY' ? user.cash_balance >= estimatedCost : (holding ? holding.shares >= shares : false),
    availableCash: user.cash_balance,
    ownedShares: holding ? holding.shares : 0,
  };
}

async function executeBuy(userId, symbol, shares) {
  const db = getDb();
  // Fetch fresh real-time price (skip cache) per spec requirement
  const quote = await marketService.getQuote(symbol, { skipCache: true });
  const price = quote.price;
  const totalCost = round2(price * shares);

  const user = db.prepare('SELECT cash_balance FROM users WHERE id = ?').get(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
  if (user.cash_balance < totalCost) {
    throw Object.assign(new Error('Insufficient funds'), { statusCode: 400, code: 'INSUFFICIENT_FUNDS' });
  }

  const exec = db.transaction(() => {
    db.prepare('UPDATE users SET cash_balance = cash_balance - ? WHERE id = ?').run(totalCost, userId);

    const existing = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, symbol);
    if (existing) {
      const newShares = existing.shares + shares;
      const newAvgCost = round2((existing.avg_cost_basis * existing.shares + price * shares) / newShares);
      db.prepare('UPDATE holdings SET shares = ?, avg_cost_basis = ? WHERE id = ?').run(newShares, newAvgCost, existing.id);
    } else {
      db.prepare('INSERT INTO holdings (user_id, symbol, company_name, shares, avg_cost_basis) VALUES (?, ?, ?, ?, ?)').run(
        userId, symbol, quote.name, shares, price
      );
    }

    db.prepare(
      'INSERT INTO transactions (user_id, symbol, type, shares, price_per_share, total_amount) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, symbol, 'BUY', shares, price, totalCost);

    const updatedRow = db.prepare('SELECT symbol, company_name, shares, avg_cost_basis FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, symbol);
    const newCash = db.prepare('SELECT cash_balance FROM users WHERE id = ?').get(userId).cash_balance;

    return {
      transaction: { symbol, type: 'BUY', shares, pricePerShare: price, totalAmount: totalCost },
      updatedHolding: updatedRow ? {
        symbol: updatedRow.symbol,
        companyName: updatedRow.company_name,
        shares: updatedRow.shares,
        avgCostBasis: updatedRow.avg_cost_basis,
      } : null,
      cashBalance: newCash,
    };
  });

  return exec();
}

async function executeSell(userId, symbol, shares) {
  const db = getDb();
  // Fetch fresh real-time price (skip cache) per spec requirement
  const quote = await marketService.getQuote(symbol, { skipCache: true });
  const price = quote.price;
  const totalProceeds = round2(price * shares);

  const holding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, symbol);
  if (!holding || holding.shares < shares) {
    throw Object.assign(new Error('Insufficient shares'), { statusCode: 400, code: 'INSUFFICIENT_SHARES' });
  }

  // Calculate P&L on this sell transaction
  const gainLoss = round2((price - holding.avg_cost_basis) * shares);

  const exec = db.transaction(() => {
    db.prepare('UPDATE users SET cash_balance = cash_balance + ? WHERE id = ?').run(totalProceeds, userId);

    const remainingShares = round2(holding.shares - shares);
    if (remainingShares <= 0.0001) {
      db.prepare('DELETE FROM holdings WHERE id = ?').run(holding.id);
    } else {
      db.prepare('UPDATE holdings SET shares = ? WHERE id = ?').run(remainingShares, holding.id);
    }

    db.prepare(
      'INSERT INTO transactions (user_id, symbol, type, shares, price_per_share, total_amount) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, symbol, 'SELL', shares, price, totalProceeds);

    const updatedRow = db.prepare('SELECT symbol, company_name, shares, avg_cost_basis FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, symbol);
    const newCash = db.prepare('SELECT cash_balance FROM users WHERE id = ?').get(userId).cash_balance;

    return {
      transaction: { symbol, type: 'SELL', shares, pricePerShare: price, totalAmount: totalProceeds, gainLoss },
      updatedHolding: updatedRow ? {
        symbol: updatedRow.symbol,
        companyName: updatedRow.company_name,
        shares: updatedRow.shares,
        avgCostBasis: updatedRow.avg_cost_basis,
      } : null,
      cashBalance: newCash,
    };
  });

  return exec();
}

module.exports = { previewTrade, executeBuy, executeSell };
