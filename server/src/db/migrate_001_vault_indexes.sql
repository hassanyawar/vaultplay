-- Migration 001: add user_id indexes and unique constraint to vault_entries
-- Run this once against the production DB (Neon) to apply BUG-02 and BUG-03.

-- Prevent duplicate (game, user) pairs at the DB level
CREATE UNIQUE INDEX IF NOT EXISTS uq_vault_game_user
  ON vault_entries(game_id, user_id);

-- Index for per-user queries (every vault/stats/discover query filters on user_id)
CREATE INDEX IF NOT EXISTS idx_vault_entries_user_id
  ON vault_entries(user_id);

-- Composite index for the most common filter: user + status
CREATE INDEX IF NOT EXISTS idx_vault_entries_user_status
  ON vault_entries(user_id, status);
