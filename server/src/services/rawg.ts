import type { RawgSearchResponse, GameSearchResult } from '../types/rawg';

const RAWG_BASE_URL = 'https://api.rawg.io/api';

function getApiKey(): string {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error('RAWG_API_KEY is not set');
  return key;
}

function toReleaseYear(released: string | null): number | null {
  if (!released) return null;
  const year = new Date(released).getFullYear();
  return isNaN(year) ? null : year;
}

function transformGame(game: RawgSearchResponse['results'][number]): GameSearchResult {
  return {
    rawgId: game.id,
    title: game.name,
    coverUrl: game.background_image,
    platforms: (game.platforms ?? []).map((p) => p.platform.name),
    genres: game.genres.map((g) => g.name),
    releaseYear: toReleaseYear(game.released),
  };
}

export async function getPopularGames(
  pageSize = 20
): Promise<{ results: GameSearchResult[] }> {
  const params = new URLSearchParams({
    key: getApiKey(),
    ordering: '-rating',
    page_size: String(pageSize),
    // PC=4, PS5=187, Xbox Series X/S=186, Nintendo Switch=7
    platforms: '4,187,186,7',
  });
  const res = await fetch(`${RAWG_BASE_URL}/games?${params}`);
  if (!res.ok) throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as RawgSearchResponse;
  return { results: data.results.map(transformGame) };
}

export async function searchGames(
  query: string,
  page = 1,
  pageSize = 20
): Promise<{ results: GameSearchResult[]; hasMore: boolean }> {
  const params = new URLSearchParams({
    key: getApiKey(),
    search: query,
    page_size: String(pageSize),
    page: String(page),
  });

  const res = await fetch(`${RAWG_BASE_URL}/games?${params}`);

  if (!res.ok) {
    throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as RawgSearchResponse;
  return {
    results: data.results.map(transformGame),
    hasMore: data.next !== null,
  };
}
