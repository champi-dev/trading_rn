# StockTrader (trading_rn) — Server Deployment

The API is deployed as part of the champi docker-compose stack.

| | |
|---|---|
| Compose service / container | `trading-backend` |
| Local base URL | `http://127.0.0.1:8094` (API prefix `/api`) |
| Stack | Express (plain JS), better-sqlite3 |
| Database | SQLite file at `/app/data/app.db`, persisted in the `trading_data` volume |
| Market data | Live from Yahoo Finance (no API key needed) |

## Deploy / redeploy

```bash
cd ~/Development/champi
docker compose up -d --build trading-backend
```

No migrations or seeding needed — tables are created automatically on first
boot, and users register in-app (each new user starts with $100,000 paper cash).

## Environment

- `JWT_SECRET` — dev default; set for production
- No API keys required (Yahoo Finance endpoints are public)

## API surface (prefix `/api`)

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /market/quote/:symbol`, `GET /market/history/:symbol`, `GET /market/search?q=`, `GET /market/trending`, `GET /market/batch`
- `POST /trade/buy`, `POST /trade/sell`, `POST /trade/preview`
- `GET /portfolio/holdings`, `GET /portfolio/summary`
- `GET /watchlist`, `POST /watchlist`, `DELETE /watchlist/:symbol`
- `GET /transactions`

Market routes are public; trading/portfolio/watchlist need `Authorization: Bearer <jwt>`.

Quick check: `curl http://127.0.0.1:8094/api/market/quote/AAPL`

## Pointing the React Native (Expo) app at this server

API host lives in `mobile/constants/config.ts` (used by `mobile/services/api.ts`).
Change the base URL to:

- Android emulator on this machine: `http://10.0.2.2:8094/api`
- iOS simulator: `http://localhost:8094/api`
- Physical device (Expo Go): the machine's LAN IP — requires changing the
  compose mapping from `127.0.0.1:8094:3000` to `8094:3000`, or add
  `trading.champi.lat` to `~/.cloudflared/config.yml` → `http://localhost:8094`.
