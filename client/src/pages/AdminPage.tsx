import { useEffect, useState } from 'react';
import { getAdminUsers, getAdminUserVault, deleteAdminUser } from '@/lib/api';
import type { AdminUser, AdminVaultEntry } from '@/types/game';

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [vault, setVault] = useState<AdminVaultEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingVault, setLoadingVault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingUsers(false));
  }, []);

  async function handleSelectUser(user: AdminUser) {
    setSelectedUser(user);
    setVault([]);
    setLoadingVault(true);
    try {
      const entries = await getAdminUserVault(user.id);
      setVault(entries);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingVault(false);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    if (!confirm(`Delete user ${user.email} and all their data? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        setVault([]);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Admin</h1>

      {error && (
        <p className="text-xs text-destructive mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User list */}
        <div className="md:col-span-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Users ({users.length})
          </h2>
          {loadingUsers ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'border-foreground bg-card'
                      : 'border-border bg-card hover:border-foreground/40'
                  }`}
                  onClick={() => void handleSelectUser(user)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.username}
                        {user.is_admin && (
                          <span className="ml-2 text-xs text-amber-500 font-medium">admin</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.vault_count} game{user.vault_count === '1' ? '' : 's'}</p>
                    </div>
                    {!user.is_admin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); void handleDeleteUser(user); }}
                        className="text-xs text-destructive hover:opacity-70 transition-opacity shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vault viewer */}
        <div className="md:col-span-2">
          {!selectedUser ? (
            <div className="rounded-lg border border-dashed border-border flex items-center justify-center h-48">
              <p className="text-sm text-muted-foreground">Select a user to view their vault</p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {selectedUser.username}'s vault
              </h2>
              {loadingVault ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : vault.length === 0 ? (
                <p className="text-sm text-muted-foreground">No games in vault.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {vault.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-4"
                    >
                      {entry.cover_url && (
                        <img
                          src={entry.cover_url}
                          alt={entry.title}
                          className="w-10 h-12 object-cover rounded shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.status}
                          {entry.rating != null && ` · ${entry.rating}/10`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
