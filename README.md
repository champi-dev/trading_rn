# StockTrader — Paper Trading Demo App

A full-stack mobile stock trading simulator with **real-time market data** from Yahoo Finance. Users start with $100,000 in virtual cash to practice trading without risk.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Mobile App                       │
│              React Native · Expo 55                 │
│                                                     │
│  ┌───────────┐  ┌───────────┐  ┌────────────────┐  │
│  │  Zustand   │  │  React    │  │  NativeWind    │  │
│  │  Stores    │  │  Query    │  │  (Tailwind)    │  │
│  └─────┬─────┘  └─────┬─────┘  └────────────────┘  │
│        │              │                              │
│        └──────┬───────┘                              │
│               │ Axios + JWT                          │
└───────────────┼──────────────────────────────────────┘
                │ HTTP/REST
┌───────────────┼──────────────────────────────────────┐
│               ▼                                      │
│          Express.js API                              │
│                                                      │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │   Auth   │  │  Trading    │  │  Market Data   │  │
│  │  (JWT)   │  │  Engine     │  │  (Yahoo Fin.)  │  │
│  └────┬─────┘  └──────┬──────┘  └───────┬────────┘  │
│       │               │                 │            │
│       └───────────────┼─────────────────┘            │
│                       │                              │
│               ┌───────▼───────┐                      │
│               │    SQLite     │                      │
│               │  (WAL mode)   │                      │
│               └───────────────┘                      │
└──────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| **Mobile**   | React Native 0.83, Expo 55, Expo Router            |
| **Styling**  | NativeWind v4 (Tailwind CSS)                        |
| **State**    | Zustand (auth, market) + React Query (server state) |
| **Animations** | React Native Reanimated 4                        |
| **Charts**   | Custom SVG (react-native-svg)                       |
| **Backend**  | Node.js, Express.js                                 |
| **Database** | SQLite via better-sqlite3 (WAL mode)                |
| **Market Data** | Yahoo Finance API (30s price cache)              |
| **Auth**     | JWT + bcrypt                                        |

## Data Flow

```
User taps "Buy 5 AAPL"
        │
        ▼
┌─ Mobile ──────────────────────┐
│ TradeSheet → POST /trade/buy  │
└───────────────┬───────────────┘
                │
                ▼
┌─ Backend ─────────────────────────────────────┐
│ 1. Verify JWT token                           │
│ 2. Fetch live price from Yahoo Finance        │
│ 3. Check user has enough cash                 │
│ 4. Deduct cash, update/create holding         │
│ 5. Record transaction, return confirmation    │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌─ Mobile ──────────────────────────────────────┐
│ OrderConfirmation animation → refetch queries │
└───────────────────────────────────────────────┘
```

## Database Schema

```sql
users         ─┬─── holdings       (user_id FK, symbol, shares, avg_cost_basis)
               ├─── transactions   (user_id FK, symbol, type, shares, price, timestamp)
               ├─── watchlist      (user_id FK, symbol)
               │
price_cache        (symbol PK, data JSON, updated_at — 30s TTL)
```

## API Endpoints

| Method   | Endpoint                    | Description               |
| -------- | --------------------------- | ------------------------- |
| `POST`   | `/api/auth/register`        | Create account            |
| `POST`   | `/api/auth/login`           | Login → JWT token         |
| `GET`    | `/api/auth/me`              | Current user profile      |
| `GET`    | `/api/market/quote/:symbol` | Live stock quote          |
| `GET`    | `/api/market/history/:symbol` | Price history (1D–1Y)   |
| `GET`    | `/api/market/search?q=`     | Search stocks             |
| `GET`    | `/api/market/trending`      | Trending tickers          |
| `POST`   | `/api/trade/buy`            | Execute buy order         |
| `POST`   | `/api/trade/sell`           | Execute sell order        |
| `POST`   | `/api/trade/preview`        | Preview trade cost        |
| `GET`    | `/api/portfolio/holdings`   | Holdings with live P&L    |
| `GET`    | `/api/portfolio/summary`    | Total value, gains, cash  |
| `GET`    | `/api/watchlist`            | User's watchlist          |
| `GET`    | `/api/transactions`         | Trade history             |

## App Screens

```
(auth)                    (tabs)                     (modal)
┌──────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Login   │────▶│  Home               │     │  Stock Detail    │
│  Register│     │  · Portfolio value   │────▶│  · Price chart   │
└──────────┘     │  · Watchlist         │     │  · Buy/Sell      │
                 │  · Trending          │     │  · Stats & P&L   │
                 ├─────────────────────┤     └──────────────────┘
                 │  Search             │
                 │  · Autocomplete     │
                 │  · Categories       │
                 ├─────────────────────┤
                 │  Portfolio          │
                 │  · Holdings list    │
                 │  · Allocation chart │
                 │  · Performance graph│
                 │  · Transaction log  │
                 ├─────────────────────┤
                 │  Profile            │
                 │  · Account info     │
                 │  · Reset account    │
                 │  · Sign out         │
                 └─────────────────────┘
```

## Key Features

- **Real-time prices** — Yahoo Finance data with 15-second polling
- **Paper trading** — Buy and sell with $100K virtual cash
- **Portfolio tracking** — Live P&L, allocation pie chart, performance graph
- **Watchlist** — Track favorite stocks with mini sparkline charts
- **Search** — Find any publicly traded stock
- **Animated UI** — Smooth transitions, animated numbers, swipe-to-confirm trades
- **Dark fintech theme** — Zinc/slate palette with glassmorphism cards

## Quick Start

```bash
# 1. Start the backend
cd backend
npm install
npm run dev          # → http://localhost:3000

# 2. Start the mobile app
cd mobile
npm install
npx expo start       # Scan QR with Expo Go

# Demo account: demo@test.com / password123
```

## Project Structure

```
trading_rn/
├── backend/
│   └── src/
│       ├── index.js              # Express server + demo seed
│       ├── config/database.js    # SQLite schema
│       ├── middleware/            # JWT auth, error handler
│       ├── routes/               # auth, market, trading, portfolio, watchlist
│       └── services/             # marketService, tradingService, portfolioService
│
├── mobile/
│   ├── app/                      # Expo Router screens
│   │   ├── (auth)/               # Login, Register
│   │   ├── (tabs)/               # Home, Search, Portfolio, Profile
│   │   └── stock/[symbol].tsx    # Stock detail + trading
│   ├── components/               # UI, charts, trading, home, portfolio
│   ├── stores/                   # Zustand (auth, market, portfolio)
│   ├── hooks/                    # React Query hooks
│   └── services/api.ts           # Axios + JWT interceptor
│
└── README.md
```

## Server deployment

The backend is deployed in the champi docker-compose stack — see [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md) for the live URL, env, seeds, and how to point the mobile app at it.
