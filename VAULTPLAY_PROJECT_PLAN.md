# VAULTPLAY — Project Plan
> *Your personal game vault, your play history.*

---

## Overview

| | |
|---|---|
| **Project** | VAULTPLAY |
| **Type** | Personal web app — game tracker |
| **Stack** | React + Vite · Tailwind CSS · shadcn/ui · Node.js + Express · PostgreSQL · RAWG API |
| **Estimated Duration** | ~3–4 weeks (relaxed pace) |
| **Deployment** | Vercel (frontend) · Fly.io (backend) · Neon (DB) |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | Component-based, TypeScript enforced |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS + pre-built accessible components |
| Charts | Recharts | Dashboard visualizations (M5) |
| Backend | Node.js + Express | REST API, TypeScript enforced |
| Database | PostgreSQL | Hosted on Neon (serverless, free tier) |
| Game Data | RAWG API | Cover art, platforms, metadata (free tier) |
| AI Features | Anthropic Claude API | Recommendations, NLP search, summarization |

---

## Features

- Game status tracking — Backlog / Playing / Completed
- Personal ratings (score out of 10)
- Notes & reviews per game
- Cover art & platform info via RAWG API
- Search & filter vault by status, platform, rating
- AI-powered recommendations & natural language search
- Dashboard with stats and charts

---

## Module Breakdown

```
VAULTPLAY
├── M1 — Core Shell         (project setup & architecture)
├── M2 — Game Catalog       (search, add, RAWG integration)
├── M3 — Vault Manager      (status, ratings, notes)
├── M4 — Discovery Engine   (AI recommendations & filtering)
├── M5 — Dashboard & Stats  (visual overview of your gaming)
└── M6 — Polish & Deploy    (UI refinement, deployment)
```

---

## Milestones

### M1 — Foundation
**Goal:** Project running locally end-to-end with an empty shell.
**Estimate:** 1–2 days
**Status:** ✅ Complete

#### Your tasks
- [x] Initialize React + Vite frontend
- [x] Set up Express backend
- [x] Configure PostgreSQL + define schema
- [x] Set up environment variables & project structure

#### AI tasks
- [x] Scaffold boilerplate & folder structure
- [x] Generate DB schema from requirements
- [x] Set up TypeScript config (client + server)
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Set up Prettier

#### Exit criteria
- [x] API returns a test response (`GET /api/health`)
- [x] DB connects (`GET /api/db-health` verified)
- [x] App loads in browser

---

### M2 — Game Catalog
**Goal:** You can search for a game and add it to your vault.
**Estimate:** 3–5 days

#### Your tasks
- [ ] Store selected game in PostgreSQL
- [ ] Decide which RAWG fields to keep
- [ ] Review and validate game metadata

#### AI tasks
- [ ] Write RAWG API wrapper & service layer
- [ ] Generate TypeScript types from RAWG response
- [ ] Build search UI with cover art display
- [ ] Display platform & metadata per game

**Exit criteria:** Search a game, see cover art + platforms, save it to DB.

---

### M3 — Vault Manager
**Goal:** Manage personal game data — status, ratings, notes.
**Estimate:** 3–5 days

#### Your tasks
- [ ] Write your actual reviews & ratings
- [ ] Decide status for each game
- [ ] Validate CRUD flows manually

#### AI tasks
- [ ] Generate CRUD API routes for vault entries
- [ ] Build filter & sort logic on backend
- [ ] Build status toggle UI (Backlog / Playing / Completed)
- [ ] Build rating system (score out of 10)

**Exit criteria:** Full CRUD on game list. Filter by status, platform, and rating works.

---

### M4 — Discovery Engine *(AI-heavy)*
**Goal:** AI helps you decide what to play next and makes sense of your vault.
**Estimate:** 5–7 days

#### Your tasks
- [ ] Validate and approve AI suggestions
- [ ] Define your preference signals (what matters to you)
- [ ] Test NLP queries with real data

#### AI tasks
- [ ] Natural language search engine ("short games I haven't finished")
- [ ] Recommendation engine based on your ratings
- [ ] Auto-tagging games by mood & genre from metadata
- [ ] Notes summarization for long session logs

**Exit criteria:** Ask AI "what should I play next?" and get a meaningful answer.

---

### M5 — Dashboard & Stats
**Goal:** A visual overview of your gaming life.
**Estimate:** 3–4 days

#### Your tasks
- [ ] Decide which stats feel meaningful to you
- [ ] Review charts with real vault data
- [ ] Design "currently playing" hero section

#### AI tasks
- [ ] Generate chart components from data schema
- [ ] Write stat aggregation SQL queries
- [ ] Games played per month/year chart
- [ ] Genre breakdown chart

**Exit criteria:** Dashboard shows real data from your vault visually.

---

### M6 — Polish & Deploy
**Goal:** VAULTPLAY is live and looks great.
**Estimate:** 2–3 days

#### Your tasks
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Fly.io
- [ ] Provision PostgreSQL on Neon
- [ ] Final UX review & personal taste adjustments

#### AI tasks
- [ ] Audit code for security issues
- [ ] Write deployment config files
- [ ] Dark/light mode implementation
- [ ] Responsive design polish

**Exit criteria:** VAULTPLAY is live at a public URL.

---

## AI vs Human Responsibility

| Area | Owner |
|---|---|
| Code scaffolding & boilerplate | 🤖 AI |
| RAWG API integration & type generation | 🤖 AI |
| CRUD routes & filter logic | 🤖 AI |
| Recommendations, NLP search, auto-tagging | 🤖 AI |
| Chart components & SQL aggregations | 🤖 AI |
| Security audit & deployment configs | 🤖 AI |
| Game status & reviews | 👤 You |
| Ratings & personal opinions | 👤 You |
| UI/UX design taste & decisions | 👤 You |
| Privacy & data decisions | 👤 You |
| Vault curation (which games to track) | 👤 You |

---

## Unity → Web Dev Reference

| Unity Concept | Web Equivalent | Learning Curve |
|---|---|---|
| GameObjects & Components | React Components | 🟡 Moderate |
| Inspector / Serialized Fields | Form inputs + State | 🟢 Easy |
| ScriptableObjects | JSON / DB records | 🟢 Easy |
| Scene Manager | React Router | 🟡 Moderate |
| UnityWebRequest | fetch() / Axios | 🟢 Easy |
| PlayerPrefs | localStorage / cookies | 🟢 Easy |
| C# classes | TypeScript classes | 🟢 Familiar |
| Unity UI Canvas | HTML + CSS layout | 🔴 Biggest adjustment |
| Build & Deploy | Vercel / Fly.io | 🟡 New but documented |

> **Tip:** CSS Flexbox and Grid are your biggest new concepts. Try [Flexbox Froggy](https://flexboxfroggy.com) for a quick visual intro.

---

## Timeline Summary

| Milestone | Focus | Estimate |
|---|---|---|
| M1 — Foundation | Setup & architecture | 1–2 days |
| M2 — Game Catalog | RAWG integration | 3–5 days |
| M3 — Vault Manager | CRUD & filtering | 3–5 days |
| M4 — Discovery Engine | AI features | 5–7 days |
| M5 — Dashboard | Charts & stats | 3–4 days |
| M6 — Polish & Deploy | Ship it | 2–3 days |
| **Total** | | **~3–4 weeks** |

---

*Generated with Claude · VAULTPLAY planning session · Stack finalized May 2026*
