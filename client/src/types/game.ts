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
  rawg_id: number;
  title: string;
  cover_url: string | null;
  platforms: string[];
  genres: string[];
  release_year: number | null;
  created_at: string;
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
