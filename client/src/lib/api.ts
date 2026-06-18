import type {
  AuthUser,
  AdminUser,
  AdminVaultEntry,
  GameSearchResult,
  SavedGame,
  VaultEntry,
  VaultUpdatePayload,
  Recommendation,
  StalledGame,
  GenreAffinity,
  StatsSummary,
  CurrentlyPlayingGame,
  RecentlyAddedGame,
  CompletionByMonth,
  GenreBreakdown,
} from '@/types/game';

function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, { ...options, credentials: 'include' });
}

// Auth

export async function register(email: string, username: string, password: string): Promise<AuthUser> {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Registration failed');
  }
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Login failed');
  }
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function logout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await apiFetch('/api/auth/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to change password');
  }
}

export async function getMe(): Promise<AuthUser | null> {
  const res = await apiFetch('/api/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

// Admin

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await apiFetch('/api/admin/users');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load users');
  }
  const data = (await res.json()) as { users: AdminUser[] };
  return data.users;
}

export async function getAdminUserVault(userId: number): Promise<AdminVaultEntry[]> {
  const res = await apiFetch(`/api/admin/users/${userId}/vault`);
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load vault');
  }
  const data = (await res.json()) as { entries: AdminVaultEntry[] };
  return data.entries;
}

export async function deleteAdminUser(userId: number): Promise<void> {
  const res = await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to delete user');
  }
}

// Games

export async function getPopularGames(): Promise<{ results: GameSearchResult[] }> {
  const res = await apiFetch('/api/games/popular');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load popular games');
  }
  return res.json() as Promise<{ results: GameSearchResult[] }>;
}

export async function searchGames(
  query: string,
  page = 1
): Promise<{ results: GameSearchResult[]; hasMore: boolean }> {
  const res = await apiFetch(`/api/games/search?q=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Search failed');
  }
  return res.json() as Promise<{ results: GameSearchResult[]; hasMore: boolean }>;
}

export async function saveGame(
  game: GameSearchResult
): Promise<{ game?: SavedGame; alreadyExists?: boolean }> {
  const res = await apiFetch('/api/games', {
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

// Vault

export async function getVaultCounts(): Promise<{ all: number; backlog: number; playing: number; completed: number }> {
  const res = await apiFetch('/api/vault/counts');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load vault counts');
  }
  const data = (await res.json()) as { counts: { all: number; backlog: number; playing: number; completed: number } };
  return data.counts;
}

export async function getVault(params?: {
  status?: string;
  platform?: string;
  rating?: number;
  sort?: string;
  page?: number;
}): Promise<{ entries: VaultEntry[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.platform) qs.set('platform', params.platform);
  if (params?.rating != null) qs.set('rating', String(params.rating));
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.page != null) qs.set('page', String(params.page));

  const url = `/api/vault${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await apiFetch(url);
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load vault');
  }
  return res.json() as Promise<{ entries: VaultEntry[]; total: number }>;
}

export async function updateVaultEntry(id: number, update: VaultUpdatePayload): Promise<VaultEntry> {
  const res = await apiFetch(`/api/vault/${id}`, {
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

export async function getVaultPlatforms(): Promise<string[]> {
  const res = await apiFetch('/api/vault/platforms');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load platforms');
  }
  const data = (await res.json()) as { platforms: string[] };
  return data.platforms;
}

export async function deleteVaultEntry(id: number): Promise<void> {
  const res = await apiFetch(`/api/vault/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to delete entry');
  }
}

// Discover

export async function getNextToPlay(): Promise<Recommendation[]> {
  const res = await apiFetch('/api/discover/next');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load recommendations');
  }
  const data = (await res.json()) as { recommendations: Recommendation[] };
  return data.recommendations;
}

export async function getStalledGames(): Promise<StalledGame[]> {
  const res = await apiFetch('/api/discover/stalled');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load stalled games');
  }
  const data = (await res.json()) as { stalled: StalledGame[] };
  return data.stalled;
}

export async function getGenreAffinity(): Promise<GenreAffinity[]> {
  const res = await apiFetch('/api/discover/genre-affinity');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load genre affinity');
  }
  const data = (await res.json()) as { affinity: GenreAffinity[] };
  return data.affinity;
}

// Stats

export async function getStatsSummary(): Promise<StatsSummary> {
  const res = await apiFetch('/api/stats/summary');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load stats summary');
  }
  const data = (await res.json()) as { summary: StatsSummary };
  return data.summary;
}

export async function getCurrentlyPlaying(): Promise<CurrentlyPlayingGame[]> {
  const res = await apiFetch('/api/stats/currently-playing');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load currently playing');
  }
  const data = (await res.json()) as { games: CurrentlyPlayingGame[] };
  return data.games;
}

export async function getRecentlyAdded(): Promise<RecentlyAddedGame[]> {
  const res = await apiFetch('/api/stats/recently-added');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load recently added');
  }
  const data = (await res.json()) as { games: RecentlyAddedGame[] };
  return data.games;
}

export async function getCompletionsByMonth(): Promise<CompletionByMonth[]> {
  const res = await apiFetch('/api/stats/completions-by-month');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load completions by month');
  }
  const data = (await res.json()) as { completions: CompletionByMonth[] };
  return data.completions;
}

export async function getGenreBreakdown(): Promise<GenreBreakdown[]> {
  const res = await apiFetch('/api/stats/genre-breakdown');
  if (!res.ok) {
    const { error } = (await res.json()) as { error: string };
    throw new Error(error ?? 'Failed to load genre breakdown');
  }
  const data = (await res.json()) as { breakdown: GenreBreakdown[] };
  return data.breakdown;
}
