# Stock Trading Demo App — Claude Code Build Prompt

## Project Overview

Build a full-stack stock trading demo application with **React Native + Expo** (frontend) and **Node.js + Express** (backend). The app simulates a real trading experience using live market data APIs for prices/charts, but all buy/sell/portfolio transactions are simulated through our own backend. This is a **local demo only** — no app store deployment, no real money.

---

## Tech Stack

### Frontend

- **React Native** with **Expo SDK 52+** (managed workflow)
- **Expo Router** for file-based navigation (tab + stack layout)
- **React Native Reanimated 3** for all animations (shared element transitions, layout animations, gesture-driven interactions)
- **React Native Gesture Handler** for swipe-to-buy, pull-to-refresh, drag interactions
- **React Native SVG** + **Victory Native** (or `react-native-wagmi-charts`) for stock price charts (line, candlestick, area)
- **Zustand** for global state management (portfolio, watchlist, auth)
- **React Query (TanStack Query)** for server state, caching, and real-time polling
- **Expo Haptics** for tactile feedback on trade confirmations
- **Expo Linear Gradient** for gradient backgrounds and card overlays
- **date-fns** for date formatting

### Backend

- **Node.js 20+** with **Express.js**
- **SQLite** via `better-sqlite3` (zero-config local DB — no Docker, no Postgres)
- **node-cron** for periodic price snapshot caching
- **bcryptjs** + **jsonwebtoken** for auth
- **cors**, **helmet**, **express-rate-limit** for middleware
- **axios** for upstream API calls

### External APIs (Free Tier — No Key Required or Free Key)

- **Yahoo Finance API** via `yahoo-finance2` npm package — real-time quotes, historical data, search, trending
- Fallback: **Alpha Vantage** free tier (25 req/day) or **Finnhub** free tier for supplemental data

---

## Project Structure

```
stock-trading-app/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js                  # Express server entry
│   │   ├── config/
│   │   │   └── database.js           # SQLite init + schema migration
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   └── errorHandler.js       # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.js               # POST /register, /login
│   │   │   ├── market.js             # GET /quotes, /search, /history, /trending
│   │   │   ├── portfolio.js          # GET /holdings, /summary, /performance
│   │   │   ├── trading.js            # POST /buy, /sell — simulated execution
│   │   │   ├── watchlist.js          # GET/POST/DELETE watchlist items
│   │   │   └── transactions.js       # GET /history with filters
│   │   ├── services/
│   │   │   ├── marketService.js      # Yahoo Finance wrapper + caching
│   │   │   ├── tradingService.js     # Order execution engine (simulated)
│   │   │   └── portfolioService.js   # P&L calculations, performance metrics
│   │   └── utils/
│   │       └── helpers.js
│   └── data/
│       └── app.db                    # SQLite file (auto-created)
│
├── mobile/
│   ├── package.json
│   ├── app.json                      # Expo config
│   ├── app/
│   │   ├── _layout.tsx               # Root layout (auth check, providers)
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx           # Tab navigator (custom tab bar)
│   │   │   ├── index.tsx             # Home / Dashboard
│   │   │   ├── search.tsx            # Market search + discover
│   │   │   ├── portfolio.tsx         # Portfolio overview
│   │   │   └── profile.tsx           # Account + settings
│   │   └── stock/
│   │       └── [symbol].tsx          # Stock detail page
│   ├── components/
│   │   ├── ui/                       # Reusable primitives
│   │   │   ├── AnimatedCard.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── AnimatedNumber.tsx    # Counting number animation
│   │   │   ├── ShimmerLoader.tsx     # Skeleton loading
│   │   │   ├── PulsingDot.tsx        # Live indicator
│   │   │   └── SwipeButton.tsx       # Swipe-to-confirm trade
│   │   ├── charts/
│   │   │   ├── PriceChart.tsx        # Interactive line/area chart
│   │   │   ├── CandlestickChart.tsx
│   │   │   ├── MiniSparkline.tsx     # Tiny inline chart for lists
│   │   │   └── TimeRangeSelector.tsx # 1D/1W/1M/3M/1Y/ALL pills
│   │   ├── home/
│   │   │   ├── PortfolioHeader.tsx   # Total value + daily P&L
│   │   │   ├── WatchlistSection.tsx
│   │   │   └── TrendingStocks.tsx
│   │   ├── trading/
│   │   │   ├── TradeSheet.tsx        # Bottom sheet for buy/sell
│   │   │   ├── OrderConfirmation.tsx # Animated success/fail
│   │   │   └── QuantitySelector.tsx  # Animated stepper
│   │   └── portfolio/
│   │       ├── HoldingCard.tsx
│   │       ├── AllocationChart.tsx   # Donut/pie chart
│   │       └── PerformanceGraph.tsx
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── portfolioStore.ts
│   │   └── marketStore.ts
│   ├── services/
│   │   └── api.ts                    # Axios instance + interceptors
│   ├── hooks/
│   │   ├── useStockQuote.ts
│   │   ├── usePortfolio.ts
│   │   └── useAnimatedPrice.ts       # Smooth price transition hook
│   ├── constants/
│   │   ├── theme.ts                  # Colors, spacing, typography
│   │   └── config.ts                 # API base URL, etc.
│   └── utils/
│       ├── formatters.ts             # Currency, percent, number formatting
│       └── animations.ts             # Shared Reanimated animation configs
```

---

## Database Schema (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  cash_balance REAL DEFAULT 100000.00,  -- $100k starting paper money
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  symbol TEXT NOT NULL,
  company_name TEXT,
  shares REAL NOT NULL,              -- Support fractional shares
  avg_cost_basis REAL NOT NULL,
  UNIQUE(user_id, symbol)
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  symbol TEXT NOT NULL,
  type TEXT CHECK(type IN ('BUY', 'SELL')),
  shares REAL NOT NULL,
  price_per_share REAL NOT NULL,
  total_amount REAL NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  symbol TEXT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

CREATE TABLE price_cache (
  symbol TEXT PRIMARY KEY,
  data TEXT NOT NULL,             -- JSON blob
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Specification

### Auth

| Method | Endpoint             | Body                            | Response                       |
| ------ | -------------------- | ------------------------------- | ------------------------------ |
| POST   | `/api/auth/register` | `{ email, username, password }` | `{ token, user }`              |
| POST   | `/api/auth/login`    | `{ email, password }`           | `{ token, user }`              |
| GET    | `/api/auth/me`       | —                               | `{ user }` (with cash_balance) |

### Market Data

| Method | Endpoint                      | Params                            | Response                                                                                                             |
| ------ | ----------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/market/quote/:symbol`   | —                                 | `{ symbol, price, change, changePercent, high, low, open, prevClose, volume, marketCap, pe, week52High, week52Low }` |
| GET    | `/api/market/history/:symbol` | `?range=1d\|5d\|1mo\|3mo\|1y\|5y` | `{ prices: [{ date, open, high, low, close, volume }] }`                                                             |
| GET    | `/api/market/search`          | `?q=apple`                        | `{ results: [{ symbol, name, exchange, type }] }`                                                                    |
| GET    | `/api/market/trending`        | —                                 | `{ stocks: [{ symbol, name, price, changePercent }] }`                                                               |
| GET    | `/api/market/batch`           | `?symbols=AAPL,GOOGL,MSFT`        | `{ quotes: { AAPL: {...}, ... } }`                                                                                   |

### Trading (Simulated)

| Method | Endpoint             | Body                       | Response                                       |
| ------ | -------------------- | -------------------------- | ---------------------------------------------- |
| POST   | `/api/trade/buy`     | `{ symbol, shares }`       | `{ transaction, updatedHolding, cashBalance }` |
| POST   | `/api/trade/sell`    | `{ symbol, shares }`       | `{ transaction, updatedHolding, cashBalance }` |
| POST   | `/api/trade/preview` | `{ symbol, shares, type }` | `{ estimatedCost, currentPrice, fees: 0 }`     |

### Portfolio

| Method | Endpoint                  | Response                                                                                            |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| GET    | `/api/portfolio/holdings` | `{ holdings: [{ symbol, shares, avgCost, currentPrice, marketValue, gainLoss, gainLossPercent }] }` |
| GET    | `/api/portfolio/summary`  | `{ totalValue, cashBalance, investedValue, totalGainLoss, totalGainLossPercent, dayGainLoss }`      |

### Watchlist

| Method | Endpoint                 | Body/Params  | Response                                              |
| ------ | ------------------------ | ------------ | ----------------------------------------------------- |
| GET    | `/api/watchlist`         | —            | `{ items: [{ symbol, name, price, changePercent }] }` |
| POST   | `/api/watchlist`         | `{ symbol }` | `{ item }`                                            |
| DELETE | `/api/watchlist/:symbol` | —            | `{ success: true }`                                   |

### Transactions

| Method | Endpoint            | Params                             | Response                         |
| ------ | ------------------- | ---------------------------------- | -------------------------------- |
| GET    | `/api/transactions` | `?symbol=&type=&limit=50&offset=0` | `{ transactions: [...], total }` |

---

## UI/UX Design Specification

### Design System: "Dark Fintech Luxe"

**Aesthetic direction**: Dark-mode-first, inspired by Robinhood's simplicity meets Bloomberg Terminal's data density. Feels like a premium fintech product — not a toy.

#### Color Palette (CSS variables / theme constants)

```
Background Primary:    #0A0A0F (near-black with blue undertone)
Background Secondary:  #12121A (elevated surfaces)
Background Tertiary:   #1A1A2E (cards, sheets)
Surface Glass:         rgba(255, 255, 255, 0.04) (glassmorphism layers)
Border Subtle:         rgba(255, 255, 255, 0.06)

Text Primary:          #F5F5F7
Text Secondary:        #8E8E93
Text Tertiary:         #48484A

Accent Green:          #30D158 (gains, buy)
Accent Green Dim:      rgba(48, 209, 88, 0.12) (green backgrounds)
Accent Red:            #FF453A (losses, sell)
Accent Red Dim:        rgba(255, 69, 58, 0.12)
Accent Blue:           #0A84FF (interactive, links)
Accent Gold:           #FFD60A (highlights, premium feel)
```

#### Typography

- **Headings / Numbers**: `SF Pro Display` or `Inter` with tight letter-spacing (-0.5 to -1.5) — large portfolio values should feel bold and impactful
- **Body**: `SF Pro Text` / system default at 15-16px
- **Monospace numbers**: Use tabular-nums font-feature for aligned price columns
- **Large portfolio value**: 42px bold, animated counting up on load

#### Animation Specifications (React Native Reanimated)

1. **Screen Entry**: Staggered fade-up (translateY: 20→0, opacity: 0→1) with 50ms delay between elements
2. **Price Changes**: Color flash animation — text briefly scales to 1.05x and flashes green/red, then settles. Use `useAnimatedStyle` with spring config `{ damping: 15, stiffness: 150 }`
3. **Chart Interaction**: Crosshair follows finger with haptic feedback at data points. Price label above thumb animates with `FadeIn.duration(150)`
4. **Tab Bar**: Custom animated tab bar with a floating indicator that slides between tabs using `useSharedValue` + `withSpring`
5. **Trade Sheet**: Bottom sheet slides up with spring physics (`damping: 20, stiffness: 200`). Background dims with animated overlay.
6. **Swipe to Trade**: Trade confirmation requires a swipe gesture — a pill slides right to confirm. On completion: confetti-like success animation with Lottie or particle effect + haptic `notificationAsync(Success)`
7. **Card Press**: Holding a stock card scales to 0.97x with spring, creating a tactile pressed feel
8. **Pull to Refresh**: Custom animated refresh indicator (rotating logo or pulsing circle)
9. **Number Transitions**: Portfolio value and prices animate between values using interpolation (counting effect)
10. **Loading States**: Shimmer/skeleton screens with animated gradient sweep (not spinners)

#### Screen Designs

**Home / Dashboard**

- Top: Large portfolio total value with animated counting, daily P&L badge (green/red pill with arrow)
- Inline sparkline beneath the value showing today's portfolio performance
- Section: "Watchlist" — horizontal scroll cards OR vertical list, each with symbol, mini sparkline, price, change%
- Section: "Trending" — ranked list with position numbers, price movement indicators
- Bottom: Custom animated tab bar

**Search / Discover**

- Top: Search bar with real-time autocomplete dropdown (debounced 300ms)
- Below search: Category pills (Tech, Healthcare, Finance, Energy, etc.)
- Results: List items with company logo placeholder (first letter avatar with brand color), name, symbol, price, sparkline
- Empty state: Animated illustration or subtle pattern

**Stock Detail `[symbol].tsx`**

- Hero section: Company name, symbol, current price (large, animated), change badge
- Interactive chart: Full-width, gesture-enabled price chart
  - Time range selector pills below chart (1D / 1W / 1M / 3M / 1Y / ALL)
  - Touch-and-drag crosshair with floating price/date tooltip
  - Area fill below line with gradient fade
- Stats grid: Open, High, Low, Volume, Mkt Cap, P/E, 52W range — in a clean 2-column grid
- "Your Position" card (if holding): Shares, avg cost, market value, P&L
- Action buttons: Two large buttons — "Buy" (green) and "Sell" (red, disabled if not holding)
- Tapping Buy/Sell opens TradeSheet (bottom sheet)

**Trade Sheet (Bottom Sheet)**

- Slide-up modal with drag handle
- Shows: Stock name, current price (live updating)
- Quantity input: Large centered number with +/- buttons, animated increment
- Shows: Estimated cost, available cash, shares owned (if selling)
- Swipe-to-confirm button at bottom (not a tap — a deliberate swipe gesture)
- On execution: Sheet transforms into success state with checkmark animation + haptic

**Portfolio**

- Summary header: Total value, cash available, invested amount, total return (% and $)
- Allocation donut chart (animated segment entrance)
- Holdings list: Each card shows symbol, shares, current value, P&L with color coding
- Tap holding → navigates to stock detail
- Transaction history section (or tab): Chronological list with buy/sell badges

**Profile / Settings**

- Account info card
- Starting balance display
- Reset account button (confirms with alert)
- Theme toggle placeholder
- App info

---

## Implementation Requirements

### Backend Specifics

1. **Trading engine**: When executing a buy, fetch the real-time price from Yahoo Finance at that moment. Use that as the execution price. Deduct from cash_balance. Update or create holding with weighted average cost basis.
2. **Sell validation**: Check user owns enough shares. Calculate P&L on the transaction.
3. **Price caching**: Cache quotes for 30 seconds to avoid rate limiting. Use the `price_cache` table.
4. **Error responses**: Consistent format `{ error: true, message: "...", code: "INSUFFICIENT_FUNDS" }`.
5. **Seed data**: On first run, auto-create tables. Optionally seed a demo user (`demo@test.com` / `password123`) with some initial holdings (AAPL, GOOGL, MSFT, TSLA) for instant demo purposes.

### Frontend Specifics

1. **API base URL**: Use `http://10.0.2.2:3000/api` for Android emulator, `http://localhost:3000/api` for iOS simulator. Make this configurable in `constants/config.ts` and add a comment explaining both.
2. **Polling**: Use React Query with `refetchInterval: 15000` (15s) for active stock detail pages. Watchlist refreshes on focus.
3. **Optimistic updates**: When placing a trade, optimistically update the portfolio store, then reconcile with server response.
4. **Error handling**: Toast notifications for API errors. Retry logic in React Query.
5. **Empty states**: Design thoughtful empty states for watchlist, portfolio, and search — not just "Nothing here" text.
6. **Accessibility**: Proper labels, contrast ratios, font scaling support.

---

## Build & Run Instructions

The project should run with these steps only:

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev          # nodemon on port 3000

# Terminal 2 — Frontend
cd mobile
npm install
npx expo start       # Expo dev server
# Then press 'i' for iOS sim or 'a' for Android emulator or scan QR for Expo Go
```

- **No environment variables required** for basic functionality (Yahoo Finance via `yahoo-finance2` needs no API key).
- Add a `backend/.env.example` with `PORT=3000` and `JWT_SECRET=your-secret-here` (default fallback in code).
- Backend `package.json` scripts: `"dev": "nodemon src/index.js"`, `"start": "node src/index.js"`

---

## Quality Checklist

Before considering the build complete, verify:

- [ ] App launches without errors on Expo Go
- [ ] User can register and login
- [ ] Home screen shows portfolio value and watchlist with live prices
- [ ] Search returns real stock results with debounced input
- [ ] Stock detail page shows interactive chart with multiple time ranges
- [ ] User can buy stocks (deducts cash, adds to holdings)
- [ ] User can sell stocks (adds cash, removes/reduces holdings)
- [ ] Portfolio page shows all holdings with real-time P&L
- [ ] Animations are smooth (60fps) — no jank on transitions
- [ ] Swipe-to-trade gesture works reliably
- [ ] Loading states use skeleton/shimmer (no blank screens)
- [ ] Error states are handled gracefully (network errors, API failures)
- [ ] Demo user seeds correctly for instant testing
- [ ] Backend handles concurrent requests without SQLite locking issues (use WAL mode)

---

## Important Notes

- This is a LOCAL DEMO ONLY. No deployment, no CI/CD, no Docker.
- Do NOT use any paid APIs. `yahoo-finance2` is free and sufficient.
- Keep the backend simple — no ORM overhead, raw SQL with `better-sqlite3` is fine and fast.
- All monetary values are fake paper money. Make this clear in the UI with a subtle "Paper Trading" badge.
- Prioritize visual polish and animation quality — this is a portfolio demo piece.
- If a Yahoo Finance request fails (rate limit), gracefully fall back to cached data or show "Market Closed" state.
