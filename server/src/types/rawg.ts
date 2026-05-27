export interface RawgPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGame {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  platforms: RawgPlatform[] | null;
  genres: RawgGenre[];
}

export interface RawgSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

export interface GameSearchResult {
  rawgId: number;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  releaseYear: number | null;
}
