# VAULTPLAY

A personal full-stack web app for tracking video games across three statuses: **Backlog**, **Playing**, and **Completed**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (hosted on Neon) |
| UI Components | shadcn/ui |
| AI Features | Claude API (planned) |
| Game Data | RAWG API (planned) |

---

## Prerequisites

- Node.js v18+
- npm v9+
- A [Neon](https://neon.tech) PostgreSQL database

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
| GET | `/api/games/search?q=` | Search games via RAWG |
| GET | `/api/games` | List saved games |
| POST | `/api/games` | Save a game to the vault |

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
│       └── types/
└── VAULTPLAY_PROJECT_PLAN.md
```

---

## Milestones

| # | Focus | Status |
|---|---|---|
| M1 | Foundation — scaffold, DB connection | Complete ✅ |
| M2 | Game Catalog — RAWG integration | Complete ✅ |
| M3 | Vault Manager — CRUD & filtering | Complete ✅ |
| M4 | Discovery Engine — AI recommendations | Planned |
| M5 | Dashboard & Stats | Planned |
| M6 | Polish & Deploy | Planned |
