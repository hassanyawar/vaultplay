# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project

VAULTPLAY is a personal, non-commercial full-stack web app for tracking video games (Backlog / Playing / Completed). It is a self-directed learning project. The owner comes from a Unity/C# background — frame web concepts using Unity analogues where helpful (React components ↔ GameObjects, React Router ↔ Scene Manager, `fetch` ↔ UnityWebRequest, etc.).

---

## Current state

**M1 complete** — tagged `M1` on `master`. **M2 complete** — tagged `M2` on `master`. **M3 complete** — tagged `M3` on `master`. **M4 complete** — tagged `M4` on `master`. **M5 complete** — tagged `M5` on `master`. **M6 complete** — JWT auth with httpOnly cookies, per-user vault scoping, change password, admin panel, username support. **M7 complete** — tagged `M7` on `master`. Deployed to Vercel + Railway, dark/light mode, mobile responsive with bottom nav, load-more pagination.

---

## Planned architecture

```
/
├── client/          # React + Vite (TypeScript) frontend
│   └── src/
│       ├── components/    # shadcn/ui + custom React components
│       ├── pages/         # Route-level page components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Shared utilities, API client
│       └── types/         # Shared TypeScript types
├── server/          # Node.js + Express (TypeScript) backend
│   └── src/
│       ├── routes/        # Express route handlers
│       ├── services/      # Business logic (RAWG, Claude API, etc.)
│       ├── db/            # PostgreSQL queries and schema
│       └── types/         # Server-side TypeScript types
└── VAULTPLAY_PROJECT_PLAN.md
```

Frontend runs on Vite dev server (default port 5173). Backend runs on Express (default port 3000). Both must be started separately in development. CORS must be configured on Express to allow requests from the Vite origin.

Database is PostgreSQL hosted on Neon (serverless). All DB credentials are in `.env` — never committed.

**DB driver:** Use `pg` (`Pool`) for all database access — not `@neondatabase/serverless`. The serverless driver uses HTTP fetch and is designed for edge runtimes; `pg` uses TCP and is correct for this persistent Express server. Both are installed; only `pg` should be used.

---

## Development commands

```bash
# Frontend
cd client && npm run dev        # Start Vite dev server
cd client && npm run build      # Production build
cd client && npm run lint       # ESLint
cd client && npm run typecheck  # tsc --noEmit

# Backend
cd server && npm run dev        # Start Express with ts-node-dev / nodemon
cd server && npm run build      # tsc compile
cd server && npm run lint       # ESLint

# Run a single test (once test runner is configured)
cd client && npx vitest run src/path/to/file.test.ts
cd server && npx jest src/path/to/file.test.ts
```

---

## Code standards

- **TypeScript everywhere** — no `any` without a comment explaining why.
- **ESLint + Prettier** configured from M1. No code is merged without passing lint.
- No unvalidated writes to the database.
- All secrets (DB URL, RAWG API key, Anthropic API key) live in `.env` / `.env.local`. Use `.env.example` to document required keys.

---

## Git workflow

- **Remote is configured** at `git@github-personal:hassanyawar/vaultplay.git`. Push with `git push origin master --tags` to sync tags.
- **Always create a feature branch before doing any work** — this applies to every feature, bug fix, polish task, or any other change, no matter how small. Never commit directly to `develop` or `master`.
  - Branch naming: `feature/<short-description>` (e.g. `feature/express-boilerplate`, `feature/db-schema`)
- Merge feature branches into `develop` via `--no-ff` merge commits.
- `master` receives merges from `develop` at milestone boundaries only.
- **No force-pushes to `master`.**
- Milestone boundaries are tagged on `master`.

---

## Milestones

| Milestone | Focus | Exit criterion |
|---|---|---|
| M1 — Foundation | Setup & architecture | App loads in browser, API returns test response, DB connects |
| M2 — Game Catalog | RAWG integration | Search a game, see cover art + platforms, save to DB |
| M3 — Vault Manager | CRUD & filtering | Full CRUD on game list; filter by status, platform, rating |
| M4 — Discovery Engine | AI features | Ask AI "what should I play next?" and get a meaningful answer |
| M5 — Dashboard & Stats | Charts & stats | Dashboard shows real vault data visually |
| M6 — Auth & Multi-User | Accounts & per-user vaults | Two separate accounts each see only their own vault ✅ |
| M7 — Polish & Deploy | Ship it | VAULTPLAY is live at a public URL |

A milestone is complete only when its exit criterion is demonstrably satisfied. Do not advance until it is.

---

## AI vs human responsibility

| Area | Owner |
|---|---|
| Code scaffolding, boilerplate, config | AI |
| RAWG API integration & TypeScript types | AI |
| CRUD routes, filter/sort logic | AI |
| Claude API features (recommendations, NLP search, tagging) | AI |
| Chart components & SQL aggregations | AI |
| Security audit & deployment configs | AI |
| Game status, reviews, ratings | Human |
| UI/UX decisions & design taste | Human |
| Privacy & data decisions | Human |
| Vault curation | Human |

---

## Available Claude Code skills

- `.claude/skills/git-commit/` — generates conventional commit messages from staged changes
- `.claude/skills/pr-reviewer/` — names, describes, and validates pull requests
