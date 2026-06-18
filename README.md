# VAULTPLAY

A personal full-stack web app for tracking video games across three statuses: **Backlog**, **Playing**, and **Completed**.

---

## Features

- Game search with cover art and platform info via RAWG API
- Personal ratings, notes, and reviews per game
- Filter and sort your vault by status, platform, and rating
- Load-more pagination on vault and search results
- AI-powered "what to play next" recommendations
- Dashboard with charts and stats (completions by month, genre breakdown)
- Multi-user accounts with per-user vaults (JWT auth, httpOnly cookies)
- Admin panel — view and manage all users and their vault data
- Dark / light mode with system preference detection
- Responsive design with mobile bottom navigation bar

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
| GET | `/api/games/search?q=&page=` | Search games via RAWG (paginated) |
| POST | `/api/games` | Save a game to the vault |
| GET | `/api/vault?page=&status=&platform=&rating=&sort=` | List vault entries (paginated, filterable) |
| GET | `/api/vault/counts` | Vault entry counts by status |
| GET | `/api/vault/platforms` | Distinct platforms in the vault |
| PATCH | `/api/vault/:id` | Update status, rating, or notes |
| DELETE | `/api/vault/:id` | Remove a vault entry |
| GET | `/api/discover/next` | "What to play next" suggestions |
| GET | `/api/discover/stalled` | Playing games inactive the longest |
| GET | `/api/discover/genre-affinity` | Genres ranked by average rating |
| GET | `/api/stats/summary` | Vault counts and averages |
| GET | `/api/stats/currently-playing` | Currently playing games |
| GET | `/api/stats/recently-added` | Most recently added games |
| GET | `/api/stats/completions-by-month` | Completions grouped by month |
| GET | `/api/stats/genre-breakdown` | Top genres by vault count |
| GET | `/api/admin/users` | List all users (admin only) |
| GET | `/api/admin/users/:id/vault` | View a user's vault (admin only) |
| PATCH | `/api/admin/users/:id/vault/:entryId` | Edit a vault entry (admin only) |
| DELETE | `/api/admin/users/:id` | Delete a user and their data (admin only) |

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
| M7 | Polish & Deploy — dark mode, responsive design, pagination, live deployment | ✅ Complete |
