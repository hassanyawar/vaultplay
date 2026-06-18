# VAULTPLAY

A personal full-stack web app for tracking video games across three statuses: **Backlog**, **Playing**, and **Completed**.

---

## Features

- Game search with cover art and platform info via RAWG API
- Personal ratings, notes, and reviews per game
- Filter and sort your vault by status, platform, and rating
- AI-powered "what to play next" recommendations
- Dashboard with charts and stats (completions by month, genre breakdown)
- Multi-user accounts with per-user vaults (JWT auth, httpOnly cookies)
- Admin panel — view and manage all users and their vault data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (hosted on Neon) |
| Game Data | RAWG API |
| AI Features | Anthropic Claude API |

---

## Prerequisites

- Node.js v18+
- npm v9+
- A [Neon](https://neon.tech) PostgreSQL database
- A [RAWG](https://rawg.io/apidocs) API key
- An [Anthropic](https://console.anthropic.com) API key (optional — app falls back to rule-based recommendations)

---

## Installation

Clone the repo and install dependencies for both workspaces:

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

---

## Environment Setup

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

Required variables in `server/.env`:

```
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-here
RAWG_API_KEY=your-rawg-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key   # optional
```

Get your `DATABASE_URL` from the Neon dashboard under **Connection Details**.

---

## Running in Development

Both servers must be started separately:

```bash
# Backend (port 3000)
cd server && npm run dev

# Frontend (port 5173)
cd client && npm run dev
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server liveness check |
| GET | `/api/db-health` | Database connectivity check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/password` | Change password |
| GET | `/api/games/search?q=` | Search games via RAWG |
| POST | `/api/games` | Save a game to the vault |
| GET | `/api/vault` | List vault entries (filterable) |
| PATCH | `/api/vault/:id` | Update status, rating, or notes |
| DELETE | `/api/vault/:id` | Remove a vault entry |
| GET | `/api/discover/next` | AI "what to play next" suggestions |
| GET | `/api/stats/summary` | Vault counts and averages |
| GET | `/api/admin/users` | List all users (admin only) |
| DELETE | `/api/admin/users/:id` | Delete a user (admin only) |

---

## Project Structure

```
/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── server/          # Express backend
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── db/
│       ├── middleware/
│       └── types/
└── VAULTPLAY_PROJECT_PLAN.md
```

---

## Milestones

| # | Focus | Status |
|---|---|---|
| M1 | Foundation — scaffold, DB connection | ✅ Complete |
| M2 | Game Catalog — RAWG integration | ✅ Complete |
| M3 | Vault Manager — CRUD & filtering | ✅ Complete |
| M4 | Discovery Engine — AI recommendations | ✅ Complete |
| M5 | Dashboard & Stats | ✅ Complete |
| M6 | Auth & Multi-User — accounts, per-user vaults, admin panel | ✅ Complete |
| M7 | Polish & Deploy | Planned |
