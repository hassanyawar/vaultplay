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
| **Deployment** | Vercel (frontend) · Railway (backend) · Neon (DB) |

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
- Multi-user accounts with per-user vaults (JWT auth, httpOnly cookies)
- Admin panel — manage users and their vault data

---

## Module Breakdown

```
VAULTPLAY
├── M1 — Core Shell         (project setup & architecture)
├── M2 — Game Catalog       (search, add, RAWG integration)
├── M3 — Vault Manager      (status, ratings, notes)
├── M4 — Discovery Engine   (AI recommendations & filtering)
├── M5 — Dashboard & Stats  (visual overview of your gaming)
├── M6 — Auth & Multi-User  (accounts, per-user vaults, JWT)
└── M7 — Polish & Deploy    (UI refinement, deployment)
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
**Status:** ✅ Complete

#### Your tasks
- [x] Store selected game in PostgreSQL
- [x] Review and validate game metadata

#### AI tasks
- [x] Write RAWG API wrapper & service layer (`src/services/rawg.ts`)
- [x] Generate TypeScript types from RAWG response (`src/types/rawg.ts`)
- [x] `GET /api/games/search?q=` — proxies RAWG, returns clean results
- [x] `POST /api/games` — saves game to Postgres (ON CONFLICT DO NOTHING)
- [x] `GET /api/games` — lists saved games
- [x] Build search UI with cover art display
- [x] Display platform & metadata per game
- [x] Add to Vault button wired to POST /api/games

#### Exit criteria
- [x] `GET /api/games/search?q=hades` returns game data
- [x] Search UI renders results with cover art + platforms in browser
- [x] Saving a game via UI persists it to DB (verified via GET /api/games)

---

### M3 — Vault Manager
**Goal:** Manage personal game data — status, ratings, notes.
**Estimate:** 3–5 days
**Status:** ✅ Complete

#### Your tasks
- [x] Validate CRUD flows manually

#### AI tasks
- [x] Migrate `vault_entries` table + `vault_status` enum to Neon
- [x] `POST /api/games` auto-creates vault entry on save; handles re-add after delete
- [x] `GET /api/vault` — list with filter by status, platform, rating and sort support
- [x] `GET /api/vault/platforms` — distinct platforms for filter dropdown
- [x] `PATCH /api/vault/:id` — update status, rating, notes, review
- [x] `DELETE /api/vault/:id` — remove vault entry
- [x] `VaultEntry`, `VaultStatus`, `VaultUpdatePayload` frontend types
- [x] `getVault`, `updateVaultEntry`, `deleteVaultEntry`, `getVaultPlatforms` in api.ts
- [x] `VaultCard` — cover art, status badge, status toggle, rating select, notes editor, delete
- [x] `VaultPage` — vault list, filter by status/platform/rating, sort bar, live counts
- [x] Tab navigation — Search ↔ My Vault

**Exit criteria:** Full CRUD on game list. Filter by status, platform, and rating works.

---

### M4 — Discovery Engine
**Goal:** Surface meaningful "what to play next" suggestions from your vault data.
**Estimate:** 3–5 days
**Status:** ✅ Complete

#### Architecture — Strategy Pattern
The discovery engine is built as a modular service with a shared `IDiscoveryService`
interface. The factory selects the active implementation based on environment:
- No `ANTHROPIC_API_KEY` → `RuleBasedDiscoveryService` (default)
- `ANTHROPIC_API_KEY` present → `AiDiscoveryService` (drop-in upgrade)

Route handlers and frontend are implementation-agnostic — swapping engines requires
no changes outside the service layer.

```
server/src/services/discovery/
├── types.ts        — shared types: Recommendation, GenreAffinity, etc.
├── interface.ts    — IDiscoveryService contract
├── rule-based.ts   — RuleBasedDiscoveryService (SQL-based logic)
├── ai.ts           — AiDiscoveryService (Claude API, built as stub for now)
└── index.ts        — factory: picks implementation from env
```

#### Your tasks
- [x] Validate suggestion quality with real vault data — feels accurate

#### AI tasks
- [x] Define `IDiscoveryService` interface and shared types
- [x] `RuleBasedDiscoveryService` — genre affinity scoring, backlog ranking
- [x] `AiDiscoveryService` — stub implementation (ready for Claude API later)
- [x] Factory — selects implementation from `ANTHROPIC_API_KEY` env var
- [x] `GET /api/discover/next` — top 3–5 "play next" suggestions with reasoning
- [x] `GET /api/discover/stalled` — playing games inactive the longest
- [x] `GET /api/discover/genre-affinity` — genres ranked by your average rating
- [x] Discover tab in frontend — recommendations grid, stalled cards, genre affinity
- [x] Animations — staggered card entrance, count-up ratings, bar fill, cover shimmer

**Exit criteria:** App surfaces meaningful "what to play next" suggestions based
on vault data. Swapping to AI requires only adding `ANTHROPIC_API_KEY` to `.env`.

---

### M5 — Dashboard & Stats
**Goal:** A visual overview of your gaming life.
**Estimate:** 3–4 days
**Status:** ✅ Complete

#### Your tasks
- [x] Decide which stats feel meaningful to you
- [x] Review charts with real vault data
- [x] Design "currently playing" hero section

#### AI tasks
- [x] `GET /api/stats/summary` — vault counts by status, avg rating, last activity timestamp
- [x] `GET /api/stats/currently-playing` — up to 3 playing games with cover and days active
- [x] `GET /api/stats/recently-added` — last 4 vault additions
- [x] `GET /api/stats/completions-by-month` — completions grouped by month using `completed_at`
- [x] `GET /api/stats/genre-breakdown` — top 10 genres by vault count
- [x] Colored stat cards (blue/amber/green/purple accents) with segmented progress bar
- [x] Currently Playing hero card with cover art, platforms, days active badge
- [x] Most Recently Added cover grid (4 entries, relative timestamps)
- [x] Completions bar chart — last 12 months, Recharts, green bars
- [x] Genre breakdown horizontal bar chart — Recharts, purple shades
- [x] `completed_at` column on `vault_entries` for accurate completion date tracking

**Exit criteria:** Dashboard shows real data from your vault visually.

---

### M6 — Auth & Multi-User
**Goal:** Multiple users can each have their own independent vault, with account management and an admin panel.
**Estimate:** 4–6 days
**Status:** ✅ Complete

#### Architecture
- `users` table stores accounts (id, email, username, password hash, is_admin flag)
- `vault_entries` gains a `user_id` FK — all personal data is scoped per user
- `games` table stays shared (RAWG metadata cache, no ownership)
- JWT-based auth: `POST /api/auth/register` + `POST /api/auth/login` issue httpOnly cookie tokens
- Auth middleware verifies the token on every protected route
- Admin middleware restricts admin routes to users with `is_admin = true`
- All vault, stats, and discover queries are filtered by the authenticated user's id

#### Your tasks
- [x] Test register and login flows
- [x] Verify vault data is fully isolated between accounts
- [x] Test change password flow
- [x] Test admin panel
- [ ] Share with friends for early testing

#### AI tasks
- [x] Add `users` table to schema; add `user_id` FK to `vault_entries`
- [x] Migrate existing vault data to seed user; reassign to real account; delete seed user
- [x] `POST /api/auth/register` — create account (hashed password via bcrypt), username required
- [x] `POST /api/auth/login` — verify credentials, issue httpOnly JWT cookie
- [x] `POST /api/auth/logout` — clear cookie
- [x] `GET /api/auth/me` — return current user from DB (always fresh)
- [x] JWT auth middleware applied to all vault, games, stats, and discover routes
- [x] Scope all vault + stats queries to `req.user.id`
- [x] Login and register pages in frontend (register includes username field)
- [x] httpOnly cookie token storage + AuthContext + session restore on mount
- [x] Unauthenticated users redirected to login; logout button in nav
- [x] `PATCH /api/auth/password` — change password (requires current password + new password)
- [x] Change password UI in Settings tab
- [x] `username` column on `users` (unique, alphanumeric/underscore, 3–30 chars)
- [x] `is_admin` column on `users` table
- [x] `requireAdmin` middleware
- [x] `GET /api/admin/users` — list all users with vault counts
- [x] `GET /api/admin/users/:id/vault` — view any user's vault entries
- [x] `PATCH /api/admin/users/:id/vault/:entryId` — edit any vault entry
- [x] `DELETE /api/admin/users/:id` — delete a user and their data
- [x] Admin panel UI — user list, vault viewer, delete user; tab only visible to admins

**Exit criteria:** ✅ Two separate accounts each see only their own vault. Register, login, logout, and change password all work. Admin user can view and manage all accounts.

---

### M7 — Polish & Deploy
**Goal:** VAULTPLAY is live, performant, and looks great.
**Estimate:** 3–4 days
**Status:** ✅ Complete

#### Your tasks
- [x] Deploy frontend to Vercel
- [x] Deploy backend to Railway
- [x] Confirm Neon DB credentials for production
- [ ] Final UX review & personal taste adjustments
- [ ] Share with friends for early testing

#### AI tasks
- [x] Audit code for security issues — rate limiting, startup env checks, error message masking, admin self-delete guard
- [x] Add `loading="lazy"` to all `<img>` tags (vault, search, dashboard, discover) — eliminates simultaneous image request flood on page load
- [x] Write deployment config files (Dockerfile, railway.json, vercel.json) — backend on Railway, frontend on Vercel with `/api/*` proxy to fix Safari ITP
- [x] Dark/light mode — navy-slate palette, localStorage persistence, flash prevention via inline `<head>` script
- [x] Responsive design — bottom nav bar on mobile, slim header, tighter padding and headings across all pages
- [x] Pagination on vault list and search results — 16 entries at a time, load more on demand
- [x] Fix bottom nav label inconsistency (mobile "Stats" → "Dashboard") and swap icon to `BarChart2`
- [x] Shrink dashboard recently-added cards to match Search/Discover grid density (`grid-cols-3 sm:grid-cols-4 lg:grid-cols-5`)
- [x] Auth page visual overhaul — aurora animated background, glassmorphism card, corner brackets, status bar, Chakra Petch/IBM Plex Mono fonts, violet→gold gradient CTA; merge `LoginPage` + `RegisterPage` into a single `AuthPage` component
- [x] Password show/hide toggle on all password fields (login, register, confirm password)
- [x] Search page visual overhaul — aurora atmosphere in `AppShell`, VP design tokens (`--vp-*`) in `index.css`, hero section, cover-first `GameCard` with hover lift/glow/gold corner brackets, redesigned desktop nav + mobile bottom nav with gradient pill indicator, `ThemeToggle` bordered box
- [x] Vault page visual overhaul — glassmorphism `.vault-row` cards with gold corner brackets, color-coded stat header, filter chips, collapsible sort/filter panels, always-visible inline notes preview (click to edit), status badge + custom-chevron selects, `Trash2` remove button
- [x] Discover page visual overhaul — glassmorphism rec cards with distinct rank badges (#1 gold, #2 violet, #3 bronze), stagger fade-in, shelf rows with gold left border and "PLAYING" status label, genre affinity rebuilt as animated SVG radar (web graph) with coverage bar legend
- [x] Dashboard page visual overhaul — Recharts replaced with pure SVG/CSS charts; KPI cards with per-card accent colour and radial glow; animated status bar; SVG gradient area chart for completions (line draw-in, staggered dots, peak crowned gold); ranked gradient horizontal bars for genre breakdown (#1 genre violet→gold crown); glassmorphism currently-playing card with gold pill; 16:10 recently-added cover grid; add `typecheck` npm script to `client/package.json`
- [x] Settings page visual overhaul — glassmorphism card with gold corner brackets, gradient avatar with initials, eye-toggle inputs, password strength meter (weak→warn, fair→gold, strong→ok), match indicator; Appearance card with Dark/Light/System 3-tile picker; upgrade `useTheme` to 3-mode with live OS tracking and `vp-theme-mode` storage key migration; add `--vp-warn`, `--vp-card-shadow`, `--vp-track` tokens

**Exit criteria:** ✅ VAULTPLAY is live at a public URL, images load lazily, and large vaults don't degrade on initial load.

---

## Future Features

Features not in any current milestone but worth revisiting if bandwidth allows.
These are fully scoped ideas — they just didn't fit the current plan or have external dependencies.

| Feature | Description | Why deferred |
|---|---|---|
| **Forgot password** | Email a time-limited reset link to the user's address | Requires an email service. Resend (free tier) needs a verified custom domain to send to arbitrary addresses. Nodemailer + Gmail is an option for low volume. Defer until a domain is available or email infra is set up. |
| **Public profile / shareable vault** | Read-only link to a user's completed/playing games | Requires visibility scoping and a public route; good social feature if app grows |
| **Import from other services** | Bulk import from Steam, Backloggd, HowLongToBeat | Complex parsing per platform; high value if onboarding more users |
| **Push notifications** | Remind user about stalled games or long backlogs | Requires a notification service (e.g. web push or email); nice-to-have |

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
| M6 — Auth & Multi-User | Accounts & per-user vaults | 4–6 days |
| M7 — Polish & Deploy | Ship it | 3–4 days |
| **Total** | | **~5–7 weeks** |

---

*Generated with Claude · VAULTPLAY planning session · Stack finalized May 2026*
