const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({
  validation: { logErrors: false, logOptionsErrors: false },
});
const { getDb } = require('../config/database');

const CACHE_TTL_MS = 30 * 1000; // 30 seconds

function getCached(symbol, ignoreTTL = false) {
  const db = getDb();
  const row = db.prepare('SELECT data, updated_at FROM price_cache WHERE symbol = ?').get(symbol);
  if (!row) return null;
  if (!ignoreTTL) {
    const age = Date.now() - new Date(row.updated_at + 'Z').getTime();
    if (age > CACHE_TTL_MS) return null;
  }
  return JSON.parse(row.data);
}

function setCache(symbol, data) {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO price_cache (symbol, data, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))"
  ).run(symbol, JSON.stringify(data));
}

async function getQuote(symbol, { skipCache = false } = {}) {
  if (!skipCache) {
    const cached = getCached(`quote:${symbol}`);
    if (cached) return cached;
  }

  try {

    const result = await yahooFinance.quote(symbol, {}, { validateResult: false });
    const quote = {
      symbol: result.symbol,
      name: result.shortName || result.longName || symbol,
      price: result.regularMarketPrice,
      change: result.regularMarketChange,
      changePercent: result.regularMarketChangePercent,
      high: result.regularMarketDayHigh,
      low: result.regularMarketDayLow,
      open: result.regularMarketOpen,
      prevClose: result.regularMarketPreviousClose,
      volume: result.regularMarketVolume,
      marketCap: result.marketCap,
      pe: result.trailingPE,
      week52High: result.fiftyTwoWeekHigh,
      week52Low: result.fiftyTwoWeekLow,
    };
    setCache(`quote:${symbol}`, quote);
    return quote;
  } catch (err) {
    // Fallback to stale cache when Yahoo Finance fails
    const stale = getCached(`quote:${symbol}`, true);
    if (stale) return stale;
    throw err;
  }
}

async function getHistory(symbol, range = '1mo') {
  const cacheKey = `history:${symbol}:${range}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {

    const rangeMap = {
      '1d': { period1: daysAgo(1), interval: '5m' },
      '5d': { period1: daysAgo(5), interval: '15m' },
      '1mo': { period1: daysAgo(30), interval: '1d' },
      '3mo': { period1: daysAgo(90), interval: '1d' },
      '1y': { period1: daysAgo(365), interval: '1wk' },
      '5y': { period1: daysAgo(1825), interval: '1mo' },
    };

    const opts = rangeMap[range] || rangeMap['1mo'];
    const result = await yahooFinance.chart(symbol, {
      period1: opts.period1,
      interval: opts.interval,
    }, { validateResult: false });

    const prices = (result.quotes || []).map((q) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    })).filter((q) => q.close != null);

    setCache(cacheKey, { prices });
    return { prices };
  } catch (err) {
    const stale = getCached(cacheKey, true);
    if (stale) return stale;
    throw err;
  }
}

async function search(query) {
  try {

    const result = await yahooFinance.search(query, {}, { validateResult: false });
    const results = (result.quotes || [])
      .filter((q) => q.quoteType === 'EQUITY')
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
        type: q.quoteType,
      }));
    return { results };
  } catch (err) {
    return { results: [] };
  }
}

async function getTrending() {
  const cached = getCached('trending');
  if (cached) return cached;

  const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'DIS'];

  let symbols = defaultSymbols;
  try {
    const trending = await yahooFinance.trendingSymbols('US', { count: 10 }, { validateResult: false });
    if (trending.quotes && trending.quotes.length > 0) {
      symbols = trending.quotes.map((q) => q.symbol).slice(0, 10);
    }
  } catch {
    // fall back to default symbols
  }

  try {
    const quotes = await yahooFinance.quote(symbols, {}, { validateResult: false });
    const stocks = (Array.isArray(quotes) ? quotes : [quotes]).map((q) => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice,
      changePercent: q.regularMarketChangePercent,
    }));

    const data = { stocks };
    setCache('trending', data);
    return data;
  } catch (err) {
    const stale = getCached('trending', true);
    if (stale) return stale;
    return { stocks: [] };
  }
}

async function getBatchQuotes(symbols) {
  const quotes = {};
  const uncached = [];

  for (const sym of symbols) {
    const cached = getCached(`quote:${sym}`);
    if (cached) {
      quotes[sym] = cached;
    } else {
      uncached.push(sym);
    }
  }

  if (uncached.length > 0) {
    try {
  
      const results = await yahooFinance.quote(uncached, {}, { validateResult: false });
      const arr = Array.isArray(results) ? results : [results];
      for (const r of arr) {
        const q = {
          symbol: r.symbol,
          name: r.shortName || r.longName || r.symbol,
          price: r.regularMarketPrice,
          change: r.regularMarketChange,
          changePercent: r.regularMarketChangePercent,
          high: r.regularMarketDayHigh,
          low: r.regularMarketDayLow,
          open: r.regularMarketOpen,
          prevClose: r.regularMarketPreviousClose,
          volume: r.regularMarketVolume,
          marketCap: r.marketCap,
          pe: r.trailingPE,
          week52High: r.fiftyTwoWeekHigh,
          week52Low: r.fiftyTwoWeekLow,
        };
        setCache(`quote:${r.symbol}`, q);
        quotes[r.symbol] = q;
      }
    } catch {
      // Use stale cache for any uncached symbols
      for (const sym of uncached) {
        const stale = getCached(`quote:${sym}`, true);
        if (stale) quotes[sym] = stale;
      }
    }
  }

  return { quotes };
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

module.exports = { getQuote, getHistory, search, getTrending, getBatchQuotes };
