export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  created_at: string;
  vault_count: number;
}

export interface AdminVaultEntry {
  id: number;
  status: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  title: string;
  cover_url: string | null;
  platforms: string[];
}

export interface GameSearchResult {
  rawgId: number;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  releaseYear: number | null;
}

export interface SavedGame {
  id: number;
  rawgId: number;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  releaseYear: number | null;
  createdAt: string;
}

export type VaultStatus = 'backlog' | 'playing' | 'completed';

export interface VaultEntry {
  id: number;
  status: VaultStatus;
  rating: number | null;
  notes: string | null;
  review: string | null;
  created_at: string;
  updated_at: string;
  game_id: number;
  rawg_id: number;
  title: string;
  cover_url: string | null;
  platforms: string[];
  genres: string[];
  release_year: number | null;
}

export interface VaultUpdatePayload {
  status?: VaultStatus;
  rating?: number | null;
  notes?: string | null;
  review?: string | null;
}

export interface Recommendation {
  gameId: number;
  rawgId: number;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  releaseYear: number | null;
  reason: string;
  score: number;
}

export interface StalledGame {
  vaultEntryId: number;
  gameId: number;
  title: string;
  coverUrl: string | null;
  daysSinceUpdate: number;
}

export interface GenreAffinity {
  genre: string;
  averageRating: number;
  totalRated: number;
  totalInVault: number;
}

export interface StatsSummary {
  total: number;
  backlog: number;
  playing: number;
  completed: number;
  averageRating: number | null;
  lastActivityAt: string | null;
}

export interface CurrentlyPlayingGame {
  vaultEntryId: number;
  gameId: number;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  daysSincePlaying: number;
}

export interface RecentlyAddedGame {
  vaultEntryId: number;
  gameId: number;
  title: string;
  coverUrl: string | null;
  addedAt: string;
}

export interface CompletionByMonth {
  year: number;
  month: number;
  count: number;
}

export interface GenreBreakdown {
  genre: string;
  count: number;
}
