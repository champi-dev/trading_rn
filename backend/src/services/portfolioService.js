const { getDb } = require('../config/database');
const marketService = require('./marketService');
const { round2 } = require('../utils/helpers');

async function getHoldings(userId) {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM holdings WHERE user_id = ?').all(userId);

  if (rows.length === 0) return { holdings: [] };

  const symbols = rows.map((r) => r.symbol);
  const { quotes } = await marketService.getBatchQuotes(symbols);

  const holdings = rows.map((h) => {
    const quote = quotes[h.symbol] || {};
    const currentPrice = quote.price || h.avg_cost_basis;
    const marketValue = round2(currentPrice * h.shares);
    const costBasis = round2(h.avg_cost_basis * h.shares);
    const gainLoss = round2(marketValue - costBasis);
    const gainLossPercent = costBasis > 0 ? round2((gainLoss / costBasis) * 100) : 0;

    return {
      symbol: h.symbol,
      companyName: h.company_name,
      shares: h.shares,
      avgCost: h.avg_cost_basis,
      currentPrice,
      marketValue,
      gainLoss,
      gainLossPercent,
      dayChange: quote.change || 0,
      dayChangePercent: quote.changePercent || 0,
    };
  });

  return { holdings };
}

async function getSummary(userId) {
  const db = getDb();
  const user = db.prepare('SELECT cash_balance FROM users WHERE id = ?').get(userId);
  const { holdings } = await getHoldings(userId);

  const investedValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const costBasis = holdings.reduce((sum, h) => sum + h.avgCost * h.shares, 0);
  const totalValue = round2(user.cash_balance + investedValue);
  const totalGainLoss = round2(investedValue - costBasis);
  const totalGainLossPercent = costBasis > 0 ? round2((totalGainLoss / costBasis) * 100) : 0;
  const dayGainLoss = round2(holdings.reduce((sum, h) => sum + (h.dayChange || 0) * h.shares, 0));

  return {
    totalValue,
    cashBalance: user.cash_balance,
    investedValue: round2(investedValue),
    totalGainLoss,
    totalGainLossPercent,
    dayGainLoss,
  };
}

module.exports = { getHoldings, getSummary };
