CREATE TYPE vault_status AS ENUM ('backlog', 'playing', 'completed');

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id          SERIAL PRIMARY KEY,
  rawg_id     INTEGER NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  cover_url   TEXT,
  platforms   TEXT[],
  genres      TEXT[],
  release_year SMALLINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault_entries (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id      INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status       vault_status NOT NULL DEFAULT 'backlog',
  rating       SMALLINT CHECK (rating >= 1 AND rating <= 10),
  notes        TEXT,
  review       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vault_entries_status  ON vault_entries(status);
CREATE INDEX IF NOT EXISTS idx_vault_entries_rating  ON vault_entries(rating);
CREATE INDEX IF NOT EXISTS idx_vault_entries_game_id ON vault_entries(game_id);
