import type { GameSearchResult, SavedGame } from '@/types/game';

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Search failed');
  }
  const data = (await res.json()) as { results: GameSearchResult[] };
  return data.results;
}

export async function saveGame(
  game: GameSearchResult
): Promise<{ game?: SavedGame; alreadyExists?: boolean }> {
  const res = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to save game');
  }
  return res.json() as Promise<{ game?: SavedGame; alreadyExists?: boolean }>;
}
