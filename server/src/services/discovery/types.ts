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

export interface DiscoverySummary {
  nextToPlay: Recommendation[];
  stalled: StalledGame[];
  genreAffinity: GenreAffinity[];
}
