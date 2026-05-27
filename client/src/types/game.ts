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
