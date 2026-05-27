import type { GameSearchResult, SavedGame, VaultEntry, VaultUpdatePayload } from '@/types/game';

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

export async function getVault(params?: {
  status?: string;
  platform?: string;
  rating?: number;
  sort?: string;
}): Promise<VaultEntry[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.platform) qs.set('platform', params.platform);
  if (params?.rating != null) qs.set('rating', String(params.rating));
  if (params?.sort) qs.set('sort', params.sort);

  const url = `/api/vault${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load vault');
  }
  const data = (await res.json()) as { entries: VaultEntry[] };
  return data.entries;
}

export async function updateVaultEntry(
  id: number,
  update: VaultUpdatePayload
): Promise<VaultEntry> {
  const res = await fetch(`/api/vault/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to update entry');
  }
  const data = (await res.json()) as { entry: VaultEntry };
  return data.entry;
}

export async function deleteVaultEntry(id: number): Promise<void> {
  const res = await fetch(`/api/vault/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to delete entry');
  }
}
